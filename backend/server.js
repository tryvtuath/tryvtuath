/**
 * ============================================================================
 * BACK-END DE VALIDAÇÃO E WEBHOOK INFINITEPAY (BR) & PAYPAL (INTERNACIONAL) — TRYV TUATH®
 * ============================================================================
 * Endpoints:
 *  - POST /api/pagamento/iniciar      -> Registra pedido pendente antes do checkout
 *  - POST /api/webhook/infinitepay    -> Recebe confirmação automática da InfinitePay (PIX/Cartão)
 *  - GET  /api/pagamento/status       -> Endpoint consultado via polling pelo Front-End
 *  - POST /api/pagamento/validar-token -> Valida assinatura HMAC do token na anamnese
 *  - GET  /api/paypal/config          -> Retorna parâmetros de formação de preço em USD, cotação e Client ID público
 *  - POST /api/paypal/create-order    -> Cria ordem PayPal Checkout (Orders v2) em USD no servidor
 *  - POST /api/paypal/capture-order   -> Captura e valida ordem aprovada no servidor PayPal antes de liberar acesso
 *  - POST /api/webhook/paypal         -> Recebe e verifica webhook de captura do PayPal no servidor
 * ============================================================================
 */
"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

// Carrega variáveis de ambiente de backend/.env ou .env na raiz (sem dependências externas)
function carregarDotEnv() {
  const caminhos = [path.join(__dirname, ".env"), path.join(__dirname, "..", ".env")];
  for (const arq of caminhos) {
    try {
      if (!fs.existsSync(arq)) continue;
      const linhas = fs.readFileSync(arq, "utf8").split(/\r?\n/);
      for (const linha of linhas) {
        const l = linha.trim();
        if (!l || l.startsWith("#")) continue;
        const idx = l.indexOf("=");
        if (idx <= 0) continue;
        const chave = l.slice(0, idx).trim();
        const valor = l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        if (!(chave in process.env)) {
          process.env[chave] = valor;
        }
      }
    } catch {}
  }
}
carregarDotEnv();

const PORT = process.env.PORT || 3001;
const SITE_PUBLIC_URL = (process.env.SITE_PUBLIC_URL || "https://www.tryvtuath.com.br").replace(/\/+$/, "");
const WEBHOOK_SECRET = process.env.INFINITEPAY_WEBHOOK_SECRET || "tryv-tuath-secret-key-2026";
const INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE || "tryvtuath";
const DB_FILE = process.env.DB_PAGAMENTOS_FILE || path.join(__dirname, "db-pagamentos.json");
const CONTEUDO_FILE = path.join(__dirname, "..", "conteudo.json");

/* --------------------------------------------------------------------------
 * Configuração e Formação de Preço Internacional PayPal (USD)
 * --------------------------------------------------------------------------
 * Tarifas publicadas pelo PayPal Brasil para recebimentos comerciais internacionais:
 * - 4,79% de tarifa comercial
 * - 1,61% adicional internacional (Total percentual = 6,40% -> fator 0,936)
 * - US$ 0,30 de tarifa fixa por transação em USD
 * - 3,50% de adicional na conversão cambial (-> fator 0,965)
 * Fórmula de referência:
 * Preço USD = (valor líquido desejado em BRL / (cotação BRL/USD × 0,965) + 0,30) / 0,936
 * -------------------------------------------------------------------------- */
const PAYPAL_DEFAULTS = {
  merchantName: "54.492.316 Tryv Tuath",
  merchantEmail: "tryvtuathterapias@gmail.com",
  precoStandardUsd: 7.78,
  precoProfundaUsd: 19.86,
  liquidoDesejadoStandardBrl: 37.00,
  liquidoDesejadoProfundaBrl: 97.00,
  liquidoAncoraStandardBrl: 97.00,
  liquidoAncoraProfundaBrl: 247.00,
  tarifaComercialPct: 4.79,
  adicionalInternacionalPct: 1.61,
  tarifaFixaUsd: 0.30,
  spreadConversaoCambialPct: 3.50,
  margemSegurancaPct: 3.00,
  cotacaoFallbackBrlUsd: 5.6666
};

function lerConfigPayPalConteudoJson() {
  try {
    if (fs.existsSync(CONTEUDO_FILE)) {
      const json = JSON.parse(fs.readFileSync(CONTEUDO_FILE, "utf8"));
      if (json && json.desbloqueio && json.desbloqueio.paypal) {
        return json.desbloqueio.paypal;
      }
    }
  } catch {}
  return {};
}

