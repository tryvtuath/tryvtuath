/**
 * ============================================================================
 * GUARDIÃO DE PAGAMENTO INFINITEPAY & SESSÃO TEMPORÁRIA — TRYV TUATH®
 * ============================================================================
 * 1. Autenticação administrativa unificada (Modo Mestra) via hash criptográfico
 *    SHA-256 com salt (sem exposição de senha em texto puro no código público),
 *    compartilhada entre Portal das Cartas, Desbloqueio Invisível (Standard e
 *    Completo) e Entre Luas, em desktop e celular.
 * 2. Preservação temporária de respostas do questionário em sessionStorage com
 *    expiração automática por inatividade (30 minutos por padrão), sem banco de
 *    dados externo e sem retenção permanente em localStorage.
 * 3. Armazenamento mínimo para compras interrompidas (apenas orderId, plano,
 *    status e expiraEm), respeitando a validação de pagamento da InfinitePay.
 * ============================================================================
 */
(function (global) {
  "use strict";

  const INFINITEPAY_HANDLE = "tryvtuath";

  // Links da Loja InfinitePay e Links de Checkout Integrado com redirect_url automático
  const LINKS_CHECKOUT = {
    profunda: "https://loja.infinitepay.io/tryvtuath/kka1436-mapa-do-desbloqueio---analise-profunda",
    standard: "https://loja.infinitepay.io/tryvtuath/nuw5653-mapa-do-desbloqueio---analise-standard",
    profundaRedirect: "https://checkout.infinitepay.io/tryvtuath?lenc=GxABYIyTXNFt39mcqXJjh5bAEqqnAl8B9bL4GUFs_OIb5G_b2F-HoIKg4Gw2guZv3MYt6LT66clKM8H9RMj9zxDkWiPT9X-L2XZVnMzGHxt7t9hKeiJ6d_WcOPB84slHkOWwu0gR3BHQ-M_fY5-T2pBYJMVDaiC49_OqAqnC-PxXVyOurDBIFVNdk-iKK6QmDoi-yZMTn_ZFiKR08L2Hk-kE-Y6ejF5IJXCwkPFCnTKvEMkE11MYaM1tRRo0LQdK8YUUFFNUTMUTLBIjR_DA8XIV.v1.b640665ebd2e5ba8",
    standardRedirect: "https://checkout.infinitepay.io/tryvtuath?lenc=GwYBYGR0zkyYC111h_FAqDqg0gj08_gbQWz842ezA_aCtqstaAsDC_1BH_i35Onl3cbOC0eqdKvc_wqF0AAN1_8tZttV5kFgZEbJTkafrp4TB54vePqRZB12lyiCOxJa_ynv3ntO8kPBEoBsgobi3s_7RCboGgFyUaBQkAFVQ6DIVc4R28lF__JiK9r0vYejbwN9hyajx1GFEq1hvIhOTkaCZpiuhyQzYZRzSLOo9yGNDBUZyFMsIYaO4pkOigI.v1.cec3425165a726b8"
  };

  let API_BASE_URL = "/api";

  // Prazos de expiração (configuráveis)
  const TTL_INATIVIDADE_RESPOSTAS_MS = 30 * 60 * 1000; // 30 minutos de inatividade para respostas na sessão
  const TTL_PEDIDO_INTERROMPIDO_MS = 2 * 60 * 60 * 1000; // 2 horas para retomada de compra interrompida
  const TTL_TOKEN_PAGAMENTO_MS = 24 * 60 * 60 * 1000; // 24 horas para token de compra confirmada

  const STORAGE_KEYS = {
    SESSAO_PEDIDO: "tryv_pedido_infinitepay",
    TOKEN_VALIDADO: "tryv_token_pagamento_confirmado",
    MODO_MESTRA: "tryv_modo_mestra_ativo",
    MESTRA_TOKEN: "tryv_mestra_assinatura",
    RASCUNHO_RESPOSTAS: "tryv_rascunho_questionario_sessao"
  };

  /**
   * Implementação síncrona de SHA-256 (FIPS 180-4) para validação de credencial
   * administrativa sem expor senha em texto puro no código público e funcionando
   * em qualquer navegador (desktop/celular, HTTP/HTTPS) e ambiente de testes.
   */
  const SHA256_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(n, x) {
    return (x >>> n) | (x << (32 - n));
  }

  function sha256Hex(ascii) {
    const utf8 = unescape(encodeURIComponent(String(ascii || "")));
    const words = [];
    const bitLen = utf8.length * 8;

    for (let i = 0; i < utf8.length; i++) {
      words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    words[utf8.length >> 2] |= 0x80 << (24 - (utf8.length % 4) * 8);
    words[(((utf8.length + 8) >> 6) << 4) + 15] = bitLen;

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Array(64);

    for (let j = 0; j < words.length; j += 16) {
      for (let i = 0; i < 16; i++) w[i] = words[j + i] | 0;
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
        const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;

        h = g; g = f; f = e; e = (d + temp1) | 0;
        d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }

      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }

    return [h0, h1, h2, h3, h4, h5, h6, h7]
      .map(v => (v >>> 0).toString(16).padStart(8, "0"))
      .join("");
  }

  const SALT_MESTRA = "tryv-mestra-guardiao-v2:";
  // Digests SHA-256 das credenciais administrativas existentes (nenhuma senha em texto puro)
  const HASHES_MESTRA_VALIDOS = new Set([
    "def243165afd1050c625576b77c0ac6239975c2478cfc608333a6f515fedfda3",
    "f4eab63a614b6433f2ab620ac824a8ebe68db6649f93fe55ab57c0da7069497c",
    "3dca65b02e78a4a3978ba0ab72807d1918f306bb66e00a5dcd49b3d555dad2f0",
    "43f8b93aaab505fc1f18bba35c8c2cc2ed2b4d0fb0eed3ba071b82514e822254"
  ]);

  function calcularHashMestra(senhaInput) {
    const limpa = String(senhaInput || "").trim().toLowerCase().replace(/\s+/g, "");
    if (!limpa) return "";
    return sha256Hex(SALT_MESTRA + limpa);
  }

  function validarSenhaMestra(senhaInput) {
    const digest = calcularHashMestra(senhaInput);
    return !!digest && HASHES_MESTRA_VALIDOS.has(digest);
  }

  function lerStorageSeguro(storage, chave) {
    try {
      return storage ? storage.getItem(chave) : null;
    } catch {
      return null;
    }
  }

  function gravarStorageSeguro(storage, chave, valor) {
    try {
      if (storage) storage.setItem(chave, valor);
    } catch {}
  }

  function removerStorageSeguro(storage, chave) {
    try {
      if (storage) storage.removeItem(chave);
    } catch {}
  }

  // Remove eventuais dados pessoais legados que antes ficavam em localStorage
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("tryv_lead_previa");
    }
  } catch {}

  function isModoMestra() {
    try {
      const sessAssinatura =
        (typeof sessionStorage !== "undefined" && lerStorageSeguro(sessionStorage, STORAGE_KEYS.MESTRA_TOKEN)) ||
        (typeof localStorage !== "undefined" && lerStorageSeguro(localStorage, STORAGE_KEYS.MESTRA_TOKEN)) ||
        "";
      if (sessAssinatura && HASHES_MESTRA_VALIDOS.has(sessAssinatura)) {
        // Mantém sessionStorage e localStorage sincronizados entre todas as páginas (desktop e mobile)
        if (typeof sessionStorage !== "undefined") {
          gravarStorageSeguro(sessionStorage, STORAGE_KEYS.MESTRA_TOKEN, sessAssinatura);
          gravarStorageSeguro(sessionStorage, STORAGE_KEYS.MODO_MESTRA, "1");
        }
        if (typeof localStorage !== "undefined") {
          gravarStorageSeguro(localStorage, STORAGE_KEYS.MESTRA_TOKEN, sessAssinatura);
          gravarStorageSeguro(localStorage, STORAGE_KEYS.MODO_MESTRA, "1");
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function obterPlanoPreferidoAtual() {
    try {
      if (typeof location !== "undefined" && location.search) {
        const p = new URLSearchParams(location.search).get("plano");
        if (p === "standard" || p === "profunda") return p;
      }
      const salvoSess = typeof sessionStorage !== "undefined" ? lerStorageSeguro(sessionStorage, "tryv_plano_desbloqueio") : null;
      if (salvoSess === "standard" || salvoSess === "profunda") return salvoSess;
      const salvoLoc = typeof localStorage !== "undefined" ? lerStorageSeguro(localStorage, "tryv_plano_desbloqueio") : null;
      if (salvoLoc === "standard" || salvoLoc === "profunda") return salvoLoc;
    } catch {}
    return "profunda";
  }

  function ativarModoMestra(senhaInput) {
    const digest = calcularHashMestra(senhaInput);
    if (!digest || !HASHES_MESTRA_VALIDOS.has(digest)) return false;

    const planoAtual = obterPlanoPreferidoAtual();
    if (typeof sessionStorage !== "undefined") {
      gravarStorageSeguro(sessionStorage, STORAGE_KEYS.MESTRA_TOKEN, digest);
      gravarStorageSeguro(sessionStorage, STORAGE_KEYS.MODO_MESTRA, "1");
      gravarStorageSeguro(sessionStorage, "tryv_plano_desbloqueio", planoAtual);
    }
    if (typeof localStorage !== "undefined") {
      gravarStorageSeguro(localStorage, STORAGE_KEYS.MESTRA_TOKEN, digest);
      gravarStorageSeguro(localStorage, STORAGE_KEYS.MODO_MESTRA, "1");
      gravarStorageSeguro(localStorage, "tryv_plano_desbloqueio", planoAtual);
    }
    if (canalEntreAbas) {
      try {
        canalEntreAbas.postMessage({ tipo: "MESTRA_ATIVADA", digest, plano: planoAtual });
      } catch {}
    }
    return true;
  }

  function desativarModoMestra() {
    if (typeof sessionStorage !== "undefined") {
      removerStorageSeguro(sessionStorage, STORAGE_KEYS.MODO_MESTRA);
      removerStorageSeguro(sessionStorage, STORAGE_KEYS.MESTRA_TOKEN);
    }
    if (typeof localStorage !== "undefined") {
      removerStorageSeguro(localStorage, STORAGE_KEYS.MODO_MESTRA);
      removerStorageSeguro(localStorage, STORAGE_KEYS.MESTRA_TOKEN);
      const raw = lerStorageSeguro(localStorage, STORAGE_KEYS.TOKEN_VALIDADO);
      if (raw && raw.includes("MESTRA_TRYV_ILIMITADO")) {
        removerStorageSeguro(localStorage, STORAGE_KEYS.TOKEN_VALIDADO);
      }
    }
    if (canalEntreAbas) {
      try {
        canalEntreAbas.postMessage({ tipo: "MESTRA_DESATIVADA" });
      } catch {}
    }
  }

  // Permite ativar também via parâmetro na URL se a credencial válida for fornecida
  try {
    if (typeof location !== "undefined" && location.search) {
      const pUrl = new URLSearchParams(location.search);
      const chaveUrl = pUrl.get("mestra") || pUrl.get("tryv");
      if (chaveUrl && validarSenhaMestra(chaveUrl)) {
        ativarModoMestra(chaveUrl);
      }
    }
  } catch {}

  const canalEntreAbas = typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("tryv_pagamento_infinitepay_channel")
    : null;

  function normalizarEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function validarFormatoEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizarEmail(email));
  }

  function gerarOrderId(email, plano) {
    const limpo = normalizarEmail(email).replace(/[^a-z0-9]/g, "").slice(0, 8) || "cli";
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRYV-${(plano === "standard" ? "STD" : "PROF")}-${limpo.toUpperCase()}-${ts}-${rand}`;
  }

  /**
   * ============================================================================
   * ETAPA 2 & 3 — PRESERVAÇÃO TEMPORÁRIA DE RESPOSTAS NA SESSÃO E PRIVACIDADE
   * ============================================================================
   * Guarda as respostas apenas em sessionStorage durante a sessão ativa, com
   * prazo de expiração por inatividade (30 min por padrão). Ao expirar, descarta
   * automaticamente os dados temporários.
   */
  function salvarRascunhoQuestionario(dadosRespostas, ttlMs = TTL_INATIVIDADE_RESPOSTAS_MS, agoraMs = Date.now()) {
    try {
      if (typeof sessionStorage === "undefined" || !dadosRespostas || typeof dadosRespostas !== "object") {
        return null;
      }
      const atualRaw = lerStorageSeguro(sessionStorage, STORAGE_KEYS.RASCUNHO_RESPOSTAS);
      let respostasAnteriores = {};
      if (atualRaw) {
        try {
          const parsed = JSON.parse(atualRaw);
          if (parsed && parsed.respostas && (!parsed.expiraEm || agoraMs <= parsed.expiraEm)) {
            respostasAnteriores = parsed.respostas;
          }
        } catch {}
      }
      const prazo = Number(ttlMs) > 0 ? Number(ttlMs) : TTL_INATIVIDADE_RESPOSTAS_MS;
      const envelope = {
        respostas: { ...respostasAnteriores, ...dadosRespostas },
        atualizadoEm: agoraMs,
        ttlMs: prazo,
        expiraEm: agoraMs + prazo
      };
      gravarStorageSeguro(sessionStorage, STORAGE_KEYS.RASCUNHO_RESPOSTAS, JSON.stringify(envelope));
      if (typeof localStorage !== "undefined") {
        removerStorageSeguro(localStorage, STORAGE_KEYS.RASCUNHO_RESPOSTAS);
        removerStorageSeguro(localStorage, "tryv_lead_previa");
      }
      return envelope;
    } catch {
      return null;
    }
  }

  function lerRascunhoQuestionario(agoraMs = Date.now()) {
    try {
      if (typeof sessionStorage === "undefined") return null;
      const raw = lerStorageSeguro(sessionStorage, STORAGE_KEYS.RASCUNHO_RESPOSTAS);
      if (!raw) return null;
      const envelope = JSON.parse(raw);
      if (!envelope || typeof envelope !== "object" || !envelope.respostas) {
        limparRascunhoQuestionario();
        return null;
      }
      if (envelope.expiraEm && agoraMs > Number(envelope.expiraEm)) {
        limparRascunhoQuestionario();
        return null;
      }
      // Renova a janela deslizante de inatividade a cada leitura ativa na sessão
      const prazo = Number(envelope.ttlMs) > 0 ? Number(envelope.ttlMs) : TTL_INATIVIDADE_RESPOSTAS_MS;
      envelope.atualizadoEm = agoraMs;
      envelope.expiraEm = agoraMs + prazo;
      gravarStorageSeguro(sessionStorage, STORAGE_KEYS.RASCUNHO_RESPOSTAS, JSON.stringify(envelope));
      return envelope.respostas;
    } catch {
      limparRascunhoQuestionario();
      return null;
    }
  }

  function limparRascunhoQuestionario() {
    if (typeof sessionStorage !== "undefined") {
      removerStorageSeguro(sessionStorage, STORAGE_KEYS.RASCUNHO_RESPOSTAS);
    }
    if (typeof localStorage !== "undefined") {
      removerStorageSeguro(localStorage, STORAGE_KEYS.RASCUNHO_RESPOSTAS);
      removerStorageSeguro(localStorage, "tryv_lead_previa");
    }
  }

  /**
   * Compras interrompidas (ETAPA 3): preserva apenas dados mínimos não sensíveis
   * (orderId, plano, status e expiraEm) com expiração definida.
   */
  function lerSessaoPedido(agoraMs = Date.now()) {
    try {
      const raw =
        (typeof sessionStorage !== "undefined" && lerStorageSeguro(sessionStorage, STORAGE_KEYS.SESSAO_PEDIDO)) ||
        (typeof localStorage !== "undefined" && lerStorageSeguro(localStorage, STORAGE_KEYS.SESSAO_PEDIDO));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return null;
      if (obj.expiraEm && agoraMs > Number(obj.expiraEm)) {
        if (typeof sessionStorage !== "undefined") removerStorageSeguro(sessionStorage, STORAGE_KEYS.SESSAO_PEDIDO);
        if (typeof localStorage !== "undefined") removerStorageSeguro(localStorage, STORAGE_KEYS.SESSAO_PEDIDO);
        return null;
      }
      return {
        orderId: obj.orderId || "",
        plano: obj.plano === "standard" ? "standard" : "profunda",
        status: obj.status || "PENDING",
        atualizadoEm: obj.atualizadoEm || "",
        expiraEm: obj.expiraEm || (agoraMs + TTL_PEDIDO_INTERROMPIDO_MS)
      };
    } catch {
      return null;
    }
  }

  function salvarSessaoPedido(dados, ttlMs = TTL_PEDIDO_INTERROMPIDO_MS, agoraMs = Date.now()) {
    try {
      const atual = lerSessaoPedido(agoraMs) || {};
      const planoNormalizado = (dados && dados.plano === "standard")
        ? "standard"
        : ((dados && dados.plano === "profunda") ? "profunda" : (atual.plano || "profunda"));
      const prazo = Number(ttlMs) > 0 ? Number(ttlMs) : TTL_PEDIDO_INTERROMPIDO_MS;
      // Armazena estritamente os metadados mínimos do pedido (sem nome, whatsapp ou respostas)
      const minimo = {
        orderId: (dados && dados.orderId) || atual.orderId || gerarOrderId("cli", planoNormalizado),
        plano: planoNormalizado,
        status: (dados && dados.status) || atual.status || "PENDING",
        atualizadoEm: new Date(agoraMs).toISOString(),
        expiraEm: agoraMs + prazo
      };
      const serializado = JSON.stringify(minimo);
      if (typeof sessionStorage !== "undefined") gravarStorageSeguro(sessionStorage, STORAGE_KEYS.SESSAO_PEDIDO, serializado);
      if (typeof localStorage !== "undefined") gravarStorageSeguro(localStorage, STORAGE_KEYS.SESSAO_PEDIDO, serializado);
      return minimo;
    } catch {
      return dados;
    }
  }

  function lerTokenConfirmado(agoraMs = Date.now()) {
    if (isModoMestra()) {
      const planoSalvo = obterPlanoPreferidoAtual();
      return {
        pago: true,
        modoMestra: true,
        orderId: "MESTRA-TRYV-LIVRE",
        plano: planoSalvo,
        status: "PAID",
        tokenAcesso: "MESTRA_TRYV_ILIMITADO",
        metodo: "Modo Mestra Tryv"
      };
    }
    try {
      const raw =
        (typeof sessionStorage !== "undefined" && lerStorageSeguro(sessionStorage, STORAGE_KEYS.TOKEN_VALIDADO)) ||
        (typeof localStorage !== "undefined" && lerStorageSeguro(localStorage, STORAGE_KEYS.TOKEN_VALIDADO));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.pago || !obj.tokenAcesso) return null;
      if (obj.expiraEm && agoraMs > Number(obj.expiraEm)) {
        if (typeof sessionStorage !== "undefined") removerStorageSeguro(sessionStorage, STORAGE_KEYS.TOKEN_VALIDADO);
        if (typeof localStorage !== "undefined") removerStorageSeguro(localStorage, STORAGE_KEYS.TOKEN_VALIDADO);
        return null;
      }
      return obj;
    } catch {
      return null;
    }
  }

  function salvarTokenConfirmado(dadosConfirmacao, ttlMs = TTL_TOKEN_PAGAMENTO_MS, agoraMs = Date.now()) {
    try {
      const prazo = Number(ttlMs) > 0 ? Number(ttlMs) : TTL_TOKEN_PAGAMENTO_MS;
      const planoConfirmado = dadosConfirmacao.plano === "standard" ? "standard" : "profunda";
      const payload = {
        pago: true,
        orderId: dadosConfirmacao.orderId || "",
        plano: planoConfirmado,
        status: "PAID",
        tokenAcesso: dadosConfirmacao.tokenAcesso,
        transactionNsu: dadosConfirmacao.transactionNsu || "",
        receiptUrl: dadosConfirmacao.receiptUrl || "",
        metodo: dadosConfirmacao.metodo || "InfinitePay",
        confirmadoEm: dadosConfirmacao.confirmadoEm || new Date(agoraMs).toISOString(),
        expiraEm: agoraMs + prazo
      };
      const serializado = JSON.stringify(payload);
      if (typeof sessionStorage !== "undefined") {
        gravarStorageSeguro(sessionStorage, STORAGE_KEYS.TOKEN_VALIDADO, serializado);
        gravarStorageSeguro(sessionStorage, "tryv_plano_desbloqueio", planoConfirmado);
      }
      if (typeof localStorage !== "undefined") {
        gravarStorageSeguro(localStorage, STORAGE_KEYS.TOKEN_VALIDADO, serializado);
        gravarStorageSeguro(localStorage, "tryv_plano_desbloqueio", planoConfirmado);
      }
      salvarSessaoPedido({
        orderId: payload.orderId,
        plano: planoConfirmado,
        status: "PAID"
      }, prazo, agoraMs);
      if (canalEntreAbas) {
        try {
          canalEntreAbas.postMessage({ tipo: "PAGAMENTO_CONFIRMADO", payload });
        } catch {}
      }
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Retorna a URL oficial de checkout da InfinitePay sem corromper links da loja
   * ou links assinados (?lenc=...).
   */
  function construirUrlCheckoutInfinitePay(plano, email, orderId, urlBaseCustom) {
    if (urlBaseCustom && (urlBaseCustom.startsWith("https://loja.infinitepay.io/") || urlBaseCustom.startsWith("https://checkout.infinitepay.io/"))) {
      return urlBaseCustom;
    }
    return plano === "standard" ? LINKS_CHECKOUT.standard : LINKS_CHECKOUT.profunda;
  }

  function obterUrlCheckoutComRedirectAutomatico(plano) {
    return plano === "standard" ? LINKS_CHECKOUT.standardRedirect : LINKS_CHECKOUT.profundaRedirect;
  }

  /**
   * Gera um Link de Checkout Integrado na API oficial da InfinitePay
   * (POST https://api.checkout.infinitepay.io/links) com redirect_url automático para diagnostico.html
   */
  async function gerarLinkCheckoutIntegrado(plano, orderIdCustom) {
    const isStd = plano === "standard";
    const orderNsu = orderIdCustom || gerarOrderId("cli", isStd ? "standard" : "profunda");
    try {
      const resp = await fetch("https://api.checkout.infinitepay.io/links", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          handle: INFINITEPAY_HANDLE,
          redirect_url: `https://tryvtuath.com.br/diagnostico.html?plano=${isStd ? "standard" : "profunda"}`,
          order_nsu: orderNsu,
          items: [
            {
              quantity: 1,
              price: isStd ? 3700 : 9700,
              description: isStd
                ? "O Desbloqueio Invisivel - Analise Standard"
                : "O Desbloqueio Invisivel - Analise Profunda"
            }
          ]
        })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.url) {
          salvarSessaoPedido({ orderId: orderNsu, plano: isStd ? "standard" : "profunda", status: "PENDING" });
          return json.url;
        }
      }
    } catch {}
    return isStd ? LINKS_CHECKOUT.standard : LINKS_CHECKOUT.profunda;
  }

  /**
   * Registra a intenção de pagamento no Back-End para que o Webhook da InfinitePay
   * saiba qual pedido está aguardando confirmação.
   */
  async function registrarIntencaoNoBackend({ email, plano }) {
    const emailLimpo = normalizarEmail(email);
    const atual = lerSessaoPedido();
    const orderId = (atual && atual.orderId)
      ? atual.orderId
      : gerarOrderId(emailLimpo, plano);

    const sessao = salvarSessaoPedido({
      orderId,
      plano: plano === "standard" ? "standard" : "profunda",
      status: "PENDING"
    });

    if (emailLimpo) {
      salvarRascunhoQuestionario({ email: emailLimpo });
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/pagamento/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: sessao.orderId,
          email: emailLimpo,
          plano: sessao.plano,
          valor: sessao.plano === "standard" ? 3700 : 9700,
          status: "PENDING"
        })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.orderId) {
          salvarSessaoPedido({ orderId: json.orderId, plano: sessao.plano, status: json.pago ? "PAID" : "PENDING" });
        }
        if (json && json.pago === true && json.tokenAcesso) {
          salvarTokenConfirmado({
            orderId: json.orderId || orderId,
            plano: sessao.plano,
            tokenAcesso: json.tokenAcesso
          });
        }
      }
    } catch {
      // Hospedagem estática continua monitorando via redirect/storage/comprovante e API
    }

    return { ...sessao, email: emailLimpo };
  }

  /**
   * Extrai dados de confirmação a partir de uma URL de redirecionamento ou comprovante da InfinitePay
   */
  function extrairParametrosComprovanteInfinitePay(inputTextoOuUrl) {
    const str = String(inputTextoOuUrl || "").trim();
    if (!str) return null;

    try {
      if (str.startsWith("http://") || str.startsWith("https://")) {
        const u = new URL(str);
        const host = u.hostname.toLowerCase();
        const transactionNsu =
          u.searchParams.get("transaction_nsu") ||
          u.searchParams.get("transaction_id") ||
          u.searchParams.get("nsu") ||
          "";
        const slug =
          u.searchParams.get("slug") ||
          u.searchParams.get("invoice_slug") ||
          "";
        const orderNsu = u.searchParams.get("order_nsu") || "";
        const receiptUrl = u.searchParams.get("receipt_url") || "";
        const captureMethod = u.searchParams.get("capture_method") || "";

        if (transactionNsu || slug || receiptUrl) {
          return {
            validoFormato: true,
            transactionNsu: transactionNsu || slug || "INFPAY-REDIRECT",
            slug: slug || transactionNsu || "INFPAY-SLUG",
            orderNsu,
            receiptUrl: receiptUrl || str,
            captureMethod: captureMethod || "InfinitePay"
          };
        }

        if (
          host.includes("recibo.infinitepay.io") ||
          (host.includes("infinitepay.io") && !u.pathname.includes("mapa-do-desbloqueio") && u.pathname.length > 4)
        ) {
          const partes = u.pathname.split("/").filter(Boolean);
          const codigoPath = partes[partes.length - 1] || "RECIBO-INFPAY";
          return {
            validoFormato: true,
            transactionNsu: codigoPath,
            slug: codigoPath,
            orderNsu: "",
            receiptUrl: str,
            captureMethod: "Comprovante InfinitePay"
          };
        }
      } else {
        const limpo = str.replace(/^(nsu|id|pedido|codigo|código|transacao|transação|comprovante|pix|doc|aut)[:\s#-]*/i, "").replace(/[\s#.:/-]+/g, "");
        const qtdDigitos = (limpo.match(/\d/g) || []).length;
        if (/^[a-zA-Z0-9_-]{4,90}$/.test(limpo) && qtdDigitos >= 4 && !/^(1234|0000|9999|teste)/i.test(limpo)) {
          return {
            validoFormato: true,
            transactionNsu: limpo.slice(0, 48),
            slug: limpo.slice(0, 48),
            orderNsu: "",
            receiptUrl: "",
            captureMethod: "Comprovante / NSU InfinitePay"
          };
        }
      }
    } catch {}
    return null;
  }

  /**
   * Consulta o status do pagamento no Back-End (/api/pagamento/status),
   * verifica o armazenamento compartilhado entre abas e valida parâmetros de retorno da InfinitePay.
   */
  async function verificarStatusPagamento({ email, orderId, transactionNsu, slug, receiptUrl, plano, comprovanteInput }) {
    const emailLimpo = normalizarEmail(email);

    // 0. Verifica se o Modo Mestra ou token já confirmado está ativo
    const jaConfirmado = lerTokenConfirmado();
    if (jaConfirmado && jaConfirmado.pago) {
      return { pago: true, dados: jaConfirmado };
    }

    // 1. Consulta nosso Back-End (alimentado pelo Webhook da InfinitePay)
    try {
      const qs = new URLSearchParams({
        email: emailLimpo,
        order_id: orderId || "",
        transaction_nsu: transactionNsu || "",
        slug: slug || "",
        plano: plano || "profunda",
        _t: String(Date.now())
      });
      const resp = await fetch(`${API_BASE_URL}/pagamento/status?${qs.toString()}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });

      if (resp.ok) {
        const contentType = resp.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await resp.json();
          if (data && data.pago === true && data.tokenAcesso) {
            const confirmado = salvarTokenConfirmado({
              orderId: data.orderId || orderId,
              plano: data.plano || plano || "profunda",
              tokenAcesso: data.tokenAcesso,
              transactionNsu: data.transactionNsu || transactionNsu,
              metodo: data.metodo || "InfinitePay Webhook",
              confirmadoEm: data.pagoEm || new Date().toISOString()
            });
            return { pago: true, dados: confirmado };
          }
        }
      }
    } catch {
      // Continua para validação de retorno direto / payment_check da InfinitePay
    }

    // 2. Se veio do redirecionamento oficial da InfinitePay com transaction_nsu + slug (ou receipt_url)
    if ((transactionNsu && slug) || receiptUrl) {
      try {
        const respInf = await fetch(
          "https://api.checkout.infinitepay.io/payment_check",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              handle: INFINITEPAY_HANDLE,
              order_nsu: orderId || transactionNsu,
              transaction_nsu: transactionNsu,
              slug: slug
            })
          }
        );
        if (respInf.ok) {
          const jsonInf = await respInf.json();
          if (jsonInf && (jsonInf.paid === true || jsonInf.success === true)) {
            const tokenAssinado = `INFPAY_${transactionNsu}_${slug}`;
            const confirmado = salvarTokenConfirmado({
              orderId: orderId || transactionNsu,
              plano: plano || "profunda",
              tokenAcesso: tokenAssinado,
              transactionNsu: transactionNsu,
              receiptUrl: receiptUrl || "",
              metodo: jsonInf.capture_method || "InfinitePay",
              confirmadoEm: new Date().toISOString()
            });
            return { pago: true, dados: confirmado };
          }
        }
      } catch {
        if (transactionNsu && slug && (receiptUrl || transactionNsu.length >= 6)) {
          const tokenAssinado = `INFPAY_REDIRECT_${transactionNsu}_${slug}`;
          const confirmado = salvarTokenConfirmado({
            orderId: orderId || transactionNsu,
            plano: plano || "profunda",
            tokenAcesso: tokenAssinado,
            transactionNsu,
            receiptUrl: receiptUrl || "",
            metodo: "InfinitePay Redirect",
            confirmadoEm: new Date().toISOString()
          });
          return { pago: true, dados: confirmado };
        }
      }
    }

    // 3. Se o cliente informou o link do recibo ou código NSU da transação InfinitePay
    if (comprovanteInput) {
      const extraido = extrairParametrosComprovanteInfinitePay(comprovanteInput);
      if (extraido && extraido.validoFormato) {
        const tokenAssinado = `INFPAY_RECIBO_${extraido.transactionNsu}`;
        const confirmado = salvarTokenConfirmado({
          orderId: orderId || extraido.orderNsu || extraido.transactionNsu,
          plano: plano || "profunda",
          tokenAcesso: tokenAssinado,
          transactionNsu: extraido.transactionNsu,
          receiptUrl: extraido.receiptUrl,
          metodo: extraido.captureMethod,
          confirmadoEm: new Date().toISOString()
        });
        return { pago: true, dados: confirmado };
      }
    }

    return { pago: false, dados: null };
  }

  /**
   * Controlador de Polling Periódico para o botão inteligente de liberação
   */
  function iniciarPollingConfirmacao({
    email,
    orderId,
    plano,
    getComprovanteInput,
    intervaloMs = 4000,
    aoVerificar,
    aoConfirmar
  }) {
    let ativo = true;
    let tentativas = 0;

    async function ciclo() {
      if (!ativo) return;
      tentativas++;
      if (typeof aoVerificar === "function") {
        aoVerificar(tentativas);
      }

      const tokenSalvo = lerTokenConfirmado();
      if (tokenSalvo && tokenSalvo.pago) {
        ativo = false;
        clearInterval(timerId);
        if (typeof aoConfirmar === "function") aoConfirmar(tokenSalvo);
        return;
      }

      const comprovanteInput = typeof getComprovanteInput === "function" ? getComprovanteInput() : "";
      const resultado = await verificarStatusPagamento({
        email,
        orderId,
        plano,
        comprovanteInput
      });

      if (resultado.pago && resultado.dados) {
        ativo = false;
        clearInterval(timerId);
        if (typeof aoConfirmar === "function") aoConfirmar(resultado.dados);
      }
    }

    const timeoutInicial = setTimeout(ciclo, 1000);
    const timerId = setInterval(ciclo, intervaloMs);

    if (canalEntreAbas) {
      canalEntreAbas.onmessage = (ev) => {
        if (ev && ev.data && ev.data.tipo === "PAGAMENTO_CONFIRMADO" && ev.data.payload) {
          ativo = false;
          clearTimeout(timeoutInicial);
          clearInterval(timerId);
          if (typeof aoConfirmar === "function") aoConfirmar(ev.data.payload);
        }
      };
    }

    function onStorageChange(ev) {
      if ((ev.key === STORAGE_KEYS.TOKEN_VALIDADO || ev.key === STORAGE_KEYS.MESTRA_TOKEN) && ev.newValue) {
        const t = lerTokenConfirmado();
        if (t && t.pago) {
          ativo = false;
          clearTimeout(timeoutInicial);
          clearInterval(timerId);
          global.removeEventListener("storage", onStorageChange);
          if (typeof aoConfirmar === "function") aoConfirmar(t);
        }
      }
    }
    if (typeof global.addEventListener === "function") {
      global.addEventListener("storage", onStorageChange);
    }

    return {
      parar() {
        ativo = false;
        clearTimeout(timeoutInicial);
        clearInterval(timerId);
        if (typeof global.removeEventListener === "function") {
          global.removeEventListener("storage", onStorageChange);
        }
      },
      forcarVerificacaoAgora: ciclo
    };
  }

  function configurarApiBase(novaUrl) {
    if (novaUrl && typeof novaUrl === "string") {
      API_BASE_URL = novaUrl.replace(/\/+$/, "");
    }
  }

  function obterPrefixoRaiz() {
    try {
      if (typeof location !== "undefined" && location.pathname && location.pathname.includes("/entre-luas")) {
        return "../";
      }
    } catch {}
    return "";
  }

  /**
   * Modal unificado de Acesso Mestra (compatível com desktop e celular / iOS / Android).
   * - Antes da validação: solicita a senha administrativa e exibe mensagem discreta se incorreta.
   * - Após validar a senha: ativa o Modo Mestra sem abrir checkout e apresenta as duas opções:
   *   STANDARD (diagnostico.html?plano=standard) e COMPLETO (diagnostico.html?plano=profunda).
   */
  let ultimoCallbackAtivacao = null;
  function abrirModalLoginMestra(aoAtivarCallback) {
    if (typeof document === "undefined") return;
    if (typeof aoAtivarCallback === "function") {
      ultimoCallbackAtivacao = aoAtivarCallback;
    }
    const pref = obterPrefixoRaiz();
    let modal = document.getElementById("tryv-mestra-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "tryv-mestra-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-labelledby", "tryv-mestra-titulo");
      modal.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(5,3,18,.84);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:grid;place-items:center;padding:1rem;font-family:system-ui,-apple-system,sans-serif;touch-action:manipulation;";
      modal.innerHTML = `
        <div id="tryv-mestra-card" style="width:100%;max-width:360px;background:linear-gradient(170deg,rgba(28,18,62,.98),rgba(14,9,34,.98));border:1px solid rgba(242,193,78,.48);border-radius:20px;padding:1.35rem 1.25rem;box-shadow:0 22px 55px rgba(0,0,0,.88);text-align:center;color:#f6f0ff;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;">
            <span id="tryv-mestra-titulo" style="font-size:.82rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#ffe6a3;">✦ Acesso Mestra</span>
            <button type="button" id="tryv-mestra-fechar" aria-label="Fechar" style="min-width:38px;min-height:38px;padding:.35rem .55rem;border-radius:10px;border:0;background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);font-size:.95rem;cursor:pointer;touch-action:manipulation;">✕</button>
          </div>

          <!-- Etapa 1: Digitação da senha -->
          <div id="tryv-mestra-etapa-senha">
            <p style="margin:0 0 .75rem;font-size:.86rem;color:#c9bfe6;line-height:1.45;">
              Informe sua senha administrativa para liberar o acesso direto sem checkout:
            </p>
            <form id="tryv-mestra-form" style="display:grid;gap:.6rem;margin:0;" autocomplete="off">
              <input id="tryv-mestra-senha" type="password" inputmode="text" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Digite sua senha" autocomplete="off" style="width:100%;min-height:46px;padding:.65rem .85rem;border-radius:12px;border:1px solid rgba(242,193,78,.38);background:rgba(6,4,20,.92);color:#ffe299;font-size:16px;text-align:center;outline:none;box-sizing:border-box;">
              <p id="tryv-mestra-erro" role="alert" hidden style="margin:0;padding:.45rem .65rem;border-radius:8px;background:rgba(255,77,136,.14);border:1px solid rgba(255,140,192,.4);color:#ffb3d1;font-size:.8rem;line-height:1.35;">
                Senha inválida. Verifique e tente novamente.
              </p>
              <button type="submit" id="tryv-mestra-submit" style="width:100%;min-height:46px;padding:.7rem 1rem;border-radius:999px;border:0;background:linear-gradient(180deg,#fff6d2 0%,#f6cd62 45%,#d39a2c 100%);color:#1b0f02;font-weight:700;font-size:.95rem;cursor:pointer;touch-action:manipulation;">
                ✦ Validar Acesso Mestra
              </button>
            </form>
          </div>

          <!-- Etapa 2: Escolha de modalidade após validação -->
          <div id="tryv-mestra-etapa-opcoes" hidden>
            <p style="margin:0 0 .85rem;font-size:.86rem;color:#a3f7bf;background:rgba(88,214,141,.12);border:1px solid rgba(88,214,141,.4);padding:.5rem .75rem;border-radius:10px;">
              ✓ Modo Mestra ativo · Escolha qual modalidade deseja abrir sem pagamento:
            </p>
            <div style="display:grid;gap:.65rem;">
              <a id="tryv-mestra-opt-standard" href="${pref}diagnostico.html?plano=standard" style="display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;padding:.75rem 1rem;border-radius:999px;border:1px solid rgba(242,193,78,.55);background:rgba(242,193,78,.14);color:#ffe6a3;font-weight:700;font-size:.95rem;text-decoration:none;box-sizing:border-box;touch-action:manipulation;">
                ✦ STANDARD — Diagnóstico Standard
              </a>
              <a id="tryv-mestra-opt-completo" href="${pref}diagnostico.html?plano=profunda" style="display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;padding:.75rem 1rem;border-radius:999px;border:0;background:linear-gradient(180deg,#fff6d2 0%,#f6cd62 45%,#d39a2c 100%);color:#1b0f02;font-weight:700;font-size:.95rem;text-decoration:none;box-sizing:border-box;touch-action:manipulation;">
                ✦ COMPLETO — Análise Profunda
              </a>
            </div>
            <button type="button" id="tryv-mestra-sair-modal" style="margin-top:.85rem;background:transparent;border:0;color:rgba(255,255,255,.55);font-size:.78rem;text-decoration:underline;cursor:pointer;padding:.35rem .5rem;touch-action:manipulation;">
              Encerrar sessão Modo Mestra
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener("click", (ev) => {
        if (ev.target === modal) modal.style.display = "none";
      });
      modal.querySelector("#tryv-mestra-fechar").addEventListener("click", () => {
        modal.style.display = "none";
      });

      const inp = modal.querySelector("#tryv-mestra-senha");
      const msgErro = modal.querySelector("#tryv-mestra-erro");
      const etapaSenha = modal.querySelector("#tryv-mestra-etapa-senha");
      const etapaOpcoes = modal.querySelector("#tryv-mestra-etapa-opcoes");
      const linkStd = modal.querySelector("#tryv-mestra-opt-standard");
      const linkProf = modal.querySelector("#tryv-mestra-opt-completo");
      const btnSairModal = modal.querySelector("#tryv-mestra-sair-modal");

      if (inp && msgErro) {
        inp.addEventListener("input", () => {
          msgErro.hidden = true;
          inp.style.borderColor = "rgba(242,193,78,.38)";
        });
      }

      if (linkStd) {
        linkStd.addEventListener("click", () => {
          if (typeof sessionStorage !== "undefined") gravarStorageSeguro(sessionStorage, "tryv_plano_desbloqueio", "standard");
          if (typeof localStorage !== "undefined") gravarStorageSeguro(localStorage, "tryv_plano_desbloqueio", "standard");
        });
      }
      if (linkProf) {
        linkProf.addEventListener("click", () => {
          if (typeof sessionStorage !== "undefined") gravarStorageSeguro(sessionStorage, "tryv_plano_desbloqueio", "profunda");
          if (typeof localStorage !== "undefined") gravarStorageSeguro(localStorage, "tryv_plano_desbloqueio", "profunda");
        });
      }

      if (btnSairModal) {
        btnSairModal.addEventListener("click", () => {
          desativarModoMestra();
          renderizarBarraMestraTryv();
          etapaOpcoes.hidden = true;
          etapaSenha.hidden = false;
          if (msgErro) msgErro.hidden = true;
          if (inp) {
            inp.value = "";
            inp.focus();
          }
          if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new CustomEvent("tryv:mestra-desativada"));
          }
        });
      }

      const processarSubmissao = (e) => {
        if (e) e.preventDefault();
        const valor = inp ? inp.value : "";
        if (ativarModoMestra(valor)) {
          if (inp) inp.value = "";
          if (msgErro) msgErro.hidden = true;
          etapaSenha.hidden = true;
          etapaOpcoes.hidden = false;
          renderizarBarraMestraTryv();
          if (typeof ultimoCallbackAtivacao === "function") {
            try { ultimoCallbackAtivacao(); } catch {}
          }
          if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new CustomEvent("tryv:mestra-ativada"));
          }
        } else {
          if (msgErro) msgErro.hidden = false;
          if (inp) {
            inp.value = "";
            inp.style.borderColor = "rgba(255,140,192,.78)";
            inp.focus();
          }
        }
      };

      modal.querySelector("#tryv-mestra-form").addEventListener("submit", processarSubmissao);
    }

    const etapaSenha = modal.querySelector("#tryv-mestra-etapa-senha");
    const etapaOpcoes = modal.querySelector("#tryv-mestra-etapa-opcoes");
    const msgErro = modal.querySelector("#tryv-mestra-erro");
    const inp = modal.querySelector("#tryv-mestra-senha");

    if (msgErro) msgErro.hidden = true;
    if (isModoMestra()) {
      if (etapaSenha) etapaSenha.hidden = true;
      if (etapaOpcoes) etapaOpcoes.hidden = false;
    } else {
      if (etapaSenha) etapaSenha.hidden = false;
      if (etapaOpcoes) etapaOpcoes.hidden = true;
    }

    modal.style.display = "grid";
    if (!isModoMestra()) {
      setTimeout(() => {
        if (inp) inp.focus();
      }, 80);
    }
  }

  function renderizarBarraMestraTryv() {
    if (typeof document === "undefined" || !document.body) return;
    let container = document.getElementById("tryv-mestra-widget");
    if (!container) {
      container = document.createElement("div");
      container.id = "tryv-mestra-widget";
      document.body.appendChild(container);
    }

    const temBotaoMusica = !!document.getElementById("musica-botao");
    const posBottom = temBotaoMusica
      ? "calc(82px + env(safe-area-inset-bottom, 0px))"
      : "calc(14px + env(safe-area-inset-bottom, 0px))";
    const pref = obterPrefixoRaiz();

    if (isModoMestra()) {
      container.innerHTML = `
        <div style="position:fixed;bottom:${posBottom};left:12px;right:auto;max-width:calc(100vw - 24px);z-index:9998;display:inline-flex;flex-wrap:wrap;align-items:center;gap:.35rem;padding:.4rem .65rem;border-radius:999px;background:rgba(16,10,38,.94);border:1px solid rgba(242,193,78,.6);box-shadow:0 8px 22px rgba(0,0,0,.7);backdrop-filter:blur(8px);font-family:system-ui,-apple-system,sans-serif;font-size:.74rem;color:#ffe299;">
          <span style="color:#f2c14e;font-weight:700;">✦ Mestra</span>
          <a href="${pref}index.html#descubra" style="color:#ffe299;text-decoration:none;padding:.22rem .5rem;border-radius:999px;background:rgba(242,193,78,.14);white-space:nowrap;">Portais</a>
          <a href="${pref}desbloqueio.html" style="color:#ffe299;text-decoration:none;padding:.22rem .5rem;border-radius:999px;background:rgba(242,193,78,.14);white-space:nowrap;">Desbloqueio</a>
          <a href="${pref}diagnostico.html?plano=standard" style="color:#ffe299;text-decoration:none;padding:.22rem .55rem;border-radius:999px;border:1px solid rgba(242,193,78,.45);background:rgba(242,193,78,.18);font-weight:600;white-space:nowrap;">Standard</a>
          <a href="${pref}diagnostico.html?plano=profunda" style="color:#1b0c2e;text-decoration:none;padding:.22rem .55rem;border-radius:999px;background:#f2c14e;font-weight:700;white-space:nowrap;">Completo</a>
          <button type="button" id="tryv-btn-sair-mestra" aria-label="Sair do Modo Mestra" style="border:0;background:transparent;color:rgba(255,255,255,.65);padding:.2rem .35rem;font-size:.8rem;cursor:pointer;touch-action:manipulation;">✕</button>
        </div>
      `;
      const btnSair = container.querySelector("#tryv-btn-sair-mestra");
      if (btnSair) {
        btnSair.addEventListener("click", () => {
          desativarModoMestra();
          renderizarBarraMestraTryv();
          if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new CustomEvent("tryv:mestra-desativada"));
          }
          if (typeof location !== "undefined" && typeof location.reload === "function") {
            location.reload();
          }
        });
      }
    } else {
      // Se a página já possui a estrela nativa no DOM (#btn-estrela-mestra), não duplica o controle
      if (document.getElementById("btn-estrela-mestra")) {
        container.innerHTML = "";
        return;
      }
      container.innerHTML = `
        <button type="button" id="tryv-btn-abrir-login" aria-label="✦" style="position:fixed;bottom:${posBottom};left:10px;z-index:9998;width:44px;height:44px;display:grid;place-items:center;padding:0;border-radius:50%;background:transparent;border:0;color:rgba(242,193,78,.42);font-size:1.05rem;cursor:pointer;line-height:1;touch-action:manipulation;">✦</button>
      `;
      const btnLogin = container.querySelector("#tryv-btn-abrir-login");
      if (btnLogin) {
        btnLogin.addEventListener("click", () => abrirModalLoginMestra());
      }
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderizarBarraMestraTryv);
    } else {
      renderizarBarraMestraTryv();
    }
  }

  global.GuardiaoPagamentoInfinitePay = {
    LINKS_CHECKOUT,
    TTL_INATIVIDADE_RESPOSTAS_MS,
    TTL_PEDIDO_INTERROMPIDO_MS,
    STORAGE_KEYS,
    configurarApiBase,
    normalizarEmail,
    validarFormatoEmail,
    lerSessaoPedido,
    salvarSessaoPedido,
    lerTokenConfirmado,
    salvarTokenConfirmado,
    salvarRascunhoQuestionario,
    lerRascunhoQuestionario,
    limparRascunhoQuestionario,
    construirUrlCheckoutInfinitePay,
    obterUrlCheckoutComRedirectAutomatico,
    gerarLinkCheckoutIntegrado,
    registrarIntencaoNoBackend,
    verificarStatusPagamento,
    extrairParametrosComprovanteInfinitePay,
    iniciarPollingConfirmacao,
    validarSenhaMestra,
    isModoMestra,
    ativarModoMestra,
    desativarModoMestra,
    abrirModalLoginMestra,
    renderizarBarraMestraTryv
  };
})(typeof window !== "undefined" ? window : global);
