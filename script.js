/* Ponto Seguro: chat e chamadas simuladas para uma apresentação acadêmica.
 * portal.js cuida das telas, do mascote e dos exercícios.
 * A integração original é carregada automaticamente pelo servidor local.
 */
const API_CONFIG = { useExternalAPI: true };
const apiConnection = { configured: null, available: false, error: null };
// Uma fila por histórico: texto, voz e vídeo usam a mesma conversa do canal.
const conversationQueues = new WeakMap();

/* ==========================================================================
   CONFIGURAÇÃO DOS 6 CANAIS DE ATENDIMENTO (EMERGÊNCIAS + AMIGOS)
   ========================================================================== */
const CHANNELS_CONFIG = {
  soli: {
    id: 'soli',
    type: 'friend',
    name: 'Soli',
    gender: 'neutral',
    fullName: 'Soli • Sempre ao seu lado',
    subtitle: 'Aqui para ouvir, no seu tempo',
    emoji: '🌱',
    sidebarId: 'sidebarChannelSoli',
    callBtnLabel: 'Ligar por Voz',
    isEmergencyService: false,
    phone: '190',
    greeting: `<p>Oi, eu sou a Soli. Estou aqui com você.</p><p>Podemos conversar ou fazer um exercício, um passo de cada vez. Como você está agora?</p>`,
    chips: CHANNEL_PRESETS['soli']
  },
  '180': {
    id: '180',
    type: 'emergency',
    name: 'Central 180',
    fullName: 'Central 180 • Atendimento à Mulher',
    subtitle: 'Demonstração • Orientação e acolhimento',
    emoji: '📞',
    sidebarId: 'sidebarChannel180',
    callBtnLabel: 'Ligar 180',
    isEmergencyService: true,
    phone: '180',
    greeting: `<p>Você está no exemplo de atendimento do canal 180.</p><p>Este chat é uma demonstração acadêmica. Para falar com o serviço real, use o botão <strong>Ligar 180</strong>.</p>`,
    chips: CHANNEL_PRESETS['180']
  },
  '190': {
    id: '190',
    type: 'emergency',
    name: 'Polícia Militar 190',
    fullName: 'Polícia Militar • COPOM 190',
    subtitle: 'Demonstração • Emergência policial',
    emoji: '🚨',
    sidebarId: 'sidebarChannel190',
    callBtnLabel: 'Ligar 190',
    isEmergencyService: true,
    phone: '190',
    greeting: `<p>Você está no exemplo de atendimento do canal 190.</p><p>Este chat é uma demonstração acadêmica. Para falar com o serviço real, use o botão <strong>Ligar 190</strong>.</p>`,
    chips: CHANNEL_PRESETS['190']
  },
  '192': {
    id: '192',
    type: 'emergency',
    name: 'SAMU 192',
    fullName: 'SAMU 192 • Regulação Médica',
    subtitle: 'Demonstração • Urgência médica',
    emoji: '🚑',
    sidebarId: 'sidebarChannel192',
    callBtnLabel: 'Ligar 192',
    isEmergencyService: true,
    phone: '192',
    greeting: `<p>Você está no exemplo de atendimento do canal 192.</p><p>Este chat é uma demonstração acadêmica. Para falar com o serviço real, use o botão <strong>Ligar 192</strong>.</p>`,
    chips: CHANNEL_PRESETS['192']
  },
  '100': {
    id: '100',
    type: 'emergency',
    name: 'Disque 100',
    fullName: 'Disque 100 • Direitos Humanos',
    subtitle: 'Demonstração • Direitos humanos',
    emoji: '🛡️',
    sidebarId: 'sidebarChannel100',
    callBtnLabel: 'Ligar 100',
    isEmergencyService: true,
    phone: '100',
    greeting: `<p>Você está no exemplo de atendimento do canal 100.</p><p>Este chat é uma demonstração acadêmica. Para falar com o serviço real, use o botão <strong>Ligar 100</strong>.</p>`,
    chips: CHANNEL_PRESETS['100']
  }
};

CHANNELS_CONFIG.professional = {
  id: 'professional', type: 'professional', name: 'Profissional',
  fullName: 'Acolhimento profissional • Demonstração', subtitle: 'Atendimento simulado para a apresentação',
  emoji: '✧', sidebarId: '', callBtnLabel: 'Áudio', isEmergencyService: false,
  greeting: '<p>Olá. Este é um exemplo de acolhimento profissional para a apresentação.</p><p>Como você está se sentindo? Podemos conversar por texto, áudio ou vídeo.</p>',
  chips: CHANNEL_PRESETS.professional
};

/**
 * BLINDAGEM CLIENT-SIDE ADAPTADA POR PERSONA
 */
function getSystemPromptForChannel(channelId) {
  const channel = CHANNELS_CONFIG[channelId] || CHANNELS_CONFIG.soli;
  return `Você é ${channel.id === 'soli' ? 'Soli, um mascote virtual sem gênero definido' : 'um atendente virtual de demonstração de ' + channel.name}, em um protótipo acadêmico de acolhimento.
${CHANNEL_GUIDANCE[channel.id] || CHANNEL_GUIDANCE.soli}
Use português brasileiro simples, respeitoso e próximo, com 2 a 4 frases por resposta, sem markdown. Ouça sem julgamentos.
Leia todo o histórico antes de responder. Continue a conversa a partir da última informação recebida, lembrando fatos, pedidos e respostas anteriores.
Uma afirmação em uma resposta sua não confirma um fato sobre a pessoa. Diferencie observação, dúvida, hipótese e pergunta do usuário. Se ele mudar de assunto, acompanhe a mudança sem retomar o anterior por conta própria.
Entenda respostas curtas como sim, não, não sei, já saiu e pode ser à luz da sua última pergunta. Não exija palavras-chave nem uma frase específica.
Responda primeiro ao que a pessoa perguntou ou escolheu no atalho. Faça no máximo uma pergunta pertinente por vez. Não repita perguntas já respondidas, a saudação, um conselho ou uma lista de telefones a cada turno.
Se a pessoa repetir um pedido, esclareça ou avance um passo, sem repetir a mesma resposta. Se não entender, peça um esclarecimento breve relacionado ao assunto anterior.
Não invente fatos sobre a pessoa, sua localização, disponibilidade de serviços ou detalhes da ocorrência. Use apenas dados que a pessoa informou nesta conversa.
Não se apresente como pessoa ou profissional real. Não faça diagnósticos nem prescreva medicamentos.
Não existe vínculo com serviços oficiais. Nunca afirme que acionou socorro ou enviou informações a autoridades.
Em perigo imediato, indique a ligação para 190; urgência médica, 192. Nunca garanta a segurança de alguém.
Ao falar de violência, reafirme que a culpa não é da vítima e incentive apoio humano e atendimento de saúde.
Não transforme toda resposta em exercício de respiração ou grounding. Ofereça-os no canal Soli quando solicitados ou pertinentes, sem prometer resultados.
Respeite a preferência de só conversar. Para começar um exercício opcional, aguarde uma escolha clara; não interprete uma dúvida como consentimento.
Não repita a indicação de demonstração em cada mensagem: a interface já a exibe. Esclareça esse limite se a pessoa pedir atendimento, registro de denúncia ou envio de socorro real.`;
}

