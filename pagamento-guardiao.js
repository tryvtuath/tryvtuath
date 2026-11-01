/**
 * ============================================================================
 * GUARDIÃO DE PAGAMENTO INFINITEPAY — TRYV TUATH®
 * ============================================================================
 * Substitui a liberação manual por validação automatizada de pagamento:
 *  1. Registra a intenção de compra (e-mail + plano + orderId) antes de abrir a InfinitePay.
 *  2. Mantém o botão "Preencher Anamnese / Gerar PDF" TRAVADO (disabled + opacidade reduzida).
 *  3. Realiza polling periódico (a cada 4 segundos) no Back-End (/api/pagamento/status)
 *     aguardando a confirmação do Webhook da InfinitePay (PIX ou Cartão) para aquele e-mail/pedido.
 *  4. Também valida o retorno direto de redirecionamento da InfinitePay (transaction_nsu / slug)
 *     via API oficial payment_check da InfinitePay e sincroniza abas via BroadcastChannel.
 *  5. Bloqueia o acesso direto não autorizado à página diagnostico.html.
 * ============================================================================
 */
(function (global) {
  "use strict";

  const INFINITEPAY_HANDLE = "tryvtuath";
  const LINKS_CHECKOUT = {
    profunda: "https://loja.infinitepay.io/tryvtuath/kka1436-mapa-do-desbloqueio---analise-profunda",
    standard: "https://loja.infinitepay.io/tryvtuath/nuw5653-mapa-do-desbloqueio---analise-standard"
  };

  // URL base da API de validação/webhook (pode ser configurada em conteudo.json ou localStorage)
  // Em produção com backend Node/Vercel no mesmo domínio ou subdomínio, usa "/api" por padrão.
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
      if (!obj || !obj.pago || !obj.tokenAcesso || !obj.email) return null;
      return obj;
    } catch {
      return null;
    }
  }

  function salvarTokenConfirmado(dadosConfirmacao) {
    try {
      const payload = {
        pago: true,
        email: normalizarEmail(dadosConfirmacao.email),
        orderId: dadosConfirmacao.orderId || "",
        plano: dadosConfirmacao.plano || "profunda",
        tokenAcesso: dadosConfirmacao.tokenAcesso,
        transactionNsu: dadosConfirmacao.transactionNsu || "",
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

  function construirUrlCheckoutInfinitePay(plano, email, orderId, urlBaseCustom) {
    const base = (urlBaseCustom && urlBaseCustom.startsWith("https://loja.infinitepay.io/"))
      ? urlBaseCustom
      : (LINKS_CHECKOUT[plano] || LINKS_CHECKOUT.profunda);

    try {
      const u = new URL(base);
      if (email) u.searchParams.set("customer_email", normalizarEmail(email));
      if (orderId) u.searchParams.set("order_nsu", orderId);
      // URL de retorno automático caso a InfinitePay redirecione após o pagamento
      const urlRetorno = new URL("diagnostico.html", global.location.href);
      urlRetorno.searchParams.set("plano", plano);
      urlRetorno.searchParams.set("order_nsu", orderId);
      urlRetorno.searchParams.set("email", normalizarEmail(email));
      u.searchParams.set("redirect_url", urlRetorno.toString());
      return u.toString();
    } catch {
      return base;
    }
  }

  /**
   * Registra a intenção de pagamento no Back-End para que o Webhook da InfinitePay
   * saiba qual cliente/pedido está aguardando confirmação.
   */
  async function registrarIntencaoNoBackend({ email, whatsapp, nome, plano }) {
    const emailLimpo = normalizarEmail(email);
    const orderId = gerarOrderId(emailLimpo, plano);
    const sessao = salvarSessaoPedido({
      orderId,
      email: emailLimpo,
      whatsapp: String(whatsapp || "").trim(),
      nome: String(nome || "").trim(),
      plano: plano === "standard" ? "standard" : "profunda",
      valor: plano === "standard" ? 3700 : 9700,
      status: "PENDING",
      criadoEm: new Date().toISOString()
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
      }
    } catch {
      // Se o backend estiver em outro host ou temporariamente inacessível no início,
      // o polling continuará tentando consultar o endpoint configurado.
    }

    return sessao;
  }

  /**
   * Consulta o status do pagamento no Back-End (/api/pagamento/status)
   * e, caso haja parâmetros de retorno da InfinitePay (transaction_nsu / slug),
   * também verifica diretamente na API pública da InfinitePay.
   */
  async function verificarStatusPagamento({ email, orderId, transactionNsu, slug, plano }) {
    const emailLimpo = normalizarEmail(email);

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
        const data = await resp.json();
        if (data && data.pago === true && data.tokenAcesso) {
          const confirmado = salvarTokenConfirmado({
            email: emailLimpo || data.email,
            orderId: data.orderId || orderId,
            plano: data.plano || plano || "profunda",
            tokenAcesso: data.tokenAcesso,
            transactionNsu: data.transactionNsu || transactionNsu,
            metodo: data.metodo || "InfinitePay",
            confirmadoEm: data.pagoEm || new Date().toISOString()
          });
          return { pago: true, dados: confirmado };
        }
      }
    } catch {
      // Continua para verificação de fallback se houver parâmetros de comprovante da InfinitePay
    }

    // 2. Se a URL ou o cliente forneceu transaction_nsu + slug da InfinitePay,
    // consulta o endpoint oficial público de checagem de pagamento da InfinitePay
    if (transactionNsu && slug) {
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
              metodo: jsonInf.capture_method || "InfinitePay",
              confirmadoEm: new Date().toISOString()
            });
            return { pago: true, dados: confirmado };
          }
        }
      } catch {}
    }

    return { pago: false, dados: null };
  }

  /**
   * Extrai transaction_nsu e slug caso o cliente cole a URL de comprovante/retorno da InfinitePay
   */
  function extrairParametrosComprovanteInfinitePay(inputTextoOuUrl) {
    const str = String(inputTextoOuUrl || "").trim();
    if (!str) return null;
    try {
      if (str.startsWith("http://") || str.startsWith("https://")) {
        const u = new URL(str);
        const transactionNsu = u.searchParams.get("transaction_nsu") || u.searchParams.get("transaction_id") || "";
        const slug = u.searchParams.get("slug") || u.searchParams.get("invoice_slug") || "";
        const orderNsu = u.searchParams.get("order_nsu") || "";
        if (transactionNsu || slug) {
          return { transactionNsu, slug, orderNsu };
        }
      }
    } catch {}
    return null;
  }

  /**
   * Controlador de Polling Periódico para o botão inteligente de liberação
   */
  function iniciarPollingConfirmacao({
    email,
    orderId,
    plano,
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

      // Verifica se outra aba já confirmou o pagamento
      const tokenSalvo = lerTokenConfirmado();
      if (tokenSalvo && (!email || tokenSalvo.email === normalizarEmail(email))) {
        ativo = false;
        clearInterval(timerId);
        if (typeof aoConfirmar === "function") aoConfirmar(tokenSalvo);
        return;
      }

      const resultado = await verificarStatusPagamento({ email, orderId, plano });
      if (resultado.pago && resultado.dados) {
        ativo = false;
        clearInterval(timerId);
        if (typeof aoConfirmar === "function") aoConfirmar(resultado.dados);
      }
    }

    // Dispara a primeira verificação após 1.5s e repete a cada intervaloMs (4s)
    const timeoutInicial = setTimeout(ciclo, 1500);
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

    return {
      parar() {
        ativo = false;
        clearTimeout(timeoutInicial);
        clearInterval(timerId);
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
    registrarIntencaoNoBackend,
    verificarStatusPagamento,
    extrairParametrosComprovanteInfinitePay,
    iniciarPollingConfirmacao
  };
})(typeof window !== "undefined" ? window : global);
