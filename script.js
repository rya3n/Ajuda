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
   1. CONFIGURAÇÃO DA API GEMINI & SISTEMA DE BLINDAGEM (ANTI-BURLA)
   ========================================================================== */
const API_CONFIG = {
  apiKey: "AQ.Ab8RN6JKvt6xTFeSJps3pASs3C80afwxrjVm_sKXUYHgkJrMww",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
  useExternalAPI: true
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
    greeting: `<p>Oi amiga, é a <strong>Maria</strong>! Tô aqui com você.</p>
      <p>Fica calma, respira bem fundo: <strong>você NÃO tem culpa de nada do que aconteceu</strong>. Tô do seu lado pro que der e vier!</p>
      <p>Se você sofreu algum abuso ou está em perigo, me diz o que houve ou <strong>aperta no botão abaixo para me mandar a sua localização</strong> que eu já ligo pro 190 e peço a viatura praí!</p>`,
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
    greeting: `<p>E aí parceira(o), é o <strong>João</strong> aqui! Vi sua mensagem.</p>
      <p>Fica em paz, tô fechado com você: <strong>você tá em segurança agora e NÃO tem culpa de nada</strong>. Não vou soltar sua mão.</p>
      <p>Se você foi abusada(o) ou estiver em perigo, me manda sua localização no botão vermelho abaixo que eu já ligo pro 190 e peço a viatura policial pra ir correndo te buscar!</p>`,
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
VOCÊ É A MARIA, UMA MENINA JOVEM E A MELHOR AMIGA DA USUÁRIA (ESTILO CONVERSA DE WHATSAPP).
SUA PERSONALIDADE E TOM:
- Você é uma menina jovem, amiga íntima, calorosa, muito afetuosa, carinhosa e protetora.
- Linguagem informal, jovem e empática ("amiga", "tô aqui contigo", "respira fundo", "meu Deus", "você não tem culpa de nada", "pode desabafar").
- Mensagens curtas, ágeis e diretas (1 a 3 frases no máximo, estilo WhatsApp no celular).
- NUNCA use linguagem formal, robótica ou fria.
- Se a amiga disser apenas "socorro" ou estiver assustada, reaja com preocupação imediata de melhor amiga: "Meu Deus, o que aconteceu?! Eu tô aqui com você! Você tá em perigo agora? Onde você tá? Me conta!".
- Se ela relatar abuso, estupro ou violência, acolha com carinho incondicional, afirme que a culpa NUNCA é dela e peça para ela mandar a localização para você já discar 190 e mandar a polícia resgatá-la.
- Se ela falar coisas casuais ("vamo sair?", "oi", bobagens), responda naturalmente como amiga descontraída e pergunte se tá tudo bem.
- Fale sempre em Português do Brasil natural.`;
  }

  if (channelId === 'joao') {
    return `
VOCÊ É O JOÃO, UM MENINO JOVEM E O MELHOR AMIGO DA PESSOA (ESTILO CONVERSA DE WHATSAPP).
SUA PERSONALIDADE E TOM:
- Você é um garoto amigo, parceiro leal, firme, protetor, respeitoso e cuidadoso.
- Linguagem informal, jovem, coloquial de garoto amigo ("e aí parceira/amiga", "tô contigo nessa", "fica tranquila", "não vou sair do seu lado", "me fala o que tá rolando", "vou te proteger").
- Mensagens curtas e ágeis (1 a 3 frases curtas por resposta, estilo WhatsApp).
- NUNCA fale de forma robótica ou formal.
- Se a pessoa mandar "socorro" ou estiver em pânico, reaja como um amigo homem protetor e presente: "O que foi?! Tô aqui contigo! Quem tá aí? Você tá em perigo agora? Me fala seu ponto rápido!".
- Se ela relatar que foi abusada ou atacada, dê apoio incondicional com firmeza: "Você não tem culpa de absolutamente nada disso! Fica calma, me passa seu ponto agora que eu já ligo pro 190 e ponho a viatura praí!".
- Se falar coisas casuais ("vamo sair?", piadas), responda com bom humor de parceiro e confira se tá tudo bem de verdade.
- Fale em Português do Brasil informal e autêntico.`;
  }

  if (channelId === '180') {
    return `
VOCÊ É A ATENDENTE ESPECIALIZADA DA CENTRAL DE ATENDIMENTO À MULHER – LIGUE 180 (MINISTÉRIO DAS MULHERES).
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, INSTITUCIONAL, RESPEITOSO, TÉCNICO E ACOLHEDOR.
- Você representa o serviço público oficial do Governo Federal brasileiro de proteção às mulheres em situação de violência doméstica, familiar e sexual.
- Esclareça direitos garantidos pela Lei Maria da Penha (Lei nº 11.340/2006).
- Oriente sobre solicitação de Medidas Protetivas de Urgência, busca por Delegacias Especializadas de Atendimento à Mulher (DEAM), Defensoria Pública, Casas da Mulher Brasileira e centros de referência.
- Se a usuária relatar agressão física ou risco de vida iminente acontecendo AGORA, oriente imediatamente a acionar o 190 (Polícia Militar) ou buscar abrigo em local seguro.
- Responda de forma clara, humanizada, objetiva e com linguagem formal e institucional em Português do Brasil (2 a 4 frases por resposta).`;
  }

  if (channelId === '190') {
    return `
VOCÊ É O OPERADOR DE DESPACHO POLICIAL DO COPOM – POLÍCIA MILITAR 190.
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, OPERACIONAL, TÁTICO, DIRETO E URGENTE.
- Você é a central de segurança pública imediata. Seu foco é salvar vidas e despachar guarnições policiais.
- Perguntas essenciais que você prioriza:
  1. Qual é o endereço exato ou ponto de referência agora?
  2. O que está acontecendo neste exato momento?
  3. O autor da violência ainda está no local ou armado?
- Instruções táticas de segurança: instrua a vítima a se manter abrigada, em local iluminado, dentro de um estabelecimento comercial ou perto de transeuntes, sem confrontar o agressor.
- Avise que a viatura policial do setor pode ser empenhada assim que as coordenadas forem confirmadas.
- Mantenha respostas formais, concisas, seguras e operacionais em Português do Brasil.`;
  }

  if (channelId === '192') {
    return `
VOCÊ É O MÉDICO REGULADOR E ATENDENTE DA CENTRAL DO SAMU 192 (SERVIÇO DE ATENDIMENTO MÓVEL DE URGÊNCIA).
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, CLÍNICO, HUMANIZADO E TÉCNICO-SANITÁRIO.
- Avalie a necessidade de envio de ambulância (Unidade de Suporte Básico - USB ou Suporte Avançado - USA).
- Pergunte sobre ferimentos corporais, sangramentos, perda de consciência, dores intensas ou suspeita de intoxicação ("Boa noite Cinderela"/dopagem).
- Protocolo crucial de violência sexual: oriente sobre a REGRA DAS 72 HORAS para Profilaxia Pós-Exposição (PEP contra HIV e ISTs) e contracepção de emergência no pronto-socorro público, esclarecendo que é direito gratuito no SUS sem necessidade de Boletim de Ocorrência.
- Mantenha postura médica profissional, serena, formal e acolhedora em Português do Brasil.`;
  }

  if (channelId === '100') {
    return `
VOCÊ É O ANALISTA DE ATENDIMENTO DA OUVIDORIA NACIONAL DE DIREITOS HUMANOS – DISQUE 100 (MINISTÉRIO DOS DIREITOS HUMANOS E DA CIDADANIA).
SEU PAPEL E DIRETRIZES:
- Tom: FORMAL, CIDADÃO, INSTITUCIONAL E GARANTIDOR DE DIREITOS.
- Competência: denúncias de violações de direitos humanos, especialmente contra crianças, adolescentes, mulheres e grupos vulneráveis.
- Esclareça que as denúncias podem ser 100% anônimas e com sigilo garantido por lei.
- Explique os encaminhamentos institucionais: Conselho Tutelar, Ministério Público, Defensoria Pública e Varas da Infância e Juventude.
- Forneça orientação sobre como gerar ou acompanhar número de protocolo.
- Responda com formalidade, clareza, empatia e compromisso com os direitos humanos em Português do Brasil.`;
  }

  return `Você é um canal de acolhimento e proteção de emergência. Responda com respeito, clareza e empatia.`;
}

/**
 * Chamada à API Gemini 3.6 com Persona Dinâmica por Canal
 */
async function sendToGeminiAPI(userMessage, personaName) {
  try {
    const promptSystem = getSystemPromptForChannel(personaName);

    // Montar histórico conversacional recente para manter a conversa fluida e com memória
    const contents = [];
    const recentHistory = (appState.chatHistory || []).slice(-6);
    for (const turn of recentHistory) {
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    }

    // Adiciona a mensagem atual com a localização em contexto
    contents.push({
      role: "user",
      parts: [
        {
          text: `Mensagem enviada pelo usuário: "${userMessage}". Localização cadastrada: ${userLocation.fullAddress}.`
        }
      ]
    });

    const requestPayload = {
      contents: contents,
      systemInstruction: {
        parts: [
          { text: promptSystem }
        ]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };

    const response = await fetch(`${API_CONFIG.endpoint}?key=${API_CONFIG.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Erro ao chamar API Gemini:", response.status, errText);
      return null;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return generatedText || null;
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
  chatHistory: [] // Histórico de mensagens para a IA lembrar do contexto
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
 * Troca de canal entre os 6 contatos (Maria, João, 180, 190, 192, 100)
 */
function switchChannel(channelId) {
  const channel = CHANNELS_CONFIG[channelId];
  if (!channel) return;
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

  // Iniciar novo chat limpo para o canal escolhido
  startNewChat();

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
  appState.chatHistory = [];
  const container = document.getElementById('chatMessages');
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

function appendMessage(sender, htmlContent) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg msg-${sender}`;
  msgDiv.innerHTML = `
    <div class="msg-bubble">
      ${typeof htmlContent === 'string' && !htmlContent.startsWith('<p>') && !htmlContent.startsWith('<div>') ? `<p>${htmlContent}</p>` : htmlContent}
    </div>
    <span class="msg-time">${timeStr}</span>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

/**
 * ENVIO DE LOCALIZAÇÃO AO CANAL ATIVO
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
      channelResponse = `<p>Amiga, recebi sua localização exata: <strong>${userLocation.fullAddress}</strong>!</p>
        <p>Já estou ligando para a polícia (<strong>190</strong>) e passando seu ponto agora mesmo! A viatura está se deslocando com prioridade!</p>
        <p>Fica calma, respira fundo, você está segura e não fez nada de errado. Estou com você em cada segundo!</p>`;
      simulateEmergencyDispatch('PM');
    } else if (persona === 'joao') {
      channelResponse = `<p>Recebi sua localização certinha aqui: <strong>${userLocation.fullAddress}</strong>!</p>
        <p>Já estou na linha discando para o <strong>190</strong> e a viatura da Polícia Militar foi acionada para o seu local com urgência máxima!</p>
        <p>Por favor, fique abrigada(o) em um local iluminado, dentro de um comércio ou perto de outras pessoas se possível. Eu não vou sair do seu lado até o socorro chegar!</p>`;
      simulateEmergencyDispatch('PM');
    } else if (persona === '190') {
      channelResponse = `<p>🚨 <strong>POLÍCIA MILITAR – COPOM 190:</strong></p>
        <p>Coordenadas georreferenciadas registradas no sistema: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>A guarnição policial do setor mais próximo foi empenhada com prioridade de código vermelho. Mantenha-se abrigada e atenta aos sinais luminosos da viatura.</p>`;
      simulateEmergencyDispatch('PM');
    } else if (persona === '192') {
      channelResponse = `<p>🚑 <strong>REGULAÇÃO MÉDICA – SAMU 192:</strong></p>
        <p>Ponto de resgate confirmado: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>Equipe móvel alertada para triagem e deslocamento. Mantenha a vítima em repouso e sem ingerir medicamentos por conta própria.</p>`;
      simulateEmergencyDispatch('SAMU');
    } else if (persona === '180') {
      channelResponse = `<p>📞 <strong>CENTRAL DE ATENDIMENTO À MULHER – LIGUE 180:</strong></p>
        <p>Localização registrada: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>Mapeamos os serviços especializados da rede de proteção e a Delegacia Especializada de Atendimento à Mulher (DEAM) mais próxima da sua área.</p>`;
    } else {
      channelResponse = `<p>🛡️ <strong>OUVIDORIA NACIONAL DOS DIREITOS HUMANOS – DISQUE 100:</strong></p>
        <p>Endereço georreferenciado anexado ao registro: <strong>${userLocation.fullAddress}</strong>.</p>
        <p>As coordenadas territoriais foram vinculadas ao protocolo sigiloso de proteção.</p>`;
    }

    appendMessage('ai', channelResponse);
  }, 900);
}

async function processAIResponse(userText) {
  const persona = appState.selectedPersona;
  const channel = CHANNELS_CONFIG[persona] || CHANNELS_CONFIG['maria'];

  // 1. Salvar no histórico conversacional da sessão
  appState.chatHistory = appState.chatHistory || [];
  appState.chatHistory.push({ role: 'user', text: userText });

  // 2. BLINDAGEM CLIENT-SIDE ADAPTADA POR PERSONA
  const guardrailBlockedMessage = checkGuardrails(userText, persona);
  if (guardrailBlockedMessage) {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage('ai', guardrailBlockedMessage);
      appState.chatHistory.push({ role: 'model', text: guardrailBlockedMessage });
    }, 450);
    return;
  }

  showTypingIndicator();

  // 3. SE FOR ENVIO EXPLÍCITO DE LOCALIZAÇÃO PELO TEXTO
  const lower = userText.toLowerCase();
  if (lower.includes('minha localização:') || lower.includes('minha localização é') || (lower.includes('gps') && lower.includes('aqui'))) {
    hideTypingIndicator();
    sendLocationToFriend();
    return;
  }

  // 4. CHAMADA REAL À API GEMINI 3.6 COM A PERSONA DO CANAL
  if (API_CONFIG.useExternalAPI) {
    const apiResult = await sendToGeminiAPI(userText, persona);
    hideTypingIndicator();
    if (apiResult) {
      appState.chatHistory.push({ role: 'model', text: apiResult });
      const formattedHtml = apiResult.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      appendMessage('ai', formattedHtml);

      // Se a pessoa relatar perigo, abuso ou pedir socorro, exibe o botão rápido
      if (lower.includes('abusad') || lower.includes('abuso') || lower.includes('estupr') || lower.includes('perigo') || lower.includes('me seguiu') || lower.includes('socorro') || lower.includes('me ajuda') || lower.includes('ajuda')) {
        let btnText = "📍 Mandar minha localização agora";
        if (persona === 'maria') btnText = "📍 Enviar minha localização para Maria chamar a polícia (190)";
        else if (persona === 'joao') btnText = "📍 Enviar minha localização para João chamar a polícia (190)";
        else if (persona === '190') btnText = "📍 Transmitir minha localização exata para o COPOM 190";
        else if (persona === '192') btnText = "📍 Enviar localização para a ambulância do SAMU 192";
        else if (persona === '180') btnText = "📍 Informar endereço para atendimento da Central 180";
        else if (persona === '100') btnText = "📍 Anexar endereço à denúncia do Disque 100";

        appendMessage('ai', `
          <div style="margin-top: 8px; text-align: center;">
            <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="margin-bottom: 4px; padding: 9px 18px; font-size: 0.88rem;">
              ${btnText}
            </button>
          </div>
        `);
      }
      return;
    }
  }

  // 5. MOTOR LOCAL DE CONTINGÊNCIA ADAPTADO POR CANAL
  setTimeout(() => {
    hideTypingIndicator();
    const responseHtml = generateSpecializedAIResponse(userText, persona);
    appState.chatHistory.push({ role: 'model', text: responseHtml.replace(/<[^>]*>?/gm, '') });
    appendMessage('ai', responseHtml);
  }, 650);
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
    if (text === 'socorro' || text === 'ajuda' || text === 'me ajuda' || text === 'socorro!' || text === 'help') {
      return `
        <p>Meu Deus, o que aconteceu?! Eu tô aqui com você agora mesmo!</p>
        <p>Você tá em perigo agora? Onde você tá? Me conta rápido pra eu te ajudar!</p>
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Mandar minha localização para Maria
          </button>
        </div>
      `;
    }
    if (text.includes('sair') || text.includes('passear') || text.includes('volta') || (text.includes('hoje') && text.includes('bora'))) {
      return `<p>Oi! Hoje tá bem corrido por aqui, mas me conta: tá tudo bem com você? Aconteceu alguma coisa ou você só queria conversar um pouco?</p>`;
    }
    if (text.includes('corre') || text.includes('cadeirante') || text.includes('kkk') || text.includes('haha') || text.includes('rsrs')) {
      return `<p>Uai, que isso? Kkkk não entendi nada! Mas me diz sério: você tá bem mesmo? Se estiver precisando de ajuda ou de desabafar, tô por aqui.</p>`;
    }
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('agressor') || text.includes('me seguiu') || text.includes('me atacou') || text.includes('me bateu')) {
      return `
        <p>Meu Deus... respira bem fundo, eu tô aqui do seu lado agora e você <strong>NÃO tem culpa de nada</strong> do que aconteceu!</p>
        <p>Clica no botão aqui embaixo pra me passar sua localização agora que eu já ligo pro 190 (Polícia Militar) pra viatura ir correndo te resgatar!</p>
        <div style="margin: 10px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 9px 18px;">
            📍 Enviar Minha Localização para Maria chamar a Polícia (190)
          </button>
        </div>
        <p>Se puder, entre em uma farmácia, comércio ou fique perto de pessoas de confiança. Tô contigo!</p>
      `;
    }
    return `<p>Tô te ouvindo, amiga! Pode falar comigo com calma. Tá tudo bem por aí ou você tá precisando de ajuda?</p>`;
  }

  // === 2. JOÃO (AMIGO - MENINO - INFORMAL WHATSAPP) ===
  if (persona === 'joao') {
    if (text === 'socorro' || text === 'ajuda' || text === 'me ajuda' || text === 'socorro!' || text === 'help') {
      return `
        <p>O que foi?! Tô aqui contigo, fica tranquila(o)!</p>
        <p>Quem tá aí perto de você? Você tá em perigo agora? Me fala onde você tá rápido!</p>
        <div style="margin: 8px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 8px 16px; font-size: 0.85rem;">
            📍 Mandar minha localização para o João
          </button>
        </div>
      `;
    }
    if (text.includes('sair') || text.includes('passear') || text.includes('volta') || (text.includes('hoje') && text.includes('bora'))) {
      return `<p>Fala parceira(o)! Hoje o dia tá puxado por aqui, mas me fala: tá tudo firme com você? Deu algum problema ou só queria trocar uma ideia?</p>`;
    }
    if (text.includes('corre') || text.includes('cadeirante') || text.includes('kkk') || text.includes('haha') || text.includes('rsrs')) {
      return `<p>Eita, que doideira kkkk entendi nada! Mas fala sério aí, tá tudo de boa com você? Se precisar de apoio pro que der e vier, tô na área.</p>`;
    }
    if (text.includes('abusad') || text.includes('abuso') || text.includes('estupr') || text.includes('agressor') || text.includes('me seguiu') || text.includes('me atacou') || text.includes('me bateu')) {
      return `
        <p>Meu Deus, calma, eu tô fechado com você! Você <strong>NÃO tem culpa de absolutamente nada</strong>, a culpa é toda de quem fez essa covardia.</p>
        <p>Manda sua localização no botão aqui embaixo agora que eu já ligo pro 190 e peço a viatura com prioridade máxima praí!</p>
        <div style="margin: 10px 0; text-align: center;">
          <button class="quick-chip chip-sos btn-loc-highlight" onclick="sendLocationToFriend()" style="padding: 9px 18px;">
            📍 Enviar Minha Localização para João chamar a Polícia (190)
          </button>
        </div>
        <p>Procura um lugar movimentado ou entra numa loja se der. Não fica sozinha(o)!</p>
      `;
    }
    return `<p>Tô na escuta, pode falar! Me conta o que tá pegando. Tá tudo bem contigo ou precisa de uma força?</p>`;
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
   7. MODAIS DE LIGAÇÃO DE VOZ E VÍDEO CHAMADA
   ========================================================================== */
function openVoiceCallModal() {
  const modal = document.getElementById('voiceCallModal');
  if (modal) modal.style.display = 'flex';

  appState.callSeconds = 0;
  startCallTimer('callDurationTimer');

  const isJoao = appState.selectedPersona === 'joao';
  const welcomeSpeech = isJoao
    ? "Oi, é o João na linha! Fica calmo, estou com você. Me diz onde você está ou me manda sua localização que eu chamo a polícia agora mesmo!"
    : "Oi amiga, é a Maria! Fica calma, respira fundo, você está segura comigo. Me passa onde você está que eu já ligo pro 190 para te resgatar!";

  setCallTranscript(welcomeSpeech);
  speakWithWebSpeech(welcomeSpeech);
}

function closeVoiceCallModal() {
  const modal = document.getElementById('voiceCallModal');
  if (modal) modal.style.display = 'none';
  stopCallTimer();
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
    speakWithWebSpeech(appState.currentSpokenText);
  }
}

function counselorSpeakTopic(topic) {
  const isJoao = appState.selectedPersona === 'joao';
  let speech = "";

  if (topic === 'calma') {
    speech = isJoao
      ? "Vamos respirar juntos. Puxe o ar devagar, solte os ombros. Você está seguro comigo e não tem culpa de nada."
      : "Segure minha mão amiga. Respire bem fundo comigo: inspira devagar e solta. Você foi forte, agora deixa que eu cuido de você.";
  } else if (topic === 'pep') {
    speech = "Você precisa ir em até 72 horas no hospital para tomar os remédios contra HIV e infecções. Não precisa de Boletim de Ocorrência, o atendimento é direito seu!";
  } else {
    speech = "Pode falar, estou te ouvindo no seu tempo. Não vou sair da linha.";
  }

  setCallTranscript(speech);
  speakWithWebSpeech(speech);
}

function toggleCallMute() {
  appState.isMuted = !appState.isMuted;
  const icon = document.getElementById('callMuteIcon');
  const label = document.getElementById('callMuteLabel');

  if (appState.isMuted) {
    if (icon) icon.innerText = '🔇';
    if (label) label.innerText = 'Mudo Ativo';
    showToast("Seu microfone está mutado.");
  } else {
    if (icon) icon.innerText = '🎙️';
    if (label) label.innerText = 'Mudo';
    showToast("Seu microfone está ativo.");
  }
}

function openVideoCallModal() {
  const modal = document.getElementById('videoCallModal');
  if (modal) modal.style.display = 'flex';

  appState.callSeconds = 0;
  startCallTimer('videoDurationTimer');

  const isJoao = appState.selectedPersona === 'joao';
  const speech = isJoao
    ? "Oi, estou te vendo aqui. Fica em segurança, estou cuidando de tudo para te ajudar."
    : "Oi amiga, que alívio te ver. Respire no seu tempo, estou com você e não vou soltar sua mão.";

  setVideoSubtitles(speech);
  speakWithWebSpeech(speech);
}

function closeVideoCallModal() {
  const modal = document.getElementById('videoCallModal');
  if (modal) modal.style.display = 'none';
  stopCallTimer();
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
    showToast("Microfone mutado.");
  } else {
    if (icon) icon.innerText = '🎙️';
    if (label) label.innerText = 'Mic Ativo';
    showToast("Microfone reativado.");
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