function getPayPalCredenciais() {
  const cfgJson = lerConfigPayPalConteudoJson();
  const ambienteRaw = String(process.env.PAYPAL_ENV || cfgJson.ambiente || "live").trim().toLowerCase();
  const ambiente = ambienteRaw === "sandbox" ? "sandbox" : "live";
  const merchantName = String(process.env.PAYPAL_MERCHANT_NAME || cfgJson.merchantName || PAYPAL_DEFAULTS.merchantName).trim();
  const merchantEmail = normalizarEmail(process.env.PAYPAL_MERCHANT_EMAIL || cfgJson.merchantEmail || PAYPAL_DEFAULTS.merchantEmail);
  const clientId = String(
    (ambiente === "live" ? process.env.PAYPAL_CLIENT_ID_LIVE : process.env.PAYPAL_CLIENT_ID_SANDBOX) ||
    process.env.PAYPAL_CLIENT_ID ||
    cfgJson.clientId ||
    ""
  ).trim();
  const clientSecret = String(
    (ambiente === "live" ? process.env.PAYPAL_CLIENT_SECRET_LIVE : process.env.PAYPAL_CLIENT_SECRET_SANDBOX) ||
    process.env.PAYPAL_CLIENT_SECRET ||
    ""
  ).trim();
  const apiBase = ambiente === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  return {
    ambiente,
    merchantName,
    merchantEmail,
    clientId,
    clientSecret,
    configurado: Boolean(clientId && clientSecret),
    configuradoLive: Boolean(ambiente === "live" && clientId && clientSecret),
    apiBase
  };
}

let cacheCotacao = {
  valor: null,
  fonte: null,
  atualizadoEm: null,
  expiraEm: 0
};

function requisicaoHttpsJson(urlStr, opcoes = {}) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(
        u,
        {
          method: opcoes.method || "GET",
          headers: opcoes.headers || { "Accept": "application/json", "User-Agent": "TryvTuath-Backend/1.0" },
          timeout: opcoes.timeout || 5000
        },
        (res) => {
          let raw = "";
          res.on("data", (chunk) => { raw += chunk; });
          res.on("end", () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(raw) });
            } catch {
              resolve({ status: res.statusCode, data: null, raw });
            }
          });
        }
      );
      req.on("error", () => resolve({ status: 0, data: null }));
      req.on("timeout", () => { req.destroy(); resolve({ status: 0, data: null }); });
      if (opcoes.body) req.write(opcoes.body);
      req.end();
    } catch {
      resolve({ status: 0, data: null });
    }
  });
}

async function obterCotacaoBrlUsdAtualizada() {
  const cfgJson = lerConfigPayPalConteudoJson();

  // 1. Se houver cotação explícita configurada via variável de ambiente PAYPAL_COTACAO_BRL_USD
  const envCotacao = Number(process.env.PAYPAL_COTACAO_BRL_USD);
  if (Number.isFinite(envCotacao) && envCotacao > 1) {
    return {
      cotacaoBrlUsd: Number(envCotacao.toFixed(4)),
      fonteCotacao: "Configuração explícita do servidor (PAYPAL_COTACAO_BRL_USD)",
      dataReferencia: new Date().toISOString()
    };
  }

  // 2. Se no conteudo.json o modo manual estiver fixado (atualizarCotacaoAutomaticamente === false)
  const jsonCotacaoManual = Number(cfgJson.cotacaoBrlUsd);
  if (cfgJson.atualizarCotacaoAutomaticamente === false && Number.isFinite(jsonCotacaoManual) && jsonCotacaoManual > 1) {
    return {
      cotacaoBrlUsd: Number(jsonCotacaoManual.toFixed(4)),
      fonteCotacao: cfgJson.fonteCotacaoReferencia || "Cotação manual configurada em conteudo.json",
      dataReferencia: cfgJson.dataCotacaoReferencia || new Date().toISOString()
    };
  }

  // 3. Cache em memória (15 minutos) da cotação comercial ao vivo
  const agora = Date.now();
  if (cacheCotacao.valor && agora < cacheCotacao.expiraEm) {
    return {
      cotacaoBrlUsd: cacheCotacao.valor,
      fonteCotacao: cacheCotacao.fonte,
      dataReferencia: cacheCotacao.atualizadoEm
    };
  }

  // 4. Consulta API pública primária (AwesomeAPI USD-BRL comercial)
  const respAwesome = await requisicaoHttpsJson("https://economia.awesomeapi.com.br/json/last/USD-BRL", { timeout: 3500 });
  if (respAwesome.status === 200 && respAwesome.data && respAwesome.data.USDBRL) {
    const bid = Number(respAwesome.data.USDBRL.bid);
    if (Number.isFinite(bid) && bid > 1) {
      cacheCotacao = {
        valor: Number(bid.toFixed(4)),
        fonte: "AwesomeAPI · Câmbio Comercial USD/BRL (tempo real)",
        atualizadoEm: respAwesome.data.USDBRL.create_date || new Date().toISOString(),
        expiraEm: agora + 15 * 60 * 1000
      };
      return {
        cotacaoBrlUsd: cacheCotacao.valor,
        fonteCotacao: cacheCotacao.fonte,
        dataReferencia: cacheCotacao.atualizadoEm
      };
    }
  }

  // 5. Consulta API pública secundária (Open Exchange Rates API USD -> BRL)
  const respEr = await requisicaoHttpsJson("https://open.er-api.com/v6/latest/USD", { timeout: 3500 });
  if (respEr.status === 200 && respEr.data && respEr.data.rates && respEr.data.rates.BRL) {
    const rate = Number(respEr.data.rates.BRL);
    if (Number.isFinite(rate) && rate > 1) {
      cacheCotacao = {
        valor: Number(rate.toFixed(4)),
        fonte: "Open Exchange Rates API · USD/BRL",
        atualizadoEm: respEr.data.time_last_update_utc || new Date().toISOString(),
        expiraEm: agora + 15 * 60 * 1000
      };
      return {
        cotacaoBrlUsd: cacheCotacao.valor,
        fonteCotacao: cacheCotacao.fonte,
        dataReferencia: cacheCotacao.atualizadoEm
      };
    }
  }

  // 6. Contingência identificada (cotação de referência configurada em conteudo.json ou ENV)
  const fallback =
    Number(process.env.PAYPAL_COTACAO_FALLBACK_BRL_USD) ||
    Number(cfgJson.cotacaoReferenciaBrlUsd) ||
    PAYPAL_DEFAULTS.cotacaoFallbackBrlUsd;

  return {
    cotacaoBrlUsd: Number(fallback.toFixed(4)),
    fonteCotacao: cfgJson.fonteCotacaoReferencia || "Cotação de referência configurada (contingência offline)",
    dataReferencia: cfgJson.dataCotacaoReferencia || "2026-11-15"
  };
}