async function requestGeminiText(contents, systemText, maxTokens = 1000) {
  if (!API_CONFIG.useExternalAPI) return null;
  // An invalid credential cannot recover between turns. Avoid making every
  // message wait for the same rejection; a page reload checks the API again.
  if (apiConnection.error === 'credentials') return null;
  if (apiConnection.configured === null) await refreshApiConnection();
  if (!apiConnection.configured) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: systemText }] },
        generationConfig: { temperature: 0.65, maxOutputTokens: maxTokens } }),
      signal: controller.signal
    });
    const data = await response.json();
    if (response.ok && typeof data.text === 'string' && data.text.trim()) {
      apiConnection.error = null;
      updateApiConnectionDisplay();
      return data.text.trim();
    }
    apiConnection.error = data.error || 'unavailable';
    if (data.error === 'not_configured') apiConnection.configured = false;
  } catch (error) {
    apiConnection.error = 'unavailable';
  } finally {
    clearTimeout(timer);
  }
  updateApiConnectionDisplay();
  return null;
}

function buildConversationContents(history) {
  // Guarda até 80 mensagens limpas. Modelos não recebem controles da interface.
  const contents = [];
  for (const turn of history.slice(-80)) {
    if (!turn.text || !['user', 'model'].includes(turn.role)) continue;
    if (!contents.length && turn.role === 'model') continue;
    const previous = contents[contents.length - 1];
    if (previous?.role === turn.role) previous.parts[0].text += '\n' + turn.text;
    else contents.push({ role: turn.role, parts: [{ text: turn.text }] });
  }
  return contents;
}

async function getConversationResponse(userText, persona, history, context = {}) {
  let prompt = getSystemPromptForChannel(persona);
  if (context.intent) prompt += `\nO pedido atual veio do atalho ${context.intent}. Atenda ao assunto desse pedido e continue o histórico.`;
  if (context.isCall) prompt += '\nEsta resposta será lida em voz alta: use 1 a 3 frases curtas, sem emojis nem formatação.';
  const response = await requestGeminiText(buildConversationContents(history), prompt, context.isCall ? 900 : 1600);
  return response || getLocalConversationReply(userText, persona, history, context);
}

function queueConversationTurn(userText, persona, context = {}) {
  const history = appState.channelHistories[persona];
  let queue = conversationQueues.get(history);
  if (!queue) { queue = { tail: Promise.resolve(), pending: 0 }; conversationQueues.set(history, queue); }
  queue.pending++;
  syncTypingIndicator();
  const current = () => appState.channelHistories[persona] === history && !context.isCancelled?.();
  const result = queue.tail.then(async () => {
    if (!current()) return null;
    history.push({ role: 'user', text: userText });
    const text = await getConversationResponse(userText, persona, history, context);
    if (!current()) return null;
    history.push({ role: 'model', text });
    return text;
  });
  // A falha de um turno não bloqueia as mensagens seguintes.
  queue.tail = result.catch(() => null);
  return result.finally(() => { queue.pending--; syncTypingIndicator(); });
}

async function refreshApiConnection() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    apiConnection.available = response.ok;
    apiConnection.configured = response.ok && data.configured === true;
  } catch {
    apiConnection.available = false;
    apiConnection.configured = false;
  }
  updateApiConnectionDisplay();
}

function updateApiConnectionDisplay() {
  const status = document.getElementById('apiConnectionStatus');
  if (!status) return;
  status.hidden = apiConnection.configured && !apiConnection.error;
  status.textContent = status.hidden ? '' : 'Conversa em modo local';
  status.title = apiConnection.error ? 'O serviço de conversa está indisponível. As orientações locais continuam disponíveis.' : '';
  status.dataset.mode = 'local';
}

/* ==========================================================================
   2. ESTADO GLOBAL DA APLICAÇÃO
   ========================================================================== */
const appState = {
  selectedPersona: 'soli', // Soli, profissional e canais simulados de emergência
  isSidebarOpen: false,
  callTimerInterval: null,
  callSeconds: 0,
  isMuted: false,
  isWebcamActive: false,
  webcamStream: null,
  currentSpokenText: "",
  channelHistories: {
    professional: [],
    soli: [],
    '180': [],
    '190': [],
    '192': [],
    '100': []
  },
  channelDomCache: {
    professional: null,
    soli: null,
    '180': null,
    '190': null,
    '192': null,
    '100': null
  }
};

