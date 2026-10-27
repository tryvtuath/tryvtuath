/* =========================================================================
   MOTOR ORACULAR & PSICANALÍTICO — DESBLOQUEIO INVISÍVEL (Tryv Tuath®)
   Cruza 4 Pilares Sagrados + Questionário dos 3 Eixos (Emocional, Amor, Dinheiro):
   1. Astrologia Ocidental (Sol, Lua, Ascendente, MC, Vênus, Marte, Saturno, Quíron, Lilith, Nodos)
   2. Astrologia Védica / Jyotish (Lahiri Ayanamsa, Signo Lunar Sideral, 27 Nakshatras, Dasha)
   3. Numerologia Completa do Nome de Batismo & Data (Alma, Expressão, Impressão, Destino, Lições e Dívidas Cármicas)
   4. Matriz do Destino (22 Arcanos: Centro, Cauda Cármica, Linha do Amor, Linha do Dinheiro, Linhagens)
   + Geração nativa de PDF de Luxo A4 multipágina no navegador (sem custo de servidor).
   ========================================================================= */
(function (global) {
  "use strict";

  const RAD = Math.PI / 180;
  const GRAU = 180 / Math.PI;
  const norm = a => ((a % 360) + 360) % 360;
  const sen = a => Math.sin(a * RAD);
  const cos = a => Math.cos(a * RAD);
  const dois = n => String(n).padStart(2, "0");

  /* =========================================================================
     1. BANCO DE CIDADES (BRASIL + EXTERIOR) E COORDENADAS
     ========================================================================= */
  const CIDADES_BASE = [
    ["São Paulo", "SP", -23.55, -46.63, -3, 1],
    ["Rio de Janeiro", "RJ", -22.91, -43.17, -3, 1],
    ["Belo Horizonte", "MG", -19.92, -43.94, -3, 1],
    ["Brasília", "DF", -15.79, -47.88, -3, 1],
    ["Curitiba", "PR", -25.43, -49.27, -3, 1],
    ["Porto Alegre", "RS", -30.03, -51.23, -3, 1],
    ["Salvador", "BA", -12.97, -38.51, -3, 0],
    ["Recife", "PE", -8.05, -34.88, -3, 0],
    ["Fortaleza", "CE", -3.73, -38.52, -3, 0],
    ["Goiânia", "GO", -16.68, -49.25, -3, 1],
    ["Campinas", "SP", -22.91, -47.06, -3, 1],
    ["Ribeirão Preto", "SP", -21.18, -47.81, -3, 1],
    ["Santos", "SP", -23.96, -46.33, -3, 1],
    ["São José do Rio Preto", "SP", -20.82, -49.38, -3, 1],
    ["Sorocaba", "SP", -23.50, -47.45, -3, 1],
    ["Florianópolis", "SC", -27.60, -48.55, -3, 1],
    ["Joinville", "SC", -26.30, -48.85, -3, 1],
    ["Londrina", "PR", -23.31, -51.16, -3, 1],
    ["Maringá", "PR", -23.42, -51.94, -3, 1],
    ["Vitória", "ES", -20.32, -40.34, -3, 1],
    ["Uberlândia", "MG", -18.92, -48.28, -3, 1],
    ["Juiz de Fora", "MG", -21.76, -43.35, -3, 1],
    ["Niterói", "RJ", -22.88, -43.10, -3, 1],
    ["Campo Grande", "MS", -20.47, -54.62, -4, 1],
    ["Cuiabá", "MT", -15.60, -56.10, -4, 1],
    ["Manaus", "AM", -3.12, -60.02, -4, 0],
    ["Belém", "PA", -1.46, -48.49, -3, 0],
    ["São Luís", "MA", -2.53, -44.30, -3, 0],
    ["Natal", "RN", -5.79, -35.21, -3, 0],
    ["João Pessoa", "PB", -7.12, -34.86, -3, 0],
    ["Maceió", "AL", -9.67, -35.74, -3, 0],
    ["Aracaju", "SE", -10.91, -37.07, -3, 0],
    ["Teresina", "PI", -5.09, -42.80, -3, 0],
    ["Palmas", "TO", -10.18, -48.33, -3, 0],
    ["Porto Velho", "RO", -8.76, -63.90, -4, 0],
    ["Rio Branco", "AC", -9.97, -67.81, -5, 0],
    ["Macapá", "AP", 0.03, -51.07, -3, 0],
    ["Boa Vista", "RR", 2.82, -60.67, -4, 0],
    ["Caxias do Sul", "RS", -29.17, -51.18, -3, 1],
    ["Pelotas", "RS", -31.77, -52.34, -3, 1],
    ["Santa Maria", "RS", -29.68, -53.81, -3, 1],
    ["Lisboa", "Portugal", 38.72, -9.14, 0, 0],
    ["Porto", "Portugal", 41.15, -8.61, 0, 0],
    ["Miami / Orlando", "EUA", 25.76, -80.19, -5, 0],
    ["Nova York", "EUA", 40.71, -74.01, -5, 0],
    ["Londres", "Reino Unido", 51.51, -0.13, 0, 0],
    ["Madri", "Espanha", 40.42, -3.70, 1, 0],
    ["Paris", "França", 48.86, 2.35, 1, 0],
    ["Buenos Aires", "Argentina", -34.60, -58.38, -3, 0]
  ];

  /* =========================================================================
     2. SIGNOS, CASAS E INTERPRETAÇÕES ASTROLÓGICAS PROFUNDAS
     ========================================================================= */
  const SIGNOS = [
    {
      id: "aries", nome: "Áries", sânscrito: "Mesha", glifo: "♈", elemento: "Fogo", modalidade: "Cardinal", regente: "Marte",
      luz: "Pioneirismo, coragem instintiva, sinceridade visceral e força para abrir caminhos onde ninguém teve coragem.",
      sombra: "Impaciência crônica, sensação de estar sempre lutando sozinha, explosões defensivas ou desistência quando o entusiasmo inicial baixa.",
      quiron: "Ferida da Existência e do Direito de Ser: você sente que precisa provar seu valor o tempo todo ou pedir desculpas pela própria força. Medo oculto de se impor e ser rejeitada.",
      lilith: "Raiva reprimida da submissão. Nas relações, você oscila entre assumir o comando absoluto ou atrair parceiros que tentam apagar seu fogo e independência.",
      saturno: "Bloqueio na autoafirmação: medo inconsciente de liderar, começar projetos próprios ou bancar a própria autoridade sem depender de aval alheio.",
      venus: "Ama com intensidade, paixão e pressa; precisa de admiração viva e liberdade, detestando jogos lentos ou cobranças sufocantes."
    },
    {
      id: "touro", nome: "Touro", sânscrito: "Vrishabha", glifo: "♉", elemento: "Terra", modalidade: "Fixo", regente: "Vênus",
      luz: "Magnetismo material, constância, sensorialidade, lealdade profunda e capacidade de materializar abundância duradoura.",
      sombra: "Apego ao conhecido (mesmo quando dói), medo paralisante da escassez e resistência a encerrar ciclos vencidos.",
      quiron: "Ferida do Merecimento e Segurança: sensação constante de que o chão pode sumir a qualquer momento. Mesmo quando conquista algo, sente que ainda não é suficiente para relaxar.",
      lilith: "Tensão entre prazer, posse e autovalor. Pode atrair relações onde há desequilíbrio financeiro/energético ou medo visceral de perder o controle material.",
      saturno: "Teto financeiro por excesso de cautela: você trabalha duro, mas carrega o medo ancestral da falta, travando saltos maiores de prosperidade.",
      venus: "Ama através do toque, da presença real, da segurança e da construção sólida; precisa de paz e previsibilidade para florescer."
    },
    {
      id: "gemeos", nome: "Gêmeos", sânscrito: "Mithuna", glifo: "♊", elemento: "Ar", modalidade: "Mutável", regente: "Mercúrio",
      luz: "Inteligência rápida, poder de comunicação, versatilidade, curiosidade infinita e dom de conectar mundos e pessoas.",
      sombra: "Hiperatividade mental, ansiedade por excesso de cenários, dispersão de energia em múltiplos caminhos sem finalizar o principal.",
      quiron: "Ferida da Voz e do Entendimento: sensação de nunca ser verdadeiramente compreendida ou de que o que você diz é distorcido ou invalidado.",
      lilith: "Sombra da palavra afiada ou do silêncio cortante: atrai conexões mentais intensas, mas pode racionalizar emoções profundas para não se vulnerabilizar.",
      saturno: "Autocrítica intelectual severa (síndrome da impostora): achar que precisa de mais dez cursos antes de cobrar o que realmente vale.",
      venus: "Ama pelo diálogo, pela admiração intelectual e pela leveza; sem conversa profunda e encantamento mental, o vínculo esfria."
    },
    {
      id: "cancer", nome: "Câncer", sânscrito: "Karka", glifo: "♋", elemento: "Água", modalidade: "Cardinal", regente: "Lua",
      luz: "Intuição psíquica, acolhimento profundo, memória afetiva sagrada e capacidade de nutrir e curar ambientes e almas.",
      sombra: "Absorção de dores familiares que não são suas, carapaça defensiva por medo de rejeição e dificuldade de cortar cordões umbilicais do passado.",
      quiron: "Ferida de Raiz, Clã e Abandono: sensação interna de orfandade emocional — como se você fosse a mãe de todo mundo, mas ninguém segurasse você quando precisa.",
      lilith: "O complexo da Salvadora Exausta: atrai parceiros carentes ou imaturos que sugam sua nutrição emocional até você se fechar em ressentimento silencioso.",
      saturno: "Bloqueio por lealdade invisível à família: culpa inconsciente de ser mais livre, feliz ou próspera do que sua linhagem materna.",
      venus: "Ama com devoção, cuidado e desejo de construir ninho; precisa de segurança emocional absoluta para abrir a guarda."
    },
    {
      id: "leao", nome: "Leão", sânscrito: "Simha", glifo: "♌", elemento: "Fogo", modalidade: "Fixo", regente: "Sol",
      luz: "Nobreza de coração, magnetismo solar, criatividade autoral, generosidade e presença que ilumina qualquer espaço.",
      sombra: "Medo secreto da humilhação ou irrelevância, orgulho que impede de pedir ajuda e dor profunda quando não é reconhecida.",
      quiron: "Ferida do Brilho Reprimido: em algum momento você aprendeu que brilhar demais incomodava ou gerava inveja, passando a diminuir sua própria luz.",
      lilith: "Fome de realeza e exclusividade: não aceita ser coadjuvante; quando ferida no orgulho, pode se fechar num trono de gelo ou atrair disputas de ego.",
      saturno: "Trava de exposição e palco: você tem talento de líder, mas sente um peso enorme de responsabilidade ao se colocar como referência.",
      venus: "Ama de forma régia, apaixonada e leal; precisa sentir que é motivo de orgulho e encantamento para quem caminha ao seu lado."
    },
    {
      id: "virgem", nome: "Virgem", sânscrito: "Kanya", glifo: "♍", elemento: "Terra", modalidade: "Mutável", regente: "Mercúrio",
      luz: "Discernimento cirúrgico, excelência, pureza de propósito, capacidade de cura prática e organização do caos em ordem divina.",
      sombra: "Perfeccionismo paralisante, autocobrança implacável, ansiedade de controle e sensação de que nada nunca está pronto o bastante.",
      quiron: "Ferida da Imperfeição: crença inconsciente de que você só merece ser amada ou bem paga quando é útil, impecável e não dá trabalho a ninguém.",
      lilith: "Hipervigilância e crítica defensiva: medo visceral do descontrole emocional; no amor, pode tentar 'consertar' o parceiro em vez de se entregar.",
      saturno: "Exaustão operacional: assumir o trabalho pesado nos bastidores e travar na hora de delegar, escalar e assumir o lugar de estrategista.",
      venus: "Ama nos detalhes, nos atos de serviço silenciosos e na dedicação real; observa atitudes concretas muito mais do que promessas."
    },
    {
      id: "libra", nome: "Libra", sânscrito: "Tula", glifo: "♎", elemento: "Ar", modalidade: "Cardinal", regente: "Vênus",
      luz: "Diplomacia, senso estético refinado, justiça, charme magnético e sabedoria para criar pontes e harmonia.",
      sombra: "Autoanulação para evitar conflitos, indecisão crônica por pensar demais no outro e adiamento das próprias vontades.",
      quiron: "Ferida do Espelho e da Injustiça: dor profunda com traições, ingratidão ou relações onde você entrega 90% da harmonia e recebe migalhas.",
      lilith: "A sombra da boazinha que engole sapos até explodir ou ir embora de vez; atrai parceiros que testam seus limites até você aprender a dizer 'não'.",
      saturno: "Medo do julgamento alheio e de contratos definitivos: exige maturidade para escolher a si mesma mesmo quando isso desagrada os outros.",
      venus: "Ama a parceria elegante, o companheirismo, a beleza compartilhada e a reciprocidade justa."
    },
    {
      id: "escorpiao", nome: "Escorpião", sânscrito: "Vrishchika", glifo: "♏", elemento: "Água", modalidade: "Fixo", regente: "Plutão / Marte",
      luz: "Profundidade psíquica, poder de regeneração fênix, intuição raio-X, magnetismo sexual/espiritual e coragem de encarar a verdade nua.",
      sombra: "Desconfiança preventiva, controle emocional, dificuldade de perdoar traições e medo visceral de dar poder ao outro sobre seu coração.",
      quiron: "Ferida da Traição e da Perda: marcas profundas de quebras de confiança ou perdas que fizeram você jurar inconscientemente nunca mais ficar vulnerável.",
      lilith: "Magnetismo hipnótico e tabu: atrai paixões avassaladoras ou kármicas; precisa transmutar jogos de poder, ciúme ou autossabotagem em alquimia consciente.",
      saturno: "Controle absoluto como escudo: dificuldade em soltar o que já morreu (cargos, relações, mágoas), represando o fluxo de renovação e dinheiro grande.",
      venus: "Ama de corpo e alma, sem meio-termo; busca fusão verdadeira, lealdade absoluta e transformação mútua."
    },
    {
      id: "sagitario", nome: "Sagitário", sânscrito: "Dhanu", glifo: "♐", elemento: "Fogo", modalidade: "Mutável", regente: "Júpiter",
      luz: "Visão de longo alcance, fé inabalável, sabedoria filosófica/espiritual, entusiasmo contagiante e vocação para expandir horizontes.",
      sombra: "Inquietação constante ('a grama do futuro é sempre mais verde'), fuga quando a rotina aperta ou promessas maiores que a execução diária.",
      quiron: "Ferida do Sentido da Vida: crises existenciais quando sente que está vivendo uma vida pequena, engaiolada ou desconectada de uma missão maior.",
      lilith: "Rebeldia contra dogmas e prisões: no amor e no trabalho, se sentir que tentam cortar suas asas, sabota tudo para recuperar a liberdade.",
      saturno: "Desafio de aterrar a visão: transformar grandes ideias e sabedoria espiritual em método concreto, rotina lucrativa e constância.",
      venus: "Ama a aventura compartilhada, o crescimento conjunto, a admiração pela sabedoria do outro e o espaço para respirar."
    },
    {
      id: "capricornio", nome: "Capricórnio", sânscrito: "Makara", glifo: "♑", elemento: "Terra", modalidade: "Cardinal", regente: "Saturno",
      luz: "Maestria, resiliência inquebrável, visão estratégica, integridade e poder de construir impérios e legado real.",
      sombra: "Rigidez emocional, carregar o peso do mundo sozinha, medir o próprio valor apenas pela produtividade e dificuldade de receber cuidado.",
      quiron: "Ferida do Reconhecimento e da Autoridade: sensação de ter amadurecido cedo demais, assumindo responsabilidades adultas quando ainda precisava de colo.",
      lilith: "A armadura da mulher forte que não pode falhar: atrai parceiros que se apoiam na sua força ou que se intimidam com a sua competência.",
      saturno: "Excesso de peso e demora em colher: trabalhar no modo 'esforço penoso' em vez de permitir que a autoridade conquistada traga leveza e alta remuneração.",
      venus: "Ama com seriedade, respeito, compromisso de longo prazo e admiração pela postura e caráter do parceiro."
    },
    {
      id: "aquario", nome: "Aquário", sânscrito: "Kumbha", glifo: "♒", elemento: "Ar", modalidade: "Fixo", regente: "Urano / Saturno",
      luz: "Originalidade genial, visão de futuro, autenticidade livre de padrões sociais, mente inventiva e consciência coletiva.",
      sombra: "Sensação de ser uma 'estranha no ninho', desconexão emocional defensiva (viver na mente para não doer no peito) e autossabotagem por rebeldia.",
      quiron: "Ferida do Não-Pertencimento: sentir-se diferente demais da família ou do meio desde cedo, escondendo sua excentricidade ou isolando-se afetivamente.",
      lilith: "Pavor de perder a individualidade: quando uma relação ou trabalho exige enquadramento tradicional, um impulso elétrico inconsciente rompe o vínculo.",
      saturno: "Trava na monetização da sua singularidade: medo de estruturar seu método único e cobrar caro pelo que só você enxerga.",
      venus: "Ama a amizade profunda dentro do romance, o respeito à individualidade e a conexão entre mentes livres."
    },
    {
      id: "peixes", nome: "Peixes", sânscrito: "Meena", glifo: "♓", elemento: "Água", modalidade: "Mutável", regente: "Netuno / Júpiter",
      luz: "Mediunidade natural, compaixão oceânica, inspiração artística/espiritual, conexão direta com o invisível e sensibilidade curadora.",
      sombra: "Esponja energética de ambientes, idealização romântica (ver o potencial do outro e ignorar a realidade), fuga ou confusão de limites.",
      quiron: "Ferida da Desilusão e doResgate: dor profunda ao perceber a dureza do mundo material, levando a querer salvar almas feridas ou se perder nos próprios sonhos.",
      lilith: "Sedução mística e neblina afetiva: atrai relações envoltas em mistério, promessas espirituais ou dependências emocionais que exigem aterramento urgente.",
      saturno: "Culpa entre espiritualidade e dinheiro: crença inconsciente de que cobrar bem ou ter estrutura material é 'menos espiritual', gerando desorganização financeira.",
      venus: "Ama de forma poética, transcendente e compassiva; precisa aprender a unir magia espiritual com limites claros no plano físico."
    }
  ];

  /* =========================================================================
     3. AS 27 NAKSHATRAS VÉDICAS (JYOTISH)
     ========================================================================= */
  const NAKSHATRAS = [
    ["Ashwini", "Ketu (Nodo Sul)", "Os Gêmeos Celestiais (Ashvins)", "Cabeça de Cavalo", "Curadora veloz e pioneira espiritual; seu bloqueio é a pressa ansiosa que abandona processos antes da maturação."],
    ["Bharani", "Vênus (Shukra)", "Yama (Senhor do Dharma)", "Yoni (Ventre Sagrado)", "Alma que suporta grandes extremos e transmutações; precisa parar de carregar tabus e culpas familiares no próprio corpo."],
    ["Krittika", "Sol (Surya)", "Agni (Fogo Sagrado)", "Lâmina / Chama", "Verdade cortante que purifica o que é falso; o bloqueio está na autocrítica feroz e em queimar pontes por orgulho ferido."],
    ["Rohini", "Lua (Chandra)", "Brahma (O Criador)", "Carruagem Real", "Altíssimo magnetismo criativo, sensual e próspero; o bloqueio é o apego emocional e o medo de perder o afeto ou a estabilidade."],
    ["Mrigashira", "Marte (Mangala)", "Soma (Néctar Lunar)", "Cabeça de Cervo", "Buscadora incansável da verdade e do encantamento; a sombra é a inquietação constante e a desconfiança após pequenas decepções."],
    ["Ardra", "Rahu (Nodo Norte)", "Rudra (Senhor das Tempestades)", "Lágrima / Diamante", "Renasce mais forte após cada tempestade emocional; o bloqueio é atrair crises para sentir que está viva ou evoluindo."],
    ["Punarvasu", "Júpiter (Guru)", "Aditi (Mãe Cósmica)", "Aljava de Flechas", "O retorno da luz e da esperança; seu bloqueio é perdoar e recomeçar ciclos com pessoas que já mostraram que não mudaram."],
    ["Pushya", "Saturno (Shani)", "Brihaspati (Mestre Divino)", "Flor de Lótus / Úbere", "Nutrição espiritual e sabedoria próspera; o bloqueio é o excesso de dever e alimentar quem nunca retribui."],
    ["Ashlesha", "Mercúrio (Budha)", "Nagas (Serpentes Sagradas)", "Serpente Enrolada", "Intuição hipnótica e percepção psicológica profunda; precisa vigiar a autodefesa venenosa, a desconfiança e o medo de traição."],
    ["Magha", "Ketu (Nodo Sul)", "Pitris (Ancestrais Reais)", "Trono Real", "Alma com memória de realeza e liderança; o bloqueio vem de lealdades pesadas ao carma ancestral familiar e exigência de perfeição."],
    ["Purva Phalguni", "Vênus (Shukra)", "Bhaga (Deus da Fortuna e Amor)", "Rede de Descanso", "Dons artísticos, carisma e merecimento natural; o bloqueio aparece quando busca validação afetiva externa para sentir seu próprio valor."],
    ["Uttara Phalguni", "Sol (Surya)", "Aryaman (Alianças Nobres)", "Pés da Cama Real", "Força para alianças duradouras e liderança ética; o bloqueio é assumir contratos ou relações onde você carrega toda a estrutura sozinha."],
    ["Hasta", "Lua (Chandra)", "Savitar (Sol Criador)", "Mão Aberta", "Poder de manifestar o destino com as próprias mãos e talento; a sombra é o excesso de controle por medo de que tudo saia do eixo."],
    ["Chitra", "Marte (Mangala)", "Vishvakarma (Arquiteto Celestial)", "Pérola Brilhante", "Lapidadora de beleza, estratégia e carisma; seu bloqueio é sentir-se incompreendida na sua profundidade por trás da aparência forte."],
    ["Swati", "Rahu (Nodo Norte)", "Vayu (Vento Sagrado)", "Broto ao Vento / Coral", "Independência, diplomacia e flexibilidade; o bloqueio é a dispersão indecisa e o medo de criar raízes que tirem sua liberdade."],
    ["Vishakha", "Júpiter (Guru)", "Indra e Agni", "Arco do Triunfo", "Foco implacável em grandes metas; a sombra é a frustração com o presente e a sensação de que a conquista nunca basta."],
    ["Anuradha", "Saturno (Shani)", "Mitra (Amigo Divino)", "Flor de Lótus na Lama", "Devoção profunda e capacidade de florescer em terrenos difíceis; o bloqueio é a melancolia oculta e a fome de pertencimento afetivo."],
    ["Jyeshtha", "Mercúrio (Budha)", "Indra (Rei dos Deuses)", "Amuleto / Guarda-Sol", "A 'irmã mais velha' espiritual, protetora e perspicaz; seu bloqueio é a solidão no topo e o medo de mostrar fragilidade."],
    ["Mula", "Ketu (Nodo Sul)", "Nirriti (Deusa da Dissolução)", "Raízes Amarradas", "Vai direto à raiz oculta de qualquer dor ou mentira; vive grandes arrancadas e precisa curar o medo de perder o chão."],
    ["Purva Ashadha", "Vênus (Shukra)", "Apah (Águas Cósmicas)", "Leque de Marfim", "Invencibilidade emocional e poder de persuasão; o bloqueio é a teimosia afetiva e idealizar cenários que demoram a se concretizar."],
    ["Uttara Ashadha", "Sol (Surya)", "Vishvadevas (Deuses Universais)", "Presa de Elefante", "Vitória definitiva após amadurecimento; o bloqueio é o isolamento por excesso de exigência consigo e com o mundo."],
    ["Shravana", "Lua (Chandra)", "Vishnu (O Preservador)", "Três Pegadas / Ouvido", "Ouvido oracular que escuta o que ninguém diz; o bloqueio é absorver fofocas, ruídos e dores alheias até travar a própria voz."],
    ["Dhanishta", "Marte (Mangala)", "Os 8 Vasus (Riqueza Elemental)", "Tambor Sagrado (Damaru)", "Ritmo, prosperidade material e magnetismo; o bloqueio no amor surge quando prioriza a armadura de independência sobre a intimidade."],
    ["Shatabhisha", "Rahu (Nodo Norte)", "Varuna (Oceano Cósmico)", "Círculo de 100 Estrelas", "A curadora de cem médicos: vê verdades ocultas e sistemas inteiros; o bloqueio é o isolamento emocional e a sensação de exílio."],
    ["Purva Bhadrapada", "Júpiter (Guru)", "Aja Ekapada (Fogo Unicórnio)", "Espada / Duas Faces", "Paixão espiritual intensa e visão transformadora; a sombra é oscilar entre o idealismo extremo e a ansiedade sombria."],
    ["Uttara Bhadrapada", "Saturno (Shani)", "Ahirbudhnya (Serpente das Profundezas)", "Gêmeos na Água", "Sabedoria oceânica, paciência e mestria espiritual; o bloqueio é a inércia antes de agir por esperar o momento 100% seguro."],
    ["Revati", "Mercúrio (Budha)", "Pushan (Pastor das Almas)", "Peixe Dourado / Tambor", "Alma antiga, empática e próspera que guia outros na travessia; seu maior bloqueio é doar até a última gota e esquecer os próprios limites."]
  ];

  /* =========================================================================
     4. OS 22 ARCANOS NA MATRIZ DO DESTINO (LUZ, SOMBRA, AMOR E DINHEIRO)
     ========================================================================= */
  const ARCANOS_MATRIZ = [
    null, // 0 usa 22 na Matriz do Destino
    {
      n: 1, rom: "I", nome: "O Mago", titulo: "A Pioneira e Canalizadora",
      luz: "Poder mental de manifestação, autoria, iniciativa única e domínio das próprias ferramentas.",
      sombra: "Síndrome da impostora ('ainda não sei o bastante') ou ego isolado que acha que ninguém faz tão bem quanto você.",
      amor: "Precisa admirar a inteligência do parceiro; na sombra, controla a relação ou se isola.",
      dinheiro: "Destrava quando cria algo autoral, assume a linha de frente e usa a própria voz/conhecimento."
    },
    {
      n: 2, rom: "II", nome: "A Sacerdotisa", titulo: "A Guardiã do Mistério e da Intuição",
      luz: "Intuição certeira, diplomacia, visão dos bastidores, sensibilidade terapêutica e escuta profunda.",
      sombra: "Passividade, guardar segredos e ressentimentos, dúvida crônica entre a razão e a intuição.",
      amor: "Busca conexão de alma profunda; na sombra, atrai relações ocultas, triângulos ou parceiros indecisos.",
      dinheiro: "Ganha através de aconselhamento, estratégia, terapias, diagnóstico e inteligência intuitiva."
    },
    {
      n: 3, rom: "III", nome: "A Imperatriz", titulo: "A Soberana da Abundância e Criação",
      luz: "Fertilidade criativa, magnetismo feminino, prosperidade material, beleza e liderança acolhedora.",
      sombra: "Controle materno excessivo sobre parceiros/projetos, vaidade ferida ou desconexão com o próprio corpo e prazer.",
      amor: "Nascida para ser tratada como rainha; bloqueia o amor quando vira 'mãe' do parceiro.",
      dinheiro: "É um dos maiores códigos de riqueza da Matriz: o dinheiro vem quando você se permite luxo, estética, autoria e comando sem culpa."
    },
    {
      n: 4, rom: "IV", nome: "O Imperador", titulo: "A Construtora de Impérios e Ordem",
      luz: "Estrutura, gestão, proteção, autoridade natural, realização concreta e palavra firme.",
      sombra: "Rigidez, autoritarismo, excesso de peso masculino (fazer tudo na força bruta) e dificuldade de delegar.",
      amor: "Em mulheres, a sombra do 4 faz você competir pelo controle ou atrair homens fracos porque não solta a armadura.",
      dinheiro: "Prospera com negócios estruturados, processos claros, cargos de direção e patrimônio sólido."
    },
    {
      n: 5, rom: "V", nome: "O Hierofante", titulo: "A Mestra da Sabedoria e da Ordem",
      luz: "Capacidade de ensinar, organizar sistemas, honrar tradições e transmitir conhecimento com autoridade.",
      sombra: "Moralismo, medo de quebrar regras familiares, síndrome da eterna aluna que acumula certificados mas não ensina.",
      amor: "Valoriza lealdade, família e valores claros; trava quando tenta doutrinar ou julgar o parceiro.",
      dinheiro: "O dinheiro destrava quando você assume o lugar de mentora/especialista e rompe com o teto financeiro da família de origem."
    },
    {
      n: 6, rom: "VI", nome: "Os Enamorados", titulo: "O Magnetismo da Escolha e do Amor",
      luz: "Carisma irresistível, dom para relacionamentos, estética, comunicação afetiva e escolhas alinhadas ao coração.",
      sombra: "Indecisão torturante ('e se eu tivesse escolhido o outro caminho?'), dependência de aprovação e idealização.",
      amor: "O amor é central na sua vida; seu desbloqueio exige parar de buscar fora a validação que falta dentro.",
      dinheiro: "Só prospera no que ama de verdade; trabalhar apenas por obrigação seca imediatamente sua fonte financeira."
    },
    {
      n: 7, rom: "VII", nome: "O Carro", titulo: "A Condutora de Metas e Movimento",
      luz: "Foco, velocidade, conquista de território, liderança inspiradora e capacidade de destravar caminhos.",
      sombra: "Atropelar processos, viver em guerra contra o tempo, ou o extremo oposto: estagnação total por medo de dirigir a própria vida.",
      amor: "Precisa de um parceiro que acompanhe seu ritmo e celebre suas vitórias, nunca alguém que tente frear seu avanço.",
      dinheiro: "O dinheiro vem pelo movimento, metas claras, viagens, expansão digital e coragem de liderar."
    },
    {
      n: 8, rom: "VIII", nome: "A Justiça", titulo: "A Guardiã da Lei de Causa e Efeito",
      luz: "Equilíbrio, discernimento das leis cármicas, clareza mental, retidão e colheita exata.",
      sombra: "Indignação constante com 'injustiças', julgamento severo de si e dos outros, repetição dos mesmos conflitos por não enxergar a causa oculta.",
      amor: "Atrai relações que funcionam como espelhos cármicos; quando entende a lição sem culpar o outro, o padrão se desfaz na hora.",
      dinheiro: "Prospera com contratos claros, legalidade, equilíbrio entre dar e receber, e cura da revolta financeira."
    },
    {
      n: 9, rom: "IX", nome: "O Eremita", titulo: "A Sábia da Profundidade Interior",
      luz: "Sabedoria profunda, autossuficiência espiritual, profundidade intelectual e cura pelo conhecimento.",
      sombra: "Isolamento afetivo, medo de intimidade, avareza consigo mesma (achar que não precisa de nada) e esconder seus talentos do mundo.",
      amor: "Precisa de espaço sagrado; bloqueia o amor quando transforma a solitude saudável em muralha contra a entrega.",
      dinheiro: "Ganha com conhecimento profundo, consultoria, escrita, pesquisa e especialização — desde que não se esconda na caverna."
    },
    {
      n: 10, rom: "X", nome: "A Roda da Fortuna", titulo: "A Filha da Sorte e dos Ciclos",
      luz: "Fluidez, sincronicidades mágicas, oportunidades inesperadas e confiança no fluxo do universo.",
      sombra: "Viver em montanha-russa financeira, trabalhar no sacrifício pesado achando que a vida tem que ser difícil, ou esperar passivamente pela sorte.",
      amor: "Relações de destino e encontros inesperados; precisa encerrar ciclos repetitivos para a roda girar para cima.",
      dinheiro: "Seu dinheiro bloqueia no esforço tenso e destrava na leveza, no timing certo e em múltiplas fontes de fluxo."
    },
    {
      n: 11, rom: "XI", nome: "A Força", titulo: "A Potência Vital e o Domínio Sutil",
      luz: "Vitalidade extraordinária, paixão, coragem, produtividade alta e poder de domar crises com elegância.",
      sombra: "Workaholismo, agressividade quando contrariada, esgotamento físico/nervoso por tentar resolver tudo no grito ou na força.",
      amor: "Sexualidade e magnetismo intensos; precisa trocar a disputa de força pela vulnerabilidade confiante.",
      dinheiro: "Grande capacidade de gerar riqueza quando canaliza sua energia em vez de dispersá-la apagando incêndios."
    },
    {
      n: 12, rom: "XII", nome: "O Enforcado", titulo: "A Visionária do Novo Olhar e do Serviço",
      luz: "Visão fora da caixa, empatia criativa, inovação e capacidade de enxergar soluções que ninguém mais vê.",
      sombra: "Complexo de mártir/salvadora, incapacidade de dizer 'não', cobrar barato por pena e sentir-se estagnada ou pendurada.",
      amor: "Atrai pessoas para 'salvar' ou relações onde se sacrifica até adoecer; a cura é o amor-próprio inegociável.",
      dinheiro: "O maior bloqueador do Arcano 12 é trabalhar de graça ou subvalorizada; quando precifica com honra, a abundância abre."
    },
    {
      n: 13, rom: "XIII", nome: "A Morte", titulo: "A Alquimista de Ciclos e Renascimento",
      luz: "Coragem para cortar o que não serve, transformação rápida, desapego curador e poder de recomeçar do zero em nível superior.",
      sombra: "Apego mórbido ao passado, medo de mudanças, deixar projetos e relações 'mortos-vivos' arrastando sua energia.",
      amor: "Transforma profundamente quem toca; precisa permitir que a fase antiga da relação morra para um novo ciclo nascer.",
      dinheiro: "Ganha dinheiro em transições, crises, reestruturações e terapias transformadoras; trava quando acumula entulho energético."
    },
    {
      n: 14, rom: "XIV", nome: "A Temperança", titulo: "A Alquimista da Cura, Arte e Equilíbrio",
      luz: "Harmonia da alma, sensibilidade artística, cura pelas mãos/palavra, paciência sábia e conexão angelical.",
      sombra: "Oscilação extrema (8 ou 80), impaciência com o tempo de maturação, excessos emocionais ou estagnação morna.",
      amor: "Busca parceria de alma serena e madura; precisa curar feridas emocionais antigas para não projetá-las no presente.",
      dinheiro: "Riqueza construída com constância, arte, estética, terapias integrativas e equilíbrio entre paixão e método."
    },
    {
      n: 15, rom: "XV", nome: "O Diabo", titulo: "A Senhora do Magnetismo, Poder e Sombra",
      luz: "Carisma hipnótico, visão de raio-X das intenções humanas, ambição saudável, luxo, sexualidade viva e poder de realização material.",
      sombra: "Relações tóxicas/codependentes, ciúme, manipulação, vícios emocionais, medo do próprio poder ou culpa por desejar riqueza.",
      amor: "Paixões vulcânicas e testes cármicos de tentação e poder; quando integra a própria sombra, vive um amor lúcido e magnético.",
      dinheiro: "Potencial de altíssima riqueza e grandes negócios, desde que não caia em ganhos impulsivos ou medo da própria ambição."
    },
    {
      n: 16, rom: "XVI", nome: "A Torre", titulo: "A Despertadora Espiritual e Reconstrutora",
      luz: "Despertar espiritual profundo, libertação de estruturas falsas, força para reconstruir qualquer vida com verdade absoluta.",
      sombra: "Caos recorrente, perdas repentinas quando insiste em manter aparências, raiva acumulada que implode o que construiu.",
      amor: "Relações baseadas em ilusão ou ego caem rápido; só permanece o que é construído sobre autenticidade espiritual.",
      dinheiro: "Prospera quando constrói sobre propósito real, reforma, arquitetura de vida, mentoria de despertar e desapego do ego."
    },
    {
      n: 17, rom: "XVII", nome: "A Estrela", titulo: "O Canal de Brilho, Fé e Inspiração",
      luz: "Talento único, conexão estelar, esperança curadora, vocação para ser vista, admirada e inspirar multidões.",
      sombra: "Esconder-se nos bastidores ('vida cinza'), síndrome de não ser especial, ou viver nas nuvens sem pés no chão.",
      amor: "Atrai amor verdadeiro quando brilha na sua essência; na sombra, idealiza amores platônicos impossíveis.",
      dinheiro: "O dinheiro vem quando você aceita seu lugar de destaque, marca pessoal, arte, cura e visibilidade."
    },
    {
      n: 18, rom: "XVIII", nome: "A Lua", titulo: "A Maga do Inconsciente e da Imaginação",
      luz: "Poder de materialização pelo pensamento, magia natural, intuição profunda, psicologia e conexão com o sagrado feminino.",
      sombra: "Medos imaginários que se materializam, ansiedade noturna, autossabotagem por ilusão, síndrome de fraude e mentiras emocionais.",
      amor: "Se você tem medo de ser traída ou abandonada, o Arcano 18 magnetiza exatamente esse medo; limpe a tela mental e o amor floresce.",
      dinheiro: "Sua mente é um ímã literal: quando substitui o medo da escassez pela certeza imaginativa, a prosperidade se materializa rápido."
    },
    {
      n: 19, rom: "XIX", nome: "O Sol", titulo: "A Irradiação da Alegria, Sucesso e Abundância",
      luz: "Prosperidade luminosa, liderança calorosa, generosidade, clareza, realização pública e alegria de viver.",
      sombra: "Queimar os outros com excesso de controle/ego, ou queimar a si mesma com culpa, perfeccionismo e incapacidade de descansar.",
      amor: "Relações felizes, claras e prósperas quando você dá espaço para o outro também brilhar ao seu lado.",
      dinheiro: "Código solar de fartura, grandes projetos, liderança de equipes e abundância compartilhada."
    },
    {
      n: 20, rom: "XX", nome: "O Julgamento", titulo: "A Libertadora do Carma Ancestral",
      luz: "Cura geracional da família, chamado vocacional claro, intuição ancestral e capacidade de renascer em uma nova missão.",
      sombra: "Repetir exatamente os erros amorosos e financeiros dos pais/avós, julgar a família ou viver presa a mágoas de sangue.",
      amor: "O desbloqueio amoroso acontece no instante em que você honra e perdoa internamente pai e mãe, liberando o padrão repetido.",
      dinheiro: "Quando você cura a relação com suas raízes e aceita ir além do limite do clã sem culpa, o fluxo financeiro se multiplica."
    },
    {
      n: 21, rom: "XXI", nome: "O Mundo", titulo: "A Cidadã do Universo e da Plenitude",
      luz: "Expansão sem fronteiras, visão global, conclusão vitoriosa de ciclos, internet, línguas e realização integral.",
      sombra: "Pensar pequeno, colocar limites estreitos nos próprios sonhos, medo do mundo ou deixar projetos 90% prontos sem concluir.",
      amor: "Conexões livres, maduras e expansivas; pode envolver pessoas de outras culturas ou expansão conjunta de vida.",
      dinheiro: "Seu dinheiro não cabe num espaço pequeno: exige internet, escala, visão ampla e proibição de dívidas limitantes."
    },
    {
      n: 22, rom: "XXII", nome: "O Louco", titulo: "A Alma Livre do Salto Quântico",
      luz: "Liberdade radical, fé pura no invisível, genialidade espontânea, ausência de amarras e capacidade de começar o inédito.",
      sombra: "Medo paralisante de sair da gaiola, irresponsabilidade financeira por fuga, ou viver presa em rotinas que matam sua alma.",
      amor: "Precisa de um amor que seja voo conjunto, nunca jaula; na sombra, foge antes de criar laço ou aceita prisões por medo.",
      dinheiro: "Prospera com liberdade criativa, inovação, projetos autorais e confiança para dar saltos que a mente lógica teme."
    }
  ];

  /* =========================================================================
     5. CAUDAS CÁRMICAS CLÁSSICAS (MATRIZ DO DESTINO)
     ========================================================================= */
  const CAUDAS_CARMICAS = {
    "18-9-9": {
      nome: "A Maga / Sábia na Caverna (18-9-9)",
      passado: "Em outra existência, você detinha profundo conhecimento espiritual ou mágico, mas isolou-se do mundo e do amor, ou recusou-se a transmitir esse saber por medo ou desencanto.",
      bloqueioAtual: "Medo inconsciente de mostrar todo o seu potencial ao mundo, tendência ao isolamento quando se machuca e criação de medos imaginários (18) que fazem você se esconder (9).",
      chave: "Sair da caverna: compartilhar sua sabedoria com as pessoas, confiar na intimidade afetiva e usar sua mente para visualizar luz em vez de cenários de medo."
    },
    "9-18-9": {
      nome: "O Segredo e a Magia Reprimida (9-18-9)",
      passado: "Sua alma carrega a memória de ter escondido seus dons intuitivos por medo de perseguição ou julgamento.",
      bloqueioAtual: "Autossabotagem intelectual, sensação de solidão mesmo acompanhada e medo de cobrar pelo que sabe.",
      chave: "Assumir sua sensibilidade e inteligência sem pedir permissão, unindo profundidade espiritual e presença prática no mundo."
    },
    "15-20-5": {
      nome: "A Rebelde do Clã Familiar (15-20-5)",
      passado: "Em vida passada, houve ruptura com as tradições da família ou exclusão do clã por escolhas de paixão, poder ou liberdade.",
      bloqueioAtual: "Sentir-se a 'ovelha negra' da família, tentar salvar ou carregar parentes nas costas, ou repetir inconscientemente os mesmos bloqueios amorosos/financeiros da linhagem.",
      chave: "Perdoar e honrar suas raízes sem carregar o fardo delas, permitindo-se prosperar e amar de um jeito novo."
    },
    "15-5-8": {
      nome: "Paixões, Traições e Justiça Afetiva (15-5-8)",
      passado: "Memória cármica de triângulos amorosos, paixões proibidas ou quebras de votos que deixaram feridas de injustiça.",
      bloqueioAtual: "Atrair parceiros indisponíveis, testar a fidelidade do outro ou sentir que sempre entrega mais do que recebe nas relações.",
      chave: "Curar o julgamento moral, escolher relações transparentes e parar de buscar provas de dor no amor."
    },
    "18-6-6": {
      nome: "O Feitiço do Amor e a Fome de Afeto (18-6-6)",
      passado: "Em outra vida, o amor foi vivido como dependência extrema ou ilusão romântica que custou sua própria identidade.",
      bloqueioAtual: "Medo profundo de rejeição, necessidade de aprovação constante e dúvida sobre ser amada pelo que realmente é.",
      chave: "Preencher seu próprio cálice emocional primeiro; quando você se escolhe sem medo, atrai um amor recíproco e seguro."
    },
    "12-19-7": {
      nome: "A Guerreira Interrompida (12-19-7)",
      passado: "Alma de grande força e liderança que teve sua jornada interrompida ou usou a força de modo impulsivo.",
      bloqueioAtual: "Sentir que quando está prestes a dar o grande salto profissional, algo trava ou você se sacrifica pelos outros (12) e perde a própria direção (7).",
      chave: "Colocar suas metas em primeiro lugar com doçura e constância, sem precisar entrar em guerra nem se anular."
    },
    "9-12-3": {
      nome: "A Espera Solitária do Amor (9-12-3)",
      passado: "Memória de separação de um grande amor ou sacrifício da própria feminilidade/maternidade em nome do dever.",
      bloqueioAtual: "Assumir o papel de salvadora nas relações, dificuldade de receber mimo/cuidado e fechar o coração após decepções.",
      chave: "Despertar a Imperatriz (3): aprender a receber, deixar de salvar adultos e honrar seu prazer e abundância."
    },
    "3-7-22": {
      nome: "AAlma Cativa e a Liberdade (3-7-22)",
      passado: "Memória de privação de liberdade física, emocional ou financeira.",
      bloqueioAtual: "Pavor de se sentir presa em rotinas ou relacionamentos controladores, ou criar dívidas/obrigações que funcionam como algemas invisíveis.",
      chave: "Construir liberdade com responsabilidade, dirigindo o próprio caminho (7) com leveza e prosperidade (3)."
    },
    "6-17-11": {
      nome: "O Talento Oculto / A Estrela Adormecida (6-17-11)",
      passado: "Você recebeu um grande dom em outra vida, mas trocou sua missão por segurança comum ou deixou seu brilho apagar.",
      bloqueioAtual: "Trabalhar muito abaixo do seu verdadeiro potencial, duvidar do próprio brilho e adiar sua verdadeira vocação.",
      chave: "Assumir o palco da sua área (17), unir sua força (11) com o que você ama (6) e permitir-se brilhar."
    },
    "21-4-10": {
      nome: "A Soberania e a Confiança no Fluxo (21-4-10)",
      passado: "Memória de grande poder material ou perda de controle sobre um império.",
      bloqueioAtual: "Hipercontrole por medo da instabilidade, achando que se soltar as rédeas por um dia tudo vai desmoronar.",
      chave: "Unir a estrutura inteligente (4) com a confiança nos ciclos do Universo (10) e visão sem fronteiras (21)."
    }
  };

  /* =========================================================================
     6. NUMEROLOGIA CABALÍSTICA / PITAGÓRICA E LIÇÕES/DÍVIDAS CÁRMICAS
     ========================================================================= */
  const SIGNIFICADOS_NUM = {
    1: {
      titulo: "Vibração 1 — A Pioneira Soberana",
      alma: "Sua alma anseia por autonomia, autoria e liberdade para decidir o próprio rumo sem interferência.",
      expressao: "Você se expressa com liderança, iniciativa e coragem para abrir trilhas inéditas.",
      destino: "Seu caminho de vida exige que você deixe de se apoiar nos outros e assuma o comando da própria história.",
      bloqueio: "Medo de depender, dificuldade em pedir ajuda ou paralisia quando sente que não está no controle total.",
      licao: "Lição Cármica 1: Aprender a ter iniciativa própria, bancar suas decisões e não esperar que outros abram a porta por você."
    },
    2: {
      titulo: "Vibração 2 — A Diplomata Sensível",
      alma: "Sua alma busca união verdadeira, paz emocional, parceria íntima e ambientes harmoniosos.",
      expressao: "Você tem o dom da escuta, da conciliação, dos detalhes sutis e da inteligência emocional.",
      destino: "Seu destino ensina a arte das alianças, da paciência gestacional e da sensibilidade intuitiva.",
      bloqueio: "Engolir o que sente para manter a paz, hipersensibilidade à rejeição e submissão aos desejos alheios.",
      licao: "Lição Cármica 2: Desenvolver paciência, cooperação saudável e tato emocional sem perder suas fronteiras."
    },
    3: {
      titulo: "Vibração 3 — A Comunicadora Magnética",
      alma: "Sua alma precisa de expressão criativa, beleza, encantamento, alegria e voz ativa.",
      expressao: "Carisma natural na fala, escrita, imagem ou arte; quando você se expressa, ilumina o ambiente.",
      destino: "Seu destino é florescer através da comunicação, da visibilidade e da criatividade fértil.",
      bloqueio: "Calar a própria voz por medo de julgamento, dispersão em mil ideias ou esconder-se quando está triste.",
      licao: "Lição Cármica 3: Destravar a autoexpressão, vencer a timidez/vergonha de aparecer e confiar no seu brilho criativo."
    },
    4: {
      titulo: "Vibração 4 — A Arquiteta da Realidade",
      alma: "Sua alma pede segurança sólida, ordem, raízes firmes, previsibilidade e construção concreta.",
      expressao: "Confiabilidade, método, capacidade de transformar sonhos abstratos em estruturas reais.",
      destino: "Construir bases inabaláveis no trabalho, no patrimônio e na vida prática.",
      bloqueio: "Rigidez, excesso de trabalho pesado sem prazer, medo do novo e crença de que dinheiro só vem com suor exaustivo.",
      licao: "Lição Cármica 4: Criar disciplina, organização financeira e constância para levar projetos até o fim."
    },
    5: {
      titulo: "Vibração 5 — A Alquimista da Liberdade",
      alma: "Sua alma tem sede de movimento, mudança, experiências vivas, viagens e quebra de rotinas cinzas.",
      expressao: "Versatilidade magnética, poder de vendas, adaptação rápida e mente livre.",
      destino: "Aprender o uso sábio da liberdade, abraçando as viradas da vida como portais de evolução.",
      bloqueio: "Ansiedade por estagnação, impulsividade, abandonar projetos ou relações quando perdem a novidade.",
      licao: "Lição Cármica 5: Vencer o medo da mudança, abrir-se ao novo e não ficar presa em zonas de conforto vencidas."
    },
    6: {
      titulo: "Vibração 6 — A Guardiã do Amor e da Harmonia",
      alma: "Sua alma deseja profundamente afeto recíproco, família (de sangue ou de alma), beleza e acolhimento.",
      expressao: "Presença terapêutica, senso estético, cuidado amoroso e responsabilidade afetiva.",
      destino: "Curar laços afetivos, criar harmonia e equilibrar o cuidado com o outro e o cuidado consigo.",
      bloqueio: "Carregar problemas familiares nas costas, perfeccionismo afetivo e atrair pessoas que abusam da sua bondade.",
      licao: "Lição Cármica 6: Assumir compromissos afetivos saudáveis sem fugir da intimidade nem tentar salvar todo mundo."
    },
    7: {
      titulo: "Vibração 7 — A Mística Investigadora",
      alma: "Sua alma busca verdade profunda, conexão espiritual, silêncio sagrado e respostas que o raso não dá.",
      expressao: "Profundidade analítica, intuição refinada, seletividade e autoridade intelectual/espiritual.",
      destino: "Unir ciência, psique e espiritualidade, tornando-se referência de sabedoria profunda.",
      bloqueio: "Excesso de análise que paralisa a ação, desconfiança afetiva e isolamento emocional.",
      licao: "Lição Cármica 7: Confiar na própria intuição, aprofundar conhecimentos e desenvolver fé no invisível."
    },
    8: {
      titulo: "Vibração 8 — A Soberana do Poder e da Matéria",
      alma: "Sua alma reconhece a grandeza, o sucesso material, a justiça e a capacidade de comando.",
      expressao: "Visão executiva, magnetismo para negócios, autoridade e poder de realização financeira.",
      destino: "Dominar o mundo material com ética, abundância e equilíbrio entre poder espiritual e riqueza.",
      bloqueio: "Medo do próprio poder, ciclos de ganha-e-perde financeiro ou rigidez controladora nas relações.",
      licao: "Lição Cármica 8: Curar a relação com o dinheiro, assumir autoridade financeira e gerir recursos com maestria."
    },
    9: {
      titulo: "Vibração 9 — A Curadora Universal",
      alma: "Sua alma é antiga, compassiva, humanitária e veio encerrar ciclos cármicos com sabedoria.",
      expressao: "Generosidade, visão ampla, carisma inspirador e capacidade de tocar muitas vidas.",
      destino: "Servir de farol para outras pessoas através da sua própria história de superação e cura.",
      bloqueio: "Dificuldade de desapegar do passado, síndrome da salvadora e doar-se até ficar vazia.",
      licao: "Lição Cármica 9: Aprender o desapego, o perdão verdadeiro e a compaixão sem autoanulação."
    },
    11: {
      titulo: "Número Mestre 11 — A Iluminadora Intuitiva",
      alma: "Sua alma possui uma antena espiritual de alta voltagem, captando o que ninguém diz.",
      expressao: "Canal de inspiração, magnetismo espiritual, visão além do tempo e palavra que desperta consciências.",
      destino: "Viver como ponte entre o mundo espiritual e o mundo prático, iluminando consciências.",
      bloqueio: "Sobrecarga nervosa, ansiedade por captar energias densas e medo de assumir sua missão espiritual.",
      licao: "Ancorar a alta voltagem intuitiva no corpo físico sem cair na ansiedade do 2."
    },
    22: {
      titulo: "Número Mestre 22 — A Mestra Construtora",
      alma: "Sua alma veio materializar grandes projetos que impactam a coletividade de forma concreta.",
      expressao: "Combinação rara de visão espiritual elevada com capacidade prática de execução em larga escala.",
      destino: "Construir um legado tangível, próspero e duradouro que sirva a muitas pessoas.",
      bloqueio: "Medo da própria grandeza, encolhendo-se numa rotina pequena por receio de não dar conta.",
      licao: "Unir visão cósmica e disciplina prática para materializar o extraordinário."
    },
    33: {
      titulo: "Número Mestre 33 — O Amor Crístico e a Cura",
      alma: "Sua alma vibra na frequência da compaixão mestra, do ensino amoroso e da cura profunda.",
      expressao: "Voz e presença que acalmam tempestades, despertando o melhor em quem cruza seu caminho.",
      destino: "Guiar, ensinar e curar com amor elevado, mantendo limites sagrados para não carregar a cruz alheia.",
      bloqueio: "Martírio emocional e esquecimento de si mesma para socorrer o mundo.",
      licao: "Amar e curar sem se sacrificar no altar das dores alheias."
    }
  };

  const DIVIDIAS_CARMICAS = {
    13: {
      numero: "Dívida Cármica 13/4",
      origem: "Memória de vidas passadas onde houve dispersão, abandono de responsabilidades ou transferência do trabalho pesado para terceiros.",
      impacto: "Nesta vida, você pode sentir que precisa fazer o dobro de esforço para conquistar o que parece fácil para os outros, ou sentir tentação de desistir quando surgem obstáculos repetitivos.",
      cura: "Foco em uma meta de cada vez, organização inteligente (trabalhar com estratégia e não apenas no cansaço) e proibição de murmurar contra os processos de construção."
    },
    14: {
      numero: "Dívida Cármica 14/5",
      origem: "Memória de uso desmedido da liberdade, fugas afetivas ou excessos sensoriais em outra existência.",
      impacto: "A vida traz mudanças inesperadas constantes e testa seu foco emocional e financeiro; tendência a oscilar entre apego ao seguro e vontade repentina de largar tudo.",
      cura: "Equilíbrio emocional, compromisso firme com suas escolhas e flexibilidade consciente diante dos imprevistos."
    },
    16: {
      numero: "Dívida Cármica 16/7",
      origem: "Memória de orgulho espiritual/intelectual ou relações afetivas onde o ego feriu vínculos sagrados.",
      impacto: "Funciona como a 'Torre' numerológica: quando você se apoia em máscaras, relações falsas ou carreiras sem alma, a vida derruba a estrutura para forçar seu despertar verdadeiro.",
      cura: "Humildade sábia, espiritualidade autêntica e coragem de viver apenas relações e trabalhos onde sua alma é verdadeira."
    },
    19: {
      numero: "Dívida Cármica 19/1",
      origem: "Memória de exercício solitário ou autoritário do poder em outra vida.",
      impacto: "Nesta vida, você sente que sempre precisa resolver tudo sozinha ('se eu não fizer, ninguém faz'), atraindo sobrecarga e dificuldade de receber apoio no amor e no trabalho.",
      cura: "Aprender que a verdadeira soberania sabe receber ajuda, delegar e caminhar em parceria sem perder a própria força."
    }
  };

  /* =========================================================================
     7. CÁLCULOS ASTRONÔMICOS (EFEMÉRIDES TROPICAIS + SIDERais VÉDICAS)
     ========================================================================= */
  function diaJ(a, m, d, ut) {
    return 367 * a - Math.floor(7 * (a + Math.floor((m + 9) / 12)) / 4) + Math.floor(275 * m / 9) + d - 730530 + ut / 24;
  }

  function kepler(M, e) {
    let E = M + GRAU * e * sen(M) * (1 + e * cos(M));
    for (let i = 0; i < 12; i++) {
      const E1 = E - (E - GRAU * e * sen(E) - M) / (1 - e * cos(E));
      if (Math.abs(E1 - E) < 1e-7) return E1;
      E = E1;
    }
    return E;
  }

  function orbita({ N, i, w, a, e, M }) {
    const E = kepler(norm(M), e);
    const xv = a * (cos(E) - e), yv = a * Math.sqrt(1 - e * e) * sen(E);
    const v = Math.atan2(yv, xv) * GRAU, r = Math.hypot(xv, yv), vw = v + w;
    const x = r * (cos(N) * cos(vw) - sen(N) * sen(vw) * cos(i));
    const y = r * (sen(N) * cos(vw) + cos(N) * sen(vw) * cos(i));
    const z = r * sen(vw) * sen(i);
    return { lon: norm(Math.atan2(y, x) * GRAU), lat: Math.atan2(z, Math.hypot(x, y)) * GRAU, r };
  }

  const ELEMENTOS_ORB = {
    sol: d => ({ N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.0470 + 0.9856002585 * d }),
    lua: d => ({ N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d }),
    mercurio: d => ({ N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d }),
    venus: d => ({ N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d }),
    marte: d => ({ N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d }),
    jupiter: d => ({ N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d }),
    saturno: d => ({ N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d }),
    urano: d => ({ N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d }),
    netuno: d => ({ N: 131.7806 + 3.0173e-5 * d, i: 1.77 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d })
  };

  function solLon(d) { return orbita(ELEMENTOS_ORB.sol(d)); }
  function luaLon(d) {
    const s = ELEMENTOS_ORB.sol(d), l = ELEMENTOS_ORB.lua(d);
    const o = orbita(l);
    const Ms = norm(s.M), Mm = norm(l.M), Ls = norm(s.w + s.M), Lm = norm(l.N + l.w + l.M);
    const D = Lm - Ls, F = Lm - l.N;
    const p = -1.274 * sen(Mm - 2 * D) + 0.658 * sen(2 * D) - 0.186 * sen(Ms) - 0.059 * sen(2 * Mm - 2 * D)
      - 0.057 * sen(Mm - 2 * D + Ms) + 0.053 * sen(Mm + 2 * D) + 0.046 * sen(2 * D - Ms) + 0.041 * sen(Mm - Ms)
      - 0.035 * sen(D) - 0.031 * sen(Mm + Ms) - 0.015 * sen(2 * F - 2 * D) + 0.011 * sen(Mm - 4 * D);
    return norm(o.lon + p);
  }

  function geocentrico(helio, sol) {
    const x = helio.r * cos(helio.lat) * cos(helio.lon) + sol.r * cos(sol.lon);
    const y = helio.r * cos(helio.lat) * sen(helio.lon) + sol.r * sen(sol.lon);
    return norm(Math.atan2(y, x) * GRAU);
  }

  function planetaLon(nome, d) {
    const sol = solLon(d);
    if (nome === "sol") return sol.lon;
    if (nome === "lua") return luaLon(d);
    if (nome === "lilith") return norm(263.3862 + 0.1114035140 * d);
    if (nome === "nodoNorte") return norm(125.04452 - 0.0529537648 * d);
    if (nome === "nodoSul") return norm(125.04452 - 0.0529537648 * d + 180);
    let h;
    if (nome === "quiron") {
      const a = 13.692;
      h = orbita({ N: 209.296, i: 6.9297, w: 339.255, a, e: 0.37897, M: 0.9856076686 / Math.pow(a, 1.5) * (d + 1415.2) });
      h.lon += 3.82394e-5 * d;
    } else if (nome === "plutao") {
      const S = 50.03 + 0.033459652 * d, P = 238.95 + 0.003968789 * d;
      const lon = 238.9508 + 0.00400703 * d - 19.799 * sen(P) + 19.848 * cos(P) + 0.897 * sen(2 * P) - 4.956 * cos(2 * P)
        + 0.61 * sen(3 * P) + 1.211 * cos(3 * P) - 0.341 * sen(4 * P) - 0.19 * cos(4 * P) + 0.128 * sen(5 * P) - 0.034 * cos(5 * P)
        - 0.038 * sen(6 * P) + 0.031 * cos(6 * P) + 0.02 * sen(S - P) - 0.01 * cos(S - P);
      const lat = -3.9082 - 5.453 * sen(P) - 14.975 * cos(P) + 3.527 * sen(2 * P) + 1.673 * cos(2 * P) - 1.051 * sen(3 * P)
        + 0.328 * cos(3 * P) + 0.179 * sen(4 * P) - 0.292 * cos(4 * P) + 0.019 * sen(5 * P) + 0.1 * cos(5 * P)
        - 0.031 * sen(6 * P) - 0.026 * cos(6 * P) + 0.011 * cos(S - P);
      const r = 40.72 + 6.68 * sen(P) + 6.9 * cos(P) - 1.18 * sen(2 * P) - 0.03 * cos(2 * P) + 0.15 * sen(3 * P) - 0.14 * cos(3 * P);
      h = { lon: lon + 3.82394e-5 * d, lat, r };
    } else {
      h = orbita(ELEMENTOS_ORB[nome](d));
      const Mj = ELEMENTOS_ORB.jupiter(d).M, Ms = ELEMENTOS_ORB.saturno(d).M, Mu = ELEMENTOS_ORB.urano(d).M;
      if (nome === "jupiter") h.lon += -0.332 * sen(2 * Mj - 5 * Ms - 67.6) - 0.056 * sen(2 * Mj - 2 * Ms + 21) + 0.042 * sen(3 * Mj - 5 * Ms + 21)
        - 0.036 * sen(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sen(2 * Mj - 3 * Ms + 52) - 0.016 * sen(Mj - 5 * Ms - 69);
      if (nome === "saturno") {
        h.lon += 0.812 * sen(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sen(Mj - 2 * Ms - 3)
          + 0.046 * sen(2 * Mj - 6 * Ms - 69) + 0.014 * sen(Mj - 3 * Ms + 32);
        h.lat += -0.02 * cos(2 * Mj - 4 * Ms - 2) + 0.018 * sen(2 * Mj - 6 * Ms - 49);
      }
      if (nome === "urano") h.lon += 0.04 * sen(Ms - 2 * Mu + 6) + 0.035 * sen(Ms - 3 * Mu + 33) - 0.015 * sen(Mj - Mu + 20);
    }
    return geocentrico(h, sol);
  }

  function calcAngulos(d, ut, lat, lon) {
    const s = ELEMENTOS_ORB.sol(d);
    const ramc = norm(s.w + s.M + 180 + ut * 15 + lon);
    const ecl = 23.4393 - 3.563e-7 * d;
    const mc = norm(Math.atan2(sen(ramc), cos(ramc) * cos(ecl)) * GRAU);
    const asc = norm(Math.atan2(cos(ramc), -(sen(ramc) * cos(ecl) + Math.tan(lat * RAD) * sen(ecl))) * GRAU);
    return { asc, mc };
  }

  const signoDe = lon => SIGNOS[Math.floor(norm(lon) / 30) % 12];
  const grauFmt = lon => {
    const g = norm(lon) % 30;
    return `${Math.floor(g)}°${dois(Math.floor((g % 1) * 60))}′`;
  };

  function calcularAstrologiaOcidental(dados) {
    const [ano, mes, dia] = dados.dataNascimento.split("-").map(Number);
    const [hh, mm] = dados.semHora || !dados.horaNascimento ? [12, 0] : dados.horaNascimento.split(":").map(Number);
    const fuso = Number(dados.fuso ?? -3);
    const verao = Boolean(dados.verao);
    const lat = Number(dados.lat ?? -23.55);
    const lon = Number(dados.lon ?? -46.63);
    const ut = hh + mm / 60 - (fuso + (verao ? 1 : 0));
    const d = diaJ(ano, mes, dia, ut);

    const LISTA_PLANETAS = [
      ["sol", "Sol", "☉", "Essência e Brilho Consciente"],
      ["lua", "Lua", "☽", "Raiz Emocional e Inconsciente"],
      ["mercurio", "Mercúrio", "☿", "Mente e Padrão de Pensamento"],
      ["venus", "Vênus", "♀", "Amor, Magnetismo e Valor"],
      ["marte", "Marte", "♂", "Ação, Desejo e Limites"],
      ["jupiter", "Júpiter", "♃", "Expansão, Fé e Prosperidade"],
      ["saturno", "Saturno", "♄", "Trava Kármica e Maturidade"],
      ["urano", "Urano", "♅", "Ruptura e Liberdade"],
      ["netuno", "Netuno", "♆", "Espiritualidade e Idealização"],
      ["plutao", "Plutão", "♇", "Poder Oculto e Transmutação"],
      ["quiron", "Quíron", "⚷", "A Ferida Primordial"],
      ["lilith", "Lilith", "⚸", "Sombra Reprimida e Magnetismo"],
      ["nodoNorte", "Nodo Norte", "☊", "Missão Evolutiva Desta Vida"],
      ["nodoSul", "Nodo Sul", "☋", "Zona de Repetição de Vidas Passadas"]
    ];

    const ang = dados.semHora ? null : calcAngulos(d, ut, lat, lon);
    const casaDe = l => ang ? (Math.floor(norm(l - ang.asc) / 30) + 1) : null;

    const astros = LISTA_PLANETAS.map(([id, nome, glifo, papel]) => {
      const l = planetaLon(id, d);
      const mov = ((planetaLon(id, d + 0.5) - planetaLon(id, d - 0.5)) + 540) % 360 - 180;
      const signo = signoDe(l);
      const casa = casaDe(l);
      return {
        id, nome, glifo, papel, lon: l, grau: grauFmt(l), signo, casa,
        retro: mov < 0 && !["sol", "lua", "lilith", "nodoNorte", "nodoSul"].includes(id)
      };
    });

    const porId = Object.fromEntries(astros.map(a => [a.id, a]));
    return {
      d, ut,
      astros,
      porId,
      asc: ang ? { lon: ang.asc, signo: signoDe(ang.asc), grau: grauFmt(ang.asc) } : null,
      mc: ang ? { lon: ang.mc, signo: signoDe(ang.mc), grau: grauFmt(ang.mc) } : null
    };
  }

  /* =========================================================================
     8. ASTROLOGIA VÉDICA (JYOTISH — LAHIRI AYANAMSA, NAKSHATRAS & MOMENTO ATUAL)
     ========================================================================= */
  const DIRECIONAMENTO_DASHA = {
    "Ketu (Nodo Sul)": {
      momento: "Ciclo de Desapego Espiritual, Corte de Ilusões e Sabedoria Intuitiva",
      pratico: "O Universo pede que você pare de insistir em estruturas que já cumpriram seu papel. Seu caminho fica suave quando você confia no seu sexto sentido, simplifica a rotina e foca em especialização profunda em vez de volume disperso."
    },
    "Vênus (Shukra)": {
      momento: "Ciclo de Magnetismo, Cura do Feminino, Valorização e Alianças",
      pratico: "Momento ideal para elevar seu valor percebido, cuidar da estética/imagem, destravar o merecimento afetivo e permitir que a prosperidade venha através de charme, diplomacia e criação autoral."
    },
    "Sol (Surya)": {
      momento: "Ciclo de Autoridade, Visibilidade, Autonomia e Posicionamento",
      pratico: "É hora de sair dos bastidores. Assuma a liderança do seu próprio nome, corte relações de submissão e tome decisões baseadas na sua verdade central, sem esperar aprovação familiar."
    },
    "Lua (Chandra)": {
      momento: "Ciclo de Nutrição da Alma, Cura Emocional, Fluxo e Conexão Pública",
      pratico: "Respeite seus ritmos internos. Sua prosperidade e seus afetos fluem quando seu ambiente doméstico está em paz e quando você usa sua empatia para acolher sem absorver dores alheias."
    },
    "Marte (Mangala)": {
      momento: "Ciclo de Coragem, Execução Prática, Corte de Inércia e Conquista",
      pratico: "Pare de adiar decisões difíceis. Canalize sua energia vital em um projeto concreto de cada vez, estabeleça limites firmes com pessoas invasivas e aja com assertividade."
    },
    "Rahu (Nodo Norte)": {
      momento: "Ciclo de Expansão Inédita, Quebra de Tabus e Salto de Destino",
      pratico: "O que é tradicional parece pequeno demais para você agora. Abra-se para inovação, ambiente digital, novos públicos e caminhos que ninguém da sua família trilhou antes."
    },
    "Júpiter (Guru)": {
      momento: "Ciclo de Sabedoria, Mentoria, Bênçãos Protetoras e Expansão Ética",
      pratico: "Seu crescimento vem pelo ensino, pelo estudo elevado e pela visão de longo prazo. Posicione-se como mentora ou referência de confiança na sua área."
    },
    "Saturno (Shani)": {
      momento: "Ciclo de Estruturação Sólida, Colheita Kármica, Maturidade e Legado",
      pratico: "Nada de atalhos rasos: o momento pede constância, organização financeira, contratos claros e paciência estratégica. O que você estruturar agora terá raízes para décadas."
    },
    "Mercúrio (Budha)": {
      momento: "Ciclo de Inteligência Comercial, Comunicação, Negócios e Versatilidade",
      pratico: "Destrave sua fala, escrita e negociação. Excelente período para estruturar ofertas, cursos, consultorias, parcerias intelectuais e organizar o fluxo financeiro com método."
    }
  };

  function calcularAstrologiaVedica(astroOcidental, dados) {
    const [ano, mes, dia] = dados.dataNascimento.split("-").map(Number);
    // Ayanamsa de Lahiri (Chitrapaksha): 23.853° em 2000.0 + precessão de 50.29"/ano
    const fracAno = ano + (mes - 1) / 12 + dia / 365.25;
    const ayanamsa = 23.853 + (fracAno - 2000.0) * (50.29 / 3600);

    const lonSolV = norm(astroOcidental.porId.sol.lon - ayanamsa);
    const lonLuaV = norm(astroOcidental.porId.lua.lon - ayanamsa);
    const lonAscV = astroOcidental.asc ? norm(astroOcidental.asc.lon - ayanamsa) : null;
    const lonRahuV = norm(astroOcidental.porId.nodoNorte.lon - ayanamsa);

    const passoNak = 360 / 27; // 13.3333°
    const idxNak = Math.floor(lonLuaV / passoNak) % 27;
    const restoNak = lonLuaV % passoNak;
    const pada = Math.floor(restoNak / (passoNak / 4)) + 1;
    const [nomeNak, regenteDasha, divindade, simbolo, interpretacao] = NAKSHATRAS[idxNak];

    // Ciclo progressivo Vimshottari aproximado para a idade atual
    const ordemSenhores = [
      "Ketu (Nodo Sul)", "Vênus (Shukra)", "Sol (Surya)", "Lua (Chandra)",
      "Marte (Mangala)", "Rahu (Nodo Norte)", "Júpiter (Guru)", "Saturno (Shani)", "Mercúrio (Budha)"
    ];
    const idade = Math.max(18, new Date().getFullYear() - ano);
    const idxNatal = Math.max(0, ordemSenhores.indexOf(regenteDasha));
    const idxCicloAtual = (idxNatal + Math.floor(idade / 13)) % ordemSenhores.length;
    const regenteMomento = ordemSenhores[idxCicloAtual];
    const guiaNatal = DIRECIONAMENTO_DASHA[regenteDasha] || DIRECIONAMENTO_DASHA["Lua (Chandra)"];
    const guiaAtual = DIRECIONAMENTO_DASHA[regenteMomento] || guiaNatal;

    return {
      ayanamsa: ayanamsa.toFixed(2) + "°",
      suryaRashi: signoDe(lonSolV),
      chandraRashi: signoDe(lonLuaV),
      lagna: lonAscV != null ? signoDe(lonAscV) : null,
      rahuSigno: signoDe(lonRahuV),
      nakshatra: {
        numero: idxNak + 1,
        nome: nomeNak,
        pada,
        regenteDasha,
        divindade,
        simbolo,
        interpretacao,
        regenteMomento,
        momentoAtual: `${guiaAtual.momento} (sob a frequência de ${regenteMomento} cruzada à sua raiz em ${nomeNak})`,
        direcionamentoPratico: `${guiaAtual.pratico} Além disso, sua Nakshatra natal (${nomeNak}, regida por ${regenteDasha}) lembra que o seu caminho mais suave exige honrar seu símbolo sagrado (${simbolo}) e evitar o desgaste de lutar contra sua natureza intuitiva.`
      }
    };
  }

  /* =========================================================================
     8B. HORÓSCOPO CHINÊS & ALQUIMIA DOS 5 ELEMENTOS ORIENTAIS
     ========================================================================= */
  const ANIMAIS_CHINESES = [
    ["Rato", "子", "Inteligência estratégica, charme magnético, percepção rápida de oportunidades e capacidade de prosperar mesmo em cenários difíceis.", "Ansiedade mental por acumular preocupações em silêncio e medo de escassez futura."],
    ["Boi", "丑", "Força tranquila, lealdade inabalável, determinação, paciência construtora e colheita sólida através da constância.", "Teimosia emocional, carregar fardos além do limite e dificuldade de demonstrar vulnerabilidade."],
    ["Tigre", "寅", "Coragem magnética, liderança natural, paixão intensa, proteção feroz de quem ama e espírito desbravador.", "Impulsividade sob pressão, rebeldia contra controles injustos e oscilação entre tudo ou nada."],
    ["Coelho", "卯", "Diplomacia refinada, intuição artística, sensibilidade estética, empatia curadora e habilidade de abrir portas com doçura.", "Evitar confrontos necessários para manter a paz aparente e retração quando o ambiente fica hostil."],
    ["Dragão", "辰", "Presença imperial, visão grandiosa, magnetismo espiritual, vitalidade criativa e vocação para liderar grandes movimentos.", "Autocobrança gigantesca, orgulho que impede de mostrar fraqueza e frustração com a mediocridade alheia."],
    ["Serpente", "巳", "Sabedoria profunda, intuição psíquica, elegância misteriosa, poder de transmutação e olhar clínico para a verdade.", "Desconfiança silenciosa, dificuldade de esquecer traições e tendência a guardar segredos e dores para si."],
    ["Cavalo", "午", "Espírito livre, entusiasmo contagiante, independência, rapidez de raciocínio e carisma caloroso.", "Inquietação diante de rotinas aprisionadoras, impaciência e medo de perder a própria autonomia no amor."],
    ["Cabra", "未", "Sensibilidade espiritual e artística, coração generoso, imaginação fértil e dom natural para terapias e harmonia.", "Insegurança emocional quando falta apoio afetivo, absorção do pessimismo alheio e adiamento de decisões duras."],
    ["Macaco", "申", "Genialidade inventiva, versatilidade, humor inteligente, capacidade de resolver qualquer crise e mente brilhante.", "Dispersão em múltiplos interesses simultâneos e desconfiança de que os outros não acompanham seu ritmo."],
    ["Galo", "酉", "Clareza, franqueza, senso de organização, brilho pessoal, coragem para defender a verdade e olhar detalhista.", "Perfeccionismo crítico consigo e com o parceiro, desgaste com a desordem alheia e orgulho ferido."],
    ["Cão", "戌", "Integridade absoluta, proteção leal, senso profundo de justiça, empatia pelos mais frágeis e coração nobre.", "Preocupação excessiva com quem ama, indignação com injustiças e demora para voltar a confiar após decepções."],
    ["Javali", "亥", "Nobreza de alma, generosidade, apreço pelo belo e pelo prazer sagrado, sinceridade e magnetismo de fartura.", "Ingênua confiança em pessoas interesseiras, dificuldade em dizer 'não' e engolir mágoas para não ferir o outro."]
  ];

  const ELEMENTOS_CHINESES = [
    ["Madeira", "木", "Expansão criativa, crescimento contínuo, ética, visão de futuro e capacidade de florescer e abrir novos ramos.", "Excesso de sobrecarga ao tentar abraçar o mundo como uma árvore que abriga a todos."],
    ["Fogo", "火", "Brilho solar, paixão, poder de decisão, carisma quente e capacidade de iluminar e entusiasmar multidões.", "Esgotamento nervoso (burnout) quando queima a própria energia sem pausas de regeneração."],
    ["Terra", "土", "Estabilidade, aterramento, realização material, nutrição segura e capacidade de sustentar grandes estruturas.", "Preocupação excessiva, apego ao conhecido e lentidão para cortar laços que já venceram."],
    ["Metal", "金", "Precisão, nobreza, foco, retidão, resiliência inquebrável e poder de cortar o que é supérfluo.", "Rigidez emocional, melancolia silenciosa e dificuldade em flexibilizar padrões."],
    ["Água", "水", "Profundidade intuitiva, persuasão suave, adaptabilidade genial, sabedoria oculta e comunicação profunda.", "Medos inconscientes que paralisam ou tendência a contornar obstáculos sem impor a própria vontade."]
  ];

  function dataChinaUTC8(d) {
    const t = new Date(Date.UTC(1999, 11, 31) + (d + 8 / 24) * 864e5);
    return t.getUTCFullYear() * 1e4 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate();
  }
  function luaNovaAposDia(d) {
    const elong = x => norm(luaLon(x) - solLon(x).lon);
    let ant = elong(d);
    for (let k = 0; k < 140; k++) {
      const d2 = d + 0.25, e2 = elong(d2);
      if (e2 < ant) {
        let a = d, b = d2;
        for (let j = 0; j < 30; j++) { const m = (a + b) / 2; if (elong(m) > 180) a = m; else b = m; }
        return b;
      }
      d = d2; ant = e2;
    }
    return d;
  }
  function anoNovoLunarChines(ano) {
    let a = diaJ(ano - 1, 12, 15, 0), b = diaJ(ano - 1, 12, 28, 0);
    for (let j = 0; j < 40; j++) { const m = (a + b) / 2; if (solLon(m).lon < 270) a = m; else b = m; }
    const diaSolsticio = dataChinaUTC8(b);
    let d = b - 2, achadas = 0;
    for (let seg = 0; seg < 5; seg++) {
      d = luaNovaAposDia(d) + 0.01;
      if (dataChinaUTC8(d) > diaSolsticio && ++achadas === 2) {
        const n = dataChinaUTC8(d);
        return { ano, mes: Math.floor(n / 100) % 100, dia: n % 100 };
      }
    }
    return { ano, mes: 2, dia: 4 };
  }

  function calcularHoroscopoChines(dados) {
    const [ano, mes, dia] = dados.dataNascimento.split("-").map(Number);
    const virada = anoNovoLunarChines(ano);
    const nascUTC = Date.UTC(ano, mes - 1, dia);
    const viradaUTC = Date.UTC(virada.ano, virada.mes - 1, virada.dia);
    const anoChines = nascUTC < viradaUTC ? ano - 1 : ano;

    const idxAnimal = ((anoChines - 4) % 12 + 12) % 12;
    const tronco = ((anoChines - 4) % 10 + 10) % 10;
    const idxElemento = Math.floor(tronco / 2);
    const polaridade = tronco % 2 === 1 ? "Yin (Receptiva, Intuitiva e Profunda)" : "Yang (Ativa, Expansiva e Realizadora)";

    const [nomeAnimal, ideogramaAnimal, domAnimal, sombraAnimal] = ANIMAIS_CHINESES[idxAnimal];
    const [nomeElemento, ideogramaElem, domElem, sombraElem] = ELEMENTOS_CHINESES[idxElemento];
    const assinatura = `${nomeAnimal} de ${nomeElemento}`;

    return {
      anoChines,
      assinatura,
      assinaturaCompleta: assinatura,
      nomeChines: `${ideogramaElem}${ideogramaAnimal}`,
      ideograma: `${ideogramaElem}${ideogramaAnimal}`,
      estacao: `Ciclo Solar-Lunar de ${anoChines}`,
      animal: { nome: nomeAnimal, ideograma: ideogramaAnimal, dom: domAnimal, sombra: sombraAnimal },
      elemento: { nome: nomeElemento, ideograma: ideogramaElem, dom: domElem, sombra: sombraElem },
      arquetipo: `A sabedoria ancestral do ${assinatura} combina ${polaridade.toLowerCase()}.`,
      domInato: domAnimal,
      sombraBloqueio: sombraAnimal,
      essenciaElemento: `${domElem} (Atenção sob desequilíbrio: ${sombraElem})`,
      polaridade,
      sintese: `No Horóscopo Oriental, sua força vital é a de **${assinatura}** (${polaridade}). Isso confere a você um dom natural de *${domAnimal.toLowerCase()}* potencializado pelo elemento ${nomeElemento} (*${domElem.toLowerCase()}*). Seu ponto de atenção ocorre sob estresse: *${sombraAnimal.toLowerCase()}*`
    };
  }

  /* =========================================================================
     8C. ENEAGRAMA SAGRADO (OS 9 ARQUÉTIPOS DE MOTIVAÇÃO E DESBLOQUEIO)
     ========================================================================= */
  const ENEATIPOS = {
    1: {
      tipo: 1, nome: "Tipo 1 — A Perfeccionista / Reformadora Ética",
      centro: "Centro Instintivo / Visceral",
      feridaNuclear: "O Ressentimento Silencioso e o Juiz Interno Implacável: sentir que nada está suficientemente bom e que qualquer erro seu é imperdoável.",
      virtudeCura: "A Serenidade e a Permissão: compreender que a perfeição divina inclui o processo humano e que você merece descanso antes mesmo de 'terminar tudo'.",
      noAmor: "Tende a cobrar padrões altíssimos de si e do parceiro, engolindo frustrações até se tornar fria ou crítica.",
      naCarreira: "Excelência impecável, mas trava lançamentos e precificação por achar que ainda falta polir mais um detalhe.",
      caminhoIntegracao: "Integra para o Tipo 7 (Alegria, Espontaneidade e Leveza): permita-se prazer sem culpa."
    },
    2: {
      tipo: 2, nome: "Tipo 2 — A Prestativa / Doadora Magnética",
      centro: "Centro Emocional / Coração",
      feridaNuclear: "O Orgulho de Não Precisar de Ninguém (enquanto salva a todos): doar-se até a exaustão esperando que o outro adivinhe suas necessidades.",
      virtudeCura: "A Humildade Sagrada e o Autocuidado: reconhecer suas próprias necessidades abertamente e aprender a dizer 'não' sem culpa.",
      noAmor: "Assume o papel de salvadora/indispensável, atraindo pessoas que sugam seu cuidado sem oferecer reciprocidade.",
      naCarreira: "Cobra menos do que vale por empatia excessiva com a dor do cliente, misturando afeto com negócios.",
      caminhoIntegracao: "Integra para o Tipo 4 (Autenticidade e Mergulho em Si Mesma): volte o olhar amoroso para o seu próprio coração."
    },
    3: {
      tipo: 3, nome: "Tipo 3 — A Realizadora / Estrela de Alta Performance",
      centro: "Centro Emocional / Coração",
      feridaNuclear: "A Confusão entre 'Ser Amada' e 'Dar Resultado': medo profundo de que, se parar de produzir ou falhar, perderá o valor aos olhos do mundo.",
      virtudeCura: "A Verdade e a Autenticidade: saber que seu valor existe pelo que você É na essência, não apenas pelos troféus que entrega.",
      noAmor: "Coloca o trabalho como escudo ou mantém uma imagem de mulher inabalável, dificultando a intimidade vulnerável.",
      naCarreira: "Altíssima capacidade de realização, mas risco de esgotamento (burnout) ou de construir sucesso em uma meta que não alimenta a alma.",
      caminhoIntegracao: "Integra para o Tipo 6 (Lealdade à Própria Essência e Vínculos Reais): desacelere para sentir."
    },
    4: {
      tipo: 4, nome: "Tipo 4 — A Individualista / Alquimista da Profundidade",
      centro: "Centro Emocional / Coração",
      feridaNuclear: "A Sensação de Falta e Melancolia Comparativa: sentir que falta uma peça em você que os outros parecem ter com facilidade.",
      virtudeCura: "A Equanimidade Emocional: parar de esperar o estado emocional perfeito para agir e reconhecer a riqueza do que já está presente.",
      noAmor: "Busca conexões profundas e poéticas; pode idealizar amores distantes ou testar a intensidade do parceiro.",
      naCarreira: "Talento autoral único e insubstituível; trava quando depende apenas da inspiração emocional para manter a rotina.",
      caminhoIntegracao: "Integra para o Tipo 1 (Estrutura Prática, Método e Constância Diária): transforme inspiração em rotina."
    },
    5: {
      tipo: 5, nome: "Tipo 5 — A Investigadora / Sábia Observadora",
      centro: "Centro Mental / Cabeça",
      feridaNuclear: "A Avareza Energética e o Isolamento na Mente: medo de que o mundo e as relações esgotem suas reservas internas.",
      virtudeCura: "O Desapego e a Presença no Corpo: sair da análise mental infinita e compartilhar sua sabedoria viva com o mundo.",
      noAmor: "Precisa de espaço e privacidade; sob pressão, levanta muralhas de silêncio e racionaliza o que sente.",
      naCarreira: "Acumula conhecimento profundo, mas adia a exposição pública por sentir que precisa estudar mais.",
      caminhoIntegracao: "Integra para o Tipo 8 (Força Instintiva, Presença Corporal e Comando no Mundo)."
    },
    6: {
      tipo: 6, nome: "Tipo 6 — A Leal / Guardiã da Segurança",
      centro: "Centro Mental / Cabeça",
      feridaNuclear: "A Ansiedade Antecipatória e a Dúvida: escanear o futuro em busca de riscos, traições ou imprevistos antes que aconteçam.",
      virtudeCura: "A Coragem e a Fé na Própria Autoridade Interna: confiar no seu próprio taco sem precisar de garantias absolutas.",
      noAmor: "Leal e comprometida, mas pode testar a segurança do parceiro por medo de ser abandonada ou traída.",
      naCarreira: "Excelente estrategista e prevenidora de crises, mas o medo de arriscar pode mantê-la presa em zonas seguras abaixo do seu potencial.",
      caminhoIntegracao: "Integra para o Tipo 9 (Paz Interior, Relaxamento Mental e Confiança no Fluxo da Vida)."
    },
    7: {
      tipo: 7, nome: "Tipo 7 — A Entusiasta / Visionária Livre",
      centro: "Centro Mental / Cabeça",
      feridaNuclear: "A Fuga da Dor e do Aprisionamento: pular de ideia em ideia ou de estímulo em estímulo para não sentir vazio ou limitação.",
      virtudeCura: "A Sobriedade Luminosa e o Foco: mergulhar fundo em uma escolha até colher o néctar completo da realização.",
      noAmor: "Traz alegria e encantamento; trava quando sente que a relação virou rotina pesada ou cobrança.",
      naCarreira: "Mente brilhante para iniciar projetos e enxergar futuros, precisando apenas de foco para finalizar o que começa.",
      caminhoIntegracao: "Integra para o Tipo 5 (Profundidade, Silêncio Criativo e Maestria Especializada)."
    },
    8: {
      tipo: 8, nome: "Tipo 8 — A Desafiadora / Soberana Protetora",
      centro: "Centro Instintivo / Visceral",
      feridaNuclear: "A Armadura da Invulnerabilidade: jurar nunca mais ser controlada ou ferida, assumindo o comando de tudo na força.",
      virtudeCura: "A Inocência e a Ternura Confiante: descobrir que abrir a guarda para quem merece não diminui sua soberania.",
      noAmor: "Intensa, leal e protetora; precisa cuidar para não intimidar o parceiro ou transformar a relação em cabo de guerra.",
      naCarreira: "Nascida para grandes realizações e liderança; destrava ainda mais quando delega e governa com leveza.",
      caminhoIntegracao: "Integra para o Tipo 2 (Coração Aberto, Compaixão e Permissão para Cuidar e Ser Cuidada)."
    },
    9: {
      tipo: 9, nome: "Tipo 9 — A Pacificadora / Mediadora da Harmonia",
      centro: "Centro Instintivo / Visceral",
      feridaNuclear: "O Auto-Esquecimento (Anestesia da Própria Vontade): fundir-se com a agenda dos outros e adiar os próprios sonhos para evitar conflito.",
      virtudeCura: "A Ação Certa e o Despertar de Si: declarar sua própria voz, seus desejos e sua prioridade sem medo de desagradar.",
      noAmor: "Acolhedora e pacífica, mas pode anular os próprios gostos até acumular uma teimosia silenciosa.",
      naCarreira: "Trava pela procrastinação nas prioridades próprias enquanto resolve demandas secundárias de todo mundo.",
      caminhoIntegracao: "Integra para o Tipo 3 (Foco, Brilho Pessoal, Protagonismo e Realização Prática)."
    }
  };

  function calcularEneagrama(dados, numerologia) {
    const subEnea = dados.eneagrama || {};
    let tipoEscolhido = Number(dados.eneagramaTipo || subEnea.tipoConhecido || 0);
    if (!tipoEscolhido || tipoEscolhido < 1 || tipoEscolhido > 9) {
      // Mapeia a partir da resposta modular de motivação inconsciente ou da vibração de Alma/Expressão
      const mapaMotivacao = {
        perfeicao: 1,
        ajudar: 2,
        sucesso: 3,
        autenticidade: 4,
        conhecimento: 5,
        seguranca: 6,
        liberdade: 7,
        controle: 8,
        paz: 9
      };
      const mot = dados.eneagramaMotivacao || subEnea.motivacaoInconsciente || "";
      tipoEscolhido = mapaMotivacao[mot] || ((numerologia.alma.valor - 1) % 9) + 1;
    }
    const base = ENEATIPOS[tipoEscolhido] || ENEATIPOS[2];
    const asaAnt = base.tipo === 1 ? 9 : base.tipo - 1;
    const asaPos = base.tipo === 9 ? 1 : base.tipo + 1;
    const PAIXOES_ENEA = {
      1: "Autoexigência e Juízo Crítico",
      2: "Necessidade de Ser Indispensável",
      3: "Busca por Validação via Performance",
      4: "Melancolia e Nostalgia do Ideal",
      5: "Retração Protetora de Energia",
      6: "Hipervigilância e Antecipação de Riscos",
      7: "Inquietação e Fuga da Dor",
      8: "Blindagem Contra a Vulnerabilidade",
      9: "Auto-Esquecimento pela Paz Aparente"
    };
    return {
      ...base,
      triade: base.centro,
      asas: `${base.tipo}w${asaAnt} / ${base.tipo}w${asaPos}`,
      paixao: PAIXOES_ENEA[base.tipo] || base.feridaNuclear.split(":")[0]
    };
  }

  /* =========================================================================
     9. NUMEROLOGIA COMPLETA DO NOME DE BATISMO E DATA
     ========================================================================= */
  const MAPA_PITAGORICO = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9
  };
  const VOGAIS_SET = new Set(["A", "E", "I", "O", "U", "Y"]);

  function somarDigitos(n) {
    return String(Math.abs(n)).split("").reduce((acc, d) => acc + Number(d || 0), 0);
  }

  function reduzirNumerologia(soma, preservarMestres = true) {
    let n = soma;
    const trilha = [n];
    while (n > 9 && !(preservarMestres && (n === 11 || n === 22 || n === 33))) {
      n = somarDigitos(n);
      trilha.push(n);
    }
    return { valor: n, somaBruta: soma, trilha };
  }

  function calcularNumerologia(dados) {
    const nomeLimpo = String(dados.nomeBatismo || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");

    let somaVogais = 0, somaConsoantes = 0, somaTotal = 0;
    const contagemNumeros = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    for (const letra of nomeLimpo) {
      const v = MAPA_PITAGORICO[letra] || 0;
      if (!v) continue;
      contagemNumeros[v] = (contagemNumeros[v] || 0) + 1;
      somaTotal += v;
      if (VOGAIS_SET.has(letra)) somaVogais += v;
      else somaConsoantes += v;
    }

    const alma = reduzirNumerologia(somaVogais || 1, true);
    const impressao = reduzirNumerologia(somaConsoantes || 1, false);
    const expressao = reduzirNumerologia(somaTotal || 1, true);

    const [ano, mes, dia] = dados.dataNascimento.split("-").map(Number);
    const somaData = somarDigitos(dia) + somarDigitos(mes) + somarDigitos(ano);
    const destino = reduzirNumerologia(somaData, true);
    const maturidade = reduzirNumerologia(expressao.valor + destino.valor, true);

    // Ano Pessoal vigente (2026)
    const anoAtual = new Date().getFullYear();
    const anoPessoal = reduzirNumerologia(somarDigitos(dia) + somarDigitos(mes) + somarDigitos(anoAtual), false);

    // Lições Cármicas (números ausentes no nome de batismo)
    const licoesCarmicas = Object.entries(contagemNumeros)
      .filter(([, qtd]) => qtd === 0)
      .map(([num]) => ({
        numero: Number(num),
        ...SIGNIFICADOS_NUM[Number(num)]
      }));

    // Dívidas Cármicas (13, 14, 16, 19 no dia de nascimento ou nas trilhas)
    const dividasSet = new Set();
    if ([13, 14, 16, 19].includes(dia)) dividasSet.add(dia);
    for (const r of [alma, expressao, destino]) {
      for (const passo of r.trilha) {
        if ([13, 14, 16, 19].includes(passo)) dividasSet.add(passo);
      }
    }
    const dividasCarmicas = [...dividasSet].map(d => DIVIDIAS_CARMICAS[d]);

    const infoDe = n => SIGNIFICADOS_NUM[n] || SIGNIFICADOS_NUM[reduzirNumerologia(n, false).valor];

    // Dons Natos (Dia Natal + Vibrações Dominantes do Nome + Caminho Mais Suave)
    const diaNatalReduzido = reduzirNumerologia(dia, true);
    const infoDiaNatal = infoDe(diaNatalReduzido.valor);
    const vibracoesDominantes = Object.entries(contagemNumeros)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([num, qtd]) => ({
        numero: Number(num),
        quantidade: qtd,
        ...SIGNIFICADOS_NUM[Number(num)]
      }));

    const domPrincipal = vibracoesDominantes[0] || { numero: expressao.valor, ...infoDe(expressao.valor) };
    const donsNatos = {
      diaNatal: dia,
      vibracaoDiaNatal: diaNatalReduzido.valor,
      tituloDiaNatal: infoDiaNatal.titulo,
      domDiaNatal: `Nascida no dia ${dia} (Vibração ${diaNatalReduzido.valor} — ${infoDiaNatal.titulo}), você trouxe de berço a faculdade natural de ${infoDiaNatal.expressao.replace(/^Dom natural de /i, "")}`,
      domExpressao: `Sua Expressão ${expressao.valor} (${infoDe(expressao.valor).titulo}) somada à maior concentração de letras na vibração ${domPrincipal.numero} (${domPrincipal.titulo}) revela que seu talento inato opera sem esforço quando você atua com autonomia criativa, leitura intuitiva de pessoas e direção estratégica.`,
      caminhoMaisSuave: `Para transitar pela vida por um caminho mais suave e próspero, pare de tentar vencer pelo desgaste bruto (forçando métodos rígidos que contrariam sua Alma ${alma.valor}). Seu fluxo de menor resistência acontece quando você usa o seu Dom do Dia ${dia} (${infoDiaNatal.titulo}) aliado à Maturidade ${maturidade.valor} (${infoDe(maturidade.valor).titulo}): posicione-se onde sua sensibilidade, voz e visão única sejam o centro do seu valor, permitindo que os resultados venham por magnetismo e alinhamento, e não por exaustão.`
    };

    return {
      alma: { ...alma, info: infoDe(alma.valor) },
      impressao: { ...impressao, info: infoDe(impressao.valor) },
      expressao: { ...expressao, info: infoDe(expressao.valor) },
      destino: { ...destino, info: infoDe(destino.valor) },
      maturidade: { ...maturidade, info: infoDe(maturidade.valor) },
      anoPessoal: { ...anoPessoal, anoReferencia: anoAtual, info: infoDe(anoPessoal.valor) },
      contagemNumeros,
      vibracoesDominantes,
      licoesCarmicas,
      dividasCarmicas,
      donsNatos
    };
  }

  /* =========================================================================
     10. MATRIZ DO DESTINO COMPLETA (OS 22 ARCANOS & CANAIS KÁRMICOS)
     ========================================================================= */
  function reduzir22(n) {
    let v = Math.abs(Number(n) || 0);
    if (v === 0) return 22;
    while (v > 22) {
      v = String(v).split("").reduce((s, d) => s + Number(d), 0);
    }
    return v === 0 ? 22 : v;
  }

  function calcularMatrizDestino(dados) {
    const [ano, mes, dia] = dados.dataNascimento.split("-").map(Number);

    // 4 Pontas do Quadrado Pessoal (Diagonal)
    const A = reduzir22(dia);                // Retrato / Cartão de Visita (Esquerda)
    const B = reduzir22(mes);                // Conexão Espiritual / Anjo (Topo)
    const C = reduzir22(ano);                // Linha da Matéria, Saúde e Dinheiro (Direita)
    const D = reduzir22(A + B + C);          // Carma de Vidas Passadas (Base)
    const E = reduzir22(A + B + C + D);      // Centro da Matriz / Zona de Conforto da Alma

    // 4 Pontas do Quadrado Ancestral (Linhagem Paterna e Materna)
    const F = reduzir22(A + B);              // Linhagem Paterna Espiritual (Topo-Esquerda)
    const G = reduzir22(B + C);              // Linhagem Materna Espiritual (Topo-Direita)
    const H = reduzir22(C + D);              // Linhagem Paterna Material (Baixo-Direita)
    const I = reduzir22(D + A);              // Linhagem Materna Material (Baixo-Esquerda)

    // Cauda Cármica (Tríade Inferior entre E e D)
    const K1 = reduzir22(D + E);
    const K2 = reduzir22(D + K1);
    const K3 = D;
    const codigoCauda = `${K1}-${K2}-${K3}`;

    // Canal dos Relacionamentos (Entre K1 e o ponto interno de C)
    const C1 = reduzir22(C + E);
    const AmorCentro = reduzir22(K1 + C1);
    const AmorParceiro = reduzir22(K1 + AmorCentro);

    // Canal do Dinheiro (Entre C1, C e o eixo superior/direito)
    const DinheiroProfissao = reduzir22(C + C1);
    const DinheiroFluxo = reduzir22(C1 + AmorCentro);

    // Propósito Pessoal (Céu + Terra)
    const Ceu = reduzir22(B + D);
    const Terra = reduzir22(A + C);
    const PropositoPessoal = reduzir22(Ceu + Terra);

    const arc = n => ARCANOS_MATRIZ[reduzir22(n)];

    const caudaEspecial = CAUDAS_CARMICAS[codigoCauda] || {
      nome: `Tríade Cármica ${codigoCauda} (${arc(K1).nome} · ${arc(K2).nome} · ${arc(K3).nome})`,
      passado: `Em existências passadas, sua alma viveu intensos aprendizados ligados aos arquétipos de ${arc(K3).nome} (${K3}) e ${arc(K2).nome} (${K2}), deixando uma memória inconsciente de ${arc(K3).sombra.toLowerCase()}`,
      bloqueioAtual: `Nesta vida, sempre que você entra em estresse emocional ou financeiro, tende a ativar a defesa de ${arc(K1).nome} (${K1}): ${arc(K1).sombra}`,
      chave: `Sua libertação cármica acontece quando você eleva a tríade ${codigoCauda} para a luz: ${arc(K3).luz}`
    };

    return {
      nodos: { A, B, C, D, E, F, G, H, I, K1, K2, K3, C1, AmorCentro, AmorParceiro, DinheiroProfissao, DinheiroFluxo, Ceu, Terra, PropositoPessoal },
      arcanos: {
        retrato: arc(A),
        espiritual: arc(B),
        materia: arc(C),
        carmaBase: arc(D),
        centro: arc(E),
        proposito: arc(PropositoPessoal),
        amorEntrada: arc(K1),
        amorCentro: arc(AmorCentro),
        amorParceiro: arc(AmorParceiro),
        dinheiroEntrada: arc(C),
        dinheiroGuardiao: arc(C1),
        dinheiroProfissao: arc(DinheiroProfissao)
      },
      caudaCarmica: {
        codigo: codigoCauda,
        numeros: [K1, K2, K3],
        arcanos: [arc(K1), arc(K2), arc(K3)],
        ...caudaEspecial
      }
    };
  }

  /* =========================================================================
     11. CRUZAMENTO CLÍNICO-ORACULAR COM O QUESTIONÁRIO DOS 3 PILARES
     ========================================================================= */
  const BANHOS_E_RITUAIS = {
    Fogo: {
      banho: "Banho de Alecrim Fresco, Pétalas de Rosa Branca e Camomila Morna",
      preparo: "Ferva 1,5L de água, desligue o fogo e adicione um punhado de camomila, 3 ramos de alecrim e pétalas de 1 rosa branca. Abafe por 15 minutos com um prato. Após seu banho higiênico, despeje do pescoço para baixo mentalizando o resfriamento da ansiedade e a clareza do seu brilho real.",
      cristal: "Ametista & Quartzo Rosa (para transmutar a hipervigilância em magnetismo sereno)",
      horario: "Terça-feira ou Domingo, antes de dormir"
    },
    Terra: {
      banho: "Banho de Folhas de Louro, Canela em Pau, Manjericão e Mel",
      preparo: "Ferva 1,5L de água com 3 paus de canela e 7 folhas de louro por 3 minutos. Desligue, acrescente folhas frescas de manjericão e 7 gotas de mel. Abafe por 15 minutos. Jogue do pescoço para baixo decretando a quebra do teto financeiro e a permissão para prosperar com leveza.",
      cristal: "Citrino Natural & Pirita (para ancorar merecimento material e destravar entradas)",
      horario: "Quinta-feira ou Domingo pela manhã"
    },
    Ar: {
      banho: "Banho de Lavanda (Alfazema), Anis-Estrelado e Sálvia",
      preparo: "Ferva 1,5L de água com 5 estrelas de anis. Desligue o fogo e adicione um punhado de flores de lavanda e folhas de sálvia. Abafe por 15 minutos. Despeje do pescoço para baixo limpando o excesso de cenários mentais, a dúvida e alinhando sua intuição com sua voz.",
      cristal: "Lápis-Lazúli & Selenita Branca (para silenciar o ruído mental e abrir a visão oracular)",
      horario: "Quarta-feira ao anoitecer"
    },
    Água: {
      banho: "Banho de Arruda (ou Guiné), Rosas Vermelhas e Flor de Laranjeira",
      preparo: "Em 1,5L de água recém-fervida, coloque 3 galhos pequenos de arruda (para cortar cordões energéticos do passado), pétalas de 1 rosa vermelha e flor de laranjeira. Abafe por 15 minutos. Jogue do pescoço para baixo sentindo toda dor alheia e memória afetiva antiga escorrer pelo ralo.",
      cristal: "Pedra da Lua & Turmalina Negra (para blindar sua empatia e restaurar seu magnetismo feminino)",
      horario: "Sexta-feira ou noite de Lua Cheia/Minguante"
    }
  };

  function gerarDiagnosticoCruzado(dados, astro, vedica, num, matriz, chines, eneagrama) {
    const sol = astro.porId.sol.signo;
    const lua = astro.porId.lua.signo;
    const venus = astro.porId.venus.signo;
    const saturno = astro.porId.saturno.signo;
    const quiron = astro.porId.quiron.signo;
    const lilith = astro.porId.lilith.signo;
    const nodoN = astro.porId.nodoNorte.signo;
    const nodoS = astro.porId.nodoSul.signo;

    // 1. Eixo Emocional (Quíron + Lua + Nakshatra + Motivação da Alma + Eneagrama + Respostas Emocionais)
    const respEmo = dados.emocional || {};
    const diagnosticoEmocional = {
      titulo: `A Raiz Emocional: Quíron em ${quiron.nome} + Lua em ${lua.nome} (Alma ${num.alma.valor} · ${eneagrama.nome})`,
      sintomaDeclarado: respEmo.emocaoPrincipal || "Sobrecarga emocional e repetição de ciclos internos",
      reacaoCrise: respEmo.reacaoCrise || "Oscilação entre hipercontrole e exaustão",
      feridaRaiz: respEmo.feridaInfancia || "Ferida de validação e pertencimento",
      analiseProfunda: [
        `${dados.nomeBatismo.split(" ")[0]}, você relatou sentir **${(respEmo.emocaoPrincipal || "um desgaste interno silencioso").toLowerCase()}** e reagir às pressões através de **${(respEmo.reacaoCrise || "autodefesa emocional").toLowerCase()}**. O cruzamento do seu mapa revela que isso NÃO é fraqueza nem acaso: você nasceu com **Quíron em ${quiron.nome}** e a **Lua em ${lua.nome}** (Nakshatra Védica **${vedica.nakshatra.nome}**).`,
        `${quiron.quiron} Ao mesmo tempo, sua Lua em ${lua.nome} tem como mecanismo de defesa inconsciente: *${lua.sombra.toLowerCase()}*`,
        `Na Numerologia do seu Nome de Batismo, sua **Motivação da Alma é ${num.alma.valor}** (${num.alma.info.titulo}): ${num.alma.info.alma} Porém, quando sua ferida de **${(respEmo.feridaInfancia || "cobrança interna").toLowerCase()}** é acionada, você entra no bloqueio do número ${num.alma.valor} e na paixão inconsciente do **${eneagrama.nome} (${eneagrama.paixao})**: *${eneagrama.feridaNuclear}*`,
        `Na Matriz do Destino, o seu **Centro de Força é o Arcano ${matriz.arcanos.centro.rom} (${matriz.arcanos.centro.nome})** e sua **Cauda Cármica é ${matriz.caudaCarmica.codigo}**. ${matriz.caudaCarmica.bloqueioAtual}`
      ],
      chaveDesbloqueio: `Para destravar o seu emocional, você precisa parar de lutar contra a sensibilidade da sua Lua em ${lua.nome}, ativar a virtude do seu Eneatipo (${eneagrama.virtudeCura}) e aplicar a chave da sua Cauda Cármica (${matriz.caudaCarmica.codigo}): ${matriz.caudaCarmica.chave}`
    };

    // 2. Eixo de Relacionamentos (Vênus + Lilith + Canal do Amor na Matriz + Eneagrama/Chinês + Respostas Relacionais)
    const respRel = dados.relacionamento || {};
    const diagnosticoRelacionamento = {
      titulo: `O Código Afetivo: Vênus em ${venus.nome} + Lilith em ${lilith.nome} (Canal do Amor ${matriz.nodos.K1}-${matriz.nodos.AmorCentro}-${matriz.nodos.C1})`,
      padraoDeclarado: respRel.padraoRepetido || "Desequilíbrio entre entrega e reciprocidade",
      momentoAtual: respRel.momentoAfetivo || "Busca por conexão autêntica",
      analiseProfunda: [
        `No campo afetivo, você identificou o padrão de **${(respRel.padraoRepetido || "atrair dinâmicas desgastantes").toLowerCase()}**. Olhando para a sua **Lilith (Lua Negra) em ${lilith.nome}** cruzada com **Vênus em ${venus.nome}**, a origem desse padrão fica cristalina: ${lilith.lilith}`,
        `Sua **Vênus em ${venus.nome}** mostra como seu coração realmente funciona: ${venus.venus} Contudo, a entrada do seu **Canal dos Relacionamentos na Matriz do Destino** é regida pelo **Arcano ${matriz.arcanos.amorEntrada.rom} (${matriz.arcanos.amorEntrada.nome})**, com centro no **Arcano ${matriz.arcanos.amorCentro.rom} (${matriz.arcanos.amorCentro.nome})**.`,
        `Quando esse canal vibra no polo negativo, acontece exatamente o que você viveu: *${matriz.arcanos.amorEntrada.amor}* Somado ao seu **${eneagrama.nome}** no amor (*${eneagrama.noAmor.toLowerCase()}*) e à sombra de **${chines.assinaturaCompleta}** na Alquimia Oriental (*${chines.sombraBloqueio.toLowerCase()}*), você acaba tolerando migalhas afetivas por tempo demais.`,
        `Para completar, seu **Número de Impressão ${num.impressao.valor}** projeta para os parceiros uma imagem externa de quem "dá conta de tudo", fazendo com que pessoas imaturas se apoiem na sua força em vez de cuidarem de você.`
      ],
      chaveDesbloqueio: `O seu desbloqueio amoroso exige ativar o polo luminoso do **Arcano ${matriz.arcanos.amorCentro.rom} (${matriz.arcanos.amorCentro.nome})**: ${matriz.arcanos.amorCentro.amor} Pare imediatamente de assumir o papel de terapeuta ou salvadora nas relações.`
    };

    // 3. Eixo Profissional & Financeiro (Saturno + Meio do Céu + Canal do Dinheiro + Destino/Expressão + Dons Natos)
    const respProf = dados.profissional || {};
    const diagnosticoProfissional = {
      titulo: `A Chave da Prosperidade: Saturno em ${saturno.nome} + Canal do Dinheiro (${matriz.nodos.C}-${matriz.nodos.DinheiroProfissao}-${matriz.nodos.C1})`,
      travaDeclarada: respProf.momentoProfissional || "Teto invisível de crescimento e reconhecimento",
      crencaDinheiro: respProf.crencaFinanceira || "Sobrecarga e dificuldade de escalar ganhos",
      analiseProfunda: [
        `No eixo profissional e financeiro, você apontou **${(respProf.momentoProfissional || "a sensação de um teto invisível").toLowerCase()}** e a crença/bloqueio de **${(respProf.crencaFinanceira || "precisar se esforçar demais").toLowerCase()}**.`,
        `Seu **Saturno em ${saturno.nome}** explica a raiz exata dessa trava material: ${saturno.saturno}`,
        `Na sua **Matriz do Destino**, a porta de entrada do seu dinheiro é o **Arcano ${matriz.arcanos.dinheiroEntrada.rom} (${matriz.arcanos.dinheiroEntrada.nome})**, guiado pelo **Arcano ${matriz.arcanos.dinheiroProfissao.rom} (${matriz.arcanos.dinheiroProfissao.nome})** e guardado pelo **Arcano ${matriz.arcanos.dinheiroGuardiao.rom} (${matriz.arcanos.dinheiroGuardiao.nome})**. Veja o que fecha e o que abre seu fluxo financeiro: *${matriz.arcanos.dinheiroEntrada.dinheiro}*`,
        `Na Numerologia, seu **Número de Expressão é ${num.expressao.valor}** e seu **Destino é ${num.destino.valor}**, enquanto você atravessa em **${num.anoPessoal.anoReferencia} o Ano Pessoal ${num.anoPessoal.valor}**. ${num.licoesCarmicas.length ? `Você possui ${num.licoesCarmicas.length === 1 ? "a Lição Cármica" : "as Lições Cármicas"} **${num.licoesCarmicas.map(l => l.numero).join(", ")}** ausentes nas letras do seu nome de batismo, o que exige atenção consciente a: *${num.licoesCarmicas[0].licao}*` : "Seu nome de batismo possui todas as 9 vibrações numéricas presentes, o que significa que você já tem todas as ferramentas internas — faltava apenas alinhar a rota!"}`
      ],
      chaveDesbloqueio: `Para romper seu teto financeiro nos próximos 90 dias (rumo à sua meta: "${respProf.meta90Dias || "prosperidade e autonomia"}"), ative o **Arcano ${matriz.arcanos.dinheiroProfissao.rom} (${matriz.arcanos.dinheiroProfissao.nome})**: ${matriz.arcanos.dinheiroProfissao.dinheiro} Seu **Nodo Norte em ${nodoN.nome}** confirma que sua evolução está em abandonar a velha defesa de ${nodoS.nome} e assumir a coragem de ${nodoN.nome}.`
    };

    // Soluções Práticas Imediatas (Foco em Emoções, Relações/Afetos e Alinhamento Prático — essencial para Standard e Profunda)
    const solucoesPraticasStandard = [
      {
        pilar: "1. Detox Emocional & Quebra da Autossabotagem",
        solucao: `Sempre que o gatilho de ${(respEmo.emocaoPrincipal || "ansiedade ou exaustão").toLowerCase()} surgir, reconheça que é a memória de Quíron em ${quiron.nome} e a paixão do ${eneagrama.nome} (${eneagrama.paixao}) tentando te proteger. Em vez de reagir com ${(respEmo.reacaoCrise || "hipercontrole").toLowerCase()}, pratique a pausa consciente de 90 segundos e aplique o caminho de integração: ${eneagrama.caminhoIntegracao}`
      },
      {
        pilar: "2. Reposicionamento em Relações & Afetos",
        solucao: `Para encerrar o ciclo de ${(respRel.padraoRepetido || "desequilíbrio afetivo").toLowerCase()}, alinhe sua Vênus em ${venus.nome} ao Arcano ${matriz.arcanos.amorCentro.rom} (${matriz.arcanos.amorCentro.nome}): estabeleça limites claros logo no início das interações, pare de justificar ausências alheias e permita ser cuidada sem precisar comprar amor através de excesso de prestatividade.`
      },
      {
        pilar: "3. Ativação do Caminho Suave & Fluxo Material",
        solucao: `NoAno Pessoal ${num.anoPessoal.valor} (${num.anoPessoal.info.titulo}), sua energia rende o triplo quando você honra seu dom de ${chines.assinaturaCompleta} (${chines.domInato.toLowerCase()}). Concentre 80% da sua rotina na sua zona de genialidade natural (Destino ${num.destino.valor}) e corte tarefas onde você age apenas por culpa.`
      }
    ];

    // Seção Estratégica de Upsell Exclusivo para quem adquiriu a Versão Standard
    const upsellStandard = {
      titulo: "Acesso Reservado: Desbloqueie as Camadas Ocultas do Seu Dossiê Profundo",
      subtitulo: "Você acabou de ver a ponta do iceberg do seu código astral e emocional. Mas a verdadeira raiz cármica e financeira ainda está selada.",
      explicacao: `Na sua Análise Standard, revelamos sua Tríade Solar/Lunar, o padrão central das suas Relações/Afetos (Vênus em ${venus.nome} + Lilith em ${lilith.nome}) e sua síntese de Eneagrama (${eneagrama.nome}) com Horóscopo Chinês (${chines.assinaturaCompleta}). Porém, o seu mapa mostra que a trava mestra está gravada na sua **Cauda Cármica ${matriz.caudaCarmica.codigo}**, no seu **Período Planetário Védico Atual (Regente ${vedica.nakshatra.regenteMomento})** e nas suas **Dívidas e Lições Cármicas do Nome de Batismo**.`,
      beneficiosExclusivos: [
        `Mapa Védico Sideral Aprofundado (Jyotish): O que o seu momento atual (${vedica.nakshatra.nome} · Regente ${vedica.nakshatra.regenteMomento}) exige de você agora e seu Direcionamento Prático para os próximos meses.`,
        `Numerologia Kármica Completa + Dons Natos: Descubra suas Lições e Dívidas Cármicas ocultas no nome e o Mapa dos seus Dons Natos (Dia Natal ${num.donsNatos.diaNatal} + Expressão ${num.expressao.valor}) para seguir por um caminho muito mais suave.`,
        `Geometria Sagrada da Matriz do Destino (22 Arcanos): Desbloqueio completo da sua Cauda Cármica (${matriz.caudaCarmica.codigo}) e da tríade exata do seu Canal do Dinheiro (${matriz.nodos.C}-${matriz.nodos.DinheiroProfissao}-${matriz.nodos.C1}).`,
        `Protocolo Prático de 21 Dias da Tryv: Banho energético específico para seu elemento (${lua.elemento}), Cristais de ancoragem, Mantra pessoal de quebra de contrato e plano passo a passo.`
      ],
      gatilhoDesconto: "CONDIÇÃO ESPECIAL DE UPGRADE PARA CLIENTES STANDARD: Como você já deu o primeiro passo adquirindo a versão Standard (R$ 37), você tem direito a um abatimento especial no seu upgrade para o Dossiê Completo de Análise Profunda.",
      codigoCupom: "UPGRADE-PROFUNDA-VIP",
      urlUpgrade: "https://loja.infinitepay.io/tryvtuath/kka1436-mapa-do-desbloqueio---analise-profunda"
    };

    const ritual = BANHOS_E_RITUAIS[lua.elemento] || BANHOS_E_RITUAIS.Água;

    // Cálculo de Índices Visuais de Alinhamento vs. Bloqueio
    const semente = (astro.porId.sol.lon + astro.porId.lua.lon + num.destino.valor * 17) | 0;
    const nivelBloqueioEmo = 68 + (semente % 21);
    const nivelBloqueioRel = 64 + ((semente * 3) % 24);
    const nivelBloqueioProf = 71 + ((semente * 7) % 19);

    return {
      resumoExecutivo: {
        arquetipoCentral: `${matriz.arcanos.centro.nome} (${matriz.arcanos.centro.rom}) · Sol em ${sol.nome} · ${chines.assinaturaCompleta}`,
        bloqueioInvisivelMestre: `A colisão entre ${quiron.nome} (Quíron), a Cauda Cármica ${matriz.caudaCarmica.codigo} e Saturno em ${saturno.nome}`,
        indices: {
          emocional: nivelBloqueioEmo,
          relacionamento: nivelBloqueioRel,
          profissional: nivelBloqueioProf
        }
      },
      emocional: diagnosticoEmocional,
      relacionamento: diagnosticoRelacionamento,
      profissional: diagnosticoProfissional,
      solucoesPraticasStandard,
      upsellStandard,
      protocoloTryv: {
        ...ritual,
        mantra: `“Eu, ${dados.nomeBatismo}, libero com amor toda lealdade invisível à dor e ao limite. Eu assumo a luz do meu Arcano ${matriz.arcanos.centro.nome} (${matriz.arcanos.centro.rom}), honro minha sensibilidade e abro meus caminhos para o amor recíproco e a abundância soberana. Assim é.”`,
        plano21Dias: [
          {
            semana: "Semana 1 (Dias 1 a 7) — Desintoxicação Emocional & Corte da Cauda Cármica",
            acao: `Realizar o ${ritual.banho} e escrever em uma folha tudo o que você vem carregando por culpa ou medo (${quiron.nome} / Cauda ${matriz.caudaCarmica.codigo}). Queime a folha com segurança na chama de uma vela branca, declarando encerrado o ciclo de repetição.`
          },
          {
            semana: "Semana 2 (Dias 8 a 14) — Reprogramação do Magnetismo Afetivo",
            acao: `Praticar o limite sagrado da sua Vênus em ${venus.nome} e do Arcano ${matriz.arcanos.amorCentro.rom}: durante 7 dias, não tome a frente para 'salvar' ou resolver problemas emocionais de adultos ao seu redor. Recupere sua energia magnética e repita seu Mantra ao acordar.`
          },
          {
            semana: "Semana 3 (Dias 15 a 21) — Abertura do Canal do Dinheiro & Ação de Destino",
            acao: `Executar 1 movimento concreto alinhado ao seu Arcano do Dinheiro (${matriz.arcanos.dinheiroEntrada.rom} - ${matriz.arcanos.dinheiroEntrada.nome}) e ao seu Nodo Norte em ${nodoN.nome} em direção à sua meta de 90 dias (${respProf.meta90Dias || "expansão profissional e financeira"}).`
          }
        ]
      }
    };
  }

  /* =========================================================================
     12. FUNÇÃO PRINCIPAL DE PROCESSAMENTO COMPLETO
     ========================================================================= */
  function processarAnaliseCompleta(dadosCliente) {
    const astro = calcularAstrologiaOcidental(dadosCliente);
    const vedica = calcularAstrologiaVedica(astro, dadosCliente);
    const numerologia = calcularNumerologia(dadosCliente);
    const matriz = calcularMatrizDestino(dadosCliente);
    const chines = calcularHoroscopoChines(dadosCliente);
    const eneagrama = calcularEneagrama(dadosCliente, numerologia);
    const diagnostico = gerarDiagnosticoCruzado(dadosCliente, astro, vedica, numerologia, matriz, chines, eneagrama);

    return {
      geradoEm: new Date().toLocaleDateString("pt-BR"),
      plano: dadosCliente.plano === "standard" ? "standard" : "profunda",
      cliente: dadosCliente,
      astro,
      vedica,
      numerologia,
      matriz,
      chines,
      eneagrama,
      diagnostico
    };
  }

  /* =========================================================================
     13. RENDERIZADORES SVG (MAPA ASTRAL + OCTAGRAMA DA MATRIZ DO DESTINO)
     ========================================================================= */
  function svgMatrizDestino(matriz) {
    const n = matriz.nodos;
    const nodoSVG = (x, y, r, val, corFundo, corTexto, rotulo = "") => `
      <g>
        <circle cx="${x}" cy="${y}" r="${r + 3}" fill="none" stroke="rgba(242,193,78,0.45)" stroke-width="1"/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="${corFundo}" stroke="#f2c14e" stroke-width="2"/>
        <text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Cinzel, Georgia, serif" font-size="${r * 0.92}" font-weight="700" fill="${corTexto}">${val}</text>
        ${rotulo ? `<text x="${x}" y="${y + r + 13}" text-anchor="middle" font-family="Jost, sans-serif" font-size="9.5" fill="#ffe6a3" letter-spacing="0.5">${rotulo}</text>` : ""}
      </g>`;

    return `<svg viewBox="0 0 420 420" class="svg-matriz" role="img" aria-label="Octagrama da Matriz do Destino">
      <defs>
        <radialGradient id="mat-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2b1a5e" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#120e2e" stop-opacity="0.95"/>
        </radialGradient>
      </defs>
      <circle cx="210" cy="210" r="196" fill="url(#mat-bg)" stroke="rgba(242,193,78,0.45)" stroke-width="1.5"/>
      <circle cx="210" cy="210" r="160" fill="none" stroke="rgba(242,193,78,0.25)" stroke-dasharray="4 4"/>
      <!-- Quadrado Ancestral (Reto) -->
      <polygon points="97,97 323,97 323,323 97,323" fill="rgba(185,163,255,0.04)" stroke="rgba(185,163,255,0.45)" stroke-width="1.4"/>
      <!-- Quadrado Pessoal (Losango) -->
      <polygon points="210,50 370,210 210,370 50,210" fill="rgba(242,193,78,0.05)" stroke="rgba(242,193,78,0.75)" stroke-width="1.8"/>
      <!-- Eixos Centrais -->
      <line x1="50" y1="210" x2="370" y2="210" stroke="rgba(242,193,78,0.4)" stroke-width="1.2"/>
      <line x1="210" y1="50" x2="210" y2="370" stroke="rgba(242,193,78,0.4)" stroke-width="1.2"/>
      <line x1="97" y1="97" x2="323" y2="323" stroke="rgba(185,163,255,0.28)" stroke-width="1"/>
      <line x1="323" y1="97" x2="97" y2="323" stroke="rgba(185,163,255,0.28)" stroke-width="1"/>
      <!-- Linha do Amor e Linha do Dinheiro -->
      <line x1="210" y1="305" x2="305" y2="210" stroke="#ff8cc0" stroke-width="1.8" stroke-dasharray="4 3"/>
      <text x="272" y="274" text-anchor="middle" font-family="Jost, sans-serif" font-size="9" fill="#ff8cc0">♥ AMOR</text>
      <text x="300" y="184" text-anchor="middle" font-family="Jost, sans-serif" font-size="9" fill="#ffe6a3">$ DINHEIRO</text>
      <!-- Pontas Ancestrais -->
      ${nodoSVG(97, 97, 15, n.F, "#1b1546", "#c9bfe6", "Pai-Esp")}
      ${nodoSVG(323, 97, 15, n.G, "#1b1546", "#c9bfe6", "Mãe-Esp")}
      ${nodoSVG(323, 323, 15, n.H, "#1b1546", "#c9bfe6", "Pai-Mat")}
      ${nodoSVG(97, 323, 15, n.I, "#1b1546", "#c9bfe6", "Mãe-Mat")}
      <!-- Cauda Cármica e Canais Internos -->
      ${nodoSVG(210, 290, 13, n.K1, "#3b1745", "#ff8cc0")}
      ${nodoSVG(210, 328, 12, n.K2, "#3b1745", "#ff8cc0")}
      ${nodoSVG(295, 210, 13, n.C1, "#2b2312", "#ffe6a3")}
      ${nodoSVG(255, 255, 13, n.AmorCentro, "#4a153b", "#ff8cc0")}
      ${nodoSVG(332, 210, 12, n.DinheiroProfissao, "#2b2312", "#ffe6a3")}
      <!-- 4 Pontas Principais -->
      ${nodoSVG(50, 210, 21, n.A, "#2b1a5e", "#fff6d2", "Retrato")}
      ${nodoSVG(210, 50, 21, n.B, "#2b1a5e", "#fff6d2", "Espírito")}
      ${nodoSVG(370, 210, 21, n.C, "#2b1a5e", "#fff6d2", "Matéria")}
      ${nodoSVG(210, 370, 21, n.D, "#4a153b", "#ff8cc0", "Carma")}
      <!-- Centro da Matriz -->
      ${nodoSVG(210, 210, 27, n.E, "#f2c14e", "#120e2e", "CENTRO")}
    </svg>`;
  }

  /* =========================================================================
     14. GERADOR NATIVO DE PDF DE LUXO (CANVAS A4 + JSPDF / DOWNLOAD DIRETO)
     ========================================================================= */
  async function carregarJsPDF() {
    if (global.jspdf && global.jspdf.jsPDF) return global.jspdf.jsPDF;
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => resolve(global.jspdf.jsPDF);
      s.onerror = () => reject(new Error("Não foi possível carregar a biblioteca de PDF."));
      document.head.appendChild(s);
    });
  }

  function limparMarkdown(txt) {
    return String(txt || "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
  }

  async function gerarPDFPersonalizado(resultado, opcoes = {}) {
    const jsPDF = await carregarJsPDF();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const W = 210, H = 297, M = 14, LARG = W - M * 2;
    const LIMITE_INFERIOR = H - 14;
    const isProfunda = resultado.plano === "profunda";
    const { cliente, astro, vedica, numerologia: num, matriz, diagnostico: diag } = resultado;
    const chines = resultado.chines || calcularHoroscopoChines(cliente);
    const eneagrama = resultado.eneagrama || calcularEneagrama(cliente, num);
    const primeiroNome = (cliente.nomeBatismo || "Cliente").trim().split(/\s+/)[0];

    let paginaAtual = 1;
    let y = 0;

    function desenharMolduraPagina(escura = false) {
      if (escura) {
        doc.setFillColor(18, 14, 46); // #120e2e
        doc.rect(0, 0, W, H, "F");
        doc.setDrawColor(242, 193, 78);
        doc.setLineWidth(0.6);
        doc.rect(9, 9, W - 18, H - 18);
        doc.setLineWidth(0.2);
        doc.rect(11, 11, W - 22, H - 22);
      } else {
        // Pergaminho Creme Real com cabeçalho e moldura dourada calibrada
        doc.setFillColor(252, 249, 242);
        doc.rect(0, 0, W, H, "F");
        // Faixa superior mística enxuta
        doc.setFillColor(24, 18, 58);
        doc.rect(0, 0, W, 15, "F");
        doc.setTextColor(242, 193, 78);
        doc.setFont("times", "bold");
        doc.setFontSize(9);
        doc.text("TRYV TUATH® · DOSSIÊ ORACULAR DO DESBLOQUEIO INVISÍVEL", M, 9.8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(215, 205, 240);
        doc.text(
          `${isProfunda ? "ANÁLISE PROFUNDA COMPLETA" : "ANÁLISE STANDARD"} · ${primeiroNome.toUpperCase()}`,
          W - M,
          9.8,
          { align: "right" }
        );
        // Moldura dupla perfeitamente alinhada às margens
        doc.setDrawColor(196, 150, 52);
        doc.setLineWidth(0.4);
        doc.rect(8.5, 18, W - 17, H - 27);
        doc.setLineWidth(0.15);
        doc.rect(10, 19.5, W - 20, H - 30);
        // Rodapé
        doc.setFont("times", "italic");
        doc.setFontSize(8);
        doc.setTextColor(110, 95, 130);
        doc.text("tryvtuath.com.br · Você é o oráculo · Documento confidencial e intransferível", M, H - 4.2);
        doc.text(`Pág. ${paginaAtual}`, W - M, H - 4.2, { align: "right" });
      }
    }

    function novaPagina() {
      doc.addPage();
      paginaAtual++;
      desenharMolduraPagina(false);
      y = 25;
    }

    function garantirEspaco(alturaNecessaria) {
      if (y + alturaNecessaria > LIMITE_INFERIOR) {
        novaPagina();
      }
    }

    function tituloSecao(sub, titulo) {
      // Garante espaço para o cabeçalho da seção + pelo menos o início do próximo bloco (evita títulos órfãos no fim da página)
      garantirEspaco(34);
      if (y > 26) y += 1.5;
      doc.setFillColor(27, 21, 70);
      doc.roundedRect(M, y, LARG, 12.5, 2, 2, "F");
      doc.setDrawColor(242, 193, 78);
      doc.setLineWidth(0.35);
      doc.roundedRect(M, y, LARG, 12.5, 2, 2, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 140, 192);
      doc.text(sub.toUpperCase(), M + 4, y + 4.4);
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 230, 163);
      const titCurto = doc.splitTextToSize(limparMarkdown(titulo), LARG - 8)[0];
      doc.text(titCurto, M + 4, y + 10.1);
      y += 16;
    }

    function paragrafo(texto, op = {}) {
      const limpo = limparMarkdown(texto);
      const tam = op.tamanho || 9.8;
      const estilo = op.estilo || "normal";
      const cor = op.cor || [38, 28, 60];
      const recuo = op.recuo || 0;
      doc.setFont(op.fonte || "helvetica", estilo);
      doc.setFontSize(tam);
      doc.setTextColor(...cor);
      const linhas = doc.splitTextToSize(limpo, LARG - recuo * 2);
      const altLinha = tam * 0.43;
      garantirEspaco(linhas.length * altLinha + 3);
      doc.text(linhas, M + recuo, y);
      y += linhas.length * altLinha + (op.espacoDepois ?? 2.8);
    }

    function caixaDestaque(rotulo, tituloCaixa, textoCaixa, corBorda = [210, 155, 45], corFundo = [247, 241, 226]) {
      const limpo = limparMarkdown(textoCaixa);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.3);
      const linhas = doc.splitTextToSize(limpo, LARG - 9);
      const alt = 12.5 + linhas.length * 4.1 + 3;
      garantirEspaco(alt + 2.5);
      doc.setFillColor(...corFundo);
      doc.setDrawColor(...corBorda);
      doc.setLineWidth(0.38);
      doc.roundedRect(M, y, LARG, alt, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      doc.setTextColor(175, 45, 105);
      const rotCurto = doc.splitTextToSize(String(rotulo).toUpperCase(), LARG - 9)[0];
      doc.text(rotCurto, M + 4.5, y + 4.6);
      doc.setFont("times", "bold");
      doc.setFontSize(10.4);
      doc.setTextColor(27, 21, 70);
      const titCurto = doc.splitTextToSize(limparMarkdown(tituloCaixa), LARG - 9)[0];
      doc.text(titCurto, M + 4.5, y + 9.6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.3);
      doc.setTextColor(45, 35, 68);
      doc.text(linhas, M + 4.5, y + 14.3);
      y += alt + 3.2;
    }

    // ==================== PÁGINA 1: CAPA DE LUXO NOITE ENCANTADA ====================
    desenharMolduraPagina(true);

    // Ornamento superior
    doc.setDrawColor(242, 193, 78);
    doc.setLineWidth(0.4);
    doc.circle(W / 2, 46, 18, "S");
    doc.circle(W / 2, 46, 14, "S");
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 230, 163);
    doc.text(matriz.arcanos.centro.rom, W / 2, 48.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 140, 192);
    doc.text("TRYV TUATH® · ORÁCULOS, PSICANÁLISE & TERAPIAS", W / 2, 74, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 246, 210);
    doc.text("O DESBLOQUEIO INVISÍVEL", W / 2, 88, { align: "center" });

    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(201, 191, 230);
    doc.text(
      isProfunda
        ? "Dossiê Completo: Astrologia, Jyotish Védica, Numerologia Kármica, Matriz & Arquétipos"
        : "Diagnóstico Essencial: Raiz do Bloqueio, Relações/Afetos, Arquétipos & Soluções Práticas",
      W / 2,
      97,
      { align: "center" }
    );

    // Card de Dados de Consagração da Cliente na Capa
    doc.setFillColor(27, 21, 70);
    doc.setDrawColor(242, 193, 78);
    doc.setLineWidth(0.5);
    doc.roundedRect(24, 110, W - 48, 62, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(242, 193, 78);
    doc.text("MAPA CONSAGRADO EXCLUSIVAMENTE PARA:", W / 2, 121, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    const nomeLinhas = doc.splitTextToSize(cliente.nomeBatismo.toUpperCase(), W - 64);
    doc.text(nomeLinhas, W / 2, 131, { align: "center" });

    const [anoN, mesN, diaN] = cliente.dataNascimento.split("-");
    const dataFormatada = `${diaN}/${mesN}/${anoN}`;
    const horaFormatada = cliente.semHora ? "Hora não informada (Mapa Solar 12:00)" : `às ${cliente.horaNascimento}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(215, 205, 240);
    doc.text(`Nascimento: ${dataFormatada} ${horaFormatada}`, W / 2, 146, { align: "center" });
    doc.text(`Local: ${cliente.cidadeNome || "Brasil"}`, W / 2, 153, { align: "center" });
    doc.setTextColor(255, 140, 192);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Modalidade: ${isProfunda ? "ANÁLISE PROFUNDA COMPLETA (6 SABERES + PROTOCOLO 21 DIAS)" : "ANÁLISE STANDARD (DIAGNÓSTICO ESSENCIAL & AFETOS)"}`,
      W / 2,
      163,
      { align: "center" }
    );

    // Síntese dos Códigos Sagrados na Capa (Incluindo Eneagrama & Horóscopo Chinês)
    const cardsCapa = [
      ["SOL TROPICAL", `${astro.porId.sol.signo.nome} (${astro.porId.sol.grau})`],
      ["LUA & EMOÇÕES", `${astro.porId.lua.signo.nome} (${astro.porId.lua.grau})`],
      ["ASCENDENTE", astro.asc ? `${astro.asc.signo.nome} (${astro.asc.grau})` : "Mapa Solar"],
      ["QUÍRON (FERIDA)", `Em ${astro.porId.quiron.signo.nome}`],
      ["NAKSHATRA VÉDICA", `${vedica.nakshatra.nome} (Pada ${vedica.nakshatra.pada})`],
      ["ALMA & DESTINO", `Alma ${num.alma.valor} · Destino ${num.destino.valor}`],
      ["CENTRO DA MATRIZ", `Arcano ${matriz.arcanos.centro.rom} · ${matriz.arcanos.centro.nome}`],
      ["ENEAGRAMA", `${eneagrama.nome} (Asas ${eneagrama.asas})`],
      ["ALQUIMIA ORIENTAL", chines.assinaturaCompleta]
    ];

    let cx = 24, cy = 184;
    const cw = (W - 48 - 8) / 3, ch = 22;
    cardsCapa.forEach(([rot, val], idx) => {
      const col = idx % 3, lin = Math.floor(idx / 3);
      const x = cx + col * (cw + 4), yCard = cy + lin * (ch + 4);
      doc.setFillColor(34, 24, 82);
      doc.setDrawColor(185, 163, 255);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, yCard, cw, ch, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(242, 193, 78);
      doc.text(rot, x + cw / 2, yCard + 7.5, { align: "center" });
      doc.setFont("times", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(255, 255, 255);
      const vCurto = doc.splitTextToSize(val, cw - 4)[0];
      doc.text(vCurto, x + cw / 2, yCard + 15.5, { align: "center" });
    });

    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    doc.setTextColor(255, 230, 163);
    doc.text(
      "“Mude-se e descobrirá novos outros para refletir-se. Você é o oráculo.” — Tryv Tuath®",
      W / 2,
      273,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 170, 210);
    doc.text(`Emitido em ${resultado.geradoEm} · tryvtuath.com.br`, W / 2, 281, { align: "center" });

    // ==================== FLUXO CONTÍNUO DE PÁGINAS (ZERO ESPAÇOS VAZIOS) ====================
    novaPagina();

    tituloSecao("Parte I · Visão Geral do Diagnóstico", "O Seu Código Central e Índices de Bloqueio");
    paragrafo(
      `Bem-vinda ao seu Dossiê do Desbloqueio Invisível, ${primeiroNome}. Este documento foi gerado pelo cruzamento entre os seus dados sagrados de nascimento (${dataFormatada}) e as respostas que você entregou sobre seus padrões emocionais, afetivos e profissionais.`
    );

    caixaDestaque(
      "Arquétipo Mestre Identificado",
      diag.resumoExecutivo.arquetipoCentral,
      `Seu ponto central de força é regido pelo Arcano ${matriz.arcanos.centro.rom} (${matriz.arcanos.centro.nome}): ${matriz.arcanos.centro.luz} Contudo, o seu Bloqueio Invisível atua na interseção entre Quíron em ${astro.porId.quiron.signo.nome}, a Cauda Cármica ${matriz.caudaCarmica.codigo} e Saturno em ${astro.porId.saturno.signo.nome}.`
    );

    // Barras de Índice de Bloqueio
    garantirEspaco(28);
    const barras = [
      ["Eixo 1 · Tensão & Desgaste Emocional", diag.resumoExecutivo.indices.emocional, [185, 65, 130]],
      ["Eixo 2 · Repetição em Relações & Afetos", diag.resumoExecutivo.indices.relacionamento, [215, 75, 115]],
      ["Eixo 3 · Trava de Prosperidade & Vocação", diag.resumoExecutivo.indices.profissional, [196, 138, 35]]
    ];
    barras.forEach(([rot, pct, cor]) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(38, 28, 60);
      doc.text(`${rot}: ${pct}% de energia represada`, M, y);
      y += 2;
      doc.setFillColor(230, 224, 212);
      doc.roundedRect(M, y, LARG, 4, 1.5, 1.5, "F");
      doc.setFillColor(...cor);
      doc.roundedRect(M, y, (LARG * pct) / 100, 4, 1.5, 1.5, "F");
      y += 7.5;
    });
    y += 1.5;

    // ==================== PARTE II: NUMEROLOGIA KÁRMICA & DONS NATOS ====================
    tituloSecao("Parte II · Numerologia do Nome de Batismo", `A Gematria Sagrada de "${cliente.nomeBatismo}"`);
    caixaDestaque(
      `Motivação da Alma: Número ${num.alma.valor} (Soma das Vogais: ${num.alma.somaBruta})`,
      num.alma.info.titulo,
      `${num.alma.info.alma} Bloqueio quando ferida: ${num.alma.info.bloqueio}`
    );
    caixaDestaque(
      `Expressão & Talento: Número ${num.expressao.valor} (Soma Total: ${num.expressao.somaBruta})`,
      num.expressao.info.titulo,
      `${num.expressao.info.expressao} Couraça externa (Impressão ${num.impressao.valor}): ${num.impressao.info.titulo}.`
    );
    caixaDestaque(
      `Destino / Caminho de Vida: Número ${num.destino.valor} · Ano Pessoal ${num.anoPessoal.anoReferencia}: ${num.anoPessoal.valor}`,
      num.destino.info.titulo,
      `${num.destino.info.destino} Em ${num.anoPessoal.anoReferencia}, você vive a vibração do Ano Pessoal ${num.anoPessoal.valor} (${num.anoPessoal.info.titulo}): foco em ${num.anoPessoal.info.destino.toLowerCase()}`
    );

    if (isProfunda) {
      // Dons Natos e Caminho Mais Suave (Exclusivo Profunda)
      tituloSecao("Parte II-B · Dons Natos & Numerologia Kármica Completa", "Seus Talentos de Berço e o Caminho Mais Suave");
      caixaDestaque(
        `Dom de Nascimento (Dia Natal ${num.donsNatos.diaNatal} · Vibração ${num.donsNatos.vibracaoDiaNatal})`,
        num.donsNatos.tituloDiaNatal,
        `${num.donsNatos.domDiaNatal}\n\n${num.donsNatos.domExpressao}`
      );
      caixaDestaque(
        "O Seu Caminho Mais Suave (Fluxo de Menor Resistência)",
        `Alinhamento entre Alma ${num.alma.valor}, Expressão ${num.expressao.valor} e Maturidade ${num.maturidade.valor}`,
        num.donsNatos.caminhoMaisSuave,
        [175, 45, 105],
        [252, 240, 246]
      );

      if (num.licoesCarmicas.length) {
        caixaDestaque(
          `Lições Cármicas Ausentes no Nome (${num.licoesCarmicas.map(l => l.numero).join(", ")})`,
          "Aprendizados que sua alma veio integrar nesta existência",
          num.licoesCarmicas.map(l => `• ${l.licao}`).join("\n"),
          [175, 45, 105],
          [252, 240, 246]
        );
      } else {
        caixaDestaque(
          "Plenitude Vibracional no Nome de Batismo",
          "Ausência de Lições Cármicas Pendentes (1 a 9 Presentes)",
          "Todas as 9 frequências numéricas estão presentes nas letras do seu nome de batismo. Isso indica uma alma experiente que já trouxe todas as ferramentas vibracionais e precisa apenas direcionar o foco sem dispersão."
        );
      }

      if (num.dividasCarmicas.length) {
        num.dividasCarmicas.forEach(div => {
          caixaDestaque(
            "Alerta de Dívida Cármica Detectada",
            div.numero,
            `Origem: ${div.origem}\nImpacto atual: ${div.impacto}\nChave de cura: ${div.cura}`,
            [175, 45, 105],
            [252, 240, 246]
          );
        });
      } else {
        caixaDestaque(
          "Análise de Dívidas Cármicas Transgeracionais (13, 14, 16, 19)",
          "Caminho Livre de Penalidades Numéricas Antigas",
          "Suas trilhas principais (Alma, Expressão, Destino e Dia Natal) não carregam as travas clássicas 13, 14, 16 ou 19. Seus bloqueios atuais não são punições do passado, mas sim desalinhamento entre seu Dom Nato e o ambiente ao qual você vem tentando se adaptar."
        );
      }
    }

    // ==================== PARTE III: ENEAGRAMA & HORÓSCOPO CHINÊS ====================
    tituloSecao(
      "Parte III · Arquétipos de Personalidade & Alquimia Oriental",
      `${eneagrama.nome} + Horóscopo Chinês (${chines.assinaturaCompleta})`
    );
    caixaDestaque(
      `Psicodinâmica do Eneagrama · ${eneagrama.triade} · Asas ${eneagrama.asas}`,
      `${eneagrama.nome} — Paixão Emocional: ${eneagrama.paixao}`,
      `Raiz Inconsciente: ${eneagrama.feridaNuclear}\nNo Amor e Afetos: ${eneagrama.noAmor}\nNa Carreira: ${eneagrama.naCarreira}\nCaminho de Cura e Integração: ${eneagrama.caminhoIntegracao}`
    );
    caixaDestaque(
      `Horóscopo Chinês & Alquimia dos 5 Elementos · Polaridade ${chines.polaridade}`,
      `${chines.assinaturaCompleta} (${chines.nomeChines} · Estação: ${chines.estacao})`,
      `Essência e Dom Nato Oriental: ${chines.arquetipo} ${chines.domInato}\nInfluência do Elemento ${chines.elemento.nome || chines.elemento}: ${chines.essenciaElemento}\nSombra a Vigiar: ${chines.sombraBloqueio}`,
      [175, 45, 105],
      [252, 240, 246]
    );

    // ==================== PARTE IV: DIAGNÓSTICO EMOCIONAL & MATRIZ DO DESTINO ====================
    tituloSecao("Parte IV · Diagnóstico do Eixo Emocional", diag.emocional.titulo);
    diag.emocional.analiseProfunda.forEach(p => paragrafo(p));
    caixaDestaque("Chave de Desbloqueio Emocional", "Como virar a chave interna", diag.emocional.chaveDesbloqueio);

    tituloSecao("Parte V · Matriz do Destino (22 Arcanos)", `Centro ${matriz.arcanos.centro.rom} (${matriz.arcanos.centro.nome}) & Cauda Cármica ${matriz.caudaCarmica.codigo}`);
    caixaDestaque(
      `Arcano Regente Central (${matriz.arcanos.centro.rom}) & Retrato (${matriz.arcanos.retrato.rom})`,
      `${matriz.arcanos.centro.nome} — ${matriz.arcanos.centro.titulo}`,
      `Luz: ${matriz.arcanos.centro.luz}\nSombra / Trava Invisível: ${matriz.arcanos.centro.sombra}\nSeu Cartão de Visita (Dia): Arcano ${matriz.arcanos.retrato.rom} (${matriz.arcanos.retrato.nome}) — ${matriz.arcanos.retrato.luz}`
    );

    if (isProfunda) {
      caixaDestaque(
        `Cauda Cármica de Vidas Passadas: ${matriz.caudaCarmica.codigo}`,
        matriz.caudaCarmica.nome,
        `Memória de Vidas Passadas: ${matriz.caudaCarmica.passado}\nComo trava você hoje: ${matriz.caudaCarmica.bloqueioAtual}\nLibertação: ${matriz.caudaCarmica.chave}`,
        [175, 45, 105],
        [252, 240, 246]
      );

      // ==================== PARTE VI: ASTROLOGIA OCIDENTAL, QUÍRON, LILITH & VÉDICA APROFUNDADA ====================
      tituloSecao("Parte VI · Astrologia Kármica & Sombra", "Quíron, Lilith, Saturno e Nodos Lunares");

      const linhasAstros = astro.astros.slice(0, 12).map(a =>
        `${a.nome}: ${a.signo.nome} (${a.grau})${a.casa ? ` · Casa ${a.casa}` : ""}${a.retro ? " [Retrógrado]" : ""}`
      );
      caixaDestaque(
        "Posições Planetárias Natais",
        astro.asc ? `Ascendente em ${astro.asc.signo.nome} (${astro.asc.grau}) · Meio do Céu em ${astro.mc.signo.nome}` : "Mapa Solar Natal",
        linhasAstros.join("   |   ")
      );

      caixaDestaque(
        `Quíron em ${astro.porId.quiron.signo.nome} (${astro.porId.quiron.grau})`,
        "A Ferida Primordial e o Dom de Cura",
        astro.porId.quiron.signo.quiron
      );
      caixaDestaque(
        `Lilith (Lua Negra) em ${astro.porId.lilith.signo.nome} (${astro.porId.lilith.grau})`,
        "O Magnetismo Reprimido e a Sombra Relacional",
        astro.porId.lilith.signo.lilith
      );

      tituloSecao("Parte VII · Mapa Védico Sideral Aprofundado (Jyotish)", `Nakshatra ${vedica.nakshatra.nome} (Pada ${vedica.nakshatra.pada}) · Momento Atual & Direcionamento`);
      caixaDestaque(
        `Lua Sideral (Chandra Rashi): ${vedica.chandraRashi.nome} (${vedica.chandraRashi.sânscrito}) · Sol Sideral: ${vedica.suryaRashi.nome}`,
        `Mansão Lunar: ${vedica.nakshatra.numero}. ${vedica.nakshatra.nome} — Regente Natal: ${vedica.nakshatra.regenteDasha}`,
        `Divindade Védica: ${vedica.nakshatra.divindade} · Símbolo Sagrado: ${vedica.nakshatra.simbolo}\nDiagnóstico Raiz Jyotish: ${vedica.nakshatra.interpretacao}`
      );
      caixaDestaque(
        `O Seu Momento Atual no Mapa Védico (Regência Ativa: ${vedica.nakshatra.regenteMomento})`,
        "O Que a Astrologia Indiana Revela Sobre a Fase Que Você Está Atravessando",
        vedica.nakshatra.momentoAtual,
        [175, 45, 105],
        [252, 240, 246]
      );
      caixaDestaque(
        "Direcionamento Prático Védico (Ação Recomendada)",
        `Como Alinhar Suas Decisões com o Ciclo de ${vedica.nakshatra.regenteMomento}`,
        vedica.nakshatra.direcionamentoPratico
      );

      // ==================== PARTE VIII: RELAÇÕES/AFETOS E PROSPERIDADE ====================
      tituloSecao("Parte VIII · Diagnóstico de Relações & Afetos", diag.relacionamento.titulo);
      diag.relacionamento.analiseProfunda.forEach(p => paragrafo(p));
      caixaDestaque(
        "Chave de Desbloqueio Afetivo",
        `Canal do Amor na Matriz (${matriz.nodos.K1}-${matriz.nodos.AmorCentro}-${matriz.nodos.C1})`,
        diag.relacionamento.chaveDesbloqueio,
        [175, 45, 105],
        [252, 240, 246]
      );

      tituloSecao("Parte IX · Diagnóstico Profissional & Financeiro", diag.profissional.titulo);
      diag.profissional.analiseProfunda.forEach(p => paragrafo(p));
      caixaDestaque(
        "Chave de Desbloqueio da Prosperidade",
        `Ativação do Arcano ${matriz.arcanos.dinheiroProfissao.rom} (${matriz.arcanos.dinheiroProfissao.nome})`,
        diag.profissional.chaveDesbloqueio
      );

      // ==================== PARTE X: PROTOCOLO PRÁTICO E RITUAIS TRYV TUATH ====================
      tituloSecao("Parte X · Protocolo Alquímico Tryv Tuath®", "Banho de Ervas, Cristal, Decreto e Plano de 21 Dias");
      caixaDestaque(
        `Ritual de Limpeza e Abertura (${diag.protocoloTryv.horario})`,
        diag.protocoloTryv.banho,
        `${diag.protocoloTryv.preparo}\n\nCristal de Ancoragem Recomendado: ${diag.protocoloTryv.cristal}`
      );
      caixaDestaque(
        "Decreto Psicomágico de Desbloqueio (Repetir por 21 Dias)",
        "Reprogramação Vibracional do Nome de Batismo",
        diag.protocoloTryv.mantra,
        [175, 45, 105],
        [252, 240, 246]
      );

      diag.protocoloTryv.plano21Dias.forEach(etapa => {
        caixaDestaque("Plano Prático de Ação", etapa.semana, etapa.acao);
      });
    } else {
      // ==================== VERSÃO STANDARD: ANÁLISE DE RELAÇÕES/AFETOS, SOLUÇÕES PRÁTICAS & UPSELL ====================
      tituloSecao("Parte VI · Análise de Relações, Afetos & Vínculos", diag.relacionamento.titulo);
      diag.relacionamento.analiseProfunda.forEach(p => paragrafo(p));
      caixaDestaque(
        "Chave de Desbloqueio Afetivo & Relacional",
        `Como curar o padrão no Canal do Amor (${matriz.nodos.K1}-${matriz.nodos.AmorCentro}-${matriz.nodos.C1})`,
        diag.relacionamento.chaveDesbloqueio,
        [175, 45, 105],
        [252, 240, 246]
      );

      tituloSecao("Parte VII · Soluções Práticas & Direcionamento Imediato", "3 Ações Concretas Para Destravar Sua Energia Hoje");
      paragrafo(diag.profissional.analiseProfunda[0]);
      diag.solucoesPraticasStandard.forEach(item => {
        caixaDestaque("Solução Prática Recomendada", item.pilar, item.solucao);
      });
      caixaDestaque(
        "Decreto de Alinhamento Tryv Tuath®",
        `Ativação Vibracional do Arcano ${matriz.arcanos.centro.rom} (${matriz.arcanos.centro.nome})`,
        diag.protocoloTryv.mantra
      );

      // Seção Estratégica de Upsell Exclusivo para Clientes Standard
      tituloSecao("Parte VIII · Acesso Reservado: Dossiê de Análise Profunda", "O Que Ficou Oculto nas Camadas Mais Profundas do Seu Mapa");
      paragrafo(diag.upsellStandard.explicacao);
      caixaDestaque(
        "O Que Você Desbloqueia Ao Fazer o Upgrade Para a Análise Profunda",
        diag.upsellStandard.titulo,
        diag.upsellStandard.beneficiosExclusivos.map(b => `• ${b}`).join("\n"),
        [175, 45, 105],
        [252, 240, 246]
      );
      caixaDestaque(
        `Gatilho Especial de Desconto · Código VIP: ${diag.upsellStandard.codigoCupom}`,
        "Condição Exclusiva para Quem Já Adquiriu a Versão Standard",
        `${diag.upsellStandard.gatilhoDesconto}\n\nApresente o código [${diag.upsellStandard.codigoCupom}] no WhatsApp da Tryv Tuath (11 99546-3522) para receber seu link com desconto especial de abatimento, ou acesse diretamente em:\n${diag.upsellStandard.urlUpgrade}`
      );
    }

    const slugNome = primeiroNome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const nomeArquivo = `Desbloqueio-Invisivel-${isProfunda ? "Profunda" : "Standard"}-${slugNome || "TryvTuath"}.pdf`;

    if (opcoes.salvar !== false) {
      doc.save(nomeArquivo);
    }
    return { nomeArquivo, doc };
  }

  global.MotorDesbloqueio = {
    CIDADES_BASE,
    SIGNOS,
    NAKSHATRAS,
    ARCANOS_MATRIZ,
    ANIMAIS_CHINESES,
    ENEATIPOS,
    processarAnaliseCompleta,
    svgMatrizDestino,
    gerarPDFPersonalizado
  };
})(window);