/**
 * Calcula o preço em USD para proteger o valor líquido em BRL considerando as tarifas
 * internacionais do PayPal Brasil + margem de segurança configurável.
 *
 * Fórmula de referência:
 * Preço USD base = (valor líquido desejado em BRL / (cotação BRL/USD × 0,965) + 0,30) / 0,936
 */
function calcularPrecoPayPalUSD(valorLiquidoDesejadoBrl, infoCotacao, opcoesCustom = {}) {
  const cfgJson = lerConfigPayPalConteudoJson();
  const liquidoBrl = Number(valorLiquidoDesejadoBrl);
  const cotacaoBrlUsd = Number(infoCotacao && infoCotacao.cotacaoBrlUsd) || PAYPAL_DEFAULTS.cotacaoFallbackBrlUsd;

  const tarifaComercialPct = Number(opcoesCustom.tarifaComercialPct ?? cfgJson.tarifaComercialPct ?? PAYPAL_DEFAULTS.tarifaComercialPct);
  const adicionalInternacionalPct = Number(opcoesCustom.adicionalInternacionalPct ?? cfgJson.adicionalInternacionalPct ?? PAYPAL_DEFAULTS.adicionalInternacionalPct);
  const tarifaFixaUsd = Number(opcoesCustom.tarifaFixaUsd ?? cfgJson.tarifaFixaUsd ?? PAYPAL_DEFAULTS.tarifaFixaUsd);
  const spreadConversaoCambialPct = Number(opcoesCustom.spreadConversaoCambialPct ?? cfgJson.spreadConversaoCambialPct ?? PAYPAL_DEFAULTS.spreadConversaoCambialPct);
  const margemSegurancaPct = Number(
    opcoesCustom.margemSegurancaPct ??
    process.env.PAYPAL_MARGEM_SEGURANCA_PCT ??
    cfgJson.margemSegurancaPct ??
    PAYPAL_DEFAULTS.margemSegurancaPct
  );

  const fatorConversaoCambial = Number((1 - spreadConversaoCambialPct / 100).toFixed(6)); // 0.965
  const fatorRetencaoTarifas = Number((1 - (tarifaComercialPct + adicionalInternacionalPct) / 100).toFixed(6)); // 0.936

  // Fórmula oficial de referência:
  // Preço USD = (valor líquido desejado em BRL / (cotação BRL/USD × 0,965) + 0,30) / 0,936
  const precoBaseUsd = ((liquidoBrl / (cotacaoBrlUsd * fatorConversaoCambial)) + tarifaFixaUsd) / fatorRetencaoTarifas;

  // Aplicação da margem de segurança para oscilações cambiais / variações operacionais
  const precoComMargemBruto = precoBaseUsd * (1 + Math.max(0, margemSegurancaPct) / 100);
  const precoFinalUsd = Number((Math.ceil(precoComMargemBruto * 100) / 100).toFixed(2));
  const precoBaseUsdArredondado = Number((Math.ceil(precoBaseUsd * 100) / 100).toFixed(2));

  // Estimativa reversa do líquido em BRL sob os parâmetros atuais (não garantido se cotação/tarifas mudarem)
  const usdLiquidoAposTarifas = (precoFinalUsd * fatorRetencaoTarifas) - tarifaFixaUsd;
  const liquidoEstimadoBrl = Number((usdLiquidoAposTarifas * (cotacaoBrlUsd * fatorConversaoCambial)).toFixed(2));

  return {
    moeda: "USD",
    liquidoDesejadoBrl: Number(liquidoBrl.toFixed(2)),
    precoBaseFormulaUsd: Number(precoBaseUsd.toFixed(4)),
    precoBaseUsd: precoBaseUsdArredondado,
    precoFinalUsd,
    precoFinalUsdStr: precoFinalUsd.toFixed(2),
    precoFinalUsdFormatado: precoFinalUsd.toFixed(2),
    liquidoEstimadoBrl,
    parametros: {
      cotacaoBrlUsd,
      fonteCotacao: (infoCotacao && infoCotacao.fonteCotacao) || "Cotação configurada",
      dataReferenciaCotacao: (infoCotacao && infoCotacao.dataReferencia) || new Date().toISOString(),
      tarifaComercialPct,
      adicionalInternacionalPct,
      tarifaPercentualTotalPct: Number((tarifaComercialPct + adicionalInternacionalPct).toFixed(2)),
      fatorRetencaoTarifas,
      tarifaFixaUsd,
      spreadConversaoCambialPct,
      fatorConversaoCambial,
      margemSegurancaPct,
      formulaReferencia: "Preço USD = ((valorLiquidoBRL / (cotacaoBrlUsd × 0.965)) + 0.30) / 0.936",
      avisoEstimativa: "O valor líquido em BRL é uma estimativa calculada com os parâmetros acima e não é garantido caso a cotação de liquidação do PayPal ou as tarifas aplicáveis mudem."
    }
  };
}

