/**
 * ============================================================================
 * BACK-END DE VALIDAÇÃO E WEBHOOK INFINITEPAY — TRYV TUATH®
 * ============================================================================
 * Endpoints:
 *  - POST /api/pagamento/iniciar      -> Registra pedido pendente antes do checkout
 *  - POST /api/webhook/infinitepay    -> Recebe confirmação automática da InfinitePay (PIX/Cartão)
 *  - GET  /api/pagamento/status       -> Endpoint consultado via polling pelo Front-End
 *  - POST /api/pagamento/validar-token -> Valida assinatura HMAC do token na anamnese
 * ============================================================================
 */
"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = process.env.PORT || 3001;
const WEBHOOK_SECRET = process.env.INFINITEPAY_WEBHOOK_SECRET || "tryv-tuath-secret-key-2026";
const INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE || "tryvtuath";
const DB_FILE = path.join(__dirname, "db-pagamentos.json");

/* --------------------------------------------------------------------------
 * Camada de Persistência (Banco de Dados JSON Transacional / Adaptável a SQL)
 * -------------------------------------------------------------------------- */
function carregarBanco() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const inicial = { pedidosPorEmail: {}, pedidosPorOrderId: {}, webhooksRecebidos: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(inicial, null, 2), "utf8");
      return inicial;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return { pedidosPorEmail: {}, pedidosPorOrderId: {}, webhooksRecebidos: [] };
  }
}

function salvarBanco(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function gerarTokenAcessoAssinado(email, orderId, plano) {
  const payload = `${normalizarEmail(email)}|${orderId || "INFPAY"}|${plano || "profunda"}`;
  const assinatura = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32);
  return `TRYV_${Buffer.from(payload).toString("base64url")}.${assinatura}`;
}

function verificarTokenAcessoAssinado(token) {
  try {
    const str = String(token || "");
    if (!str.startsWith("TRYV_") || !str.includes(".")) return null;
    const [parteBase64, assinaturaRecebida] = str.slice(5).split(".");
    const payload = Buffer.from(parteBase64, "base64url").toString("utf8");
    const assinaturaEsperada = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex")
      .slice(0, 32);
    if (assinaturaRecebida !== assinaturaEsperada) return null;
    const [email, orderId, plano] = payload.split("|");
    return { valido: true, email, orderId, plano };
  } catch {
    return null;
  }
}

/**
 * Consulta ativa na API pública oficial da InfinitePay (payment_check)
 * quando o cliente retorna com transaction_nsu e slug.
 */
function consultarApiInfinitePay({ orderNsu, transactionNsu, slug }) {
  return new Promise((resolve) => {
    if (!transactionNsu || !slug) return resolve(null);
    const body = JSON.stringify({
      handle: INFINITEPAY_HANDLE,
      order_nsu: orderNsu || transactionNsu,
      transaction_nsu: transactionNsu,
      slug: slug
    });

    const req = https.request(
      "https://api.checkout.infinitepay.io/payment_check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Content-Length": Buffer.byteLength(body)
        },
        timeout: 6000
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => { raw += chunk; });
        res.on("end", () => {
          try {
            const json = JSON.parse(raw);
            resolve(json);
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(body);
    req.end();
  });
}

function lerBodyJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function responderJson(res, statusCode, objeto) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-InfinitePay-Signature",
    "Cache-Control": "no-store, no-cache, must-revalidate"
  });
  res.end(JSON.stringify(objeto));
}