// Dados da Localização Real do Usuário (GPS)
const userLocation = {
  address: "Identificando satélite...",
  fullAddress: "Localização ainda não identificada",
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
  refreshApiConnection();
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
 * Troca entre Soli, profissional e canais de emergência simulados
 * Preserva o histórico de conversas individual de cada contato
 */
function switchChannel(channelId) {
  const channel = CHANNELS_CONFIG[channelId];
  if (!channel) return;
  navigatePortal('chat');

  const oldPersona = appState.selectedPersona;
  const container = document.getElementById('chatMessages');

  // Salvar o DOM atual do canal anterior
  if (container && oldPersona) {
    hideTypingIndicator();
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
  closeMobileSidebar();
  syncTypingIndicator();

  showToast(`Canal ativo: ${channel.name}.`);
}

// Manter compatibilidade com chamadas antigas
function switchFriendFromSidebar(friendId) {
  switchChannel(friendId);
}

function updateTopFriendDisplay() {
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG.soli;

  const topName = document.getElementById('topFriendName');
  const topSubtitle = document.getElementById('topFriendSubtitle');
  const topAvatar = document.getElementById('topAvatarMini');
  const chatInput = document.getElementById('chatInput');
  const topCallLabel = document.getElementById('topCallLabel');
  const topCallBtn = document.getElementById('topCallBtn');

  if (topName) topName.innerText = channel.fullName;
  if (topSubtitle) topSubtitle.innerText = channel.subtitle;
  if (topAvatar) topAvatar.innerHTML = channel.id === 'soli' ? soliImage('', '') : escapeHtml(channel.emoji);
  if (chatInput) {
    if (channel.type === 'friend') {
      chatInput.placeholder = 'Escreva no seu tempo...';
    } else {
      chatInput.placeholder = `Converse com ${channel.name} (demonstração)...`;
    }
  }

  if (topCallLabel) topCallLabel.innerText = channel.callBtnLabel;
  if (topCallBtn) {
    topCallBtn.title = `Iniciar chamada de voz simulada com ${channel.name}`;
    if (channel.isEmergencyService && topCallLabel) topCallLabel.innerText = 'Áudio simulado';
  }
  const realCallLink = document.getElementById('realCallLink');
  if (realCallLink) {
    realCallLink.hidden = !channel.isEmergencyService;
    realCallLink.href = channel.isEmergencyService ? `tel:${channel.phone}` : '#';
    realCallLink.textContent = `Ligar ${channel.phone} (real)`;
  }

  // A seleção do chat não muda a identidade de uma ligação em andamento.
  const callChannel = CallSpeechManager.isCalling ? (CHANNELS_CONFIG[appState.callPersonaId] || channel) : channel;
  const callName = document.getElementById('callPersonaName');
  const callSubtitle = document.getElementById('callPersonaSubtitle');
  const callAvatar = document.getElementById('callAvatarEmoji');
  if (callName) callName.innerText = callChannel.name;
  if (callSubtitle) callSubtitle.innerText = callChannel.subtitle;
  if (callAvatar) callAvatar.innerHTML = callChannel.id === 'soli' ? soliImage('', '') : escapeHtml(callChannel.emoji);

  const videoName = document.getElementById('videoCounselorName');
  const videoAvatar = document.getElementById('videoAvatarEmoji');
  if (videoName) videoName.innerText = callChannel.name;
  if (videoAvatar) videoAvatar.innerHTML = callChannel.id === 'soli' ? soliImage('', '') : escapeHtml(callChannel.emoji);
}

function handleTopCallClick() {
  openVoiceCallModal();
}

function updateQuickChipsForChannel(channelId) {
  const bar = document.getElementById('quickChipsBar');
  if (!bar) return;
  const channel = CHANNELS_CONFIG[channelId] || CHANNELS_CONFIG.soli;
  if (!channel.chips) return;

  bar.innerHTML = channel.chips.map(chip => {
    let classes = 'quick-chip';
    if (chip.isSos) classes += ' chip-sos';
    if (chip.isHighlight) classes += ' btn-loc-highlight';

    return `<button class="${classes}" onclick="sendChannelPreset('${chip.id}')" title="${escapeHtml(chip.text)}">${escapeHtml(chip.text)}</button>`;
  }).join('');
}

function startNewChat() {
  navigatePortal('chat');
  const container = document.getElementById('chatMessages');
  const persona = appState.selectedPersona;
  if (CallSpeechManager.isCalling && appState.callPersonaId === persona) {
    if (CallSpeechManager.activeModalType === 'video') closeVideoCallModal();
    else closeVoiceCallModal();
  }
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
  syncTypingIndicator();
}

/* ==========================================================================
   5. CHAT DE MENSAGENS COM A IA E CANAIS DE ATENDIMENTO
   ========================================================================== */
function initChatForActiveFriend() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG.soli;
  appendMessage('ai', channel.greeting);
}

function handleSendMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage('user', msg, { recordHistory: false });
  input.value = '';

  processAIResponse(msg);
}

function sendQuickMessage(text, context = {}) {
  appendMessage('user', text, { recordHistory: false });
  return processAIResponse(text, context);
}

function sendChannelPreset(id, inCall = false) {
  const persona = inCall ? appState.callPersonaId : appState.selectedPersona;
  const preset = getPresetForChannel(persona, id);
  if (!preset) return;
  if (preset.isLoc) return sendLocationToFriend(inCall);
  const context = { intent: preset.intent };
  if (inCall) {
    updateUserSpeechDisplay(preset.message);
    return handleCallUserSpeech(preset.message, context);
  }
  return sendQuickMessage(preset.message, context);
}

function appendMessage(sender, htmlContent, options = {}) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const persona = options.channelId || appState.selectedPersona;
  // Extrair só o conteúdo, antes de inserir áudio, reações e aviso de simulação.
  const contentNode = document.createElement('div');
  contentNode.innerHTML = sender === 'user' ? escapeHtml(htmlContent) : htmlContent;
  const historyText = options.historyText ?? (contentNode.textContent || '').trim();
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

  if (sender === 'user') htmlContent = `<p>${escapeHtml(htmlContent)}</p>`;
  const mascot = sender === 'ai' && persona === 'soli' ? soliImage('soli-msg-avatar', '') : '';
  if (sender === 'ai' && CHANNELS_CONFIG[persona]?.isEmergencyService) extraContent += '<small class="simulation-label">Atendimento simulado • Nenhuma ocorrência é enviada.</small>';
  msgDiv.innerHTML = `
    <div class="msg-bubble">
      ${mascot}
      ${typeof htmlContent === 'string' && !htmlContent.startsWith('<p>') && !htmlContent.startsWith('<div>') ? `<p>${htmlContent}</p>` : htmlContent}
      ${extraContent}
    </div>
    <span class="msg-time">${timeStr}</span>
  `;

  if (persona === appState.selectedPersona) {
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  } else {
    appState.channelDomCache[persona] = (appState.channelDomCache[persona] || '') + msgDiv.outerHTML;
  }

  // Registrar no histórico do canal ativo para a IA manter a memória da conversa
  if (options.recordHistory !== false && appState.channelHistories && appState.channelHistories[persona]) {
    if (historyText) {
      appState.channelHistories[persona].push({
        role: sender === 'user' ? 'user' : 'model',
        text: historyText
      });
    }
  }
}