async function montarTabelaPrecosPayPal() {
  const cfgJson = lerConfigPayPalConteudoJson();
  const cred = getPayPalCredenciais();
  const infoCotacao = await obterCotacaoBrlUsdAtualizada();
  const calcStandard = calcularPrecoPayPalUSD(
    cfgJson.liquidoDesejadoStandardBrl || PAYPAL_DEFAULTS.liquidoDesejadoStandardBrl,
    infoCotacao
  );
  const calcProfunda = calcularPrecoPayPalUSD(
    cfgJson.liquidoDesejadoProfundaBrl || PAYPAL_DEFAULTS.liquidoDesejadoProfundaBrl,
    infoCotacao
  );
  const calcAncoraStandard = calcularPrecoPayPalUSD(
    cfgJson.liquidoAncoraStandardBrl || PAYPAL_DEFAULTS.liquidoAncoraStandardBrl,
    infoCotacao
  );
  const calcAncoraProfunda = calcularPrecoPayPalUSD(
    cfgJson.liquidoAncoraProfundaBrl || PAYPAL_DEFAULTS.liquidoAncoraProfundaBrl,
    infoCotacao
  );

  // Garante os preços oficiais em USD (Standard: US$ 7.78 | Complete Deep Analysis: US$ 19.86)
  // ou o valor calculado se a cotação exigir valor superior para preservar o líquido
  const precoStdFixado = Number(process.env.PAYPAL_PRECO_STANDARD_USD || cfgJson.precoStandardUsd || PAYPAL_DEFAULTS.precoStandardUsd);
  const precoProfFixado = Number(process.env.PAYPAL_PRECO_PROFUNDA_USD || cfgJson.precoProfundaUsd || PAYPAL_DEFAULTS.precoProfundaUsd);
  const finalStdUsd = Number(Math.max(precoStdFixado, calcStandard.precoFinalUsd).toFixed(2));
  const finalProfUsd = Number(Math.max(precoProfFixado, calcProfunda.precoFinalUsd).toFixed(2));

  return {
    merchantName: cred.merchantName,
    merchantEmail: cred.merchantEmail,
    infoCotacao,
    parametrosFormacaoPreco: calcProfunda.parametros,
    planos: {
      standard: {
        plano: "standard",
        tituloEn: "The Invisible Unlocking — Standard Analysis",
        liquidoDesejadoBrl: calcStandard.liquidoDesejadoBrl,
        precoBaseUsd: calcStandard.precoBaseUsd,
        precoFinalUsd: finalStdUsd,
        precoFinalUsdStr: finalStdUsd.toFixed(2),
        precoAncoraUsd: calcAncoraStandard.precoFinalUsd,
        precoAncoraUsdStr: calcAncoraStandard.precoFinalUsdFormatado,
        liquidoEstimadoBrl: calcStandard.liquidoEstimadoBrl
      },
      profunda: {
        plano: "profunda",
        tituloEn: "The Invisible Unlocking — Complete Deep Analysis",
        liquidoDesejadoBrl: calcProfunda.liquidoDesejadoBrl,
        precoBaseUsd: calcProfunda.precoBaseUsd,
        precoFinalUsd: finalProfUsd,
        precoFinalUsdStr: finalProfUsd.toFixed(2),
        precoAncoraUsd: calcAncoraProfunda.precoFinalUsd,
        precoAncoraUsdStr: calcAncoraProfunda.precoFinalUsdFormatado,
        liquidoEstimadoBrl: calcProfunda.liquidoEstimadoBrl
      }
    }
  };
}