/* --------------------------------------------------------------------------
 * Servidor HTTP / Rotas da API
 * -------------------------------------------------------------------------- */
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return responderJson(res, 200, { ok: true });
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const rota = parsedUrl.pathname;

  // 1. POST /api/pagamento/iniciar -> Registra intenção de compra antes de abrir a aba da InfinitePay
  if (req.method === "POST" && rota === "/api/pagamento/iniciar") {
    try {
      const body = await lerBodyJson(req);
      const email = normalizarEmail(body.email);
      const orderId = String(body.orderId || `TRYV-${Date.now()}`).trim();
      const plano = body.plano === "standard" ? "standard" : "profunda";
      const valor = plano === "standard" ? 3700 : 9700;

      if (!email) {
        return responderJson(res, 400, { erro: "E-mail do cliente é obrigatório para rastrear o pagamento." });
      }

      const db = carregarBanco();
      const existente = db.pedidosPorEmail[email];
      // Se já estiver pago anteriormente, preserva o status PAID
      const jaPago = existente && existente.status === "PAID";

      const registro = {
        orderId: jaPago ? existente.orderId : orderId,
        email,
        nome: String(body.nome || "").trim(),
        whatsapp: String(body.whatsapp || "").trim(),
        plano,
        valor,
        status: jaPago ? "PAID" : "PENDING",
        pago: Boolean(jaPago),
        tokenAcesso: jaPago ? existente.tokenAcesso : null,
        criadoEm: existente ? existente.criadoEm : new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      db.pedidosPorEmail[email] = registro;
      db.pedidosPorOrderId[registro.orderId] = registro;
      salvarBanco(db);

      return responderJson(res, 200, {
        ok: true,
        orderId: registro.orderId,
        status: registro.status,
        pago: registro.pago
      });
    } catch {
      return responderJson(res, 400, { erro: "Payload inválido." });
    }
  }

  // 2. POST /api/webhook/infinitepay -> Recebe confirmação da InfinitePay (PIX ou Cartão)
  if (req.method === "POST" && rota === "/api/webhook/infinitepay") {
    try {
      const payload = await lerBodyJson(req);

      // Extração compatível com os formatos de Webhook / Checkout da InfinitePay
      const dataObj = payload.data || payload.invoice || payload;
      const customer = dataObj.customer || payload.customer || {};

      const emailCliente = normalizarEmail(
        customer.email ||
        dataObj.customer_email ||
        dataObj.email ||
        ( dataObj.metadata && dataObj.metadata.email ) ||
        ""
      );
      const orderNsu = String(
        dataObj.order_nsu ||
        dataObj.order_id ||
        payload.order_nsu ||
        (dataObj.metadata && dataObj.metadata.order_nsu) ||
        ""
      ).trim();
      const transactionNsu = String(
        dataObj.transaction_nsu ||
        dataObj.transaction_id ||
        dataObj.nsu ||
        payload.transaction_nsu ||
        ""
      ).trim();
      const invoiceSlug = String(dataObj.invoice_slug || dataObj.slug || "").trim();
      const captureMethod = String(dataObj.capture_method || dataObj.payment_method || "pix_ou_cartao");
      const amountCents = Number(dataObj.amount || dataObj.paid_amount || 9700);

      // Verifica se o status do evento confirma pagamento aprovado
      const statusTexto = String(dataObj.status || payload.status || payload.event || "").toLowerCase();
      const foiPago =
        dataObj.paid === true ||
        payload.paid === true ||
        statusTexto === "paid" ||
        statusTexto === "approved" ||
        statusTexto === "completed" ||
        statusTexto === "invoice.paid" ||
        statusTexto === "order.paid";

      if (!foiPago) {
        return responderJson(res, 200, { recebido: true, processado: false, motivo: "Pagamento ainda não consta como aprovado." });
      }

      const db = carregarBanco();

      // Localiza pedido por orderId ou por e-mail
      let pedido = (orderNsu && db.pedidosPorOrderId[orderNsu]) || (emailCliente && db.pedidosPorEmail[emailCliente]) || null;
      const planoIdentificado = pedido
        ? pedido.plano
        : (amountCents > 0 && amountCents <= 5000 ? "standard" : "profunda");

      const emailFinal = emailCliente || (pedido ? pedido.email : "");
      const orderIdFinal = orderNsu || (pedido ? pedido.orderId : `INFPAY-${transactionNsu || Date.now()}`);
      const tokenAcesso = gerarTokenAcessoAssinado(emailFinal || orderIdFinal, orderIdFinal, planoIdentificado);

      const registroConfirmado = {
        ...(pedido || {}),
        orderId: orderIdFinal,
        email: emailFinal,
        plano: planoIdentificado,
        valorPago: amountCents,
        status: "PAID",
        pago: true,
        metodo: captureMethod,
        transactionNsu,
        invoiceSlug,
        tokenAcesso,
        pagoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      if (emailFinal) db.pedidosPorEmail[emailFinal] = registroConfirmado;
      if (orderIdFinal) db.pedidosPorOrderId[orderIdFinal] = registroConfirmado;
      if (transactionNsu) db.pedidosPorOrderId[transactionNsu] = registroConfirmado;

      db.webhooksRecebidos.push({
        recebidoEm: new Date().toISOString(),
        email: emailFinal,
        orderId: orderIdFinal,
        transactionNsu,
        captureMethod,
        amountCents
      });
      if (db.webhooksRecebidos.length > 500) db.webhooksRecebidos.shift();

      salvarBanco(db);

      return responderJson(res, 200, {
        recebido: true,
        processado: true,
        status: "PAID",
        orderId: orderIdFinal,
        email: emailFinal
      });
    } catch {
      return responderJson(res, 400, { erro: "Erro ao processar webhook da InfinitePay." });
    }
  }

  // 3. GET /api/pagamento/status -> Consultado periodicamente (polling) pelo Front-End
  if (req.method === "GET" && rota === "/api/pagamento/status") {
    const email = normalizarEmail(parsedUrl.searchParams.get("email"));
    const orderId = String(parsedUrl.searchParams.get("order_id") || "").trim();
    const transactionNsu = String(parsedUrl.searchParams.get("transaction_nsu") || "").trim();
    const slug = String(parsedUrl.searchParams.get("slug") || "").trim();
    const planoSolicitado = parsedUrl.searchParams.get("plano") === "standard" ? "standard" : "profunda";

    const db = carregarBanco();
    const registro =
      (orderId && db.pedidosPorOrderId[orderId]) ||
      (transactionNsu && db.pedidosPorOrderId[transactionNsu]) ||
      (email && db.pedidosPorEmail[email]) ||
      null;

    if (registro && registro.pago === true && registro.status === "PAID") {
      return responderJson(res, 200, {
        pago: true,
        status: "PAID",
        email: registro.email,
        orderId: registro.orderId,
        plano: registro.plano || planoSolicitado,
        metodo: registro.metodo || "InfinitePay",
        transactionNsu: registro.transactionNsu || "",
        pagoEm: registro.pagoEm,
        tokenAcesso: registro.tokenAcesso || gerarTokenAcessoAssinado(registro.email, registro.orderId, registro.plano)
      });
    }

    // Se o cliente retornou da InfinitePay com transaction_nsu + slug, verifica em tempo real na API da InfinitePay
    if (transactionNsu && slug) {
      const checagemExterna = await consultarApiInfinitePay({
        orderNsu: orderId || transactionNsu,
        transactionNsu,
        slug
      });

      if (checagemExterna && (checagemExterna.paid === true || checagemExterna.success === true)) {
        const orderFinal = orderId || transactionNsu;
        const emailFinal = email || (registro && registro.email) || "cliente@infinitepay";
        const tokenAcesso = gerarTokenAcessoAssinado(emailFinal, orderFinal, planoSolicitado);

        const confirmado = {
          ...(registro || {}),
          orderId: orderFinal,
          email: emailFinal,
          plano: planoSolicitado,
          status: "PAID",
          pago: true,
          metodo: checagemExterna.capture_method || "InfinitePay",
          transactionNsu,
          invoiceSlug: slug,
          tokenAcesso,
          pagoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };

        if (emailFinal) db.pedidosPorEmail[emailFinal] = confirmado;
        db.pedidosPorOrderId[orderFinal] = confirmado;
        salvarBanco(db);

        return responderJson(res, 200, {
          pago: true,
          status: "PAID",
          email: confirmado.email,
          orderId: confirmado.orderId,
          plano: confirmado.plano,
          metodo: confirmado.metodo,
          transactionNsu,
          pagoEm: confirmado.pagoEm,
          tokenAcesso
        });
      }
    }

    return responderJson(res, 200, {
      pago: false,
      status: registro ? registro.status : "WAITING_PAYMENT",
      email,
      orderId
    });
  }

  // 4. POST /api/pagamento/validar-token -> Valida token de acesso ao abrir a página de diagnóstico/anamnese
  if (req.method === "POST" && rota === "/api/pagamento/validar-token") {
    try {
      const body = await lerBodyJson(req);
      const resultado = verificarTokenAcessoAssinado(body.tokenAcesso);
      if (resultado && resultado.valido) {
        return responderJson(res, 200, { valido: true, ...resultado });
      }
      return responderJson(res, 401, { valido: false, erro: "Token de pagamento inválido ou expirado." });
    } catch {
      return responderJson(res, 400, { valido: false });
    }
  }

  return responderJson(res, 404, { erro: "Rota não encontrada." });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Tryv Tuath® Pagamentos] Servidor rodando na porta ${PORT}`);
  });
}

module.exports = {
  server,
  gerarTokenAcessoAssinado,
  verificarTokenAcessoAssinado
};