/**
 * ENVIO DE LOCALIZAÇÃO AO CANAL ATIVO COM FEEDBACK TÁTICO
 */
function sendLocationToFriend(inCall = false) {
  const persona = inCall ? appState.callPersonaId : appState.selectedPersona;
  // O endereço obtido automaticamente aparece só no dispositivo, fora do histórico da IA.
  if (userLocation.coords) {
    appendMessage('ai', `<p>Localização neste dispositivo: <strong>${escapeHtml(userLocation.fullAddress)}</strong>.</p><p>Nenhum endereço foi enviado ao serviço ou à IA.</p><button class="secondary-button" onclick="copyLocationCoords()">Copiar localização</button>`, { channelId: persona, recordHistory: false, skipExtras: true });
  }
  const text = userLocation.coords
    ? 'Quero orientação para informar um endereço ou ponto de referência ao atendimento real.'
    : 'Minha localização está indisponível. Como posso informar um endereço ou ponto de referência?';
  const context = { intent: 'location' };
  if (inCall) {
    updateUserSpeechDisplay(text);
    return handleCallUserSpeech(text, context);
  }
  return sendQuickMessage(text, context);
}

async function processAIResponse(userText, context = {}) {
  const persona = appState.selectedPersona;
  const history = appState.channelHistories[persona];
  const text = await queueConversationTurn(userText, persona, context);
  if (!text || appState.channelHistories[persona] !== history) return;
  let html = `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
  if (persona === 'soli' && /breathing|grounding/.test(context.intent || '')) html += createBreathingCardHtml();
  appendMessage('ai', html, { channelId: persona, recordHistory: false });
}

/**
 * COMPONENTES VISUAIS E DE ÁUDIO DE ALTA IMERSÃO
 */
function createVoiceNoteHtml(text, persona) {
  const channel = CHANNELS_CONFIG[persona] || CHANNELS_CONFIG.soli;
  const textNode = document.createElement('div');
  textNode.innerHTML = text;
  const clean = (textNode.textContent || '').replace(/[\n\r]+/g, ' ').replace(/'/g, '').trim();
  const label = `Mensagem de voz • ${channel.name}`;

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
  return `<div class="breathing-card"><div class="breathing-title">Um momento de cuidado</div><div class="breathing-desc">Você pode respirar com a Soli ou observar o que está ao seu redor.</div><div class="calming-actions"><button class="primary-button" onclick="openExercise('breathing')">Respiração</button><button class="secondary-button" onclick="openExercise('grounding')">Grounding</button></div></div>`;
}

function createSamuPepCardHtml() {
  return `
    <div class="samu-pep-card">
      <div class="samu-pep-header">⏱️ PROTOCOLO DE URGÊNCIA • PEP 72 HORAS</div>
      <div class="samu-pep-body">
        <p><strong>Janela de Ouro:</strong> A Profilaxia Pós-Exposição (PEP) deve ser iniciada nas primeiras <strong>72 horas</strong> após o fato para reduzir o risco de infecção pelo HIV, após avaliação profissional.</p>
        <ul style="margin: 6px 0 6px 18px;">
          <li>Atendimento médico e medicamentos 100% gratuitos no SUS.</li>
          <li>Disponível em qualquer UPA ou Pronto-Socorro 24h.</li>
          <li><strong>Não é obrigatório</strong> ter Boletim de Ocorrência nem autorização policial.</li>
        </ul>
      </div>
    </div>
  `;
}

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

  if (ptVoices[0]) utter.voice = ptVoices[0];
  utter.pitch = 1.0;
  utter.rate = 0.95;

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

function syncTypingIndicator() {
  const queue = conversationQueues.get(appState.channelHistories[appState.selectedPersona]);
  hideTypingIndicator();
  if (queue?.pending) showTypingIndicator();
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const channel = CHANNELS_CONFIG[appState.selectedPersona] || CHANNELS_CONFIG.soli;
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg msg-ai typing-indicator-msg';
  typingDiv.id = 'typingIndicatorMsg';
  typingDiv.innerHTML = `<div class="msg-bubble"><span>●</span> <span>●</span> <span>●</span> ${escapeHtml(channel.name)} está respondendo...</div>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  document.getElementById('typingIndicatorMsg')?.remove();
}

/* ==========================================================================
   6. MOTOR LOCAL DE CONTINGÊNCIA (RESPOSTAS PERSONALIZADAS POR CANAL)
   ========================================================================== */