async function obterAccessTokenPayPal() {
  const cred = getPayPalCredenciais();
  if (!cred.clientId || !cred.clientSecret) {
    return null;
  }
  const auth = Buffer.from(`${cred.clientId}:${cred.clientSecret}`).toString("base64");
  const body = "grant_type=client_credentials";
  const resp = await requisicaoHttpsJson(`${cred.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "Content-Length": Buffer.byteLength(body)
    },
    body,
    timeout: 8000
  });
  if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data.access_token) {
    return { token: resp.data.access_token, apiBase: cred.apiBase, ambiente: cred.ambiente };
  }
  return null;
}

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

function gerarTokenAcessoAssinado(email, orderId, plano, idioma = "pt-BR") {
  const langNorm = idioma === "en" ? "en" : "pt-BR";
  const payload = `${normalizarEmail(email)}|${orderId || "INFPAY"}|${plano || "profunda"}|${langNorm}`;
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
    const [email, orderId, plano, idioma] = payload.split("|");
    return { valido: true, email, orderId, plano, idioma: idioma === "en" ? "en" : "pt-BR" };
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
      if (!resultado || !resultado.valido) {
        return responderJson(res, 401, { valido: false, pago: false, erro: "Token de pagamento inválido ou expirado." });
      }

      const db = carregarBanco();
      const registro = db.pedidosPorOrderId[resultado.orderId] || null;
      if (!registro || registro.pago !== true || registro.status !== "PAID" || registro.tokenAcesso !== body.tokenAcesso) {
        return responderJson(res, 401, { valido: false, pago: false, erro: "Pedido não encontrado ou pagamento não confirmado no servidor." });
      }

      if (resultado.idioma === "en" || registro.gateway === "paypal") {
        const cred = getPayPalCredenciais();
        if (!cred.configurado || !registro.paypalCaptureId || registro.moeda !== "USD") {
          return responderJson(res, 401, {
            valido: false,
            pago: false,
            erro: "PayPal checkout is not yet available. Please try again later."
          });
        }
      }

      return responderJson(res, 200, {
        valido: true,
        pago: true,
        ...resultado,
        plano: registro.plano || resultado.plano,
        gateway: registro.gateway || "infinitepay",
        moeda: registro.moeda || "BRL",
        captureId: registro.paypalCaptureId || ""
      });
    } catch {
      return responderJson(res, 400, { valido: false, pago: false });
    }
  }

  // 5. GET /api/paypal/config -> Retorna preços calculados em USD, parâmetros da fórmula e Client ID público
  if (req.method === "GET" && rota === "/api/paypal/config") {
    try {
      const cred = getPayPalCredenciais();
      const tabela = await montarTabelaPrecosPayPal();
      return responderJson(res, 200, {
        ok: true,
        ambiente: cred.ambiente,
        merchantName: cred.merchantName,
        merchantEmail: cred.merchantEmail,
        clientId: cred.configurado ? (cred.clientId || "") : "",
        configurado: cred.configurado,
        configuradoLive: cred.configuradoLive,
        moeda: "USD",
        parametrosFormacaoPreco: tabela.parametrosFormacaoPreco,
        planos: tabela.planos
      });
    } catch {
      return responderJson(res, 500, { ok: false, erro: "Falha ao calcular configuração internacional PayPal." });
    }
  }

  // 6. POST /api/paypal/create-order -> Cria ordem oficial no PayPal (Orders API v2) em USD no servidor
  if (req.method === "POST" && rota === "/api/paypal/create-order") {
    try {
      const body = await lerBodyJson(req);
      const plano = body.plano === "standard" ? "standard" : "profunda";
      const email = normalizarEmail(body.email);
      const internalOrderId = String(body.orderId || `TRYV-PP-${plano.toUpperCase()}-${Date.now()}`).trim();

      const cred = getPayPalCredenciais();
      const tabela = await montarTabelaPrecosPayPal();
      const dadosPlano = tabela.planos[plano];

      if (!cred.configurado) {
        return responderJson(res, 503, {
          ok: false,
          codigo: "PAYPAL_CREDENTIALS_MISSING",
          erro: "PayPal checkout is not yet available. Please try again later.",
          plano,
          valorUsd: dadosPlano.precoFinalUsdStr,
          parametrosFormacaoPreco: tabela.parametrosFormacaoPreco
        });
      }

      const authInfo = await obterAccessTokenPayPal();
      if (!authInfo || !authInfo.token) {
        return responderJson(res, 502, {
          ok: false,
          codigo: "PAYPAL_AUTH_FAILED",
          erro: "PayPal checkout is not yet available. Please try again later."
        });
      }

      const returnUrl = String(body.returnUrl || `${SITE_PUBLIC_URL}/diagnostico.html?plano=${plano}&lang=en&paypal_return=1`);
      const cancelUrl = String(body.cancelUrl || `${SITE_PUBLIC_URL}/desbloqueio.html?lang=en&paypal_cancel=1#planos`);

      const purchaseUnit = {
        reference_id: internalOrderId,
        custom_id: internalOrderId,
        description: dadosPlano.tituloEn,
        amount: {
          currency_code: "USD",
          value: dadosPlano.precoFinalUsdStr
        }
      };
      if (cred.ambiente === "live" && cred.merchantEmail) {
        purchaseUnit.payee = { email_address: cred.merchantEmail };
      }

      const orderPayload = JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [purchaseUnit],
        application_context: {
          brand_name: cred.merchantName || "54.492.316 Tryv Tuath",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl
        }
      });

      const respCreate = await requisicaoHttpsJson(`${authInfo.apiBase}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authInfo.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Content-Length": Buffer.byteLength(orderPayload)
        },
        body: orderPayload,
        timeout: 10000
      });

      if (respCreate.status < 200 || respCreate.status >= 300 || !respCreate.data || !respCreate.data.id) {
        return responderJson(res, 502, {
          ok: false,
          codigo: "PAYPAL_CREATE_ORDER_FAILED",
          erro: "Could not create the PayPal order on the server."
        });
      }

      const paypalOrderId = String(respCreate.data.id);
      const links = Array.isArray(respCreate.data.links) ? respCreate.data.links : [];
      const linkApprove = links.find((l) => l.rel === "approve" || l.rel === "payer-action");
      const approveUrl = linkApprove ? linkApprove.href : "";

      const db = carregarBanco();
      const registro = {
        orderId: internalOrderId,
        paypalOrderId,
        email,
        plano,
        moeda: "USD",
        valorUsd: dadosPlano.precoFinalUsd,
        valorUsdStr: dadosPlano.precoFinalUsdStr,
        liquidoDesejadoBrl: dadosPlano.liquidoDesejadoBrl,
        parametrosFormacaoPreco: tabela.parametrosFormacaoPreco,
        gateway: "paypal",
        status: "PENDING",
        pago: false,
        tokenAcesso: null,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      db.pedidosPorOrderId[internalOrderId] = registro;
      db.pedidosPorOrderId[paypalOrderId] = registro;
      if (email) db.pedidosPorEmail[email] = registro;
      salvarBanco(db);

      return responderJson(res, 200, {
        ok: true,
        orderId: internalOrderId,
        paypalOrderId,
        approveUrl,
        plano,
        moeda: "USD",
        valorUsd: dadosPlano.precoFinalUsdStr,
        parametrosFormacaoPreco: tabela.parametrosFormacaoPreco
      });
    } catch {
      return responderJson(res, 400, { ok: false, erro: "Requisição inválida ao criar ordem PayPal." });
    }
  }

  // 7. POST /api/paypal/capture-order -> Confirma e captura o pagamento no servidor PayPal antes de liberar o produto
  if (req.method === "POST" && rota === "/api/paypal/capture-order") {
    try {
      const body = await lerBodyJson(req);
      const paypalOrderId = String(body.paypalOrderId || body.token || "").trim();
      const orderIdReq = String(body.orderId || "").trim();
      const emailReq = normalizarEmail(body.email);

      if (!paypalOrderId) {
        return responderJson(res, 400, { ok: false, pago: false, erro: "ID da ordem PayPal (paypalOrderId) é obrigatório." });
      }

      const db = carregarBanco();
      const pedidoExistente =
        db.pedidosPorOrderId[paypalOrderId] ||
        (orderIdReq && db.pedidosPorOrderId[orderIdReq]) ||
        null;

      // Se já foi capturado e validado anteriormente no servidor, retorna o token assinado
      if (pedidoExistente && pedidoExistente.pago === true && pedidoExistente.status === "PAID" && pedidoExistente.tokenAcesso) {
        return responderJson(res, 200, {
          ok: true,
          pago: true,
          status: "PAID",
          orderId: pedidoExistente.orderId,
          paypalOrderId: pedidoExistente.paypalOrderId || paypalOrderId,
          captureId: pedidoExistente.paypalCaptureId || "",
          plano: pedidoExistente.plano,
          email: pedidoExistente.email || emailReq,
          moeda: "USD",
          valorUsd: pedidoExistente.valorUsdStr || String(pedidoExistente.valorUsd || ""),
          metodo: "PayPal Internacional (USD)",
          tokenAcesso: pedidoExistente.tokenAcesso
        });
      }

      const cred = getPayPalCredenciais();
      if (!cred.configurado) {
        return responderJson(res, 503, {
          ok: false,
          pago: false,
          codigo: "PAYPAL_CREDENTIALS_MISSING",
          erro: "PayPal checkout is not yet available. Please try again later."
        });
      }

      // Exige que o pedido tenha sido criado previamente pelo servidor (integridade do pedido)
      if (!pedidoExistente || pedidoExistente.gateway !== "paypal") {
        return responderJson(res, 404, {
          ok: false,
          pago: false,
          codigo: "ORDER_NOT_FOUND_ON_SERVER",
          erro: "Order not found on server. A manual Order ID cannot be accepted without an active server order."
        });
      }

      const tabela = await montarTabelaPrecosPayPal();
      const planoEsperado = pedidoExistente.plano === "standard" ? "standard" : "profunda";

      const authInfo = await obterAccessTokenPayPal();
      if (!authInfo || !authInfo.token) {
        return responderJson(res, 502, {
          ok: false,
          pago: false,
          erro: "PayPal checkout is not yet available. Please try again later."
        });
      }

      // Realiza a captura da ordem aprovada diretamente na API oficial do PayPal
      let respCap = await requisicaoHttpsJson(`${authInfo.apiBase}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authInfo.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Content-Length": 2
        },
        body: "{}",
        timeout: 10000
      });

      // Se a ordem já havia sido capturada no PayPal (422 ORDER_ALREADY_CAPTURED), consulta os detalhes diretamente no servidor PayPal
      if (respCap.status === 422 || !respCap.data || !respCap.data.status) {
        respCap = await requisicaoHttpsJson(`${authInfo.apiBase}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authInfo.token}`,
            "Accept": "application/json"
          },
          timeout: 8000
        });
      }

      const dadosOrdem = respCap.data || {};
      const orderIdPayPalRetornado = String(dadosOrdem.id || "");
      const pu = Array.isArray(dadosOrdem.purchase_units) && dadosOrdem.purchase_units[0] ? dadosOrdem.purchase_units[0] : {};
      const captures = pu.payments && Array.isArray(pu.payments.captures) ? pu.payments.captures : [];
      const cap0 = captures[0] || {};

      const captureStatus = String(cap0.status || "").toUpperCase();
      const captureId = String(cap0.id || "").trim();
      const moedaCapturada = String((cap0.amount && cap0.amount.currency_code) || "").toUpperCase();
      const valorCapturadoNum = Number((cap0.amount && cap0.amount.value) || 0);
      const emailPayerPayPal = normalizarEmail(dadosOrdem.payer && dadosOrdem.payer.email_address);
      const customIdRetornado = String(pu.custom_id || pu.reference_id || "").trim();
      const payeeEmailRetornado = normalizarEmail(pu.payee && pu.payee.email_address);

      // Conferência estrita:
      // 1) Status COMPLETED da captura e ID de captura real emitido pelo PayPal
      // 2) Moeda USD
      // 3) Correspondência do ID da ordem e do custom_id/reference_id com o pedido criado no servidor
      // 4) E-mail recebedor (payee) correspondente à conta oficial em ambiente Live
      if (
        captureStatus !== "COMPLETED" ||
        !captureId ||
        moedaCapturada !== "USD" ||
        !(valorCapturadoNum > 0) ||
        orderIdPayPalRetornado !== paypalOrderId ||
        (customIdRetornado && customIdRetornado !== pedidoExistente.orderId) ||
        (cred.ambiente === "live" && payeeEmailRetornado && cred.merchantEmail && payeeEmailRetornado !== cred.merchantEmail)
      ) {
        return responderJson(res, 402, {
          ok: false,
          pago: false,
          status: captureStatus || "NOT_COMPLETED",
          erro: "PayPal payment has not been completed and verified in USD by the server."
        });
      }

      // Verifica rigorosamente se o valor pago em USD corresponde ao preço oficial do plano no servidor
      const precoMinStandard = tabela.planos.standard.precoFinalUsd;
      const precoMinProfunda = tabela.planos.profunda.precoFinalUsd;
      if (valorCapturadoNum + 0.009 < precoMinStandard) {
        return responderJson(res, 402, {
          ok: false,
          pago: false,
          erro: "Valor capturado inferior ao preço oficial em USD do produto."
        });
      }
      const planoConfirmado =
        pedidoExistente && pedidoExistente.plano
          ? pedidoExistente.plano
          : valorCapturadoNum + 0.009 >= precoMinProfunda
          ? "profunda"
          : "standard";

      if (
        (planoEsperado === "profunda" && valorCapturadoNum + 0.009 < precoMinProfunda) ||
        (planoConfirmado === "profunda" && valorCapturadoNum + 0.009 < precoMinProfunda)
      ) {
        return responderJson(res, 402, {
          ok: false,
          pago: false,
          erro: "Valor capturado corresponde ao plano Standard ($7.78 USD) e não à Análise Profunda ($19.86 USD)."
        });
      }

      const orderIdFinal = (pedidoExistente && pedidoExistente.orderId) || customIdRetornado || orderIdReq || `PP-${paypalOrderId}`;
      const emailFinal = emailReq || emailPayerPayPal || (pedidoExistente && pedidoExistente.email) || "paypal@tryvtuath";
      const tokenAcesso = gerarTokenAcessoAssinado(emailFinal, orderIdFinal, planoConfirmado, "en");

      const registroConfirmado = {
        ...(pedidoExistente || {}),
        orderId: orderIdFinal,
        paypalOrderId,
        paypalCaptureId: captureId,
        email: emailFinal,
        plano: planoConfirmado,
        idioma: "en",
        moeda: "USD",
        valorUsd: valorCapturadoNum,
        valorUsdStr: valorCapturadoNum.toFixed(2),
        gateway: "paypal",
        metodo: "PayPal Internacional (USD)",
        transactionNsu: captureId || paypalOrderId,
        status: "PAID",
        pago: true,
        tokenAcesso,
        pagoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      db.pedidosPorOrderId[orderIdFinal] = registroConfirmado;
      db.pedidosPorOrderId[paypalOrderId] = registroConfirmado;
      if (captureId) db.pedidosPorOrderId[captureId] = registroConfirmado;
      if (emailFinal) db.pedidosPorEmail[emailFinal] = registroConfirmado;
      salvarBanco(db);

      return responderJson(res, 200, {
        ok: true,
        pago: true,
        status: "PAID",
        orderId: orderIdFinal,
        paypalOrderId,
        captureId,
        plano: planoConfirmado,
        idioma: "en",
        email: emailFinal,
        moeda: "USD",
        valorUsd: valorCapturadoNum.toFixed(2),
        metodo: "PayPal Internacional (USD)",
        tokenAcesso
      });
    } catch {
      return responderJson(res, 500, { ok: false, pago: false, erro: "Erro interno ao validar captura no PayPal." });
    }
  }

  // 8. POST /api/webhook/paypal -> Recebe notificações de Webhook do PayPal e valida na API oficial antes de liberar
  if (req.method === "POST" && rota === "/api/webhook/paypal") {
    try {
      const payload = await lerBodyJson(req);
      const eventType = String(payload.event_type || "");
      const resource = payload.resource || {};
      const paypalOrderId = String(
        (resource.supplementary_data && resource.supplementary_data.related_ids && resource.supplementary_data.related_ids.order_id) ||
        resource.id ||
        ""
      ).trim();

      if (!paypalOrderId || (!eventType.includes("CAPTURE.COMPLETED") && !eventType.includes("ORDER.APPROVED"))) {
        return responderJson(res, 200, { recebido: true, processado: false });
      }

      const authInfo = await obterAccessTokenPayPal();
      if (!authInfo || !authInfo.token) {
        return responderJson(res, 200, { recebido: true, processado: false, motivo: "Sem credenciais para verificar ordem na API PayPal." });
      }

      // Consulta diretamente a API oficial do PayPal para confirmar a autenticidade da ordem/captura
      const respOrder = await requisicaoHttpsJson(`${authInfo.apiBase}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${authInfo.token}`, "Accept": "application/json" },
        timeout: 8000
      });

      const dadosOrdem = respOrder.data || {};
      const pu = Array.isArray(dadosOrdem.purchase_units) && dadosOrdem.purchase_units[0] ? dadosOrdem.purchase_units[0] : {};
      const cap0 = (pu.payments && Array.isArray(pu.payments.captures) && pu.payments.captures[0]) || {};
      const statusReal = String(cap0.status || dadosOrdem.status || "").toUpperCase();
      const moedaReal = String((cap0.amount && cap0.amount.currency_code) || "").toUpperCase();
      const valorReal = Number((cap0.amount && cap0.amount.value) || 0);

      if (statusReal !== "COMPLETED" || moedaReal !== "USD" || !(valorReal > 0)) {
        return responderJson(res, 200, { recebido: true, processado: false, motivo: "Ordem não consta como COMPLETED em USD na API PayPal." });
      }

      const db = carregarBanco();
      const pedido = db.pedidosPorOrderId[paypalOrderId] || (pu.custom_id && db.pedidosPorOrderId[pu.custom_id]) || null;
      const tabela = await montarTabelaPrecosPayPal();
      const planoIdentificado = pedido
        ? pedido.plano
        : (valorReal >= tabela.planos.profunda.precoBaseUsd * 0.9 ? "profunda" : "standard");
      const orderIdFinal = (pedido && pedido.orderId) || pu.custom_id || `PP-${paypalOrderId}`;
      const emailFinal = normalizarEmail((dadosOrdem.payer && dadosOrdem.payer.email_address) || (pedido && pedido.email) || "paypal@tryvtuath");
      const tokenAcesso = gerarTokenAcessoAssinado(emailFinal, orderIdFinal, planoIdentificado);

      const registroConfirmado = {
        ...(pedido || {}),
        orderId: orderIdFinal,
        paypalOrderId,
        paypalCaptureId: String(cap0.id || ""),
        email: emailFinal,
        plano: planoIdentificado,
        moeda: "USD",
        valorUsd: valorReal,
        valorUsdStr: valorReal.toFixed(2),
        gateway: "paypal",
        metodo: "PayPal Internacional (USD)",
        transactionNsu: String(cap0.id || paypalOrderId),
        status: "PAID",
        pago: true,
        tokenAcesso,
        pagoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      db.pedidosPorOrderId[orderIdFinal] = registroConfirmado;
      db.pedidosPorOrderId[paypalOrderId] = registroConfirmado;
      if (emailFinal) db.pedidosPorEmail[emailFinal] = registroConfirmado;
      salvarBanco(db);

      return responderJson(res, 200, { recebido: true, processado: true, status: "PAID", orderId: orderIdFinal });
    } catch {
      return responderJson(res, 400, { erro: "Erro ao processar webhook do PayPal." });
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
  verificarTokenAcessoAssinado,
  calcularPrecoPayPalUSD,
  montarTabelaPrecosPayPal,
  obterCotacaoBrlUsdAtualizada
};
