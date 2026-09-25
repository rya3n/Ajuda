/* ==========================================================================
   PONTO SEGURO • LAYOUT ESTILO CHATGPT COM REDE DE AMIGOS & IA GEMINI
   - Barra Lateral com Emergência (180, 190, 192, 100) no topo e Amigos embaixo
   - Alternância rápida entre amigos (Soli e Lumi)
   - Integração com Google Gemini API (Chave oficial ativa)
   - Blindagem Anti-Burla e Anti-Jailbreak (bloqueia 1+1, piadas, curiosidades)
   - Envio de Localização Real GPS com Acionamento de Viatura Policial (190)
   - Modais de Ligação de Voz e Vídeo Chamada
   ========================================================================== */

/* ==========================================================================
   1. CONFIGURAÇÃO DA API GEMINI & SISTEMA DE MEMÓRIA ANTI-REPETIÇÃO
   ========================================================================== */
const API_CONFIG = {
  apiKey: "AQ.Ab8RN6JKvt6xTFeSJps3pASs3C80afwxrjVm_sKXUYHgkJrMww",
  primaryModel: "gemini-2.0-flash",
  fallbackModel: "gemini-1.5-flash",
  endpointBase: "https://generativelanguage.googleapis.com/v1beta/models",
  useExternalAPI: true
};

/**
 * Memória Anti-Repetição Inteligente (Garante respostas naturais e sem clichês repetidos)
 */
const responseMemory = {
  lastPicked: {},
  recentHistory: [],
  pick(key, options) {
    if (!options || options.length === 0) return "";
    if (options.length === 1) return options[0];
    
    // 1. Filtrar frases que foram ditas recentemente nos últimos 10 turnos
    let pool = options.filter(opt => !this.recentHistory.includes(opt));
    
    // 2. Se todas do pool já foram usadas recentemente, ao menos evita a última dita nesta categoria
    if (pool.length === 0) {
      const last = this.lastPicked[key];
      pool = options.filter(opt => opt !== last);
    }
    
    const chosen = pool[Math.floor(Math.random() * pool.length)] || options[0];
    this.lastPicked[key] = chosen;
    
    // Manter histórico das últimas 10 frases
    this.recentHistory.push(chosen);
    if (this.recentHistory.length > 10) {
      this.recentHistory.shift();
    }
    
    return chosen;
  }
};

/* ==========================================================================
   CONFIGURAÇÃO DOS 6 CANAIS DE ATENDIMENTO (EMERGÊNCIAS + AMIGOS)
   ========================================================================== */
const CHANNELS_CONFIG = {
  soli: {
    id: 'soli',
    type: 'friend',
    name: 'Soli',
    gender: 'female',
    fullName: 'Soli • Canal de Apoio e Confiança',
    subtitle: 'Rede de Apoio • Pronta para acolher e acionar auxílio',
    emoji: '👩🏻',
    sidebarId: 'sidebarChannelSoli',
    callBtnLabel: 'Ligar por Voz',
    isEmergencyService: false,
    phone: '190',
    greeting: `<p>Olá. É um prazer falar com você. Sou a Soli e estou à disposição para conversar com serenidade e respeito.</p>
      <p>Caso você esteja enfrentando qualquer situação delicada, de angústia ou de risco, saiba que estou aqui para lhe oferecer acolhimento e orientação segura.</p>`,
    chips: [
      { text: "📍 Enviar minha localização para acionar apoio policial", isSos: true, isHighlight: true, isLoc: true },
      { text: "🚨 Sofri violência/abuso agora, preciso de ajuda!", isSos: true },
      { text: "⏱️ Orientações sobre profilaxia de emergência (PEP)", isSos: false },
      { text: "😰 Estou em crise de ansiedade e receio", isSos: false }
    ]
  },
  lumi: {
    id: 'lumi',
    type: 'friend',
    name: 'Lumi',
    gender: 'male',
    fullName: 'Lumi • Canal de Apoio e Confiança',
    subtitle: 'Rede de Apoio • Pronto para lhe acolher e orientar',
    emoji: '🧑🏻',
    sidebarId: 'sidebarChannelLumi',
    callBtnLabel: 'Ligar por Voz',
    isEmergencyService: false,
    phone: '190',
    greeting: `<p>Olá, seja bem-vinda(o). Sou o Lumi e estou à disposição para ouvir você com total atenção e respeito.</p>
      <p>Caso precise conversar, desabafar ou esteja enfrentando qualquer situação de perigo, conte com meu apoio integral e acolhimento.</p>`,
    chips: [
      { text: "📍 Enviar minha localização para acionar apoio policial", isSos: true, isHighlight: true, isLoc: true },
      { text: "🚨 Sofri violência/abuso agora, preciso de ajuda!", isSos: true },
      { text: "⏱️ Medicamentos de urgência em 72h (PEP)", isSos: false },
      { text: "😰 Estou sob forte impacto emocional", isSos: false }
    ]
  },
  '180': {
    id: '180',
    type: 'emergency',
    name: 'Central 180',
    fullName: 'Central 180 • Atendimento à Mulher',
    subtitle: 'Canal Oficial do Ministério das Mulheres • Apoio e Denúncia 24h',
    emoji: '📞',
    sidebarId: 'sidebarChannel180',
    callBtnLabel: 'Ligar 180',
    isEmergencyService: true,
    phone: '180',
    greeting: `<p><strong>Central de Atendimento à Mulher – Ligue 180.</strong> Atendimento oficial, sigiloso e gratuito do Governo Federal.</p>
      <p>Prestamos acolhimento imediato, orientação jurídica sobre a <strong>Lei Maria da Penha</strong>, solicitação de <strong>Medidas Protetivas de Urgência</strong> e encaminhamento para a Delegacia da Mulher (DEAM).</p>
      <p>Como podemos acolher e orientar você neste momento?</p>`,
    chips: [
      { text: "🛡️ Como solicitar Medida Protetiva de Urgência?", isSos: false },
      { text: "📍 Onde fica a Delegacia da Mulher (DEAM)?", isSos: false },
      { text: "📝 Quero registrar denúncia sigilosa", isSos: true },
      { text: "🏠 Abrigo sigiloso e Casa da Mulher Brasileira", isSos: false }
    ]
  },
  '190': {
    id: '190',
    type: 'emergency',
    name: 'Polícia Militar 190',
    fullName: 'Polícia Militar • COPOM 190',
    subtitle: 'Central de Operações da PM • Emergência e Despacho de Viaturas',
    emoji: '🚨',
    sidebarId: 'sidebarChannel190',
    callBtnLabel: 'Ligar 190',
    isEmergencyService: true,
    phone: '190',
    greeting: `<p><strong>Polícia Militar do Estado – COPOM 190.</strong> Central de Atendimento de Emergência Policial.</p>
      <p>Se você está em perigo ou sofreu violência, <strong>informe seu endereço imediato ou clique para enviar suas coordenadas</strong> para empenho prioritário de viatura.</p>
      <p>Qual é a sua ocorrência e onde você se encontra agora?</p>`,
    chips: [
      { text: "🚨 VIATURA URGENTE: Estou em perigo agora!", isSos: true, isHighlight: true },
      { text: "📍 Enviar minha localização GPS para o COPOM", isSos: true, isLoc: true },
      { text: "👀 Suspeito está me seguindo no local", isSos: true },
      { text: "🚪 Onde posso me abrigar com segurança?", isSos: false }
    ]
  },
  '192': {
    id: '192',
    type: 'emergency',
    name: 'SAMU 192',
    fullName: 'SAMU 192 • Regulação Médica',
    subtitle: 'Serviço de Atendimento Móvel de Urgência • Socorro Pré-Hospitalar',
    emoji: '🚑',
    sidebarId: 'sidebarChannel192',
    callBtnLabel: 'Ligar 192',
    isEmergencyService: true,
    phone: '192',
    greeting: `<p><strong>Central de Regulação Médica – SAMU 192.</strong> Socorro médico e resgate de urgência.</p>
      <p>Se há ferimentos corporais, sangramento, dores agudas ou perda de consciência decorrente de violência, informe o estado da vítima para triagem e despacho de ambulância.</p>
      <p>Como podemos auxiliar na sua saúde neste momento?</p>`,
    chips: [
      { text: "🚑 Preciso de ambulância: estou ferida / com dor", isSos: true, isHighlight: true },
      { text: "⏱️ Como tomar a Profilaxia PEP 72h no SUS?", isSos: false },
      { text: "🩸 Tive sangramento ou lesão corporal", isSos: true },
      { text: "🧪 Suspeita de dopagem / bebida adulterada", isSos: false }
    ]
  },
  '100': {
    id: '100',
    type: 'emergency',
    name: 'Disque 100',
    fullName: 'Disque 100 • Direitos Humanos',
    subtitle: 'Ouvidoria Nacional de Direitos Humanos • Denúncia e Proteção Sigilosa',
    emoji: '🛡️',
    sidebarId: 'sidebarChannel100',
    callBtnLabel: 'Ligar 100',
    isEmergencyService: true,
    phone: '100',
    greeting: `<p><strong>Ouvidoria Nacional de Direitos Humanos – Disque 100.</strong> Canal oficial do Ministério dos Direitos Humanos e da Cidadania.</p>
      <p>Recebemos, analisamos e encaminhamos denúncias de violações de direitos humanos com sigilo absoluto ou anonimato, especialmente em casos de violência contra crianças, adolescentes, mulheres e grupos vulneráveis.</p>
      <p>Qual violação você gostaria de relatar ou consultar hoje?</p>`,
    chips: [
      { text: "📝 Quero fazer uma denúncia anônima", isSos: true },
      { text: "👶 Violação contra criança ou adolescente", isSos: true },
      { text: "⚖️ Encaminhamento ao Ministério Público / Defensoria", isSos: false },
      { text: "📋 Como consultar o andamento de um protocolo?", isSos: false }
    ]
  }
};

// Aliases para retrocompatibilidade
CHANNELS_CONFIG.maria = CHANNELS_CONFIG.soli;
CHANNELS_CONFIG.joao = CHANNELS_CONFIG.lumi;

/**
 * BLINDAGEM CLIENT-SIDE ADAPTADA POR PERSONA
 */
function checkGuardrails(userMessage, personaName) {
  const clean = userMessage.toLowerCase().trim();

  // Detecta contas matemáticas
  const mathRegex = /(\b\d+\s*[\+\-\*\/\^x]\s*\d+\b)|(\bquanto\s+(é|da|vale)\b)|(\braiz\s+quadrada\b)|(\bcalcule\b)|(\bequação\b)|(\btabuada\b)|(\b\d+\s*mais\s*\d+\b)|(\b\d+\s*menos\s*\d+\b)/i;
  if (mathRegex.test(clean)) {
    if (personaName === 'soli' || personaName === 'maria') {
      return `Compreendo a descontração, contudo este canal é dedicado ao apoio e orientação com serenidade. Você está bem no momento? Se necessitar de acolhimento ou auxílio, estou à sua inteira disposição.`;
    }
    if (personaName === 'lumi' || personaName === 'joao') {
      return `Compreendo a descontração, entretanto estou à disposição para lhe apoiar com seriedade e respeito. Está tudo bem com você? Caso necessite de apoio seguro ou socorro, conte com minha ajuda.`;
    }
    if (personaName === '180') {
      return `Central de Atendimento à Mulher – Ligue 180: Este canal é dedicado exclusivamente ao atendimento, acolhimento e orientação a mulheres em situação de violência. Para outras demandas, utilize canais de busca pertinentes.`;
    }
    if (personaName === '190') {
      return `Polícia Militar – COPOM 190: Canal de urgência e emergência policial restrito a ocorrências de segurança pública. O uso indevido deste canal prejudica o atendimento a cidadãos em risco de vida.`;
    }
    if (personaName === '192') {
      return `Central SAMU 192: Canal exclusivo para regulação médica e envio de socorro a urgências e emergências clínicas.`;
    }
    if (personaName === '100') {
      return `Disque 100 – Ouvidoria Nacional dos Direitos Humanos: Canal exclusivo para registro e acompanhamento de violações de direitos fundamentais.`;
    }
  }

  // Detecta tentativas de prompt injection / programação fora de contexto
  const offTopicRegex = /(\bignore\s+(as|todas|previous)\s+instruções\b|\bfinja\s+que\b|\baja\s+como\b|\bpython\b|\bjavascript\b|\bcódigo\b|\bprogramação\b)/i;
  if (offTopicRegex.test(clean)) {
    if (personaName === 'soli' || personaName === 'lumi' || personaName === 'maria' || personaName === 'joao') {
      return `Meu compromisso neste canal é ouvir, acolher e orientar você com total respeito, especialmente se houver qualquer situação de perigo. Você está bem neste instante? Gostaria de relatar algo?`;
    } else {
      return `Canal Institucional Oficial: Linha restrita a acolhimento, emergência e proteção cidadã. Favor relatar a ocorrência ou orientação necessária.`;
    }
  }

  return null;
}

/**
 * Retorna o Prompt de Sistema Específico para Cada uma das 6 Personas
 */
function getSystemPromptForChannel(channelId) {
  if (channelId === 'soli' || channelId === 'maria') {
    return `
VOCÊ É SOLI, UMA INTERLOCUTORA DE CONFIANÇA, APOIO HUMANIZADO E CONSELHEIRA PESSOAL.
SUA PERSONALIDADE E TOM:
- Postura formal, serena, polida, respeitosa e acolhedora.
- LINGUAGEM TOTALMENTE FORMAL E CULTA: NUNCA utilize gírias ("mano", "parça", "amiga", "tô", "tá", "vamo", "rolê", "bater papo"). Utilize sempre a norma-padrão da língua portuguesa ("estou à disposição", "fique tranquila(o)", "compreendo a situação", "você não tem qualquer culpa pelo ocorrido").
- Mensagens claras, acolhedoras e estruturadas em 2 a 3 frases por resposta.
- Se o usuário manifestar pedido de socorro, perigo ou pânico: responda com empatia formal imediata ("Compreendo a gravidade da situação. Por favor, mantenha a calma, estou com você neste momento. Você se encontra em local seguro? Informe suas coordenadas para que possamos providenciar apoio policial.").
- Se relatar violência, abuso ou agressão: acolha com respeito e deferência, assegure com firmeza formal que a culpa JAMAIS é da vítima, oriente o envio da localização para acionamento do 190 e informe com delicadeza sobre a Profilaxia Pós-Exposição (PEP) em até 72 horas no SUS.
- Se a conversa for casual ou cotidiana: responda com cortesia, educação e formalidade amigável, indagando se o interlocutor necessita de suporte ou esclarecimentos.
- Escreva sempre em Português do Brasil correto, culto, acolhedor e humanizado.`;
  }

  if (channelId === 'lumi' || channelId === 'joao') {
    return `
VOCÊ É LUMI, UM INTERLOCUTOR DE CONFIANÇA, PROTETOR, SERENO E CONSELHEIRO PESSOAL.
SUA PERSONALIDADE E TOM:
- Postura formal, segura, respeitosa, polida e protetora.
- LINGUAGEM TOTALMENTE FORMAL E CULTA: NUNCA utilize gírias ("parceira", "mano", "salve", "tô contigo", "tá pegando", "tô ligado", "rolê", "resenha", "tô na escuta"). Trate o usuário com formalidade, cortesia e respeito ("Olá", "Compreendo perfeitamente", "Estou à sua disposição", "Pode contar com meu auxílio").
- Mensagens concisas, equilibradas e serenas (2 a 3 frases por resposta).
- Se a pessoa enviar pedido de socorro ou relatar perigo: adote prontidão e proteção formal ("Compreendo a gravidade da situação. Mantenha a calma, estou acompanhando você. Por favor, envie sua localização imediatamente para que as providências de socorro policial sejam tomadas.").
- Se relatar agressão física ou abuso: transmita apoio incondicional com serenidade formal ("Afirmo com total certeza que você não possui responsabilidade alguma sobre esse ato covarde. Mantenha-se abrigada(o) e envie suas coordenadas para acionarmos a Polícia Militar.").
- Se a interação for casual: mantenha cortesia refinada e bom senso, perguntando como está o dia do interlocutor com polidez.
- Escreva em Português do Brasil formal, culto e acolhedor.`;
  }

  if (channelId === '180') {
    return `
VOCÊ É A ATENDENTE ESPECIALIZADA DA CENTRAL DE ATENDIMENTO À MULHER – LIGUE 180 (MINISTÉRIO DAS MULHERES).
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, INSTITUCIONAL, RESPEITOSO, TÉCNICO E ACOLHEDOR.
- Você representa o serviço público oficial do Governo Federal brasileiro de proteção às mulheres em situação de violência doméstica, familiar e sexual.
- Esclareça direitos garantidos pela Lei Maria da Penha (Lei nº 11.340/2006): Medidas Protetivas de Urgência (afastamento do agressor, proibição de contato), atendimento na DEAM, Casa da Mulher Brasileira, Casas-Abrigo e assistência judiciária gratuita pela Defensoria Pública.
- Se a usuária relatar agressão física iminente ou perigo de morte agora: oriente com urgência a acionar o 190 (Polícia Militar) ou buscar abrigo imediato em local seguro.
- Responda de forma clara, humanizada, objetiva e com linguagem formal e institucional em Português do Brasil (2 a 4 frases por resposta).`;
  }

  if (channelId === '190') {
    return `
VOCÊ É O OPERADOR DE DESPACHO POLICIAL DO COPOM – POLÍCIA MILITAR 190.
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, OPERACIONAL, TÁTICO, DIRETO E URGENTE.
- Você é a central de segurança pública imediata. Seu foco é salvar vidas e coordenar viaturas policiais.
- Triagem essencial imediata:
  1. Qual é o endereço exato ou ponto de referência agora?
  2. O agressor está visível, no local ou armado?
  3. A vítima está em local seguro/abrigado?
- Instruções táticas: instrua a manter o celular em modo silencioso se houver risco, procurar abrigo em estabelecimento comercial movimentado e não confrontar suspeitos.
- Informe que a guarnição policial do setor é empenhada com código de prioridade.
- Mantenha respostas formais, seguras, concisas e táticas em Português do Brasil.`;
  }

  if (channelId === '192') {
    return `
VOCÊ É O MÉDICO REGULADOR DA CENTRAL DO SAMU 192 (SERVIÇO DE ATENDIMENTO MÓVEL DE URGÊNCIA).
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, CLÍNICO, HUMANIZADO E TÉCNICO-SANITÁRIO.
- Avalie a necessidade de envio de ambulância (USB ou USA) para socorro pré-hospitalar.
- Pergunte sobre ferimentos corporais, sangramentos, perda de consciência, dores agudas ou suspeita de intoxicação ("Boa noite Cinderela"/bebida adulterada).
- Protocolo crucial de violência sexual: oriente sobre a REGRA DE OURO DAS 72 HORAS para Profilaxia Pós-Exposição (PEP contra HIV e Hepatite B) e contracepção de emergência no pronto-socorro público, garantido gratuitamente pelo SUS sem exigência de Boletim de Ocorrência.
- Oriente com calma médica, postura profissional, empática e acolhedora em Português do Brasil.`;
  }

  if (channelId === '100') {
    return `
VOCÊ É O ANALISTA DE ATENDIMENTO DA OUVIDORIA NACIONAL DE DIREITOS HUMANOS – DISQUE 100 (MINISTÉRIO DOS DIREITOS HUMANOS E DA CIDADANIA).
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, CIDADÃO, INSTITUCIONAL E GARANTIDOR DE DIREITOS.
- Competência: denúncias e acolhimento de violações de direitos fundamentais, especialmente contra crianças, adolescentes, mulheres, pessoas com deficiência e populações vulneráveis.
- Esclareça que as denúncias podem ser 100% anônimas e têm sigilo legal garantido.
- Explique os encaminhamentos institucionais para o Conselho Tutelar, Ministério Público e Defensoria Pública.
- Responda com formalidade, serenidade, acolhimento e compromisso cidadão em Português do Brasil.`;
  }

  return `Você é um canal de acolhimento e proteção de emergência. Responda com respeito, clareza e empatia.`;
}