/* Reconhecimento e síntese compartilhados pelas duas chamadas. */
const CallSpeechManager = {
  recognition: null, audioStream: null, activeModalType: null,
  isCalling: false, isListening: false, isStarting: false, isSpeaking: false,
  isPreparing: false, blockedReason: '', sessionId: 0, speechToken: 0,
  userSpeechTimeout: null, restartTimer: null, speechTimer: null,
  lastRecognizedText: '', finalText: '', interimText: '', utterance: null,
  localCapture: null, isTranscribing: false, listenToken: 0, transcriptionRequest: null,
  speechEngine: '', modelProgress: null,

  canListen() {
    return this.isCalling && !this.isSpeaking && !this.isPreparing && !this.isTranscribing && !appState.isMuted && !this.blockedReason;
  },

  init() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { this.fail('unsupported'); return false; }
    const session = this.sessionId;
    try {
      const recognition = new Recognition();
      this.recognition = recognition;
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      const current = () => this.isCalling && session === this.sessionId && recognition === this.recognition;

      recognition.onstart = () => {
        if (!current()) return;
        this.isStarting = false;
        if (!this.canListen()) { this.pause(); return; }
        this.isListening = true;
        updateCallUIListeningState();
      };
      recognition.onresult = event => {
        if (!current() || !this.canListen()) return;
        let finalText = '', interimText = '';
        // Each result list includes earlier final segments: rebuild rather than duplicate them.
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript + ' ';
          else interimText += result[0].transcript + ' ';
        }
        this.finalText = finalText.trim();
        this.interimText = interimText.trim();
        this.lastRecognizedText = [this.finalText, this.interimText].filter(Boolean).join(' ');
        if (!this.lastRecognizedText) return;
        updateUserSpeechDisplay(this.lastRecognizedText);
        clearTimeout(this.userSpeechTimeout);
        this.userSpeechTimeout = setTimeout(() => this.submitSpeech(session), this.interimText ? 1400 : 650);
      };
      recognition.onerror = event => {
        if (!current() || this.blockedReason) return;
        this.isListening = false;
        this.isStarting = false;
        if (event.error === 'aborted' || event.error === 'no-speech') {
          updateCallUIListeningState();
          return;
        }
        console.warn('Reconhecimento de voz:', event.error);
        this.fail(event.error || 'service-not-allowed');
      };
      recognition.onend = () => {
        if (!current()) return;
        this.isListening = false;
        this.isStarting = false;
        if (this.canListen() && this.lastRecognizedText) {
          clearTimeout(this.userSpeechTimeout);
          this.userSpeechTimeout = setTimeout(() => this.submitSpeech(session), 250);
        } else if (this.canListen()) {
          clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => this.resume(), 400);
        }
        updateCallUIListeningState();
      };
      return true;
    } catch (error) {
      console.warn('Não foi possível iniciar o reconhecimento:', error);
      this.fail('unsupported');
      return false;
    }
  },

  async start(modalType) {
    this.stop();
    this.isCalling = true;
    this.activeModalType = modalType;
    this.blockedReason = '';
    appState.isMuted = false;
    syncCallMicrophoneButtons();
    showCallMicrophoneHelp('');
    updateUserSpeechDisplay('Sua fala aparecerá aqui.');
    await this.prepareMicrophone(this.sessionId);
  },

  async prepareMicrophone(session) {
    this.isPreparing = true;
    updateCallUIListeningState();
    const localReady = await this.localSpeechAvailable(session);
    if (!this.isCalling || session !== this.sessionId) return;
    this.speechEngine = localReady ? 'server' : '';
    if (!localReady && window.BrowserSpeechRecognizer && window.LocalSpeechCapture) {
      try {
        this.modelProgress = 0;
        updateCallUIListeningState();
        await window.BrowserSpeechRecognizer.prepare(progress => {
          if (this.isCalling && session === this.sessionId) { this.modelProgress = progress; updateCallUIListeningState(); }
        });
        if (!this.isCalling || session !== this.sessionId) return;
        this.speechEngine = 'browser';
      } catch (_) { /* Reconhecimento nativo continua como alternativa. */ }
      this.modelProgress = null;
    }
    if (!this.isCalling || session !== this.sessionId) return;
    if (!this.speechEngine && !this.recognition && !this.init()) { this.isPreparing = false; return; }
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microfone indisponível.');
      if (!this.audioStream && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        if (!this.isCalling || session !== this.sessionId) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        this.audioStream = stream;
        stream.getAudioTracks().forEach(track => {
          track.enabled = !appState.isMuted;
          track.addEventListener?.('ended', () => {
            if (this.isCalling && session === this.sessionId) this.fail('audio-capture');
          });
        });
      }
      if (this.speechEngine && !this.localCapture) {
        const capture = new window.LocalSpeechCapture({
          onSpeech: samples => {
            if (this.isCalling && session === this.sessionId && capture === this.localCapture) this.transcribeSamples(samples);
          },
          onLevel: level => {
            if (this.isCalling && session === this.sessionId && capture === this.localCapture) updateCallMicrophoneLevel(level);
          },
          onError: () => { if (this.isCalling && session === this.sessionId && capture === this.localCapture) this.fail('audio-capture'); }
        });
        this.localCapture = capture;
        await capture.start(this.audioStream);
        if (!this.isCalling || session !== this.sessionId) { await capture.stop(); return; }
      }
    } catch (error) {
      if (!this.isCalling || session !== this.sessionId) return;
      this.isPreparing = false;
      this.fail(error.name === 'NotAllowedError' || error.name === 'SecurityError' ? 'not-allowed' : 'audio-capture');
      return;
    }
    if (!this.isCalling || session !== this.sessionId) return;
    this.isPreparing = false;
    this.resume();
  },

  async localSpeechAvailable(session) {
    if (!window.LocalSpeechCapture) return false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      // O modelo aquece ao iniciar o servidor; esta espera também cobre a primeira chamada.
      for (let attempt = 0; attempt < 12; attempt++) {
        if (!this.isCalling || session !== this.sessionId) return false;
        const response = await fetch('/api/speech/status', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) return false;
        const status = await response.json();
        if (status.available) return true;
        if (status.state !== 'loading') return false;
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    } catch (_) { /* Um servidor estático ainda pode usar reconhecimento nativo. */ }
    finally { clearTimeout(timeout); }
    return false;
  },

  async transcribeSamples(samples) {
    if (!this.canListen()) return;
    const session = this.sessionId;
    this.pause();
    this.isTranscribing = true;
    const token = this.listenToken;
    const controller = new AbortController();
    this.transcriptionRequest = controller;
    const timeout = setTimeout(() => controller.abort(), this.speechEngine === 'browser' ? 30000 : 15000);
    const current = () => this.isCalling && session === this.sessionId && token === this.listenToken;
    updateCallUIListeningState();
    try {
      let result, successful;
      if (this.speechEngine === 'browser') {
        result = { text: await window.BrowserSpeechRecognizer.transcribe(samples, controller.signal) };
        successful = true;
      } else {
        const response = await fetch('/api/transcribe', {
          method: 'POST', headers: { 'Content-Type': 'audio/wav' },
          body: window.SpeechAudioUtils.encodeWav(samples), signal: controller.signal
        });
        result = await response.json(); successful = response.ok;
      }
      if (!current()) return;
      this.isTranscribing = false;
      this.transcriptionRequest = null;
      if (!successful) { this.fail('speech-service'); return; }
      const text = String(result.text || '').trim();
      if (!text) {
        updateUserSpeechDisplay('Não entendi essa fala. Tente falar um pouco mais perto do microfone.');
        this.resume();
        return;
      }
      updateUserSpeechDisplay(text);
      await handleCallUserSpeech(text);
    } catch (error) {
      if (current()) this.fail('speech-service');
    } finally {
      clearTimeout(timeout);
      if (current()) {
        this.transcriptionRequest = null;
        this.isTranscribing = false;
        this.resume();
      }
    }
  },

  submitSpeech(session) {
    if (session !== this.sessionId || !this.canListen()) return;
    const text = this.lastRecognizedText.trim();
    this.clearPendingSpeech();
    if (text) handleCallUserSpeech(text);
  },

  clearPendingSpeech() {
    clearTimeout(this.userSpeechTimeout);
    this.userSpeechTimeout = null;
    this.lastRecognizedText = this.finalText = this.interimText = '';
  },

  pause() {
    this.listenToken++;
    this.transcriptionRequest?.abort();
    this.transcriptionRequest = null;
    this.isTranscribing = false;
    this.localCapture?.setEnabled(false);
    updateCallMicrophoneLevel(0);
    this.clearPendingSpeech();
    clearTimeout(this.restartTimer);
    this.restartTimer = null;
    this.isListening = false;
    this.isStarting = false;
    // Discard captured audio while Soli speaks; do not transcribe the loudspeaker.
    try { this.recognition?.abort(); } catch (error) { /* Already stopped. */ }
    updateCallUIListeningState();
  },

  resume() {
    if (this.localCapture && this.canListen()) {
      this.isStarting = false;
      if (!this.isListening) this.localCapture.setEnabled(true);
      this.isListening = true;
      updateCallUIListeningState();
      return;
    }
    if (!this.canListen() || !this.recognition || this.isStarting || this.isListening) {
      updateCallUIListeningState();
      return;
    }
    clearTimeout(this.restartTimer);
    this.restartTimer = null;
    this.isStarting = true;
    updateCallUIListeningState();
    try { this.recognition.start(); }
    catch (error) {
      this.isStarting = false;
      if (error.name === 'InvalidStateError') {
        this.restartTimer = setTimeout(() => this.resume(), 400);
      } else this.fail(error.name === 'NotAllowedError' ? 'not-allowed' : 'service-not-allowed');
    }
  },

  fail(reason) {
    this.blockedReason = reason;
    this.pause();
    this.localCapture?.stop();
    this.localCapture = null;
    const stream = this.audioStream;
    this.audioStream = null;
    stream?.getTracks().forEach(track => track.stop());
    showCallMicrophoneHelp(reason);
    syncCallMicrophoneButtons();
  },

  async retry() {
    if (!this.isCalling || this.isPreparing) return;
    this.isPreparing = true;
    const session = this.sessionId;
    this.pause();
    this.detachRecognition();
    const capture = this.localCapture;
    this.localCapture = null;
    await capture?.stop();
    if (!this.isCalling || session !== this.sessionId) return;
    this.blockedReason = '';
    appState.isMuted = false;
    syncCallMicrophoneButtons();
    showCallMicrophoneHelp('');
    await this.prepareMicrophone(session);
  },

  setMuted(muted) {
    if (!this.isCalling) return;
    if (this.blockedReason && !muted) { this.retry(); return; }
    appState.isMuted = muted;
    this.audioStream?.getAudioTracks().forEach(track => { track.enabled = !muted; });
    if (muted) this.pause(); else this.resume();
    syncCallMicrophoneButtons();
  },

  detachRecognition() {
    const recognition = this.recognition;
    this.recognition = null;
    if (recognition) {
      recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null;
      try { recognition.abort(); } catch (error) { /* Already stopped. */ }
    }
  },

  stop() {
    this.sessionId++;
    this.speechToken++;
    this.isCalling = this.isSpeaking = this.isListening = this.isStarting = this.isPreparing = false;
    this.activeModalType = null;
    this.speechEngine = ''; this.modelProgress = null;
    this.blockedReason = '';
    this.clearPendingSpeech();
    clearTimeout(this.restartTimer);
    clearTimeout(this.speechTimer);
    this.restartTimer = this.speechTimer = null;
    this.detachRecognition();
    this.pause();
    this.localCapture?.stop();
    this.localCapture = null;
    this.audioStream?.getTracks().forEach(track => track.stop());
    this.audioStream = null;
    this.utterance = null;
    window.speechSynthesis?.cancel();
    document.getElementById('soundWaveAnimation')?.classList.remove('active-speaking');
    document.getElementById('videoPresenceAura')?.classList.remove('is-speaking');
    updateCallUIListeningState();
  }
};

