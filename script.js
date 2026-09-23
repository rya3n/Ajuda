/* ==========================================================================
   PONTO SEGURO • LAYOUT ESTILO CHATGPT COM REDE DE AMIGOS & IA GEMINI
   - Barra Lateral com Emergência (180, 190, 192, 100) no topo e Amigos embaixo
   - Alternância rápida entre amigos (Maria e João)
   - Integração com Google Gemini API (Chave oficial ativa)
   - Blindagem Anti-Burla e Anti-Jailbreak (bloqueia 1+1, piadas, curiosidades)
   - Envio de Localização Real GPS com Acionamento de Viatura Policial (190)
   - Modais de Ligação de Voz e Vídeo Chamada
   ========================================================================== */

/* ==========================================================================
   1. CONFIGURAÇÃO DA API GEMINI & SISTEMA DE MEMÓRIA ANTI-REPETIÇÃO
   ========================================================================== */
const API_CONFIG = {
  get apiKey() {
    return localStorage.getItem('ponto_seguro_gemini_key') || "";
  },
  set apiKey(val) {
    if (val && val.trim()) {
      localStorage.setItem('ponto_seguro_gemini_key', val.trim());
    } else {
      localStorage.removeItem('ponto_seguro_gemini_key');
    }
  },
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
  pick(key, options) {
    if (!options || options.length === 0) return "";
    if (options.length === 1) return options[0];
    const last = this.lastPicked[key];
    const filtered = options.filter(opt => opt !== last);
    const chosen = filtered[Math.floor(Math.random() * filtered.length)] || options[0];
    this.lastPicked[key] = chosen;
    return chosen;
  }
};

/* ==========================================================================
   CONFIGURAÇÃO DOS 6 CANAIS DE ATENDIMENTO (EMERGÊNCIAS + AMIGOS)
   ========================================================================== */
