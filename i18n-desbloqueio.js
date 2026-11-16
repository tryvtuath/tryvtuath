/* =========================================================================
   INTERNACIONALIZAÇÃO (i18n) — O DESBLOQUEIO INVISÍVEL (Tryv Tuath®)
   - Idiomas: Português Brasileiro (PT-BR, padrão) e Inglês (EN)
   - Persistência: localStorage ("tryv_idioma" -> "pt-BR" | "en")
   - Alternância em tempo real sem recarregar a página e reversibilidade 100% fiel
   ========================================================================= */
(function (global) {
  "use strict";

  const STORAGE_KEY = "tryv_idioma";
  const MAIN_SITE_STORAGE_KEY = "bemdito-idioma";
  const SYNC_KEY = "tryv_idioma_sync_bemdito";
  const DEFAULT_LANG = "pt-BR";

  // Mapa reversível de nós de texto ({ pt, en }) e atributos originais ({ attr: { pt, en } })
  const origTextMap = new WeakMap();
  const origAttrMap = new WeakMap();
  let aplicandoTraducao = false;
  let idiomaAtual = null;
  let observerIniciado = false;

  // Dicionário exato de frases e blocos (PT-BR -> EN)
  const EXACT_MAP = {
    // Títulos das páginas
    "O Desbloqueio Invisível · Mapa Kármico, Védico, Numerologia & Matriz do Destino | Tryv Tuath®":
      "The Invisible Unlocking · Karmic, Vedic, Numerology & Destiny Matrix Chart | Tryv Tuath®",
    "Desbloqueio Invisível — Diagnóstico Oracular & Mapa em PDF | Tryv Tuath®":
      "The Invisible Unlocking — Oracular Diagnosis & PDF Chart | Tryv Tuath®",
    "Portal de Coleta & Diagnóstico · O Desbloqueio Invisível | Tryv Tuath®":
      "Sacred Intake & Diagnostic Portal · The Invisible Unlocking | Tryv Tuath®",
    "Diagnóstico & Geração do PDF — Desbloqueio Invisível | Tryv Tuath®":
      "Diagnosis & PDF Generation — The Invisible Unlocking | Tryv Tuath®",
    "Padrões Emocionais": "Emotional Patterns",
    "sessões individuais por pacotes trimestrais ou semestrais por ligações telefônicas":
      "individual sessions in quarterly or semi-annual packages via phone calls",
    "A": "The",

    // Navegação & Cabeçalhos (desbloqueio.html & diagnostico.html)
    "Navegação do Funil": "Funnel Navigation",
    "Padrões Ocultos": "Hidden Patterns",
    "Os 4 Saberes": "The 4 Wisdoms",
    "Prévia Gratuita": "Free Preview",
    "Escolher Análise": "Choose Analysis",
    "← Voltar ao Site": "← Back to Main Site",
    "Tryv Tuath® · Portal de Diagnóstico": "Tryv Tuath® · Diagnostic Portal",
    "✦ Análise Profunda Ativa": "✦ Deep Analysis Active",
    "✦ Análise Profunda Ativa (R$ 97)": "✦ Deep Analysis Active (R$ 97)",
    "✦ Análise Standard Ativa (R$ 37)": "✦ Standard Analysis Active (R$ 37)",
    "← Página do Desbloqueio": "← Unlocking Page",

    // Hero (desbloqueio.html & conteudo.json)
    "✦ Mapeamento Espiritual, Kármico & Psicanalítico · Tryv Tuath®":
      "✦ Spiritual, Karmic & Psychoanalytic Mapping · Tryv Tuath®",
    "✦ Diagnóstico Oracular Personalizado · Tryv Tuath®":
      "✦ Personalized Oracular Diagnosis · Tryv Tuath®",
    "O Desbloqueio Invisível": "The Invisible Unlocking",
    "Por que você tenta mudar, estuda, se esforça, mas os mesmos ciclos emocionais, amorosos e financeiros voltam a se repetir?":
      "Why do you try to change, study, and put in the effort, yet the same emotional, romantic, and financial cycles keep repeating?",
    "Existe um código oculto gravado no seu": "There is a hidden code inscribed in your",
    "Nome Completo de Batismo": "Full Birth Name",
    "e no instante exato do seu": "and at the exact moment of your",
    "Nascimento": "Birth",
    ". Quando cruzamos nossas seis dimensões de leitura espiritual, kármica e psicanalítica com o seu momento atual, a raiz invisível do seu bloqueio é revelada — e o seu":
      ". When we cross-reference our six dimensions of spiritual, karmic, and psychoanalytic reading with your current moment, the invisible root of your block is revealed — and your",
    "caminho mais suave": "gentlest path",
    "se abre em um": "opens up in a",
    "Dossiê PDF Personalizado": "Personalized PDF Dossier",
    "gerado exclusivamente para você.": "generated exclusively for you.",
    "✦ Quero Descobrir Meu Bloqueio Invisível": "✦ I Want to Discover My Invisible Block",
    "Ver Prévia com Minha Data de Nascimento": "See Free Preview with My Birth Date",
    "Entrega Imediata em PDF Personalizado": "Instant Delivery in Personalized PDF",
    "6 Tradições Milenares & Psicanalíticas": "6 Ancient & Psychoanalytic Traditions",
    "Metodologia Proprietária Tryv Tuath®": "Proprietary Tryv Tuath® Methodology",

    // Seção 3 Espelhos de Dor
    "Reconheça os sinais": "Recognize the signs",
    "Onde o Bloqueio Invisível está atuando na sua vida?":
      "Where is the Invisible Block operating in your life?",
    "O bloqueio nunca é falta de capacidade sua. Ele é uma lealdade inconsciente, uma ferida primordial (Quíron) ou uma Cauda Cármica que opera no piloto automático nestes 3 eixos:":
      "The block is never a lack of capability on your part. It is an unconscious loyalty, a primal wound (Chiron), or a Karmic Tail operating on autopilot across these 3 axes:",
    "1. Padrões Emocionais": "1. Emotional Patterns",
    "Sensação constante de carregar o peso do mundo nas costas sem ter em quem apoiar.":
      "Constant feeling of carrying the weight of the world on your shoulders with no one to lean on.",
    "Ansiedade noturna, autossabotagem ou medo de brilhar e ser julgada.":
      "Nighttime anxiety, self-sabotage, or fear of shining and being judged.",
    "Culpas antigas e exaustão por absorver as dores da família e do ambiente.":
      "Old guilt and exhaustion from absorbing the pain of your family and environment.",
    "Sensação de não pertencer ou de nunca ser verdadeiramente compreendida.":
      "Feeling of not belonging or of never being truly understood.",
    "2. Ciclos de Relacionamento": "2. Relationship Cycles",
    "Atração repetitiva por parceiros emocionalmente indisponíveis, confusos ou imaturos.":
      "Repeated attraction to emotionally unavailable, confused, or immature partners.",
    "Assumir o papel de “salvadora” ou “mãe” da relação, entregando muito e recebendo migalhas.":
      "Taking on the “savior” or “mother” role in relationships, giving too much and receiving crumbs.",
    "Medo inconsciente da entrega profunda por marcas de traição, rejeição ou abandono.":
      "Unconscious fear of deep surrender due to scars of betrayal, rejection, or abandonment.",
    "Dificuldade de encerrar laços energéticos com pessoas do passado.":
      "Difficulty closing energetic ties with people from the past.",
    "3. Travas Profissionais & Dinheiro": "3. Career & Financial Blocks",
    "O “teto invisível”: o dinheiro até entra, mas escorre pelas mãos com imprevistos.":
      "The “invisible ceiling”: money comes in, yet slips through your fingers with unexpected expenses.",
    "Síndrome da impostora: ter grande talento, mas travar na hora de aparecer, vender ou cobrar o justo.":
      "Impostor syndrome: having great talent, yet freezing when it is time to be seen, sell, or charge fairly.",
    "Trabalhar no modo de esforço exaustivo e sentir que o reconhecimento demora o dobro.":
      "Working in exhausting overdrive while feeling that recognition takes twice as long.",
    "Dúvida vocacional sobre qual caminho realmente alinha sua alma com a prosperidade.":
      "Vocational doubt about which path truly aligns your soul with prosperity.",

    // Simulador Gratuito
    "Amostra Instantânea": "Instant Sample",
    "Descubra agora o número do seu Centro de Força e sua Cauda Cármica":
      "Discover your Core Power Center number and your Karmic Tail right now",
    "Digite seu primeiro nome e sua data de nascimento para ver um vislumbre do código que o motor oracular calculará no seu PDF:":
      "Enter your first name and birth date to glimpse the code our oracular engine will calculate in your PDF:",
    "Seu Nome": "Your Name",
    "Ex.: Maria Clara": "E.g.: Maria Clara",
    "Data de Nascimento": "Date of Birth",
    "Data de Nascimento *": "Date of Birth *",
    "✦ Revelar Meu Código": "✦ Reveal My Code",
    "Centro da Matriz do Destino": "Destiny Matrix Center",
    "Cauda Cármica de Vidas Passadas": "Past-Life Karmic Tail",
    "Ferida Primordial & Jyotish": "Primal Wound & Jyotish",
    "✦ Desbloquear Meu Dossiê Completo em PDF": "✦ Unlock My Complete PDF Dossier",

    // Os Saberes Milenares Integrados
    "Engenharia Espiritual, Psicanálise & Sabedoria Ancestral":
      "Spiritual Engineering, Psychoanalysis & Ancestral Wisdom",
    "A Profundidade Mística Por Trás do Seu Dossiê":
      "The Mystical Depth Behind Your Dossier",
    "Leituras superficiais olham apenas o seu signo solar. O método proprietário d’":
      "Superficial readings only look at your sun sign. The proprietary method of ",
    "sintetiza seis grandes tradições iniciáticas e psicanalíticas — protegidas sob a metodologia exclusiva da Tryv Tuath® — para revelar não apenas onde você trava, mas como caminhar com mais leveza:":
      "synthesizes six great initiatic and psychoanalytic traditions — protected under the exclusive Tryv Tuath® methodology — to reveal not only where you get stuck, but how to walk with greater lightness:",
    "DIMENSÃO I · ASTROLOGIA PROFUNDA DA SOMBRA": "DIMENSION I · DEEP SHADOW ASTROLOGY",
    "Ferida Primordial, Magnetismo & Autoridade": "Primal Wound, Magnetism & Authority",
    "Vamos além da superfície solar para localizar o ponto exato da sua ferida emocional de infância, o seu magnetismo reprimido nos afetos e a estrutura inconsciente onde moram tanto o seu medo quanto a sua maior autoridade material.":
      "We go beyond the solar surface to locate the exact point of your childhood emotional wound, your repressed magnetism in love, and the unconscious structure where both your fear and your greatest material authority reside.",
    "DIMENSÃO II · MAPA VÉDICO (MOMENTO ATUAL & DIREÇÃO)":
      "DIMENSION II · VEDIC CHART (CURRENT MOMENT & DIRECTION)",
    "Sabedoria Sideral Indiana & Ciclo Presente": "Indian Sidereal Wisdom & Present Cycle",
    "Acessamos a tradição milenar do Oriente para decodificar a mansão estelar da sua alma, revelar":
      "We access the ancient tradition of the East to decode your soul's stellar mansion, reveal",
    "exatamente qual ciclo vital você atravessa neste momento":
      "exactly which life cycle you are crossing right now",
    "e entregar um": "and deliver",
    "direcionamento prático e seguro": "practical, grounded guidance",
    "para suas decisões atuais.": "for your current decisions.",
    "DIMENSÃO III · NUMEROLOGIA KÁRMICA & DONS NATOS":
      "DIMENSION III · KARMIC NUMEROLOGY & INNATE GIFTS",
    "Heranças Ocultas & O Caminho Mais Suave": "Hidden Legacies & The Gentlest Path",
    "Pela vibração sonora do seu": "Through the sound vibration of your",
    "e data natal, revelamos as lições e pendências cármicas invisíveis e mapeamos os seus":
      "and birth date, we reveal invisible karmic lessons and pending debts and map your",
    "Dons Natos de Berço": "Innate Birth Gifts",
    "— guiando você para sair do esforço exaustivo rumo a um":
      "— guiding you out of exhausting struggle toward a",
    "e fluido.": "and fluid one.",
    "DIMENSÃO IV · GEOMETRIA SAGRADA & ARQUÉTIPOS":
      "DIMENSION IV · SACRED GEOMETRY & ARCHETYPES",
    "Matriz de Vida, Eneagrama & Alquimia Oriental":
      "Life Matrix, Enneagram & Eastern Alchemy",
    "Integramos os códigos arquetípicos da sua": "We integrate the archetypal codes of your",
    "Matriz de Destino": "Destiny Matrix",
    "(Amor, Prosperidade e Memória Ancestral) com a psicodinâmica profunda do":
      "(Love, Prosperity, and Ancestral Memory) with the deep psychodynamics of the",
    "Eneagrama": "Enneagram",
    "e dos": "and the",
    "5 Elementos da Alquimia Oriental": "5 Elements of Eastern Alchemy",
    "para um retrato 360º da sua psique.": "for a 360° portrait of your psyche.",

    // Como funciona
    "Jornada Automatizada": "Automated Journey",
    "Como funciona o seu Desbloqueio em 3 passos": "How your Unlocking works in 3 steps",
    "Escolha a modalidade da sua Análise": "Choose your Analysis tier",
    "Selecione abaixo entre a": "Select below between the",
    "Análise Standard (R$ 37)": "Standard Analysis (R$ 37)",
    ", focada no bloqueio essencial, relações/afetos e soluções práticas imediatas, ou a":
      ", focused on your core block, relationships/affections, and immediate practical solutions, or the",
    "Análise Profunda (R$ 97)": "Deep Analysis (R$ 97)",
    ", com o dossiê completo do seu Momento Védico, Numerologia Kármica, Dons Natos e Protocolo de 21 Dias.":
      ", featuring the complete dossier of your Vedic Moment, Karmic Numerology, Innate Gifts, and 21-Day Protocol.",
    "Preencha o Diagnóstico Pós-Pagamento": "Complete the Post-Payment Diagnostic",
    "Assim que o pagamento é confirmado, você acessa nossa":
      "As soon as payment is confirmed, you access our",
    "Página Sagrada de Coleta e Diagnóstico": "Sacred Intake & Diagnostic Page",
    ", onde informará seu Nome de Batismo, Data, Hora e Local de Nascimento, além das perguntas modulares de emoções, afetos, vocação e arquétipos.":
      ", where you will enter your Full Birth Name, Date, Time, and Place of Birth, along with modular questions on emotions, relationships, vocation, and archetypes.",
    "Receba seu PDF Personalizado na Hora": "Receive Your Personalized PDF Instantly",
    "Nosso motor proprietário processa silenciosamente todas as camadas do seu mapa e gera na tela o seu":
      "Our proprietary engine silently processes all layers of your chart and generates on screen your",
    "Pergaminho em PDF Personalizado": "Personalized PDF Scroll",
    ", diagramado com precisão para leitura e download imediato no celular ou computador.":
      ", precisely formatted for immediate reading and download on mobile or desktop.",

    // Planos de Compra
    "Sua Chave de Virada": "Your Turning Key",
    "Escolha a sua Análise do Desbloqueio Invisível":
      "Choose Your Invisible Unlocking Analysis",
    "Acesso imediato ao formulário de diagnóstico e geração do seu PDF personalizado logo após a confirmação:":
      "Immediate access to the diagnostic form and generation of your personalized PDF right after confirmation:",
    "Análise Standard": "Standard Analysis",
    "O diagnóstico essencial para compreender sua trava emocional, curar padrões em relações/afetos e aplicar soluções práticas imediatas.":
      "The essential diagnosis to understand your emotional block, heal relationship/affection patterns, and apply immediate practical solutions.",
    "De R$ 97,00 por apenas": "From R$ 97.00 for only",
    "à vista": "one-time",
    "Pagamento único · Acesso imediato": "Single payment · Instant access",
    "Diagnóstico da Raiz Emocional": "Emotional Root Diagnosis",
    "cruzado com suas respostas pessoais": "cross-referenced with your personal answers",
    "Seção Dedicada a Relações & Afetos:": "Dedicated Relationships & Affections Section:",
    "por que determinados padrões amorosos se repetem e como reposicionar seu magnetismo":
      "why certain romantic patterns repeat and how to reposition your magnetism",
    "Soluções Práticas & Ações Imediatas:": "Practical Solutions & Immediate Actions:",
    "passos objetivos para aplicar hoje na rotina emocional, afetiva e material":
      "objective steps to apply today in your emotional, romantic, and material routine",
    "Síntese de Eneagrama & Alquimia Oriental:": "Enneagram & Eastern Alchemy Synthesis:",
    "sua motivação inconsciente e seu arquétipo elemental de nascimento":
      "your unconscious motivation and your natal elemental archetype",
    "Vibração Base do Nome de Batismo & Arcano Central":
      "Core Birth Name Vibration & Central Arcanum",
    "+ Decreto de Alinhamento em PDF": "+ Alignment Decree in PDF",
    "Gatilho Especial de Upgrade & Indicação:": "Special Upgrade & Referral Trigger:",
    "código de abatimento exclusivo +": "exclusive credit code +",
    "Desconto Especial por Indicação": "Special Referral Discount",
    "(indique 5 pessoas que realizem a análise e ganhe um desconto especial no valor complementar para o pacote completo da Análise Profunda)":
      "(refer 5 people who complete the analysis and earn a special discount on the complementary upgrade to the full Deep Analysis package)",
    "Questionário Clínico-Oracular Expandido (Raízes Familiares, Ansiedade e Ciclos Profundos)":
      "Expanded Clinical-Oracular Questionnaire (Family Roots, Anxiety & Deep Cycles)",
    "Mapa Védico Aprofundado (Leitura do Momento Atual e Direcionamento Prático)":
      "In-Depth Vedic Chart (Current Moment Reading & Practical Guidance)",
    "Numerologia Kármica Completa + Mapa dos Dons Natos (Guia do Caminho Mais Suave)":
      "Complete Karmic Numerology + Innate Gifts Map (Gentlest Path Guide)",
    "Desbloqueio da Raiz de Vidas Passadas, Canal Profundo do Dinheiro & Protocolo de 21 Dias":
      "Past-Life Root Unlocking, Deep Money Channel & 21-Day Protocol",
    "💡 Nota de Transição (Standard → Profunda):":
      "💡 Transition Note (Standard → Deep Analysis):",
    "Por um": "For a",
    "pequeno acréscimo de investimento": "small additional investment",
    ", você pode escolher diretamente a": ", you can directly choose the",
    "Análise Profunda Completa (R$ 97)": "Complete Deep Analysis (R$ 97)",
    "✦ Análise Profunda Completa (R$ 97)": "✦ Complete Deep Analysis (R$ 97)",
    "ao lado e ter acesso a um": "next to this card and gain access to a",
    "questionário muito mais robusto": "much more robust questionnaire",
    "e a todas as camadas kármicas, védicas e numerológicas para compreender melhor a si mesma e seus caminhos de melhoria.":
      "and all karmic, Vedic, and numerological layers to better understand yourself and your paths of improvement.",
    "🎁": "🎁",
    "Regra de Desconto por Indicação:": "Referral Discount Rule:",
    "Caso adquira a versão Standard agora e depois queira fazer o upgrade para o pacote completo da Análise Profunda, se você":
      "If you purchase the Standard version now and later wish to upgrade to the full Deep Analysis package, if you",
    "indicar mais 5 pessoas": "refer 5 more people",
    "que realizem a análise, ganha um": "who complete the analysis, you earn a",
    "desconto especial": "special discount",
    "para adquirir o valor complementar do pacote completo!":
      "toward the complementary upgrade to the complete package!",
    "Iniciar Meu Diagnóstico Standard (R$ 37)": "Start My Standard Diagnosis (R$ 37)",
    "✦ Mais Escolhida · Recomendada pela Tryv": "✦ Most Popular · Recommended by Tryv",
    "Análise Profunda Completa": "Complete Deep Analysis",
    "A consagração completa do método Tryv Tuath®: questionário expandido, diagnóstico profundo de todas as esferas da sua vida, leitura do seu momento atual, revelação dos seus Dons Natos e plano de desbloqueio.":
      "The complete consecration of the Tryv Tuath® method: expanded questionnaire, deep diagnosis across all spheres of your life, reading of your current moment, revelation of your Innate Gifts, and unlocking plan.",
    "De R$ 247,00 por apenas": "From R$ 247.00 for only",
    "ou em até 12x no cartão · Entrega imediata do Dossiê Completo":
      "or in up to 12x on card · Instant delivery of the Complete Dossier",
    "Tudo da Análise Standard + Questionário Muito Mais Robusto":
      "Everything in Standard Analysis + Much More Robust Questionnaire",
    "(mapeamento profundo de dinâmicas familiares, ansiedade e padrões inconscientes)":
      "(deep mapping of family dynamics, anxiety, and unconscious patterns)",
    "Mapa Védico Aprofundado (Momento Atual & Direção):":
      "In-Depth Vedic Chart (Current Moment & Direction):",
    "leitura detalhada da fase exata que sua alma atravessa hoje e orientações práticas para suas escolhas":
      "detailed reading of the exact phase your soul is crossing today and practical guidance for your choices",
    "Numerologia Kármica Completa & Dons Natos:": "Complete Karmic Numerology & Innate Gifts:",
    "revelação das heranças ocultas do seu nome e mapeamento detalhado dos seus":
      "revelation of the hidden legacies in your name and detailed mapping of your",
    "para guiar você por um": "to guide you along a",
    "e próspero": "and prosperous path",
    "Geometria Completa do Destino:": "Complete Destiny Geometry:",
    "desbloqueio da memória de vidas passadas, abertura do fluxo afetivo e destravamento do":
      "unlocking past-life memory, opening emotional flow, and unblocking the",
    "Canal da Prosperidade e Vocação": "Prosperity & Vocation Channel",
    "Mapeamento Profundo da Sombra & Magnetismo:": "Deep Shadow & Magnetism Mapping:",
    "diagnóstico completo das feridas inconscientes, travas de autoridade e pontos de virada evolutiva":
      "complete diagnosis of unconscious wounds, authority blocks, and evolutionary turning points",
    "Cruzamento Avançado de Eneagrama & Horóscopo Oriental:":
      "Advanced Enneagram & Eastern Horoscope Cross-Analysis:",
    "integração completa da sua personalidade com sua assinatura elemental no amor e na carreira":
      "complete integration of your personality with your elemental signature in love and career",
    "Protocolo Alquímico Tryv Tuath® (21 Dias):": "Tryv Tuath® Alchemical Protocol (21 Days):",
    "ritual de ervas específico para sua energia, cristal de ancoragem, decreto vibracional e roteiro passo a passo":
      "herbal bath ritual tailored to your energy, anchoring crystal, vibrational decree, and step-by-step roadmap",
    "Dossiê PDF de Luxo Completo": "Complete Luxury PDF Dossier",
    "+ Canal direto para atendimento individual com a Tryv":
      "+ Direct channel for 1-on-1 sessions with Tryv",
    "✦ Desbloquear Minha Análise Profunda Completa (R$ 97)":
      "✦ Unlock My Complete Deep Analysis (R$ 97)",

    // Painel Modo Mestra
    "✦ Modo Mestra Ativo — Selecione a modalidade para acessar sem pagamento:":
      "✦ Master Mode Active — Select the tier to access without payment:",
    "✦ STANDARD — Abrir Standard": "✦ STANDARD — Open Standard",
    "✦ COMPLETO — Abrir Completo": "✦ COMPLETE — Open Deep Analysis",
    "✦ STANDARD — Acessar sem Pagamento (Modo Mestra) →":
      "✦ STANDARD — Access without Payment (Master Mode) →",
    "✦ COMPLETO — Acessar sem Pagamento (Modo Mestra) →":
      "✦ COMPLETE — Access without Payment (Master Mode) →",

    // Sobre a Tryv, Aviso Ético e Garantia
    "Quem Conduz o Método · Direção Clínica & Oracular":
      "Who Leads the Method · Clinical & Oracular Direction",
    "Sobre a Tryv Tuath® — Psicanalista & Mentora":
      "About Tryv Tuath® — Psychoanalyst & Mentor",
    "é": "is a",
    "psicanalista formada em traumas familiares, ansiedade e depressão":
      "psychoanalyst trained in family trauma, anxiety, and depression",
    ", além de": ", as well as a",
    "mentora especializada em guiar a superação de desafios":
      "mentor specialized in guiding you through overcoming",
    "emocionais, relacionais e vocacionais através de":
      "emotional, relational, and vocational challenges through",
    "sessões individuais por pacotes trimestrais ou semestrais realizadas por ligações telefônicas":
      "individual sessions in quarterly or semi-annual packages conducted via phone calls",
    ", oferecendo acolhimento profundo, sigilo absoluto e direcionamento estruturado.":
      ", offering deep support, absolute confidentiality, and structured guidance.",
    "⚖ Aviso Ético e de Responsabilidade Profissional:":
      "⚖ Ethical & Professional Responsibility Notice:",
    "Nenhuma destas ferramentas automatizadas ou relatórios oraculares substitui a análise individual de um profissional. O dossiê funciona como um mapa de autoconhecimento e clareza; para processos clínicos e superação estruturada de dores profundas, recomenda-se o acompanhamento individual.":
      "None of these automated tools or oracular reports replace individualized analysis with a qualified professional. The dossier serves as a map for self-knowledge and clarity; for clinical processes and structured healing of deep pain, individual accompaniment is recommended.",
    "✦ Análises Individuais & Mentoria por Ligações Telefônicas":
      "✦ 1-on-1 Analyses & Mentoring via Phone Calls",
    "Deseja ir além do dossiê digital e vivenciar o acompanhamento direto com a Tryv em":
      "Would you like to go beyond the digital dossier and experience direct accompaniment with Tryv in",
    "Psicanálise e Mentoria (pacotes trimestrais ou semestrais por ligações telefônicas)":
      "Psychoanalysis & Mentoring (quarterly or semi-annual packages via phone calls)",
    "ou solicitar uma leitura individual aprofundada do seu":
      "or request an in-depth individual reading of your",
    "Mapa Astral, Matriz do Destino ou Numerologia Kármica":
      "Birth Chart, Destiny Matrix, or Karmic Numerology",
    "✦ Agende com a Tryv sua Análise Completa e Aprofundada":
      "✦ Schedule Your Complete In-Depth Analysis with Tryv",
    "* Atendimento exclusivo sujeito à análise de perfil e disponibilidade de agenda.":
      "* Exclusive 1-on-1 service subject to profile review and schedule availability.",
    "Garantia de Profundidade, Sigilo & Abatimento em Consulta":
      "Depth, Confidentiality & Consultation Credit Guarantee",
    "A síntese do": "The synthesis of",
    "Desbloqueio Invisível": "The Invisible Unlocking",
    "é processada por um motor exclusivo desenvolvido sob os fundamentos clínicos e oraculares da Tryv Tuath®. Além disso, se após ler seu dossiê você desejar aprofundar seu processo em uma sessão individual ao vivo com a Tryv, o valor investido no seu mapa pode ser utilizado como crédito especial na sua consulta!":
      "is processed by an exclusive engine developed under the clinical and oracular foundations of Tryv Tuath®. Furthermore, if after reading your dossier you wish to deepen your process in a live 1-on-1 session with Tryv, the amount invested in your chart can be used as a special credit toward your consultation!",

    // FAQ
    "Tire suas dúvidas": "Clear your doubts",
    "Perguntas Frequentes": "Frequently Asked Questions",
    "Como recebo o acesso após o pagamento?": "How do I receive access after payment?",
    "Imediatamente após a confirmação do pagamento, você acessa nossa":
      "Immediately after payment confirmation, you access our",
    "). Lá você preenche seu Nome Completo de Batismo, Data, Hora e Local de Nascimento e responde ao questionário de padrões emocionais, amorosos, profissionais e arquetípicos. Ao finalizar, o seu PDF personalizado é gerado na tela para download na hora!":
      "). There you enter your Full Birth Name, Date, Time, and Place of Birth and answer the questionnaire on emotional, romantic, professional, and archetypal patterns. Upon completion, your personalized PDF is generated on screen for instant download!",
    "E se eu não souber a minha hora exata de nascimento ou meu Eneagrama?":
      "What if I don't know my exact birth time or my Enneagram type?",
    "Não se preocupe! Na página de diagnóstico há a opção":
      "Don't worry! On the diagnostic page there is an option",
    "“Não sei a minha hora exata”": "“I don't know my exact birth time”",
    "e também um seletor intuitivo caso você não conheça seu Eneagrama — nosso motor identifica automaticamente seu arquétipo dominante a partir das suas respostas e da assinatura vibracional do seu nascimento.":
      "as well as an intuitive selector in case you don't know your Enneagram — our engine automatically identifies your dominant archetype from your answers and your birth's vibrational signature.",
    "Por que preciso informar o meu Nome Completo de Batismo?":
      "Why do I need to provide my Full Birth Name?",
    "Porque o seu nome completo de registro carrega a assinatura sonora e vibracional da sua encarnação. É a partir dele que o método mapeia a motivação profunda da sua alma, seus":
      "Because your full birth certificate name carries the sound and vibrational signature of your incarnation. From it, the method maps your soul's deep motivation, your",
    "Dons Natos": "Innate Gifts",
    "(para que você encontre um caminho mais suave na vida) e as lições cármicas que precisam ser integradas.":
      "(so that you can find a gentler path in life), and the karmic lessons that need to be integrated.",
    "Qual a diferença real entre a Análise Standard (R$ 37) e a Análise Profunda (R$ 97)?":
      "What is the real difference between the Standard Analysis (R$ 37) and the Deep Analysis (R$ 97)?",
    "entrega o diagnóstico da raiz emocional, uma seção dedicada às suas":
      "delivers the emotional root diagnosis, a section dedicated to your",
    "Relações e Afetos": "Relationships & Affections",
    ", a síntese de Eneagrama e Horóscopo Oriental,":
      ", the Enneagram and Eastern Horoscope synthesis,",
    "Soluções Práticas imediatas": "immediate Practical Solutions",
    "e um cupom especial caso queira fazer o upgrade depois. Já a":
      "and a special coupon in case you wish to upgrade later. Meanwhile, the",
    "entrega o dossiê completo e irrestrito:": "delivers the complete, unrestricted dossier:",
    "Mapa Védico Aprofundado": "In-Depth Vedic Chart",
    "(com seu momento atual e direcionamento prático),":
      "(with your current moment and practical guidance),",
    "Numerologia Kármica Completa + Análise dos Dons Natos":
      "Complete Karmic Numerology + Innate Gifts Analysis",
    ", desbloqueio da memória de vidas passadas, Canal do Dinheiro e o":
      ", past-life memory unlocking, Money Channel, and the",
    "Protocolo Alquímico de 21 Dias": "21-Day Alchemical Protocol",

    // Rodapé
    "“Mude-se e descobrirá novos outros para refletir-se.”":
      "“Change yourself and you will discover new others to reflect you.”",
    "© 2016 Tryv Tuath® · Everything is Possible — Todos os direitos reservados.":
      "© 2016 Tryv Tuath® · Everything is Possible — All rights reserved.",
    "Início": "Home",
    "Área de Diagnóstico (Pós-Compra)": "Diagnostic Area (Post-Purchase)",

    // Modal Pós-Checkout InfinitePay & Portal de Liberação
    "🔒 Validação Automática InfinitePay": "🔒 Automatic InfinitePay Validation",
    "Aguardando Confirmação do Pagamento": "Awaiting Payment Confirmation",
    "Finalize sua Análise Profunda (R$ 97)": "Complete Your Deep Analysis (R$ 97)",
    "Finalize sua Análise Standard (R$ 37)": "Complete Your Standard Analysis (R$ 37)",
    "Abrimos o checkout seguro da": "We opened the secure",
    "em uma nova guia. Informe abaixo o": "checkout in a new tab. Enter below the",
    "mesmo e-mail": "same email",
    "utilizado no pagamento para que nosso sistema identifique automaticamente a confirmação do seu":
      "used at checkout so our system can automatically identify confirmation of your",
    "PIX ou Cartão": "PIX or Card",
    "e desbloqueie sua Anamnese:": "and unlock your Intake Questionnaire:",
    "1. Seu E-mail utilizado no Checkout da InfinitePay *":
      "1. Your Email used at InfinitePay Checkout *",
    "1. Informe o mesmo E-mail utilizado no Checkout da InfinitePay *":
      "1. Enter the same Email used at InfinitePay Checkout *",
    "seuemail@exemplo.com": "youremail@example.com",
    "2. Código da Transação / Pedido ou Link do Comprovante (InfinitePay / PIX) *":
      "2. Transaction / Order Code or Receipt Link (InfinitePay / PIX) *",
    "Ex.: link do recibo ou código/ID da transação PIX/Cartão…":
      "E.g.: receipt link or PIX/Card transaction code/ID…",
    "Ex.: link do recibo InfinitePay ou código/ID da transação PIX/Cartão…":
      "E.g.: InfinitePay receipt link or PIX/Card transaction code/ID…",
    "Validar Pagamento": "Validate Payment",
    "💠 Prefere pagar via Chave Pix direta?": "💠 Prefer to pay via direct Pix Key?",
    "💠 Prefere pagar via Chave Pix direta (R$ 97 Profunda / R$ 37 Standard)?":
      "💠 Prefer to pay via direct Pix Key (R$ 97 Deep / R$ 37 Standard)?",
    "Chave Pix (E-mail InfinitePay):": "Pix Key (InfinitePay Email):",
    "📋 Copiar Chave Pix": "📋 Copy Pix Key",
    "✅ Chave Copiada!": "✅ Key Copied!",
    "Verificando confirmação automática via Webhook InfinitePay…":
      "Checking automatic confirmation via InfinitePay Webhook…",
    "Aguardando confirmação automática da InfinitePay (PIX ou Cartão)…":
      "Awaiting automatic confirmation from InfinitePay (PIX or Card)…",
    "🔒 Preencher Anamnese / Gerar PDF (Aguardando Pagamento…)":
      "🔒 Fill Intake / Generate PDF (Awaiting Payment…)",
    "🔒 Preencher Anamnese / Gerar PDF (Aguardando Confirmação de Pagamento…)":
      "🔒 Fill Intake / Generate PDF (Awaiting Payment Confirmation…)",
    "✦ Pagamento Confirmado! Preencher Anamnese & Gerar PDF →":
      "✦ Payment Confirmed! Fill Intake & Generate PDF →",
    "✦ Pagamento Confirmado! Preencher Anamnese / Gerar PDF →":
      "✦ Payment Confirmed! Fill Intake / Generate PDF →",
    "✦ Modo Mestra Ativo! Preencher Anamnese / Gerar PDF →":
      "✦ Master Mode Active! Fill Intake / Generate PDF →",
    "✅ Pagamento Validado com Sucesso": "✅ Payment Successfully Validated",
    "✅ Modo Mestra Ativo · Acesso Ilimitado": "✅ Master Mode Active · Unlimited Access",
    "✅ Pagamento Validado · Acesso Liberado": "✅ Payment Validated · Access Unlocked",
    "↗ Abrir Checkout da InfinitePay Novamente": "↗ Open InfinitePay Checkout Again",
    "Voltar para a página": "Return to page",
    "Digite seu e-mail acima para rastrear seu pagamento automaticamente.":
      "Enter your email above to track your payment automatically.",
    "Informe seu e-mail e o código/link do comprovante da InfinitePay acima para liberar…":
      "Enter your email and the InfinitePay receipt code/link above to unlock…",
    "Informe seu e-mail e o código/link do comprovante da InfinitePay acima para liberar o botão…":
      "Enter your email and the InfinitePay receipt code/link above to unlock the button…",
    "Aguardando confirmação da InfinitePay… (Cole no campo 2 o código ou link do comprovante para liberar na hora)":
      "Awaiting InfinitePay confirmation… (Paste the receipt code or link in field 2 to unlock immediately)",
    "⚠ Por favor, digite o e-mail usado no pagamento e o código/link do comprovante InfinitePay.":
      "⚠ Please enter the email used for payment and the InfinitePay receipt code/link.",
    "⚠ Digite seu e-mail e o código/link do comprovante da InfinitePay.":
      "⚠ Please enter your email and the InfinitePay receipt code/link.",
    "⚠ Cole no campo 2 o código/ID da transação ou o link do comprovante exibido na InfinitePay (ou no seu PIX) para liberar imediatamente.":
      "⚠ Paste in field 2 the transaction code/ID or receipt link shown on InfinitePay (or on your PIX) to unlock immediately.",

    // Modal Modo Mestra (pagamento-guardiao.js)
    "✦ Acesso Mestra": "✦ Master Access",
    "Fechar": "Close",
    "Informe sua senha administrativa para liberar o acesso direto sem checkout:":
      "Enter your administrative password to unlock direct access without checkout:",
    "Digite sua senha": "Enter your password",
    "Senha inválida. Verifique e tente novamente.": "Invalid password. Please check and try again.",
    "✦ Validar Acesso Mestra": "✦ Validate Master Access",
    "✓ Modo Mestra ativo · Escolha qual modalidade deseja abrir sem pagamento:":
      "✓ Master Mode active · Choose which tier you want to open without payment:",
    "✦ STANDARD — Diagnóstico Standard": "✦ STANDARD — Standard Diagnosis",
    "✦ COMPLETO — Análise Profunda": "✦ COMPLETE — Deep Analysis",
    "Encerrar sessão Modo Mestra": "End Master Mode session",
    "✦ Mestra": "✦ Master",
    "Portais": "Portals",
    "Desbloqueio": "Unlocking",
    "Completo": "Complete",
    "Sair do Modo Mestra": "Exit Master Mode",

    // Diagnostico.html — Cabeçalho e Bloqueio
    "Portal de Coleta & Diagnóstico Sagrado": "Sacred Intake & Diagnostic Portal",
    "Preencha com calma e sinceridade. O sistema cruzará seus dados de nascimento e seu Nome de Batismo com suas respostas para gerar o seu":
      "Fill in calmly and honestly. The system will cross-reference your birth data and Full Birth Name with your answers to generate your",
    "PDF Personalizado do Desbloqueio Invisível": "Personalized Invisible Unlocking PDF",
    "Modalidade da Análise": "Analysis Tier",
    "✦ Nota Importante sobre a Versão Standard vs. Análise Profunda:":
      "✦ Important Note on Standard Version vs. Deep Analysis:",
    "Você está visualizando a modalidade": "You are viewing the",
    "Standard (R$ 37)": "Standard (R$ 37)",
    ". Saiba que, por um": "tier. Please note that for a",
    ", você pode ter acesso à": ", you can gain access to the",
    "e a um": "and a",
    "(incluindo mapeamento de raízes familiares, ansiedade, Mapa Védico do momento atual, Numerologia Kármica completa, Dons Natos e Protocolo de 21 Dias) para compreender melhor a si mesma e os seus caminhos de melhoria.":
      "(including mapping of family roots, anxiety, Current Moment Vedic Chart, complete Karmic Numerology, Innate Gifts, and 21-Day Protocol) to better understand yourself and your paths of improvement.",
    "Regra Especial de Desconto por Indicação (5 Pessoas):":
      "Special Referral Discount Rule (5 People):",
    "Caso você adquira a versão Standard agora e posteriormente queira fazer o upgrade para o pacote completo da":
      "If you purchase the Standard version now and later wish to upgrade to the complete package of the",
    "Análise Profunda": "Deep Analysis",
    ", se você": ", if you",
    "que realizem a análise, você ganha um": "who complete the analysis, you earn a",
    "✦ Alternar para Análise Profunda e Questionário Robusto":
      "✦ Switch to Deep Analysis & Robust Questionnaire",
    "↗ Adquirir Análise Profunda na InfinitePay": "↗ Purchase Deep Analysis on InfinitePay",
    "👩‍⚕️ Direção Profissional — Tryv Tuath®:": "👩‍⚕️ Professional Direction — Tryv Tuath®:",
    "Psicanalista formada em": "Psychoanalyst trained in",
    "traumas familiares, ansiedade e depressão": "family trauma, anxiety, and depression",
    ", e mentora especializada em guiar a superação de desafios através de":
      ", and mentor specialized in guiding you through overcoming challenges via",
    "⚖ Aviso Ético:": "⚖ Ethical Notice:",
    "Nenhuma destas ferramentas automatizadas substitui a análise individual de um profissional.":
      "None of these automated tools replace individualized analysis with a qualified professional.",
    "🔒 Acesso Protegido · Validação InfinitePay": "🔒 Protected Access · InfinitePay Validation",
    "Liberação da Anamnese & Registro Akáshico / Desbloqueio":
      "Intake Questionnaire & Akashic / Unlocking Access",
    "Para proteger a exclusividade do método, o formulário de anamnese e a geração do seu PDF são liberados":
      "To protect the exclusivity of the method, the intake form and your PDF generation are unlocked",
    "automaticamente": "automatically",
    "assim que o sistema confirma o seu pagamento via":
      "as soon as the system confirms your payment via",
    "PIX ou Cartão na InfinitePay": "PIX or Card on InfinitePay",
    "3. Ainda não concluiu? Abra o Checkout da InfinitePay em nova aba:":
      "3. Haven't finished yet? Open the InfinitePay Checkout in a new tab:",
    "✦ Pagar Análise Profunda (R$ 97) ↗": "✦ Pay Deep Analysis (R$ 97) ↗",
    "Pagar Análise Standard (R$ 37) ↗": "Pay Standard Analysis (R$ 37) ↗",

    // Diagnostico.html — Etapas Barra
    "Progresso do preenchimento": "Completion progress",
    "Dados de Nascimento": "Birth Details",
    "Relacionamentos": "Relationships",
    "Profissional & PDF": "Career & PDF",

    // Etapa 1
    "Etapa 1 de 4 · Código de Encarnação": "Step 1 of 4 · Incarnation Code",
    "Seus Dados Sagrados de Batismo e Nascimento": "Your Sacred Birth & Baptism Details",
    "Estes dados alimentam o cálculo astronômico ocidental, o zodíaco sideral védico (Lahiri), a gematria numerológica e a sua Matriz do Destino.":
      "These details feed the Western astronomical calculation, the Vedic sidereal zodiac (Lahiri), numerological gematria, and your Destiny Matrix.",
    "Nome Completo de Batismo (como consta na Certidão de Nascimento) *":
      "Full Birth Name (exactly as on your Birth Certificate) *",
    "Importante: use o nome de solteira/certidão de nascimento, sem abreviações, para o cálculo exato das vogais, consoantes e Lições Cármicas.":
      "Important: use your maiden/birth certificate name, without abbreviations, for the exact calculation of vowels, consonants, and Karmic Lessons.",
    "Ex.: Ana Beatriz de Oliveira Santos": "E.g.: Ana Beatriz de Oliveira Santos",
    "Seu Melhor E-mail *": "Your Best Email *",
    "Seu WhatsApp com DDD *": "Your WhatsApp / Phone Number *",
    "Hora de Nascimento": "Time of Birth",
    "Não sei a hora exata (usar Mapa Solar do meio-dia)":
      "I don't know the exact time (use Noon Solar Chart)",
    "Cidade de Nascimento *": "City of Birth *",
    "Outra cidade (digitar)…": "Other city (type manually)…",
    "Digite a Cidade / Estado / País": "Enter City / State / Country",
    "Ex.: Uberaba, MG, Brasil": "E.g.: Miami, FL, USA",
    "Buscar": "Search",
    "Buscando coordenadas astronômicas…": "Searching astronomical coordinates…",
    "🔒 Seus dados são processados com sigilo absoluto.":
      "🔒 Your data is processed in absolute confidentiality.",
    "Avançar para Padrões Emocionais →": "Continue to Emotional Patterns →",

    // Etapa 2
    "Etapa 2 de 4 · Eixo I: Inconsciente, Lua & Quíron":
      "Step 2 of 4 · Axis I: Unconscious, Moon & Chiron",
    "Diagnóstico de Padrões Emocionais": "Diagnosis of Emotional Patterns",
    "Marque a alternativa que mais ressoa com o que você vem sentindo nos últimos meses:":
      "Select the option that resonates most with what you have been feeling in recent months:",
    "1. Qual emoção ou sensação recorrente mais drena a sua energia vital hoje? *":
      "1. Which recurring emotion or sensation drains your vital energy the most today? *",
    "Exaustão da Forte:": "Strong-Woman Exhaustion:",
    "Sensação de precisar dar conta de tudo sozinha e não ter colo quando cansa.":
      "Feeling like you have to handle everything alone with no one to hold you when you get tired.",
    "Ansiedade e Controle:": "Anxiety & Control:",
    "Mente que não desliga, antecipando problemas e tentando controlar cada detalhe.":
      "A mind that never switches off, anticipating problems and trying to control every detail.",
    "Culpa e Autossabotagem:": "Guilt & Self-Sabotage:",
    "Sempre que começo a me escolher ou brilhar, uma culpa interna me puxa de volta.":
      "Whenever I start choosing myself or shining, an internal guilt pulls me back.",
    "Desconexão e Exílio:": "Disconnection & Exile:",
    "Sentir-se uma estranha no ninho, mesmo rodeada de pessoas ou da própria família.":
      "Feeling like an outsider, even when surrounded by people or your own family.",
    "2. Como você costuma reagir quando entra em crise ou pressão emocional? *":
      "2. How do you usually react when facing an emotional crisis or pressure? *",
    "Isolamento na Caverna:": "Cave Isolation:",
    "Eu me fecho, não peço ajuda a ninguém e engulo o que estou sentindo.":
      "I shut down, ask no one for help, and swallow what I am feeling.",
    "Paralisia por Sobrecarga:": "Overload Paralysis:",
    "Sinto um peso no peito e travo nas tarefas que sei que precisava fazer.":
      "I feel a weight on my chest and freeze on tasks I know I need to do.",
    "Fuga pela Hiperatividade:": "Hyperactivity Escape:",
    "Ocupo 100% do meu tempo resolvendo a vida alheia ou trabalhando até esgotar.":
      "I fill 100% of my time solving other people's lives or working until exhaustion.",
    "3. Qual ferida emocional parece ter raiz mais antiga na sua história? *":
      "3. Which emotional wound seems to have the deepest root in your story? *",
    "Injustiça e Perfeccionismo:": "Injustice & Perfectionism:",
    "Sentir que só sou valorizada quando sou útil, forte e não dou trabalho.":
      "Feeling that I am only valued when I am useful, strong, and cause no trouble.",
    "Abandono e Desamparo:": "Abandonment & Helplessness:",
    "Medo profundo de depender de alguém e ser deixada na mão.":
      "Deep fear of depending on someone and being let down.",
    "Rejeição:": "Rejection:",
    "Medo de dizer 'não' ou mostrar minha verdade e ser excluída.":
      "Fear of saying 'no' or showing my truth and being excluded.",
    "Traição e Desconfiança:": "Betrayal & Distrust:",
    "Estado constante de alerta para não ser enganada novamente.":
      "Constant state of alert so as not to be deceived again.",
    "✦ Questionário Robusto · Mapeamento Clínico-Oracular":
      "✦ Robust Questionnaire · Clinical-Oracular Mapping",
    "Dinâmicas Familiares, Ansiedade & Sobrecarga Psíquica":
      "Family Dynamics, Anxiety & Psychic Overload",
    "Estas perguntas aprofundadas mapeiam como padrões transgeracionais e tensões emocionais operam no seu campo:":
      "These in-depth questions map how transgenerational patterns and emotional tensions operate in your field:",
    "4. Na sua história familiar (mãe, pai e ancestralidade), qual dinâmica mais marcou a sua formação emocional?":
      "4. In your family history (mother, father, and ancestry), which dynamic shaped your emotional development the most?",
    "Amadurecimento Precoce (Parentificação):": "Early Maturation (Parentification):",
    "Tive que ser adulta cedo demais e sustentar o emocional da família.":
      "I had to grow up too soon and carry the family's emotional weight.",
    "Amor Condicionado ao Desempenho:": "Performance-Conditioned Love:",
    "Crítica ou frieza emocional que gerou medo constante de errar.":
      "Criticism or emotional coldness that created a constant fear of making mistakes.",
    "Herança de Sacrifício Feminino:": "Legacy of Female Sacrifice:",
    "Mulheres do clã que carregaram fardos pesados e anularam os próprios sonhos.":
      "Women in the family line who carried heavy burdens and annulled their own dreams.",
    "5. Como a ansiedade, o desânimo ou o esgotamento mais se manifestam no seu corpo e rotina hoje?":
      "5. How do anxiety, discouragement, or exhaustion manifest most in your body and routine today?",
    "Hipervigilância e Sono Não Reparador:": "Hypervigilance & Non-Restorative Sleep:",
    "Dificuldade em relaxar de verdade; sensação de estar sempre devendo algo.":
      "Difficulty truly relaxing; feeling like you always owe something.",
    "Ciclos de Exaustão e Apatia:": "Cycles of Exhaustion & Apathy:",
    "Fases em que entrego tudo seguidas por esgotamento profundo e vontade de sumir.":
      "Phases of giving everything followed by deep burnout and a desire to disappear.",
    "Tensão Somática e Silêncio:": "Somatic Tension & Silence:",
    "Aperto no peito ou nó na garganta por calar o que sinto para manter a paz.":
      "Tightness in the chest or a lump in the throat from silencing what I feel to keep the peace.",
    "6. (Opcional) Quer desabafar em uma frase o que mais pesa no seu coração hoje?":
      "6. (Optional) Would you like to share in one sentence what weighs most on your heart today?",
    "Escreva livremente se desejar…": "Write freely if you wish…",
    "← Voltar": "← Back",
    "Avançar para Relacionamentos →": "Continue to Relationships →",

    // Etapa 3
    "Etapa 3 de 4 · Eixo II: Vênus, Lilith & Linha do Amor":
      "Step 3 of 4 · Axis II: Venus, Lilith & Love Line",
    "Diagnóstico de Padrões de Relacionamento": "Diagnosis of Relationship Patterns",
    "Vamos identificar onde sua energia feminina e seu Canal do Amor na Matriz do Destino estão sendo bloqueados:":
      "Let's identify where your feminine energy and your Love Channel in the Destiny Matrix are being blocked:",
    "1. Qual opção melhor descreve seu momento afetivo atual? *":
      "1. Which option best describes your current romantic moment? *",
    "Solteira seletiva ou cansada:": "Selective or tired single:",
    "Quero um amor real, mas parece que só aparecem pessoas confusas ou indisponíveis.":
      "I want real love, but it seems only confused or unavailable people show up.",
    "Em relacionamento com desgaste:": "In a strained relationship:",
    "Amo ou tenho vínculo, mas sinto que carrego a relação ou não sou compreendida.":
      "I love or have a bond, yet I feel I carry the relationship alone or am not understood.",
    "Laço com o passado:": "Tied to the past:",
    "Ainda sinto um cordão energético ou mágoa com alguém que já passou pela minha vida.":
      "I still feel an energetic cord or hurt connected to someone from my past.",
    "Coração blindado:": "Armored heart:",
    "Coloquei uma armadura de independência para ninguém mais me machucar.":
      "I put on an armor of independence so no one can hurt me again.",
    "2. Qual padrão mais se repetiu na sua história amorosa? *":
      "2. Which pattern has repeated the most in your romantic history? *",
    "Complexo de Salvadora:": "Savior Complex:",
    "Ajudo o outro a crescer, sustento emocionalmente, mas recebo migalhas de volta.":
      "I help the other person grow and support them emotionally, but receive crumbs in return.",
    "Ímã de Indisponíveis:": "Magnet for the Unavailable:",
    "Começa intenso como um filme, mas logo a pessoa esfria, some ou evita compromisso.":
      "It starts as intense as a movie, but soon the person grows cold, disappears, or avoids commitment.",
    "Choque de Força:": "Power Clash:",
    "Homens/parceiros que parecem competir comigo ou se acomodam na minha força.":
      "Partners who seem to compete with me or lean passively on my strength.",
    "Autossabotagem da Entrega:": "Surrender Self-Sabotage:",
    "Quando alguém bom se aproxima de verdade, eu mesma encontro defeitos ou me afasto.":
      "When someone good truly gets close, I find flaws or pull away myself.",
    "Avançar para Profissional & Financeiro →": "Continue to Career & Finances →",

    // Etapa 4
    "Etapa 4 de 4 · Eixo III & Arquétipos: Prosperidade, Eneagrama & Alquimia Oriental":
      "Step 4 of 4 · Axis III & Archetypes: Prosperity, Enneagram & Eastern Alchemy",
    "Diagnóstico Vocacional, Eneagrama & Horóscopo Chinês":
      "Vocational Diagnosis, Enneagram & Chinese Horoscope",
    "Última etapa antes de gerarmos o seu Dossiê Completo do Desbloqueio Invisível:":
      "Final step before we generate your Complete Invisible Unlocking Dossier:",
    "1. Qual frase define com mais precisão a sua trava profissional e financeira hoje? *":
      "1. Which statement most accurately defines your professional and financial block today? *",
    "Teto Invisível e Vazamento:": "Invisible Ceiling & Financial Leak:",
    "Eu ganho, mas parece que nunca sobra na proporção do meu esforço.":
      "I earn money, yet it seems there is never enough left in proportion to my effort.",
    "Trava de Visibilidade e Preço:": "Visibility & Pricing Block:",
    "Sei que sou boa no que faço, mas tenho dificuldade de me expor e cobrar caro.":
      "I know I am good at what I do, but I struggle to put myself out there and charge my worth.",
    "Chamado de Transição:": "Call to Transition:",
    "Sinto que nasci para algo maior, mas tenho medo de arriscar e perder a segurança.":
      "I feel I was born for something greater, but I am afraid to take risks and lose security.",
    "Montanha-Russa Financeira:": "Financial Rollercoaster:",
    "Momentos de pico seguidos por quedas de energia e estagnação.":
      "Peak moments followed by drops in energy and stagnation.",
    "2. Qual crença ou comportamento mais sabota a sua prosperidade? *":
      "2. Which belief or behavior sabotages your prosperity the most? *",
    "Crença do Esforço Penoso:": "Belief in Painful Struggle:",
    "Sentir que só mereço ganhar se for suado, difícil e carregado nas minhas costas.":
      "Feeling that I only deserve to earn if it is exhausting, hard, and carried on my back.",
    "Síndrome da Eterna Aluna:": "Eternal Student Syndrome:",
    "Acumular conhecimento e adiar o lançamento ou a cobrança justa.":
      "Accumulating knowledge while postponing launching or charging fairly.",
    "Lealdade Familiar:": "Family Loyalty:",
    "Medo inconsciente de crescer ou acabar tendo que sustentar problemas alheios.":
      "Unconscious fear of outgrowing my family or having to carry others' problems.",
    "3. Qual é a sua Meta Nº 1 de Desbloqueio para os próximos 90 dias? *":
      "3. What is your #1 Unlocking Goal for the next 90 days? *",
    "Ex.: Destravar minha vida financeira, lançar meu projeto e viver um relacionamento recíproco":
      "E.g.: Unblock my financial life, launch my project, and experience a reciprocal relationship",
    "Romper meu teto financeiro, recuperar minha paz emocional e destravar meus caminhos":
      "Break through my financial ceiling, recover my emotional peace, and unlock my paths",
    "✦ Módulo de Arquétipos Integrados": "✦ Integrated Archetypes Module",
    "Eneagrama Sagrado & Alquimia Oriental (Horóscopo Chinês)":
      "Sacred Enneagram & Eastern Alchemy (Chinese Horoscope)",
    "Estes dados opcionais permitem cruzar seu tipo de personalidade e sua assinatura elemental chinesa no seu relatório e PDF:":
      "These optional details allow us to cross-reference your personality type and your Chinese elemental signature in your report and PDF:",
    "4. Você já conhece o seu Tipo no Eneagrama?": "4. Do you already know your Enneagram Type?",
    "Se não souber, deixe na 1ª opção que calcularemos automaticamente pela sua resposta ao lado e pela sua Alma.":
      "If you don't know, leave the 1st option selected and we will calculate it automatically from your answer next to it and your Soul number.",
    "✦ Não sei meu Tipo — calcular automaticamente para mim":
      "✦ I don't know my Type — calculate automatically for me",
    "Tipo 1 — A Perfeccionista / Reformadora Ética": "Type 1 — The Perfectionist / Ethical Reformer",
    "Tipo 2 — A Prestativa / Doadora Magnética": "Type 2 — The Helper / Magnetic Giver",
    "Tipo 3 — A Realizadora / Alta Performance": "Type 3 — The Achiever / High Performer",
    "Tipo 3 — A Realizadora / Estrela de Alta Performance": "Type 3 — The Achiever / High-Performance Star",
    "Tipo 4 — A Individualista / Alquimista da Profundidade":
      "Type 4 — The Individualist / Alchemist of Depth",
    "Tipo 5 — A Investigadora / Sábia Analítica": "Type 5 — The Investigator / Analytical Sage",
    "Tipo 5 — A Investigadora / Sábia Observadora": "Type 5 — The Investigator / Observant Sage",
    "Tipo 6 — A Leal / Estrategista Precavida": "Type 6 — The Loyalist / Cautious Strategist",
    "Tipo 6 — A Leal / Guardiã da Segurança": "Type 6 — The Loyalist / Guardian of Security",
    "Tipo 7 — A Entusiasta / Visionária Livre": "Type 7 — The Enthusiast / Free Visionary",
    "Tipo 8 — A Desafiadora / Soberana Protetora": "Type 8 — The Challenger / Protective Sovereign",
    "Tipo 9 — A Pacificadora / Mediadora Harmônica": "Type 9 — The Peacemaker / Harmonic Mediator",
    "Tipo 9 — A Pacificadora / Mediadora da Harmonia": "Type 9 — The Peacemaker / Mediator of Harmony",
    "5. Qual impulso inconsciente mais governa você?":
      "5. Which unconscious drive governs you the most?",
    "Ajuda a calibrar a raiz do seu Eneatipo e a sua virtude de cura no diagnóstico.":
      "Helps calibrate the root of your Enneatype and your healing virtue in the diagnosis.",
    "Cuidar de todos e ser indispensável para quem amo (Coração)":
      "Taking care of everyone and being indispensable to those I love (Heart)",
    "Fazer tudo com perfeição impecável e não cometer erros (Ordem)":
      "Doing everything with impeccable perfection and making no mistakes (Order)",
    "Realizar metas, ser eficiente e reconhecida pelo meu valor (Brilho)":
      "Achieving goals, being efficient, and being recognized for my value (Brilliance)",
    "Ser autêntica, profunda e viver conexões com alma (Essência)":
      "Being authentic, deep, and living soulful connections (Essence)",
    "Compreender tudo a fundo e preservar minha energia e espaço (Mente)":
      "Understanding everything deeply and preserving my energy and space (Mind)",
    "Ter segurança, prever riscos e proteger quem caminha comigo (Lealdade)":
      "Having security, foreseeing risks, and protecting those who walk with me (Loyalty)",
    "Sentir liberdade, entusiasmo e abrir novos horizontes (Expansão)":
      "Feeling freedom, enthusiasm, and opening new horizons (Expansion)",
    "Manter minha força, autonomia e nunca ficar vulnerável (Soberania)":
      "Maintaining my strength, autonomy, and never being vulnerable (Sovereignty)",
    "Manter a paz, evitar conflitos desgastantes e preservar a harmonia (União)":
      "Keeping the peace, avoiding draining conflicts, and preserving harmony (Union)",
    "6. Alquimia Oriental (Horóscopo Chinês & 5 Elementos)":
      "6. Eastern Alchemy (Chinese Horoscope & 5 Elements)",
    "✦ Seu animal e elemento natal serão calculados com precisão astronômica pelo calendário lunar chinês da sua data de nascimento.":
      "✦ Your natal animal and element will be calculated with astronomical precision from the Chinese lunar calendar of your birth date.",
    "Equilibrar minha energia pelo meu Elemento Natal de Nascimento (Recomendado)":
      "Balance my energy through my Natal Birth Element (Recommended)",
    "Sinto falta do Elemento Madeira (expansão criativa, novos começos e destravar projetos)":
      "I lack the Wood Element (creative expansion, new beginnings, and unblocking projects)",
    "Sinto falta do Elemento Fogo (entusiasmo, magnetismo, carisma e alegria vital)":
      "I lack the Fire Element (enthusiasm, magnetism, charisma, and vital joy)",
    "Sinto falta do Elemento Terra (aterramento, segurança material e constância)":
      "I lack the Earth Element (grounding, material security, and consistency)",
    "Sinto falta do Elemento Metal (foco, corte de laços tóxicos e organização)":
      "I lack the Metal Element (focus, cutting toxic ties, and organization)",
    "Sinto falta do Elemento Água (intuição profunda, fluidez emocional e descanso)":
      "I lack the Water Element (deep intuition, emotional fluidity, and rest)",
    "✦ Processar Meu Mapa & Gerar Meu PDF Agora":
      "✦ Process My Chart & Generate My PDF Now",

    // Loading & Resultado Barra
    "Consagrando e Calculando Seu Mapa…": "Consecrating & Calculating Your Chart…",
    "Calculando Efemérides Astronômicas (Sol, Lua, Quíron, Lilith e Saturno)…":
      "Calculating Astronomical Ephemerides (Sun, Moon, Chiron, Lilith, and Saturn)…",
    "Calculando Efemérides Astronômicas & Sombra Astral…":
      "Calculating Astronomical Ephemerides & Astral Shadow…",
    "Consultando o Mapa Védico Sideral, Momento Atual & Direcionamento…":
      "Consulting the Sidereal Vedic Chart, Current Moment & Guidance…",
    "Decodificando Numerologia Kármica, Nome de Batismo & Dons Natos…":
      "Decoding Karmic Numerology, Birth Name & Innate Gifts…",
    "Cruzando Matriz do Destino, Eneagrama & Alquimia Oriental…":
      "Cross-Referencing Destiny Matrix, Enneagram & Eastern Alchemy…",
    "Diagramando seu Dossiê Personalizado em PDF…":
      "Formatting your Personalized PDF Dossier…",
    "✦ Seu Dossiê do Desbloqueio Invisível Está Pronto!":
      "✦ Your Invisible Unlocking Dossier Is Ready!",
    "Clique no botão dourado ao lado para baixar seu arquivo PDF personalizado.":
      "Click the golden button beside this message to download your personalized PDF file.",
    "⬇ Baixar Meu PDF Personalizado": "⬇ Download My Personalized PDF",
    "⏳ Gerando PDF…": "⏳ Generating PDF…",
    "✏️ Revisar / Alterar Respostas": "✏️ Review / Edit Answers",
    "🔄 Gerar Novo Mapa": "🔄 Generate New Chart",
    "🖨 Imprimir / Salvar A4": "🖨 Print / Save A4",
    "💬 Enviar Código para a Tryv": "💬 Send Code to Tryv",

    // Alertas e Mensagens de Rede
    "Por favor, informe seu Nome Completo de Batismo.":
      "Please enter your Full Birth Name.",
    "Por favor, informe sua Data de Nascimento.":
      "Please enter your Date of Birth.",
    "⚡ Conexão instável detectada: suas respostas estão preservadas nesta sessão. Você pode continuar preenchendo normalmente.":
      "⚡ Unstable connection detected: your answers are preserved in this session. You may continue filling out the form normally.",
    "✅ Conexão restabelecida! Suas respostas foram mantidas de onde você parou.":
      "✅ Connection restored! Your answers were kept right where you left off.",

    // Títulos e Rótulos do Dossiê na Tela e no PDF
    "Sol & Essência": "Sun & Essence",
    "Lua & Inconsciente": "Moon & Unconscious",
    "Ascendente & Persona": "Ascendant & Persona",
    "Mapa Solar": "Solar Chart",
    "Hora não informada": "Birth time not provided",
    "Ferida Primordial (Quíron)": "Primal Wound (Chiron)",
    "Ponto de cura emocional": "Emotional healing point",
    "Mansão Lunar Védica": "Vedic Lunar Mansion",
    "Numerologia & Dons Natos": "Numerology & Innate Gifts",
    "Cauda Cármica (Vidas Passadas)": "Karmic Tail (Past Lives)",
    "Eneagrama Sagrado": "Sacred Enneagram",
    "Horóscopo Chinês & Elemento": "Chinese Horoscope & Element",
    "Síntese do Seu Bloqueio Invisível Mestre": "Synthesis of Your Master Invisible Block",
    "Dimensão I · Gematria do Nome de Certidão & Dons de Berço":
      "Dimension I · Birth Certificate Name Gematria & Innate Gifts",
    "Onde mora o bloqueio:": "Where the block resides:",
    "🌿 Guia Para um Caminho Mais Suave (Fluxo de Menor Resistência)":
      "🌿 Guide to a Gentler Path (Path of Least Resistance)",
    "Plenitude Vibracional no Nome de Batismo (1 a 9 Presentes)":
      "Vibrational Fullness in the Birth Name (1 to 9 Present)",
    "Todas as 9 vibrações numéricas estão presentes nas letras do seu nome de batismo — você já trouxe todas as ferramentas internas e precisa apenas direcionar o foco sem dispersão.":
      "All 9 numerical vibrations are present in the letters of your birth name — you already brought all internal tools and only need to direct your focus without dispersion.",
    "Ausência de Dívidas Cármicas Transgeracionais Penalizadoras":
      "Absence of Penalizing Transgenerational Karmic Debts",
    "Suas trilhas principais (Alma, Expressão, Destino e Dia Natal) estão livres de penalidades numéricas rígidas do passado. Suas travas atuais vêm da sobrecarga de tentar se adaptar a expectativas menores que a sua alma.":
      "Your main pathways (Soul, Expression, Destiny, and Birth Day) are free from rigid numerical penalties from the past. Your current blocks stem from the overload of trying to adapt to expectations smaller than your soul.",
    "Dimensão II · Psicodinâmica & Alquimia Oriental":
      "Dimension II · Psychodynamics & Eastern Alchemy",
    "Raiz Inconsciente:": "Unconscious Root:",
    "Virtude de Cura:": "Healing Virtue:",
    "Nas Relações e Afetos:": "In Relationships & Affections:",
    "Na Vocação e Dinheiro:": "In Vocation & Money:",
    "Caminho de Integração:": "Integration Path:",
    "Sombra Sob Estresse:": "Shadow Under Stress:",
    "Chave de Equilíbrio Elemental:": "Elemental Balance Key:",
    "Dimensão III · Os 22 Arcanos Maiores": "Dimension III · The 22 Major Arcana",
    "Sombra do Centro (Quando Você Trava):": "Center Shadow (When You Freeze):",
    "Memória de Outras Vidas:": "Past-Life Memory:",
    "Como Isso Trava Você Hoje:": "How This Blocks You Today:",
    "Chave de Libertação:": "Liberation Key:",
    "Diagnóstico Cruzado · Eixo I (Emoções & Inconsciente)":
      "Cross-Referenced Diagnosis · Axis I (Emotions & Unconscious)",
    "Chave de Virada Emocional": "Emotional Turning Key",
    "Dimensões IV & V · Jyotish Sideral Aprofundado & Astrologia da Sombra":
      "Dimensions IV & V · In-Depth Sidereal Jyotish & Shadow Astrology",
    "Sol Sideral:": "Sidereal Sun:",
    "Regente Natal:": "Natal Ruler:",
    "Divindade:": "Deity:",
    "Símbolo Sagrado:": "Sacred Symbol:",
    "Diagnóstico Raiz da Alma:": "Soul Root Diagnosis:",
    "🧭 Direcionamento Prático Védico (O Que Fazer Agora)":
      "🧭 Practical Vedic Guidance (What to Do Now)",
    "Astro / Ponto": "Planet / Point",
    "Signo Tropical": "Tropical Sign",
    "Grau": "Degree",
    "Casa": "House",
    "Papel no Desbloqueio": "Role in Unlocking",
    "Diagnóstico Cruzado · Eixos II & III": "Cross-Referenced Diagnosis · Axes II & III",
    "Chave de Desbloqueio no Amor e Afetos": "Unlocking Key in Love & Affections",
    "Chave de Desbloqueio da Prosperidade": "Prosperity Unlocking Key",
    "Prescrição Alquímica & Psicomágica": "Alchemical & Psychomagical Prescription",
    "Protocolo Tryv Tuath® de Desbloqueio em 21 Dias":
      "Tryv Tuath® 21-Day Unlocking Protocol",
    "💎 Cristal de Ancoragem:": "💎 Anchoring Crystal:",
    "✨ Decreto Pessoal de Reprogramação (Repetir ao acordar por 21 dias)":
      "✨ Personal Reprogramming Decree (Repeat upon waking for 21 days)",
    "Diagnóstico Cruzado · Eixo II (Relações, Afetos & Vínculos)":
      "Cross-Referenced Diagnosis · Axis II (Relationships, Affections & Bonds)",
    "Chave de Desbloqueio em Relações & Afetos":
      "Unlocking Key in Relationships & Affections",
    "Direcionamento Aplicado · Soluções Práticas": "Applied Guidance · Practical Solutions",
    "Soluções Práticas Imediatas Para o Seu Desbloqueio":
      "Immediate Practical Solutions for Your Unlocking",
    "✨ Seu Decreto de Alinhamento Vibracional Tryv Tuath®":
      "✨ Your Tryv Tuath® Vibrational Alignment Decree",
    "✦ Oportunidade Exclusiva de Upgrade · Clientes Standard":
      "✦ Exclusive Upgrade Opportunity · Standard Clients",
    "🤝 Regra Especial de Desconto por Indicação (5 Pessoas)":
      "🤝 Special Referral Discount Rule (5 People)",
    "✦ Desbloquear Análise Profunda Agora": "✦ Unlock Deep Analysis Now",
    "Fundamentos & Sabedoria Milenar · Desmistificando os Sistemas do Seu Mapa":
      "Foundations & Ancient Wisdom · Demystifying the Systems of Your Chart",
    "A Ciência por Trás do Seu Dossiê: Astrologia Tropical vs. Védica, Matriz do Destino & Terapias":
      "The Science Behind Your Dossier: Tropical vs. Vedic Astrology, Destiny Matrix & Therapies",
    "✦ Acompanhamento Profissional Individual · Psicanálise, Mentoria & Oráculos":
      "✦ 1-on-1 Professional Accompaniment · Psychoanalysis, Mentoring & Oracles",
    "Sobre a Tryv Tuath® & Agendamento de Análises Aprofundadas":
      "About Tryv Tuath® & Scheduling In-Depth Analyses",
    "👩‍⚕️ Apresentação Profissional — Tryv Tuath® (Psicanalista & Mentora)":
      "👩‍⚕️ Professional Profile — Tryv Tuath® (Psychoanalyst & Mentor)",
    "⚖ Aviso Ético e de Responsabilidade Clínica":
      "⚖ Ethical & Clinical Responsibility Notice",
    "Semana 1 (Dias 1 a 7) — Desintoxicação Emocional & Corte da Cauda Cármica":
      "Week 1 (Days 1 to 7) — Emotional Detox & Cutting the Karmic Tail",
    "Semana 2 (Dias 8 a 14) — Reprogramação do Magnetismo Afetivo":
      "Week 2 (Days 8 to 14) — Reprogramming Romantic Magnetism",
    "Semana 3 (Dias 15 a 21) — Abertura do Canal do Dinheiro & Ação de Destino":
      "Week 3 (Days 15 to 21) — Opening the Money Channel & Destiny Action",

    // Fundamentos Místicos, Posicionamento e Convites Terapias
    "Astrologia Tropical (Ocidental) vs. Astrologia Védica Sideral (Jyotish): Desmistificando os Dois Céus":
      "Tropical (Western) Astrology vs. Sidereal Vedic Astrology (Jyotish): Demystifying the Two Skies",
    "O Que é a Matriz do Destino e a Geometria Sagrada dos 22 Arcanos":
      "What Is the Destiny Matrix & the Sacred Geometry of the 22 Arcana",
    "Fundamentos do Eneagrama Sagrado & Alquimia Oriental dos 5 Elementos":
      "Foundations of the Sacred Enneagram & Eastern 5-Element Alchemy",
    "A Sinergia das Terapias Utilizadas pela Tryv Tuath®":
      "The Synergy of the Therapies Used by Tryv Tuath®",
    "Terapia Individual I · Astrologia Ocidental & Védica":
      "1-on-1 Therapy I · Western & Vedic Astrology",
    "Mapa Astral Kármico & Jyotish Védico Completo com a Tryv":
      "Complete Karmic Birth Chart & Vedic Jyotish with Tryv",
    "Terapia Individual II · Geometria Sagrada dos 22 Arcanos":
      "1-on-1 Therapy II · Sacred Geometry of the 22 Arcana",
    "Leitura Completa da Matriz do Destino & Cura das Linhagens Ancestrais":
      "Complete Destiny Matrix Reading & Healing of Ancestral Lineages",
    "Terapia Individual III · Gematria, Dons Natos & Assinatura":
      "1-on-1 Therapy III · Gematria, Innate Gifts & Signature",
    "Mapa Numerológico Kármico Completo & Planejamento de Assinatura":
      "Complete Karmic Numerology Chart & Signature Planning",
    "Terapia Individual IV · Psicanálise Clínica & Mentoria por Ligação":
      "1-on-1 Therapy IV · Clinical Psychoanalysis & Phone Mentoring",
    "Mentoria Individual Trimestral ou Semestral com a Tryv Tuath®":
      "Quarterly or Semi-Annual 1-on-1 Mentoring with Tryv Tuath®",
    "AVISO ÉTICO E PROFISSIONAL: Nenhuma destas ferramentas ou leituras automatizadas substitui a análise clínica individual e o acompanhamento contínuo de um profissional qualificado.":
      "ETHICAL & PROFESSIONAL NOTICE: None of these automated tools or readings replace 1-on-1 clinical analysis and ongoing accompaniment by a qualified professional.",
    "Sobre a Mentora e Psicanalista: Tryv Tuath® é psicanalista formada em traumas familiares, ansiedade e depressão, além de mentora especializada em guiar a superação de desafios emocionais, relacionais e vocacionais através de sessões individuais estruturadas em pacotes trimestrais ou semestrais por ligações telefônicas — oferecendo escuta clínica segura, direcionamento estratégico e sigilo absoluto onde quer que você esteja.":
      "About the Mentor & Psychoanalyst: Tryv Tuath® is a psychoanalyst trained in family trauma, anxiety, and depression, as well as a mentor specialized in guiding you through overcoming emotional, relational, and vocational challenges via structured 1-on-1 sessions in quarterly or semi-annual phone packages — offering safe clinical listening, strategic direction, and absolute confidentiality wherever you are.",
    "PROGRAMA DE RECOMPENSA POR INDICAÇÃO (5 INDICAÇÕES = DESCONTO ESPECIAL NO UPGRADE): Caso você tenha adquirido a versão Standard (R$ 37) e posteriormente deseje fazer o upgrade para o pacote completo da Análise Profunda (R$ 97), se você indicar mais 5 pessoas que realizem a análise, você ganha um desconto especial exclusivo para adquirir o valor complementar do pacote completo! Basta informar ao suporte no WhatsApp da Tryv os nomes das 5 pessoas indicadas.":
      "REFERRAL REWARD PROGRAM (5 REFERRALS = SPECIAL UPGRADE DISCOUNT): If you purchased the Standard version (R$ 37) and later wish to upgrade to the complete Deep Analysis package (R$ 97), if you refer 5 more people who complete the analysis, you earn an exclusive special discount toward the complementary value of the complete package! Simply send the names of the 5 referred people to Tryv's WhatsApp support.",
    "Acesso Reservado: Desbloqueie a Análise Profunda Completa & Questionário Expandido":
      "Reserved Access: Unlock the Complete Deep Analysis & Expanded Questionnaire",
    "Por um pequeno acréscimo de investimento, acesse o questionário mais robusto e todas as camadas profundas do seu mapa.":
      "For a small additional investment, access the more robust questionnaire and all deep layers of your chart.",
    "CONDIÇÃO ESPECIAL DE UPGRADE & BÔNUS POR 5 INDICAÇÕES: Como cliente da versão Standard (R$ 37), você pode migrar para a Análise Profunda a qualquer momento. E mais: se você indicar 5 pessoas que realizem a análise, você ganha um desconto especial exclusivo no valor complementar para liberar o pacote completo da Análise Profunda!":
      "SPECIAL UPGRADE CONDITION & 5-REFERRAL BONUS: As a Standard version client (R$ 37), you can upgrade to the Deep Analysis at any time. Plus: if you refer 5 people who complete the analysis, you earn an exclusive special discount on the complementary amount to unlock the complete Deep Analysis package!",

    // Papéis dos Planetas
    "Essência e Brilho Consciente": "Essence & Conscious Brilliance",
    "Raiz Emocional e Inconsciente": "Emotional Root & Unconscious",
    "Mente e Padrão de Pensamento": "Mind & Thought Pattern",
    "Amor, Magnetismo e Valor": "Love, Magnetism & Value",
    "Ação, Desejo e Limites": "Action, Desire & Boundaries",
    "Expansão, Fé e Prosperidade": "Expansion, Faith & Prosperity",
    "Trava Kármica e Maturidade": "Karmic Block & Maturity",
    "Ruptura e Liberdade": "Breakthrough & Freedom",
    "Espiritualidade e Idealização": "Spirituality & Idealization",
    "Poder Oculto e Transmutação": "Hidden Power & Transmutation",
    "A Ferida Primordial": "The Primal Wound",
    "Sombra Reprimida e Magnetismo": "Repressed Shadow & Magnetism",
    "Missão Evolutiva Desta Vida": "Evolutionary Mission of This Life",
    "Zona de Repetição de Vidas Passadas": "Past-Life Repetition Zone",

    // Escolha a Terapia ou Mentoria
    "Escolha a Terapia ou Mentoria para Aprofundar Individualmente com a Tryv:":
      "Choose the Therapy or Mentoring to Deepen Individually with Tryv:",

    // Valores dos Radios do Questionário (interpolados no diagnóstico)
    "Exaustão profunda por carregar responsabilidades e dores de todo mundo nas costas":
      "deep exhaustion from carrying everyone else's responsibilities and pain on your back",
    "Ansiedade mental, excesso de cenários futuros e medo de perder o controle":
      "mental anxiety, excessive future scenarios, and fear of losing control",
    "Culpa silenciosa, autossabotagem e medo de ser julgada ao se priorizar":
      "silent guilt, self-sabotage, and fear of being judged when prioritizing yourself",
    "Sensação de solidão, não pertencimento e de nunca ser verdadeiramente compreendida":
      "feelings of loneliness, not belonging, and never being truly understood",
    "Isolamento na caverna: fecho o coração, engulo o choro e resolvo em silêncio":
      "cave isolation: shutting your heart, swallowing your tears, and solving everything in silence",
    "Paralisia e procrastinação por sobrecarga emocional":
      "paralysis and procrastination due to emotional overload",
    "Hiperatividade: mergulho no trabalho ou em cuidar dos outros para não olhar para a dor":
      "hyperactivity: diving into work or taking care of others to avoid looking at the pain",
    "Injustiça e Autocobrança Extrema (precisar ser perfeita e útil para merecer amor)":
      "Injustice and Extreme Self-Demand (needing to be perfect and useful to deserve love)",
    "Abandono e Falta de Amparo Emocional":
      "Abandonment and Lack of Emotional Support",
    "Rejeição e Medo de Mostrar Quem Realmente É":
      "Rejection and Fear of Showing Who You Truly Are",
    "Traição e Quebra de Confiança":
      "Betrayal and Broken Trust",
    "Inversão de papéis (parentificação): precisei amadurecer cedo demais e ser o pilar emocional da casa":
      "role reversal (parentification): having to mature too early and be the emotional pillar of the home",
    "Ambiente de crítica, exigência ou silêncio afetivo onde o amor parecia condicionado ao desempenho":
      "an environment of criticism, high demands, or emotional silence where love felt conditioned on performance",
    "Histórico familiar de sacrifício feminino, perdas bruscas ou instabilidade financeira recorrente":
      "a family history of female sacrifice, sudden losses, or recurring financial instability",
    "Mente hipervigilante, sono leve/não reparador e sensação constante de urgência":
      "a hypervigilant mind, light/non-restorative sleep, and a constant sense of urgency",
    "Oscilação entre picos de produtividade intensa e fases de queda de energia, apatia ou tristeza":
      "oscillation between peaks of intense productivity and phases of low energy, apathy, or sadness",
    "Tensão física no peito/garganta por guardar mágoas, engolir sapos e evitar conflitos":
      "physical tension in the chest/throat from holding back hurt, swallowing grievances, and avoiding conflict",
    "Solteira, sentindo que atraio apenas conexões rasas ou pessoas indisponíveis":
      "Single, feeling that you attract only shallow connections or unavailable people",
    "Em um relacionamento, mas vivendo ciclos repetitivos de desgaste e sobrecarga":
      "In a relationship, but experiencing repetitive cycles of strain and overload",
    "Solteira, mas ainda presa energeticamente a uma história mal resolvida do passado":
      "Single, but still energetically tied to an unresolved story from the past",
    "Fechada na armadura: foquei no trabalho e tranquei o coração por medo de sofrer":
      "Closed in armor: focusing on work and locking your heart away out of fear of suffering",
    "Papel de salvadora/mãe: entrego demais, curo e ajudo o parceiro, mas recebo pouco cuidado":
      "the savior/mother role: giving too much, healing and helping your partner, while receiving little care in return",
    "Atração por parceiros indisponíveis, instáveis ou que fogem de compromisso real":
      "attraction to unavailable, unstable partners who flee from real commitment",
    "Disputa de força ou intimidação: parceiros que se sentem diminuídos pela minha força":
      "power struggles or intimidation: partners who feel diminished by your strength",
    "Medo de perder a liberdade ou autossabotagem quando a relação fica séria":
      "fear of losing freedom or self-sabotaging when the relationship becomes serious",
    "Teto invisível: eu trabalho muito, o dinheiro entra, mas escorre pelas mãos com imprevistos":
      "an invisible ceiling: working hard, money coming in, yet slipping through your fingers with unexpected expenses",
    "Tenho talento e conhecimento, mas travo na hora de aparecer, vender ou cobrar o que valho":
      "having talent and knowledge, yet freezing when it is time to be seen, sell, or charge what you are worth",
    "Desalinhamento de propósito: sinto que meu trabalho atual drena minha alma e quero transição":
      "purpose misalignment: feeling that your current work drains your soul and wanting a transition",
    "Oscilação em montanha-russa: fases de ganho seguidas por fases de estagnação e cansaço":
      "rollercoaster oscillation: phases of financial gain followed by phases of stagnation and fatigue",
    "Achar que dinheiro só vem com sacrifício extremo e que eu preciso fazer tudo sozinha":
      "believing that money only comes through extreme sacrifice and that you must do everything alone",
    "Síndrome da impostora: achar que sempre preciso de mais um curso antes de estar pronta":
      "impostor syndrome: feeling you always need one more course before being ready",
    "Lealdade invisível ao clã: culpa inconsciente de prosperar mais do que minha família":
      "invisible clan loyalty: unconscious guilt about prospering more than your family",

    // SIGNOS (12 Signos: luz, sombra, quíron, lilith, saturno, vênus)
    "Pioneirismo, coragem instintiva, sinceridade visceral e força para abrir caminhos onde ninguém teve coragem.":
      "Pioneering spirit, instinctive courage, visceral honesty, and strength to open paths where no one else dared.",
    "Impaciência crônica, sensação de estar sempre lutando sozinha, explosões defensivas ou desistência quando o entusiasmo inicial baixa.":
      "Chronic impatience, feeling like you are always fighting alone, defensive outbursts, or giving up when initial enthusiasm fades.",
    "Ferida da Existência e do Direito de Ser: você sente que precisa provar seu valor o tempo todo ou pedir desculpas pela própria força. Medo oculto de se impor e ser rejeitada.":
      "Wound of Existence and the Right to Be: you feel you must prove your worth all the time or apologize for your own strength. Hidden fear of asserting yourself and being rejected.",
    "Raiva reprimida da submissão. Nas relações, você oscila entre assumir o comando absoluto ou atrair parceiros que tentam apagar seu fogo e independência.":
      "Repressed anger toward submission. In relationships, you oscillate between taking absolute command or attracting partners who try to dim your fire and independence.",
    "Bloqueio na autoafirmação: medo inconsciente de liderar, começar projetos próprios ou bancar a própria autoridade sem depender de aval alheio.":
      "Self-assertion block: unconscious fear of leading, starting your own projects, or owning your authority without depending on external approval.",
    "Ama com intensidade, paixão e pressa; precisa de admiração viva e liberdade, detestando jogos lentos ou cobranças sufocantes.":
      "You love with intensity, passion, and urgency; you need living admiration and freedom, detesting slow games or suffocating demands.",

    "Magnetismo material, constância, sensorialidade, lealdade profunda e capacidade de materializar abundância duradoura.":
      "Material magnetism, constancy, sensuality, deep loyalty, and the ability to materialize lasting abundance.",
    "Apego ao conhecido (mesmo quando dói), medo paralisante da escassez e resistência a encerrar ciclos vencidos.":
      "Attachment to the familiar (even when it hurts), paralyzing fear of scarcity, and resistance to ending expired cycles.",
    "Ferida do Merecimento e Segurança: sensação constante de que o chão pode sumir a qualquer momento. Mesmo quando conquista algo, sente que ainda não é suficiente para relaxar.":
      "Wound of Worthiness and Security: a constant feeling that the ground could vanish at any moment. Even when you achieve something, you feel it is still not enough to relax.",
    "Tensão entre prazer, posse e autovalor. Pode atrair relações onde há desequilíbrio financeiro/energético ou medo visceral de perder o controle material.":
      "Tension between pleasure, possession, and self-worth. You may attract relationships with financial/energetic imbalance or a visceral fear of losing material control.",
    "Teto financeiro por excesso de cautela: você trabalha duro, mas carrega o medo ancestral da falta, travando saltos maiores de prosperidade.":
      "Financial ceiling due to excessive caution: you work hard, but carry an ancestral fear of lack, holding back larger leaps of prosperity.",
    "Ama através do toque, da presença real, da segurança e da construção sólida; precisa de paz e previsibilidade para florescer.":
      "You love through touch, real presence, security, and solid building; you need peace and predictability to flourish.",

    "Inteligência rápida, poder de comunicação, versatilidade, curiosidade infinita e dom de conectar mundos e pessoas.":
      "Quick intelligence, communicative power, versatility, infinite curiosity, and the gift of connecting worlds and people.",
    "Hiperatividade mental, ansiedade por excesso de cenários, dispersão de energia em múltiplos caminhos sem finalizar o principal.":
      "Mental hyperactivity, anxiety from excessive scenarios, and scattering energy across multiple paths without finishing the main one.",
    "Ferida da Voz e do Entendimento: sensação de nunca ser verdadeiramente compreendida ou de que o que você diz é distorcido ou invalidado.":
      "Wound of Voice and Understanding: feeling that you are never truly understood or that what you say is distorted or invalidated.",
    "Sombra da palavra afiada ou do silêncio cortante: atrai conexões mentais intensas, mas pode racionalizar emoções profundas para não se vulnerabilizar.":
      "Shadow of the sharp word or cutting silence: you attract intense mental connections, but may rationalize deep emotions to avoid vulnerability.",
    "Autocrítica intelectual severa (síndrome da impostora): achar que precisa de mais dez cursos antes de cobrar o que realmente vale.":
      "Severe intellectual self-criticism (impostor syndrome): believing you need ten more courses before charging what you are truly worth.",
    "Ama pelo diálogo, pela admiração intelectual e pela leveza; sem conversa profunda e encantamento mental, o vínculo esfria.":
      "You love through dialogue, intellectual admiration, and lightness; without deep conversation and mental enchantment, the bond cools.",

    "Intuição psíquica, acolhimento profundo, memória afetiva sagrada e capacidade de nutrir e curar ambientes e almas.":
      "Psychic intuition, deep nurturing, sacred emotional memory, and the ability to nourish and heal environments and souls.",
    "Absorção de dores familiares que não são suas, carapaça defensiva por medo de rejeição e dificuldade de cortar cordões umbilicais do passado.":
      "Absorbing family pain that is not yours, wearing a defensive shell out of fear of rejection, and struggling to cut umbilical cords from the past.",
    "Ferida de Raiz, Clã e Abandono: sensação interna de orfandade emocional — como se você fosse a mãe de todo mundo, mas ninguém segurasse você quando precisa.":
      "Wound of Root, Clan, and Abandonment: an inner feeling of emotional orphanhood — as if you were everyone's mother, yet no one holds you when you need it.",
    "O complexo da Salvadora Exausta: atrai parceiros carentes ou imaturos que sugam sua nutrição emocional até você se fechar em ressentimento silencioso.":
      "The Exhausted Savior complex: attracting needy or immature partners who drain your emotional nourishment until you shut down in silent resentment.",
    "Bloqueio por lealdade invisível à família: culpa inconsciente de ser mais livre, feliz ou próspera do que sua linhagem materna.":
      "Block from invisible family loyalty: unconscious guilt about being freer, happier, or more prosperous than your maternal lineage.",
    "Ama com devoção, cuidado e desejo de construir ninho; precisa de segurança emocional absoluta para abrir a guarda.":
      "You love with devotion, care, and a desire to build a home; you need absolute emotional safety to lower your guard.",

    "Nobreza de coração, magnetismo solar, criatividade autoral, generosidade e presença que ilumina qualquer espaço.":
      "Nobility of heart, solar magnetism, authorial creativity, generosity, and a presence that illuminates any space.",
    "Medo secreto da humilhação ou irrelevância, orgulho que impede de pedir ajuda e dor profunda quando não é reconhecida.":
      "Secret fear of humiliation or irrelevance, pride that prevents asking for help, and deep pain when unrecognized.",
    "Ferida do Brilho Reprimido: em algum momento você aprendeu que brilhar demais incomodava ou gerava inveja, passando a diminuir sua própria luz.":
      "Wound of Repressed Brilliance: at some point you learned that shining too brightly bothered others or sparked envy, causing you to dim your own light.",
    "Fome de realeza e exclusividade: não aceita ser coadjuvante; quando ferida no orgulho, pode se fechar num trono de gelo ou atrair disputas de ego.":
      "Hunger for royalty and exclusivity: you refuse to play a supporting role; when your pride is wounded, you may retreat to an icy throne or attract ego battles.",
    "Trava de exposição e palco: você tem talento de líder, mas sente um peso enorme de responsabilidade ao se colocar como referência.":
      "Visibility and stage block: you have leadership talent, yet feel an enormous weight of responsibility when stepping forward as an authority.",
    "Ama de forma régia, apaixonada e leal; precisa sentir que é motivo de orgulho e encantamento para quem caminha ao seu lado.":
      "You love in a regal, passionate, and loyal way; you need to feel that you are a source of pride and enchantment to the one who walks beside you.",

    "Discernimento cirúrgico, excelência, pureza de propósito, capacidade de cura prática e organização do caos em ordem divina.":
      "Surgical discernment, excellence, purity of purpose, practical healing ability, and organizing chaos into divine order.",
    "Perfeccionismo paralisante, autocobrança implacável, ansiedade de controle e sensação de que nada nunca está pronto o bastante.":
      "Paralyzing perfectionism, relentless self-demand, control anxiety, and the feeling that nothing is ever ready enough.",
    "Ferida da Imperfeição: crença inconsciente de que você só merece ser amada ou bem paga quando é útil, impecável e não dá trabalho a ninguém.":
      "Wound of Imperfection: the unconscious belief that you only deserve to be loved or well paid when you are useful, flawless, and cause no trouble.",
    "Hipervigilância e crítica defensiva: medo visceral do descontrole emocional; no amor, pode tentar 'consertar' o parceiro em vez de se entregar.":
      "Hypervigilance and defensive criticism: visceral fear of emotional loss of control; in love, you may try to 'fix' your partner instead of surrendering.",
    "Exaustão operacional: assumir o trabalho pesado nos bastidores e travar na hora de delegar, escalar e assumir o lugar de estrategista.":
      "Operational exhaustion: taking on the heavy behind-the-scenes work while freezing when it is time to delegate, scale, and step into the strategist role.",
    "Ama nos detalhes, nos atos de serviço silenciosos e na dedicação real; observa atitudes concretas muito mais do que promessas.":
      "You love in the details, in quiet acts of service, and in real dedication; you watch concrete actions far more than promises.",

    "Diplomacia, senso estético refinado, justiça, charme magnético e sabedoria para criar pontes e harmonia.":
      "Diplomacy, refined aesthetic sense, justice, magnetic charm, and wisdom to build bridges and harmony.",
    "Autoanulação para evitar conflitos, indecisão crônica por pensar demais no outro e adiamento das próprias vontades.":
      "Self-effacement to avoid conflict, chronic indecision from overthinking others' needs, and postponing your own desires.",
    "Ferida do Espelho e da Injustiça: dor profunda com traições, ingratidão ou relações onde você entrega 90% da harmonia e recebe migalhas.":
      "Wound of the Mirror and Injustice: deep pain from betrayal, ingratitude, or relationships where you give 90% of the harmony and receive crumbs.",
    "A sombra da boazinha que engole sapos até explodir ou ir embora de vez; atrai parceiros que testam seus limites até você aprender a dizer 'não'.":
      "The shadow of the 'nice girl' who swallows grievances until exploding or walking away for good; attracting partners who test your boundaries until you learn to say 'no'.",
    "Medo do julgamento alheio e de contratos definitivos: exige maturidade para escolher a si mesma mesmo quando isso desagrada os outros.":
      "Fear of others' judgment and definitive commitments: requiring maturity to choose yourself even when it displeases others.",
    "Ama a parceria elegante, o companheirismo, a beleza compartilhada e a reciprocidade justa.":
      "You love elegant partnership, companionship, shared beauty, and fair reciprocity.",

    "Profundidade psíquica, poder de regeneração fênix, intuição raio-X, magnetismo sexual/espiritual e coragem de encarar a verdade nua.":
      "Psychic depth, phoenix-like regeneration power, X-ray intuition, sexual/spiritual magnetism, and courage to face the naked truth.",
    "Desconfiança preventiva, controle emocional, dificuldade de perdoar traições e medo visceral de dar poder ao outro sobre seu coração.":
      "Preventive distrust, emotional control, difficulty forgiving betrayals, and a visceral fear of giving another person power over your heart.",
    "Ferida da Traição e da Perda: marcas profundas de quebras de confiança ou perdas que fizeram você jurar inconscientemente nunca mais ficar vulnerável.":
      "Wound of Betrayal and Loss: deep scars from broken trust or losses that made you unconsciously swear never to be vulnerable again.",
    "Magnetismo hipnótico e tabu: atrai paixões avassaladoras ou kármicas; precisa transmutar jogos de poder, ciúme ou autossabotagem em alquimia consciente.":
      "Hypnotic magnetism and taboo: attracting overwhelming or karmic passions; needing to transmute power games, jealousy, or self-sabotage into conscious alchemy.",
    "Controle absoluto como escudo: dificuldade em soltar o que já morreu (cargos, relações, mágoas), represando o fluxo de renovação e dinheiro grande.":
      "Absolute control as a shield: difficulty letting go of what has already died (roles, relationships, grievances), damming the flow of renewal and major wealth.",
    "Ama de corpo e alma, sem meio-termo; busca fusão verdadeira, lealdade absoluta e transformação mútua.":
      "You love body and soul, with no half-measures; you seek true fusion, absolute loyalty, and mutual transformation.",

    "Visão de longo alcance, fé inabalável, sabedoria filosófica/espiritual, entusiasmo contagiante e vocação para expandir horizontes.":
      "Long-range vision, unshakable faith, philosophical/spiritual wisdom, contagious enthusiasm, and a vocation to expand horizons.",
    "Inquietação constante ('a grama do futuro é sempre mais verde'), fuga quando a rotina aperta ou promessas maiores que a execução diária.":
      "Constant restlessness ('the grass in the future is always greener'), escaping when routine tightens, or promises larger than daily execution.",
    "Ferida do Sentido da Vida: crises existenciais quando sente que está vivendo uma vida pequena, engaiolada ou desconectada de uma missão maior.":
      "Wound of Life's Meaning: existential crises when you feel you are living a small, caged life disconnected from a greater mission.",
    "Rebeldia contra dogmas e prisões: no amor e no trabalho, se sentir que tentam cortar suas asas, sabota tudo para recuperar a liberdade.":
      "Rebellion against dogma and cages: in love and work, if you feel someone is trying to clip your wings, you sabotage everything to reclaim your freedom.",
    "Desafio de aterrar a visão: transformar grandes ideias e sabedoria espiritual em método concreto, rotina lucrativa e constância.":
      "Challenge of grounding vision: transforming big ideas and spiritual wisdom into a concrete method, profitable routine, and consistency.",
    "Ama a aventura compartilhada, o crescimento conjunto, a admiração pela sabedoria do outro e o espaço para respirar.":
      "You love shared adventure, growing together, admiring the other's wisdom, and having room to breathe.",

    "Maestria, resiliência inquebrável, visão estratégica, integridade e poder de construir impérios e legado real.":
      "Mastery, unbreakable resilience, strategic vision, integrity, and the power to build empires and a lasting legacy.",
    "Rigidez emocional, carregar o peso do mundo sozinha, medir o próprio valor apenas pela produtividade e dificuldade de receber cuidado.":
      "Emotional rigidity, carrying the weight of the world alone, measuring your worth solely by productivity, and struggling to receive care.",
    "Ferida do Reconhecimento e da Autoridade: sensação de ter amadurecido cedo demais, assumindo responsabilidades adultas quando ainda precisava de colo.":
      "Wound of Recognition and Authority: feeling you matured far too early, taking on adult responsibilities when you still needed to be held.",
    "A armadura da mulher forte que não pode falhar: atrai parceiros que se apoiam na sua força ou que se intimidam com a sua competência.":
      "The armor of the strong woman who cannot fail: attracting partners who lean on your strength or feel intimidated by your competence.",
    "Excesso de peso e demora em colher: trabalhar no modo 'esforço penoso' em vez de permitir que a autoridade conquistada traga leveza e alta remuneração.":
      "Excessive burden and delayed harvest: working in 'painful struggle' mode instead of allowing your earned authority to bring lightness and high compensation.",
    "Ama com seriedade, respeito, compromisso de longo prazo e admiração pela postura e caráter do parceiro.":
      "You love with seriousness, respect, long-term commitment, and admiration for your partner's character and integrity.",

    "Originalidade genial, visão de futuro, autenticidade livre de padrões sociais, mente inventiva e consciência coletiva.":
      "Brilliant originality, future vision, authenticity free from social conventions, inventive mind, and collective consciousness.",
    "Sensação de ser uma 'estranha no ninho', desconexão emocional defensiva (viver na mente para não doer no peito) e autossabotagem por rebeldia.":
      "Feeling like an 'outsider', defensive emotional disconnection (living in your head so your chest doesn't ache), and rebellious self-sabotage.",
    "Ferida do Não-Pertencimento: sentir-se diferente demais da família ou do meio desde cedo, escondendo sua excentricidade ou isolando-se afetivamente.":
      "Wound of Non-Belonging: feeling too different from your family or environment from an early age, hiding your uniqueness or isolating emotionally.",
    "Pavor de perder a individualidade: quando uma relação ou trabalho exige enquadramento tradicional, um impulso elétrico inconsciente rompe o vínculo.":
      "Dread of losing individuality: when a relationship or job demands traditional conformity, an unconscious electric impulse breaks the bond.",
    "Trava na monetização da sua singularidade: medo de estruturar seu método único e cobrar caro pelo que só você enxerga.":
      "Block in monetizing your uniqueness: fear of structuring your unique method and charging well for what only you can see.",
    "Ama a amizade profunda dentro do romance, o respeito à individualidade e a conexão entre mentes livres.":
      "You love deep friendship within romance, respect for individuality, and connection between free minds.",

    "Mediunidade natural, compaixão oceânica, inspiração artística/espiritual, conexão direta com o invisível e sensibilidade curadora.":
      "Natural mediumship, oceanic compassion, artistic/spiritual inspiration, direct connection to the invisible, and healing sensitivity.",
    "Esponja energética de ambientes, idealização romântica (ver o potencial do outro e ignorar a realidade), fuga ou confusão de limites.":
      "Energetic sponge for environments, romantic idealization (seeing the other's potential while ignoring reality), escapism, or blurred boundaries.",
    "Ferida da Desilusão e doResgate: dor profunda ao perceber a dureza do mundo material, levando a querer salvar almas feridas ou se perder nos próprios sonhos.":
      "Wound of Disillusionment and Rescue: deep pain upon perceiving the harshness of the material world, leading you to want to save wounded souls or get lost in dreams.",
    "Sedução mística e neblina afetiva: atrai relações envoltas em mistério, promessas espirituais ou dependências emocionais que exigem aterramento urgente.":
      "Mystical seduction and romantic fog: attracting relationships wrapped in mystery, spiritual promises, or emotional dependencies that require urgent grounding.",
    "Culpa entre espiritualidade e dinheiro: crença inconsciente de que cobrar bem ou ter estrutura material é 'menos espiritual', gerando desorganização financeira.":
      "Guilt between spirituality and money: the unconscious belief that charging well or having material structure is 'less spiritual', creating financial disorganization.",
    "Ama de forma poética, transcendente e compassiva; precisa aprender a unir magia espiritual com limites claros no plano físico.":
      "You love in a poetic, transcendent, and compassionate way; you need to unite spiritual magic with clear boundaries on the physical plane.",

    // 27 NAKSHATRAS
    "Os Gêmeos Celestiais (Ashvins)": "The Celestial Twins (Ashvins)",
    "Cabeça de Cavalo": "Horse's Head",
    "Curadora veloz e pioneira espiritual; seu bloqueio é a pressa ansiosa que abandona processos antes da maturação.":
      "Swift healer and spiritual pioneer; your block is anxious haste that abandons processes before maturation.",
    "Yama (Senhor do Dharma)": "Yama (Lord of Dharma)",
    "Yoni (Ventre Sagrado)": "Yoni (Sacred Womb)",
    "Alma que suporta grandes extremos e transmutações; precisa parar de carregar tabus e culpas familiares no próprio corpo.":
      "A soul that endures great extremes and transmutations; you must stop carrying family taboos and guilt in your own body.",
    "Agni (Fogo Sagrado)": "Agni (Sacred Fire)",
    "Lâmina / Chama": "Blade / Flame",
    "Verdade cortante que purifica o que é falso; o bloqueio está na autocrítica feroz e em queimar pontes por orgulho ferido.":
      "Cutting truth that purifies what is false; the block lies in fierce self-criticism and burning bridges out of wounded pride.",
    "Brahma (O Criador)": "Brahma (The Creator)",
    "Carruagem Real": "Royal Chariot",
    "Altíssimo magnetismo criativo, sensual e próspero; o bloqueio é o apego emocional e o medo de perder o afeto ou a estabilidade.":
      "Supreme creative, sensual, and prosperous magnetism; the block is emotional attachment and fear of losing affection or stability.",
    "Soma (Néctar Lunar)": "Soma (Lunar Nectar)",
    "Cabeça de Cervo": "Deer's Head",
    "Buscadora incansável da verdade e do encantamento; a sombra é a inquietação constante e a desconfiança após pequenas decepções.":
      "Tireless seeker of truth and enchantment; the shadow is constant restlessness and distrust after minor disappointments.",
    "Rudra (Senhor das Tempestades)": "Rudra (Lord of Storms)",
    "Lágrima / Diamante": "Teardrop / Diamond",
    "Renasce mais forte após cada tempestade emocional; o bloqueio é atrair crises para sentir que está viva ou evoluindo.":
      "Reborn stronger after every emotional storm; the block is attracting crises just to feel alive or evolving.",
    "Aditi (Mãe Cósmica)": "Aditi (Cosmic Mother)",
    "Aljava de Flechas": "Quiver of Arrows",
    "O retorno da luz e da esperança; seu bloqueio é perdoar e recomeçar ciclos com pessoas que já mostraram que não mudaram.":
      "The return of light and hope; your block is forgiving and restarting cycles with people who have already shown they have not changed.",
    "Brihaspati (Mestre Divino)": "Brihaspati (Divine Teacher)",
    "Flor de Lótus / Úbere": "Lotus Flower / Udder",
    "Nutrição espiritual e sabedoria próspera; o bloqueio é o excesso de dever e alimentar quem nunca retribui.":
      "Spiritual nourishment and prosperous wisdom; the block is excessive duty and feeding those who never reciprocate.",
    "Nagas (Serpentes Sagradas)": "Nagas (Sacred Serpents)",
    "Serpente Enrolada": "Coiled Serpent",
    "Intuição hipnótica e percepção psicológica profunda; precisa vigiar a autodefesa venenosa, a desconfiança e o medo de traição.":
      "Hypnotic intuition and deep psychological perception; you must watch out for defensive sting, distrust, and fear of betrayal.",
    "Pitris (Ancestrais Reais)": "Pitris (Royal Ancestors)",
    "Trono Real": "Royal Throne",
    "Alma com memória de realeza e liderança; o bloqueio vem de lealdades pesadas ao carma ancestral familiar e exigência de perfeição.":
      "A soul with memories of royalty and leadership; the block stems from heavy loyalties to ancestral family karma and demands for perfection.",
    "Bhaga (Deus da Fortuna e Amor)": "Bhaga (Lord of Fortune & Love)",
    "Rede de Descanso": "Hammock of Rest",
    "Dons artísticos, carisma e merecimento natural; o bloqueio aparece quando busca validação afetiva externa para sentir seu próprio valor.":
      "Artistic gifts, charisma, and natural worthiness; the block appears when you seek external romantic validation to feel your own worth.",
    "Aryaman (Alianças Nobres)": "Aryaman (Noble Alliances)",
    "Pés da Cama Real": "Legs of the Royal Bed",
    "Força para alianças duradouras e liderança ética; o bloqueio é assumir contratos ou relações onde você carrega toda a estrutura sozinha.":
      "Strength for lasting alliances and ethical leadership; the block is taking on contracts or relationships where you carry the entire structure alone.",
    "Savitar (Sol Criador)": "Savitar (Creative Sun)",
    "Mão Aberta": "Open Hand",
    "Poder de manifestar o destino com as próprias mãos e talento; a sombra é o excesso de controle por medo de que tudo saia do eixo.":
      "Power to manifest destiny with your own hands and talent; the shadow is excessive control out of fear that everything will fall apart.",
    "Vishvakarma (Arquiteto Celestial)": "Vishvakarma (Celestial Architect)",
    "Pérola Brilhante": "Shining Pearl",
    "Lapidadora de beleza, estratégia e carisma; seu bloqueio é sentir-se incompreendida na sua profundidade por trás da aparência forte.":
      "Crafter of beauty, strategy, and charisma; your block is feeling misunderstood in your depth behind a strong appearance.",
    "Vayu (Vento Sagrado)": "Vayu (Sacred Wind)",
    "Broto ao Vento / Coral": "Shoot in the Wind / Coral",
    "Independência, diplomacia e flexibilidade; o bloqueio é a dispersão indecisa e o medo de criar raízes que tirem sua liberdade.":
      "Independence, diplomacy, and flexibility; the block is indecisive scattering and fear of putting down roots that might limit your freedom.",
    "Indra e Agni": "Indra & Agni",
    "Arco do Triunfo": "Arch of Triumph",
    "Foco implacável em grandes metas; a sombra é a frustração com o presente e a sensação de que a conquista nunca basta.":
      "Relentless focus on major goals; the shadow is frustration with the present and feeling that achievement is never enough.",
    "Mitra (Amigo Divino)": "Mitra (Divine Friend)",
    "Flor de Lótus na Lama": "Lotus Flower in the Mud",
    "Devoção profunda e capacidade de florescer em terrenos difíceis; o bloqueio é a melancolia oculta e a fome de pertencimento afetivo.":
      "Deep devotion and ability to blossom in difficult terrain; the block is hidden melancholy and hunger for emotional belonging.",
    "Indra (Rei dos Deuses)": "Indra (King of the Gods)",
    "Amuleto / Guarda-Sol": "Talisman / Royal Parasol",
    "A 'irmã mais velha' espiritual, protetora e perspicaz; seu bloqueio é a solidão no topo e o medo de mostrar fragilidade.":
      "The spiritual 'eldest sister', protective and perceptive; your block is loneliness at the top and fear of showing fragility.",
    "Nirriti (Deusa da Dissolução)": "Nirriti (Goddess of Dissolution)",
    "Raízes Amarradas": "Tied Roots",
    "Vai direto à raiz oculta de qualquer dor ou mentira; vive grandes arrancadas e precisa curar o medo de perder o chão.":
      "Goes straight to the hidden root of any pain or lie; experiences major fresh starts and needs to heal the fear of losing ground.",
    "Apah (Águas Cósmicas)": "Apah (Cosmic Waters)",
    "Leque de Marfim": "Ivory Fan",
    "Invencibilidade emocional e poder de persuasão; o bloqueio é a teimosia afetiva e idealizar cenários que demoram a se concretizar.":
      "Emotional invincibility and persuasive power; the block is romantic stubbornness and idealizing scenarios that take too long to materialize.",
    "Vishvadevas (Deuses Universais)": "Vishvadevas (Universal Gods)",
    "Presa de Elefante": "Elephant's Tusk",
    "Vitória definitiva após amadurecimento; o bloqueio é o isolamento por excesso de exigência consigo e com o mundo.":
      "Definitive victory after maturation; the block is isolation due to excessive demands on yourself and the world.",
    "Vishnu (O Preservador)": "Vishnu (The Preserver)",
    "Três Pegadas / Ouvido": "Three Footsteps / Ear",
    "Ouvido oracular que escuta o que ninguém diz; o bloqueio é absorver fofocas, ruídos e dores alheias até travar a própria voz.":
      "Oracular ear that hears what no one says; the block is absorbing noise and others' pain until your own voice freezes.",
    "Os 8 Vasus (Riqueza Elemental)": "The 8 Vasus (Elemental Wealth)",
    "Tambor Sagrado (Damaru)": "Sacred Drum (Damaru)",
    "Ritmo, prosperidade material e magnetismo; o bloqueio no amor surge quando prioriza a armadura de independência sobre a intimidade.":
      "Rhythm, material prosperity, and magnetism; the block in love arises when you prioritize the armor of independence over intimacy.",
    "Varuna (Oceano Cósmico)": "Varuna (Cosmic Ocean)",
    "Círculo de 100 Estrelas": "Circle of 100 Stars",
    "A curadora de cem médicos: vê verdades ocultas e sistemas inteiros; o bloqueio é o isolamento emocional e a sensação de exílio.":
      "The healer of a hundred physicians: sees hidden truths and whole systems; the block is emotional isolation and a sense of exile.",
    "Aja Ekapada (Fogo Unicórnio)": "Aja Ekapada (Unicorn Fire)",
    "Espada / Duas Faces": "Sword / Two Faces",
    "Paixão espiritual intensa e visão transformadora; a sombra é oscilar entre o idealismo extremo e a ansiedade sombria.":
      "Intense spiritual passion and transformative vision; the shadow is oscillating between extreme idealism and dark anxiety.",
    "Ahirbudhnya (Serpente das Profundezas)": "Ahirbudhnya (Serpent of the Depths)",
    "Gêmeos na Água": "Twins in the Water",
    "Sabedoria oceânica, paciência e mestria espiritual; o bloqueio é a inércia antes de agir por esperar o momento 100% seguro.":
      "Oceanic wisdom, patience, and spiritual mastery; the block is inertia before acting while waiting for a 100% safe moment.",
    "Pushan (Pastor das Almas)": "Pushan (Shepherd of Souls)",
    "Peixe Dourado / Tambor": "Golden Fish / Drum",
    "Alma antiga, empática e próspera que guia outros na travessia; seu maior bloqueio é doar até a última gota e esquecer os próprios limites.":
      "Ancient, empathetic, and prosperous soul who guides others across the threshold; your greatest block is giving to the last drop and forgetting your own boundaries.",

    // 22 ARCANOS MATRIZ DO DESTINO
    "A Pioneira e Canalizadora": "The Pioneer & Channeler",
    "Poder mental de manifestação, autoria, iniciativa única e domínio das próprias ferramentas.":
      "Mental power of manifestation, authorship, unique initiative, and mastery of your own tools.",
    "Síndrome da impostora ('ainda não sei o bastante') ou ego isolado que acha que ninguém faz tão bem quanto você.":
      "Impostor syndrome ('I still don't know enough') or an isolated ego that feels no one does it as well as you.",
    "Precisa admirar a inteligência do parceiro; na sombra, controla a relação ou se isola.":
      "Needs to admire your partner's intelligence; in the shadow, controls the relationship or isolates.",
    "Destrava quando cria algo autoral, assume a linha de frente e usa a própria voz/conhecimento.":
      "Unlocks when you create original work, step to the front line, and use your own voice and knowledge.",

    "A Guardiã do Mistério e da Intuição": "The Guardian of Mystery & Intuition",
    "Intuição certeira, diplomacia, visão dos bastidores, sensibilidade terapêutica e escuta profunda.":
      "Unerring intuition, diplomacy, behind-the-scenes vision, therapeutic sensitivity, and deep listening.",
    "Passividade, guardar segredos e ressentimentos, dúvida crônica entre a razão e a intuição.":
      "Passivity, keeping secrets and resentments, chronic doubt between reason and intuition.",
    "Busca conexão de alma profunda; na sombra, atrai relações ocultas, triângulos ou parceiros indecisos.":
      "Seeks deep soul connection; in the shadow, attracts hidden relationships, triangles, or undecided partners.",
    "Ganha através de aconselhamento, estratégia, terapias, diagnóstico e inteligência intuitiva.":
      "Earns through counseling, strategy, therapies, diagnosis, and intuitive intelligence.",

    "A Soberana da Abundância e Criação": "The Sovereign of Abundance & Creation",
    "Fertilidade criativa, magnetismo feminino, prosperidade material, beleza e liderança acolhedora.":
      "Creative fertility, feminine magnetism, material prosperity, beauty, and warm leadership.",
    "Controle materno excessivo sobre parceiros/projetos, vaidade ferida ou desconexão com o próprio corpo e prazer.":
      "Excessive maternal control over partners/projects, wounded pride, or disconnection from your own body and pleasure.",
    "Nascida para ser tratada como rainha; bloqueia o amor quando vira 'mãe' do parceiro.":
      "Born to be treated like a queen; blocks love when turning into the partner's 'mother'.",
    "É um dos maiores códigos de riqueza da Matriz: o dinheiro vem quando você se permite luxo, estética, autoria e comando sem culpa.":
      "One of the greatest wealth codes in the Matrix: money flows when you allow yourself luxury, aesthetics, authorship, and command without guilt.",

    "A Construtora de Impérios e Ordem": "The Builder of Empires & Order",
    "Estrutura, gestão, proteção, autoridade natural, realização concreta e palavra firme.":
      "Structure, management, protection, natural authority, concrete achievement, and a firm word.",
    "Rigidez, autoritarismo, excesso de peso masculino (fazer tudo na força bruta) e dificuldade de delegar.":
      "Rigidity, authoritarianism, excessive masculine burden (doing everything by brute force), and difficulty delegating.",
    "Em mulheres, a sombra do 4 faz você competir pelo controle ou atrair homens fracos porque não solta a armadura.":
      "In women, the shadow of 4 makes you compete for control or attract weak partners because you won't lower your armor.",
    "Prospera com negócios estruturados, processos claros, cargos de direção e patrimônio sólido.":
      "Prospers through structured business, clear processes, executive roles, and solid assets.",

    "A Mestra da Sabedoria e da Ordem": "The Master of Wisdom & Order",
    "Capacidade de ensinar, organizar sistemas, honrar tradições e transmitir conhecimento com autoridade.":
      "Ability to teach, organize systems, honor traditions, and transmit knowledge with authority.",
    "Moralismo, medo de quebrar regras familiares, síndrome da eterna aluna que acumula certificados mas não ensina.":
      "Moralism, fear of breaking family rules, and the eternal student syndrome of accumulating certificates without teaching.",
    "Valoriza lealdade, família e valores claros; trava quando tenta doutrinar ou julgar o parceiro.":
      "Values loyalty, family, and clear principles; freezes when trying to lecture or judge the partner.",
    "O dinheiro destrava quando você assume o lugar de mentora/especialista e rompe com o teto financeiro da família de origem.":
      "Money unlocks when you claim your place as a mentor/specialist and break through your family of origin's financial ceiling.",

    "O Magnetismo da Escolha e do Amor": "The Magnetism of Choice & Love",
    "Carisma irresistível, dom para relacionamentos, estética, comunicação afetiva e escolhas alinhadas ao coração.":
      "Irresistible charisma, relationship gifts, aesthetics, warm communication, and heart-aligned choices.",
    "Indecisão torturante ('e se eu tivesse escolhido o outro caminho?'), dependência de aprovação e idealização.":
      "Torturing indecision ('what if I had chosen the other path?'), approval dependence, and idealization.",
    "O amor é central na sua vida; seu desbloqueio exige parar de buscar fora a validação que falta dentro.":
      "Love is central to your life; your unlocking requires stopping the outer search for validation that must come from within.",
    "Só prospera no que ama de verdade; trabalhar apenas por obrigação seca imediatamente sua fonte financeira.":
      "You only prosper in what you truly love; working solely out of obligation immediately dries up your financial source.",

    "A Condutora de Metas e Movimento": "The Driver of Goals & Movement",
    "Foco, velocidade, conquista de território, liderança inspiradora e capacidade de destravar caminhos.":
      "Focus, speed, territory conquest, inspiring leadership, and the ability to unblock paths.",
    "Atropelar processos, viver em guerra contra o tempo, ou o extremo oposto: estagnação total por medo de dirigir a própria vida.":
      "Rushing processes, living at war with time, or the opposite extreme: total stagnation out of fear of steering your own life.",
    "Precisa de um parceiro que acompanhe seu ritmo e celebre suas vitórias, nunca alguém que tente frear seu avanço.":
      "You need a partner who matches your pace and celebrates your victories, never someone who tries to brake your progress.",
    "O dinheiro vem pelo movimento, metas claras, viagens, expansão digital e coragem de liderar.":
      "Money comes through movement, clear goals, travel, digital expansion, and the courage to lead.",

    "A Guardiã da Lei de Causa e Efeito": "The Guardian of Cause & Effect",
    "Equilíbrio, discernimento das leis cármicas, clareza mental, retidão e colheita exata.":
      "Balance, discernment of karmic laws, mental clarity, uprightness, and exact harvest.",
    "Indignação constante com 'injustiças', julgamento severo de si e dos outros, repetição dos mesmos conflitos por não enxergar a causa oculta.":
      "Constant indignation over 'injustices', harsh judgment of yourself and others, repeating the same conflicts by not seeing the hidden cause.",
    "Atrai relações que funcionam como espelhos cármicos; quando entende a lição sem culpar o outro, o padrão se desfaz na hora.":
      "Attracts relationships that act as karmic mirrors; once you understand the lesson without blaming the other, the pattern dissolves.",
    "Prospera com contratos claros, legalidade, equilíbrio entre dar e receber, e cura da revolta financeira.":
      "Prospers with clear contracts, legality, balance between giving and receiving, and healing financial resentment.",

    "A Sábia da Profundidade Interior": "The Sage of Inner Depth",
    "Sabedoria profunda, autossuficiência espiritual, profundidade intelectual e cura pelo conhecimento.":
      "Deep wisdom, spiritual self-sufficiency, intellectual depth, and healing through knowledge.",
    "Isolamento afetivo, medo de intimidade, avareza consigo mesma (achar que não precisa de nada) e esconder seus talentos do mundo.":
      "Emotional isolation, fear of intimacy, self-deprivation (thinking you need nothing), and hiding your talents from the world.",
    "Precisa de espaço sagrado; bloqueia o amor quando transforma a solitude saudável em muralha contra a entrega.":
      "Needs sacred space; blocks love when turning healthy solitude into a wall against surrender.",
    "Ganha com conhecimento profundo, consultoria, escrita, pesquisa e especialização — desde que não se esconda na caverna.":
      "Earns through deep knowledge, consulting, writing, research, and specialization — provided you don't hide in the cave.",

    "A Filha da Sorte e dos Ciclos": "The Daughter of Fortune & Cycles",
    "Fluidez, sincronicidades mágicas, oportunidades inesperadas e confiança no fluxo do universo.":
      "Fluidity, magical synchronicities, unexpected opportunities, and trust in the flow of the universe.",
    "Viver em montanha-russa financeira, trabalhar no sacrifício pesado achando que a vida tem que ser difícil, ou esperar passivamente pela sorte.":
      "Living on a financial rollercoaster, working in heavy sacrifice believing life must be hard, or passively waiting for luck.",
    "Relações de destino e encontros inesperados; precisa encerrar ciclos repetitivos para a roda girar para cima.":
      "Fated relationships and unexpected encounters; you must close repetitive cycles so the wheel can turn upward.",
    "Seu dinheiro bloqueia no esforço tenso e destrava na leveza, no timing certo e em múltiplas fontes de fluxo.":
      "Your money blocks under tense struggle and unlocks in lightness, right timing, and multiple streams of flow.",

    "A Potência Vital e o Domínio Sutil": "Vital Power & Subtle Mastery",
    "Vitalidade extraordinária, paixão, coragem, produtividade alta e poder de domar crises com elegância.":
      "Extraordinary vitality, passion, courage, high productivity, and the power to tame crises with grace.",
    "Workaholismo, agressividade quando contrariada, esgotamento físico/nervoso por tentar resolver tudo no grito ou na força.":
      "Workaholism, reactivity when crossed, and physical/nervous exhaustion from trying to solve everything by sheer force.",
    "Sexualidade e magnetismo intensos; precisa trocar a disputa de força pela vulnerabilidade confiante.":
      "Intense sexuality and magnetism; you need to trade power struggles for confident vulnerability.",
    "Grande capacidade de gerar riqueza quando canaliza sua energia em vez de dispersá-la apagando incêndios.":
      "Great capacity to generate wealth when channeling your energy instead of scattering it putting out fires.",

    "A Visionária do Novo Olhar e do Serviço": "The Visionary of New Perspective & Service",
    "Visão fora da caixa, empatia criativa, inovação e capacidade de enxergar soluções que ninguém mais vê.":
      "Out-of-the-box vision, creative empathy, innovation, and the ability to see solutions no one else sees.",
    "Complexo de mártir/salvadora, incapacidade de dizer 'não', cobrar barato por pena e sentir-se estagnada ou pendurada.":
      "Martyr/savior complex, inability to say 'no', undercharging out of pity, and feeling stagnant or suspended.",
    "Atrai pessoas para 'salvar' ou relações onde se sacrifica até adoecer; a cura é o amor-próprio inegociável.":
      "Attracts people to 'save' or relationships where you sacrifice until falling ill; the cure is non-negotiable self-love.",
    "O maior bloqueador do Arcano 12 é trabalhar de graça ou subvalorizada; quando precifica com honra, a abundância abre.":
      "The biggest blocker of Arcanum 12 is working for free or undervalued; when you price your work with honor, abundance opens.",

    "A Alquimista de Ciclos e Renascimento": "The Alchemist of Cycles & Rebirth",
    "Coragem para cortar o que não serve, transformação rápida, desapego curador e poder de recomeçar do zero em nível superior.":
      "Courage to cut what no longer serves, rapid transformation, healing detachment, and power to restart at a higher level.",
    "Apego mórbido ao passado, medo de mudanças, deixar projetos e relações 'mortos-vivos' arrastando sua energia.":
      "Attachment to the past, fear of change, leaving 'undead' projects and relationships dragging your energy down.",
    "Transforma profundamente quem toca; precisa permitir que a fase antiga da relação morra para um novo ciclo nascer.":
      "Deeply transforms those you touch; you must allow the old phase of a relationship to die so a new cycle can be born.",
    "Ganha dinheiro em transições, crises, reestruturações e terapias transformadoras; trava quando acumula entulho energético.":
      "Earns money in transitions, crises, restructurings, and transformative therapies; freezes when accumulating energetic clutter.",

    "A Alquimista da Cura, Arte e Equilíbrio": "The Alchemist of Healing, Art & Balance",
    "Harmonia da alma, sensibilidade artística, cura pelas mãos/palavra, paciência sábia e conexão angelical.":
      "Soul harmony, artistic sensitivity, healing through hands/words, wise patience, and angelic connection.",
    "Oscilação extrema (8 ou 80), impaciência com o tempo de maturação, excessos emocionais ou estagnação morna.":
      "Extreme oscillation (all or nothing), impatience with maturation time, emotional excesses, or lukewarm stagnation.",
    "Busca parceria de alma serena e madura; precisa curar feridas emocionais antigas para não projetá-las no presente.":
      "Seeks a serene, mature soul partnership; needs to heal old emotional wounds so as not to project them onto the present.",
    "Riqueza construída com constância, arte, estética, terapias integrativas e equilíbrio entre paixão e método.":
      "Wealth built through consistency, art, aesthetics, integrative therapies, and balance between passion and method.",

    "A Senhora do Magnetismo, Poder e Sombra": "The Lady of Magnetism, Power & Shadow",
    "Carisma hipnótico, visão de raio-X das intenções humanas, ambição saudável, luxo, sexualidade viva e poder de realização material.":
      "Hypnotic charisma, X-ray vision of human intentions, healthy ambition, luxury, vibrant sexuality, and material manifestation power.",
    "Relações tóxicas/codependentes, ciúme, manipulação, vícios emocionais, medo do próprio poder ou culpa por desejar riqueza.":
      "Toxic/codependent relationships, jealousy, manipulation, emotional addictions, fear of your own power, or guilt for desiring wealth.",
    "Paixões vulcânicas e testes cármicos de tentação e poder; quando integra a própria sombra, vive um amor lúcido e magnético.":
      "Volcanic passions and karmic tests of temptation and power; when you integrate your shadow, you live a lucid, magnetic love.",
    "Potencial de altíssima riqueza e grandes negócios, desde que não caia em ganhos impulsivos ou medo da própria ambição.":
      "Potential for extraordinary wealth and major business, provided you don't fall into impulsive shortcuts or fear of your own ambition.",

    "A Despertadora Espiritual e Reconstrutora": "The Spiritual Awakener & Rebuilder",
    "Despertar espiritual profundo, libertação de estruturas falsas, força para reconstruir qualquer vida com verdade absoluta.":
      "Deep spiritual awakening, liberation from false structures, and strength to rebuild any life with absolute truth.",
    "Caos recorrente, perdas repentinas quando insiste em manter aparências, raiva acumulada que implode o que construiu.":
      "Recurring chaos, sudden losses when insisting on keeping up appearances, and accumulated anger that implodes what you built.",
    "Relações baseadas em ilusão ou ego caem rápido; só permanece o que é construído sobre autenticidade espiritual.":
      "Relationships based on illusion or ego collapse quickly; only what is built on spiritual authenticity endures.",
    "Prospera quando constrói sobre propósito real, reforma, arquitetura de vida, mentoria de despertar e desapego do ego.":
      "Prospers when building on real purpose, life architecture, awakening mentoring, and ego detachment.",

    "O Canal de Brilho, Fé e Inspiração": "The Channel of Brilliance, Faith & Inspiration",
    "Talento único, conexão estelar, esperança curadora, vocação para ser vista, admirada e inspirar multidões.":
      "Unique talent, stellar connection, healing hope, and a vocation to be seen, admired, and inspire multitudes.",
    "Esconder-se nos bastidores ('vida cinza'), síndrome de não ser especial, ou viver nas nuvens sem pés no chão.":
      "Hiding backstage ('gray life'), feeling unspecial, or living in the clouds without grounded feet.",
    "Atrai amor verdadeiro quando brilha na sua essência; na sombra, idealiza amores platônicos impossíveis.":
      "Attracts true love when shining in your essence; in the shadow, idealizes impossible platonic loves.",
    "O dinheiro vem quando você aceita seu lugar de destaque, marca pessoal, arte, cura e visibilidade.":
      "Money flows when you claim your place in the spotlight, personal brand, art, healing, and visibility.",

    "A Maga do Inconsciente e da Imaginação": "The Mage of the Unconscious & Imagination",
    "Poder de materialização pelo pensamento, magia natural, intuição profunda, psicologia e conexão com o sagrado feminino.":
      "Power of materialization through thought, natural magic, deep intuition, psychology, and connection with the sacred feminine.",
    "Medos imaginários que se materializam, ansiedade noturna, autossabotagem por ilusão, síndrome de fraude e mentiras emocionais.":
      "Imaginary fears that materialize, nighttime anxiety, self-sabotage through illusion, impostor syndrome, and emotional self-deception.",
    "Se você tem medo de ser traída ou abandonada, o Arcano 18 magnetiza exatamente esse medo; limpe a tela mental e o amor floresce.":
      "If you fear betrayal or abandonment, Arcanum 18 magnetizes that exact fear; clear your mental screen and love flourishes.",
    "Sua mente é um ímã literal: quando substitui o medo da escassez pela certeza imaginativa, a prosperidade se materializa rápido.":
      "Your mind is a literal magnet: when you replace fear of scarcity with imaginative certainty, prosperity materializes rapidly.",

    "A Irradiação da Alegria, Sucesso e Abundância": "The Radiance of Joy, Success & Abundance",
    "Prosperidade luminosa, liderança calorosa, generosidade, clareza, realização pública e alegria de viver.":
      "Luminous prosperity, warm leadership, generosity, clarity, public achievement, and joy of living.",
    "Queimar os outros com excesso de controle/ego, ou queimar a si mesma com culpa, perfeccionismo e incapacidade de descansar.":
      "Scorching others with excessive control/ego, or burning yourself out with guilt, perfectionism, and inability to rest.",
    "Relações felizes, claras e prósperas quando você dá espaço para o outro também brilhar ao seu lado.":
      "Happy, clear, and prosperous relationships when you give your partner space to shine beside you.",
    "Código solar de fartura, grandes projetos, liderança de equipes e abundância compartilhada.":
      "Solar code of plenty, major projects, team leadership, and shared abundance.",

    "A Libertadora do Carma Ancestral": "The Liberator of Ancestral Karma",
    "Cura geracional da família, chamado vocacional claro, intuição ancestral e capacidade de renascer em uma nova missão.":
      "Generational family healing, clear vocational calling, ancestral intuition, and ability to be reborn into a new mission.",
    "Repetir exatamente os erros amorosos e financeiros dos pais/avós, julgar a família ou viver presa a mágoas de sangue.":
      "Repeating the exact romantic and financial mistakes of parents/grandparents, judging family, or living tied to bloodline grievances.",
    "O desbloqueio amoroso acontece no instante em que você honra e perdoa internamente pai e mãe, liberando o padrão repetido.":
      "Romantic unlocking happens the moment you internally honor and forgive father and mother, releasing the repeated pattern.",
    "Quando você cura a relação com suas raízes e aceita ir além do limite do clã sem culpa, o fluxo financeiro se multiplica.":
      "When you heal your relationship with your roots and allow yourself to go beyond the clan's ceiling without guilt, financial flow multiplies.",

    "A Cidadã do Universo e da Plenitude": "The Citizen of the Universe & Fulfillment",
    "Expansão sem fronteiras, visão global, conclusão vitoriosa de ciclos, internet, línguas e realização integral.":
      "Borderless expansion, global vision, victorious completion of cycles, digital reach, languages, and integral fulfillment.",
    "Pensar pequeno, colocar limites estreitos nos próprios sonhos, medo do mundo ou deixar projetos 90% prontos sem concluir.":
      "Thinking small, placing narrow limits on your dreams, fear of the world, or leaving projects 90% done without finishing.",
    "Conexões livres, maduras e expansivas; pode envolver pessoas de outras culturas ou expansão conjunta de vida.":
      "Free, mature, and expansive connections; may involve people from other cultures or shared life expansion.",
    "Seu dinheiro não cabe num espaço pequeno: exige internet, escala, visão ampla e proibição de dívidas limitantes.":
      "Your money does not fit in a small space: it requires digital reach, scale, broad vision, and freedom from limiting debts.",

    "A Alma Livre do Salto Quântico": "The Free Soul of the Quantum Leap",
    "Liberdade radical, fé pura no invisível, genialidade espontânea, ausência de amarras e capacidade de começar o inédito.":
      "Radical freedom, pure faith in the unseen, spontaneous genius, absence of tethers, and ability to begin the unprecedented.",
    "Medo paralisante de sair da gaiola, irresponsabilidade financeira por fuga, ou viver presa em rotinas que matam sua alma.":
      "Paralyzing fear of leaving the cage, financial escapism, or living trapped in routines that drain your soul.",
    "Precisa de um amor que seja voo conjunto, nunca jaula; na sombra, foge antes de criar laço ou aceita prisões por medo.":
      "Needs a love that is shared flight, never a cage; in the shadow, flees before bonding or accepts prisons out of fear.",
    "Prospera com liberdade criativa, inovação, projetos autorais e confiança para dar saltos que a mente lógica teme.":
      "Prospers through creative freedom, innovation, original projects, and trust to take leaps the logical mind fears.",

    // CAUDAS CÁRMICAS CLÁSSICAS
    "A Maga / Sábia na Caverna (18-9-9)": "The Mage / Sage in the Cave (18-9-9)",
    "Em outra existência, você detinha profundo conhecimento espiritual ou mágico, mas isolou-se do mundo e do amor, ou recusou-se a transmitir esse saber por medo ou desencanto.":
      "In a past existence, you held deep spiritual or magical knowledge, but isolated yourself from the world and love, or refused to pass on that wisdom out of fear or disenchantment.",
    "Medo inconsciente de mostrar todo o seu potencial ao mundo, tendência ao isolamento quando se machuca e criação de medos imaginários (18) que fazem você se esconder (9).":
      "Unconscious fear of showing your full potential to the world, tendency to isolate when hurt, and creating imaginary fears (18) that make you hide (9).",
    "Sair da caverna: compartilhar sua sabedoria com as pessoas, confiar na intimidade afetiva e usar sua mente para visualizar luz em vez de cenários de medo.":
      "Step out of the cave: share your wisdom with people, trust in emotional intimacy, and use your mind to visualize light instead of fear scenarios.",

    "O Segredo e a Magia Reprimida (9-18-9)": "The Secret & Repressed Magic (9-18-9)",
    "Sua alma carrega a memória de ter escondido seus dons intuitivos por medo de perseguição ou julgamento.":
      "Your soul carries the memory of having hidden your intuitive gifts out of fear of persecution or judgment.",
    "Autossabotagem intelectual, sensação de solidão mesmo acompanhada e medo de cobrar pelo que sabe.":
      "Intellectual self-sabotage, feeling lonely even in company, and fear of charging for what you know.",
    "Assumir sua sensibilidade e inteligência sem pedir permissão, unindo profundidade espiritual e presença prática no mundo.":
      "Claim your sensitivity and intelligence without asking permission, uniting spiritual depth with practical presence in the world.",

    "A Rebelde do Clã Familiar (15-20-5)": "The Family Clan Rebel (15-20-5)",
    "Em vida passada, houve ruptura com as tradições da família ou exclusão do clã por escolhas de paixão, poder ou liberdade.":
      "In a past life, there was a rupture with family traditions or exclusion from the clan due to choices of passion, power, or freedom.",
    "Sentir-se a 'ovelha negra' da família, tentar salvar ou carregar parentes nas costas, ou repetir inconscientemente os mesmos bloqueios amorosos/financeiros da linhagem.":
      "Feeling like the 'black sheep' of the family, trying to save or carry relatives on your back, or unconsciously repeating the same romantic/financial blocks of your lineage.",
    "Perdoar e honrar suas raízes sem carregar o fardo delas, permitindo-se prosperar e amar de um jeito novo.":
      "Forgive and honor your roots without carrying their burden, allowing yourself to prosper and love in a new way.",

    "Paixões, Traições e Justiça Afetiva (15-5-8)": "Passions, Betrayals & Romantic Justice (15-5-8)",
    "Memória cármica de triângulos amorosos, paixões proibidas ou quebras de votos que deixaram feridas de injustiça.":
      "Karmic memory of love triangles, forbidden passions, or broken vows that left wounds of injustice.",
    "Atrair parceiros indisponíveis, testar a fidelidade do outro ou sentir que sempre entrega mais do que recebe nas relações.":
      "Attracting unavailable partners, testing the other's loyalty, or feeling you always give more than you receive in relationships.",
    "Curar o julgamento moral, escolher relações transparentes e parar de buscar provas de dor no amor.":
      "Heal moral judgment, choose transparent relationships, and stop looking for proof of pain in love.",

    "O Feitiço do Amor e a Fome de Afeto (18-6-6)": "The Love Spell & Hunger for Affection (18-6-6)",
    "Em outra vida, o amor foi vivido como dependência extrema ou ilusão romântica que custou sua própria identidade.":
      "In another life, love was experienced as extreme dependency or romantic illusion that cost your own identity.",
    "Medo profundo de rejeição, necessidade de aprovação constante e dúvida sobre ser amada pelo que realmente é.":
      "Deep fear of rejection, need for constant approval, and doubt about being loved for who you truly are.",
    "Preencher seu próprio cálice emocional primeiro; quando você se escolhe sem medo, atrai um amor recíproco e seguro.":
      "Fill your own emotional cup first; when you choose yourself without fear, you attract reciprocal, secure love.",

    "A Guerreira Interrompida (12-19-7)": "The Interrupted Warrior (12-19-7)",
    "Alma de grande força e liderança que teve sua jornada interrompida ou usou a força de modo impulsivo.":
      "A soul of great strength and leadership whose journey was interrupted or who used force impulsively.",
    "Sentir que quando está prestes a dar o grande salto profissional, algo trava ou você se sacrifica pelos outros (12) e perde a própria direção (7).":
      "Feeling that right when you are about to take a major professional leap, something freezes or you sacrifice yourself for others (12) and lose your own direction (7).",
    "Colocar suas metas em primeiro lugar com doçura e constância, sem precisar entrar em guerra nem se anular.":
      "Put your goals first with grace and consistency, without needing to go to war or efface yourself.",

    "A Espera Solitária do Amor (9-12-3)": "The Solitary Waiting for Love (9-12-3)",
    "Memória de separação de um grande amor ou sacrifício da própria feminilidade/maternidade em nome do dever.":
      "Memory of separation from a great love or sacrificing your own femininity/motherhood in the name of duty.",
    "Assumir o papel de salvadora nas relações, dificuldade de receber mimo/cuidado e fechar o coração após decepções.":
      "Taking on the savior role in relationships, difficulty receiving care/affection, and closing your heart after disappointments.",
    "Despertar a Imperatriz (3): aprender a receber, deixar de salvar adultos e honrar seu prazer e abundância.":
      "Awaken the Empress (3): learn to receive, stop rescuing adults, and honor your pleasure and abundance.",

    "AAlma Cativa e a Liberdade (3-7-22)": "The Captive Soul & Freedom (3-7-22)",
    "Memória de privação de liberdade física, emocional ou financeira.":
      "Memory of physical, emotional, or financial deprivation of freedom.",
    "Pavor de se sentir presa em rotinas ou relacionamentos controladores, ou criar dívidas/obrigações que funcionam como algemas invisíveis.":
      "Dread of feeling trapped in routines or controlling relationships, or creating debts/obligations that act as invisible handcuffs.",
    "Construir liberdade com responsabilidade, dirigindo o próprio caminho (7) com leveza e prosperidade (3).":
      "Build freedom with responsibility, steering your own path (7) with lightness and prosperity (3).",

    "O Talento Oculto / A Estrela Adormecida (6-17-11)": "The Hidden Talent / Sleeping Star (6-17-11)",
    "Você recebeu um grande dom em outra vida, mas trocou sua missão por segurança comum ou deixou seu brilho apagar.":
      "You received a great gift in another life, but traded your mission for ordinary security or let your brilliance fade.",
    "Trabalhar muito abaixo do seu verdadeiro potencial, duvidar do próprio brilho e adiar sua verdadeira vocação.":
      "Working far below your true potential, doubting your own brilliance, and postponing your true vocation.",
    "Assumir o palco da sua área (17), unir sua força (11) com o que você ama (6) e permitir-se brilhar.":
      "Claim the stage in your field (17), unite your strength (11) with what you love (6), and allow yourself to shine.",

    "A Soberania e a Confiança no Fluxo (21-4-10)": "Sovereignty & Trust in the Flow (21-4-10)",
    "Memória de grande poder material ou perda de controle sobre um império.":
      "Memory of great material power or loss of control over an empire.",
    "Hipercontrole por medo da instabilidade, achando que se soltar as rédeas por um dia tudo vai desmoronar.":
      "Hyper-control out of fear of instability, feeling that if you let go of the reins for a single day everything will collapse.",
    "Unir a estrutura inteligente (4) com a confiança nos ciclos do Universo (10) e visão sem fronteiras (21).":
      "Unite intelligent structure (4) with trust in the cycles of the Universe (10) and borderless vision (21).",

    // NUMEROLOGIA (SIGNIFICADOS_NUM & DIVIDIAS_CARMICAS)
    "Vibração 1 — A Pioneira Soberana": "Vibration 1 — The Sovereign Pioneer",
    "Sua alma anseia por autonomia, autoria e liberdade para decidir o próprio rumo sem interferência.":
      "Your soul longs for autonomy, authorship, and freedom to decide your own course without interference.",
    "Você se expressa com liderança, iniciativa e coragem para abrir trilhas inéditas.":
      "You express yourself with leadership, initiative, and courage to blaze new trails.",
    "Seu caminho de vida exige que você deixe de se apoiar nos outros e assuma o comando da própria história.":
      "Your life path requires you to stop leaning on others and take command of your own story.",
    "Medo de depender, dificuldade em pedir ajuda ou paralisia quando sente que não está no controle total.":
      "Fear of depending on others, difficulty asking for help, or paralysis when you feel you are not in total control.",
    "Lição Cármica 1: Aprender a ter iniciativa própria, bancar suas decisões e não esperar que outros abram a porta por você.":
      "Karmic Lesson 1: Learn to take your own initiative, stand by your decisions, and not wait for others to open doors for you.",

    "Vibração 2 — A Diplomata Sensível": "Vibration 2 — The Sensitive Diplomat",
    "Sua alma busca união verdadeira, paz emocional, parceria íntima e ambientes harmoniosos.":
      "Your soul seeks true union, emotional peace, intimate partnership, and harmonious environments.",
    "Você tem o dom da escuta, da conciliação, dos detalhes sutis e da inteligência emocional.":
      "You have the gift of listening, conciliation, subtle details, and emotional intelligence.",
    "Seu destino ensina a arte das alianças, da paciência gestacional e da sensibilidade intuitiva.":
      "Your destiny teaches the art of alliances, gestational patience, and intuitive sensitivity.",
    "Engolir o que sente para manter a paz, hipersensibilidade à rejeição e submissão aos desejos alheios.":
      "Swallowing what you feel to keep the peace, hypersensitivity to rejection, and submission to others' wishes.",
    "Lição Cármica 2: Desenvolver paciência, cooperação saudável e tato emocional sem perder suas fronteiras.":
      "Karmic Lesson 2: Develop patience, healthy cooperation, and emotional tact without losing your boundaries.",

    "Vibração 3 — A Comunicadora Magnética": "Vibration 3 — The Magnetic Communicator",
    "Sua alma precisa de expressão criativa, beleza, encantamento, alegria e voz ativa.":
      "Your soul needs creative expression, beauty, enchantment, joy, and an active voice.",
    "Carisma natural na fala, escrita, imagem ou arte; quando você se expressa, ilumina o ambiente.":
      "Natural charisma in speech, writing, image, or art; when you express yourself, you light up the room.",
    "Seu destino é florescer através da comunicação, da visibilidade e da criatividade fértil.":
      "Your destiny is to blossom through communication, visibility, and fertile creativity.",
    "Calar a própria voz por medo de julgamento, dispersão em mil ideias ou esconder-se quando está triste.":
      "Silencing your own voice out of fear of judgment, scattering across a thousand ideas, or hiding when sad.",
    "Lição Cármica 3: Destravar a autoexpressão, vencer a timidez/vergonha de aparecer e confiar no seu brilho criativo.":
      "Karmic Lesson 3: Unlock self-expression, overcome shyness/fear of visibility, and trust your creative brilliance.",

    "Vibração 4 — A Arquiteta da Realidade": "Vibration 4 — The Architect of Reality",
    "Sua alma pede segurança sólida, ordem, raízes firmes, previsibilidade e construção concreta.":
      "Your soul asks for solid security, order, firm roots, predictability, and concrete building.",
    "Confiabilidade, método, capacidade de transformar sonhos abstratos em estruturas reais.":
      "Reliability, method, and the ability to transform abstract dreams into real structures.",
    "Construir bases inabaláveis no trabalho, no patrimônio e na vida prática.":
      "Building unshakable foundations in work, assets, and practical life.",
    "Rigidez, excesso de trabalho pesado sem prazer, medo do novo e crença de que dinheiro só vem com suor exaustivo.":
      "Rigidity, excessive heavy work without pleasure, fear of the new, and believing money only comes through exhausting sweat.",
    "Lição Cármica 4: Criar disciplina, organização financeira e constância para levar projetos até o fim.":
      "Karmic Lesson 4: Build discipline, financial organization, and consistency to see projects through to completion.",

    "Vibração 5 — A Alquimista da Liberdade": "Vibration 5 — The Alchemist of Freedom",
    "Sua alma tem sede de movimento, mudança, experiências vivas, viagens e quebra de rotinas cinzas.":
      "Your soul thirsts for movement, change, vivid experiences, travel, and breaking gray routines.",
    "Versatilidade magnética, poder de vendas, adaptação rápida e mente livre.":
      "Magnetic versatility, persuasive power, rapid adaptation, and a free mind.",
    "Aprender o uso sábio da liberdade, abraçando as viradas da vida como portais de evolução.":
      "Learning the wise use of freedom, embracing life's turns as portals of evolution.",
    "Ansiedade por estagnação, impulsividade, abandonar projetos ou relações quando perdem a novidade.":
      "Anxiety from stagnation, impulsiveness, abandoning projects or relationships when the novelty fades.",
    "Lição Cármica 5: Vencer o medo da mudança, abrir-se ao novo e não ficar presa em zonas de conforto vencidas.":
      "Karmic Lesson 5: Overcome fear of change, open up to the new, and avoid staying trapped in expired comfort zones.",

    "Vibração 6 — A Guardiã do Amor e da Harmonia": "Vibration 6 — The Guardian of Love & Harmony",
    "Sua alma deseja profundamente afeto recíproco, família (de sangue ou de alma), beleza e acolhimento.":
      "Your soul deeply desires reciprocal affection, family (by blood or soul), beauty, and warmth.",
    "Presença terapêutica, senso estético, cuidado amoroso e responsabilidade afetiva.":
      "Therapeutic presence, aesthetic sense, loving care, and emotional responsibility.",
    "Curar laços afetivos, criar harmonia e equilibrar o cuidado com o outro e o cuidado consigo.":
      "Healing emotional bonds, creating harmony, and balancing care for others with self-care.",
    "Carregar problemas familiares nas costas, perfeccionismo afetivo e atrair pessoas que abusam da sua bondade.":
      "Carrying family problems on your back, romantic perfectionism, and attracting people who take advantage of your kindness.",
    "Lição Cármica 6: Assumir compromissos afetivos saudáveis sem fugir da intimidade nem tentar salvar todo mundo.":
      "Karmic Lesson 6: Embrace healthy emotional commitments without fleeing intimacy or trying to rescue everyone.",

    "Vibração 7 — A Mística Investigadora": "Vibration 7 — The Mystic Investigator",
    "Sua alma busca verdade profunda, conexão espiritual, silêncio sagrado e respostas que o raso não dá.":
      "Your soul seeks deep truth, spiritual connection, sacred silence, and answers the superficial cannot provide.",
    "Profundidade analítica, intuição refinada, seletividade e autoridade intelectual/espiritual.":
      "Analytical depth, refined intuition, selectivity, and intellectual/spiritual authority.",
    "Unir ciência, psique e espiritualidade, tornando-se referência de sabedoria profunda.":
      "Uniting science, psyche, and spirituality, becoming a beacon of deep wisdom.",
    "Excesso de análise que paralisa a ação, desconfiança afetiva e isolamento emocional.":
      "Over-analysis that paralyzes action, romantic distrust, and emotional isolation.",
    "Lição Cármica 7: Confiar na própria intuição, aprofundar conhecimentos e desenvolver fé no invisível.":
      "Karmic Lesson 7: Trust your own intuition, deepen your knowledge, and cultivate faith in the unseen.",

    "Vibração 8 — A Soberana do Poder e da Matéria": "Vibration 8 — The Sovereign of Power & Matter",
    "Sua alma reconhece a grandeza, o sucesso material, a justiça e a capacidade de comando.":
      "Your soul recognizes greatness, material success, justice, and command capacity.",
    "Visão executiva, magnetismo para negócios, autoridade e poder de realização financeira.":
      "Executive vision, business magnetism, authority, and financial manifestation power.",
    "Dominar o mundo material com ética, abundância e equilíbrio entre poder espiritual e riqueza.":
      "Mastering the material world with ethics, abundance, and balance between spiritual power and wealth.",
    "Medo do próprio poder, ciclos de ganha-e-perde financeiro ou rigidez controladora nas relações.":
      "Fear of your own power, boom-and-bust financial cycles, or controlling rigidity in relationships.",
    "Lição Cármica 8: Curar a relação com o dinheiro, assumir autoridade financeira e gerir recursos com maestria.":
      "Karmic Lesson 8: Heal your relationship with money, claim financial authority, and manage resources with mastery.",

    "Vibração 9 — A Curadora Universal": "Vibration 9 — The Universal Healer",
    "Sua alma é antiga, compassiva, humanitária e veio encerrar ciclos cármicos com sabedoria.":
      "Your soul is ancient, compassionate, humanitarian, and came to close karmic cycles with wisdom.",
    "Generosidade, visão ampla, carisma inspirador e capacidade de tocar muitas vidas.":
      "Generosity, broad vision, inspiring charisma, and the ability to touch many lives.",
    "Servir de farol para outras pessoas através da sua própria história de superação e cura.":
      "Serving as a lighthouse for others through your own story of overcoming and healing.",
    "Dificuldade de desapegar do passado, síndrome da salvadora e doar-se até ficar vazia.":
      "Difficulty letting go of the past, savior syndrome, and giving until you are empty.",
    "Lição Cármica 9: Aprender o desapego, o perdão verdadeiro e a compaixão sem autoanulação.":
      "Karmic Lesson 9: Learn detachment, true forgiveness, and compassion without self-effacement.",

    "Número Mestre 11 — A Iluminadora Intuitiva": "Master Number 11 — The Intuitive Illuminator",
    "Sua alma possui uma antena espiritual de alta voltagem, captando o que ninguém diz.":
      "Your soul possesses a high-voltage spiritual antenna, picking up what no one says.",
    "Canal de inspiração, magnetismo espiritual, visão além do tempo e palavra que desperta consciências.":
      "Channel of inspiration, spiritual magnetism, vision beyond time, and words that awaken consciousness.",
    "Viver como ponte entre o mundo espiritual e o mundo prático, iluminando consciências.":
      "Living as a bridge between the spiritual and practical worlds, illuminating minds.",
    "Sobrecarga nervosa, ansiedade por captar energias densas e medo de assumir sua missão espiritual.":
      "Nervous overload, anxiety from absorbing dense energies, and fear of claiming your spiritual mission.",
    "Ancorar a alta voltagem intuitiva no corpo físico sem cair na ansiedade do 2.":
      "Ground high-voltage intuition in the physical body without falling into the anxiety of 2.",

    "Número Mestre 22 — A Mestra Construtora": "Master Number 22 — The Master Builder",
    "Sua alma veio materializar grandes projetos que impactam a coletividade de forma concreta.":
      "Your soul came to materialize major projects that concretely impact the collective.",
    "Combinação rara de visão espiritual elevada com capacidade prática de execução em larga escala.":
      "Rare combination of elevated spiritual vision with practical large-scale execution.",
    "Construir um legado tangível, próspero e duradouro que sirva a muitas pessoas.":
      "Building a tangible, prosperous, and lasting legacy that serves many people.",
    "Medo da própria grandeza, encolhendo-se numa rotina pequena por receio de não dar conta.":
      "Fear of your own greatness, shrinking into a small routine out of fear of not measuring up.",
    "Unir visão cósmica e disciplina prática para materializar o extraordinário.":
      "Unite cosmic vision and practical discipline to materialize the extraordinary.",

    "Número Mestre 33 — O Amor Crístico e a Cura": "Master Number 33 — Christic Love & Healing",
    "Sua alma vibra na frequência da compaixão mestra, do ensino amoroso e da cura profunda.":
      "Your soul vibrates at the frequency of master compassion, loving teaching, and deep healing.",
    "Voz e presença que acalmam tempestades, despertando o melhor em quem cruza seu caminho.":
      "A voice and presence that calm storms, awakening the best in those who cross your path.",
    "Guiar, ensinar e curar com amor elevado, mantendo limites sagrados para não carregar a cruz alheia.":
      "Guiding, teaching, and healing with elevated love while keeping sacred boundaries so you don't carry others' crosses.",
    "Martírio emocional e esquecimento de si mesma para socorrer o mundo.":
      "Emotional martyrdom and forgetting yourself in order to rescue the world.",
    "Amar e curar sem se sacrificar no altar das dores alheias.":
      "Love and heal without sacrificing yourself on the altar of others' pain.",

    "Dívida Cármica 13/4": "Karmic Debt 13/4",
    "Memória de vidas passadas onde houve dispersão, abandono de responsabilidades ou transferência do trabalho pesado para terceiros.":
      "Past-life memory where there was scattering, abandonment of responsibilities, or shifting heavy work onto others.",
    "Nesta vida, você pode sentir que precisa fazer o dobro de esforço para conquistar o que parece fácil para os outros, ou sentir tentação de desistir quando surgem obstáculos repetitivos.":
      "In this life, you may feel you must put in twice the effort to achieve what seems easy for others, or feel tempted to give up when repetitive obstacles arise.",
    "Foco em uma meta de cada vez, organização inteligente (trabalhar com estratégia e não apenas no cansaço) e proibição de murmurar contra os processos de construção.":
      "Focus on one goal at a time, smart organization (working with strategy rather than sheer exhaustion), and honoring the building process.",

    "Dívida Cármica 14/5": "Karmic Debt 14/5",
    "Memória de uso desmedido da liberdade, fugas afetivas ou excessos sensoriais em outra existência.":
      "Memory of unmeasured use of freedom, emotional escapism, or sensory excesses in another existence.",
    "A vida traz mudanças inesperadas constantes e testa seu foco emocional e financeiro; tendência a oscilar entre apego ao seguro e vontade repentina de largar tudo.":
      "Life brings constant unexpected changes and tests your emotional and financial focus; a tendency to oscillate between clinging to safety and a sudden urge to drop everything.",
    "Equilíbrio emocional, compromisso firme com suas escolhas e flexibilidade consciente diante dos imprevistos.":
      "Emotional balance, firm commitment to your choices, and conscious flexibility in the face of the unexpected.",

    "Dívida Cármica 16/7": "Karmic Debt 16/7",
    "Memória de orgulho espiritual/intelectual ou relações afetivas onde o ego feriu vínculos sagrados.":
      "Memory of spiritual/intellectual pride or romantic relationships where ego wounded sacred bonds.",
    "Funciona como a 'Torre' numerológica: quando você se apoia em máscaras, relações falsas ou carreiras sem alma, a vida derruba a estrutura para forçar seu despertar verdadeiro.":
      "Acts as the numerological 'Tower': when you lean on masks, false relationships, or soulless careers, life brings down the structure to prompt your true awakening.",
    "Humildade sábia, espiritualidade autêntica e coragem de viver apenas relações e trabalhos onde sua alma é verdadeira.":
      "Wise humility, authentic spirituality, and courage to live only relationships and work where your soul is true.",

    "Dívida Cármica 19/1": "Karmic Debt 19/1",
    "Memória de exercício solitário ou autoritário do poder em outra vida.":
      "Memory of solitary or authoritarian exercise of power in another life.",
    "Nesta vida, você sente que sempre precisa resolver tudo sozinha ('se eu não fizer, ninguém faz'), atraindo sobrecarga e dificuldade de receber apoio no amor e no trabalho.":
      "In this life, you feel you must always solve everything alone ('if I don't do it, no one will'), attracting overload and difficulty receiving support in love and work.",
    "Aprender que a verdadeira soberania sabe receber ajuda, delegar e caminhar em parceria sem perder a própria força.":
      "Learn that true sovereignty knows how to receive help, delegate, and walk in partnership without losing your own strength.",

    // DIRECIONAMENTO DASHA VÉDICO
    "Ciclo de Desapego Espiritual, Corte de Ilusões e Sabedoria Intuitiva":
      "Cycle of Spiritual Detachment, Cutting Illusions & Intuitive Wisdom",
    "O Universo pede que você pare de insistir em estruturas que já cumpriram seu papel. Seu caminho fica suave quando você confia no seu sexto sentido, simplifica a rotina e foca em especialização profunda em vez de volume disperso.":
      "The Universe asks you to stop insisting on structures that have already fulfilled their role. Your path becomes smooth when you trust your sixth sense, simplify your routine, and focus on deep specialization rather than scattered volume.",
    "Ciclo de Magnetismo, Cura do Feminino, Valorização e Alianças":
      "Cycle of Magnetism, Feminine Healing, Self-Value & Alliances",
    "Momento ideal para elevar seu valor percebido, cuidar da estética/imagem, destravar o merecimento afetivo e permitir que a prosperidade venha através de charme, diplomacia e criação autoral.":
      "Ideal moment to elevate your perceived value, care for aesthetics/image, unlock romantic worthiness, and allow prosperity to flow through charm, diplomacy, and original creation.",
    "Ciclo de Autoridade, Visibilidade, Autonomia e Posicionamento":
      "Cycle of Authority, Visibility, Autonomy & Positioning",
    "É hora de sair dos bastidores. Assuma a liderança do seu próprio nome, corte relações de submissão e tome decisões baseadas na sua verdade central, sem esperar aprovação familiar.":
      "It is time to step out from behind the scenes. Take leadership of your own name, cut submissive dynamics, and make decisions rooted in your core truth without waiting for family approval.",
    "Ciclo de Nutrição da Alma, Cura Emocional, Fluxo e Conexão Pública":
      "Cycle of Soul Nourishment, Emotional Healing, Flow & Public Connection",
    "Respeite seus ritmos internos. Sua prosperidade e seus afetos fluem quando seu ambiente doméstico está em paz e quando você usa sua empatia para acolher sem absorver dores alheias.":
      "Honor your inner rhythms. Your prosperity and affections flow when your home environment is peaceful and when you use your empathy to welcome others without absorbing their pain.",
    "Ciclo de Coragem, Execução Prática, Corte de Inércia e Conquista":
      "Cycle of Courage, Practical Execution, Cutting Inertia & Conquest",
    "Pare de adiar decisões difíceis. Canalize sua energia vital em um projeto concreto de cada vez, estabeleça limites firmes com pessoas invasivas e aja com assertividade.":
      "Stop postponing difficult decisions. Channel your vital energy into one concrete project at a time, set firm boundaries with invasive people, and act assertively.",
    "Ciclo de Expansão Inédita, Quebra de Tabus e Salto de Destino":
      "Cycle of Unprecedented Expansion, Breaking Taboos & Destiny Leap",
    "O que é tradicional parece pequeno demais para você agora. Abra-se para inovação, ambiente digital, novos públicos e caminhos que ninguém da sua família trilhou antes.":
      "What is traditional feels too small for you right now. Open yourself to innovation, the digital realm, new audiences, and paths no one in your family has walked before.",
    "Ciclo de Sabedoria, Mentoria, Bênçãos Protetoras e Expansão Ética":
      "Cycle of Wisdom, Mentoring, Protective Blessings & Ethical Expansion",
    "Seu crescimento vem pelo ensino, pelo estudo elevado e pela visão de longo prazo. Posicione-se como mentora ou referência de confiança na sua área.":
      "Your growth comes through teaching, elevated study, and long-term vision. Position yourself as a mentor or trusted authority in your field.",
    "Ciclo de Estruturação Sólida, Colheita Kármica, Maturidade e Legado":
      "Cycle of Solid Structuring, Karmic Harvest, Maturity & Legacy",
    "Nada de atalhos rasos: o momento pede constância, organização financeira, contratos claros e paciência estratégica. O que você estruturar agora terá raízes para décadas.":
      "No shallow shortcuts: this moment calls for consistency, financial organization, clear contracts, and strategic patience. What you structure now will have roots for decades.",
    "Ciclo de Inteligência Comercial, Comunicação, Negócios e Versatilidade":
      "Cycle of Commercial Intelligence, Communication, Business & Versatility",
    "Destrave sua fala, escrita e negociação. Excelente período para estruturar ofertas, cursos, consultorias, parcerias intelectuais e organizar o fluxo financeiro com método.":
      "Unlock your speech, writing, and negotiation. An excellent period to structure offers, courses, consulting, intellectual partnerships, and organize financial flow methodically.",

    // HORÓSCOPO CHINÊS & ENEAGRAMA & BANHOS
    "Inteligência estratégica, charme magnético, percepção rápida de oportunidades e capacidade de prosperar mesmo em cenários difíceis.":
      "Strategic intelligence, magnetic charm, quick perception of opportunities, and the ability to prosper even in difficult scenarios.",
    "Ansiedade mental por acumular preocupações em silêncio e medo de escassez futura.":
      "Mental anxiety from accumulating worries in silence and fear of future scarcity.",
    "Força tranquila, lealdade inabalável, determinação, paciência construtora e colheita sólida através da constância.":
      "Quiet strength, unshakable loyalty, determination, constructive patience, and a solid harvest through consistency.",
    "Teimosia emocional, carregar fardos além do limite e dificuldade de demonstrar vulnerabilidade.":
      "Emotional stubbornness, carrying burdens beyond your limit, and difficulty showing vulnerability.",
    "Coragem magnética, liderança natural, paixão intensa, proteção feroz de quem ama e espírito desbravador.":
      "Magnetic courage, natural leadership, intense passion, fierce protection of loved ones, and a pioneering spirit.",
    "Impulsividade sob pressão, rebeldia contra controles injustos e oscilação entre tudo ou nada.":
      "Impulsiveness under pressure, rebellion against unfair control, and all-or-nothing oscillation.",
    "Diplomacia refinada, intuição artística, sensibilidade estética, empatia curadora e habilidade de abrir portas com doçura.":
      "Refined diplomacy, artistic intuition, aesthetic sensitivity, healing empathy, and the skill of opening doors with grace.",
    "Evitar confrontos necessários para manter a paz aparente e retração quando o ambiente fica hostil.":
      "Avoiding necessary confrontations to keep surface peace and withdrawing when the environment turns hostile.",
    "Presença imperial, visão grandiosa, magnetismo espiritual, vitalidade criativa e vocação para liderar grandes movimentos.":
      "Imperial presence, grand vision, spiritual magnetism, creative vitality, and a vocation to lead major movements.",
    "Autocobrança gigantesca, orgulho que impede de mostrar fraqueza e frustração com a mediocridade alheia.":
      "Immense self-demand, pride that prevents showing weakness, and frustration with others' mediocrity.",
    "Sabedoria profunda, intuição psíquica, elegância misteriosa, poder de transmutação e olhar clínico para a verdade.":
      "Deep wisdom, psychic intuition, mysterious elegance, power of transmutation, and a clinical eye for truth.",
    "Desconfiança silenciosa, dificuldade de esquecer traições e tendência a guardar segredos e dores para si.":
      "Silent distrust, difficulty forgetting betrayals, and a tendency to keep secrets and pain to yourself.",
    "Espírito livre, entusiasmo contagiante, independência, rapidez de raciocínio e carisma caloroso.":
      "Free spirit, contagious enthusiasm, independence, quick thinking, and warm charisma.",
    "Inquietação diante de rotinas aprisionadoras, impaciência e medo de perder a própria autonomia no amor.":
      "Restlessness in confining routines, impatience, and fear of losing your autonomy in love.",
    "Sensibilidade espiritual e artística, coração generoso, imaginação fértil e dom natural para terapias e harmonia.":
      "Spiritual and artistic sensitivity, generous heart, fertile imagination, and a natural gift for healing and harmony.",
    "Insegurança emocional quando falta apoio afetivo, absorção do pessimismo alheio e adiamento de decisões duras.":
      "Emotional insecurity when affective support is lacking, absorbing others' pessimism, and postponing hard decisions.",
    "Genialidade inventiva, versatilidade, humor inteligente, capacidade de resolver qualquer crise e mente brilhante.":
      "Inventive genius, versatility, intelligent wit, ability to solve any crisis, and a brilliant mind.",
    "Dispersão em múltiplos interesses simultâneos e desconfiança de que os outros não acompanham seu ritmo.":
      "Scattering across multiple simultaneous interests and feeling others cannot keep up with your pace.",
    "Clareza, franqueza, senso de organização, brilho pessoal, coragem para defender a verdade e olhar detalhista.":
      "Clarity, candor, organizational sense, personal brilliance, courage to defend the truth, and an eye for detail.",
    "Perfeccionismo crítico consigo e com o parceiro, desgaste com a desordem alheia e orgulho ferido.":
      "Critical perfectionism toward yourself and your partner, exhaustion with others' disorder, and wounded pride.",
    "Integridade absoluta, proteção leal, senso profundo de justiça, empatia pelos mais frágeis e coração nobre.":
      "Absolute integrity, loyal protection, deep sense of justice, empathy for the vulnerable, and a noble heart.",
    "Preocupação excessiva com quem ama, indignação com injustiças e demora para voltar a confiar após decepções.":
      "Excessive worry for loved ones, indignation over injustice, and taking a long time to trust again after disappointment.",
    "Nobreza de alma, generosidade, apreço pelo belo e pelo prazer sagrado, sinceridade e magnetismo de fartura.":
      "Nobility of soul, generosity, appreciation for beauty and sacred pleasure, sincerity, and magnetizing plenty.",
    "Ingênua confiança em pessoas interesseiras, dificuldade em dizer 'não' e engolir mágoas para não ferir o outro.":
      "Naive trust in self-serving people, difficulty saying 'no', and swallowing hurt so as not to offend others.",

    "Expansão criativa, crescimento contínuo, ética, visão de futuro e capacidade de florescer e abrir novos ramos.":
      "Creative expansion, continuous growth, ethics, future vision, and the ability to flourish and branch out.",
    "Excesso de sobrecarga ao tentar abraçar o mundo como uma árvore que abriga a todos.":
      "Overload from trying to embrace the whole world like a tree sheltering everyone.",
    "Brilho solar, paixão, poder de decisão, carisma quente e capacidade de iluminar e entusiasmar multidões.":
      "Solar brilliance, passion, decisive power, warm charisma, and the ability to illuminate and inspire multitudes.",
    "Esgotamento nervoso (burnout) quando queima a própria energia sem pausas de regeneração.":
      "Nervous burnout when burning your own energy without pauses for regeneration.",
    "Estabilidade, aterramento, realização material, nutrição segura e capacidade de sustentar grandes estruturas.":
      "Stability, grounding, material realization, safe nourishment, and the ability to sustain major structures.",
    "Preocupação excessiva, apego ao conhecido e lentidão para cortar laços que já venceram.":
      "Excessive worry, attachment to the familiar, and slowness in cutting ties that have expired.",
    "Precisão, nobreza, foco, retidão, resiliência inquebrável e poder de cortar o que é supérfluo.":
      "Precision, nobility, focus, uprightness, unbreakable resilience, and the power to cut away the superfluous.",
    "Rigidez emocional, melancolia silenciosa e dificuldade em flexibilizar padrões.":
      "Emotional rigidity, silent melancholy, and difficulty flexing patterns.",
    "Profundidade intuitiva, persuasão suave, adaptabilidade genial, sabedoria oculta e comunicação profunda.":
      "Intuitive depth, gentle persuasion, brilliant adaptability, hidden wisdom, and deep communication.",
    "Medos inconscientes que paralisam ou tendência a contornar obstáculos sem impor a própria vontade.":
      "Unconscious fears that paralyze or a tendency to flow around obstacles without asserting your own will.",

    "Centro Instintivo / Visceral": "Instinctive / Gut Center",
    "Centro Emocional / Coração": "Emotional / Heart Center",
    "Centro Mental / Cabeça": "Mental / Head Center",
    "O Ressentimento Silencioso e o Juiz Interno Implacável: sentir que nada está suficientemente bom e que qualquer erro seu é imperdoável.":
      "Silent Resentment and the Relentless Inner Judge: feeling that nothing is ever good enough and that any mistake of yours is unforgivable.",
    "A Serenidade e a Permissão: compreender que a perfeição divina inclui o processo humano e que você merece descanso antes mesmo de 'terminar tudo'.":
      "Serenity and Permission: understanding that divine perfection includes the human process and that you deserve rest even before 'finishing everything'.",
    "Tende a cobrar padrões altíssimos de si e do parceiro, engolindo frustrações até se tornar fria ou crítica.":
      "Tends to demand sky-high standards of yourself and your partner, swallowing frustrations until becoming cold or critical.",
    "Excelência impecável, mas trava lançamentos e precificação por achar que ainda falta polir mais um detalhe.":
      "Impeccable excellence, yet delays launches and pricing because you feel one more detail still needs polishing.",
    "Integra para o Tipo 7 (Alegria, Espontaneidade e Leveza): permita-se prazer sem culpa.":
      "Integrates toward Type 7 (Joy, Spontaneity & Lightness): allow yourself pleasure without guilt.",
    "O Orgulho de Não Precisar de Ninguém (enquanto salva a todos): doar-se até a exaustão esperando que o outro adivinhe suas necessidades.":
      "The Pride of Needing No One (while saving everyone): giving to exhaustion while hoping others will guess your needs.",
    "A Humildade Sagrada e o Autocuidado: reconhecer suas próprias necessidades abertamente e aprender a dizer 'não' sem culpa.":
      "Sacred Humility and Self-Care: openly acknowledging your own needs and learning to say 'no' without guilt.",
    "Assume o papel de salvadora/indispensável, atraindo pessoas que sugam seu cuidado sem oferecer reciprocidade.":
      "Takes on the savior/indispensable role, attracting people who drain your care without offering reciprocity.",
    "Cobra menos do que vale por empatia excessiva com a dor do cliente, misturando afeto com negócios.":
      "Charges less than you are worth out of excessive empathy for the client's pain, mixing affection with business.",
    "Integra para o Tipo 4 (Autenticidade e Mergulho em Si Mesma): volte o olhar amoroso para o seu próprio coração.":
      "Integrates toward Type 4 (Authenticity & Inner Depth): turn your loving gaze back toward your own heart.",
    "A Confusão entre 'Ser Amada' e 'Dar Resultado': medo profundo de que, se parar de produzir ou falhar, perderá o valor aos olhos do mundo.":
      "Confusing 'Being Loved' with 'Delivering Results': a deep fear that if you stop producing or fail, you will lose your value in the eyes of the world.",
    "A Verdade e a Autenticidade: saber que seu valor existe pelo que você É na essência, não apenas pelos troféus que entrega.":
      "Truth and Authenticity: knowing your worth exists for who you ARE in essence, not merely for the trophies you deliver.",
    "Coloca o trabalho como escudo ou mantém uma imagem de mulher inabalável, dificultando a intimidade vulnerável.":
      "Uses work as a shield or maintains an image of an unshakable woman, making vulnerable intimacy difficult.",
    "Altíssima capacidade de realização, mas risco de esgotamento (burnout) ou de construir sucesso em uma meta que não alimenta a alma.":
      "Extraordinary capacity for achievement, but at risk of burnout or building success on a goal that does not feed your soul.",
    "Integra para o Tipo 6 (Lealdade à Própria Essência e Vínculos Reais): desacelere para sentir.":
      "Integrates toward Type 6 (Loyalty to Your Essence & Real Bonds): slow down to feel.",
    "A Sensação de Falta e Melancolia Comparativa: sentir que falta uma peça em você que os outros parecem ter com facilidade.":
      "The Sense of Lack and Comparative Melancholy: feeling that a piece is missing in you which others seem to possess effortlessly.",
    "A Equanimidade Emocional: parar de esperar o estado emocional perfeito para agir e reconhecer a riqueza do que já está presente.":
      "Emotional Equanimity: stopping the wait for the perfect emotional state to act and recognizing the richness of what is already present.",
    "Busca conexões profundas e poéticas; pode idealizar amores distantes ou testar a intensidade do parceiro.":
      "Seeks deep, poetic connections; may idealize distant loves or test a partner's intensity.",
    "Talento autoral único e insubstituível; trava quando depende apenas da inspiração emocional para manter a rotina.":
      "Unique, irreplaceable authorial talent; freezes when relying solely on emotional inspiration to maintain a routine.",
    "Integra para o Tipo 1 (Estrutura Prática, Método e Constância Diária): transforme inspiração em rotina.":
      "Integrates toward Type 1 (Practical Structure, Method & Daily Consistency): turn inspiration into routine.",
    "A Avareza Energética e o Isolamento na Mente: medo de que o mundo e as relações esgotem suas reservas internas.":
      "Energetic Guardedness and Isolation in the Mind: fear that the world and relationships will deplete your inner reserves.",
    "O Desapego e a Presença no Corpo: sair da análise mental infinita e compartilhar sua sabedoria viva com o mundo.":
      "Detachment and Embodied Presence: stepping out of endless mental analysis and sharing your living wisdom with the world.",
    "Precisa de espaço e privacidade; sob pressão, levanta muralhas de silêncio e racionaliza o que sente.":
      "Needs space and privacy; under pressure, raises walls of silence and rationalizes feelings.",
    "Acumula conhecimento profundo, mas adia a exposição pública por sentir que precisa estudar mais.":
      "Accumulates deep knowledge, yet postpones public visibility out of feeling you still need to study more.",
    "Integra para o Tipo 8 (Força Instintiva, Presença Corporal e Comando no Mundo).":
      "Integrates toward Type 8 (Instinctive Strength, Embodied Presence & Command in the World).",
    "A Ansiedade Antecipatória e a Dúvida: escanear o futuro em busca de riscos, traições ou imprevistos antes que aconteçam.":
      "Anticipatory Anxiety and Doubt: scanning the future for risks, betrayals, or surprises before they happen.",
    "A Coragem e a Fé na Própria Autoridade Interna: confiar no seu próprio taco sem precisar de garantias absolutas.":
      "Courage and Faith in Your Inner Authority: trusting your own capability without needing absolute guarantees.",
    "Leal e comprometida, mas pode testar a segurança do parceiro por medo de ser abandonada ou traída.":
      "Loyal and committed, yet may test a partner's security out of fear of abandonment or betrayal.",
    "Excelente estrategista e prevenidora de crises, mas o medo de arriscar pode mantê-la presa em zonas seguras abaixo do seu potencial.":
      "Excellent strategist and crisis preventer, but fear of risk can keep you in safe zones below your potential.",
    "Integra para o Tipo 9 (Paz Interior, Relaxamento Mental e Confiança no Fluxo da Vida).":
      "Integrates toward Type 9 (Inner Peace, Mental Relaxation & Trust in the Flow of Life).",
    "A Fuga da Dor e do Aprisionamento: pular de ideia em ideia ou de estímulo em estímulo para não sentir vazio ou limitação.":
      "Flight from Pain and Confinement: jumping from idea to idea or stimulus to stimulus to avoid feeling emptiness or limitation.",
    "A Sobriedade Luminosa e o Foco: mergulhar fundo em uma escolha até colher o néctar completo da realização.":
      "Luminous Sobriety and Focus: diving deep into one choice until harvesting the full nectar of fulfillment.",
    "Traz alegria e encantamento; trava quando sente que a relação virou rotina pesada ou cobrança.":
      "Brings joy and enchantment; freezes when feeling a relationship has turned into heavy routine or demand.",
    "Mente brilhante para iniciar projetos e enxergar futuros, precisando apenas de foco para finalizar o que começa.":
      "Brilliant mind for initiating projects and seeing futures, needing only focus to finish what you start.",
    "Integra para o Tipo 5 (Profundidade, Silêncio Criativo e Maestria Especializada).":
      "Integrates toward Type 5 (Depth, Creative Silence & Specialized Mastery).",
    "A Armadura da Invulnerabilidade: jurar nunca mais ser controlada ou ferida, assumindo o comando de tudo na força.":
      "The Armor of Invulnerability: swearing never to be controlled or hurt again, taking command of everything by force.",
    "A Inocência e a Ternura Confiante: descobrir que abrir a guarda para quem merece não diminui sua soberania.":
      "Innocence and Confident Tenderness: discovering that lowering your guard for someone worthy does not diminish your sovereignty.",
    "Intensa, leal e protetora; precisa cuidar para não intimidar o parceiro ou transformar a relação em cabo de guerra.":
      "Intense, loyal, and protective; needs care not to intimidate your partner or turn the relationship into a tug-of-war.",
    "Nascida para grandes realizações e liderança; destrava ainda mais quando delega e governa com leveza.":
      "Born for major achievements and leadership; unlocks even further when delegating and leading with lightness.",
    "Integra para o Tipo 2 (Coração Aberto, Compaixão e Permissão para Cuidar e Ser Cuidada).":
      "Integrates toward Type 2 (Open Heart, Compassion & Permission to Care and Be Cared For).",
    "O Auto-Esquecimento (Anestesia da Própria Vontade): fundir-se com a agenda dos outros e adiar os próprios sonhos para evitar conflito.":
      "Self-Forgetting (Anesthetizing Your Own Will): merging with others' agendas and postponing your own dreams to avoid conflict.",
    "A Ação Certa e o Despertar de Si: declarar sua própria voz, seus desejos e sua prioridade sem medo de desagradar.":
      "Right Action and Self-Awakening: declaring your own voice, desires, and priority without fear of displeasing.",
    "Acolhedora e pacífica, mas pode anular os próprios gostos até acumular uma teimosia silenciosa.":
      "Warm and peaceful, yet may efface your own preferences until accumulating silent stubbornness.",
    "Trava pela procrastinação nas prioridades próprias enquanto resolve demandas secundárias de todo mundo.":
      "Freezes through procrastination on your own priorities while solving everyone else's secondary demands.",
    "Integra para o Tipo 3 (Foco, Brilho Pessoal, Protagonismo e Realização Prática).":
      "Integrates toward Type 3 (Focus, Personal Brilliance, Protagonism & Practical Realization).",

    "Autoexigência e Juízo Crítico": "Self-Demand & Critical Judgment",
    "Necessidade de Ser Indispensável": "Need to Be Indispensable",
    "Busca por Validação via Performance": "Seeking Validation Through Performance",
    "Melancolia e Nostalgia do Ideal": "Melancholy & Nostalgia for the Ideal",
    "Retração Protetora de Energia": "Protective Energy Withdrawal",
    "Hipervigilância e Antecipação de Riscos": "Hypervigilance & Risk Anticipation",
    "Inquietação e Fuga da Dor": "Restlessness & Flight from Pain",
    "Blindagem Contra a Vulnerabilidade": "Armor Against Vulnerability",
    "Auto-Esquecimento pela Paz Aparente": "Self-Forgetting for Surface Peace",

    "Banho de Alecrim Fresco, Pétalas de Rosa Branca e Camomila Morna":
      "Warm Bath of Fresh Rosemary, White Rose Petals & Chamomile",
    "Ferva 1,5L de água, desligue o fogo e adicione um punhado de camomila, 3 ramos de alecrim e pétalas de 1 rosa branca. Abafe por 15 minutos com um prato. Após seu banho higiênico, despeje do pescoço para baixo mentalizando o resfriamento da ansiedade e a clareza do seu brilho real.":
      "Boil 1.5L of water, turn off the heat, and add a handful of chamomile, 3 rosemary sprigs, and the petals of 1 white rose. Cover for 15 minutes. After your regular shower, pour from the neck down while visualizing cooling anxiety and awakening the clarity of your true brilliance.",
    "Ametista & Quartzo Rosa (para transmutar a hipervigilância em magnetismo sereno)":
      "Amethyst & Rose Quartz (to transmute hypervigilance into serene magnetism)",
    "Terça-feira ou Domingo, antes de dormir": "Tuesday or Sunday, before sleep",

    "Banho de Folhas de Louro, Canela em Pau, Manjericão e Mel":
      "Herbal Bath of Bay Leaves, Cinnamon Stick, Basil & Honey",
    "Ferva 1,5L de água com 3 paus de canela e 7 folhas de louro por 3 minutos. Desligue, acrescente folhas frescas de manjericão e 7 gotas de mel. Abafe por 15 minutos. Jogue do pescoço para baixo decretando a quebra do teto financeiro e a permissão para prosperar com leveza.":
      "Boil 1.5L of water with 3 cinnamon sticks and 7 bay leaves for 3 minutes. Turn off the heat, add fresh basil leaves and 7 drops of honey. Cover for 15 minutes. Pour from the neck down while decreeing the breaking of your financial ceiling and permission to prosper with ease.",
    "Citrino Natural & Pirita (para ancorar merecimento material e destravar entradas)":
      "Natural Citrine & Pyrite (to anchor material worthiness and unlock financial flow)",
    "Quinta-feira ou Domingo pela manhã": "Thursday or Sunday morning",

    "Banho de Lavanda (Alfazema), Anis-Estrelado e Sálvia":
      "Herbal Bath of Lavender, Star Anise & Sage",
    "Ferva 1,5L de água com 5 estrelas de anis. Desligue o fogo e adicione um punhado de flores de lavanda e folhas de sálvia. Abafe por 15 minutos. Despeje do pescoço para baixo limpando o excesso de cenários mentais, a dúvida e alinhando sua intuição com sua voz.":
      "Boil 1.5L of water with 5 star anise pods. Turn off the heat and add a handful of lavender flowers and sage leaves. Cover for 15 minutes. Pour from the neck down to clear excessive mental scenarios and doubt, aligning your intuition with your voice.",
    "Lápis-Lazúli & Selenita Branca (para silenciar o ruído mental e abrir a visão oracular)":
      "Lapis Lazuli & White Selenite (to quiet mental noise and open oracular vision)",
    "Quarta-feira ao anoitecer": "Wednesday at dusk",

    "Banho de Arruda (ou Guiné), Rosas Vermelhas e Flor de Laranjeira":
      "Herbal Bath of Rue, Red Rose Petals & Orange Blossom",
    "Em 1,5L de água recém-fervida, coloque 3 galhos pequenos de arruda (para cortar cordões energéticos do passado), pétalas de 1 rosa vermelha e flor de laranjeira. Abafe por 15 minutos. Jogue do pescoço para baixo sentindo toda dor alheia e memória afetiva antiga escorrer pelo ralo.":
      "In 1.5L of freshly boiled water, place 3 small sprigs of rue (to cut energetic cords from the past), the petals of 1 red rose, and orange blossom. Cover for 15 minutes. Pour from the neck down, feeling all absorbed pain and old emotional memories wash away.",
    "Pedra da Lua & Turmalina Negra (para blindar sua empatia e restaurar seu magnetismo feminino)":
      "Moonstone & Black Tourmaline (to shield your empathy and restore your feminine magnetism)",
    "Sexta-feira ou noite de Lua Cheia/Minguante": "Friday or a Full/Waning Moon night"
  };

  // Regras de substituição parcial e expressões regulares para conteúdos dinâmicos (Simulador, Dossiê e PDF)
  const PATTERN_REPLACEMENTS = [
    // Simulador e Status Dinâmicos
    [/Sombra detectada:\s*/g, "Detected shadow: "],
    [/Código\s+(\d+-\d+-\d+)/g, "Code $1"],
    [/Quíron em\s+/g, "Chiron in "],
    [/Mansão Lunar Védica:\s*/g, "Vedic Lunar Mansion: "],
    [/, identificamos a sua tríade cármica/g, ", we identified your karmic triad"],
    [/e a posição de Quíron em/g, "and the position of Chiron in"],
    [/Para cruzar esses dados com seu/g, "To cross-reference these details with your"],
    [/Nome Completo de Batismo/g, "Full Birth Name"],
    [/Linha do Amor/g, "Love Line"],
    [/Linha do Dinheiro/g, "Money Line"],
    [/Questionário dos 3 Pilares/g, "3-Pillar Questionnaire"],
    [/, escolha seu plano abaixo e gere seu PDF completo:/g, ", choose your plan below and generate your complete PDF:"],
    [/Pedido monitorado:\s*/g, "Monitored order: "],
    [/· E-mail:\s*/g, "· Email: "],
    [/Monitorando pedido\s+/g, "Monitoring order "],
    [/para o e-mail\s+/g, "for email "],
    [/Validando comprovante da InfinitePay… \[verificação #(\d+)\]/g, "Validating InfinitePay receipt… [check #$1]"],
    [/Validando comprovante da InfinitePay… \[checagem #(\d+)\]/g, "Validating InfinitePay receipt… [check #$1]"],
    [/Validando comprovante de retorno da InfinitePay…/g, "Validating return receipt from InfinitePay…"],
    [/Pagamento confirmado pela InfinitePay!/g, "Payment confirmed by InfinitePay!"],
    [/Seu acesso à Anamnese está liberado\./g, "Your access to the Intake Questionnaire is unlocked."],
    [/Clique no botão abaixo para iniciar sua Anamnese\./g, "Click the button below to begin your Intake Questionnaire."],
    [/Modo Mestra reconhecido!/g, "Master Mode recognized!"],
    [/Acesso administrativo ilimitado ao Standard e Completo\./g, "Unlimited administrative access to Standard and Complete."],
    [/Questionário Robusto Ativo \(Análise Profunda\):/g, "Robust Questionnaire Active (Deep Analysis):"],
    [/Suas respostas sobre raízes familiares e ansiedade serão integralmente cruzadas no dossiê\./g, "Your answers regarding family roots and anxiety will be fully cross-referenced in the dossier."],
    [/Nota:/g, "Note:"],
    [/Na versão Standard estas perguntas calibram sua base emocional; por um pequeno acréscimo na/g, "In the Standard version these questions calibrate your emotional baseline; for a small additional investment in the"],
    [/, você desbloqueia a leitura completa das dinâmicas familiares, Mapa Védico do momento atual e Dons Natos\./g, ", you unlock the complete reading of family dynamics, Current Moment Vedic Chart, and Innate Gifts."],
    [/✓ Localizado:/g, "✓ Located:"],
    [/Usando fuso padrão Brasília \(-3 UTC\) para /g, "Using default Brasília timezone (-3 UTC) for "],
    [/Cidade registrada: /g, "Registered city: "],
    [/✦ Signo Oriental detectado pelo Calendário Lunar:/g, "✦ Eastern Sign detected by Lunar Calendar:"],
    [/Polaridade /g, "Polarity "],

    // Dossiê e PDF — Cabeçalhos e Folhas
    [/Dossiê Oracular Personalizado · Análise Profunda Completa/g, "Personalized Oracular Dossier · Complete Deep Analysis"],
    [/Dossiê Oracular Personalizado · Análise Standard/g, "Personalized Oracular Dossier · Standard Analysis"],
    [/Mapa do Desbloqueio Invisível — /g, "Invisible Unlocking Chart — "],
    [/Nascida em /g, "Born on "],
    [/\(Mapa Solar\)/g, "(Solar Chart)"],
    [/às (\d{2}:\d{2})/g, "at $1"],
    [/Elemento Fogo/g, "Fire Element"],
    [/Elemento Terra/g, "Earth Element"],
    [/Elemento Ar/g, "Air Element"],
    [/Elemento Água/g, "Water Element"],
    [/Raiz Emocional/g, "Emotional Root"],
    [/Grau (\d+°\d+′) · MC em /g, "Degree $1 · MC in "],
    [/Momento Atual:/g, "Current Moment:"],
    [/Alma (\d+) · Destino (\d+)/g, "Soul $1 · Destiny $2"],
    [/Dom Dia (\d+) · Ano Pessoal (\d+)/g, "Birth Day Gift $1 · Personal Year $2"],
    [/Arcano ([IVXLCDM]+) · /g, "Arcanum $1 · "],
    [/Asas /g, "Wings "],
    [/Quando você opera no piloto automático, essa combinação drena sua energia nos 3 eixos \(Emocional:/g, "When you operate on autopilot, this combination drains your energy across all 3 axes (Emotional:"],
    [/Relações & Afetos:/g, "Relationships & Affections:"],
    [/Prosperidade:/g, "Prosperity:"],
    [/Numerologia Kármica & Dons Natos de /g, "Karmic Numerology & Innate Gifts of "],
    [/Motivação da Alma \(/g, "Soul Urge / Motivation ("],
    [/Expressão & Talento \(/g, "Expression & Talent ("],
    [/Destino \/ Caminho de Vida \(/g, "Destiny / Life Path ("],
    [/Ano Pessoal (\d+): Vibração (\d+)/g, "Personal Year $1: Vibration $2"],
    [/✦ Mapa dos Seus Dons Natos \(Dia Natal (\d+) · Vibração (\d+)/g, "✦ Map of Your Innate Gifts (Birth Day $1 · Vibration $2"],
    [/Lições Cármicas Detectadas no Nome \(Números Ausentes:/g, "Karmic Lessons Detected in Name (Missing Numbers:"],
    [/Detectada no Seu Mapa Kármico/g, "Detected in Your Karmic Chart"],
    [/<b>Origem:<\/b>/g, "<b>Origin:</b>"],
    [/<b>Impacto:<\/b>/g, "<b>Impact:</b>"],
    [/<b>Cura:<\/b>/g, "<b>Healing Key:</b>"],
    [/Cruzamento de Arquétipos:/g, "Archetype Cross-Analysis:"],
    [/Ano Lunar (\d+)/g, "Lunar Year $1"],
    [/Dom Nato do Animal \(/g, "Innate Animal Gift ("],
    [/Força do Elemento /g, "Strength of Element "],
    [/Sua Matriz do Destino & Cauda Cármica/g, "Your Destiny Matrix & Karmic Tail"],
    [/Centro de Poder \(Arcano /g, "Power Center (Arcanum "],
    [/Sua Cauda Cármica de Vidas Passadas:/g, "Your Past-Life Karmic Tail:"],
    [/Sua Cauda Cármica de Vidas Passadas é/g, "Your Past-Life Karmic Tail is"],
    [/e seu Regente Védico atual é/g, "and your current Vedic Ruler is"],
    [/Veja ao final deste relatório sua condição VIP com desconto especial para desbloquear todas as camadas da Análise Profunda\./g, "See at the end of this report your VIP condition with a special discount to unlock all layers of the Deep Analysis."],
    [/Mapa Védico \(Momento Atual & Direção\) \+ Mapa Kármico/g, "Vedic Chart (Current Moment & Direction) + Karmic Chart"],
    [/Mansão Lunar Védica (\d+):/g, "Vedic Lunar Mansion $1:"],
    [/Lua Sideral em /g, "Sidereal Moon in "],
    [/⏳ O Seu Momento Atual no Mapa Védico \(Ciclo Regido por /g, "⏳ Your Current Moment in the Vedic Chart (Cycle Ruled by "],
    [/Casa (\d+)/g, "House $1"],
    [/Relações & Afetos \(/g, "Relationships & Affections ("],
    [/Seu Código de Abatimento VIP:/g, "Your VIP Upgrade Credit Code:"],
    [/💬 Resgatar Desconto de Upgrade no WhatsApp/g, "💬 Redeem Upgrade Discount on WhatsApp"],
    [/✦ Atendimento Individual Especializado/g, "✦ Specialized 1-on-1 Session"],
    [/Sujeito à análise prévia e disponibilidade de agenda da Tryv Tuath®\./g, "Subject to prior review and schedule availability of Tryv Tuath®."],
    [/Sujeito à análise prévia de perfil e disponibilidade de agenda da Tryv Tuath®\./g, "Subject to prior profile review and schedule availability of Tryv Tuath®."],

    // PDF e Textos Internos do Motor
    [/TRYV TUATH® · DOSSIÊ ORACULAR & PSICANALÍTICO DO DESBLOQUEIO INVISÍVEL/g, "TRYV TUATH® · ORACULAR & PSYCHOANALYTIC INVISIBLE UNLOCKING DOSSIER"],
    [/ANÁLISE PROFUNDA COMPLETA \(6 SABERES \+ PROTOCOLO 21 DIAS\)/g, "COMPLETE DEEP ANALYSIS (6 WISDOMS + 21-DAY PROTOCOL)"],
    [/ANÁLISE STANDARD \(DIAGNÓSTICO ESSENCIAL & AFETOS\)/g, "STANDARD ANALYSIS (ESSENTIAL DIAGNOSIS & AFFECTIONS)"],
    [/ANÁLISE PROFUNDA COMPLETA/g, "COMPLETE DEEP ANALYSIS"],
    [/ANÁLISE STANDARD/g, "STANDARD ANALYSIS"],
    [/tryvtuath\.com\.br · Você é o oráculo · Não substitui acompanhamento clínico individual/g, "tryvtuath.com.br · You are the oracle · Does not replace 1-on-1 clinical accompaniment"],
    [/Pág\.\s*(\d+)/g, "Page $1"],
    [/TRYV TUATH® · ORÁCULOS, PSICANÁLISE & MENTORIA/g, "TRYV TUATH® · ORACLES, PSYCHOANALYSIS & MENTORING"],
    [/O DESBLOQUEIO INVISÍVEL/g, "THE INVISIBLE UNLOCKING"],
    [/Dossiê Completo: Astrologia, Jyotish Védica, Numerologia Kármica, Matriz & Arquétipos/g, "Complete Dossier: Astrology, Vedic Jyotish, Karmic Numerology, Matrix & Archetypes"],
    [/Diagnóstico Essencial: Raiz do Bloqueio, Relações\/Afetos, Arquétipos & Soluções Práticas/g, "Essential Diagnosis: Root of the Block, Relationships/Affections, Archetypes & Practical Solutions"],
    [/MAPA CONSAGRADO EXCLUSIVAMENTE PARA:/g, "CHART CONSECRATED EXCLUSIVELY FOR:"],
    [/Hora não informada \(Mapa Solar 12:00\)/g, "Birth time not provided (12:00 Solar Chart)"],
    [/SOL TROPICAL/g, "TROPICAL SUN"],
    [/LUA & EMOÇÕES/g, "MOON & EMOTIONS"],
    [/ASCENDENTE/g, "ASCENDANT"],
    [/QUÍRON \(FERIDA\)/g, "CHIRON (WOUND)"],
    [/NAKSHATRA VÉDICA/g, "VEDIC NAKSHATRA"],
    [/ALMA & DESTINO/g, "SOUL & DESTINY"],
    [/CENTRO DA MATRIZ/g, "MATRIX CENTER"],
    [/ENEAGRAMA/g, "ENNEAGRAM"],
    [/ALQUIMIA ORIENTAL/g, "EASTERN ALCHEMY"],
    [/Nota Ética: Esta ferramenta automatizada oferece autoconhecimento profundo, mas não substitui a análise clínica individual de um profissional\. Tryv Tuath® é psicanalista formada em traumas familiares, ansiedade e depressão e mentora em pacotes trimestrais\/semestrais\./g, "Ethical Notice: This automated tool offers deep self-knowledge, but does not replace 1-on-1 clinical analysis with a professional. Tryv Tuath® is a psychoanalyst trained in family trauma, anxiety, and depression, and a mentor in quarterly/semi-annual packages."],
    [/“Mude-se e descobrirá novos outros para refletir-se\. Você é o oráculo\.” — Tryv Tuath®/g, "“Change yourself and you will discover new others to reflect you. You are the oracle.” — Tryv Tuath®"],
    [/Nascimento:/g, "Birth:"],
    [/Local:/g, "Location:"],
    [/Modalidade:/g, "Tier:"],
    [/Emitido em /g, "Issued on "],

    // SVG Matriz do Destino
    [/♥ AMOR/g, "♥ LOVE"],
    [/\$ DINHEIRO/g, "$ MONEY"],
    [/Pai-Esp/g, "Pat-Spir"],
    [/Mãe-Esp/g, "Mat-Spir"],
    [/Pai-Mat/g, "Pat-Mat"],
    [/Mãe-Mat/g, "Mat-Mat"],
    [/Retrato/g, "Portrait"],
    [/Espírito/g, "Spirit"],
    [/Matéria/g, "Matter"],
    [/Carma/g, "Karma"],
    [/CENTRO/g, "CENTER"],

    // Textos dinâmicos do Dossiê e Diagnóstico Cruzado
    [/A Raiz Emocional: /g, "The Emotional Root: "],
    [/O Código Afetivo: /g, "The Romantic Code: "],
    [/A Chave da Prosperidade: /g, "The Key to Prosperity: "],
    [/Canal do Amor/g, "Love Channel"],
    [/Canal do Dinheiro/g, "Money Channel"],
    [/A colisão entre /g, "The intersection between "],
    [/a Cauda Cármica /g, "Karmic Tail "],
    [/e Saturno em /g, "and Saturn in "],
    [/você relatou sentir/g, "you reported feeling"],
    [/e reagir às pressões através de/g, "and reacting to pressure through"],
    [/O cruzamento do seu mapa revela que isso NÃO é fraqueza nem acaso: você nasceu com/g, "Cross-referencing your chart reveals this is NEITHER weakness NOR chance: you were born with"],
    [/Ao mesmo tempo, sua Lua em/g, "At the same time, your Moon in"],
    [/tem como mecanismo de defesa inconsciente:/g, "has as its unconscious defense mechanism:"],
    [/Na Numerologia do seu Nome de Batismo, sua/g, "In the Numerology of your Birth Name, your"],
    [/Motivação da Alma é/g, "Soul Urge is"],
    [/Porém, quando sua ferida de/g, "However, when your wound of"],
    [/é acionada, você entra no bloqueio do número/g, "is triggered, you enter the block of number"],
    [/e na paixão inconsciente do/g, "and the unconscious passion of"],
    [/No \*\*Questionário Clínico-Oracular Robusto\*\*, você identificou a marca familiar de/g, "In the **Robust Clinical-Oracular Questionnaire**, you identified the family imprint of"],
    [/e a manifestação de ansiedade\/esgotamento como/g, "and the manifestation of anxiety/exhaustion as"],
    [/Na visão clínica e psicanalítica da Tryv Tuath®, essa resposta confirma que o seu sistema nervoso aprendeu a confundir amor e segurança com estado de alerta contínuo — exatamente na intersecção entre o seu/g, "In Tryv Tuath®'s clinical and psychoanalytic view, this answer confirms that your nervous system learned to confuse love and safety with a continuous state of alert — right at the intersection between your"],
    [/e a sua \*\*Linhagem Ancestral na Matriz do Destino/g, "and your **Ancestral Lineage in the Destiny Matrix"],
    [/Na Matriz do Destino, o seu \*\*Centro de Força é o/g, "In the Destiny Matrix, your **Power Center is"],
    [/e sua \*\*Cauda Cármica é/g, "and your **Karmic Tail is"],
    [/Para destravar o seu emocional, você precisa parar de lutar contra a sensibilidade da sua Lua em/g, "To unlock your emotional field, you must stop fighting the sensitivity of your Moon in"],
    [/ativar a virtude do seu Eneatipo/g, "activate the virtue of your Enneatype"],
    [/e aplicar a chave da sua Cauda Cármica/g, "and apply the key of your Karmic Tail"],
    [/No campo afetivo, você identificou o padrão de/g, "In the romantic sphere, you identified the pattern of"],
    [/Olhando para a sua \*\*Lilith \(Lua Negra\) em/g, "Looking at your **Lilith (Black Moon) in"],
    [/cruzada com \*\*Vênus em/g, "cross-referenced with **Venus in"],
    [/a origem desse padrão fica cristalina:/g, "the origin of this pattern becomes crystal clear:"],
    [/mostra como seu coração realmente funciona:/g, "shows how your heart truly works:"],
    [/Contudo, a entrada do seu \*\*Canal dos Relacionamentos na Matriz do Destino\*\* é regida pelo/g, "However, the entrance to your **Relationship Channel in the Destiny Matrix** is ruled by"],
    [/com centro no/g, "centered on"],
    [/Quando esse canal vibra no polo negativo, acontece exatamente o que você viveu:/g, "When this channel vibrates in its shadow pole, what you experienced happens:"],
    [/Somado ao seu/g, "Combined with your"],
    [/no amor \(/g, "in love ("],
    [/e à sombra de/g, "and the shadow of"],
    [/na Alquimia Oriental \(/g, "in Eastern Alchemy ("],
    [/você acaba tolerando migalhas afetivas por tempo demais\./g, "you end up tolerating emotional crumbs for far too long."],
    [/Para completar, seu \*\*Número de Impressão/g, "To complete the picture, your **Impression Number"],
    [/projeta para os parceiros uma imagem externa de quem "dá conta de tudo", fazendo com que pessoas imaturas se apoiem na sua força em vez de cuidarem de você\./g, "projects an outer image of someone who 'handles everything alone', causing immature partners to lean on your strength instead of taking care of you."],
    [/O seu desbloqueio amoroso exige ativar o polo luminoso do/g, "Your romantic unlocking requires activating the luminous pole of"],
    [/Pare imediatamente de assumir o papel de terapeuta ou salvadora nas relações\./g, "Immediately stop taking on the role of therapist or savior in relationships."],
    [/No eixo profissional e financeiro, você apontou/g, "In the career and financial axis, you pointed out"],
    [/e a crença\/bloqueio de/g, "and the belief/block of"],
    [/explica a raiz exata dessa trava material:/g, "explains the exact root of this material block:"],
    [/Na sua \*\*Matriz do Destino\*\*, a porta de entrada do seu dinheiro é o/g, "In your **Destiny Matrix**, the entrance to your money channel is"],
    [/guiado pelo/g, "guided by"],
    [/e guardado pelo/g, "and guarded by"],
    [/Veja o que fecha e o que abre seu fluxo financeiro:/g, "See what closes and what opens your financial flow:"],
    [/Na Numerologia, seu \*\*Número de Expressão é/g, "In Numerology, your **Expression Number is"],
    [/e seu \*\*Destino é/g, "and your **Destiny is"],
    [/enquanto você atravessa em (\d{4}) o Ano Pessoal (\d+)/gi, "while you cross in $1 Personal Year $2"],
    [/No Ano Pessoal (\d+) \(([^)]+)\), sua energia rende o triplo quando você honra seu dom de /g, "In Personal Year $1 ($2), your energy yields threefold when you honor your gift of "],
    [/\bo Ano Pessoal/g, "Personal Year"],
    [/e a \*\*Lua em /g, "and the **Moon in "],
    [/e a Lua em /g, "and the Moon in "],
    [/Nakshatra Védica/g, "Vedic Nakshatra"],
    [/Por um pequeno acréscimo de investimento, você pode ter acesso imediato à Análise Profunda Completa e a um questionário diagnóstico muito mais robusto para compreender melhor a si mesma, mapear suas heranças inconscientes e destravar seus caminhos de melhoria\./g, "For a small additional investment, you can gain immediate access to the Complete Deep Analysis and a much more robust diagnostic questionnaire to better understand yourself, map your unconscious legacies, and unlock your paths of improvement."],
    [/Seu nome de batismo possui todas as 9 vibrações numéricas presentes, o que significa que você já tem todas as ferramentas internas — faltava apenas alinhar a rota!/g, "Your birth name contains all 9 numerical vibrations, meaning you already hold every internal tool — you only needed to align your route!"],
    [/Para romper seu teto financeiro nos próximos 90 dias \(rumo à sua meta:/g, "To break through your financial ceiling over the next 90 days (toward your goal:"],
    [/ative o/g, "activate"],
    [/confirma que sua evolução está em abandonar a velha defesa de/g, "confirms that your evolution lies in leaving behind the old defense of"],
    [/e assumir a coragem de/g, "and embracing the courage of"],
    [/1\. Detox Emocional & Quebra da Autossabotagem/g, "1. Emotional Detox & Breaking Self-Sabotage"],
    [/2\. Reposicionamento em Relações & Afetos/g, "2. Repositioning in Relationships & Affections"],
    [/3\. Ativação do Caminho Suave & Fluxo Material/g, "3. Activating the Gentlest Path & Material Flow"],
    [/Semana 1 \(Dias 1 a 7\) — Desintoxicação Emocional & Corte da Cauda Cármica/g, "Week 1 (Days 1 to 7) — Emotional Detox & Cutting the Karmic Tail"],
    [/Semana 2 \(Dias 8 a 14\) — Reprogramação do Magnetismo Afetivo/g, "Week 2 (Days 8 to 14) — Reprogramming Romantic Magnetism"],
    [/Semana 3 \(Dias 15 a 21\) — Abertura do Canal do Dinheiro & Ação de Destino/g, "Week 3 (Days 15 to 21) — Opening the Money Channel & Destiny Action"],

    // Textos compostos de Dons Natos, Soluções Práticas, Protocolo 21 Dias, Fundamentos e PDF
    [/Nascida no dia (\d+) \(Vibração (\d+) — ([^)]+)\), você trouxe de berço a faculdade natural de /g, "Born on day $1 (Vibration $2 — $3), you brought from birth the natural faculty of "],
    [/Sua Expressão (\d+) \(([^)]+)\) somada à maior concentração de letras na vibração (\d+) \(([^)]+)\) revela que seu talento inato opera sem esforço quando você atua com autonomia criativa, leitura intuitiva de pessoas e direção estratégica\./g, "Your Expression $1 ($2) combined with the highest letter concentration in vibration $3 ($4) reveals that your innate talent operates effortlessly when you act with creative autonomy, intuitive reading of people, and strategic direction."],
    [/Para transitar pela vida por um caminho mais suave e próspero, pare de tentar vencer pelo desgaste bruto \(forçando métodos rígidos que contrariam sua Alma (\d+)\)\. Seu fluxo de menor resistência acontece quando você usa o seu Dom do Dia (\d+) \(([^)]+)\) aliado à Maturidade (\d+) \(([^)]+)\): posicione-se onde sua sensibilidade, voz e visão única sejam o centro do seu valor, permitindo que os resultados venham por magnetismo e alinhamento, e não por exaustão\./g, "To move through life along a gentler and more prosperous path, stop trying to win through sheer exhaustion (forcing rigid methods that contradict your Soul $1). Your path of least resistance happens when you use your Birth Day Gift $2 ($3) allied with Maturity $4 ($5): position yourself where your sensitivity, voice, and unique vision are the center of your value, allowing results to come through magnetism and alignment rather than burnout."],
    [/Além disso, sua Nakshatra natal \(([^,]+), regida por (.+?)\) lembra que o seu caminho mais suave exige honrar seu símbolo sagrado \((.+?)\) e evitar o desgaste de lutar contra sua natureza intuitiva\./g, "Furthermore, your natal Nakshatra ($1, ruled by $2) reminds you that your gentlest path requires honoring your sacred symbol ($3) and avoiding the strain of fighting your intuitive nature."],
    [/\(sob a frequência de (.+?) cruzada à sua raiz em ([^)]+)\)/g, "(under the frequency of $1 cross-referenced with your root in $2)"],
    [/Sempre que o gatilho de /g, "Whenever the trigger of "],
    [/ surgir, reconheça que é a memória de /g, " arises, recognize that it is the memory of "],
    [/ e a paixão do /g, " and the passion of "],
    [/ tentando te proteger\. Em vez de reagir com /g, " trying to protect you. Instead of reacting with "],
    [/, pratique a pausa consciente de 90 segundos e aplique o caminho de integração: /g, ", practice a conscious 90-second pause and apply the integration path: "],
    [/Para encerrar o ciclo de /g, "To end the cycle of "],
    [/, alinhe sua (.+?) ao /g, ", align your $1 with "],
    [/: estabeleça limites claros logo no início das interações, pare de justificar ausências alheias e permita ser cuidada sem precisar comprar amor através de excesso de prestatividade\./g, ": establish clear boundaries right at the start of interactions, stop justifying others' absences, and allow yourself to be cared for without needing to buy love through over-giving."],
    [/No Ano Pessoal (\d+) \(([^)]+)\), sua energia rende o triplo quando você honra seu dom de /g, "In Personal Year $1 ($2), your energy yields threefold when you honor your gift of "],
    [/\. Concentre 80% da sua rotina na sua zona de genialidade natural \(Destino (\d+)\) e corte tarefas onde você age apenas por culpa\./g, ". Focus 80% of your routine in your zone of natural genius (Destiny $1) and cut tasks where you act solely out of guilt."],
    [/“Eu, ([^,]+), libero com amor toda lealdade invisível à dor e ao limite\. Eu assumo a luz do meu ([^,]+), honro minha sensibilidade e abro meus caminhos para o amor recíproco e a abundância soberana\. Assim é\.”/g, "“I, $1, lovingly release all invisible loyalty to pain and limitation. I claim the light of my $2, honor my sensitivity, and open my paths to reciprocal love and sovereign abundance. So it is.”"],
    [/Realizar o (.+?) e escrever em uma folha tudo o que você vem carregando por culpa ou medo \((.+?)\)\. Queime a folha com segurança na chama de uma vela branca, declarando encerrado o ciclo de repetição\./g, "Perform the $1 and write on a sheet of paper everything you have been carrying out of guilt or fear ($2). Safely burn the paper in the flame of a white candle, declaring the cycle of repetition closed."],
    [/Praticar o limite sagrado da sua ([^:]+): durante 7 dias, não tome a frente para 'salvar' ou resolver problemas emocionais de adultos ao seu redor\. Recupere sua energia magnética e repita seu Mantra ao acordar\./g, "Practice the sacred boundary of your $1: for 7 days, do not step in to 'save' or solve the emotional problems of adults around you. Reclaim your magnetic energy and repeat your Decree upon waking."],
    [/Executar 1 movimento concreto alinhado ao seu Arcano do Dinheiro \((.+?)\) e ao seu (.+?) em direção à sua meta de 90 dias \((.+?)\)\./g, "Execute 1 concrete step aligned with your Money Arcanum ($1) and your $2 toward your 90-day goal ($3)."],
    [/Tríade Cármica (\d+-\d+-\d+)/g, "Karmic Triad $1"],
    [/Em existências passadas, sua alma viveu intensos aprendizados ligados aos arquétipos de (.+?) e ([^,]+), deixando uma memória inconsciente de /g, "In past lives, your soul experienced intense lessons linked to the archetypes of $1 and $2, leaving an unconscious memory of "],
    [/Em existências passadas, sua alma viveu intensos aprendizados ligados aos arquétipos de (.+?) e ([^,]+), deixando uma memória celular que hoje pede equilíbrio através de /g, "In past lives, your soul experienced intense lessons linked to the archetypes of $1 and $2, leaving a cellular memory that today calls for balance through "],
    [/Nesta vida, sempre que você entra em estresse emocional ou financeiro, tende a ativar a defesa de ([^:]+): /g, "In this life, whenever you enter emotional or financial stress, you tend to activate the defense of $1: "],
    [/Sua libertação cármica acontece quando você eleva a tríade (\d+-\d+-\d+) para a luz: /g, "Your karmic liberation happens when you elevate triad $1 into the light: "],
    [/Você possui (?:a Lição Cármica|as Lições Cármicas) \*\*([^*]+)\*\* ausentes nas letras do seu nome de batismo, o que exige atenção consciente a: /g, "You have Karmic Lesson(s) **$1** missing from the letters of your birth name, requiring conscious attention to: "],
    [/Você possui (?:a Lição Cármica|as Lições Cármicas) ([0-9, ]+) ausentes nas letras do seu nome de batismo, o que exige atenção consciente a: /g, "You have Karmic Lesson(s) $1 missing from the letters of your birth name, requiring conscious attention to: "],
    [/A sabedoria ancestral do (.+?) combina /g, "The ancestral wisdom of the $1 combines "],
    [/\(Atenção sob desequilíbrio: /g, "(Watch under imbalance: "],
    [/No Horóscopo Oriental, sua força vital é a de \*\*([^*]+)\*\* \(([^)]+)\)\. Isso confere a você um dom natural de \*([^*]+)\* potencializado pelo elemento ([^*]+)\(\*([^*]+)\*\)\. Seu ponto de atenção ocorre sob estresse: /g, "In the Eastern Horoscope, your vital force is **$1** ($2). This grants you a natural gift of *$3* enhanced by the element $4(*$5*). Your point of attention under stress is: "],
    [/Ciclo Solar-Lunar de (\d+)/g, "Solar-Lunar Cycle of $1"],
    [/foco em /g, "focus on "],
    [/Em (\d{4}), você vive a vibração do Ano Pessoal (\d+) \(([^)]+)\): /g, "In $1, you live the vibration of Personal Year $2 ($3): "],
    [/Enquanto você atravessa em (\d{4}) o Ano Pessoal (\d+)/gi, "While you cross in $1 Personal Year $2"],
    [/Sua (\*\*)?(?:Vênus|Venus) em /g, "Your $1Venus in "],
    [/Seu (\*\*)?(?:Saturno|Saturn) em /g, "Your $1Saturn in "],
    [/Seu (\*\*)?(?:Nodo Norte|North Node) em /g, "Your $1North Node in "],
    [/um desgaste interno silencioso/g, "a silent internal drain"],
    [/autodefesa emocional/g, "emotional self-defense"],
    [/cobrança interna/g, "internal self-criticism"],
    [/lealdade invisível e sobrecarga precoce/g, "invisible loyalty and early overload"],
    [/tensão constante e hipervigilância/g, "constant tension and hypervigilance"],
    [/atrair dinâmicas desgastantes/g, "attracting draining dynamics"],
    [/desequilíbrio afetivo/g, "romantic imbalance"],
    [/ansiedade ou exaustão/g, "anxiety or exhaustion"],
    [/hipercontrole/g, "hyper-control"],
    [/a sensação de um teto invisível/g, "the feeling of an invisible ceiling"],
    [/precisar se esforçar demais/g, "having to work twice as hard"],
    [/prosperidade e autonomia/g, "prosperity and autonomy"],
    [/expansão profissional e financeira/g, "professional and financial expansion"],
    [/Sobrecarga emocional e repetição de ciclos internos/g, "Emotional overload and repetition of internal cycles"],
    [/Oscilação entre hipercontrole e exaustão/g, "Oscillation between hyper-control and exhaustion"],
    [/Ferida de validação e pertencimento/g, "Validation and belonging wound"],
    [/Desequilíbrio entre entrega e reciprocidade/g, "Imbalance between giving and reciprocity"],
    [/Busca por conexão autêntica/g, "Search for authentic connection"],
    [/Teto invisível de crescimento e reconhecimento/g, "Invisible ceiling of growth and recognition"],
    [/Sobrecarga e dificuldade de escalar ganhos/g, "Overload and difficulty scaling earnings"],
    [/Suas trilhas principais \(Alma, Expressão, Destino e Dia Natal\) não carregam as travas clássicas 13, 14, 16 ou 19\. Seus bloqueios atuais não vêm de dívidas numéricas antigas, mas de condicionamentos emocionais e escolhas desta existência\./g, "Your main pathways (Soul, Expression, Destiny, and Birth Day) do not carry the classic 13, 14, 16, or 19 debts. Your current blocks do not stem from ancient numerical debts, but from emotional conditioning and choices in this lifetime."],
    [/Origem: /g, "Origin: "],
    [/Impacto atual: /g, "Current impact: "],
    [/Chave de cura: /g, "Healing key: "],
    [/Raiz Inconsciente: /g, "Unconscious Root: "],

    // Fundamentos Místicos e Convites Terapias (parágrafos dinâmicos)
    [/Uma das dúvidas mais fascinantes de quem acessa este dossiê é perceber que a posição dos astros na[\s\S]*?sob a mansão estelar \(\*\*Nakshatra\*\*\) \*\*([^*]+)\*\*\./g,
      "One of the most fascinating discoveries for those who access this dossier is noticing that planetary positions in **Western (Tropical) Astrology** can differ by about 24 degrees from **Indian Vedic Astrology (Jyotish — 'The Science of Light')**. In your chart, your Sidereal Vedic placement operates under the stellar mansion (**Nakshatra**) **$1**."],
    [/\*\*1\. O Zodíaco Tropical \(Ocidental — A Sua Psicologia e Personalidade\):\*\*[\s\S]*?identidade social\./g,
      "**1. The Tropical Zodiac (Western — Your Psychology & Personality):** Synchronized with Earth's seasons, the Tropical Zodiac acts as the mirror of your **conscious psyche**: it describes how your ego expresses itself, how you experience environmental shifts, and how you build your social identity."],
    [/\*\*2\. O Zodíaco Sideral Védico \(Jyotish — A Bagagem da Alma e o Cronograma Kármico\):\*\*[\s\S]*?área específica\)\./g,
      "**2. The Sidereal Vedic Zodiac (Jyotish — Soul Baggage & Karmic Timeline):** Originating in the ancient Vedas of India over 5,000 years ago, Jyotish accounts for the astronomical **Precession of the Equinoxes** (*Lahiri Ayanamsa*), pointing to the actual physical constellations in the sky. Rather than replacing your Western sign, it reveals the layer **prior to the ego** — your *Samskaras* (past-life memories), your **Lunar Nakshatra**, and your **Dashas** (the planetary periods explaining why your current life phase calls for maturity in specific areas)."],
    [/A \*\*Matriz do Destino\*\* é um sistema de geometria sagrada[\s\S]*?linhagens paterna e materna\./g,
      "The **Destiny Matrix** is a system of sacred geometry and archetypal psychology that translates your birth date into an **Octagram (Eight-Pointed Star)** formed by two overlapping squares: the **Diagonal (Personal) Square** — revealing your Portrait, Spiritual Connection, Material/Prosperity Line, and Karmic Base — and the **Straight (Ancestral) Square**, which holds the legacies of your paternal and maternal lineages."],
    [/No coração do Octagrama habita o seu \*\*Centro de Força[\s\S]*?Polo de Sombra \(Bloqueio\)\*\*\./g,
      "At the heart of the Octagram resides your **Power Center**, acting as the energetic engine of your soul. Each of the 22 Major Arcana is not a fixed sentence, but a vibrational spectrum that can operate in its **Light Pole (Flow)** or **Shadow Pole (Block)**."],
    [/Na base inferior da Matriz encontra-se a \*\*Cauda Cármica[\s\S]*?degrau de sabedoria\./g,
      "At the lower base of the Matrix lies the **Karmic Tail**: a triad of arcana recording the exact point where your soul left an unfinished lesson in past lives. While operating unconsciously, it attracts repetitive patterns in love and finances; once brought to awareness and healed, that very wound becomes your greatest stepping stone of wisdom."],
    [/O \*\*Eneagrama\*\* é uma das ferramentas mais profundas[\s\S]*?autossabotagem\./g,
      "The **Enneagram** is one of the deepest tools for mapping the human psyche, uniting ancient initiatic wisdom and clinical psychodynamics across **3 Centers of Intelligence** (Instinctive/Gut, Emotional/Heart, and Mental/Head). Your core archetype reveals the emotional armor you put on in childhood to feel safe and loved, as well as your **Integration Arrow** — the practical movement that frees you from self-sabotage."],
    [/Já a \*\*Alquimia Oriental \(Horóscopo Chinês[\s\S]*?drenam seu magnetismo\./g,
      "**Eastern Alchemy (Chinese Horoscope & Five-Element Theory — Wu Xing)** calculates, through the astronomical lunisolar calendar, the exact combination of the **12 Animal Archetypes** and the **5 Elements of Nature (Wood, Fire, Earth, Metal, and Water)** in Yin or Yang polarity, revealing how your vital energy circulates in your body, relationships, and career."],
    [/O método d’\*\*O Desbloqueio Invisível\*\* foi estruturado por \*\*Tryv Tuath®\*\*[\s\S]*?Decretos Psicomágicos\)\./g,
      "The method of **The Invisible Unlocking** was structured by **Tryv Tuath®** because no human block lives on a single level: it has a **psychic and unconscious** root (addressed by Psychoanalysis and the Enneagram), a **karmic and archetypal** structure (revealed by Tropical/Vedic Astrology and the Destiny Matrix), a **sound and vocational** code (decoded by Karmic Numerology and Birth Name Innate Gifts), and an **energetic** condensation in the subtle field (cleared through Herbal Baths, Crystals, and Psychomagical Decrees)."],
    [/Quando você compreende mentalmente o seu padrão, reposiciona suas escolhas práticas e limpa simultaneamente o seu campo vibracional, o ciclo de repetição perde a força e o seu \*\*caminho mais suave\*\* se abre\./g,
      "When you mentally understand your pattern, reposition your practical choices, and simultaneously clear your vibrational field, the repetition cycle loses its hold and your **gentlest path** opens up."],
    [/Neste dossiê identificamos seu[\s\S]*?saúde e relacionamentos\./g,
      "In this dossier we identified your core solar, lunar, Chiron, and Vedic Nakshatra placements. In an in-depth 1-on-1 analysis with Tryv Tuath, we dive into all 12 astrological Houses, Planetary Aspects, your current Solar Return, and the complete timeline of your Vedic periods (Mahadashas and Antardashas) to guide career, life transitions, health, and relationship decisions."],
    [/Sua Matriz tem como Centro[\s\S]*?canais do Amor e do Dinheiro\./g,
      "In an exclusive 1-on-1 Destiny Matrix session with Tryv, we open all 22 points of your Octagram: inherited programs from your paternal and maternal lineages, the 7-Chakra health map in the Matrix, year-by-year archetypal forecasts, and guided unlocking of your Love and Money channels."],
    [/Seu nome carrega a Alma[\s\S]*?prosperidade e magnetismo\./g,
      "In an in-depth numerological consultation with Tryv, we analyze your 3 Major Life Cycles, 4 Pinnacles, Karmic Challenges, Relationship/Business Harmony, and design (if needed) your Power Signature or Professional Name to unlock prosperity and magnetism."],
    [/A Tryv é psicanalista formada em traumas familiares[\s\S]*?ligações telefônicas\./g,
      "Tryv is a psychoanalyst trained in family trauma, anxiety, and depression, as well as a mentor specialized in guiding you through real-life challenges. To work directly on dissolving your emotional triggers, healing family roots, and sustaining your emotional, romantic, and financial breakthrough, explore 1-on-1 accompaniment in quarterly or semi-annual phone session packages."],
    [/Na sua Análise Standard, revelamos sua Tríade[\s\S]*?Nome de Batismo\*\*\./g,
      "In your Standard Analysis, we revealed your Solar/Lunar Triad, the core pattern of your Relationships/Affections, and your Enneagram & Chinese Horoscope synthesis. For a small additional investment, you unlock the **Expanded Diagnostic Questionnaire** and the complete cross-referencing of your **Past-Life Karmic Tail**, your **Current Vedic Planetary Period**, and your **Innate Gifts & Complete Karmic Numerology**."],
    [/Questionário Diagnóstico Mais Robusto:[\s\S]*?precisa\./g,
      "More Robust Diagnostic Questionnaire: In-depth clinical questions on family dynamics, anxiety triggers, and worthiness blocks for an even more precise reading."],
    [/Mapa Védico Sideral Aprofundado \(Jyotish\):[\s\S]*?Direcionamento Prático\./g,
      "In-Depth Sidereal Vedic Chart (Jyotish): Complete Tropical vs. Vedic demystification + what your current planetary cycle requires of you right now and your Practical Guidance."],
    [/Numerologia Kármica Completa \+ Dons Natos:[\s\S]*?mais suave\./g,
      "Complete Karmic Numerology + Innate Gifts: Discover your hidden Karmic Lessons and Debts and the Map of your Innate Gifts to follow a much gentler path."],
    [/Geometria Sagrada da Matriz do Destino \(22 Arcanos\) \+ Protocolo de 21 Dias:[\s\S]*?decreto pessoal\./g,
      "Sacred Geometry of the Destiny Matrix (22 Arcana) + 21-Day Protocol: Unlocking your Karmic Tail, Money Channel, herbal baths, crystals, and personal decree."],

    // Seções e Rótulos do PDF (motor-desbloqueio.js -> gerarPDFPersonalizado)
    [/MAPA ASTRAL NATAL · POSIÇÕES PLANETÁRIAS E PONTOS KÁRMICOS/g, "NATAL BIRTH CHART · PLANETARY POSITIONS & KARMIC POINTS"],
    [/Ascendente em /g, "Ascendant in "],
    [/Meio do Céu em /g, "Midheaven (MC) in "],
    [/Mapa Solar Natal \(Casas Solares calculadas ao meio-dia\)/g, "Natal Solar Chart (Solar Houses calculated at noon)"],
    [/Parte I · Visão Geral do Diagnóstico & Fundamentos/g, "Part I · Diagnostic Overview & Foundations"],
    [/O Seu Código Central, Índices de Bloqueio e Sinergia Terapêutica/g, "Your Core Code, Blockage Indices & Therapeutic Synergy"],
    [/Bem-vinda ao seu Dossiê do Desbloqueio Invisível, /g, "Welcome to your Invisible Unlocking Dossier, "],
    [/\. Este documento foi gerado pelo cruzamento entre os seus dados sagrados de nascimento /g, ". This document was generated by cross-referencing your sacred birth details "],
    [/ e as respostas que você entregou sobre seus padrões emocionais, afetivos e profissionais\./g, " with the answers you shared regarding your emotional, romantic, and professional patterns."],
    [/Arquétipo Mestre Identificado/g, "Master Archetype Identified"],
    [/Seu ponto central de força é regido pelo /g, "Your central point of strength is ruled by "],
    [/Contudo, o seu Bloqueio Invisível atua na interseção entre /g, "However, your Invisible Block operates at the intersection between "],
    [/Eixo 1 · Tensão & Desgaste Emocional/g, "Axis 1 · Emotional Tension & Drain"],
    [/Eixo 2 · Repetição em Relações & Afetos/g, "Axis 2 · Repetition in Relationships & Affections"],
    [/Eixo 3 · Trava de Prosperidade & Vocação/g, "Axis 3 · Prosperity & Vocation Block"],
    [/% de energia represada/g, "% of dammed energy"],
    [/Fundamentos do Método & Aviso Ético Profissional/g, "Method Foundations & Professional Ethical Notice"],
    [/Parte II · Numerologia do Nome de Batismo/g, "Part II · Birth Name Numerology"],
    [/A Gematria Sagrada de /g, "The Sacred Gematria of "],
    [/Motivação da Alma: Número (\d+) \(Soma das Vogais: (\d+)\)/g, "Soul Urge: Number $1 (Vowel Sum: $2)"],
    [/Bloqueio quando ferida: /g, "Block when wounded: "],
    [/Expressão & Talento: Número (\d+) \(Soma Total: (\d+)\)/g, "Expression & Talent: Number $1 (Total Sum: $2)"],
    [/Couraça externa \(Impressão (\d+)\): /g, "Outer Persona (Impression $1): "],
    [/Destino \/ Caminho de Vida: Número (\d+) · Ano Pessoal (\d+): (\d+)/g, "Destiny / Life Path: Number $1 · Personal Year $2: $3"],
    [/Parte II-B · Dons Natos & Numerologia Kármica Completa/g, "Part II-B · Innate Gifts & Complete Karmic Numerology"],
    [/Seus Talentos de Berço e o Caminho Mais Suave/g, "Your Birth Talents & The Gentlest Path"],
    [/Dom de Nascimento \(Dia Natal (\d+) · Vibração (\d+)\)/g, "Birth Gift (Birth Day $1 · Vibration $2)"],
    [/O Seu Caminho Mais Suave \(Fluxo de Menor Resistência\)/g, "Your Gentlest Path (Path of Least Resistance)"],
    [/Alinhamento entre Alma (\d+), Expressão (\d+) e Maturidade (\d+)/g, "Alignment between Soul $1, Expression $2, and Maturity $3"],
    [/Lições Cármicas Ausentes no Nome/g, "Missing Karmic Lessons in Birth Name"],
    [/Aprendizados que sua alma veio integrar nesta existência/g, "Lessons your soul came to integrate in this lifetime"],
    [/Plenitude Vibracional no Nome de Batismo/g, "Vibrational Fullness in Birth Name"],
    [/Ausência de Lições Cármicas Pendentes \(1 a 9 Presentes\)/g, "No Pending Karmic Lessons (1 to 9 Present)"],
    [/Todas as 9 frequências numéricas estão presentes nas letras do seu nome de batismo\. Isso indica uma alma experiente que já trouxe todas as ferramentas vibracionais e precisa apenas direcionar o foco sem dispersão\./g, "All 9 numerical frequencies are present in the letters of your birth name. This indicates an experienced soul who brought all vibrational tools and only needs to focus without dispersion."],
    [/Alerta de Dívida Cármica Detectada/g, "Karmic Debt Alert Detected"],
    [/Análise de Dívidas Cármicas Transgeracionais \(13, 14, 16, 19\)/g, "Transgenerational Karmic Debt Analysis (13, 14, 16, 19)"],
    [/Caminho Livre de Penalidades Numéricas Antigas/g, "Path Free of Ancient Numerical Penalties"],
    [/Suas trilhas principais \(Alma, Expressão, Destino e Dia Natal\) não carregam as travas clássicas 13, 14, 16 ou 19\. Seus bloqueios atuais não são punições do passado, mas sim desalinhamento entre seu Dom Nato e o ambiente ao qual você vem tentando se adaptar\./g, "Your main pathways (Soul, Expression, Destiny, and Birth Day) do not carry the classic 13, 14, 16, or 19 debts. Your current blocks are not punishments from the past, but misalignment between your Innate Gift and the environment you have been trying to adapt to."],
    [/Parte III · Eneagrama Sagrado & Alquimia Oriental/g, "Part III · Sacred Enneagram & Eastern Alchemy"],
    [/Horóscopo Chinês/g, "Chinese Horoscope"],
    [/Psicodinâmica do Eneagrama/g, "Enneagram Psychodynamics"],
    [/Paixão Emocional:/g, "Emotional Passion:"],
    [/No Amor e Afetos:/g, "In Love & Affections:"],
    [/Na Carreira:/g, "In Career:"],
    [/Caminho de Cura e Integração:/g, "Healing & Integration Path:"],
    [/Horóscopo Chinês & Alquimia dos 5 Elementos/g, "Chinese Horoscope & 5-Element Alchemy"],
    [/Essência e Dom Nato Oriental:/g, "Eastern Essence & Innate Gift:"],
    [/Influência do Elemento /g, "Influence of Element "],
    [/Sombra a Vigiar:/g, "Shadow to Watch:"],
    [/Parte IV · Diagnóstico do Eixo Emocional/g, "Part IV · Emotional Axis Diagnosis"],
    [/Chave de Desbloqueio Emocional/g, "Emotional Unlocking Key"],
    [/Como virar a chave interna/g, "How to turn the inner key"],
    [/Parte V · Matriz do Destino \(22 Arcanos\)/g, "Part V · Destiny Matrix (22 Arcana)"],
    [/Arcano Regente Central/g, "Central Ruling Arcanum"],
    [/Luz:/g, "Light:"],
    [/Sombra \/ Trava Invisível:/g, "Shadow / Invisible Block:"],
    [/Seu Cartão de Visita \(Dia\):/g, "Your Calling Card (Day):"],
    [/Memória de Vidas Passadas:/g, "Past-Life Memory:"],
    [/Como trava você hoje:/g, "How it blocks you today:"],
    [/Libertação:/g, "Liberation:"],
    [/Parte VI · Astrologia Kármica & Mapa Natal/g, "Part VI · Karmic Astrology & Natal Chart"],
    [/Posições Planetárias, Quíron, Lilith, Saturno e Nodos Lunares/g, "Planetary Positions, Chiron, Lilith, Saturn & Lunar Nodes"],
    [/A Ferida Primordial e o Dom de Cura/g, "The Primal Wound & Healing Gift"],
    [/O Magnetismo Reprimido e a Sombra Relacional/g, "Repressed Magnetism & Relational Shadow"],
    [/Parte VII · Astrologia Tropical vs\. Védica Sideral \(Jyotish\)/g, "Part VII · Tropical vs. Sidereal Vedic Astrology (Jyotish)"],
    [/Momento Atual & Direcionamento/g, "Current Moment & Guidance"],
    [/Lua Sideral \(Chandra Rashi\):/g, "Sidereal Moon (Chandra Rashi):"],
    [/Mansão Lunar:/g, "Lunar Mansion:"],
    [/Divindade Védica:/g, "Vedic Deity:"],
    [/Diagnóstico Raiz Jyotish:/g, "Jyotish Root Diagnosis:"],
    [/O Seu Momento Atual no Mapa Védico \(Regência Ativa:/g, "Your Current Moment in the Vedic Chart (Active Ruler:"],
    [/O Que a Astrologia Indiana Revela Sobre a Fase Que Você Está Atravessando/g, "What Indian Astrology Reveals About the Phase You Are Crossing"],
    [/Direcionamento Prático Védico \(Ação Recomendada\)/g, "Practical Vedic Guidance (Recommended Action)"],
    [/Como Alinhar Suas Decisões com o Ciclo de /g, "How to Align Your Decisions with the Cycle of "],
    [/Parte VIII · Diagnóstico de Relações & Afetos/g, "Part VIII · Relationships & Affections Diagnosis"],
    [/Chave de Desbloqueio Afetivo/g, "Romantic Unlocking Key"],
    [/Parte IX · Diagnóstico Profissional & Financeiro/g, "Part IX · Career & Financial Diagnosis"],
    [/Ativação do /g, "Activation of "],
    [/Parte X · Protocolo Alquímico Tryv Tuath®/g, "Part X · Tryv Tuath® Alchemical Protocol"],
    [/Banho de Ervas, Cristal, Decreto e Plano de 21 Dias/g, "Herbal Bath, Crystal, Decree & 21-Day Plan"],
    [/Ritual de Limpeza e Abertura/g, "Cleansing & Opening Ritual"],
    [/Cristal de Ancoragem Recomendado:/g, "Recommended Anchoring Crystal:"],
    [/Decreto Psicomágico de Desbloqueio \(Repetir por 21 Dias\)/g, "Psychomagical Unlocking Decree (Repeat for 21 Days)"],
    [/Reprogramação Vibracional do Nome de Batismo/g, "Vibrational Reprogramming of the Birth Name"],
    [/Plano Prático de Ação/g, "Practical Action Plan"],
    [/Parte VI · Astrologia Tropical vs\. Astrologia Védica \(Jyotish\)/g, "Part VI · Tropical Astrology vs. Vedic Astrology (Jyotish)"],
    [/Parte VII · Análise de Relações, Afetos & Vínculos/g, "Part VII · Relationships, Affections & Bonds Analysis"],
    [/Como curar o padrão no /g, "How to heal the pattern in the "],
    [/Parte VIII · Soluções Práticas & Direcionamento Imediato/g, "Part VIII · Practical Solutions & Immediate Guidance"],
    [/3 Ações Concretas Para Destravar Sua Energia Hoje/g, "3 Concrete Actions to Unlock Your Energy Today"],
    [/Solução Prática Recomendada/g, "Recommended Practical Solution"],
    [/Decreto de Alinhamento Tryv Tuath®/g, "Tryv Tuath® Alignment Decree"],
    [/Ativação Vibracional do /g, "Vibrational Activation of "],
    [/Parte IX · Upgrade Para Análise Profunda & Benefício por Indicação/g, "Part IX · Upgrade to Deep Analysis & Referral Benefit"],
    [/Como Acessar o Questionário Mais Robusto e o Dossiê Completo/g, "How to Access the More Robust Questionnaire & Complete Dossier"],
    [/O Que Você Desbloqueia Ao Fazer o Upgrade Para a Análise Profunda/g, "What You Unlock When Upgrading to the Deep Analysis"],
    [/Regra de Desconto por Indicação \(5 Indicações\) · Código VIP:/g, "Referral Discount Rule (5 Referrals) · VIP Code:"],
    [/Indique 5 Pessoas e Ganhe Desconto Especial no Valor Complementar do Pacote Completo/g, "Refer 5 People and Earn a Special Discount on the Complete Package Upgrade"],
    [/Link direto da Análise Profunda:/g, "Direct link to Deep Analysis:"],
    [/Acompanhamento Clínico, Oracular & Mentoria Individual/g, "Clinical, Oracular & 1-on-1 Mentoring Accompaniment"],
    [/Agende com a Tryv sua Análise Completa e Aprofundada/g, "Schedule Your Complete In-Depth Analysis with Tryv"],
    [/Psicanálise Clínica & Mentoria Especializada \(Pacotes Trimestrais e Semestrais\)/g, "Clinical Psychoanalysis & Specialized Mentoring (Quarterly & Semi-Annual Packages)"],
    [/Tryv Tuath® — Psicanalista Formada em Traumas Familiares, Ansiedade e Depressão/g, "Tryv Tuath® — Psychoanalyst Trained in Family Trauma, Anxiety & Depression"],
    [/CHAMADA PARA AÇÃO:/g, "CALL TO ACTION:"],

    // Signos, Planetas, Elementos e Arcanos (executados após os blocos de frase para não fragmentar padrões)
    [/\bÁries\b/g, "Aries"],
    [/\bTouro\b/g, "Taurus"],
    [/\bGêmeos\b/g, "Gemini"],
    [/\bCâncer\b/g, "Cancer"],
    [/\bLeão\b/g, "Leo"],
    [/\bVirgem\b/g, "Virgo"],
    [/\bEscorpião\b/g, "Scorpio"],
    [/\bSagitário\b/g, "Sagittarius"],
    [/\bCapricórnio\b/g, "Capricorn"],
    [/\bAquário\b/g, "Aquarius"],
    [/\bPeixes\b/g, "Pisces"],
    [/\bMercúrio\b/g, "Mercury"],
    [/\bVênus\b/g, "Venus"],
    [/\bMarte\b/g, "Mars"],
    [/\bJúpiter\b/g, "Jupiter"],
    [/\bSaturno\b/g, "Saturn"],
    [/\bUrano\b/g, "Uranus"],
    [/\bNetuno\b/g, "Neptune"],
    [/\bPlutão\b/g, "Pluto"],
    [/\bQuíron\b/g, "Chiron"],
    [/\bNodo Norte\b/g, "North Node"],
    [/\bNodo Sul\b/g, "South Node"],
    [/\bO Mago\b/g, "The Magician"],
    [/\bA Sacerdotisa\b/g, "The High Priestess"],
    [/\bA Imperatriz\b/g, "The Empress"],
    [/\bO Imperador\b/g, "The Emperor"],
    [/\bO Hierofante\b/g, "The Hierophant"],
    [/\bOs Enamorados\b/g, "The Lovers"],
    [/\bO Carro\b/g, "The Chariot"],
    [/\bA Justiça\b/g, "Justice"],
    [/\bO Eremita\b/g, "The Hermit"],
    [/\bA Roda da Fortuna\b/g, "Wheel of Fortune"],
    [/\bA Força\b/g, "Strength"],
    [/\bO Enforcado\b/g, "The Hanged Man"],
    [/\bA Morte\b/g, "Death"],
    [/\bA Temperança\b/g, "Temperance"],
    [/\bO Diabo\b/g, "The Devil"],
    [/\bA Torre\b/g, "The Tower"],
    [/\bA Estrela\b/g, "The Star"],
    [/\bA Lua\b/g, "The Moon"],
    [/\bO Sol\b/g, "The Sun"],
    [/\bO Julgamento\b/g, "Judgement"],
    [/\bO Mundo\b/g, "The World"],
    [/\bO Louco\b/g, "The Fool"]
  ];

  // Mapa rápido em maiúsculas para cabeçalhos do PDF que chamam .toUpperCase() antes de doc.splitTextToSize
  const UPPER_EXACT_MAP = {};
  for (const [k, v] of Object.entries(EXACT_MAP)) {
    UPPER_EXACT_MAP[k.toUpperCase()] = v.toUpperCase();
  }

  // Lista ordenada de frases de tabelas do motor (SIGNOS, ARCANOS, NUMEROLOGIA, ENEAGRAMA, CHINES, DASHA)
  // executada APÓS os padrões estruturais de parágrafo para não fragmentar sentenças compostas
  const SUBSTRING_PHRASES = [];
  for (const [k, v] of Object.entries(EXACT_MAP)) {
    if (k.length >= 24) {
      SUBSTRING_PHRASES.push([k, v]);
      const kLower = k.toLowerCase();
      if (kLower !== k) {
        const vLower = v.charAt(0).toLowerCase() + v.slice(1);
        SUBSTRING_PHRASES.push([kLower, vLower]);
      }
      if (/^Dom natural de /i.test(k)) {
        const kSemDom = k.replace(/^Dom natural de /i, "");
        const vSemDom = v.replace(/^Natural gift of /i, "");
        if (kSemDom.length >= 20) {
          SUBSTRING_PHRASES.push([kSemDom, vSemDom]);
        }
      }
    }
  }
  SUBSTRING_PHRASES.sort((a, b) => b[0].length - a[0].length);

  const PATTERN_REPLACEMENTS_CI = PATTERN_REPLACEMENTS.map(([rx, repl]) => [
    new RegExp(rx.source, rx.flags.includes("i") ? rx.flags : rx.flags + "i"),
    repl
  ]);

  function normalizarEspacos(str) {
    return String(str || "").replace(/\s+/g, " ").trim();
  }

  function lerIdiomaPreferido() {
    try {
      if (typeof location !== "undefined" && location.search) {
        if (/[?&](?:en|lang=en)\b/i.test(location.search)) {
          salvarIdiomaNoStorage("en");
          return "en";
        }
        if (/[?&](?:pt|lang=pt(?:-br)?)\b/i.test(location.search)) {
          salvarIdiomaNoStorage("pt-BR");
          return "pt-BR";
        }
      }

      const salvoTryv = localStorage.getItem(STORAGE_KEY);
      const salvoBemdito = localStorage.getItem(MAIN_SITE_STORAGE_KEY);
      const ultimoSync = localStorage.getItem(SYNC_KEY);

      // Se a pessoa alterou o idioma no site principal (index.html usa "bemdito-idioma": "en" | "pt"),
      // sincroniza imediatamente com o Desbloqueio ("tryv_idioma": "en" | "pt-BR")
      if (salvoBemdito === "en" || salvoBemdito === "pt") {
        if (!salvoTryv || ultimoSync !== salvoBemdito) {
          const langSincronizado = salvoBemdito === "en" ? "en" : "pt-BR";
          try {
            localStorage.setItem(STORAGE_KEY, langSincronizado);
            localStorage.setItem(SYNC_KEY, salvoBemdito);
          } catch {}
          idiomaAtual = langSincronizado;
          return langSincronizado;
        }
      }

      if (salvoTryv === "en" || salvoTryv === "pt-BR" || salvoTryv === "pt") {
        const langNormalizado = salvoTryv === "en" ? "en" : "pt-BR";
        const equivBemdito = langNormalizado === "en" ? "en" : "pt";
        try {
          if (salvoTryv === "pt") localStorage.setItem(STORAGE_KEY, "pt-BR");
          if (salvoBemdito !== equivBemdito) localStorage.setItem(MAIN_SITE_STORAGE_KEY, equivBemdito);
          if (ultimoSync !== equivBemdito) localStorage.setItem(SYNC_KEY, equivBemdito);
        } catch {}
        idiomaAtual = langNormalizado;
        return langNormalizado;
      }
    } catch {}

    if (idiomaAtual === "en" || idiomaAtual === "pt-BR") {
      return idiomaAtual;
    }
    idiomaAtual = DEFAULT_LANG;
    return DEFAULT_LANG;
  }

  function salvarIdiomaNoStorage(langNormalizado) {
    const isEn = langNormalizado === "en";
    const equivBemdito = isEn ? "en" : "pt";
    idiomaAtual = isEn ? "en" : "pt-BR";
    try {
      localStorage.setItem(STORAGE_KEY, idiomaAtual);
      localStorage.setItem(MAIN_SITE_STORAGE_KEY, equivBemdito);
      localStorage.setItem(SYNC_KEY, equivBemdito);
    } catch {}
  }

  function getIdioma() {
    return lerIdiomaPreferido();
  }

  function aplicarPrecosUsdEmIngles(strEn) {
    if (!strEn || typeof strEn !== "string") return strEn;
    let stdUsd = "7.67";
    let profUsd = "19.57";
    try {
      if (global.GuardiaoPagamentoInfinitePay && typeof global.GuardiaoPagamentoInfinitePay.obterTabelaPrecosPayPal === "function") {
        const tab = global.GuardiaoPagamentoInfinitePay.obterTabelaPrecosPayPal();
        if (tab && tab.planos) {
          stdUsd = tab.planos.standard.precoFinalUsdStr;
          profUsd = tab.planos.profunda.precoFinalUsdStr;
        }
      }
    } catch {}
    return strEn
      .replace(/\(R\$\s*37(?:,00)?\)/g, `($${stdUsd} USD)`)
      .replace(/\(R\$\s*97(?:,00)?\)/g, `($${profUsd} USD)`)
      .replace(/\bR\$\s*37(?:,00)?\b/g, `$${stdUsd} USD`)
      .replace(/\bR\$\s*97(?:,00)?\b/g, `$${profUsd} USD`);
  }

  function traduzirParaIngles(str) {
    if (!str || typeof str !== "string") return str;

    const norm = normalizarEspacos(str);
    if (!norm) return str;

    const lead = (str.match(/^\s*/) || [""])[0];
    const trail = (str.match(/\s*$/) || [""])[0];

    // 1. Correspondência exata
    if (EXACT_MAP[norm]) {
      return aplicarPrecosUsdEmIngles(lead + EXACT_MAP[norm] + trail);
    }
    const isAllCaps = norm.length > 2 && norm === norm.toUpperCase() && norm !== norm.toLowerCase();
    if (isAllCaps && UPPER_EXACT_MAP[norm]) {
      return aplicarPrecosUsdEmIngles(lead + UPPER_EXACT_MAP[norm] + trail);
    }

    // 2. Substituições por padrões estruturais de parágrafos primeiro
    let out = str;
    const listaPadroes = isAllCaps ? PATTERN_REPLACEMENTS_CI : PATTERN_REPLACEMENTS;
    for (const [regex, repl] of listaPadroes) {
      out = out.replace(regex, repl);
    }

    // 3. Substituições de frases de tabelas do motor interpoladas dentro de parágrafos compostos
    if (!isAllCaps) {
      for (const [ptSub, enSub] of SUBSTRING_PHRASES) {
        if (out.includes(ptSub)) {
          out = out.split(ptSub).join(enSub);
        }
      }
      // Segunda passagem dos padrões para traduzir nomes de signos/arcanos que estavam dentro das frases interpoladas
      for (const [regex, repl] of listaPadroes) {
        out = out.replace(regex, repl);
      }
    }
    if (isAllCaps) {
      out = out.toUpperCase();
    }
    return aplicarPrecosUsdEmIngles(out);
  }

  function traduzirTexto(str, idiomaForcado) {
    if (!str || typeof str !== "string") return str;
    const lang = idiomaForcado || idiomaAtual || getIdioma();
    if (lang !== "en") return str;
    return traduzirParaIngles(str);
  }

  function processarNoTexto(node, idiomaForcado) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (!parent) return;
    const tag = parent.tagName;
    if (
      tag === "SCRIPT" ||
      tag === "STYLE" ||
      tag === "NOSCRIPT" ||
      (parent.hasAttribute("translate") && parent.getAttribute("translate") === "no")
    ) {
      return;
    }
    if (parent.closest && parent.closest("body [translate='no'], .seletor-idioma-tryv")) return;

    const idioma = idiomaForcado || idiomaAtual || getIdioma();
    const valAtual = node.nodeValue;
    let reg = origTextMap.get(node);

    if (!reg) {
      reg = {
        pt: valAtual,
        en: traduzirParaIngles(valAtual)
      };
      origTextMap.set(node, reg);
    } else if (valAtual !== reg.pt && valAtual !== reg.en) {
      // O JS da página atualizou dinamicamente o conteúdo do nó de texto
      reg.pt = valAtual;
      reg.en = traduzirParaIngles(valAtual);
    } else if (idioma === "en") {
      // Recalcula reg.en a partir de reg.pt caso a cotação USD tenha atualizado
      reg.en = traduzirParaIngles(reg.pt);
    }

    const novoValor = idioma === "en" ? reg.en : reg.pt;
    if (node.nodeValue !== novoValor) {
      node.nodeValue = novoValor;
    }
  }

  function processarAtributosElemento(el, idiomaForcado) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    if (el.closest && el.closest(".seletor-idioma-tryv")) return;

    const idioma = idiomaForcado || idiomaAtual || getIdioma();
    const attrs = ["placeholder", "aria-label", "title"];
    let mapEl = origAttrMap.get(el);
    if (!mapEl) {
      mapEl = {};
      origAttrMap.set(el, mapEl);
    }

    for (const attr of attrs) {
      if (!el.hasAttribute(attr)) continue;
      const valAtual = el.getAttribute(attr);
      let reg = mapEl[attr];
      if (!reg || (valAtual !== reg.pt && valAtual !== reg.en)) {
        reg = {
          pt: valAtual,
          en: traduzirParaIngles(valAtual)
        };
        mapEl[attr] = reg;
      }
      const novoVal = idioma === "en" ? reg.en : reg.pt;
      if (valAtual !== novoVal) {
        el.setAttribute(attr, novoVal);
      }
    }

    // Caso especial: valor padrão de #prof_meta
    if (el.id === "prof_meta" && el.tagName === "INPUT") {
      const ptDefault = "Romper meu teto financeiro, recuperar minha paz emocional e destravar meus caminhos";
      const enDefault = EXACT_MAP[ptDefault];
      if (idioma === "en" && el.value === ptDefault) {
        el.value = enDefault;
      } else if (idioma !== "en" && el.value === enDefault) {
        el.value = ptDefault;
      }
    }
  }

  function traduzirSubarvore(raiz, idiomaForcado) {
    if (!raiz) return;
    const idioma = idiomaForcado || idiomaAtual || getIdioma();
    if (raiz.nodeType === Node.TEXT_NODE) {
      processarNoTexto(raiz, idioma);
      return;
    }
    if (raiz.nodeType !== Node.ELEMENT_NODE && raiz.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

    if (raiz.nodeType === Node.ELEMENT_NODE) {
      processarAtributosElemento(raiz, idioma);
    }

    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let atual = walker.nextNode();
    while (atual) {
      if (atual.nodeType === Node.TEXT_NODE) {
        processarNoTexto(atual, idioma);
      } else if (atual.nodeType === Node.ELEMENT_NODE) {
        processarAtributosElemento(atual, idioma);
      }
      atual = walker.nextNode();
    }
  }

  function atualizarEstadoSeletorUI(idioma) {
    const isEn = idioma === "en";
    document.documentElement.lang = isEn ? "en" : "pt-BR";

    // Atualiza título da aba de forma reversível
    if (!origAttrMap.has(document.documentElement)) {
      origAttrMap.set(document.documentElement, {
        docTitle: {
          pt: document.title,
          en: traduzirParaIngles(document.title)
        }
      });
    }
    const regTitle = origAttrMap.get(document.documentElement).docTitle;
    if (regTitle) {
      document.title = isEn ? regTitle.en : regTitle.pt;
    }

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      const langBtn = String(btn.getAttribute("data-lang-btn") || "").toLowerCase();
      const ativo = (isEn && langBtn.startsWith("en")) || (!isEn && langBtn.startsWith("pt"));
      btn.setAttribute("aria-pressed", String(ativo));
      btn.classList.toggle("ativo", ativo);
    });
  }

  function aplicarIdiomaNaPagina(idioma) {
    const langNormalizado = String(idioma || "").toLowerCase().startsWith("en") ? "en" : "pt-BR";
    idiomaAtual = langNormalizado;
    aplicandoTraducao = true;
    try {
      atualizarEstadoSeletorUI(langNormalizado);
      if (document.body) {
        traduzirSubarvore(document.body, langNormalizado);
      }
    } finally {
      aplicandoTraducao = false;
    }
  }

  function setIdioma(novoIdioma) {
    const isEn = String(novoIdioma || "").toLowerCase().startsWith("en");
    const langNormalizado = isEn ? "en" : "pt-BR";
    salvarIdiomaNoStorage(langNormalizado);
    aplicarIdiomaNaPagina(langNormalizado);
    try {
      global.dispatchEvent(new CustomEvent("tryv:idioma-alterado", { detail: { idioma: langNormalizado } }));
    } catch {}
  }

  function injetarEstilosSeletor() {
    if (document.getElementById("tryv-i18n-styles")) return;
    const st = document.createElement("style");
    st.id = "tryv-i18n-styles";
    st.textContent = `
      .seletor-idioma-tryv {
        display: inline-flex;
        align-items: center;
        gap: .2rem;
        padding: .2rem;
        border-radius: 999px;
        background: rgba(20, 14, 48, .85);
        border: 1px solid rgba(242, 193, 78, .42);
        box-shadow: 0 4px 14px rgba(0, 0, 0, .35);
      }
      .seletor-idioma-tryv button {
        appearance: none;
        border: 0;
        background: transparent;
        color: var(--texto-2, #c9bfe6);
        font-family: var(--corpo, 'Jost', sans-serif);
        font-size: .76rem;
        font-weight: 700;
        letter-spacing: .06em;
        padding: .3rem .62rem;
        border-radius: 999px;
        cursor: pointer;
        transition: all .2s ease;
        line-height: 1;
      }
      .seletor-idioma-tryv button:hover {
        color: #fff;
      }
      .seletor-idioma-tryv button[aria-pressed="true"],
      .seletor-idioma-tryv button.ativo {
        background: linear-gradient(180deg, #fff6d2 0%, #f6cd62 45%, #d39a2c 100%);
        color: #1b0f02;
        box-shadow: 0 2px 10px rgba(242, 193, 78, .4);
      }
      @media (max-width: 640px) {
        .seletor-idioma-tryv button {
          font-size: .72rem;
          padding: .28rem .52rem;
        }
      }
    `;
    document.head.appendChild(st);
  }

  function montarSeletorNoTopo() {
    injetarEstilosSeletor();
    let seletor = document.querySelector(".seletor-idioma-tryv");
    if (!seletor) {
      seletor = document.createElement("div");
      seletor.className = "seletor-idioma-tryv";
      seletor.setAttribute("role", "group");
      seletor.setAttribute("aria-label", "Idioma / Language");
      seletor.setAttribute("translate", "no");
      seletor.innerHTML = `
        <button type="button" data-lang-btn="pt-BR" aria-pressed="true" title="Português (Brasil)">PT-BR</button>
        <button type="button" data-lang-btn="en" aria-pressed="false" title="English">EN</button>
      `;

      // Insere no cabeçalho de desbloqueio.html ou diagnostico.html
      const navFunil = document.querySelector(".topo__nav");
      if (navFunil) {
        navFunil.appendChild(seletor);
      } else {
        const linhaTopo = document.querySelector(".topo__linha > div") || document.querySelector(".topo__linha");
        if (linhaTopo) {
          linhaTopo.appendChild(seletor);
        }
      }
    }

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      if (btn.dataset.i18nBound === "1") return;
      btn.dataset.i18nBound = "1";
      btn.addEventListener("click", () => {
        setIdioma(btn.getAttribute("data-lang-btn"));
      });
    });

    atualizarEstadoSeletorUI(getIdioma());
  }

  // Traduz recursivamente um objeto de resultado apenas quando EN está ativo (preservando chaves estruturais)
  const CHAVES_NAO_TRADUZIR = new Set([
    "id", "plano", "dataNascimento", "horaNascimento", "email", "whatsapp",
    "rom", "glifo", "codigo", "codigoCupom", "urlUpgrade", "ideograma", "nomeChines"
  ]);

  function traduzirObjetoProfundo(val, chaveAtual = "", idiomaForcado = "") {
    const lang = idiomaForcado || getIdioma();
    if (lang !== "en") return val;
    if (val == null) return val;
    if (typeof val === "string") {
      if (CHAVES_NAO_TRADUZIR.has(chaveAtual)) return val;
      return traduzirTexto(val, "en");
    }
    if (Array.isArray(val)) {
      return val.map((item) => traduzirObjetoProfundo(item, chaveAtual, "en"));
    }
    if (typeof val === "object") {
      const copia = {};
      for (const [k, v] of Object.entries(val)) {
        if (k === "__dadosOriginais" || k === "__resultadoOriginalPt") {
          copia[k] = v;
        } else {
          copia[k] = traduzirObjetoProfundo(v, k, "en");
        }
      }
      return copia;
    }
    return val;
  }

  // Integra com MotorDesbloqueio.processarAnaliseCompleta e gerarPDFPersonalizado
  // para que o próprio motor de interpretação e geração do relatório respeite o idioma selecionado na sessão
  function integrarGeradorPDF() {
    if (!global.MotorDesbloqueio) return;

    if (!global.MotorDesbloqueio.__i18nProcessarWrapped && typeof global.MotorDesbloqueio.processarAnaliseCompleta === "function") {
      const processarOriginal = global.MotorDesbloqueio.processarAnaliseCompleta;
      global.MotorDesbloqueio.__i18nProcessarWrapped = true;
      global.MotorDesbloqueio.processarAnaliseCompleta = function (dadosCliente) {
        const idiomaSessao =
          (dadosCliente && (dadosCliente.idioma === "en" || dadosCliente.idioma === "pt-BR") ? dadosCliente.idioma : null) ||
          getIdioma();
        const resPt = processarOriginal.call(this, dadosCliente);
        resPt.idioma = idiomaSessao;
        if (idiomaSessao !== "en") {
          return resPt;
        }
        const resEn = traduzirObjetoProfundo(resPt, "", "en");
        resEn.idioma = "en";
        resEn.__resultadoOriginalPt = resPt;
        return resEn;
      };
    }

    if (global.MotorDesbloqueio.__i18nPdfWrapped) return;
    const gerarOriginal = global.MotorDesbloqueio.gerarPDFPersonalizado;
    if (typeof gerarOriginal !== "function") return;

    global.MotorDesbloqueio.__i18nPdfWrapped = true;
    global.MotorDesbloqueio.gerarPDFPersonalizado = async function (resultado, opcoes = {}) {
      // Determina o idioma explícito da sessão de compra / análise (nunca infere pelo idioma do navegador nem pelo texto livre)
      const idiomaPdf =
        (opcoes && (opcoes.idioma === "en" || opcoes.idioma === "pt-BR") ? opcoes.idioma : null) ||
        (resultado && (resultado.idioma === "en" || resultado.idioma === "pt-BR") ? resultado.idioma : null) ||
        getIdioma();

      // Em PT-BR, executa o gerador original com o resultado em português sem qualquer modificação
      if (idiomaPdf !== "en") {
        const fontePt = (resultado && resultado.__resultadoOriginalPt) || resultado;
        return gerarOriginal.call(this, fontePt, opcoes);
      }

      // Em EN, garante que o objeto de resultado esteja integralmente traduzido e intercepta métodos do jsPDF
      const fonteBase = (resultado && resultado.__resultadoOriginalPt) || resultado;
      const resTraduzido = traduzirObjetoProfundo(fonteBase, "", "en");

      // Garante que jsPDF esteja carregado antes de envolver seus métodos de protótipo temporariamente
      if (!(global.jspdf && global.jspdf.jsPDF)) {
        try {
          await gerarOriginal.call(this, resTraduzido, { ...opcoes, salvar: false });
        } catch {}
      }

      const jsPDFClass = global.jspdf && global.jspdf.jsPDF;
      const proto = jsPDFClass && jsPDFClass.prototype;
      const origText = proto && proto.text;
      const origSplit = proto && proto.splitTextToSize;
      const origSave = proto && proto.save;

      if (proto && origText && origSplit && origSave) {
        proto.text = function (txt, x, y, flags, transform) {
          const t = Array.isArray(txt)
            ? txt.map((l) => (typeof l === "string" ? traduzirTexto(l) : l))
            : typeof txt === "string"
            ? traduzirTexto(txt)
            : txt;
          return origText.call(this, t, x, y, flags, transform);
        };
        proto.splitTextToSize = function (txt, maxlen, options) {
          const t = typeof txt === "string" ? traduzirTexto(txt) : txt;
          return origSplit.call(this, t, maxlen, options);
        };
        proto.save = function (filename, options) {
          const nomeEn = String(filename || "")
            .replace(/^Desbloqueio-Invisivel-Profunda-/, "The-Invisible-Unlocking-Deep-Analysis-")
            .replace(/^Desbloqueio-Invisivel-Standard-/, "The-Invisible-Unlocking-Standard-");
          return origSave.call(this, nomeEn, options);
        };
      }

      try {
        const ret = await gerarOriginal.call(this, resTraduzido, opcoes);
        if (ret && ret.nomeArquivo) {
          ret.nomeArquivo = ret.nomeArquivo
            .replace(/^Desbloqueio-Invisivel-Profunda-/, "The-Invisible-Unlocking-Deep-Analysis-")
            .replace(/^Desbloqueio-Invisivel-Standard-/, "The-Invisible-Unlocking-Standard-");
        }
        return ret;
      } finally {
        if (proto && origText && origSplit && origSave) {
          proto.text = origText;
          proto.splitTextToSize = origSplit;
          proto.save = origSave;
        }
      }
    };
  }

  // Intercepta window.alert para traduzir validações quando EN estiver ativo
  const alertOriginal = global.alert;
  if (typeof alertOriginal === "function") {
    global.alert = function (msg) {
      return alertOriginal.call(global, traduzirTexto(String(msg || "")));
    };
  }

  function sincronizarSeNecessario() {
    const idiomaPreferido = lerIdiomaPreferido();
    aplicarIdiomaNaPagina(idiomaPreferido);
  }

  function inicializarI18n() {
    integrarGeradorPDF();
    const idiomaInicial = getIdioma();
    montarSeletorNoTopo();
    aplicarIdiomaNaPagina(idiomaInicial);

    // Observa mutações no DOM para traduzir instantaneamente modais, simulador, dossiê e atualizações assíncronas
    if (!observerIniciado && typeof MutationObserver !== "undefined" && document.body) {
      observerIniciado = true;
      const obs = new MutationObserver((mutations) => {
        if (aplicandoTraducao) return;
        const lang = idiomaAtual || getIdioma();
        if (lang !== "en") return;
        aplicandoTraducao = true;
        try {
          for (const m of mutations) {
            if (m.type === "characterData" && m.target) {
              processarNoTexto(m.target, lang);
            } else if (m.type === "childList") {
              m.addedNodes.forEach((n) => traduzirSubarvore(n, lang));
              if (m.target && m.target.nodeType === Node.ELEMENT_NODE && m.addedNodes.length) {
                traduzirSubarvore(m.target, lang);
              }
            }
          }
        } finally {
          aplicandoTraducao = false;
        }
      });
      obs.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  if (typeof document !== "undefined") {
    // Delegação global de clique para garantir resposta imediata de qualquer botão [data-lang-btn]
    document.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("[data-lang-btn]") : null;
      if (!btn) return;
      e.preventDefault();
      setIdioma(btn.getAttribute("data-lang-btn"));
    });

    // Sincroniza quando o idioma muda no site principal (index.html) ou em outra aba
    if (typeof global.addEventListener === "function") {
      global.addEventListener("storage", (e) => {
        if (!e || !e.key || e.key === STORAGE_KEY || e.key === MAIN_SITE_STORAGE_KEY) {
          sincronizarSeNecessario();
        }
      });
      global.addEventListener("pageshow", () => sincronizarSeNecessario());
      global.addEventListener("focus", () => sincronizarSeNecessario());
    }
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) sincronizarSeNecessario();
    });

    // Executa imediatamente se o body já existir, e também garante após DOMContentLoaded
    if (document.body) {
      inicializarI18n();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", inicializarI18n);
    }
  }

  global.TryvI18n = {
    STORAGE_KEY,
    MAIN_SITE_STORAGE_KEY,
    getIdioma,
    setIdioma,
    traduzirParaIngles,
    traduzirTexto,
    traduzirObjetoProfundo,
    aplicarIdiomaNaPagina
  };
})(typeof window !== "undefined" ? window : global);