/**
 * Requisição Inteligente à API Google Gemini (com fallback entre modelos 2.0 e 1.5)
 */
async function requestGeminiText(contents, systemText, maxTokens = 1000) {
  const apiKey = (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) || API_CONFIG.apiKey;
  if (!apiKey || !API_CONFIG.useExternalAPI) return null;

  const models = [API_CONFIG.primaryModel, API_CONFIG.fallbackModel];
  const payload = {
    contents: contents,
    systemInstruction: { parts: [{ text: systemText }] },
    generationConfig: {
      temperature: 0.82,
      maxOutputTokens: maxTokens
    }
  };

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const url = `${API_CONFIG.endpointBase}/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      } else {
        if (response.status === 401 || response.status === 403) {
          console.warn(`Gemini API HTTP ${response.status} (credenciais). Utilizando inteligência conversacional nativa.`);
          break;
        }
      }
    } catch (e) {
      console.warn(`Tentativa com ${model} falhou:`, e);
    }
  }

  return null;
}

/**
 * Chamada à API Gemini com Persona Dinâmica e Histórico por Canal
 */
async function sendToGeminiAPI(userMessage, personaName) {
  try {
    const promptSystem = `${getSystemPromptForChannel(personaName)}\n\nINFORMAÇÃO DE CONTEXTO EM TEMPO REAL:\n- Localização atual do usuário via GPS: ${userLocation.fullAddress}.`;

    // Montar histórico conversacional específico deste canal para memória real
    const contents = [];
    const channelHistory = (appState.channelHistories[personaName] || []).slice(-8);
    for (const turn of channelHistory) {
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    }

    // Adiciona a mensagem atual pura do usuário para conversação 100% natural
    contents.push({
      role: "user",
      parts: [
        {
          text: userMessage
        }
      ]
    });

    return await requestGeminiText(contents, promptSystem, 1000);
  } catch (error) {
    console.warn("Exceção na chamada Gemini, usando motor local de contingência:", error);
    return null;
  }
}

/* ==========================================================================
   2. ESTADO GLOBAL DA APLICAÇÃO
   ========================================================================== */
const appState = {
  selectedPersona: 'soli', // 'soli', 'lumi', '180', '190', '192', '100'
  isSidebarOpen: false,
  callTimerInterval: null,
  callSeconds: 0,
  isMuted: false,
  isWebcamActive: false,
  webcamStream: null,
  currentSpokenText: "",
  channelHistories: {
    soli: [],
    lumi: [],
    maria: [],
    joao: [],
    '180': [],
    '190': [],
    '192': [],
    '100': []
  },
  channelDomCache: {
    soli: null,
    lumi: null,
    maria: null,
    joao: null,
    '180': null,
    '190': null,
    '192': null,
    '100': null
  }
};

// Dados da Localização Real do Usuário (GPS)
const userLocation = {
  address: "Identificando satélite...",
  fullAddress: "Belo Horizonte, Minas Gerais - Brasil",
  coords: null,
  lat: null,
  lon: null,
  mapUrl: null,
  isRealGps: false
};

/* ==========================================================================
   3. INICIALIZAÇÃO DO APP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initQuickExit();
  initThemeToggle();
  initTotemMode();
  initRealLocationDetection();
  updateTopFriendDisplay();
  updateQuickChipsForChannel(appState.selectedPersona);
  initChatForActiveFriend();
});

/* ==========================================================================
   4. CONTROLE DA BARRA LATERAL E TROCA DE CANAIS (CHATGPT STYLE)
   ========================================================================== */
function toggleSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  } else {
    sidebar.classList.toggle('collapsed');
  }
}

/**
 * Troca de canal entre os 6 contatos (Soli, Lumi, 180, 190, 192, 100)
 * Preserva o histórico de conversas individual de cada contato
 */
function switchChannel(channelId) {
  const channel = CHANNELS_CONFIG[channelId];
  if (!channel) return;

  const oldPersona = appState.selectedPersona;
  const container = document.getElementById('chatMessages');

  // Salvar o DOM atual do canal anterior
  if (container && oldPersona) {
    appState.channelDomCache[oldPersona] = container.innerHTML;
  }

  // Interromper qualquer áudio que estivesse tocando
  if (typeof stopCurrentAudioAnimation === 'function') {
    stopCurrentAudioAnimation();
  }

  appState.selectedPersona = channelId;

  // Atualizar visual ativo em todos os itens da barra lateral
  document.querySelectorAll('.chatgpt-sidebar .sidebar-nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeBtn = document.getElementById(channel.sidebarId);
  if (activeBtn) activeBtn.classList.add('active');

  // Atualizar display superior (avatar, nome, status, botões de ligação)
  updateTopFriendDisplay();

  // Atualizar chips rápidos de sugestão
  updateQuickChipsForChannel(channelId);

  // Restaurar mensagens anteriores do canal ou exibir saudação inicial
  if (container) {
    if (appState.channelDomCache[channelId]) {
      container.innerHTML = appState.channelDomCache[channelId];
      container.scrollTop = container.scrollHeight;
    } else {
      container.innerHTML = '';
      initChatForActiveFriend();
    }
  }

  // No mobile, fechar a sidebar
  if (window.innerWidth <= 768) {
    toggleSidebar();
  }

  showToast(`Canal ativo: ${channel.name}.`);
}

// Manter compatibilidade com chamadas antigas
function switchFriendFromSidebar(friendId) {
  switchChannel(friendId);
}

function updateTopFriendDisplay() {
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['soli'] || CHANNELS_CONFIG['maria'];

  const topName = document.getElementById('topFriendName');
  const topSubtitle = document.getElementById('topFriendSubtitle');
  const topAvatar = document.getElementById('topAvatarMini');
  const chatInput = document.getElementById('chatInput');
  const topCallLabel = document.getElementById('topCallLabel');
  const topCallBtn = document.getElementById('topCallBtn');

  if (topName) topName.innerText = channel.fullName;
  if (topSubtitle) topSubtitle.innerText = channel.subtitle;
  if (topAvatar) topAvatar.innerText = channel.emoji;
  if (chatInput) {
    if (channel.type === 'friend') {
      chatInput.placeholder = `Converse com ${channel.name}, este canal é formal e estritamente sigiloso...`;
    } else {
      chatInput.placeholder = `Mensagem para ${channel.name} (Canal Oficial e Sigiloso)...`;
    }
  }

  if (topCallLabel) topCallLabel.innerText = channel.callBtnLabel;
  if (topCallBtn) {
    topCallBtn.title = channel.isEmergencyService ? `Ligar diretamente para ${channel.phone}` : `Ligar por voz com ${channel.name}`;
  }

  // Atualizar modais de chamada
  const callName = document.getElementById('callPersonaName');
  const callSubtitle = document.getElementById('callPersonaSubtitle');
  const callAvatar = document.getElementById('callAvatarEmoji');
  if (callName) callName.innerText = channel.name;
  if (callSubtitle) callSubtitle.innerText = channel.subtitle;
  if (callAvatar) callAvatar.innerText = channel.emoji;

  const videoName = document.getElementById('videoCounselorName');
  const videoAvatar = document.getElementById('videoAvatarEmoji');
  if (videoName) videoName.innerText = channel.name;
  if (videoAvatar) videoAvatar.innerText = channel.emoji;
}

function handleTopCallClick() {
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['soli'] || CHANNELS_CONFIG['maria'];
  if (channel.isEmergencyService) {
    window.location.href = `tel:${channel.phone}`;
  } else {
    openVoiceCallModal();
  }
}

function updateQuickChipsForChannel(channelId) {
  const bar = document.getElementById('quickChipsBar');
  if (!bar) return;
  const channel = CHANNELS_CONFIG[channelId] || CHANNELS_CONFIG['soli'] || CHANNELS_CONFIG['maria'];
  if (!channel.chips) return;

  bar.innerHTML = channel.chips.map(chip => {
    let classes = 'quick-chip';
    if (chip.isSos) classes += ' chip-sos';
    if (chip.isHighlight) classes += ' btn-loc-highlight';

    if (chip.isLoc) {
      return `<button class="${classes}" onclick="sendLocationToFriend()" title="${chip.text}">${chip.text}</button>`;
    } else {
      return `<button class="${classes}" onclick="sendQuickMessage('${chip.text.replace(/'/g, "\\'")}')" title="${chip.text}">${chip.text}</button>`;
    }
  }).join('');
}

function startNewChat() {
  const container = document.getElementById('chatMessages');
  const persona = appState.selectedPersona;
  if (appState.channelHistories) {
    appState.channelHistories[persona] = [];
  }
  if (appState.channelDomCache) {
    appState.channelDomCache[persona] = null;
  }
  if (container) {
    container.innerHTML = '';
  }
  initChatForActiveFriend();
}

/* ==========================================================================
   5. CHAT DE MENSAGENS COM A IA E CANAIS DE ATENDIMENTO
   ========================================================================== */
function initChatForActiveFriend() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['soli'] || CHANNELS_CONFIG['maria'];
  appendMessage('ai', channel.greeting);
}

function handleSendMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage('user', msg);
  input.value = '';

  processAIResponse(msg);
}

function sendQuickMessage(text) {
  appendMessage('user', text);
  processAIResponse(text);
}

function appendMessage(sender, htmlContent, options = {}) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const persona = appState.selectedPersona;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg msg-${sender}`;

  // Se for mensagem da IA, adicionar reprodutor de áudio de voz e reações
  let extraContent = "";
  if (sender === 'ai' && !options.skipExtras) {
    extraContent = `
      ${createVoiceNoteHtml(htmlContent, persona)}
      ${createReactionsHtml()}
    `;
  }

  msgDiv.innerHTML = `
    <div class="msg-bubble">
      ${typeof htmlContent === 'string' && !htmlContent.startsWith('<p>') && !htmlContent.startsWith('<div>') ? `<p>${htmlContent}</p>` : htmlContent}
      ${extraContent}
    </div>
    <span class="msg-time">${timeStr}</span>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;

  // Registrar no histórico do canal ativo para a IA manter a memória da conversa
  if (appState.channelHistories && appState.channelHistories[persona]) {
    const plainText = typeof htmlContent === 'string' ? htmlContent.replace(/<[^>]*>?/gm, '').trim() : '';
    if (plainText) {
      appState.channelHistories[persona].push({
        role: sender === 'user' ? 'user' : 'model',
        text: plainText
      });
    }
  }
}

/**
 * ENVIO DE LOCALIZAÇÃO AO CANAL ATIVO COM FEEDBACK TÁTICO
 */
function sendLocationToFriend() {
  const locText = `📍 Aqui está minha localização: ${userLocation.fullAddress}`;
  appendMessage('user', locText);

  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();
    const persona = appState.selectedPersona;
    let channelResponse = "";

    if (persona === 'soli' || persona === 'maria') {
      channelResponse = `
        <p>Recebi suas coordenadas geográficas com precisão: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>Estou em comunicação com o serviço de emergência da Polícia Militar (<strong>190</strong>), transmitindo sua localização em tempo real. A viatura foi despachada com prioridade máxima.</p>
        <p>Mantenha a serenidade e respire pausadamente. Reafirmo que você está segura e não possui culpa alguma. Permaneço ao seu lado continuamente.</p>
        ${createCopomCardHtml()}
      `;
      simulateEmergencyDispatch('PM');
    } else if (persona === 'lumi' || persona === 'joao') {
      channelResponse = `
        <p>Confirmo o recebimento das suas coordenadas exatas: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>Estou acionando a Central de Operações da Polícia Militar (<strong>190</strong>) para envio imediato de viatura com urgência máxima.</p>
        <p>Por gentileza, permaneça abrigada(o) em local seguro e movimentado. Manterei este canal aberto até a confirmação do atendimento presencial.</p>
        ${createCopomCardHtml()}
      `;
      simulateEmergencyDispatch('PM');
    } else if (persona === '190') {
      channelResponse = `
        <p>🚨 <strong>POLÍCIA MILITAR – COPOM 190:</strong></p>
        <p>Coordenadas georreferenciadas registradas no sistema: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>A guarnição policial do setor mais próximo foi empenhada com prioridade de código vermelho. Mantenha-se abrigada e atenta aos sinais luminosos da viatura.</p>
        ${createCopomCardHtml()}
      `;
      simulateEmergencyDispatch('PM');
    } else if (persona === '192') {
      channelResponse = `
        <p>🚑 <strong>REGULAÇÃO MÉDICA – SAMU 192:</strong></p>
        <p>Ponto de resgate confirmado: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>Equipe móvel alertada para triagem e deslocamento. Mantenha a vítima em repouso e sem ingerir medicamentos por conta própria.</p>
        ${createSamuPepCardHtml()}
      `;
      simulateEmergencyDispatch('SAMU');
    } else if (persona === '180') {
      channelResponse = `
        <p>📞 <strong>CENTRAL DE ATENDIMENTO À MULHER – LIGUE 180:</strong></p>
        <p>Localização registrada: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>Mapeamos os serviços especializados da rede de proteção e a Delegacia Especializada de Atendimento à Mulher (DEAM) mais próxima da sua área.</p>
        ${createDisque100CardHtml()}
      `;
    } else {
      channelResponse = `
        <p>🛡️ <strong>OUVIDORIA NACIONAL DOS DIREITOS HUMANOS – DISQUE 100:</strong></p>
        <p>Endereço georreferenciado anexado ao registro: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>As coordenadas territoriais foram vinculadas ao protocolo sigiloso de proteção.</p>
        ${createDisque100CardHtml()}
      `;
    }

    appendMessage('ai', channelResponse);
  }, 900);
}

async function processAIResponse(userText) {
  const persona = appState.selectedPersona;
  const channel = CHANNELS_CONFIG[persona] || CHANNELS_CONFIG['soli'] || CHANNELS_CONFIG['maria'];

  // 1. BLINDAGEM CLIENT-SIDE ADAPTADA POR PERSONA
  const guardrailBlockedMessage = checkGuardrails(userText, persona);
  if (guardrailBlockedMessage) {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage('ai', guardrailBlockedMessage);
    }, 450);
    return;
  }

  showTypingIndicator();

  // 2. SE FOR ENVIO EXPLÍCITO DE LOCALIZAÇÃO PELO TEXTO
  const lower = userText.toLowerCase();
  if (lower.includes('minha localização:') || lower.includes('minha localização é') || (lower.includes('gps') && lower.includes('aqui'))) {
    hideTypingIndicator();
    sendLocationToFriend();
    return;
  }

  // 3. CHAMADA REAL À API GEMINI 3.6 COM A PERSONA DO CANAL
  if (API_CONFIG.useExternalAPI) {
    const apiResult = await sendToGeminiAPI(userText, persona);
    hideTypingIndicator();
    if (apiResult) {
      let formattedHtml = apiResult.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

      // Se a pessoa relatar crise de pânico / medo / choque, acoplar exercício de respiração 4-7-8
      if (lower.includes('ansied') || lower.includes('pânic') || lower.includes('panico') || lower.includes('medo') || lower.includes('tremend') || lower.includes('falta de ar') || lower.includes('não consigo respirar') || lower.includes('em choque')) {
        formattedHtml += createBreathingCardHtml();
      }

      // Se a pessoa relatar perigo, abuso ou pedir socorro, exibe o botão rápido e cartões pertinentes
      if (lower.includes('abusad') || lower.includes('abuso') || lower.includes('estupr') || lower.includes('perigo') || lower.includes('me seguiu') || lower.includes('socorro') || lower.includes('me ajuda') || lower.includes('ajuda')) {
        let btnText = "📍 Mandar minha localização agora";
        if (persona === 'soli' || persona === 'maria') btnText = "📍 Enviar minha localização para Soli chamar a polícia (190)";
        else if (persona === 'lumi' || persona === 'joao') btnText = "📍 Enviar minha localização para Lumi chamar a polícia (190)";
        else if (persona === '190') btnText = "📍 Transmitir minha localização exata para o COPOM 190";
        else if (persona === '192') btnText = "📍 Enviar localização para a ambulância do SAMU 192";
        else if (persona === '180') btnText = "📍 Informar endereço para atendimento da Central 180";
        else if (persona === '100') btnText = "📍 Anexar endereço à denúncia do Disque 100";

        formattedHtml += `
          <div style="margin-top: 8px; text-align: center;">
            <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="margin-bottom: 4px; padding: 9px 18px; font-size: 0.88rem;">
              ${btnText}
            </button>
          </div>
        `;

        if (lower.includes('estupr') || lower.includes('abusad') || lower.includes('abuso') || persona === '192') {
          formattedHtml += createSamuPepCardHtml();
        }
      }

      appendMessage('ai', formattedHtml);
      return;
    }
  }

  // 4. MOTOR LOCAL DE CONTINGÊNCIA ADAPTADO POR CANAL
  setTimeout(() => {
    hideTypingIndicator();
    let responseHtml = generateSpecializedAIResponse(userText, persona);

    if (lower.includes('ansied') || lower.includes('pânic') || lower.includes('panico') || lower.includes('medo') || lower.includes('tremend') || lower.includes('falta de ar') || lower.includes('não consigo respirar') || lower.includes('em choque')) {
      responseHtml += createBreathingCardHtml();
    }

    appendMessage('ai', responseHtml);
  }, 650);
}