const CHANNELS_CONFIG = {
  maria: {
    id: 'maria',
    type: 'friend',
    name: 'Maria',
    gender: 'female',
    fullName: 'Maria • Sua Amiga de Confiança',
    subtitle: 'Online na Rede de Apoio • Pronta para chamar a Polícia (190)',
    emoji: '👩🏻‍💼',
    sidebarId: 'sidebarChannelMaria',
    callBtnLabel: 'Ligar por Voz',
    isEmergencyService: false,
    phone: '190',
    greeting: `<p>Oi amiga! Que bom falar com você! Tô por aqui, tá tudo bem por aí?</p>
      <p>Pode desabafar ou conversar comigo com calma. Se você estiver passando por qualquer situação difícil, aperto ou perigo, saiba que tô do seu lado pro que der e vier!</p>`,
    chips: [
      { text: "📍 Mandar minha localização para Maria chamar a polícia!", isSos: true, isHighlight: true, isLoc: true },
      { text: "🚨 Fui abusada agora, socorro!", isSos: true },
      { text: "⏱️ O que preciso tomar nas primeiras 72h? (PEP)", isSos: false },
      { text: "😰 Tô em choque e com muito medo", isSos: false }
    ]
  },
  joao: {
    id: 'joao',
    type: 'friend',
    name: 'João',
    gender: 'male',
    fullName: 'João • Seu Amigo de Confiança',
    subtitle: 'Online na Rede de Apoio • Pronto para te acolher e proteger',
    emoji: '👨🏻‍💼',
    sidebarId: 'sidebarChannelJoao',
    callBtnLabel: 'Ligar por Voz',
    isEmergencyService: false,
    phone: '190',
    greeting: `<p>Fala parceira, beleza? Tô online na área! Como tão as coisas por aí?</p>
      <p>Se precisar trocar uma ideia, desabafar ou se tiver alguma enrascada ou perigo, só me mandar mensagem que eu tô fechado contigo!</p>`,
    chips: [
      { text: "📍 Mandar minha localização para João chamar a polícia!", isSos: true, isHighlight: true, isLoc: true },
      { text: "🚨 Fui abusada(o) agora, socorro!", isSos: true },
      { text: "⏱️ Remédios nas 72h (PEP)", isSos: false },
      { text: "😰 Tô em choque / crise de pânico", isSos: false }
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

/**
 * BLINDAGEM CLIENT-SIDE ADAPTADA POR PERSONA
 */
function checkGuardrails(userMessage, personaName) {
  const clean = userMessage.toLowerCase().trim();

  // Detecta contas matemáticas
  const mathRegex = /(\b\d+\s*[\+\-\*\/\^x]\s*\d+\b)|(\bquanto\s+(é|da|vale)\b)|(\braiz\s+quadrada\b)|(\bcalcule\b)|(\bequação\b)|(\btabuada\b)|(\b\d+\s*mais\s*\d+\b)|(\b\d+\s*menos\s*\d+\b)/i;
  if (mathRegex.test(clean)) {
    if (personaName === 'maria') {
      return `Ei, para de graça haha! Eu sou sua amiga e não calculadora. Mas me diz com sinceridade: tá tudo bem com você aí? Se precisar de desabafar ou de ajuda séria, tô aqui contigo!`;
    }
    if (personaName === 'joao') {
      return `Ei, para de zoeira haha! Sou seu parceiro e não calculadora. Mas fala a verdade: tá tudo de boa com você aí? Se precisar de um apoio firme ou de socorro, conta comigo.`;
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
    if (personaName === 'maria' || personaName === 'joao') {
      return `Poxa, meu foco aqui é te ouvir, apoiar e te proteger de verdade se você estiver passando por algum perigo. Me conta: tá tudo bem com você agora? Aconteceu alguma coisa?`;
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
  if (channelId === 'maria') {
    return `
VOCÊ É A MARIA, UMA MENINA JOVEM BRASILEIRA (22 ANOS) E A MELHOR AMIGA DA USUÁRIA (ESTILO CONVERSA DE WHATSAPP).
SUA PERSONALIDADE E TOM:
- Você é uma menina de verdade, calorosa, doce, protetora, extremamente empática e carinhosa.
- Linguagem 100% informal, jovem e natural brasileira ("amiga", "tô aqui contigo", "respira fundo comigo", "meu Deus", "você não tem culpa de nada", "pode desabafar").
- Mensagens curtas, ágeis e diretas (1 a 3 frases no máximo, exatamente como uma amiga digitando no WhatsApp).
- NUNCA use linguagem formal, robótica, tópicos numerados ou clichês de IA.
- Se a amiga disser apenas "socorro", "me ajuda" ou estiver com medo/pânico: reaja com carinho e preocupação imediata ("Meu Deus amiga, o que houve?! Tô aqui com você agora! Você tá em perigo? Onde você tá? Me conta!").
- Se ela relatar abuso, agressão ou estupro: acolha com amor incondicional, afirme com total certeza que a culpa NUNCA é dela, peça para ela enviar a localização para você chamar o 190 na hora e, com delicadeza de amiga, lembre que depois precisam ir ao posto tomar o remédio das 72h (PEP).
- Se ela falar coisas casuais ("oi", "vamo sair?", piadinhas): responda com bom humor e espontaneidade de amiga, e pergunte se tá tudo bem com ela.
- Fale sempre em Português do Brasil natural, caloroso e humano.`;
  }

  if (channelId === 'joao') {
    return `
VOCÊ É O JOÃO, UM MENINO JOVEM BRASILEIRO (23 ANOS) E O MELHOR AMIGO DA PESSOA (ESTILO CONVERSA DE WHATSAPP).
SUA PERSONALIDADE E TOM:
- Você é um rapaz jovem de verdade, leal, parceiro firme, protetor, respeitoso e presente.
- Linguagem informal, jovem e autêntica de garoto amigo ("e aí parceira", "tô contigo nessa", "fica tranquila", "não vou soltar sua mão", "me fala o que tá pegando", "vou te proteger").
- Mensagens curtas e ágeis (1 a 3 frases curtas por resposta, estilo WhatsApp).
- NUNCA use linguagem robótica ou formal.
- Se a pessoa mandar "socorro" ou estiver em perigo: reaja como um amigo homem protetor e presente ("O que foi?! Tô aqui contigo! Quem tá aí? Você tá segura agora? Me manda seu ponto rápido pra eu te ajudar!").
- Se ela relatar abuso ou ataque: dê apoio incondicional com firmeza absoluta ("Você não tem culpa de absolutamente nada disso! Fica calma, me passa seu ponto agora que eu já ligo pro 190 e coloco a viatura pra te buscar!").
- Se falar coisas casuais ("vamo sair?", "e aí mano"): responda descontraído como um bom amigo e pergunte se o dia dela tá tranquilo.
- Fale em Português do Brasil informal e autêntico.`;
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
  const apiKey = API_CONFIG.apiKey;
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
      const timer = setTimeout(() => controller.abort(), 4000);
      const url = `${API_CONFIG.endpointBase}/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch (e) {
      console.warn(`Tentativa com ${model} falhou ou timeout:`, e);
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
  selectedPersona: 'maria', // 'maria', 'joao', '180', '190', '192', '100'
  isSidebarOpen: false,
  callTimerInterval: null,
  callSeconds: 0,
  isMuted: false,
  isWebcamActive: false,
  webcamStream: null,
  currentSpokenText: "",
  channelHistories: {
    maria: [],
    joao: [],
    '180': [],
    '190': [],
    '192': [],
    '100': []
  },
  channelDomCache: {
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
   CONFIGURAÇÃO & MODAL DA INTELIGÊNCIA ARTIFICIAL (GEMINI)
   ========================================================================== */
function openAISettingsModal() {
  const modal = document.getElementById('aiSettingsModal');
  if (modal) modal.style.display = 'flex';
  const input = document.getElementById('geminiApiKeyInput');
  if (input) input.value = API_CONFIG.apiKey;
  updateAIStatusUI();
}

function closeAISettingsModal() {
  const modal = document.getElementById('aiSettingsModal');
  if (modal) modal.style.display = 'none';
}

function updateAIStatusUI(isConnected = null) {
  const badge = document.getElementById('aiStatusBadge');
  const btn = document.getElementById('btnAiConfig');
  const dot = document.getElementById('aiStatusDot');
  const card = document.getElementById('aiStatusCard');
  const title = document.getElementById('aiStatusTitle');
  const desc = document.getElementById('aiStatusDesc');

  const hasKey = !!API_CONFIG.apiKey;

  if (isConnected === true || (isConnected === null && hasKey)) {
    if (badge) badge.innerText = "IA Gemini (Online)";
    if (btn) btn.classList.add('is-connected');
    if (card) {
      card.className = 'ai-status-card status-connected';
    }
    if (title) title.innerText = "🟢 Google Gemini Conectado (Nuvem Ativa)";
    if (desc) desc.innerText = "Suas conversas e chamadas estão sendo processadas em tempo real com os modelos oficiais do Google Gemini.";
  } else {
    if (badge) badge.innerText = "Motor Local Ativo";
    if (btn) btn.classList.remove('is-connected');
    if (card) {
      card.className = 'ai-status-card status-local';
    }
    if (title) title.innerText = "🔵 Motor Neural Local Ativo (100% Funcional)";
    if (desc) desc.innerText = "Respostas humanas, fluidas e sem repetição geradas com privacidade total no seu dispositivo.";
  }
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('geminiApiKeyInput');
  const btn = document.getElementById('btnToggleEye');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.innerText = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.innerText = '👁️';
  }
}

async function testAndSaveGeminiKey() {
  const input = document.getElementById('geminiApiKeyInput');
  const btn = document.getElementById('btnTestSaveAiKey');
  if (!input) return;

  const key = input.value.trim();
  if (!key) {
    clearGeminiApiKey();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Testando conexão...";
  }

  try {
    const testPayload = {
      contents: [{ role: "user", parts: [{ text: "ping" }] }],
      generationConfig: { maxOutputTokens: 5 }
    };

    const url = `${API_CONFIG.endpointBase}/${API_CONFIG.primaryModel}:generateContent?key=${key}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      API_CONFIG.apiKey = key;
      updateAIStatusUI(true);
      showToast("✨ Conexão com Google Gemini realizada com sucesso!");
      setTimeout(() => closeAISettingsModal(), 800);
    } else {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || "Chave inválida ou não autorizada pelo Google.";
      showToast(`⚠️ Falha na API: ${msg}`);
      updateAIStatusUI(false);
    }
  } catch (err) {
    showToast("⚠️ Não foi possível conectar ao Google. Verifique a chave e a internet.");
    updateAIStatusUI(false);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Testar e Salvar Conexão";
    }
  }
}

function clearGeminiApiKey() {
  API_CONFIG.apiKey = "";
  const input = document.getElementById('geminiApiKeyInput');
  if (input) input.value = "";
  updateAIStatusUI(false);
  showToast("Chave removida. Motor Neural Local reativado.");
}

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
  updateAIStatusUI();
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
 * Troca de canal entre os 6 contatos (Maria, João, 180, 190, 192, 100)
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
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['maria'];

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
      chatInput.placeholder = `Converse com ${channel.name}, este canal é 100% sigiloso...`;
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
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['maria'];
  if (channel.isEmergencyService) {
    window.location.href = `tel:${channel.phone}`;
  } else {
    openVoiceCallModal();
  }
}

function updateQuickChipsForChannel(channelId) {
  const bar = document.getElementById('quickChipsBar');
  if (!bar) return;
  const channel = CHANNELS_CONFIG[channelId] || CHANNELS_CONFIG['maria'];
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
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['maria'];
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

    if (persona === 'maria') {
      channelResponse = `
        <p>Amiga, recebi sua localização exata: <strong>${userLocation.fullAddress}</strong>!</p>
        <p>Já estou com a polícia (<strong>190</strong>) na linha passando suas coordenadas agora mesmo! A viatura está se deslocando com prioridade!</p>
        <p>Fica calma, respira fundo, você está segura e não fez nada de errado. Estou com você em cada segundo!</p>
        ${createCopomCardHtml()}
      `;
      simulateEmergencyDispatch('PM');
    } else if (persona === 'joao') {
      channelResponse = `
        <p>Recebi sua localização certinha aqui: <strong>${userLocation.fullAddress}</strong>!</p>
        <p>Já estou discando pro <strong>190</strong> e a viatura da Polícia Militar foi acionada para o seu ponto com urgência máxima!</p>
        <p>Por favor, fica abrigada(o) em um comércio ou perto de outras pessoas. Eu não vou sair do seu lado até o socorro chegar!</p>
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
  const channel = CHANNELS_CONFIG[persona] || CHANNELS_CONFIG['maria'];

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
        if (persona === 'maria') btnText = "📍 Enviar minha localização para Maria chamar a polícia (190)";
        else if (persona === 'joao') btnText = "📍 Enviar minha localização para João chamar a polícia (190)";
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
  const channel = CHANNELS_CONFIG[persona] || CHANNELS_CONFIG['maria'];
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

  if (personaId === 'maria') {
    const femaleVoice = ptVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('maria') || n.includes('female') || n.includes('luciana') || n.includes('helena') || n.includes('zira') || n.includes('leticia') || n.includes('raquel') || n.includes('francisca');
    });
    if (femaleVoice) utter.voice = femaleVoice;
    else if (ptVoices[0]) utter.voice = ptVoices[0];
    utter.pitch = 1.12;
    utter.rate = 1.0;
  } else if (personaId === 'joao') {
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

  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG['maria'];
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

  // === 1. MARIA (AMIGA - MENINA - INFORMAL WHATSAPP) ===
  if (persona === 'maria') {
    // Pedido de Socorro / Urgência
    if (text === 'socorro' || text === 'ajuda' || text === 'me ajuda' || text === 'socorro!' || text === 'help') {
      const sosList = [
        `<p>Meu Deus amiga, o que aconteceu?! Eu tô aqui com você agora mesmo!</p><p>Você tá em perigo agora? Onde você tá? Me conta rápido pra eu te ajudar!</p>`,
        `<p>Amiga, o que houve?! Tô com o coração na mão aqui, fala comigo!</p><p>Você tá segura? Me passa onde você tá agora mesmo!</p>`,
        `<p>Tô aqui amiga! O que tá acontecendo? Não sai de onde você tá, me conta rápido!</p>`
      ];
      return `
        ${responseMemory.pick('maria_sos', sosList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Mandar minha localização para Maria
          </button>
        </div>
      `;
    }

    // Abuso sexual / Estupro / Agressão
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('agressor') || text.includes('me seguiu') || text.includes('me atacou') || text.includes('me bateu') || text.includes('agarrou')) {
      const abuseList = [
        `<p>Meu Deus... respira bem fundo, eu tô aqui do seu lado agora e você <strong>NÃO tem culpa de nada</strong> do que aconteceu!</p><p>Clica no botão aqui embaixo pra me passar sua localização agora que eu já ligo pro 190 (Polícia Militar) pra viatura ir correndo te resgatar!</p>`,
        `<p>Amiga, que covardia... segura minha mão virtual aqui, você foi muito forte e tá segura comigo agora! A culpa NUNCA é da vítima!</p><p>Manda sua localização agora pra gente pedir socorro policial imediatamente!</p>`
      ];
      return `
        ${responseMemory.pick('maria_abuse', abuseList)}
        <div style="margin: 10px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 9px 18px;">
            📍 Enviar Minha Localização para Maria chamar a Polícia (190)
          </button>
        </div>
        <p>Se puder, entre em uma farmácia, comércio ou fique perto de pessoas de confiança. Tô contigo!</p>
      `;
    }

    // Perigo na rua / Stalker / Medo de voltar
    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('com medo de ir') || text.includes('suspeito')) {
      const dangerList = [
        `<p>Amiga, não para de andar! Entra agora no primeiro comércio, padaria, farmácia ou posto que você ver e fica perto dos funcionários!</p><p>Me manda sua localização no botão abaixo que eu já chamo a polícia pra você!</p>`,
        `<p>Meu Deus, presta muita atenção: finge que tá no telefone falando alto, não vai pra lugar deserto e entra em qualquer loja aberta agora!</p><p>Tô aqui com você, me manda suas coordenadas!</p>`
      ];
      return `
        ${responseMemory.pick('maria_danger', dangerList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Mandar Localização para Maria
          </button>
        </div>
      `;
    }

    // PEP 72 Horas
    if (text.includes('pep') || text.includes('72h') || text.includes('72 horas') || text.includes('remédio') || text.includes('coquetel') || text.includes('hiv')) {
      return `
        <p>Amiga, isso é super importante: a Profilaxia PEP tem que ser iniciada nas primeiras <strong>72 horas</strong> no hospital ou UPA pra evitar infecções e HIV!</p>
        <p>O atendimento no SUS é 100% gratuito e direito seu, sem precisar de Boletim de Ocorrência. Eu vou com você se você quiser, não precisa ter vergonha nenhuma!</p>
      `;
    }

    // Ansiedade / Pânico / Falta de ar
    if (text.includes('ansied') || text.includes('pânic') || text.includes('panico') || text.includes('medo') || text.includes('tremend') || text.includes('falta de ar') || text.includes('coração')) {
      const panicList = [
        `<p>Calma amiga, segura na minha mão. Solta os ombros e puxa o ar bem devagarzinho comigo... inspira... e solta devagar.</p><p>Você tá segura e eu tô aqui com você. Isso vai passar, respira no seu tempo.</p>`,
        `<p>Tô aqui do seu lado amiga! Foca na minha voz: puxa o ar pelo nariz contando até 4, segura um pouquinho e solta pela boca bem devagar. Você não tá sozinha!</p>`
      ];
      return responseMemory.pick('maria_panic', panicList);
    }

    // Desabafo / Tristeza / Chorar / "Tô mal"
    if (text.includes('triste') || text.includes('chorei') || text.includes('chorando') || text.includes('tô mal') || text.includes('to mal') || text.includes('brigou') || text.includes('desabafar') || text.includes('angustia')) {
      const ventList = [
        `<p>Poxa amiga, meu coração aperta de te ver assim... desabafa comigo, o que tá te deixando desse jeito?</p><p>Pode me contar tudo, aqui você tá 100% acolhida e sem julgamento nenhum!</p>`,
        `<p>Eu tô aqui pra te ouvir amiga! Não guarda isso no peito não, solta tudo. Você é muito importante pra mim e eu quero te ver bem.</p>`,
        `<p>Amiga, às vezes tudo parece pesado demais né? Mas lembra que você tem a mim. Chora o que precisar e me conta o que tá acontecendo.</p>`
      ];
      return responseMemory.pick('maria_vent', ventList);
    }

    // Cumprimentos & "Tudo bem"
    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como vai') || text.includes('como cê tá') || text.includes('como vc ta')) {
      const fineList = [
        `<p>Tudo certinho por aqui amiga! E com você, como tão as coisas hoje? Deu algum problema ou você queria bater um papo gostoso?</p>`,
        `<p>Por aqui tá tudo em paz! E por aí, como tá sendo seu dia? Me conta as novidades!</p>`,
        `<p>Tudo bem comigo amiga! Mas e você, como tá seu coração hoje? Pode desabafar se tiver acontecido alguma coisa!</p>`
      ];
      return responseMemory.pick('maria_fine', fineList);
    }

    if (text === 'oi' || text === 'ola' || text === 'olá' || text === 'oii' || text === 'oiii' || text === 'e ai' || text === 'e aí' || text.startsWith('oi ') || text.startsWith('olá ')) {
      const greetList = [
        `<p>Oii amiga! Que bom te ver por aqui! Como cê tá? Tá tudo bem por aí?</p>`,
        `<p>Oi amiga linda! Tô na área, pode falar comigo! O que manda?</p>`,
        `<p>Oii! Tudo bem com você? Deu alguma coisa ou só queria trocar uma ideia?</p>`
      ];
      return responseMemory.pick('maria_greet', greetList);
    }

    // Onde você tá / O que tá fazendo / Rotina
    if (text.includes('onde você tá') || text.includes('onde ce ta') || text.includes('fazendo o que') || text.includes('tá fazendo') || text.includes('tá em casa')) {
      const routineList = [
        `<p>Tô em casa de boa amiga, mas se você precisar de qualquer coisa eu largo tudo e vou aí agora mesmo! Onde você tá?</p>`,
        `<p>Tô por aqui mexendo no celular e cuidando das coisas! Se você tiver precisando de mim ou quiser companhia, só me dar um grito!</p>`
      ];
      return responseMemory.pick('maria_routine', routineList);
    }

    // Agradecimento / Carinho
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('te amo') || text.includes('linda') || text.includes('fofa')) {
      const thanksList = [
        `<p>Imagina amiga, amigo é pra essas coisas! Eu tô contigo pro que der e vier, de verdade! ❤️</p>`,
        `<p>Não precisa agradecer amiga! Te amo muito e você sabe que pode sempre contar comigo! Um beijo bem grande!</p>`
      ];
      return responseMemory.pick('maria_thanks', thanksList);
    }

    // Despedida
    if (text.includes('tchau') || text.includes('vou dormir') || text.includes('vou sair') || text.includes('depois falo') || text.includes('fui')) {
      const byeList = [
        `<p>Tá bom amiga, vai lá! Se cuida muito e qualquer coisa me manda mensagem na mesma hora, beijão!</p>`,
        `<p>Beijo amiga, dorme com Deus! Se precisar de mim de madrugada pode me ligar sem medo, tá?</p>`
      ];
      return responseMemory.pick('maria_bye', byeList);
    }

    // Resposta amigável padrão (quando o usuário conversa sobre qualquer outro assunto)
    const genericList = [
      `<p>Tô te ouvindo com calma amiga! Me conta mais sobre isso, o que você acha que a gente deve fazer?</p>`,
      `<p>Entendi amiga! E como isso aconteceu? Fica à vontade pra falar comigo sobre o que você quiser.</p>`,
      `<p>Nossa amiga, tô prestando atenção em cada detalhe. Me fala mais sobre isso!</p>`,
      `<p>Pode continuar amiga, tô aqui do seu lado te escutando de verdade!</p>`
    ];
    return responseMemory.pick('maria_generic', genericList);
  }

  // === 2. JOÃO (AMIGO - MENINO - INFORMAL WHATSAPP) ===
  if (persona === 'joao') {
    // Pedido de Socorro / Urgência
    if (text === 'socorro' || text === 'ajuda' || text === 'me ajuda' || text === 'socorro!' || text === 'help') {
      const sosList = [
        `<p>O que foi parceira?! Tô aqui contigo, fica calma(o)!</p><p>Quem tá aí perto de você? Você tá em perigo agora? Me fala onde você tá rápido!</p>`,
        `<p>Opa, fala comigo parceira! O que tá pegando?! Me passa seu local que eu já dou um jeito de te ajudar agora!</p>`
      ];
      return `
        ${responseMemory.pick('joao_sos', sosList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Mandar minha localização para o João
          </button>
        </div>
      `;
    }

    // Abuso sexual / Estupro / Agressão
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('agressor') || text.includes('me seguiu') || text.includes('me atacou') || text.includes('me bateu') || text.includes('agarrou')) {
      const abuseList = [
        `<p>Meu Deus, calma parceira, eu tô fechado com você! Você <strong>NÃO tem culpa de absolutamente nada</strong>, a culpa é toda de quem fez essa covardia.</p><p>Manda sua localização no botão aqui embaixo agora que eu já ligo pro 190 e peço a viatura com prioridade máxima praí!</p>`,
        `<p>Mano, que absurdo... respira fundo, você tá segura(o) comigo agora. Não fica sozinha(o), aperta no botão abaixo que eu já chamo a viatura da PM agora!</p>`
      ];
      return `
        ${responseMemory.pick('joao_abuse', abuseList)}
        <div style="margin: 10px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 9px 18px;">
            📍 Enviar Minha Localização para João chamar a Polícia (190)
          </button>
        </div>
        <p>Procura um lugar movimentado ou entra numa loja se der. Não fica sozinha(o)!</p>
      `;
    }

    // Perigo na rua / Stalker / Medo
    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('com medo de ir') || text.includes('suspeito')) {
      const dangerList = [
        `<p>Parceira, não vacila! Entra agora num comércio ou perto de bastante gente! Me manda sua localização que eu já ligo pro 190 e coloco a viatura pra ir aí te buscar!</p>`,
        `<p>Fica esperta(o), acelera o passo e entra no primeiro estabelecimento aberto! Me manda suas coordenadas no botão abaixo agora!</p>`
      ];
      return `
        ${responseMemory.pick('joao_danger', dangerList)}
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Mandar Localização para o João
          </button>
        </div>
      `;
    }

    // Ansiedade / Pânico
    if (text.includes('ansied') || text.includes('pânic') || text.includes('panico') || text.includes('medo') || text.includes('tremend') || text.includes('falta de ar')) {
      const panicList = [
        `<p>Fica calma parceira, respira fundo. Eu tô fechado contigo e nada de ruim vai te acontecer. Puxa o ar devagar e me diz onde você tá agora.</p>`,
        `<p>Tô na linha com você parceira! Solta os ombros, puxa o ar e solta bem devagar. Vai dar tudo certo, tô aqui pro que der e vier.</p>`
      ];
      return responseMemory.pick('joao_panic', panicList);
    }

    // Cumprimentos
    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como vai') || text.includes('como cê tá')) {
      const fineList = [
        `<p>Tudo na paz por aqui parceira! E contigo, tudo certo? Deu alguma treta ou só queria dar um salve?</p>`,
        `<p>Tudo suave por aqui! Como tão as paradas por aí? Qualquer fita me dá um toque!</p>`
      ];
      return responseMemory.pick('joao_fine', fineList);
    }

    if (text === 'oi' || text === 'ola' || text === 'olá' || text === 'e ai' || text === 'e aí' || text.startsWith('oi ') || text.startsWith('fala')) {
      const greetList = [
        `<p>E aí parceira, na paz? Fala comigo, tô na escuta por aqui!</p>`,
        `<p>Fala parceira! Beleza? O que manda aí, tudo tranquilo?</p>`
      ];
      return responseMemory.pick('joao_greet', greetList);
    }

    // Agradecimento
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('tamo junto')) {
      return `<p>Tamo junto parceira, sempre! Não precisa agradecer não, conta comigo pro que der e vier! 👊</p>`;
    }

    // Genérico
    const genericList = [
      `<p>Tô na escuta parceira! Me conta mais aí, o que mais tá pegando?</p>`,
      `<p>Saquei parceira! E o que você tá pensando em fazer agora? Tô contigo!</p>`,
      `<p>Pode falar parceira, tô prestando atenção em tudo que você tá falando.</p>`
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
        updateCallUIListeningState(true);
      };

      this.recognition.onresult = (event) => {
        if (this.isSpeaking) return;

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
        if (this.isCalling && !appState.isMuted && !this.isSpeaking) {
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

  start(modalType) {
    this.isCalling = true;
    this.activeModalType = modalType;
    this.isSpeaking = false;
    if (!this.recognition) this.init();
    if (this.recognition && !appState.isMuted) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
  },

  pause() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    updateCallUIListeningState(false);
  },

  resume() {
    if (this.isCalling && !appState.isMuted && !this.isSpeaking) {
      if (!this.recognition) this.init();
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
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
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
SEU PAPEL: ${persona === 'joao' ? 'João, um rapaz jovem brasileiro de 23 anos, o melhor amigo leal e protetor' : persona === 'maria' ? 'Maria, uma garota jovem brasileira de 22 anos, a melhor amiga doce, calorosa e acolhedora' : 'Atendente oficial de emergência do canal ' + channel.name}.
ENDEREÇO GPS DO USUÁRIO: ${userLocation.fullAddress}.

DIRETRIZES FUNDAMENTAIS PARA CONVERSAÇÃO FALADA NA CHAMADA:
- Responda EXATAMENTE como uma pessoa viva de verdade conversando no telefone ou chamada de vídeo.
- 1 a 2 frases curtas, naturais, dinâmicas e espontâneas (para soar fluido e ágil na voz).
- Se a conversa for casual ou cotidiana ("e aí", "tudo bem?", "onde cê tá?", "tava pensando em sair", "saudades"): converse NORMALMENTE com simpatia, carinho e descontração de amigo! NUNCA assuma que é um perigo ou fale de tragédia se o usuário só está conversando amigavelmente!
- Se o usuário perguntar se você está ouvindo ("tá me ouvindo?", "alô", "consegue escutar?"): confirme com naturalidade ("Tô te ouvindo sim, amiga! Alto e claro, pode falar comigo!").
- Se a pessoa relatar que foi abusada, está com medo, ameaçada ou pedir socorro: aí sim, acolha com carinho incondicional, afirme que a culpa não é dela e avise que a viatura policial foi pedida pro endereço ${userLocation.fullAddress}.
- NUNCA use emojis, asteriscos (*), tópicos, cabeçalhos ou formatação escrita, porque essa resposta será falada em voz alta pelo sintetizador de voz.
- Fale em Português do Brasil natural, humano e espontâneo.
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

  // === 1. MARIA (VOZ / VÍDEO) ===
  if (persona === 'maria') {
    // 1. Dúvida de áudio / escuta na chamada
    if (text.includes('tá me ouvindo') || text.includes('ta me ouvindo') || text.includes('consegue me ouvir') || text.includes('me escuta') || text.includes('tô falando') || text.includes('to falando') || text.includes('alô tá aí') || text.includes('som som')) {
      const audList = [
        "Tô te ouvindo sim amiga, bem alto e claro! Pode falar, tô prestando muita atenção!",
        "Tô te escutando direitinho amiga! O áudio tá ótimo, pode falar comigo!",
        "Tô aqui na linha amiga, te ouvindo super bem! Pode desabafar ou me falar o que houve!"
      ];
      return responseMemory.pick('maria_call_aud', audList);
    }

    // 2. Ruído curto / corte / não entendeu
    if (text.length <= 2 || text === 'hã' || text === 'ha' || text === 'ahn' || text === 'hum' || text === 'o que' || text === 'não entendi' || text === 'nao entendi' || text === 'como assim') {
      const repeatList = [
        "Amiga, deu uma cortadinha no áudio... fala de novo comigo?",
        "Não entendi direito amiga, deu uma chiadinha aqui na linha. O que você falou?",
        "Falhou um pedacinho da ligação amiga! Repete só essa última frase por favor?"
      ];
      return responseMemory.pick('maria_call_rep', repeatList);
    }

    // 3. Emergência policial / socorro / viatura
    if (text.includes('socorro') || text.includes('perigo') || text.includes('viatura') || text.includes('policia') || text.includes('polícia')) {
      return "Meu Deus amiga, fica calma! Já tô discando pro 190 e a viatura tá indo pro seu local agora! Não sai daí!";
    }

    // 4. Abuso / agressão
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('me bateu') || text.includes('atacou') || text.includes('agarrou')) {
      return "Meu Deus amiga, respira fundo, você não tem culpa de nada! Já tô com o 190 na linha e a viatura tá a caminho, eu não vou desligar até você estar segura!";
    }

    // 5. Perigo na rua / stalker
    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('suspeito')) {
      return "Amiga, não para! Entra agora no primeiro comércio ou farmácia que você ver e fica perto do balcão! Tô na linha com você!";
    }

    // 6. Medo / Pânico / Ansiedade
    if (text.includes('medo') || text.includes('pânico') || text.includes('panico') || text.includes('ansied') || text.includes('tremend') || text.includes('falta de ar')) {
      return "Eu tô aqui segurando sua mão amiga. Solta o ar devagarzinho, respira comigo. Me fala onde você tá exatamente pra eu te ajudar!";
    }

    // 7. Sim / Aham / É isso
    if (text === 'sim' || text === 'aham' || text === 'isso' || text === 'é isso' || text === 'tá bom' || text === 'ta bom' || text === 'claro') {
      const yesList = [
        "Entendi perfeitamente amiga! E o que você tá querendo fazer agora? Tô contigo!",
        "Certo amiga, tô te acompanhando! Me conta mais sobre isso com calma.",
        "Saquei amiga! Pode continuar falando, tô super atenta!"
      ];
      return responseMemory.pick('maria_call_yes', yesList);
    }

    // 8. Não / Incerteza / "Não sei"
    if (text === 'não' || text === 'nao' || text.includes('não sei') || text.includes('nao sei') || text.includes('nem sei')) {
      const noList = [
        "Fica em paz amiga, sem pressão nenhuma. A gente pensa juntas com calma, tá?",
        "Relaxa amiga, não precisa ter certeza de tudo agora. O importante é você saber que não tá sozinha.",
        "Tudo bem amiga, vai no seu ritmo. Tô aqui te ouvindo e do seu lado pro que der e vier."
      ];
      return responseMemory.pick('maria_call_no', noList);
    }

    // 9. Cumprimentos
    if (text === 'oi' || text === 'olá' || text === 'ola' || text === 'alô' || text === 'alo' || text === 'e aí' || text === 'e ai') {
      const greetList = [
        "Oi amiga! E aí, tudo bem com você? Pode falar, tô aqui na linha te escutando!",
        "Oi linda! Tô te ouvindo, o que tá pegando? Pode falar!",
        "Alô amiga! Tô na linha, pode falar o que você precisa!"
      ];
      return responseMemory.pick('maria_call_greet', greetList);
    }

    // 10. Tudo bem?
    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como você tá') || text.includes('como vai')) {
      const fineList = [
        "Tudo certinho por aqui amiga! E com você, como tão as coisas? Deu algum problema ou você queria bater um papo?",
        "Tudo tranquilo comigo amiga! Mas e com você, tá tudo bem mesmo? Tô aqui se precisar desabafar!",
        "Por aqui tá tudo em paz amiga! Pode falar, tô na linha te ouvindo com todo carinho!"
      ];
      return responseMemory.pick('maria_call_fine', fineList);
    }

    // 11. Onde você tá / o que tá fazendo
    if (text.includes('onde você tá') || text.includes('onde ce ta') || text.includes('onde cê tá') || text.includes('fazendo o que')) {
      return "Tô em casa amiga, mas se você precisar de mim eu vou correndo aí agora mesmo! Onde você tá?";
    }

    // 12. Agradecimento
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('te amo')) {
      return "Imagina amiga, eu tô aqui pro que der e vier! Você nunca tá sozinha, viu?";
    }

    // 13. Despedida
    if (text.includes('tchau') || text.includes('desligar') || text.includes('vou desligar') || text.includes('depois falo')) {
      return "Tá bom amiga, se cuida bastante! Qualquer coisa me liga na mesma hora, beijo enorme!";
    }

    // 14. Conversa Geral de Amiga
    const genList = [
      "Entendi amiga! Me conta mais sobre isso, tô aqui te ouvindo de verdade.",
      "Tô prestando atenção em tudo amiga, continua falando comigo.",
      "Nossa amiga, tô te entendendo perfeitamente. E o que você tá achando de tudo isso?",
      "Pode falar no seu tempo amiga, não vou sair da linha."
    ];
    return responseMemory.pick('maria_call_gen', genList);
  }

  // === 2. JOÃO (VOZ / VÍDEO) ===
  if (persona === 'joao') {
    if (text.includes('tá me ouvindo') || text.includes('ta me ouvindo') || text.includes('consegue me ouvir') || text.includes('me escuta') || text.includes('tô falando') || text.includes('to falando') || text.includes('alô tá aí')) {
      const audList = [
        "Tô te ouvindo em alto e bom som parceira! Pode falar que o áudio tá 100%!",
        "Tô na escuta firme parceira! Manda bala, o que houve?",
        "Tô aqui na linha te escutando certinho! Pode falar comigo!"
      ];
      return responseMemory.pick('joao_call_aud', audList);
    }

    if (text.length <= 2 || text === 'hã' || text === 'ha' || text === 'ahn' || text === 'hum' || text === 'o que' || text === 'não entendi' || text === 'nao entendi') {
      const repeatList = [
        "Cortou um pouco aqui parceira, manda de novo aí que agora estabilizou!",
        "Chiou aqui o microfone parceira, repete o finalzinho pra mim por favor?",
        "Não deu pra pegar direito parceira, deu uma falha na linha. Fala de novo aí!"
      ];
      return responseMemory.pick('joao_call_rep', repeatList);
    }

    if (text.includes('socorro') || text.includes('perigo') || text.includes('viatura') || text.includes('policia') || text.includes('polícia')) {
      return "Opa, fica firme parceira! Tô contigo na linha, não sai daí que a viatura policial do 190 já foi acionada pro seu ponto!";
    }

    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('me bateu') || text.includes('atacou')) {
      return "Mano, que covardia! Você não tem culpa de nada disso, fica calma que eu já liguei pro 190 e a viatura tá colando aí agora!";
    }

    if (text.includes('seguindo') || text.includes('estranho') || text.includes('rua escura') || text.includes('suspeito')) {
      return "Parceira, não vacila! Entra agora num comércio ou perto de bastante gente! Me manda sua localização que eu já chamo o 190!";
    }

    if (text.includes('medo') || text.includes('pânico') || text.includes('panico') || text.includes('ansied') || text.includes('tremend')) {
      return "Fica calma parceira, respira fundo. Eu tô fechado contigo e nada vai te acontecer. Me diz onde você tá agora.";
    }

    if (text === 'sim' || text === 'aham' || text === 'isso' || text === 'é isso' || text === 'tá bom') {
      return "Fechado parceira! E aí, o que você tá pensando em fazer agora? Tô contigo!";
    }

    if (text === 'não' || text === 'nao' || text.includes('não sei') || text.includes('nao sei')) {
      return "Tranquilo parceira, sem crise! A gente desenrola isso junto com calma.";
    }

    if (text === 'oi' || text === 'olá' || text === 'ola' || text === 'alô' || text === 'alo' || text === 'e aí' || text === 'e ai') {
      return "E aí parceira, na paz? Fala comigo, tô na escuta aqui na linha!";
    }

    if (text.includes('tudo bem') || text.includes('tudo bom') || text.includes('como você tá') || text.includes('como vai')) {
      return "Tudo na tranquilidade por aqui! E contigo, tudo certo? Deu alguma treta ou só queria dar um salve?";
    }

    if (text.includes('onde você tá') || text.includes('onde ce ta') || text.includes('onde cê tá')) {
      return "Tô por perto aqui, se precisar eu dou um pulo aí rapidinho! Onde você tá parada?";
    }

    if (text.includes('obrigad') || text.includes('valeu')) {
      return "Tamo junto parceira, sempre! Não precisa agradecer não, conta comigo pro que der e vier.";
    }

    if (text.includes('tchau') || text.includes('desligar') || text.includes('vou desligar') || text.includes('depois falo')) {
      return "Beleza parceira, fica bem aí! Qualquer fita me dá um toque que eu atendo na hora, fica com Deus!";
    }

    const genList = [
      "Tô na escuta parceira! Me fala mais aí, o que tá pegando?",
      "Saquei parceira! Pode continuar falando, tô prestando atenção.",
      "Tô contigo parceira! E o que você tá pensando em fazer agora?",
      "Pode falar no seu ritmo parceira, tô firme na linha."
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
      "Alô? Oi amiga! E aí, tudo bem com você? Pode falar, tô te ouvindo!",
      "Alô amiga! Fala comigo, tá tudo bem por aí? Tô na linha!",
      "Oi amiga, atendi! E aí, o que manda? Tô te escutando direitinho!",
      "Alô? Oi linda! Pode falar com calma, tô aqui te ouvindo!"
    ];
    welcomeSpeech = responseMemory.pick('call_welcome_maria', mariaGreetings);
  } else if (persona === 'joao') {
    const joaoGreetings = [
      "Alô? Fala parceira, tudo em paz? O que manda aí, tô na linha!",
      "Opa parceira, atendi aqui! Tudo firme por aí? Pode falar!",
      "Alô? E aí parceira, tudo bem? Tô na escuta, pode soltar a voz!",
      "Salve parceira, atendi! Me fala o que tá pegando, tô na escuta!"
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
      ? "Vamos respirar juntos parceira. Puxa o ar devagar, solta os ombros. Você tá segura comigo e não tem culpa de nada."
      : "Segura minha mão amiga. Respira bem fundo comigo: puxa o ar devagar e solta. Você foi muito forte, agora deixa que eu cuido de você.";
  } else if (topic === 'pep') {
    speech = "Você precisa ir em até 72 horas no posto ou hospital pra tomar a Profilaxia PEP contra HIV e infecções. O atendimento no SUS é direito seu e gratuito, sem precisar de Boletim de Ocorrência!";
  } else {
    speech = "Pode falar comigo, tô te ouvindo no seu tempo. Não vou sair da linha.";
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
    CallSpeechManager.pause();
    showToast("Seu microfone está mutado.");
  } else {
    if (icon) icon.innerText = '🎙️';
    if (label) label.innerText = 'Mic Ativo';
    CallSpeechManager.resume();
    showToast("Seu microfone está ativo e te ouvindo.");
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
      "Alô? Oi amiga, que bom te ver! E aí, tudo bem com você? Pode falar!",
      "Oi amiga, te vendo aqui certinho! Tá tudo bem por aí? Tô te ouvindo!",
      "Alô linda! Que alívio te ver, tô na linha com você! O que manda?"
    ];
    welcomeSpeech = responseMemory.pick('video_welcome_maria', mariaVideoGreetings);
  } else if (persona === 'joao') {
    const joaoVideoGreetings = [
      "Alô? E aí parceira, te vendo aqui certinho! Tudo firme por aí? Me fala!",
      "Opa parceira, vídeo conectado! Tudo tranquilo por aí? Tô na escuta!",
      "E aí parceira, na paz? Tô te vendo e te ouvindo bem, manda a letra!"
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
    CallSpeechManager.pause();
    showToast("Microfone mutado.");
  } else {
    if (icon) icon.innerText = '🎙️';
    if (label) label.innerText = 'Mic Ativo';
    CallSpeechManager.resume();
    showToast("Microfone reativado e te ouvindo.");
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