function syncCallMicrophoneButtons() {
  const unavailable = !!CallSpeechManager.blockedReason;
  const label = unavailable ? 'Tentar mic' : appState.isMuted ? 'Mic Mudo' : 'Mic Ativo';
  const icon = appState.isMuted && !unavailable ? '🔇' : '🎙️';
  ['callMuteLabel', 'videoMicLabel'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = label; });
  ['callMuteIcon', 'videoMicIcon'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = icon; });
  ['btnCallMute', 'btnVideoMic'].forEach(id => document.getElementById(id)?.setAttribute('aria-pressed', String(appState.isMuted)));
}

function showCallMicrophoneHelp(reason) {
  const messages = {
    unsupported: 'Este navegador não oferece reconhecimento de voz. Abra o site no Chrome ou Microsoft Edge para conversar pelo microfone.',
    network: 'O serviço de voz deste navegador não conectou. Confira a internet ou abra o site no Chrome ou Microsoft Edge.',
    'not-allowed': 'Permita o microfone nas permissões deste site e tente novamente.',
    'audio-capture': 'Não foi possível acessar o microfone. Confira se ele está conectado e liberado no computador.',
    'speech-service': 'Não foi possível transcrever sua fala agora. Tente o microfone novamente.',
    'service-not-allowed': 'O reconhecimento de voz está indisponível neste navegador. Abra o site no Chrome ou Microsoft Edge.',
    'language-not-supported': 'Este navegador não reconhece português. Tente o Chrome ou Microsoft Edge.'
  };
  const message = messages[reason] || 'Não foi possível reconhecer a fala. Você pode tentar novamente ou conversar por texto.';
  ['callMicHelp', 'videoMicHelp'].forEach(id => {
    const help = document.getElementById(id);
    if (!help) return;
    help.hidden = !reason;
    help.querySelector('p').textContent = message;
    const link = help.querySelector('a');
    link.href = 'microsoft-edge:' + window.location.href;
    link.hidden = !/Win/i.test(navigator.platform || '') || !['network', 'unsupported', 'service-not-allowed', 'language-not-supported'].includes(reason);
  });
}