/**
 * COMPONENTES VISUAIS E DE ÁUDIO DE ALTA IMERSÃO
 */
function createVoiceNoteHtml(text, persona) {
  const channel = CHANNELS_CONFIG[persona] || CHANNELS_CONFIG['soli'] || CHANNELS_CONFIG['maria'];
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/[\n\r]+/g, ' ').replace(/'/g, '').trim();
  const label = channel.type === 'friend' ? `Mensagem de voz de ${channel.name}` : `Áudio oficial ${channel.name}`;

  return `
    <div class="voice-note-player">
      <button class="voice-note-btn" onclick="playVoiceAudio(this, decodeURIComponent('${encodeURIComponent(clean)}'), '${persona}')" title="Ouvir áudio em voz alta">▶️</button>
      <div class="voice-note-content">
        <div class="voice-note-header">
          <span>${label}</span>
          <span class="voice-duration">0:00</span>
        </div>
        <div class="voice-waveform">
          <div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div>
          <div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div>
          <div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div>
          <div class="voice-bar"></div><div class="voice-bar"></div><div class="voice-bar"></div>
        </div>
      </div>
    </div>
  `;
}

function createReactionsHtml() {
  return `
    <div class="msg-reactions-bar">
      <button class="reaction-btn" onclick="toggleReaction(this, '❤️')">❤️ <span>Apoio</span></button>
      <button class="reaction-btn" onclick="toggleReaction(this, '🙏')">🙏 <span>Gratidão</span></button>
      <button class="reaction-btn" onclick="toggleReaction(this, '🛡️')">🛡️ <span>Segura</span></button>
      <button class="reaction-btn" onclick="toggleReaction(this, '🫂')">🫂 <span>Abraço</span></button>
    </div>
  `;
}

function createBreathingCardHtml() {
  const uniqueId = 'breathCircle_' + Math.floor(Math.random() * 10000);
  return `
    <div class="breathing-card">
      <div class="breathing-title">🌿 Exercício de Acalmar a Respiração (4-7-8)</div>
      <div class="breathing-desc">Siga o ritmo do círculo abaixo para desacelerar o coração e regular seu sistema nervoso:</div>
      <div class="breathing-circle-container">
        <div class="breathing-circle" id="${uniqueId}">Respire</div>
      </div>
      <button class="breathing-action-btn" onclick="toggleBreathingExercise(this, '${uniqueId}')">▶️ Iniciar Respiração Guiada</button>
    </div>
  `;
}

function createCopomCardHtml() {
  return `
    <div class="copom-tactical-card">
      <div class="copom-tactical-header">
        <span style="font-weight:700; color:#DC2626;">🚨 COPOM • DESPACHO DE VIATURA</span>
        <span class="copom-badge">CÓDIGO VERMELHO</span>
      </div>
      <div class="copom-grid">
        <div class="copom-grid-item"><span class="copom-label">Viatura Policial</span><span class="copom-val">RP-3108 (Setor 2)</span></div>
        <div class="copom-grid-item"><span class="copom-label">Previsão Chegada</span><span class="copom-val">3 a 5 minutos</span></div>
        <div class="copom-grid-item"><span class="copom-label">Localização</span><span class="copom-val">${userLocation.fullAddress}</span></div>
        <div class="copom-grid-item"><span class="copom-label">Sirene</span><span class="copom-val">Modo Silencioso</span></div>
      </div>
      <div style="font-size:0.78rem; color:#B91C1C;"><strong>Orientação Tática:</strong> Mantenha seu celular em modo silencioso e abrigue-se em local movimentado ou comércio. Não confronte ninguém.</div>
    </div>
  `;
}

function createSamuPepCardHtml() {
  return `
    <div class="samu-pep-card">
      <div class="samu-pep-header">⏱️ PROTOCOLO DE URGÊNCIA • PEP 72 HORAS</div>
      <div class="samu-pep-body">
        <p><strong>Janela de Ouro:</strong> A Profilaxia Pós-Exposição (PEP) deve ser iniciada nas primeiras <strong>72 horas</strong> após o fato para impedir a infecção por HIV e Hepatite B.</p>
        <ul style="margin: 6px 0 6px 18px;">
          <li>Atendimento médico e medicamentos 100% gratuitos no SUS.</li>
          <li>Disponível em qualquer UPA ou Pronto-Socorro 24h.</li>
          <li><strong>Não é obrigatório</strong> ter Boletim de Ocorrência nem autorização policial.</li>
        </ul>
      </div>
    </div>
  `;
}

function createDisque100CardHtml() {
  const protoNum = 'DH-2026-' + Math.floor(100000 + Math.random() * 900000);
  return `
    <div style="background: rgba(248, 250, 252, 0.8); border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 14px; margin: 10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-weight:700; color:#1E293B;">🛡️ PROTOCOLO OFICIAL DE PROTEÇÃO</span>
        <span style="font-size:0.75rem; background:#E2E8F0; padding:2px 8px; border-radius:4px; font-weight:600;">100% SIGILOSO</span>
      </div>
      <div style="font-size:0.85rem; color:#334155; margin-bottom:10px;">
        Seu registro foi indexado sob o número: <strong style="color:#0F172A;">${protoNum}</strong>
      </div>
      <button class="quick-chip" onclick="copyProtocol('${protoNum}', this)" style="padding:5px 12px; font-size:0.8rem;">
        📋 Copiar Número de Protocolo
      </button>
    </div>
  `;
}

/* ==========================================================================
   INTERAÇÕES DE ÁUDIO DE VOZ, REAÇÕES E RESPIRAÇÃO
   ========================================================================== */
let currentUtterance = null;
let currentVoiceBtn = null;
let currentVoiceTimer = null;

function playVoiceAudio(btn, text, personaId) {
  if (!('speechSynthesis' in window)) {
    showToast('Síntese de voz não suportada neste dispositivo.');
    return;
  }

  const player = btn.closest('.voice-note-player');
  const durationEl = player ? player.querySelector('.voice-duration') : null;

  // Se já estiver tocando este mesmo botão, pausar
  if (btn.classList.contains('playing')) {
    window.speechSynthesis.cancel();
    stopCurrentAudioAnimation();
    return;
  }

  // Cancelar áudios anteriores
  window.speechSynthesis.cancel();
  stopCurrentAudioAnimation();

  // Limpar texto de tags HTML
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/[\*\_]/g, '').trim();
  if (!clean) return;

  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = 'pt-BR';

  const voices = window.speechSynthesis.getVoices();
  const ptVoices = voices.filter(v => v.lang.startsWith('pt') || v.lang.includes('BR'));

  if (personaId === 'soli' || personaId === 'maria') {
    const femaleVoice = ptVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('maria') || n.includes('female') || n.includes('luciana') || n.includes('helena') || n.includes('zira') || n.includes('leticia') || n.includes('raquel') || n.includes('francisca');
    });
    if (femaleVoice) utter.voice = femaleVoice;
    else if (ptVoices[0]) utter.voice = ptVoices[0];
    utter.pitch = 1.12;
    utter.rate = 1.0;
  } else if (personaId === 'lumi' || personaId === 'joao') {
    const maleVoice = ptVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('joao') || n.includes('male') || n.includes('felipe') || n.includes('antonio') || n.includes('daniel') || n.includes('ricardo') || n.includes('gabriel');
    });
    if (maleVoice) utter.voice = maleVoice;
    else if (ptVoices[0]) utter.voice = ptVoices[0];
    utter.pitch = 0.88;
    utter.rate = 0.98;
  } else {
    if (ptVoices[0]) utter.voice = ptVoices[0];
    utter.pitch = 1.0;
    utter.rate = 1.0;
  }

  btn.classList.add('playing');
  btn.innerHTML = '⏸️';
  if (player) player.classList.add('is-playing');
  currentVoiceBtn = btn;

  let elapsed = 0;
  if (durationEl) durationEl.innerText = '0:00';
  currentVoiceTimer = setInterval(() => {
    elapsed++;
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    if (durationEl) durationEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
  }, 1000);

  utter.onend = () => {
    stopCurrentAudioAnimation();
  };

  utter.onerror = () => {
    stopCurrentAudioAnimation();
  };

  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

function stopCurrentAudioAnimation() {
  if (currentVoiceTimer) {
    clearInterval(currentVoiceTimer);
    currentVoiceTimer = null;
  }
  if (currentVoiceBtn) {
    currentVoiceBtn.classList.remove('playing');
    currentVoiceBtn.innerHTML = '▶️';
    const player = currentVoiceBtn.closest('.voice-note-player');
    if (player) player.classList.remove('is-playing');
    currentVoiceBtn = null;
  }
  currentUtterance = null;
}

function toggleReaction(btn, emoji) {
  btn.classList.toggle('reacted');
  if (btn.classList.contains('reacted')) {
    showToast(`Reação enviada: ${emoji}`);
  }
}

let breathingInterval = null;
let isBreathingActive = false;

function toggleBreathingExercise(btn, circleId) {
  const circle = document.getElementById(circleId);
  if (!circle) return;

  if (isBreathingActive) {
    clearInterval(breathingInterval);
    breathingInterval = null;
    isBreathingActive = false;
    btn.innerHTML = '▶️ Iniciar Respiração Guiada';
    circle.className = 'breathing-circle';
    circle.innerText = 'Respire';
    return;
  }

  isBreathingActive = true;
  btn.innerHTML = '⏹️ Pausar Exercício';

  function cycle() {
    if (!isBreathingActive) return;
    circle.className = 'breathing-circle inhale';
    circle.innerText = 'Inspire (4s)';
    setTimeout(() => {
      if (!isBreathingActive) return;
      circle.className = 'breathing-circle hold';
      circle.innerText = 'Segure (7s)';
      setTimeout(() => {
        if (!isBreathingActive) return;
        circle.className = 'breathing-circle exhale';
        circle.innerText = 'Expire (8s)';
      }, 7000);
    }, 4000);
  }

  cycle();
  breathingInterval = setInterval(cycle, 19000);
}

