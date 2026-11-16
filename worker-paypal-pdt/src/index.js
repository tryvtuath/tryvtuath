/**
 * ============================================================================
 * CLOUDFLARE WORKER — VALIDAÇÃO PAYPAL PDT (PAYMENT LINKS / BUY BUTTONS)
 * ============================================================================
 * - Plano gratuito Cloudflare Workers (US$ 0/mês)
 * - PAYPAL_PDT_TOKEN e TOKEN_HMAC_SECRET ficam somente como Secrets no Cloudflare
 * - Valida:
 *   1) Resposta oficial SUCCESS da PayPal (cmd=_notify-synch)
 *   2) payment_status === "Completed"
 *   3) mc_currency === "USD"
 *   4) mc_gross exato: US$ 7.78 (standard) ou US$ 19.86 (profunda)
 *   5) receiver_email / business === "tryvtuathterapias@gmail.com"
 *   6) Plano correspondente e unicidade da transação (anti-replay em KV)
 * ============================================================================
 */

const PRECO_STANDARD_USD = 7.78;
const PRECO_PROFUNDA_USD = 19.86;
const MERCHANT_EMAIL_PADRAO = "tryvtuathterapias@gmail.com";

const memoriaTxUsadasFallback = new Set();

function obterHeadersCors(request, env) {
  const origin = request.headers.get("Origin") || "";
  const permitidas = String(env.ALLOWED_ORIGINS || "https://www.tryvtuath.com.br,https://tryvtuath.com.br")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowOrigin = permitidas.includes(origin) ? origin : permitidas[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function responderJson(request, env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: obterHeadersCors(request, env)
  });
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function assinarHmac(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 32);
}

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(b64u) {
  const pad = b64u.length % 4 ? "=".repeat(4 - (b64u.length % 4)) : "";
  const bin = atob(b64u.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function gerarTokenAcesso(email, orderId, plano, secret) {
  const payload = `${normalizarEmail(email)}|${orderId}|${plano}|en`;
  const sig = await assinarHmac(payload, secret);
  return `TRYV_${base64UrlEncode(payload)}.${sig}`;
}

async function verificarTokenAcesso(token, secret) {
  try {
    const str = String(token || "");
    if (!str.startsWith("TRYV_") || !str.includes(".")) return null;
    const [b64, sig] = str.slice(5).split(".");
    const payload = base64UrlDecode(b64);
    const esperado = await assinarHmac(payload, secret);
    if (sig !== esperado) return null;
    const [email, orderId, plano, idioma] = payload.split("|");
    return { valido: true, email, orderId, plano, idioma: idioma === "en" ? "en" : "pt-BR" };
  } catch {
    return null;
  }
}

async function verificarTxJaUsada(env, tx) {
  if (env.PAYPAL_TX_KV) {
    const existente = await env.PAYPAL_TX_KV.get(`tx:${tx}`);
    return Boolean(existente);
  }
  return memoriaTxUsadasFallback.has(tx);
}

async function registrarTxComoUsada(env, tx, meta) {
  if (env.PAYPAL_TX_KV) {
    await env.PAYPAL_TX_KV.put(`tx:${tx}`, JSON.stringify(meta));
    return;
  }
  memoriaTxUsadasFallback.add(tx);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: obterHeadersCors(request, env) });
    }

    const url = new URL(request.url);
    const rota = url.pathname;
    const ambiente = String(env.PAYPAL_ENV || "live").toLowerCase() === "sandbox" ? "sandbox" : "live";
    const merchantEmail = normalizarEmail(env.PAYPAL_MERCHANT_EMAIL || MERCHANT_EMAIL_PADRAO);
    const pdtToken = String(env.PAYPAL_PDT_TOKEN || "").trim();
    const hmacSecret = String(env.TOKEN_HMAC_SECRET || pdtToken || "").trim();

    // 1. GET /api/paypal/config
    if (request.method === "GET" && rota === "/api/paypal/config") {
      return responderJson(request, env, 200, {
        ok: true,
        ambiente,
        modo: "pdt_payment_links",
        merchantName: env.PAYPAL_MERCHANT_NAME || "54.492.316 Tryv Tuath",
        merchantEmail,
        configurado: Boolean(pdtToken),
        moeda: "USD",
        parametrosFormacaoPreco: {
          cotacaoBrlUsd: 5.6666,
          fonteCotacao: "AwesomeAPI · Commercial USD/BRL Exchange Rate (1 USD = R$ 5.6666)",
          dataReferenciaCotacao: "2026-11-15",
          tarifaComercialPct: 4.79,
          adicionalInternacionalPct: 1.61,
          tarifaPercentualTotalPct: 6.4,
          fatorRetencaoTarifas: 0.936,
          tarifaFixaUsd: 0.3,
          spreadConversaoCambialPct: 3.5,
          fatorConversaoCambial: 0.965,
          margemSegurancaPct: 3.0
        },
        planos: {
          standard: { plano: "standard", precoFinalUsd: PRECO_STANDARD_USD, precoFinalUsdStr: "7.78", liquidoDesejadoBrl: 37.0 },
          profunda: { plano: "profunda", precoFinalUsd: PRECO_PROFUNDA_USD, precoFinalUsdStr: "19.86", liquidoDesejadoBrl: 97.0 }
        }
      });
    }

    // 2. POST /api/paypal/verify-pdt
    if (request.method === "POST" && rota === "/api/paypal/verify-pdt") {
      if (!pdtToken) {
        return responderJson(request, env, 503, {
          ok: false,
          pago: false,
          codigo: "PAYPAL_PDT_NOT_CONFIGURED",
          erro: "PayPal checkout is not yet available. Please try again later."
        });
      }

      let body = {};
      try {
        body = await request.json();
      } catch {
        return responderJson(request, env, 400, { ok: false, pago: false, erro: "Invalid JSON body." });
      }

      const tx = String(body.tx || "").trim();
      const planoSolicitado = body.plano === "standard" ? "standard" : "profunda";
      if (!tx || !/^[A-Za-z0-9_-]{8,64}$/.test(tx)) {
        return responderJson(request, env, 400, { ok: false, pago: false, erro: "Invalid PayPal transaction ID." });
      }

      // Impede reutilização de transações e liberação duplicada de acessos
      if (await verificarTxJaUsada(env, tx)) {
        return responderJson(request, env, 409, {
          ok: false,
          pago: false,
          codigo: "TRANSACTION_ALREADY_USED",
          erro: "This PayPal transaction has already been used."
        });
      }

      const pdtEndpoint = ambiente === "sandbox"
        ? "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"
        : "https://ipnpb.paypal.com/cgi-bin/webscr";

      const respPdt = await fetch(pdtEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `cmd=_notify-synch&tx=${encodeURIComponent(tx)}&at=${encodeURIComponent(pdtToken)}`
      });

      const rawText = await respPdt.text();
      const linhas = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (!linhas.length || linhas[0] !== "SUCCESS") {
        return responderJson(request, env, 402, {
          ok: false,
          pago: false,
          codigo: "PDT_VERIFICATION_FAILED",
          erro: "We couldn't complete your purchase at this time. No access has been granted."
        });
      }

      const campos = {};
      for (let i = 1; i < linhas.length; i++) {
        const eq = linhas[i].indexOf("=");
        if (eq > 0) {
          const k = decodeURIComponent(linhas[i].slice(0, eq));
          const v = decodeURIComponent(linhas[i].slice(eq + 1).replace(/\+/g, " "));
          campos[k] = v;
        }
      }

      const paymentStatus = String(campos.payment_status || "").toUpperCase();
      const moeda = String(campos.mc_currency || "").toUpperCase();
      const valorPago = Number(campos.mc_gross || 0);
      const receiverEmail = normalizarEmail(campos.receiver_email || campos.business);
      const payerEmail = normalizarEmail(campos.payer_email || body.email || "paypal@tryvtuath");

      const isStandardExato = Math.abs(valorPago - PRECO_STANDARD_USD) < 0.01;
      const isProfundaExato = Math.abs(valorPago - PRECO_PROFUNDA_USD) < 0.01;

      if (
        paymentStatus !== "COMPLETED" ||
        moeda !== "USD" ||
        (!isStandardExato && !isProfundaExato) ||
        receiverEmail !== merchantEmail
      ) {
        return responderJson(request, env, 402, {
          ok: false,
          pago: false,
          codigo: "PAYMENT_VALIDATION_MISMATCH",
          erro: "Payment details did not match an approved USD order for this merchant."
        });
      }

      const planoConfirmado = isProfundaExato ? "profunda" : "standard";
      if (planoSolicitado === "profunda" && planoConfirmado !== "profunda") {
        return responderJson(request, env, 402, {
          ok: false,
          pago: false,
          codigo: "PLAN_MISMATCH",
          erro: "Paid amount corresponds only to Standard Analysis ($7.78 USD)."
        });
      }

      const orderIdFinal = `PP-PDT-${tx}`;
      const tokenAcesso = await gerarTokenAcesso(payerEmail, orderIdFinal, planoConfirmado, hmacSecret);

      await registrarTxComoUsada(env, tx, {
        orderId: orderIdFinal,
        plano: planoConfirmado,
        valorUsd: valorPago.toFixed(2),
        payerEmail,
        verificadoEm: new Date().toISOString()
      });

      return responderJson(request, env, 200, {
        ok: true,
        pago: true,
        status: "PAID",
        orderId: orderIdFinal,
        captureId: tx,
        plano: planoConfirmado,
        idioma: "en",
        email: payerEmail,
        moeda: "USD",
        valorUsd: valorPago.toFixed(2),
        metodo: "PayPal Payment Link (USD)",
        tokenAcesso
      });
    }

    // 3. POST /api/pagamento/validar-token
    if (request.method === "POST" && rota === "/api/pagamento/validar-token") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        return responderJson(request, env, 400, { valido: false, pago: false });
      }
      if (!hmacSecret) {
        return responderJson(request, env, 503, { valido: false, pago: false });
      }
      const res = await verificarTokenAcesso(body.tokenAcesso, hmacSecret);
      if (res && res.valido) {
        return responderJson(request, env, 200, {
          valido: true,
          pago: true,
          ...res,
          gateway: "paypal",
          moeda: "USD",
          captureId: res.orderId
        });
      }
      return responderJson(request, env, 401, { valido: false, pago: false });
    }

    return responderJson(request, env, 404, { ok: false, erro: "Route not found." });
  }
};