function retryCallMicrophone() { CallSpeechManager.retry(); }

function updateCallUIListeningState() {
  const manager = CallSpeechManager;
  let label = '🔇 Microfone pausado', header = 'Microfone pausado';
  if (manager.blockedReason) { label = '🎙️ Microfone indisponível'; header = 'Confira o microfone'; }
  else if (manager.isTranscribing) { label = '💬 Entendendo sua fala...'; header = 'Transcrevendo sua fala'; }
  else if (manager.isSpeaking) { label = '🔊 Falando com você...'; header = '🔊 Falando agora...'; }
  else if (appState.isMuted) { label = '🔇 Microfone mudo'; header = 'Microfone mudo'; }
  else if (manager.isPreparing && manager.modelProgress !== null) { label = `Preparando voz ${manager.modelProgress}% • primeira vez pode demorar`; header = 'Preparando reconhecimento de voz'; }
  else if (manager.isPreparing) { label = '🎙️ Aguardando acesso ao microfone...'; header = 'Preparando microfone'; }
  else if (manager.isListening) { label = '🎙️ Ouvindo você... pode falar'; header = '🎙️ Microfone ativo'; }
  else if (manager.isStarting || manager.isCalling) { label = '🎙️ Preparando a escuta...'; header = 'Preparando microfone'; }
  ['callStateLabel', 'videoStatusLabel'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = label; });
  const speaker = document.getElementById('callSpeakerHeader');
  if (speaker) speaker.textContent = header;
}

function updateUserSpeechDisplay(text) {
  const voiceUserText = document.getElementById('callUserSpeechText');
  const videoUserText = document.getElementById('videoUserSpeechText');
  if (voiceUserText) voiceUserText.textContent = text;
  if (videoUserText) videoUserText.textContent = `Você: ${text}`;
}

function updateCallMicrophoneLevel(level) {
  ['callMicLevel', 'videoMicLevel'].forEach(id => {
    const meter = document.getElementById(id);
    if (meter) meter.value = Math.round(Math.max(0, Math.min(1, level)) * 100);
  });
}


/**
 * PROCESSA A FALA DO USUÁRIO NA CHAMADA E GERA A RESPOSTA
 */
async function handleCallUserSpeech(userSpeech, context = {}) {
  if (!CallSpeechManager.isCalling || !userSpeech || !userSpeech.trim()) return;
  const session = CallSpeechManager.sessionId;
  const persona = appState.callPersonaId;
  const history = appState.callDialogueHistory;
  const turn = (appState.callTurnNumber || 0) + 1;
  appState.callTurnNumber = turn;
  // Impede que a fala anterior retome o microfone enquanto a API responde.
  CallSpeechManager.speechToken++;
  CallSpeechManager.isSpeaking = true;
  CallSpeechManager.pause();
  window.speechSynthesis?.cancel();
  const callStateLabel = document.getElementById('callStateLabel');
  const videoStatusLabel = document.getElementById('videoStatusLabel');
  if (callStateLabel) callStateLabel.innerText = '💭 Pensando...';
  if (videoStatusLabel) videoStatusLabel.innerText = '💭 Pensando...';
  const isCancelled = () => !CallSpeechManager.isCalling || session !== CallSpeechManager.sessionId || history !== appState.callDialogueHistory;
  let responseStarted = false;
  try {
    appendMessage('user', userSpeech, { channelId: persona, recordHistory: false });
    const text = await queueConversationTurn(userSpeech, persona, { ...context, isCall: true, isCancelled });
    if (!text || isCancelled()) return;
    appendMessage('ai', `<p>${escapeHtml(text)}</p>`, { channelId: persona, recordHistory: false });
    if (turn === appState.callTurnNumber) { responseStarted = true; speakCallResponse(text, persona); }
  } catch (error) {
    console.warn('Não foi possível concluir a resposta da chamada.');
    if (!isCancelled() && turn === appState.callTurnNumber) {
      responseStarted = true;
      speakCallResponse('Não consegui concluir essa resposta. Pode me dizer de novo?', persona);
    }
  } finally {
    if (!responseStarted && !isCancelled() && turn === appState.callTurnNumber) {
      CallSpeechManager.isSpeaking = false;
      CallSpeechManager.resume();
    }
  }
}

function generateCallFallbackResponse(rawText, persona) {
  return getLocalConversationReply(rawText, persona, appState.callDialogueHistory || [], { isCall: true });
}