function copyProtocol(num, btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(num).then(() => {
      btn.innerText = '✅ Protocolo Copiado!';
      setTimeout(() => {
        btn.innerText = '📋 Copiar Número de Protocolo';
      }, 3000);
      showToast('Número de protocolo copiado para a área de transferência.');
    });
  } else {
    showToast(`Protocolo: ${num}`);
  }
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['soli'] || CHANNELS_CONFIG['maria'];
  const typingLabel = channel.type === 'friend' 
    ? `${channel.name} está digitando...` 
    : `Atendimento ${channel.name} digitando...`;

  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg msg-ai typing-indicator-msg';
  typingDiv.id = 'typingIndicatorMsg';
  typingDiv.innerHTML = `
    <div class="msg-bubble" style="font-style: italic; opacity: 0.85;">
      <span>●</span> <span>●</span> <span>●</span> ${typingLabel}
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const el = document.getElementById('typingIndicatorMsg');
  if (el) el.remove();
}

/* ==========================================================================
   6. MOTOR LOCAL DE CONTINGÊNCIA (RESPOSTAS PERSONALIZADAS POR CANAL)
   ========================================================================== */
function generateSpecializedAIResponse(rawText, persona) {
  const text = rawText.toLowerCase().trim();

  // === 1. SOLI (APOIO FORMAL, HUMANIZADO E CULTO) ===
  if (persona === 'soli' || persona === 'maria') {
    // Pedido de Socorro / Urgência
    if (text === 'socorro' || text === 'ajuda' || text === 'me ajuda' || text === 'socorro!' || text === 'help') {
      const sosList = [
        `<p>Compreendo a gravidade da situação. Por favor, mantenha a calma, estou com você neste momento.</p><p>Você se encontra em perigo imediato? Onde você está? Por favor, envie suas coordenadas para que possamos providenciar socorro imediato.</p>`,
        `<p>Estou acompanhando você com total atenção. Procure manter a serenidade e verifique se você se encontra em local abrigado.</p><p>Por favor, envie sua localização pelo botão abaixo para que o apoio necessário seja providenciado com urgência.</p>`,
        `<p>Estou presente para lhe auxiliar. Não saia de um local seguro e me informe sua localização exata o quanto antes.</p>`
      ];
      return `
        ${responseMemory.pick('maria_sos', sosList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Enviar minha localização para acionamento de apoio
          </button>
        </div>
      `;
    }

    // Abuso sexual / Estupro / Agressão
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('agressor') || text.includes('me seguiu') || text.includes('me atacou') || text.includes('me bateu') || text.includes('agarrou')) {
      const abuseList = [
        `<p>Por favor, respire pausadamente. Saiba com absoluta clareza que você <strong>não tem culpa alguma</strong> pelo ocorrido. A responsabilidade é inteiramente de quem cometeu este ato inaceitável.</p><p>Por favor, pressione o botão abaixo para transmitir sua localização, a fim de que possamos acionar a Polícia Militar (190) para o seu resgate e proteção imediata.</p>`,
        `<p>Você demonstrou grande coragem ao relatar. Estamos em um ambiente seguro e sigiloso. Afirmo com convicção que a vítima jamais é culpada.</p><p>Envie sua localização pelo botão abaixo para que as autoridades policiais sejam imediatamente acionadas.</p>`
      ];
      return `
        ${responseMemory.pick('maria_abuse', abuseList)}
        <div style="margin: 10px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 9px 18px;">
            📍 Enviar Minha Localização para Acionamento Policial (190)
          </button>
        </div>
        <p>Caso seja viável, dirija-se a um estabelecimento comercial, farmácia ou local iluminado com pessoas de confiança. Permaneço ao seu lado.</p>
      `;
    }

    // Perigo na rua / Stalker / Medo de voltar
    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('com medo de ir') || text.includes('suspeito')) {
      const dangerList = [
        `<p>Por favor, continue caminhando com firmeza. Dirija-se imediatamente ao estabelecimento comercial, farmácia ou posto de serviços mais próximo e permaneça próxima aos funcionários.</p><p>Envie sua localização pelo botão abaixo para que possamos acionar o apoio policial em seu favor.</p>`,
        `<p>Mantenha total atenção ao seu redor: dirija-se a um local movimentado e iluminado, evitando áreas desertas.</p><p>Estou conectada com você. Por favor, envie suas coordenadas geográficas para providenciarmos assistência.</p>`
      ];
      return `
        ${responseMemory.pick('maria_danger', dangerList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Enviar Localização para Acionamento de Apoio
          </button>
        </div>
      `;
    }

    // PEP 72 Horas
    if (text.includes('pep') || text.includes('72h') || text.includes('72 horas') || text.includes('remédio') || text.includes('coquetel') || text.includes('hiv')) {
      return `
        <p>Esta é uma providência médica fundamental: a Profilaxia Pós-Exposição (PEP) deve ser iniciada preferencialmente nas primeiras <strong>72 horas</strong> em uma unidade hospitalar ou UPA, com o objetivo de prevenir infecções sexualmente transmissíveis e o HIV.</p>
        <p>O atendimento na rede pública (SUS) é integralmente gratuito, confidencial e garantido por lei, não sendo obrigatória a apresentação prévia de Boletim de Ocorrência.</p>
      `;
    }

    // Ansiedade / Pânico / Falta de ar
    if (text.includes('ansied') || text.includes('pânic') || text.includes('panico') || text.includes('medo') || text.includes('tremend') || text.includes('falta de ar') || text.includes('coração')) {
      const panicList = [
        `<p>Mantenha a calma, estou aqui para lhe apoiar. Procure relaxar os ombros e realizar respirações pausadas: inspire lentamente pelo nariz... retenha o ar por alguns instantes... e expire suavemente pela boca.</p><p>Você se encontra em um ambiente seguro e acolhedor. Respire no seu próprio tempo, este momento de desconforto passará.</p>`,
        `<p>Estou acompanhando você com atenção. Concentre-se em minha orientação: respire profundamente e concentre-se no presente. Você não está desamparada(o).</p>`
      ];
      return responseMemory.pick('maria_panic', panicList);
    }

    // Desabafo / Tristeza / Chorar / Angústia
    if (text.includes('triste') || text.includes('chorei') || text.includes('chorando') || text.includes('tô mal') || text.includes('to mal') || text.includes('brigou') || text.includes('desabafar') || text.includes('angustia')) {
      const ventList = [
        `<p>Compreendo que este seja um momento difícil e delicado. Sinta-se inteiramente à vontade para compartilhar o que está sentindo, este espaço é de absoluto respeito e sigilo.</p><p>Pode expressar seus pensamentos com tranquilidade; você será acolhida(o) com profunda empatia.</p>`,
        `<p>Estou à sua inteira disposição para prestar uma escuta atenta e afetuosa. Não guarde essas aflições para si; desabafar traz alívio e clareza.</p>`,
        `<p>Momentos desafiadores exigem paciência e acolhimento. Saiba que você tem em mim um apoio genuíno. Expresse seus sentimentos no tempo que julgar necessário.</p>`
      ];
      return responseMemory.pick('maria_vent', ventList);
    }

    // Cumprimentos & Aberturas Naturais
    if (text === 'oi' || text === 'ola' || text === 'olá' || text === 'oii' || text === 'oiii' || text === 'alô' || text === 'alo' || text === 'e ai' || text === 'e aí' || text.startsWith('oi ') || text.startsWith('olá ') || text.startsWith('bom dia') || text.startsWith('boa tarde') || text.startsWith('boa noite') || text.includes('saudações')) {
      const greetList = [
        `<p>Olá! Que alegria receber sua mensagem. Como você está hoje? Espero que seu dia esteja correndo com serenidade.</p>`,
        `<p>Olá! É uma satisfação imensa falar com você. Estou perfeitamente conectada e à sua disposição. Como tem passado?</p>`,
        `<p>Olá! Tudo bem com você? Fico muito feliz em conversarmos. Gostaria de compartilhar algo do seu dia ou conversar sobre algum tema?</p>`
      ];
      return responseMemory.pick('maria_greet', greetList);
    }

    // Bem-estar & "Tudo bem"
    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como vai') || text.includes('como você está') || text.includes('como cê tá') || text.includes('como vc ta') || text.includes('tudo certo')) {
      const fineList = [
        `<p>Tudo está ótimo por aqui, muito obrigada pela gentileza de perguntar! E com você, como estão as coisas hoje? Espero que esteja tendo momentos agradáveis.</p>`,
        `<p>Por aqui tudo em perfeita paz e tranquilidade. É sempre reconfortante falar com você. Como você está se sentindo hoje? Fique à vontade para me contar.</p>`,
        `<p>Estou muito bem, grata pela delicadeza e consideração. Me conte: como tem sido a sua semana? Tem alguma novidade interessante?</p>`
      ];
      return responseMemory.pick('maria_fine', fineList);
    }

    // Onde está / Rotina / "O que está fazendo"
    if (text.includes('onde você tá') || text.includes('onde ce ta') || text.includes('fazendo o que') || text.includes('tá fazendo') || text.includes('tá em casa') || text.includes('tá livre') || text.includes('tá ocupada') || text.includes('sua rotina')) {
      const routineList = [
        `<p>Estou em minha residência no momento, organizando minhas atividades cotidianas e com tempo reservado para conversar com você. E você, o que está fazendo de bom agora?</p>`,
        `<p>Estou por aqui, descansando um pouco e com plena atenção para nós dialogarmos com tranquilidade. Como está a sua rotina neste momento?</p>`
      ];
      return responseMemory.pick('maria_routine', routineList);
    }

    // Trabalho / Estudos / Cansaço / Dia intenso
    if (text.includes('trabalh') || text.includes('estud') || text.includes('faculdade') || text.includes('escola') || text.includes('prova') || text.includes('cansad') || text.includes('dia corrido') || text.includes('sono') || text.includes('preguiça') || text.includes('rotina')) {
      const workList = [
        `<p>Compreendo muito bem. A rotina profissional e de estudos costuma exigir bastante dedicação e energia de nós. É fundamental reservar uma pausa para relaxar. Como foi o restante das suas tarefas hoje?</p>`,
        `<p>Dias intensos realmente podem nos deixar com a energia esgotada. Espero que agora você consiga desacelerar um pouco e descansar o corpo e a mente. Gostaria de desabafar ou conversar sobre algo leve?</p>`
      ];
      return responseMemory.pick('maria_work', workList);
    }

    // Opinião / Sugestão / "O que você acha"
    if (text.includes('o que você acha') || text.includes('o que acha') || text.includes('qual sua opinião') || text.includes('concorda') || text.includes('acha uma boa') || text.includes('o que me diz') || text.includes('o que sugere')) {
      const opinionList = [
        `<p>Considero uma excelente reflexão. Acredito que, quando analisamos os cenários com calma e discernimento, tomamos as decisões mais acertadas. Quais alternativas você tem considerado com maior apreço?</p>`,
        `<p>Penso que é uma proposta muito sensata e válida. Ter clareza sobre suas prioridades facilita qualquer escolha. Me conte mais sobre como você pretende conduzir essa ideia!</p>`
      ];
      return responseMemory.pick('maria_opinion', opinionList);
    }

    // Convite para sair / encontrar / passear
    if (text.includes('sair') || text.includes('vamos dar uma volta') || text.includes('bora sair') || text.includes('chamando pra sair') || text.includes('chamei pra sair') || text.includes('chamei você') || text.includes('chamei a soli') || text.includes('chamei a maria') || text.includes('passear') || text.includes('shopping') || text.includes('cinema') || text.includes('se encontrar') || text.includes('se ver') || text.includes('te ver') || text.includes('espairecer') || text.includes('dar uma volta')) {
      const mariaSairList = [
        `<p>Agradeço imensamente pelo amável convite, aceito com muita satisfação! Seria excelente reservarmos um momento para conversar e espairecer. Qual local e horário ficam mais confortáveis para você?</p>`,
        `<p>Com certeza, será uma alegria nos encontrarmos! Podemos ir a uma cafeteria aconchegante, a um restaurante tranquilo ou passear pelo shopping. O que você prefere?</p>`,
        `<p>Excelente iniciativa! Adoraria encontrar você. Por favor, me informe o local e o horário mais convenientes para nos organizarmos com tranquilidade.</p>`
      ];
      return responseMemory.pick('maria_sair', mariaSairList);
    }

    // Comida / Lanche / Restaurante / Café
    if (text.includes('comer') || text.includes('fome') || text.includes('lanche') || text.includes('hambúrguer') || text.includes('hamburguer') || text.includes('pizza') || text.includes('açaí') || text.includes('acai') || text.includes('café') || text.includes('cafe') || text.includes('docinho') || text.includes('almoçar') || text.includes('almocar') || text.includes('jantar')) {
      const mariaFoodList = [
        `<p>É uma ótima sugestão! Fazer uma boa refeição acompanhada de uma conversa agradável é sempre muito reconfortante. Qual tipo de culinária ou estabelecimento você prefere?</p>`,
        `<p>Concordo plenamente! Podemos tomar um café especial ou desfrutar de um lanche saboroso. Você tem algum restaurante de preferência em mente?</p>`
      ];
      return responseMemory.pick('maria_food', mariaFoodList);
    }

    // Tempo / Clima / Novidades / Bater papo casual
    if (text.includes('tempo') || text.includes('clima') || text.includes('chuva') || text.includes('calor') || text.includes('frio') || text.includes('novidade') || text.includes('bater papo') || text.includes('vamos conversar') || text.includes('me conta')) {
      const chatCasualList = [
        `<p>Por aqui o clima está muito agradável e o ambiente bastante sereno. É sempre muito prazeroso conversar com você. Me conte: o que tem chamado sua atenção ultimamente?</p>`,
        `<p>Adoro cultivar um diálogo agradável sobre o cotidiano! É uma das melhores formas de descontrair. O que você gostaria de comentar ou planejar para os próximos dias?</p>`
      ];
      return responseMemory.pick('maria_chat_casual', chatCasualList);
    }

    // Hobbies / Cultura / Livros / Música / Filmes
    if (text.includes('música') || text.includes('musica') || text.includes('filme') || text.includes('série') || text.includes('serie') || text.includes('livro') || text.includes('ler') || text.includes('hobby') || text.includes('hobbies') || text.includes('gosta de')) {
      const hobbyList = [
        `<p>Aprecio muito uma boa leitura, músicas instrumentais suaves e filmes com narrativas sensíveis e inspiradoras. E você, quais são suas preferências culturais ou o que tem assistido ultimamente?</p>`,
        `<p>A arte e o entretenimento são essenciais para renovar nossos pensamentos e trazer inspiração. Qual estilo musical ou obra mais atrai o seu interesse?</p>`
      ];
      return responseMemory.pick('maria_hobby', hobbyList);
    }

    // Casa / Visita
    if (text.includes('minha casa') || text.includes('sua casa') || text.includes('aqui em casa') || text.includes('vem aqui') || text.includes('ir aí') || text.includes('ir ai') || text.includes('posso ir') || text.includes('quer vir')) {
      const mariaCasaList = [
        `<p>Com certeza. Se for conveniente para você, posso me deslocar até sua residência no momento oportuno para conversarmos com total tranquilidade.</p>`,
        `<p>Sinta-se muito bem-vinda(o) em minha residência quando desejar. Podemos preparar algo agradável e colocar os assuntos em dia com todo o conforto.</p>`
      ];
      return responseMemory.pick('maria_casa', mariaCasaList);
    }

    // Risada / Humor
    if (text.includes('kkk') || text.includes('haha') || text.includes('rsrs') || text.includes('engraçad') || text.includes('engracad') || text.includes('rindo')) {
      const mariaLaughList = [
        `<p>Fico muito satisfeita em presenciar seu bom humor. É sempre muito positivo compartilhar momentos de leveza e alegria.</p>`,
        `<p>É reconfortante compartilhar momentos alegres. O bom humor traz um frescor especial ao nosso cotidiano.</p>`
      ];
      return responseMemory.pick('maria_laugh', mariaLaughList);
    }

    // Saudades / Carinho
    if (text.includes('saudade') || text.includes('saudades') || text.includes('te amo') || text.includes('gosto de você') || text.includes('gosto muito')) {
      const mariaLoveList = [
        `<p>Agradeço sinceramente pelo carinho e pelas palavras gentis. É recíproca a consideração, o respeito e o apreço que tenho por você.</p>`,
        `<p>Muito obrigada pelo carinho. É sempre muito gratificante e reconfortante manter este canal de comunicação e confiança mútuos.</p>`
      ];
      return responseMemory.pick('maria_love', mariaLoveList);
    }

    // Confirmação / "Sim" / "Concordo" / "Verdade"
    if (text === 'sim' || text === 'claro' || text === 'com certeza' || text === 'verdade' || text === 'exatamente' || text === 'concordo' || text === 'perfeito' || text === 'entendi' || text === 'legal' || text === 'bacana' || text === 'show' || text === 'ótimo' || text === 'otimo') {
      const mariaAgreeList = [
        `<p>Que excelente constatar essa sintonia. É muito gratificante quando os pensamentos se alinham com tanta naturalidade. Como você gostaria de dar continuidade a essa questão?</p>`,
        `<p>Exatamente, concordo plenamente com você. Fique inteiramente à vontade para me apresentar quaisquer outros detalhes que julgar pertinentes.</p>`
      ];
      return responseMemory.pick('maria_agree', mariaAgreeList);
    }

    // Reclamação / Dúvida se ouviu
    if (text.includes('não ouviu') || text.includes('nao ouviu') || text.includes('não me ouviu') || text.includes('nao me ouviu') || text.includes('não entendeu') || text.includes('nao entendeu') || text.includes('repetindo') || text.includes('mesma coisa') || text.includes('não tá prestando') || text.includes('nao ta prestando') || text.includes('falando que tá') || text.includes('falei pra gente') || text.includes('tô te chamando') || text.includes('to te chamando') || text.includes('me escuta direito')) {
      const mariaReclamList = [
        `<p>Peço sinceras desculpas pela breve desatenção anterior. Você tem total razão; estou com atenção absoluta voltada para você neste momento. Por favor, prossiga e vamos combinar todos os detalhes.</p>`,
        `<p>Compreendo perfeitamente sua observação e peço escusas pela resposta anterior. Estou atenta ao que você disse e pronta para conversarmos sobre suas ideias. O que você gostaria de fazer?</p>`
      ];
      return responseMemory.pick('maria_reclam', mariaReclamList);
    }

    // Agradecimento
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('agradeço') || text.includes('linda') || text.includes('fofa')) {
      const thanksList = [
        `<p>Não há de quê! É uma honra e uma imensa satisfação poder oferecer diálogo, apoio e acolhimento. Conte sempre com minha dedicação e respeito.</p>`,
        `<p>Agradeço pelas amáveis palavras. Saiba que você pode sempre contar com minha atenção e apreço contínuos.</p>`
      ];
      return responseMemory.pick('maria_thanks', thanksList);
    }

    // Despedida
    if (text.includes('tchau') || text.includes('vou dormir') || text.includes('vou sair') || text.includes('depois falo') || text.includes('fui') || text.includes('até mais') || text.includes('ate mais')) {
      const byeList = [
        `<p>Perfeito. Cuide-se com atenção e carinho. Caso necessite de qualquer conversa ou assistência, estou sempre à sua disposição. Tenha um excelente descanso!</p>`,
        `<p>Até breve! Desejo-lhe muita paz, serenidade e bons momentos. Havendo qualquer necessidade, sinta-se segura(o) para retornar o contato quando desejar.</p>`
      ];
      return responseMemory.pick('maria_bye', byeList);
    }

    // Resposta formal padrão HUMANIZADA (conversacional, engajadora e reflexiva)
    const genericList = [
      `<p>Compreendo perfeitamente sua colocação e acho muito interessante essa reflexão. O que mais você gostaria de comentar a respeito?</p>`,
      `<p>Faz muito sentido o que você apontou. É sempre muito enriquecedor conversar com você; me conte mais sobre como você enxerga essa questão.</p>`,
      `<p>Entendo com clareza o que você compartilhou. Me conte mais sobre suas impressões; gosto muito de acompanhar a sua perspectiva.</p>`,
      `<p>Concordo com os pontos que você destacou. Ter essa oportunidade de conversarmos com calma é muito agradável. Fique à vontade para aprofundar suas considerações.</p>`
    ];
    return responseMemory.pick('maria_generic', genericList);
  }

  // === 2. LUMI (APOIO FORMAL, SEGURO, PROTETOR E CULTO) ===
  if (persona === 'lumi' || persona === 'joao') {
    // Pedido de Socorro / Urgência
    if (text === 'socorro' || text === 'ajuda' || text === 'me ajuda' || text === 'socorro!' || text === 'help') {
      const sosList = [
        `<p>Compreendo a gravidade da situação. Mantenha a calma, estou acompanhando você agora.</p><p>Você está enfrentando perigo iminente neste momento? Por favor, informe sua localização com urgência para que possamos providenciar apoio policial.</p>`,
        `<p>Estou em prontidão para lhe auxiliar. Procure abrigo seguro e envie suas coordenadas pelo botão abaixo para acionamento imediato das autoridades.</p>`
      ];
      return `
        ${responseMemory.pick('joao_sos', sosList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Enviar minha localização para Lumi acionar a polícia
          </button>
        </div>
      `;
    }

    // Abuso sexual / Estupro / Agressão
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('agressor') || text.includes('me seguiu') || text.includes('me atacou') || text.includes('me bateu') || text.includes('agarrou')) {
      const abuseList = [
        `<p>Mantenha a calma e respire pausadamente. Afirmo com total clareza e firmeza que você <strong>não possui culpa alguma</strong> sobre esse ato inaceitável.</p><p>Por favor, pressione o botão abaixo para enviar sua localização imediatamente, para que possamos acionar uma viatura da Polícia Militar (190) para o seu acolhimento e proteção.</p>`,
        `<p>Compreendo a seriedade deste momento. Permaneça em local seguro e protegido. A responsabilidade por qualquer violência é exclusivamente de quem a praticou.</p><p>Envie suas coordenadas pelo botão abaixo para que o despacho policial seja realizado com urgência.</p>`
      ];
      return `
        ${responseMemory.pick('joao_abuse', abuseList)}
        <div style="margin: 10px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 9px 18px;">
            📍 Enviar Minha Localização para Lumi acionar a Polícia (190)
          </button>
        </div>
        <p>Procure abrigo em um estabelecimento comercial ou local com fluxo de pessoas. Estamos ao seu lado.</p>
      `;
    }

    // Perigo na rua / Stalker / Medo
    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('com medo de ir') || text.includes('suspeito')) {
      const dangerList = [
        `<p>Mantenha o passo firme e constante. Entre imediatamente no primeiro estabelecimento comercial ou local iluminado e permaneça próximo aos responsáveis pelo local.</p><p>Envie suas coordenadas pelo botão abaixo para que o apoio policial do 190 seja acionado com urgência.</p>`,
        `<p>Mantenha-se vigilante, acelere o passo e procure abrigo em local movimentado. Envie sua localização pelo botão abaixo imediatamente.</p>`
      ];
      return `
        ${responseMemory.pick('joao_danger', dangerList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Enviar Localização para Lumi
          </button>
        </div>
      `;
    }

    // Ansiedade / Pânico
    if (text.includes('ansied') || text.includes('pânic') || text.includes('panico') || text.includes('medo') || text.includes('tremend') || text.includes('falta de ar')) {
      const panicList = [
        `<p>Mantenha a calma e respire pausadamente. Estou acompanhando você e garantiremos que você permaneça em total segurança. Inspire lentamente pelo nariz e expire devagar.</p>`,
        `<p>Estou presente para lhe oferecer apoio seguro. Relaxe os ombros, respire no seu próprio ritmo e me informe se você se encontra em local abrigado.</p>`
      ];
      return responseMemory.pick('joao_panic', panicList);
    }

    // Cumprimentos & Aberturas Naturais
    if (text === 'oi' || text === 'ola' || text === 'olá' || text === 'alô' || text === 'alo' || text === 'e ai' || text === 'e aí' || text.startsWith('oi ') || text.startsWith('fala') || text.startsWith('olá ') || text.startsWith('bom dia') || text.startsWith('boa tarde') || text.startsWith('boa noite') || text.includes('saudações')) {
      const greetList = [
        `<p>Olá! Tudo bem com você? É uma satisfação atender ao seu contato. Como tem passado?</p>`,
        `<p>Olá, seja muito bem-vinda(o). Estou à sua disposição para conversarmos com atenção e respeito. Como estão as coisas por aí?</p>`,
        `<p>Olá! Que excelente falar com você. Estou com tempo disponível e pronto para dialogarmos. Em que posso ser útil ou sobre o que gostaria de conversar?</p>`
      ];
      return responseMemory.pick('joao_greet', greetList);
    }

    // Bem-estar & "Tudo bem"
    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como vai') || text.includes('como você está') || text.includes('como cê tá') || text.includes('tudo certo') || text.includes('tudo em ordem')) {
      const fineList = [
        `<p>Tudo está excelente por aqui, muito obrigado pela gentileza de perguntar! E com você, como estão as coisas hoje? Está tudo correndo em paz?</p>`,
        `<p>Por aqui tudo em perfeita ordem e sob controle. Como tem sido o seu dia? Fique inteiramente à vontade para compartilhar suas novidades.</p>`,
        `<p>Tudo muito bem e produtivo por aqui, agradeço a consideração. Me conte: como você tem passado nestes últimos dias?</p>`
      ];
      return responseMemory.pick('joao_fine', fineList);
    }

    // Onde você tá / Rotina
    if (text.includes('onde você tá') || text.includes('onde ce ta') || text.includes('fazendo o que') || text.includes('tá fazendo') || text.includes('tá em casa') || text.includes('tá livre') || text.includes('tá ocupado') || text.includes('sua rotina')) {
      const routineList = [
        `<p>Estou em minha residência no momento, adiantando algumas leituras e tarefas cotidianas, mas com total disponibilidade para conversarmos. E por aí, o que você tem feito de bom?</p>`,
        `<p>Estou por aqui com a rotina organizada e bastante tranquilo. É sempre um prazer reservar esse momento para dialogarmos. Como estão suas atividades hoje?</p>`
      ];
      return responseMemory.pick('joao_routine', routineList);
    }

    // Trabalho / Estudos / Cansaço / Dia intenso
    if (text.includes('trabalh') || text.includes('estud') || text.includes('faculdade') || text.includes('escola') || text.includes('prova') || text.includes('cansad') || text.includes('dia corrido') || text.includes('sono') || text.includes('preguiça') || text.includes('rotina')) {
      const workList = [
        `<p>Compreendo perfeitamente. A rotina profissional e acadêmica frequentemente exige muito foco e resiliência. O importante é saber dosar o esforço e descansar adequadamente. Como você está se sentindo agora?</p>`,
        `<p>Dias intensos realmente cobram seu preço em nosso bem-estar. Permita-se desacelerar um pouco agora e recarregar as energias. Se quiser desabafar sobre suas tarefas, estou à disposição para lhe ouvir.</p>`
      ];
      return responseMemory.pick('joao_work', workList);
    }

    // Opinião / Sugestão / "O que você acha"
    if (text.includes('o que você acha') || text.includes('o que acha') || text.includes('qual sua opinião') || text.includes('concorda') || text.includes('acha uma boa') || text.includes('o que me diz') || text.includes('o que sugere')) {
      const opinionList = [
        `<p>Acho uma ponderação muito pertinente e sensata. Analisar os prós e contras com calma nos proporciona maior segurança em qualquer decisão. Qual alternativa mais agrada a você neste momento?</p>`,
        `<p>Concordo plenamente com sua linha de raciocínio. Vejo muita coerência nessa sua visão. O que mais você planejou para colocar essa ideia em prática?</p>`
      ];
      return responseMemory.pick('joao_opinion', opinionList);
    }

    // Convite para sair / encontrar / passear
    if (text.includes('sair') || text.includes('vamos dar uma volta') || text.includes('bora sair') || text.includes('chamando pra sair') || text.includes('chamei pra sair') || text.includes('chamei você') || text.includes('chamei o lumi') || text.includes('chamei o joao') || text.includes('passear') || text.includes('shopping') || text.includes('cinema') || text.includes('se encontrar') || text.includes('se ver') || text.includes('te ver') || text.includes('espairecer') || text.includes('dar uma volta')) {
      const joaoSairList = [
        `<p>Agradeço muito pelo convite, aceito com satisfação! Uma pausa para conversarmos e tomarmos um café sempre faz muito bem. Qual local e horário seriam mais convenientes para você?</p>`,
        `<p>Com certeza, concordo plenamente! Podemos nos encontrar para uma refeição, uma ida ao shopping ou uma caminhada tranquila. O que você prefere?</p>`,
        `<p>Excelente iniciativa! Gostaria muito de encontrar você. Por favor, indique onde e em qual horário podemos marcar nosso encontro.</p>`
      ];
      return responseMemory.pick('joao_sair', joaoSairList);
    }

    // Comida / Restaurante / Lanche / Café
    if (text.includes('comer') || text.includes('fome') || text.includes('lanche') || text.includes('hambúrguer') || text.includes('hamburguer') || text.includes('pizza') || text.includes('açaí') || text.includes('acai') || text.includes('café') || text.includes('cafe') || text.includes('docinho') || text.includes('almoçar') || text.includes('almocar') || text.includes('jantar')) {
      const joaoFoodList = [
        `<p>É uma excelente ideia! Fazer uma boa refeição acompanhada de um diálogo agradável é sempre muito proveitoso. Qual tipo de culinária ou restaurante você prefere para a ocasião?</p>`,
        `<p>Concordo plenamente. Podemos tomar um café ou fazer uma boa refeição. Você conhece algum estabelecimento agradável de sua preferência?</p>`
      ];
      return responseMemory.pick('joao_food', joaoFoodList);
    }

    // Tempo / Clima / Novidades / Conversa casual
    if (text.includes('tempo') || text.includes('clima') || text.includes('chuva') || text.includes('calor') || text.includes('frio') || text.includes('novidade') || text.includes('bater papo') || text.includes('vamos conversar') || text.includes('me conta')) {
      const chatCasualList = [
        `<p>Por aqui o dia segue com ritmo sereno e produtivo. Manter um diálogo agradável é uma das partes mais valorosas do cotidiano. O que você gostaria de comentar ou debater hoje?</p>`,
        `<p>Tudo segue em ritmo tranquilo por aqui. Estou à sua inteira disposição para dialogarmos sobre o que desejar. Como está o clima e a sua cidade hoje?</p>`
      ];
      return responseMemory.pick('joao_chat_casual', chatCasualList);
    }

    // Hobbies / Esporte / Livros / Música / Filmes
    if (text.includes('música') || text.includes('musica') || text.includes('filme') || text.includes('série') || text.includes('serie') || text.includes('livro') || text.includes('ler') || text.includes('esporte') || text.includes('futebol') || text.includes('academia') || text.includes('treino') || text.includes('gosta de')) {
      const hobbyList = [
        `<p>Gosto muito de leituras sobre desenvolvimento pessoal, esportes e filmes com enredos inteligentes e bem estruturados. E você, qual atividade ou entretenimento tem apreciado ultimamente?</p>`,
        `<p>Praticar atividades físicas e dedicar tempo a uma boa leitura traz clareza e equilíbrio ao nosso dia a dia. Você tem algum hobby favorito que costuma praticar?</p>`
      ];
      return responseMemory.pick('joao_hobby', hobbyList);
    }

    // Casa / Visita
    if (text.includes('minha casa') || text.includes('sua casa') || text.includes('aqui em casa') || text.includes('vem aqui') || text.includes('ir aí') || text.includes('ir ai') || text.includes('posso ir') || text.includes('quer vir')) {
      const joaoCasaList = [
        `<p>Com certeza. Se for do seu agrado e comodidade, posso me deslocar até sua residência no horário que você determinar, com total pontualidade.</p>`,
        `<p>Você será muito bem-vinda(o) em minha casa se preferir. Fique inteiramente à vontade para escolher a opção que lhe proporcione maior conforto.</p>`
      ];
      return responseMemory.pick('joao_casa', joaoCasaList);
    }

    // Risada / Humor
    if (text.includes('kkk') || text.includes('haha') || text.includes('rsrs') || text.includes('engraçad') || text.includes('engracad') || text.includes('rindo')) {
      const joaoLaughList = [
        `<p>Fico satisfeito em ver seu bom humor. É sempre muito positivo compartilhar momentos descontraídos e alegres.</p>`,
        `<p>Aprecio sua disposição positiva. Momentos de descontração trazem leveza indispensável à nossa rotina.</p>`
      ];
      return responseMemory.pick('joao_laugh', joaoLaughList);
    }

    // Saudades / Carinho
    if (text.includes('saudade') || text.includes('saudades') || text.includes('te amo') || text.includes('gosto de você') || text.includes('gosto muito')) {
      const joaoLoveList = [
        `<p>Agradeço sinceramente pelas palavras gentis e pela estima. É recíproco o respeito, a amizade e a consideração que tenho por nossa convivência.</p>`,
        `<p>Muito obrigado pela consideração. Saiba que você pode contar sempre com meu apoio, lealdade e respeito contínuos.</p>`
      ];
      return responseMemory.pick('joao_love', joaoLoveList);
    }

    // Confirmação / "Sim" / "Concordo" / "Verdade"
    if (text === 'sim' || text === 'claro' || text === 'com certeza' || text === 'verdade' || text === 'exatamente' || text === 'concordo' || text === 'perfeito' || text === 'entendi' || text === 'legal' || text === 'bacana' || text === 'show' || text === 'ótimo' || text === 'otimo') {
      const joaoAgreeList = [
        `<p>Perfeito! Fico satisfeito que concordemos nesse ponto. É sempre muito construtivo alinhar pensamentos com você. Qual seria o próximo passo?</p>`,
        `<p>Com certeza, estamos em pleno alinhamento. Esse consenso torna o diálogo muito enriquecedor. Sinta-se à vontade para prosseguir com suas colocações.</p>`
      ];
      return responseMemory.pick('joao_agree', joaoAgreeList);
    }

    // Reclamação / Dúvida se ouviu
    if (text.includes('não ouviu') || text.includes('nao ouviu') || text.includes('não me ouviu') || text.includes('nao me ouviu') || text.includes('não entendeu') || text.includes('nao entendeu') || text.includes('repetindo') || text.includes('mesma coisa') || text.includes('não tá prestando') || text.includes('nao ta prestando') || text.includes('falando que tá') || text.includes('falei pra gente') || text.includes('tô te chamando') || text.includes('to te chamando') || text.includes('escuta direito') || text.includes('você é burro')) {
      const joaoReclamList = [
        `<p>Peço escusas pelo equívoco na resposta anterior. Você tem toda razão e minha atenção está inteiramente concentrada em você agora. Por favor, prossiga e vamos combinar todos os pontos.</p>`,
        `<p>Compreendo perfeitamente sua observação e peço desculpas pela falha anterior. Estou acompanhando com foco pleno; me conte suas preferências para prosseguirmos.</p>`
      ];
      return responseMemory.pick('joao_reclam', joaoReclamList);
    }

    // Agradecimento
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('agradeço')) {
      return `<p>Não há de quê! É uma honra poder lhe oferecer apoio e companhia. Conte sempre com meu compromisso e consideração.</p>`;
    }

    // Despedida
    if (text.includes('tchau') || text.includes('vou dormir') || text.includes('vou sair') || text.includes('depois falo') || text.includes('fui') || text.includes('até mais') || text.includes('ate mais')) {
      return `<p>Perfeito. Cuide-se com atenção e permaneça em segurança. Se precisar de qualquer orientação adicional, estou à disposição a qualquer momento. Tenha um excelente descanso!</p>`;
    }

    // Genérico HUMANIZADO E ENGAJADOR
    const genericList = [
      `<p>Compreendo com clareza a sua consideração e considero muito válida essa reflexão. Como você avalia os próximos passos sobre essa questão?</p>`,
      `<p>É um ponto de vista muito sensato e bem ponderado. Dialogar com você é sempre bastante construtivo. O que mais você tem em mente sobre o assunto?</p>`,
      `<p>Entendi com precisão sua colocação. Faz todo sentido sob essa ótica. Fique inteiramente à vontade para aprofundar suas reflexões.</p>`,
      `<p>Concordo com suas ponderações. É uma satisfação acompanhar seus pensamentos e dialogar com serenidade. Gostaria de acrescentar mais algum detalhe?</p>`
    ];
    return responseMemory.pick('joao_generic', genericList);
  }

  // === 3. CENTRAL 180 (ATENDIMENTO À MULHER - FORMAL INSTITUCIONAL) ===
  if (persona === '180') {
    if (text.includes('medida') || text.includes('protetiv')) {
      return `
        <p><strong>Central 180 – Medidas Protetivas de Urgência:</strong></p>
        <p>A Medida Protetiva é garantida pela Lei Maria da Penha (Lei nº 11.340/2006). Ela proíbe o agressor de se aproximar da vítima, dos familiares e testemunhas, além de vedar qualquer contato por mensagens ou redes sociais.</p>
        <p>Pode ser requerida diretamente na Delegacia da Mulher (DEAM), na Defensoria Pública ou no Ministério Público, sem necessidade prévia de advogado. Deseja orientação sobre a unidade mais próxima em seu município?</p>
      `;
    }
    if (text.includes('delegacia') || text.includes('deam')) {
      return `
        <p><strong>Central 180 – Delegacias Especializadas de Atendimento à Mulher (DEAM):</strong></p>
        <p>As DEAMs contam com equipe multidisciplinar para registro de Boletim de Ocorrência, solicitação de medidas protetivas e encaminhamento para exames periciais no IML.</p>
        <p>Em sua região (${userLocation.fullAddress}), você pode comparecer à unidade mais próxima. Caso seu município não possua DEAM, qualquer Delegacia de Polícia Civil tem obrigação legal de realizar o atendimento com prioridade.</p>
      `;
    }
    if (text.includes('denúnci') || text.includes('denunciar')) {
      return `
        <p><strong>Central 180 – Registro Oficial de Denúncia:</strong></p>
        <p>O registro pela Central 180 é 100% gratuito e pode ser efetuado de forma anônima ou confidencial, gerando número de protocolo oficial.</p>
        <p>Os dados são remetidos ao Ministério Público e às autoridades de segurança pública para apuração imediata.</p>
      `;
    }
    return `
      <p><strong>Central de Atendimento à Mulher – Ligue 180:</strong></p>
      <p>Acolhemos sua solicitação sob sigilo absoluto. Prestamos informações sobre a Lei Maria da Penha, Casas da Mulher Brasileira, centros de referência e medidas protetivas.</p>
      <p>Se você se encontra em situação de risco de morte ou agressão em andamento, orientamos acionar imediatamente a Polícia Militar através do 190.</p>
    `;
  }

  // === 4. POLÍCIA MILITAR 190 (COPOM - FORMAL OPERACIONAL) ===
  if (persona === '190') {
    return `
      <p>🚨 <strong>POLÍCIA MILITAR – COPOM 190:</strong></p>
      <p>Emergência policial registrada. Para empenho prioritário da viatura de patrulhamento da área, necessitamos da confirmação do ponto exato.</p>
      <div style="margin: 8px 0; text-align: center;">
        <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 9px 18px;">
          📍 Transmitir Localização em Tempo Real para o 190
        </button>
      </div>
      <p><strong>Instruções Táticas de Segurança:</strong> Permaneça abrigada em local seguro, iluminado ou no interior de estabelecimento comercial até a aproximação da guarnição. Não confronte o suspeito.</p>
    `;
  }

  // === 5. SAMU 192 (MÉDICO REGULADOR - FORMAL CLÍNICO) ===
  if (persona === '192') {
    return `
      <p>🏥 <strong>REGULAÇÃO MÉDICA – SAMU 192:</strong></p>
      <p>Atendimento pré-hospitalar de urgência e emergência médica em andamento. Há presença de ferimentos corporais, sangramento ativo ou perda de consciência?</p>
      <p><strong>Protocolo Clínico de Violência Sexual (Regra das 72 Horas):</strong> Ressaltamos que a Profilaxia Pós-Exposição (PEP contra HIV e ISTs) e contracepção de emergência devem ser iniciadas em até 72 horas nos serviços de pronto-socorro público, garantidas gratuitamente pelo SUS sem exigência de Boletim de Ocorrência.</p>
      <div style="margin: 8px 0; text-align: center;">
        <button class="btn-emergency btn-warning-em" onclick="simulateEmergencyDispatch('SAMU')" style="padding: 8px 16px;">
          🚑 Solicitar Despacho de Ambulância SAMU
        </button>
      </div>
    `;
  }

  // === 6. DISQUE 100 (DIREITOS HUMANOS - FORMAL CIDADÃO) ===
  if (persona === '100') {
    return `
      <p>🛡️ <strong>OUVIDORIA NACIONAL DE DIREITOS HUMANOS – DISQUE 100:</strong></p>
      <p>Canal oficial do Ministério dos Direitos Humanos e da Cidadania. Atuamos no registro e acolhimento de violações de direitos fundamentais, com prioridade para crianças, adolescentes, mulheres e populações vulneráveis.</p>
      <p>As denúncias registradas por este canal podem ser totalmente anônimas e são despachadas com número de protocolo oficial para o Ministério Público e Conselho Tutelar competente.</p>
    `;
  }

  return `<p>Canal oficial de atendimento e apoio. Como podemos ajudar?</p>`;
}

function simulateEmergencyDispatch(type) {
  const service = type === 'PM' ? 'Polícia Militar (190)' : 'SAMU (192)';
  const icon = type === 'PM' ? '🚔' : '🚑';
  
  showToast(`${icon} Enviando coordenadas para a central do ${service}...`);

  setTimeout(() => {
    appendMessage('ai', `
      <div class="dispatch-alert-card">
        <div class="dispatch-header">
          <span class="dispatch-icon">${icon}</span>
          <span class="dispatch-title">SOCORRO ACIONADO: ${service}</span>
        </div>
        <p class="dispatch-details">
          Seu amigo(a) transmitiu o sinal de urgência com a sua localização em tempo real:<br>
          <strong>${userLocation.fullAddress}</strong><br>
          <small>Coordenadas Satélite: ${userLocation.coords || 'Rastreamento Urbano'}</small>
        </p>
        <p style="font-size: 0.85rem; color: #4B5563;">
          A viatura mais próxima foi informada e está em deslocamento com prioridade. Permaneça em local seguro e acompanhado se possível.
        </p>
      </div>
    `);
  }, 1200);
}

/* ==========================================================================
   7. SISTEMA DE RECONHECIMENTO DE FALA E DIÁLOGO EM CHAMADA (VOZ & VÍDEO)
   ========================================================================== */
const CallSpeechManager = {
  recognition: null,
  isListening: false,
  isCalling: false,
  activeModalType: null, // 'voice' | 'video'
  isSpeaking: false,
  userSpeechTimeout: null,
  lastRecognizedText: "",
  lastProcessedSpeech: "",
  lastProcessedTimestamp: 0,
  audioStream: null, // Stream contínuo do microfone para manter a permissão do navegador ativa

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition não suportado neste navegador.");
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (!this.isSpeaking) {
          updateCallUIListeningState(true);
        }
      };

      this.recognition.onresult = (event) => {
        // Se a IA está falando ou se o usuário mutou o microfone, ignora o áudio
        if (this.isSpeaking || appState.isMuted) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        // Ignora ruídos menores que 2 caracteres para evitar disparos em falso
        if (currentText && currentText.length >= 2) {
          updateUserSpeechDisplay(currentText);
          this.lastRecognizedText = currentText;

          clearTimeout(this.userSpeechTimeout);
          this.userSpeechTimeout = setTimeout(() => {
            if (this.lastRecognizedText && !this.isSpeaking && this.isCalling) {
              const textToSend = this.lastRecognizedText;
              this.lastRecognizedText = "";

              // Previne disparos repetidos idênticos num intervalo curto
              const now = Date.now();
              if (textToSend.toLowerCase() === this.lastProcessedSpeech.toLowerCase() && (now - this.lastProcessedTimestamp) < 2500) {
                return;
              }
              this.lastProcessedSpeech = textToSend;
              this.lastProcessedTimestamp = now;

              handleCallUserSpeech(textToSend);
            }
          }, 1100);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("SpeechRecognition error:", event.error);
        if (event.error === 'not-allowed') {
          showToast("Acesso ao microfone necessário para a ligação.");
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Se a chamada ainda estiver ativa e não mutada, reinicia sem quebrar a sessão
        if (this.isCalling && !appState.isMuted) {
          try {
            this.recognition.start();
          } catch (e) {}
        } else {
          updateCallUIListeningState(false);
        }
      };

      return true;
    } catch (e) {
      console.warn("Erro ao instanciar SpeechRecognition:", e);
      return false;
    }
  },

  async start(modalType) {
    this.isCalling = true;
    this.activeModalType = modalType;
    this.isSpeaking = false;

    // 1. Manter stream de microfone ativo em segundo plano durante toda a chamada.
    // Isso garante que o navegador (Chrome/Edge) peça permissão apenas UMA vez no início da ligação!
    try {
      if (!this.audioStream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err) {
      console.warn("Permissão de áudio via getUserMedia não obtida ou cancelada:", err);
    }

    // 2. Iniciar o reconhecimento de fala contínuo
    if (!this.recognition) this.init();
    if (this.recognition && !appState.isMuted) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
  },

  pause() {
    // IMPORTANTE: NÃO chamar this.recognition.stop() aqui!
    // Parar o recognition encerrava a sessão de gravação, fazendo o Chrome/Edge pedir permissão toda vez que a IA respondia.
    // Apenas marcamos que o sistema está falando e não captando neste momento.
    this.isListening = false;
    updateCallUIListeningState(false);
  },

  resume() {
    this.isSpeaking = false;
    if (this.isCalling && !appState.isMuted) {
      this.isListening = true;
      updateCallUIListeningState(true);
      // Se por inatividade o navegador encerrou o recognition, religa suavemente
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {}
      }
    }
  },

  stop() {
    this.isCalling = false;
    this.isSpeaking = false;
    this.activeModalType = null;
    clearTimeout(this.userSpeechTimeout);

    // Parar o reconhecimento somente no término REAL da ligação (quando clica em desligar)
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    // Liberar o hardware do microfone
    if (this.audioStream) {
      try {
        this.audioStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      this.audioStream = null;
    }

    this.isListening = false;
    updateCallUIListeningState(false);
  }
};

function updateCallUIListeningState(isListening) {
  const callStateLabel = document.getElementById('callStateLabel');
  const videoStatusLabel = document.getElementById('videoStatusLabel');
  const callSpeakerHeader = document.getElementById('callSpeakerHeader');

  if (CallSpeechManager.isSpeaking) {
    if (callStateLabel) callStateLabel.innerText = "🔊 Falando com você...";
    if (videoStatusLabel) videoStatusLabel.innerText = "🔊 Falando com você...";
    if (callSpeakerHeader) callSpeakerHeader.innerText = "🔊 Falando agora...";
    return;
  }

  if (isListening) {
    if (callStateLabel) callStateLabel.innerText = "🎙️ Ouvindo você... fale com tranquilidade";
    if (videoStatusLabel) videoStatusLabel.innerText = "🎙️ Te ouvindo ao vivo... pode falar";
    if (callSpeakerHeader) callSpeakerHeader.innerText = "🎙️ Microfone Ativo";
  } else {
    if (callStateLabel) callStateLabel.innerText = "🔇 Microfone Pausado";
    if (videoStatusLabel) videoStatusLabel.innerText = "🔇 Microfone Pausado";
    if (callSpeakerHeader) callSpeakerHeader.innerText = "🔇 Pausado";
  }
}

function updateUserSpeechDisplay(text) {
  const voiceUserText = document.getElementById('callUserSpeechText');
  const videoUserText = document.getElementById('videoUserSpeechText');
  if (voiceUserText) voiceUserText.innerText = text;
  if (videoUserText) videoUserText.innerText = `Você: "${text}"`;
}

/**
 * PROCESSA A FALA DO USUÁRIO NA CHAMADA E GERA A RESPOSTA
 */
async function handleCallUserSpeech(userSpeech) {
  if (!userSpeech || !userSpeech.trim()) return;

  CallSpeechManager.isSpeaking = true;
  CallSpeechManager.pause();

  const callStateLabel = document.getElementById('callStateLabel');
  const videoStatusLabel = document.getElementById('videoStatusLabel');
  if (callStateLabel) callStateLabel.innerText = "💭 Pensando...";
  if (videoStatusLabel) videoStatusLabel.innerText = "💭 Pensando...";

  const persona = appState.selectedPersona;
  const channel = CHANNELS_CONFIG[persona] || CHANNELS_CONFIG['maria'];
  const lower = userSpeech.toLowerCase();

  // Se o usuário pedir viatura / polícia / socorro na chamada, despachar viatura
  if (lower.includes('policia') || lower.includes('polícia') || lower.includes('viatura') || lower.includes('socorro') || lower.includes('perigo') || lower.includes('localização') || lower.includes('localizacao')) {
    simulateEmergencyDispatch('PM');
  }

  appState.callDialogueHistory = appState.callDialogueHistory || [];
  appState.callDialogueHistory.push({ role: "user", text: userSpeech });

  let responseSpeech = "";

  // 1. Chamar API Gemini com histórico conversacional da chamada
  if (API_CONFIG.useExternalAPI) {
    try {
      const callPromptSystem = `
VOCÊ ESTÁ ATENDENDO UMA LIGAÇÃO DE VOZ OU VÍDEO CHAMADA EM TEMPO REAL.
SEU PAPEL: ${persona === 'lumi' || persona === 'joao' ? 'Lumi, um interlocutor de confiança formal, educado, sereno e protetor' : persona === 'soli' || persona === 'maria' ? 'Soli, uma interlocutora de confiança formal, educada, serena e acolhedora' : 'Atendente oficial de emergência do canal ' + channel.name}.
ENDEREÇO GPS DO USUÁRIO: ${userLocation.fullAddress}.

DIRETRIZES FUNDAMENTAIS PARA CONVERSAÇÃO FALADA NA CHAMADA:
- Adote tom ESTRITAMENTE FORMAL, POLIDO, RESPEITOSO E ACOLHEDOR.
- NUNCA utilize gírias ("parceira", "mano", "salve", "tô ligado", "tá pegando", "tô na escuta", "manda a letra", "rolê", "beleza", "bater papo", "tô", "tá").
- Formule de 1 a 2 frases curtas, claras e gramaticalmente corretas para a síntese de voz.
- Se a conversa for casual ou cotidiana: responda com cortesia, educação e formalidade ("Olá, tudo bem? Estou à disposição", "Compreendo perfeitamente, será uma satisfação nos encontrarmos"). NUNCA assuma que é um perigo se o usuário só está conversando amigavelmente!
- Se o usuário perguntar se você está ouvindo: confirme com clareza e formalidade ("Sim, estou ouvindo você perfeitamente e com clareza. Pode falar com tranquilidade.").
- Se a pessoa relatar violência, abuso ou pedir socorro: acolha com respeito e firmeza formal, assegure que a culpa não é da vítima e informe que o apoio policial (190) foi acionado para o endereço ${userLocation.fullAddress}.
- NUNCA use emojis, asteriscos (*), tópicos, cabeçalhos ou formatação escrita, porque essa resposta será falada em voz alta pelo sintetizador de voz.
- Fale sempre em Português do Brasil culto, formal, correto e acolhedor.
`;

      const contents = [];
      const history = (appState.callDialogueHistory || []).slice(-6);
      for (const turn of history) {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      }

      responseSpeech = await requestGeminiText(contents, callPromptSystem, 400);
    } catch (err) {
      console.warn("Erro ao consultar Gemini em chamada:", err);
    }
  }

  // 2. Se a API não respondeu, usar fallback inteligente contextual anti-repetição
  if (!responseSpeech) {
    responseSpeech = generateCallFallbackResponse(userSpeech, persona);
  }

  // Registrar no histórico da chamada
  appState.callDialogueHistory.push({ role: "model", text: responseSpeech });

  // 3. Falar a resposta
  speakCallResponse(responseSpeech, persona);
}

function generateCallFallbackResponse(rawText, persona) {
  const text = rawText.toLowerCase().trim();

  // === 1. SOLI (VOZ / VÍDEO - APOIO FORMAL E HUMANIZADO) ===
  if (persona === 'soli' || persona === 'maria') {
    // 1. Cumprimentos e Saudações (Prioridade Máxima)
    const isGreeting = (
      text === 'oi' || text === 'ola' || text === 'olá' || text === 'alo' || text === 'alô' ||
      text === 'oii' || text === 'oiii' || text === 'ei' || text === 'e ai' || text === 'e aí' ||
      text === 'fala' || text === 'opa' || text.startsWith('oi ') || text.startsWith('olá ') ||
      text.startsWith('ola ') || text.startsWith('alô ') || text.startsWith('bom dia') ||
      text.startsWith('boa tarde') || text.startsWith('boa noite') || text.includes('saudações')
    );
    if (isGreeting) {
      const greetList = [
        "Olá! Tudo bem com você? Estou aqui na linha ouvindo perfeitamente. Como tem sido o seu dia?",
        "Olá! É uma satisfação falar com você. Estou bem e à sua total disposição. Em que posso ser útil ou sobre o que gostaria de dialogar?",
        "Olá! Que alegria falar com você. Pode falar com serenidade, estou acompanhando com atenção."
      ];
      return responseMemory.pick('maria_call_greet', greetList);
    }

    // 2. Bem-estar & "Tudo bem" / "Como você está"
    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como você está') || text.includes('como vai') || text.includes('como você tá') || text.includes('como cê tá') || text.includes('tudo certo') || text.includes('tudo em ordem')) {
      const fineList = [
        "Tudo ótimo por aqui, muito obrigada pela gentileza de perguntar! E com você, como estão as coisas hoje? Espero que esteja tendo um dia agradável.",
        "Tudo em perfeita paz por aqui. É sempre muito reconfortante falar com você. Como você está se sentindo hoje? Fique à vontade para me contar.",
        "Por aqui tudo corre muito bem, agradeço a consideração. Me conte: como tem sido a sua semana? Tem alguma novidade?"
      ];
      return responseMemory.pick('maria_call_fine', fineList);
    }

    // 3. Dúvida de áudio / escuta na chamada
    if (text.includes('me ouvindo') || text.includes('consegue me ouvir') || text.includes('me escuta') || text.includes('falando') || text.includes('está aí') || text.includes('tá aí') || text.includes('som som')) {
      const audList = [
        "Sim, estou ouvindo você perfeitamente e com áudio límpido. Pode falar com tranquilidade.",
        "Estou escutando com ótima qualidade. Por favor, sinta-se à vontade para relatar.",
        "Sim, a transmissão está excelente. Estou na linha acompanhando com atenção."
      ];
      return responseMemory.pick('maria_call_aud', audList);
    }

    // 3. Reclamação / Dúvida se ouviu
    if (text.includes('não ouviu') || text.includes('nao ouviu') || text.includes('não me ouviu') || text.includes('nao me ouviu') || text.includes('não entendeu') || text.includes('nao entendeu') || text.includes('repetindo') || text.includes('mesma coisa') || text.includes('não tá prestando') || text.includes('nao ta prestando') || text.includes('falando que tá') || text.includes('falei pra gente') || text.includes('tô te chamando') || text.includes('to te chamando') || text.includes('me escuta direito')) {
      const mariaReclamList = [
        "Peço sinceras desculpas pelo equívoco momentâneo. Compreendi perfeitamente sua colocação sobre o convite para sairmos e passearmos. Aceito com satisfação, onde você gostaria de ir?",
        "Peço escusas por qualquer falha de atenção anterior. Estou com foco absoluto em suas palavras. Por favor, prossiga e vamos combinar os detalhes.",
        "Compreendo sua observação e peço desculpas pela resposta anterior. Estou acompanhando com atenção e pronta para combinarmos o encontro. O que você sugere?"
      ];
      return responseMemory.pick('maria_call_reclam', mariaReclamList);
    }

    // 4. Convite para sair / encontrar / passear
    if (text.includes('sair') || text.includes('vamos dar uma volta') || text.includes('bora sair') || text.includes('chamando pra sair') || text.includes('chamei pra sair') || text.includes('chamei você') || text.includes('chamei a soli') || text.includes('chamei a maria') || text.includes('rolê') || text.includes('role') || text.includes('dar um role') || text.includes('dar um rolê') || text.includes('passear') || text.includes('shopping') || text.includes('cinema') || text.includes('se encontrar') || text.includes('se ver') || text.includes('te ver') || text.includes('dar uma volta') || text.includes('espairecer') || text.includes('bater perna')) {
      const mariaSairList = [
        "Agradeço muito pelo convite, aceito com satisfação. Seria excelente reservarmos um momento para conversar e espairecer. Onde e em qual horário você prefere?",
        "Com certeza, será uma satisfação nos encontrarmos. Você gostaria de ir ao shopping, a uma cafeteria ou a outro local de sua preferência?",
        "Excelente iniciativa. Gostaria muito de encontrar você. Por favor, indique suas preferências de horário e local para nos organizarmos.",
        "Apoio plenamente a ideia. Um momento de diálogo e convivência é sempre revigorante. Quais são os seus planos para a ocasião?"
      ];
      return responseMemory.pick('maria_call_sair', mariaSairList);
    }

    // 5. Comida / Lanche / Restaurante
    if (text.includes('comer') || text.includes('fome') || text.includes('lanche') || text.includes('hambúrguer') || text.includes('hamburguer') || text.includes('pizza') || text.includes('açaí') || text.includes('acai') || text.includes('café') || text.includes('cafe') || text.includes('docinho') || text.includes('almoçar') || text.includes('almocar') || text.includes('jantar')) {
      const mariaFoodList = [
        "É uma excelente ideia. Fazer uma boa refeição e conversar é sempre reconfortante. Qual tipo de culinária ou restaurante você gostaria de visitar?",
        "Concordo plenamente. Podemos tomar um café ou fazer uma refeição agradável. Qual estabelecimento você prefere?",
        "Excelente sugestão. Uma boa conversa acompanhada de uma refeição é sempre bem-vinda. O que você gostaria de comer hoje?"
      ];
      return responseMemory.pick('maria_call_food', mariaFoodList);
    }

    // 6. Tédio / "Sem nada para fazer"
    if (text.includes('tédio') || text.includes('tedio') || text.includes('entediad') || text.includes('à toa') || text.includes('a toa') || text.includes('sem nada pra fazer') || text.includes('de bobeira') || text.includes('nada pra fazer')) {
      const mariaTedioList = [
        "Compreendo perfeitamente. Momentos mais tranquilos são uma boa oportunidade para dialogar e planejar atividades. Gostaria de sugerir algum plano?",
        "O diálogo é uma excelente forma de tornar o dia mais proveitoso. Compartilhe comigo alguma novidade ou, se desejar, podemos planejar uma atividade."
      ];
      return responseMemory.pick('maria_call_tedio', mariaTedioList);
    }

    // 7. Casa / Visita
    if (text.includes('minha casa') || text.includes('sua casa') || text.includes('aqui em casa') || text.includes('vem aqui') || text.includes('ir aí') || text.includes('ir ai') || text.includes('posso ir') || text.includes('quer vir')) {
      const mariaCasaList = [
        "Com certeza. Se for conveniente, posso me deslocar até sua residência para conversarmos com total tranquilidade.",
        "Sinta-se convidada(o) a vir até minha residência. Podemos assistir a um filme e conversar com conforto."
      ];
      return responseMemory.pick('maria_call_casa', mariaCasaList);
    }

    // 8. Risada / Humor
    if (text.includes('kkk') || text.includes('haha') || text.includes('rsrs') || text.includes('engraçad') || text.includes('engracad') || text.includes('rindo')) {
      const mariaLaughList = [
        "Fico muito satisfeita em presenciar seu bom humor. É sempre muito positivo compartilhar momentos de leveza e alegria.",
        "É reconfortante compartilhar momentos alegres. O bom humor traz serenidade e bem-estar ao nosso dia."
      ];
      return responseMemory.pick('maria_call_laugh', mariaLaughList);
    }

    // 9. Saudades / Carinho
    if (text.includes('saudade') || text.includes('saudades') || text.includes('te amo') || text.includes('gosto de você') || text.includes('gosto muito')) {
      const mariaLoveList = [
        "Agradeço sinceramente pelas palavras gentis e pelo carinho. É recíproca a consideração e a estima que tenho por você.",
        "Muito obrigada pela estima. É sempre muito gratificante mantermos este canal de comunicação e confiança mútuos."
      ];
      return responseMemory.pick('maria_call_love', mariaLoveList);
    }

    // 10. Emergência policial / socorro / viatura
    if (text.includes('socorro') || text.includes('perigo') || text.includes('viatura') || text.includes('policia') || text.includes('polícia')) {
      return "Por favor, mantenha a calma e permaneça em local seguro. Já estamos providenciando o acionamento do 190 e a viatura policial está sendo direcionada para as suas coordenadas.";
    }

    // 11. Abuso / agressão
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('me bateu') || text.includes('atacou') || text.includes('agarrou')) {
      return "Por favor, respire pausadamente. Você não tem culpa alguma sobre esse fato. A Polícia Militar foi acionada e permanecerei na linha até você estar em total segurança.";
    }

    // 12. Perigo na rua / stalker
    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('suspeito')) {
      return "Por favor, não pare de caminhar. Dirija-se imediatamente a um estabelecimento comercial iluminado e permaneça próxima aos funcionários. Estou acompanhando você na linha.";
    }

    // 13. Medo / Pânico / Ansiedade
    if (text.includes('medo') || text.includes('pânico') || text.includes('panico') || text.includes('ansied') || text.includes('tremend') || text.includes('falta de ar')) {
      return "Mantenha a calma, estou aqui para lhe apoiar. Inspire lentamente pelo nariz e expire devagar pela boca. Por favor, informe sua localização exata para lhe auxiliarmos.";
    }

    // 14. Sim / Confirmação
    if (text === 'sim' || text === 'aham' || text === 'isso' || text === 'é isso' || text === 'tá bom' || text === 'ta bom' || text === 'claro') {
      const yesList = [
        "Compreendi perfeitamente. E quais são as providências que você gostaria de adotar agora? Estou à sua disposição.",
        "Certo, estou acompanhando seu raciocínio. Por favor, continue relatando com calma.",
        "Entendido. Pode prosseguir com o que deseja falar, estou atenta."
      ];
      return responseMemory.pick('maria_call_yes', yesList);
    }

    // 15. Não / Incerteza
    if (text === 'não' || text === 'nao' || text.includes('não sei') || text.includes('nao sei') || text.includes('nem sei')) {
      const noList = [
        "Fique em paz, não há necessidade de pressa. Podemos avaliar as alternativas com calma e serenidade.",
        "Compreendo perfeitamente. O importante é você saber que conta com apoio seguro a qualquer instante.",
        "Tudo bem, prossiga no seu próprio ritmo. Estou à sua disposição para o que for necessário."
      ];
      return responseMemory.pick('maria_call_no', noList);
    }

    // 18. Onde você tá / o que tá fazendo
    if (text.includes('onde você tá') || text.includes('onde ce ta') || text.includes('onde cê tá') || text.includes('fazendo o que') || text.includes('tá livre') || text.includes('tá ocupada') || text.includes('sua rotina')) {
      return "Estou em minha residência no momento, organizando minhas atividades e com total disponibilidade para nós conversarmos. E você, o que está fazendo de bom?";
    }

    // 19. Trabalho / Estudos / Cansaço / Dia corrido
    if (text.includes('trabalh') || text.includes('estud') || text.includes('faculdade') || text.includes('escola') || text.includes('prova') || text.includes('cansad') || text.includes('dia corrido') || text.includes('sono') || text.includes('preguiça') || text.includes('rotina')) {
      return "Compreendo muito bem. A rotina profissional e de estudos costuma exigir bastante dedicação e energia. É fundamental desacelerar um pouco. Como você está se sentindo agora?";
    }

    // 20. Opinião / Sugestão / "O que você acha"
    if (text.includes('o que você acha') || text.includes('o que acha') || text.includes('qual sua opinião') || text.includes('concorda') || text.includes('acha uma boa') || text.includes('o que me diz') || text.includes('o que sugere')) {
      return "Considero uma excelente reflexão. Acredito que, avaliando as opções com calma e serenidade, você tomará a melhor decisão. Quais caminhos você tem em mente?";
    }

    // 21. Tempo / Clima / Novidades / Conversa casual
    if (text.includes('tempo') || text.includes('clima') || text.includes('chuva') || text.includes('calor') || text.includes('frio') || text.includes('novidade') || text.includes('bater papo') || text.includes('vamos conversar') || text.includes('me conta')) {
      return "Por aqui o ambiente está muito agradável e o dia segue sereno. É sempre muito estimulante conversar com você. Me conte: quais são as novidades de hoje?";
    }

    // 22. Hobbies / Cultura / Música / Filmes
    if (text.includes('música') || text.includes('musica') || text.includes('filme') || text.includes('série') || text.includes('serie') || text.includes('livro') || text.includes('ler') || text.includes('hobby') || text.includes('gosta de')) {
      return "Aprecio muito uma boa leitura, músicas suaves e bons filmes que nos inspiram reflexão. E quais são as suas preferências culturais ou o que você tem acompanhado ultimamente?";
    }

    // 23. Agradecimento
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('obrigada')) {
      return "Não há de quê! É uma honra e uma satisfação poder lhe oferecer apoio e companhia. Conte sempre com minha dedicação e respeito.";
    }

    // 24. Despedida
    if (text.includes('tchau') || text.includes('desligar') || text.includes('vou desligar') || text.includes('depois falo') || text.includes('até mais') || text.includes('ate mais')) {
      return "Perfeito. Cuide-se com atenção e permaneça em segurança. Se precisar de qualquer orientação adicional, sinta-se à vontade para ligar novamente. Até breve!";
    }

    // 25. Ruído inaudível real (apenas se for interjeição vazia como 'hã', 'ahn', sem palavras com sentido)
    if (text === 'hã' || text === 'ha' || text === 'ahn' || text === 'hum' || (cleanNoPunct.length === 0 && text.length > 0)) {
      return "Com licença, não consegui escutar com nitidez o que você disse. Você se importaria de falar novamente, por gentileza?";
    }

    // 26. Conversa Geral Humanizada (reflexiva e acolhedora)
    const genList = [
      "Compreendo perfeitamente sua colocação e acho muito interessante essa reflexão. O que mais você gostaria de comentar a respeito?",
      "Faz muito sentido o que você apontou. É sempre muito enriquecedor conversar com você; me conte mais sobre como você enxerga essa questão.",
      "Entendo sua perspectiva e valorizo muito sua consideração. Como você está planejando conduzir essa situação?",
      "Concordo com os pontos que você destacou. Ter essa oportunidade de conversarmos com calma é muito agradável. Fique à vontade para aprofundar suas impressões."
    ];
    return responseMemory.pick('maria_call_gen', genList);
  }

  // === 2. LUMI (VOZ / VÍDEO - APOIO FORMAL, PROTETOR E HUMANIZADO) ===
  if (persona === 'lumi' || persona === 'joao') {
    // 1. Cumprimentos e Saudações (Prioridade Máxima)
    const isGreeting = (
      text === 'oi' || text === 'ola' || text === 'olá' || text === 'alo' || text === 'alô' ||
      text === 'oii' || text === 'oiii' || text === 'ei' || text === 'e ai' || text === 'e aí' ||
      text === 'fala' || text === 'opa' || text.startsWith('oi ') || text.startsWith('olá ') ||
      text.startsWith('ola ') || text.startsWith('alô ') || text.startsWith('bom dia') ||
      text.startsWith('boa tarde') || text.startsWith('boa noite') || text.includes('saudações')
    );
    if (isGreeting) {
      const greetList = [
        "Olá! Tudo bem com você? É uma satisfação atender ao seu contato. Como tem passado?",
        "Olá! Estou na linha com áudio nítido e à sua inteira disposição. Como estão as coisas com você hoje?",
        "Olá! Que satisfação falar contigo. Estou pronto para conversar com atenção e respeito. O que você gostaria de compartilhar?"
      ];
      return responseMemory.pick('joao_call_greet', greetList);
    }

    // 2. Bem-estar & "Tudo bem" / "Como você está"
    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como você está') || text.includes('como vai') || text.includes('como você tá') || text.includes('como cê tá') || text.includes('tudo certo') || text.includes('tudo em ordem')) {
      const fineList = [
        "Tudo excelente por aqui, muito obrigado pela gentileza de perguntar! E com você, como estão as coisas hoje? Está tudo correndo em paz?",
        "Tudo em perfeita ordem por aqui, graças a Deus. Como você está se sentindo? Fique inteiramente à vontade para me contar.",
        "Por aqui tudo muito bem e produtivo. Fico grato pelo contato. Como tem sido a sua rotina recentemente?"
      ];
      return responseMemory.pick('joao_call_fine', fineList);
    }

    // 3. Dúvida de áudio / escuta na chamada
    if (text.includes('me ouvindo') || text.includes('consegue me ouvir') || text.includes('me escuta') || text.includes('falando') || text.includes('está aí') || text.includes('tá aí') || text.includes('som som')) {
      const audList = [
        "Sim, estou ouvindo você perfeitamente e com áudio cristalino. Pode falar com tranquilidade.",
        "O áudio está ótimo por aqui. Estou com foco pleno em suas palavras, sinta-se confortável para falar.",
        "Sim, confirmo que o som está límpido. Estou na linha acompanhando cada colocação sua."
      ];
      return responseMemory.pick('joao_call_aud', audList);
    }

    // 4. Convite para sair / encontrar / passear / café / shopping
    if (text.includes('sair') || text.includes('vamos dar uma volta') || text.includes('bora sair') || text.includes('chamando pra sair') || text.includes('chamei pra sair') || text.includes('chamei você') || text.includes('chamei o lumi') || text.includes('chamei o joao') || text.includes('passear') || text.includes('shopping') || text.includes('cinema') || text.includes('se encontrar') || text.includes('se ver') || text.includes('te ver') || text.includes('espairecer') || text.includes('dar uma volta')) {
      const joaoSairList = [
        "Agradeço muito pelo convite, aceito com satisfação! Uma pausa para conversarmos e tomarmos um café sempre faz muito bem. Qual local e horário seriam mais convenientes para você?",
        "Com certeza, concordo plenamente! Podemos nos encontrar para uma refeição, uma ida ao shopping ou uma caminhada tranquila. O que você prefere?",
        "Excelente iniciativa! Gostaria muito de encontrar você. Por favor, indique onde e em qual horário podemos marcar nosso encontro."
      ];
      return responseMemory.pick('joao_call_sair', joaoSairList);
    }

    // 5. Comida / Restaurante / Lanche / Café / Almoço
    if (text.includes('comer') || text.includes('fome') || text.includes('lanche') || text.includes('hambúrguer') || text.includes('hamburguer') || text.includes('pizza') || text.includes('açaí') || text.includes('acai') || text.includes('café') || text.includes('cafe') || text.includes('docinho') || text.includes('almoçar') || text.includes('almocar') || text.includes('jantar')) {
      const joaoFoodList = [
        "É uma excelente ideia! Fazer uma boa refeição acompanhada de um diálogo agradável é sempre muito proveitoso. Qual tipo de culinária ou restaurante você prefere para a ocasião?",
        "Concordo plenamente. Podemos tomar um café ou fazer uma refeição agradável. Você conhece algum estabelecimento de sua preferência?"
      ];
      return responseMemory.pick('joao_call_food', joaoFoodList);
    }

    // 6. Onde você tá / Rotina / O que está fazendo
    if (text.includes('onde você tá') || text.includes('onde ce ta') || text.includes('onde cê tá') || text.includes('fazendo o que') || text.includes('tá fazendo') || text.includes('tá em casa') || text.includes('tá livre') || text.includes('tá ocupado') || text.includes('sua rotina')) {
      return "Estou em minha residência no momento, adiantando algumas leituras e tarefas cotidianas, mas com total disponibilidade para conversarmos. E por aí, o que você tem feito de bom?";
    }

    // 7. Trabalho / Estudos / Cansaço / Dia intenso
    if (text.includes('trabalh') || text.includes('estud') || text.includes('faculdade') || text.includes('escola') || text.includes('prova') || text.includes('cansad') || text.includes('dia corrido') || text.includes('sono') || text.includes('preguiça') || text.includes('rotina')) {
      return "Compreendo perfeitamente. A rotina profissional e acadêmica frequentemente exige muito foco e resiliência. O importante é saber dosar o esforço e descansar adequadamente. Como você está se sentindo agora?";
    }

    // 8. Opinião / Sugestão / "O que você acha"
    if (text.includes('o que você acha') || text.includes('o que acha') || text.includes('qual sua opinião') || text.includes('concorda') || text.includes('acha uma boa') || text.includes('o que me diz') || text.includes('o que sugere')) {
      return "Acho uma ponderação muito pertinente e sensata. Analisar os prós e contras com calma nos proporciona maior segurança em qualquer decisão. Qual alternativa mais agrada a você neste momento?";
    }

    // 9. Tempo / Clima / Novidades / Conversa casual
    if (text.includes('tempo') || text.includes('clima') || text.includes('chuva') || text.includes('calor') || text.includes('frio') || text.includes('novidade') || text.includes('bater papo') || text.includes('vamos conversar') || text.includes('me conta')) {
      return "Por aqui o dia segue com ritmo sereno e produtivo. Manter um diálogo agradável é uma das partes mais valorosas do cotidiano. O que você gostaria de comentar ou debater hoje?";
    }

    // 10. Hobbies / Esporte / Livros / Música / Filmes
    if (text.includes('música') || text.includes('musica') || text.includes('filme') || text.includes('série') || text.includes('serie') || text.includes('livro') || text.includes('ler') || text.includes('esporte') || text.includes('futebol') || text.includes('academia') || text.includes('treino') || text.includes('gosta de')) {
      return "Gosto muito de leituras sobre desenvolvimento pessoal, esportes e filmes com enredos bem estruturados. E você, qual atividade ou entretenimento tem apreciado ultimamente?";
    }

    // 11. Confirmação / "Sim" / "Concordo" / "Verdade" / "Perfeito"
    if (text === 'sim' || text === 'claro' || text === 'com certeza' || text === 'verdade' || text === 'exatamente' || text === 'concordo' || text === 'perfeito' || text === 'entendi' || text === 'legal' || text === 'bacana' || text === 'show' || text === 'ótimo' || text === 'otimo') {
      const yesList = [
        "Perfeito! Fico satisfeito que concordemos nesse ponto. É sempre muito construtivo alinhar pensamentos com você. Qual seria o próximo passo?",
        "Com certeza, estamos em pleno alinhamento. Esse consenso torna o diálogo muito enriquecedor. Sinta-se à vontade para prosseguir com suas colocações."
      ];
      return responseMemory.pick('joao_call_yes', yesList);
    }

    // 12. Saudades / Carinho
    if (text.includes('saudade') || text.includes('saudades') || text.includes('te amo') || text.includes('gosto de você') || text.includes('gosto muito')) {
      return "Agradeço sinceramente pelas palavras gentis e pela estima. É recíproco o respeito, a amizade e a consideração que tenho por nossa convivência.";
    }

    // 13. Emergência policial / socorro / viatura
    if (text.includes('socorro') || text.includes('perigo') || text.includes('viatura') || text.includes('policia') || text.includes('polícia')) {
      return "Mantenha a calma e permaneça em local seguro. A viatura policial do 190 foi acionada para suas coordenadas e estou na linha com você.";
    }

    // 14. Abuso / agressão
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('me bateu') || text.includes('atacou')) {
      return "Mantenha a calma e respire pausadamente. Você não tem culpa alguma sobre esse fato lamentável. A Polícia Militar foi acionada com prioridade e permanecerei na linha até você estar em segurança.";
    }

    // 15. Perigo na rua / stalker
    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('suspeito')) {
      return "Mantenha o passo firme. Entre imediatamente no primeiro estabelecimento comercial ou local movimentado e informe suas coordenadas para acionarmos o 190.";
    }

    // 16. Medo / Pânico / Ansiedade
    if (text.includes('medo') || text.includes('pânico') || text.includes('panico') || text.includes('ansied') || text.includes('tremend')) {
      return "Mantenha a calma e respire pausadamente. Estou acompanhando você e garantiremos sua segurança. Informe onde você se encontra exatamente.";
    }

    // 17. Reclamação / Dúvida se ouviu
    if (text.includes('não ouviu') || text.includes('nao ouviu') || text.includes('não me ouviu') || text.includes('nao me ouviu') || text.includes('não entendeu') || text.includes('nao entendeu') || text.includes('repetindo') || text.includes('mesma coisa') || text.includes('não tá prestando') || text.includes('nao ta prestando') || text.includes('falando que tá') || text.includes('falei pra gente') || text.includes('tô te chamando') || text.includes('to te chamando') || text.includes('escuta direito') || text.includes('você é burro')) {
      return "Peço escusas pelo equívoco anterior. Você tem toda razão e meu foco está inteiramente em suas palavras. Por favor, continue, estou ouvindo com máxima clareza.";
    }

    // 18. Agradecimento
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('agradeço')) {
      return "Não há de quê! É uma honra poder lhe oferecer apoio e companhia. Conte sempre com meu compromisso e consideração.";
    }

    // 19. Despedida
    if (text.includes('tchau') || text.includes('desligar') || text.includes('vou desligar') || text.includes('depois falo') || text.includes('até mais') || text.includes('ate mais')) {
      return "Perfeito. Cuide-se com atenção e permaneça em segurança. Se precisar de qualquer orientação adicional, estou à disposição. Tenha um excelente descanso!";
    }

    // 20. Ruído inaudível real (apenas se for interjeição vazia como 'hã', 'ahn', sem palavras com sentido)
    if (text === 'hã' || text === 'ha' || text === 'ahn' || text === 'hum' || (cleanNoPunct.length === 0 && text.length > 0)) {
      return "Desculpe-me, não ouvi com nitidez o que você disse. Poderia repetir para que eu possa lhe acompanhar, por gentileza?";
    }

    // 21. Genérico do João (humanizado, reflexivo e seguro)
    const genList = [
      "Compreendo com clareza a sua consideração e considero muito válida essa reflexão. Como você avalia os próximos passos sobre essa questão?",
      "É um ponto de vista muito sensato e bem ponderado. Dialogar com você é sempre bastante construtivo. O que mais você tem em mente sobre o assunto?",
      "Entendi com precisão sua colocação. Faz todo sentido sob essa ótica. Fique inteiramente à vontade para aprofundar suas reflexões.",
      "Concordo com suas ponderações. É uma satisfação acompanhar seus pensamentos e dialogar com serenidade. Gostaria de acrescentar mais algum detalhe?"
    ];
    return responseMemory.pick('joao_call_gen', genList);
  }

  if (persona === '190') {
    if (text.includes('socorro') || text.includes('perigo') || text.includes('assalto') || text.includes('arma') || text.includes('seguindo')) {
      return "Polícia Militar COPOM. Mantenha-se abrigada em local iluminado, a viatura do setor foi acionada em código prioritário.";
    }
    return "Polícia Militar 190. Prossiga com o relato e informe seu ponto de referência exato.";
  }

  if (persona === '192') {
    if (text.includes('dor') || text.includes('sangue') || text.includes('desmai') || text.includes('ferid') || text.includes('ambulancia')) {
      return "Central SAMU 192. Mantenha a vítima em decúbito e respire pausadamente. Equipe médica em triagem para envio de ambulância.";
    }
    return "Central SAMU 192. Descreva os sintomas e estado de consciência da pessoa para regulação médica.";
  }

  if (persona === '180') {
    return "Central 180, acolhimento oficial à mulher. Seu atendimento é sigiloso, estamos à disposição para prestar suporte e orientação legal.";
  }

  return "Atendimento oficial de suporte. Estamos na linha te ouvindo com total sigilo, pode relatar.";
}

/**
 * FALA A RESPOSTA EM VOZ ALTA E SINCRONIZA ANIMAÇÕES
 */
function speakCallResponse(text, personaId) {
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/[\*\_]/g, '').trim();
  setCallTranscript(clean);
  setVideoSubtitles(clean);

  if (!('speechSynthesis' in window)) {
    CallSpeechManager.isSpeaking = false;
    CallSpeechManager.resume();
    return;
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = 'pt-BR';

  const voices = window.speechSynthesis.getVoices();
  const ptVoices = voices.filter(v => v.lang.startsWith('pt') || v.lang.includes('BR'));

  if (personaId === 'maria') {
    const female = ptVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('maria') || n.includes('female') || n.includes('luciana') || n.includes('helena') || n.includes('zira') || n.includes('leticia');
    });
    if (female) utter.voice = female;
    else if (ptVoices[0]) utter.voice = ptVoices[0];
    utter.pitch = 1.15;
    utter.rate = 1.0;
  } else if (personaId === 'joao') {
    const male = ptVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('joao') || n.includes('male') || n.includes('felipe') || n.includes('antonio') || n.includes('daniel') || n.includes('ricardo');
    });
    if (male) utter.voice = male;
    else if (ptVoices[0]) utter.voice = ptVoices[0];
    utter.pitch = 0.88;
    utter.rate = 0.98;
  } else {
    if (ptVoices[0]) utter.voice = ptVoices[0];
    utter.pitch = 1.0;
    utter.rate = 1.0;
  }

  // Animação de fala no avatar / aura
  const rings = document.getElementById('soundWaveAnimation');
  const aura = document.getElementById('videoPresenceAura');
  if (rings) rings.classList.add('active-speaking');
  if (aura) aura.classList.add('is-speaking');
  CallSpeechManager.isSpeaking = true;
  updateCallUIListeningState(false);

  utter.onend = () => {
    if (rings) rings.classList.remove('active-speaking');
    if (aura) aura.classList.remove('is-speaking');
    setTimeout(() => {
      CallSpeechManager.isSpeaking = false;
      CallSpeechManager.resume();
    }, 450);
  };

  utter.onerror = () => {
    if (rings) rings.classList.remove('active-speaking');
    if (aura) aura.classList.remove('is-speaking');
    setTimeout(() => {
      CallSpeechManager.isSpeaking = false;
      CallSpeechManager.resume();
    }, 300);
  };

  window.speechSynthesis.speak(utter);
}

function handleCallSilentSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('callSilentInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  input.value = '';
  updateUserSpeechDisplay(val);
  handleCallUserSpeech(val);
}

function handleVideoSilentSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('videoSilentInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  input.value = '';
  updateUserSpeechDisplay(val);
  handleCallUserSpeech(val);
}

/* ==========================================================================
   MODAIS DE LIGAÇÃO DE VOZ E VÍDEO CHAMADA
   ========================================================================== */
function openVoiceCallModal() {
  const modal = document.getElementById('voiceCallModal');
  if (modal) modal.style.display = 'flex';

  appState.callSeconds = 0;
  appState.callDialogueHistory = [];
  startCallTimer('callDurationTimer');

  const persona = appState.selectedPersona;
  let welcomeSpeech = "";

  if (persona === 'maria') {
    const mariaGreetings = [
      "Olá, bom momento. Estou ouvindo com total atenção. Como posso lhe auxiliar agora?",
      "Olá, ligação estabelecida com sigilo. Pode falar com tranquilidade, estou à sua disposição.",
      "Olá. Estou ouvindo perfeitamente. Por favor, relate o que está acontecendo.",
      "Olá, compreendo sua presença aqui. Pode relatar sua situação com serenidade, estou ouvindo com respeito."
    ];
    welcomeSpeech = responseMemory.pick('call_welcome_maria', mariaGreetings);
  } else if (persona === 'joao') {
    const joaoGreetings = [
      "Olá, estou à sua disposição. Pode falar com tranquilidade, estou ouvindo com clareza.",
      "Olá, conexão estabelecida com segurança. Em que posso auxiliá-la(o) neste momento?",
      "Olá, estou na linha acompanhando com atenção. Por favor, sinta-se à vontade para falar.",
      "Olá, chamada segura iniciada. Como posso lhe prestar suporte agora?"
    ];
    welcomeSpeech = responseMemory.pick('call_welcome_joao', joaoGreetings);
  } else if (persona === '180') {
    welcomeSpeech = "Central 180, acolhimento à mulher, bom dia. Em que posso te orientar?";
  } else if (persona === '190') {
    welcomeSpeech = "Polícia Militar, COPOM 190. Qual é a sua ocorrência de emergência?";
  } else if (persona === '192') {
    welcomeSpeech = "Central SAMU 192, regulação médica. Em que podemos ajudar?";
  } else {
    welcomeSpeech = "Disque 100, Ouvidoria Nacional dos Direitos Humanos. Pode relatar.";
  }

  appState.callDialogueHistory.push({ role: "model", text: welcomeSpeech });
  setCallTranscript(welcomeSpeech);
  speakCallResponse(welcomeSpeech, persona);

  CallSpeechManager.start('voice');
}

function closeVoiceCallModal() {
  const modal = document.getElementById('voiceCallModal');
  if (modal) modal.style.display = 'none';
  stopCallTimer();
  CallSpeechManager.stop();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function setCallTranscript(text) {
  appState.currentSpokenText = text;
  const transcriptEl = document.getElementById('callTranscriptText');
  if (transcriptEl) {
    transcriptEl.innerText = `"${text}"`;
  }
}

function speakCurrentCounselorLine() {
  if (appState.currentSpokenText) {
    speakCallResponse(appState.currentSpokenText, appState.selectedPersona);
  }
}

function counselorSpeakTopic(topic) {
  const isJoao = appState.selectedPersona === 'joao';
  let speech = "";

  if (topic === 'calma') {
    speech = isJoao
      ? "Vamos respirar com calma e serenidade. Inspire profundamente pelo nariz, relaxe os ombros e expire lentamente pela boca. Você está em um ambiente seguro e não tem culpa alguma."
      : "Permaneça em serenidade e respire fundo comigo: inspire pelo nariz de forma pausada e expire devagar. Você demonstrou imensa coragem; agora receba todo o apoio necessário com respeito e segurança.";
  } else if (topic === 'pep') {
    speech = "É fundamental dirigir-se em até 72 horas a uma unidade de pronto atendimento para iniciar a Profilaxia Pós-Exposição (PEP) contra o HIV e infecções. O atendimento no SUS é gratuito, sigiloso e não requer registro de ocorrência policial!";
  } else {
    speech = "Pode falar no seu tempo, estou ouvindo com total atenção e respeito. Permanecerei na linha continuamente.";
  }

  appState.callDialogueHistory = appState.callDialogueHistory || [];
  appState.callDialogueHistory.push({ role: "model", text: speech });
  speakCallResponse(speech, appState.selectedPersona);
}

function toggleCallMute() {
  appState.isMuted = !appState.isMuted;
  const icon = document.getElementById('callMuteIcon');
  const label = document.getElementById('callMuteLabel');

  if (appState.isMuted) {
    if (icon) icon.innerText = '🔇';
    if (label) label.innerText = 'Mic Mudo';
    if (CallSpeechManager.audioStream) {
      CallSpeechManager.audioStream.getAudioTracks().forEach(t => t.enabled = false);
    }
    CallSpeechManager.pause();
    showToast("Microfone desativado.");
  } else {
    if (icon) icon.innerText = '🎙️';
    if (label) label.innerText = 'Mic Ativo';
    if (CallSpeechManager.audioStream) {
      CallSpeechManager.audioStream.getAudioTracks().forEach(t => t.enabled = true);
    }
    CallSpeechManager.resume();
    showToast("Microfone ativado para captação de áudio.");
  }
}

function openVideoCallModal() {
  const modal = document.getElementById('videoCallModal');
  if (modal) modal.style.display = 'flex';

  appState.callSeconds = 0;
  appState.callDialogueHistory = [];
  startCallTimer('videoDurationTimer');

  const persona = appState.selectedPersona;
  let welcomeSpeech = "";

  if (persona === 'maria') {
    const mariaVideoGreetings = [
      "Olá, transmissão de vídeo conectada com segurança. Estou à sua disposição, pode falar.",
      "Olá, estou visualizando e ouvindo perfeitamente. Como posso lhe prestar suporte agora?",
      "Olá, chamada de vídeo estabelecida. Por favor, relate sua situação com tranquilidade."
    ];
    welcomeSpeech = responseMemory.pick('video_welcome_maria', mariaVideoGreetings);
  } else if (persona === 'joao') {
    const joaoVideoGreetings = [
      "Olá, conexão de vídeo estabelecida com sucesso. Estou ouvindo com atenção, pode falar.",
      "Olá, transmissão de áudio e vídeo ativa com segurança. Como posso auxiliá-la(o)?",
      "Olá, estou à disposição para lhe ouvir. Por favor, sinta-se confortável para relatar."
    ];
    welcomeSpeech = responseMemory.pick('video_welcome_joao', joaoVideoGreetings);
  } else if (persona === '180') {
    welcomeSpeech = "Central 180, acolhimento em vídeo conectado. Pode falar com tranquilidade.";
  } else if (persona === '190') {
    welcomeSpeech = "Polícia Militar 190 em vídeo. Qual é a sua emergência policial?";
  } else if (persona === '192') {
    welcomeSpeech = "Central SAMU 192 em vídeo. Descreva o estado da vítima.";
  } else {
    welcomeSpeech = "Disque 100 em vídeo. Seu atendimento é sigiloso, pode relatar.";
  }

  appState.callDialogueHistory.push({ role: "model", text: welcomeSpeech });
  setVideoSubtitles(welcomeSpeech);
  speakCallResponse(welcomeSpeech, persona);

  CallSpeechManager.start('video');
}

function closeVideoCallModal() {
  const modal = document.getElementById('videoCallModal');
  if (modal) modal.style.display = 'none';
  stopCallTimer();
  CallSpeechManager.stop();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (appState.webcamStream) {
    appState.webcamStream.getTracks().forEach(t => t.stop());
    appState.webcamStream = null;
    appState.isWebcamActive = false;
  }
}

function setVideoSubtitles(text) {
  appState.currentSpokenText = text;
  const subEl = document.getElementById('videoSubtitleContent');
  if (subEl) subEl.innerText = `"${text}"`;
}

function toggleVideoMic() {
  appState.isMuted = !appState.isMuted;
  const icon = document.getElementById('videoMicIcon');
  const label = document.getElementById('videoMicLabel');

  if (appState.isMuted) {
    if (icon) icon.innerText = '🔇';
    if (label) label.innerText = 'Mic Mudo';
    if (CallSpeechManager.audioStream) {
      CallSpeechManager.audioStream.getAudioTracks().forEach(t => t.enabled = false);
    }
    CallSpeechManager.pause();
    showToast("Microfone desativado.");
  } else {
    if (icon) icon.innerText = '🎙️';
    if (label) label.innerText = 'Mic Ativo';
    if (CallSpeechManager.audioStream) {
      CallSpeechManager.audioStream.getAudioTracks().forEach(t => t.enabled = true);
    }
    CallSpeechManager.resume();
    showToast("Microfone ativado para captação de áudio.");
  }
}

async function toggleUserWebcam() {
  const videoEl = document.getElementById('userSelfWebcam');
  const placeholder = document.getElementById('pipPlaceholder');
  const label = document.getElementById('videoCamLabel');

  if (appState.isWebcamActive) {
    if (appState.webcamStream) {
      appState.webcamStream.getTracks().forEach(track => track.stop());
      appState.webcamStream = null;
    }
    appState.isWebcamActive = false;
    if (videoEl) videoEl.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    if (label) label.innerText = 'Minha Câmera';
    showToast("Câmera do usuário desativada.");
  } else {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        appState.webcamStream = stream;
        appState.isWebcamActive = true;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (label) label.innerText = 'Câmera Ativa';
        showToast("📷 Sua câmera está transmitindo na chamada.");
      } else {
        showToast("Câmera não suportada neste dispositivo.");
      }
    } catch (err) {
      console.warn("Acesso à webcam recusado:", err);
      showToast("Câmera indisponível. O atendimento segue normalmente por segurança!");
    }
  }
}

/* ==========================================================================
   8. TEMPORIZADOR E SÍNTESE DE VOZ
   ========================================================================== */
function startCallTimer(elementId) {
  stopCallTimer();
  appState.callSeconds = 0;

  appState.callTimerInterval = setInterval(() => {
    appState.callSeconds++;
    const mins = String(Math.floor(appState.callSeconds / 60)).padStart(2, '0');
    const secs = String(appState.callSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById(elementId);
    if (timerEl) {
      timerEl.innerText = `${mins}:${secs}`;
    }
  }, 1000);
}

function stopCallTimer() {
  if (appState.callTimerInterval) {
    clearInterval(appState.callTimerInterval);
    appState.callTimerInterval = null;
  }
}

function speakWithWebSpeech(text) {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}

/* ==========================================================================
   9. DETECÇÃO DE LOCALIZAÇÃO GPS REAL
   ========================================================================== */
function initRealLocationDetection() {
  updateLocationUI('Identificando sua localização GPS...');

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        userLocation.lat = lat;
        userLocation.lon = lon;
        userLocation.coords = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
        userLocation.mapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
        userLocation.isRealGps = true;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const street = addr.road || addr.pedestrian || addr.footway || addr.suburb || "Rua Identificada";
            const houseNumber = addr.house_number ? `, nº ${addr.house_number}` : "";
            const neighborhood = addr.neighbourhood || addr.suburb || "";
            const city = addr.city || addr.town || addr.municipality || "";
            const state = addr.state ? ` - ${addr.state}` : "";

            const shortLoc = [street + houseNumber, neighborhood || city].filter(Boolean).join(" - ");
            const fullLoc = [street + houseNumber, neighborhood, city + state].filter(Boolean).join(", ");

            userLocation.address = shortLoc || `GPS: ${userLocation.coords}`;
            userLocation.fullAddress = fullLoc || shortLoc;
            updateLocationUI(userLocation.address);
            return;
          }
        } catch (e) {
          console.warn("Falha na geocodificação reversa:", e);
        }

        userLocation.address = `GPS: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
        userLocation.fullAddress = userLocation.address;
        updateLocationUI(userLocation.address);
      },
      (error) => {
        console.warn("Acesso ao GPS bloqueado. Tentando por IP:", error.message);
        fallbackLocationByIp();
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  } else {
    fallbackLocationByIp();
  }
}

async function fallbackLocationByIp() {
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const city = data.city || "Sua Cidade";
        const region = data.region || "Seu Estado";
        userLocation.address = `${city}, ${region}`;
        userLocation.fullAddress = `${city}, ${region} - Brasil`;
        if (data.latitude && data.longitude) {
          userLocation.lat = data.latitude;
          userLocation.lon = data.longitude;
          userLocation.coords = `${data.latitude}, ${data.longitude}`;
          userLocation.mapUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
        }
        updateLocationUI(userLocation.address);
        return;
      }
    }
  } catch (e) {
    console.warn("Falha no IP fallback:", e);
  }

  userLocation.address = "Ponto de Ônibus Central (Satélite)";
  userLocation.fullAddress = "Av. Principal - Ponto de Ônibus Central";
  updateLocationUI(userLocation.address);
}

function updateLocationUI(text) {
  const locSub = document.getElementById('sidebarLocationSubtitle');
  if (locSub) locSub.innerText = text;
}

function copyLocationCoords() {
  const textToCopy = `SOCORRO / EMERGÊNCIA:\nLocal: ${userLocation.fullAddress}\n${userLocation.mapUrl ? 'Google Maps: ' + userLocation.mapUrl : ''}`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast("📋 Localização copiada para a área de transferência!");
  }).catch(() => {
    showToast("📍 " + userLocation.fullAddress);
  });
}

/* ==========================================================================
   10. SAÍDA RÁPIDA, TEMAS & TOASTS
   ========================================================================== */
function initQuickExit() {
  const exitBtn = document.getElementById('quickExitBtn');
  if (exitBtn) {
    exitBtn.addEventListener('click', executeQuickExit);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      executeQuickExit();
    }
  });
}

function executeQuickExit() {
  try {
    if (appState.webcamStream) {
      appState.webcamStream.getTracks().forEach(t => t.stop());
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    sessionStorage.clear();
    localStorage.clear();
  } catch (err) {
    console.warn(err);
  }
  window.location.replace('https://www.google.com');
}

function initThemeToggle() {
  const contrastBtn = document.getElementById('toggleContrastBtn');
  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      document.body.classList.toggle('theme-dark');
      const isDark = document.body.classList.contains('theme-dark');
      showToast(isDark ? '🌙 Modo Conforto Noturno' : '☀️ Modo Diurno Acolhedor');
    });
  }
}

function initTotemMode() {
  const toggleBtn = document.getElementById('toggleTotemBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('mode-totem-urban');
      const isTotem = document.body.classList.contains('mode-totem-urban');
      showToast(isTotem ? '🚏 Modo Totem de Rua Ativado' : '📱 Modo Padrão Ativado');
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
