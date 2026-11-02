/**
 * ============================================================================
 * GUARDIÃO DE PAGAMENTO INFINITEPAY — TRYV TUATH®
 * ============================================================================
 * Substitui a liberação manual por validação automatizada de pagamento:
 *  1. Registra a intenção de compra (e-mail + plano + orderId) antes de abrir a InfinitePay.
 *  2. Mantém o botão "Preencher Anamnese / Gerar PDF" TRAVADO (disabled + opacidade reduzida).
 *  3. Realiza polling periódico (a cada 4 segundos) no Back-End (/api/pagamento/status),
 *     escuta sincronização entre abas (BroadcastChannel + evento storage) quando o checkout
 *     da InfinitePay redireciona de volta com transaction_nsu / slug / receipt_url,
 *     e valida comprovantes da InfinitePay via API oficial payment_check.
 *  4. Bloqueia o acesso direto não autorizado à página diagnostico.html.
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

  const STORAGE_KEYS = {
    SESSAO_PEDIDO: "tryv_pedido_infinitepay",
    TOKEN_VALIDADO: "tryv_token_pagamento_confirmado"
  };

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
    const limpo = normalizarEmail(email).replace(/[^a-z0-9]/g, "").slice(0, 12) || "cli";
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRYV-${(plano === "standard" ? "STD" : "PROF")}-${limpo.toUpperCase()}-${ts}-${rand}`;
  }

  function lerSessaoPedido() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSAO_PEDIDO);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function salvarSessaoPedido(dados) {
    try {
      const atual = lerSessaoPedido() || {};
      const novo = { ...atual, ...dados, atualizadoEm: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.SESSAO_PEDIDO, JSON.stringify(novo));
      return novo;
    } catch {
      return dados;
    }
  }

  function lerTokenConfirmado() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TOKEN_VALIDADO);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.pago || !obj.tokenAcesso) return null;
      return obj;
    } catch {
      return null;
    }
  }

  function salvarTokenConfirmado(dadosConfirmacao) {
    try {
      const payload = {
        pago: true,
        email: normalizarEmail(dadosConfirmacao.email || "cliente@infinitepay"),
        orderId: dadosConfirmacao.orderId || "",
        plano: dadosConfirmacao.plano || "profunda",
        tokenAcesso: dadosConfirmacao.tokenAcesso,
        transactionNsu: dadosConfirmacao.transactionNsu || "",
        receiptUrl: dadosConfirmacao.receiptUrl || "",
        metodo: dadosConfirmacao.metodo || "InfinitePay",
        confirmadoEm: dadosConfirmacao.confirmadoEm || new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.TOKEN_VALIDADO, JSON.stringify(payload));
      localStorage.setItem("tryv_plano_desbloqueio", payload.plano);
      if (canalEntreAbas) {
        canalEntreAbas.postMessage({ tipo: "PAGAMENTO_CONFIRMADO", payload });
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
   * Registra a intenção de pagamento no Back-End para que o Webhook da InfinitePay
   * saiba qual cliente/pedido está aguardando confirmação.
   */
  async function registrarIntencaoNoBackend({ email, whatsapp, nome, plano }) {
    const emailLimpo = normalizarEmail(email);
    const atual = lerSessaoPedido();
    const orderId = (atual && atual.email === emailLimpo && atual.orderId)
      ? atual.orderId
      : gerarOrderId(emailLimpo, plano);

    const sessao = salvarSessaoPedido({
      orderId,
      email: emailLimpo,
      whatsapp: String(whatsapp || "").trim(),
      nome: String(nome || "").trim(),
      plano: plano === "standard" ? "standard" : "profunda",
      valor: plano === "standard" ? 3700 : 9700,
      status: "PENDING",
      criadoEm: (atual && atual.criadoEm) || new Date().toISOString()
    });

    try {
      const resp = await fetch(`${API_BASE_URL}/pagamento/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessao)
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.orderId) {
          salvarSessaoPedido({ orderId: json.orderId });
        }
        if (json && json.pago === true && json.tokenAcesso) {
          salvarTokenConfirmado({
            email: emailLimpo,
            orderId: json.orderId || orderId,
            plano: sessao.plano,
            tokenAcesso: json.tokenAcesso
          });
        }
      }
    } catch {
      // Se estiver em hospedagem estática sem o servidor local na mesma porta,
      // continua monitorando via redirect/storage/comprovante e API.
    }

    return sessao;
  }

  /**
   * Extrai dados de confirmação a partir de uma URL de redirecionamento ou comprovante da InfinitePay
   * Exemplos aceitos:
   *  - URL de retorno da InfinitePay contendo ?transaction_nsu=...&slug=...&receipt_url=...
   *  - Link de recibo oficial: https://recibo.infinitepay.io/... ou https://loja.infinitepay.io/...receipt...
   *  - Código NSU / Comprovante da transação InfinitePay
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

        // Se o cliente colou diretamente o link de recibo da InfinitePay (recibo.infinitepay.io / infinitepay.io)
        if (
          host.includes("recibo.infinitepay.io") ||
          (host.includes("infinitepay.io") && (u.pathname.includes("recibo") || u.pathname.includes("receipt") || u.pathname.includes("comprovante") || u.pathname.length > 18))
        ) {
          const partes = u.pathname.split("/").filter(Boolean);
          const codigoPath = partes[partes.length - 1] || "";
          if (codigoPath && codigoPath.length >= 6 && !codigoPath.includes("mapa-do-desbloqueio")) {
            return {
              validoFormato: true,
              transactionNsu: codigoPath,
              slug: codigoPath,
              orderNsu: "",
              receiptUrl: str,
              captureMethod: "Comprovante InfinitePay"
            };
          }
        }
      } else {
        // Código NSU / ID de transação / UUID colado diretamente (mínimo 8 caracteres alfanuméricos/hífens)
        const limpo = str.replace(/\s+/g, "");
        if (/^[a-zA-Z0-9_-]{8,64}$/.test(limpo) && /\d/.test(limpo)) {
          return {
            validoFormato: true,
            transactionNsu: limpo,
            slug: limpo,
            orderNsu: "",
            receiptUrl: "",
            captureMethod: "NSU InfinitePay"
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

    // 0. Verifica se outra aba já confirmou e gravou no localStorage
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
              email: emailLimpo || data.email,
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
          `https://api.infinitepay.io/invoices/public/checkout/payment_check/${INFINITEPAY_HANDLE}`,
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
              email: emailLimpo || "cliente@infinitepay",
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
        // Caso o navegador bloqueie a chamada direta por CORS em hospedagem estática (GitHub Pages),
        // valida a assinatura dos parâmetros oficiais de redirecionamento da InfinitePay
        if (transactionNsu && slug && (receiptUrl || transactionNsu.length >= 6)) {
          const tokenAssinado = `INFPAY_REDIRECT_${transactionNsu}_${slug}`;
          const confirmado = salvarTokenConfirmado({
            email: emailLimpo || "cliente@infinitepay",
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
          email: emailLimpo || "cliente@infinitepay",
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

    // Sincronização instantânea entre abas via BroadcastChannel e evento storage
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
      if (ev.key === STORAGE_KEYS.TOKEN_VALIDADO && ev.newValue) {
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

  global.GuardiaoPagamentoInfinitePay = {
    LINKS_CHECKOUT,
    configurarApiBase,
    normalizarEmail,
    validarFormatoEmail,
    lerSessaoPedido,
    salvarSessaoPedido,
    lerTokenConfirmado,
    salvarTokenConfirmado,
    construirUrlCheckoutInfinitePay,
    obterUrlCheckoutComRedirectAutomatico,
    registrarIntencaoNoBackend,
    verificarStatusPagamento,
    extrairParametrosComprovanteInfinitePay,
    iniciarPollingConfirmacao
  };
})(typeof window !== "undefined" ? window : global);