function speakCallResponse(text, personaId) {
  const manager = CallSpeechManager;
  if (!manager.isCalling) return;
  const clean = String(text).replace(/<[^>]*>?/gm, '').replace(/[\*_]/g, '').trim();
  setCallTranscript(clean);
  setVideoSubtitles(clean);
  const session = manager.sessionId;
  const token = ++manager.speechToken;
  clearTimeout(manager.speechTimer);
  manager.isSpeaking = true;
  manager.pause();
  const rings = document.getElementById('soundWaveAnimation');
  const aura = document.getElementById('videoPresenceAura');
  rings?.classList.add('active-speaking');
  aura?.classList.add('is-speaking');
  const current = () => manager.isCalling && session === manager.sessionId && token === manager.speechToken;
  let finished = false;
  const finish = () => {
    if (!current() || finished) return;
    finished = true;
    clearTimeout(manager.speechTimer);
    rings?.classList.remove('active-speaking');
    aura?.classList.remove('is-speaking');
    manager.utterance = null;
    // A short gap prevents the last sound from the speaker entering the microphone.
    manager.speechTimer = setTimeout(() => {
      if (!current()) return;
      manager.isSpeaking = false;
      manager.resume();
    }, 450);
  };
  if (!clean || !window.speechSynthesis || !window.SpeechSynthesisUtterance) { finish(); return; }
  const synthesis = window.speechSynthesis;
  try {
    // Invalidate the older utterance before cancel() fires its error callback.
    synthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    manager.utterance = utter;
    utter.lang = 'pt-BR';
    const voice = synthesis.getVoices().find(v => v.lang.toLowerCase() === 'pt-br') || synthesis.getVoices().find(v => v.lang.startsWith('pt'));
    if (voice) utter.voice = voice;
    utter.pitch = 1;
    utter.rate = .95;
    let started = false;
    utter.onstart = () => { if (current()) started = true; };
    utter.onend = finish;
    utter.onerror = finish;
    synthesis.resume?.();
    synthesis.speak(utter);
    // Some embedded browsers omit the end event. Never leave the microphone locked.
    const began = Date.now();
    const deadline = Math.max(12000, Math.min(60000, clean.length * 100 + 8000));
    const check = () => {
      if (!current() || finished) return;
      if (synthesis.speaking) started = true;
      if (!started && Date.now() - began >= 2500) { finish(); synthesis.cancel(); return; }
      if (started && !synthesis.speaking && !synthesis.pending) { finish(); return; }
      if (Date.now() - began >= deadline) { finish(); synthesis.cancel(); return; }
      manager.speechTimer = setTimeout(check, 500);
    };
    if (!finished) manager.speechTimer = setTimeout(check, 500);
  } catch (error) {
    console.warn('Não foi possível reproduzir a resposta falada:', error);
    finish();
  }
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
  if (CallSpeechManager.isCalling) {
    if (CallSpeechManager.activeModalType === 'video') closeVideoCallModal();
    else closeVoiceCallModal();
  }
  const modal = document.getElementById('voiceCallModal');
  if (modal) modal.style.display = 'flex';

  appState.callSeconds = 0;
  startCallTimer('callDurationTimer');

  const persona = appState.selectedPersona;
  const channel = CHANNELS_CONFIG[persona];
  const welcomeSpeech = prepareCallConversation();
  updateTopFriendDisplay();
  appState.callDialogueHistory.push({ role: 'model', text: welcomeSpeech });
  setCallTranscript(welcomeSpeech);
  CallSpeechManager.start('voice');
  speakCallResponse(welcomeSpeech, persona);
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
    speakCallResponse(appState.currentSpokenText, appState.callPersonaId);
  }
}

function counselorSpeakTopic(topic) {
  return sendChannelPreset(topic === 'calma' ? 'breathing' : topic, true);
}

function updateCallPresets(persona) {
  const presets = CHANNEL_PRESETS[persona] || CHANNEL_PRESETS.soli;
  const html = presets.map(preset => `<button class="call-prompt-btn" onclick="sendChannelPreset('${preset.id}', true)">${escapeHtml(preset.text)}</button>`).join('');
  for (const id of ['callQuickPrompts', 'videoQuickPrompts']) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
}

function prepareCallConversation() {
  const persona = appState.selectedPersona;
  appState.callPersonaId = persona;
  appState.callTurnNumber = 0;
  appState.callDialogueHistory = appState.channelHistories[persona];
  updateCallPresets(persona);
  const continued = appState.callDialogueHistory.some(turn => turn.role === 'user');
  if (continued) return 'Podemos continuar de onde paramos. O que você gostaria de me contar agora?';
  const greetings = {
    soli: 'Oi, eu sou a Soli. Estou aqui com você. Como você está se sentindo?',
    '190': 'Chamada simulada da Polícia Militar. O que está acontecendo agora?',
    '192': 'Chamada simulada do SAMU. O que aconteceu com a pessoa que precisa de ajuda?',
    '180': 'Chamada simulada da Central 180. Você quer orientação sobre uma situação de violência ou sobre como buscar apoio?',
    '100': 'Chamada simulada do Disque 100. Que situação de violação de direitos você gostaria de entender ou relatar?',
    professional: 'Este é um exemplo de acolhimento profissional. Como você está se sentindo?'
  };
  return greetings[persona] || greetings.soli;
}

function toggleCallMute() {
  if (CallSpeechManager.blockedReason) retryCallMicrophone();
  else CallSpeechManager.setMuted(!appState.isMuted);
}

function openVideoCallModal() {
  if (CallSpeechManager.isCalling) {
    if (CallSpeechManager.activeModalType === 'voice') closeVoiceCallModal();
    else closeVideoCallModal();
  }
  const modal = document.getElementById('videoCallModal');
  if (modal) modal.style.display = 'flex';

  appState.callSeconds = 0;
  startCallTimer('videoDurationTimer');

  const persona = appState.selectedPersona;
  const channel = CHANNELS_CONFIG[persona];
  const welcomeSpeech = prepareCallConversation();
  updateTopFriendDisplay();
  appState.callDialogueHistory.push({ role: 'model', text: welcomeSpeech });
  setVideoSubtitles(welcomeSpeech);
  CallSpeechManager.start('video');
  speakCallResponse(welcomeSpeech, persona);
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
  if (CallSpeechManager.blockedReason) retryCallMicrophone();
  else CallSpeechManager.setMuted(!appState.isMuted);
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
        const session = appState.callDialogueHistory;
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!CallSpeechManager.isCalling || session !== appState.callDialogueHistory) { stream.getTracks().forEach(track => track.stop()); return; }
        appState.webcamStream = stream;
        appState.isWebcamActive = true;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (label) label.innerText = 'Câmera Ativa';
        showToast("Sua câmera aparece somente na prévia local.");
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
        userLocation.address = `${city}, ${region} (aproximada por IP)`;
        userLocation.fullAddress = `${city}, ${region} - Brasil (localização aproximada por IP)`;
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

  userLocation.address = "Localização indisponível";
  userLocation.fullAddress = "Localização indisponível — informe seu endereço ao buscar apoio";
  updateLocationUI(userLocation.address);
}

function updateLocationUI(text) {
  const locSub = document.getElementById('sidebarLocationSubtitle');
  if (locSub) locSub.innerText = text;
  const emergencyLocation = document.getElementById('emergencyLocationText');
  if (emergencyLocation) emergencyLocation.textContent = userLocation.fullAddress;
}

function copyLocationCoords() {
  const textToCopy = `SOCORRO / EMERGÊNCIA:\nLocal: ${userLocation.fullAddress}\n${userLocation.mapUrl ? 'Google Maps: ' + userLocation.mapUrl : ''}`;
  if (!navigator.clipboard) { showToast(userLocation.fullAddress); return; }
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
      if (document.querySelector('dialog[open]')) return;
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
    localStorage.removeItem('gemini_api_key');
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
      showToast(isTotem ? 'Modo apresentação ativado' : 'Modo padrão ativado');
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
