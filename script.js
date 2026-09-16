/* ==========================================================================
   CENTRAL DE ATENDIMENTO HUMANO DE EMERGÊNCIA (CLARA) - SCRIPT PRINCIPAL
   COM RASTREAMENTO DE LOCALIZAÇÃO REAL VIA GPS / IP
   ========================================================================== */

// Estado da Localização do Usuário
const userLocation = {
  address: "Ponto Seguro Urbano (GPS Ativo)",
  fullAddress: "Av. Principal - Ponto de Ônibus Central",
  coords: null,
  lat: null,
  lon: null,
  mapUrl: null,
  isRealGps: false
};

document.addEventListener('DOMContentLoaded', () => {
  initQuickExit();
  initTotemMode();
  initThemeToggle();
  initClock();
  initChat();
  initRealLocationDetection();
});

/* ==========================================================================
   1. SAÍDA RÁPIDA DE EMERGÊNCIA (QUICK EXIT)
   ========================================================================== */
function initQuickExit() {
  const exitBtn = document.getElementById('quickExitBtn');
  if (exitBtn) {
    exitBtn.addEventListener('click', executeQuickExit);
  }

  // Tecla ESC para saída instantânea
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      executeQuickExit();
    }
  });
}

function executeQuickExit() {
  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch (err) {
    console.warn(err);
  }
  window.location.replace('https://www.google.com');
}

/* ==========================================================================
   2. DETECÇÃO DE LOCALIZAÇÃO REAL (GPS NATIVO + REVERSE GEOCODING + IP FALLBACK)
   ========================================================================== */
function initRealLocationDetection() {
  updateLocationUI('Identificando sua localização...');

  // 1. Tentar GPS Nativo do Navegador com Alta Precisão
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
          // Geocodificação reversa via OpenStreetMap Nominatim (Gratuito e em Português)
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

        // Se falhar o texto da rua, exibe as coordenadas reais de GPS
        userLocation.address = `GPS: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
        userLocation.fullAddress = userLocation.address;
        updateLocationUI(userLocation.address);
      },
      (error) => {
        console.warn("Acesso ao GPS não concedido ou bloqueado. Tentando por IP:", error.message);
        fallbackLocationByIp();
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  } else {
    fallbackLocationByIp();
  }
}

// Fallback por IP (obtem cidade/região sem precisar de permissão)
async function fallbackLocationByIp() {
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const city = data.city || "São Paulo";
        const region = data.region || "SP";
        userLocation.lat = data.latitude;
        userLocation.lon = data.longitude;
        userLocation.coords = `${data.latitude}, ${data.longitude}`;
        userLocation.mapUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
        userLocation.address = `${city}, ${region} (Região aproximada)`;
        userLocation.fullAddress = `${city} - ${region}, Brasil`;
        updateLocationUI(userLocation.address);
        return;
      }
    }
  } catch (err) {
    console.warn("Falha no IP:", err);
  }

  // Endereço padrão se tudo falhar
  userLocation.address = "Terminal Urbano Central (Ponto Monitorado)";
  userLocation.fullAddress = "Terminal Integrado de Transporte Urbano";
  updateLocationUI(userLocation.address);
}

function updateLocationUI(text) {
  const badgeText = document.getElementById('headerLocationText');
  if (badgeText) {
    badgeText.textContent = text;
  }
  const totemSubtitle = document.getElementById('totemLocationSubtitle');
  if (totemSubtitle) {
    totemSubtitle.textContent = `📍 Localização Transmitida: ${text}`;
  }
}

// Permite ao usuário clicar e alterar/simular o endereço para apresentação
function promptCustomLocation() {
  const custom = prompt(
    "Digite o endereço ou ponto de referência para a simulação:", 
    userLocation.fullAddress || "Av. Paulista, 1000 - Bela Vista, São Paulo"
  );
  if (custom && custom.trim() !== "") {
    userLocation.address = custom.trim();
    userLocation.fullAddress = custom.trim();
    userLocation.isRealGps = true;
    updateLocationUI(userLocation.address);
    showToast(`📍 Localização definida: ${userLocation.address}`);
  }
}

/* ==========================================================================
   3. SIMULAÇÃO DE MODO TOTEM URBANO
   ========================================================================== */
function initTotemMode() {
  const toggleTotemBtn = document.getElementById('toggleTotemBtn');
  const totemHeader = document.getElementById('totemHeader');

  if (toggleTotemBtn) {
    toggleTotemBtn.addEventListener('click', () => {
      const isActive = document.body.classList.toggle('totem-active');
      if (totemHeader) {
        totemHeader.style.display = isActive ? 'flex' : 'none';
      }
      showToast(
        isActive 
          ? '🚏 Modo Totem Urbano Ativado (Visual de Painel de Rua)' 
          : '📱 Modo Normal Ativado'
      );
    });
  }
}

function initClock() {
  const clockEl = document.getElementById('totemClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   4. TEMA NOTURNO / CONFORTO
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('toggleContrastBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('theme-dark');
      toggleBtn.innerHTML = isDark 
        ? '<span class="icon">☀️</span>' 
        : '<span class="icon">🌙</span>';
    });
  }
}

/* ==========================================================================
   5. CHAT COM A PLANTONISTA HUMANA (CLARA)
   ========================================================================== */
function initChat() {
  const clearBtn = document.getElementById('clearChatBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearChat);
  }

  const input = document.getElementById('chatInput');
  if (input) {
    input.focus();
  }
}

function handleSendMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chatInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  appendUserMessage(text);
  input.value = '';

  processHumanResponse(text);
}

function sendQuickMessage(text) {
  appendUserMessage(text);
  processHumanResponse(text);
}

function appendUserMessage(text) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg msg-user';
  msgDiv.innerHTML = `
    <div class="msg-bubble">
      <p>${escapeHtml(text)}</p>
    </div>
    <span class="msg-time">${getCurrentTimeStr()}</span>
  `;
  chatMessages.appendChild(msgDiv);
  scrollChatToBottom();
}

function appendAiMessage(htmlContent) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg msg-ai';
  msgDiv.innerHTML = `
    <div class="msg-bubble">
      ${htmlContent}
    </div>
    <span class="msg-time">${getCurrentTimeStr()}</span>
  `;
  chatMessages.appendChild(msgDiv);
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function getCurrentTimeStr() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function clearChat() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  chatMessages.innerHTML = `
    <div class="chat-msg msg-ai">
      <div class="msg-bubble">
        <p>Conversa reiniciada e dados apagados por privacidade. <strong>Você está em um canal direto e seguro</strong>.</p>
        <p>Estou aqui com você. O que está acontecendo?</p>
      </div>
      <span class="msg-time">${getCurrentTimeStr()}</span>
    </div>
  `;
  showToast('Conversa limpa com sucesso.');
}

/* ==========================================================================
   ESTADO CONVERSACIONAL E GERENCIADOR DE RESPOSTAS RÁPIDAS DINÂMICAS
   ========================================================================== */
let conversationState = {
  lastTopic: 'initial', // 'injury_pending_police', 'police_dispatched', 'injury_location_query', 'hospital_query', 'breathing'
  policeDispatched: false,
  samuDispatched: false
};

const defaultInitialChips = [
  { text: "🚨 Sofri um abuso agora, socorro!", isDanger: true },
  { text: "🏥 Estou ferida / preciso de médico", isDanger: true },
  { text: "⏱️ O que tomar nas primeiras 72h? (PEP)", isDanger: false },
  { text: "🧪 Acho que fui dopada (bebida)", isDanger: false },
  { text: "🛡️ Tenho medo de denunciar", isDanger: false },
  { text: "😰 Estou em choque / crise de pânico", isDanger: false },
  { text: "🔍 Exames periciais e cuidados com a roupa", isDanger: false }
];

function updateQuickReplies(options) {
  const container = document.getElementById('quickReplies');
  if (!container) return;
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = `quick-chip ${opt.isDanger ? 'chip-sos' : ''}`;
    btn.innerHTML = escapeHtml(opt.text);
    btn.onclick = () => sendQuickMessage(opt.value || opt.text);
    container.appendChild(btn);
  });
}

function clearChat() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  conversationState = {
    lastTopic: 'initial',
    policeDispatched: false,
    samuDispatched: false
  };

  chatMessages.innerHTML = `
    <div class="chat-msg msg-ai">
      <div class="msg-bubble">
        <p>Conversa reiniciada e dados apagados por privacidade. <strong>Você está em um canal direto e seguro</strong>.</p>
        <p>Estou aqui com você. O que está acontecendo?</p>
      </div>
      <span class="msg-time">${getCurrentTimeStr()}</span>
    </div>
  `;
  updateQuickReplies(defaultInitialChips);
  showToast('Conversa limpa com sucesso.');
}

/* ==========================================================================
   SIMULAÇÃO DE RESPOSTA HUMANA INTELIGENTE E CONTEXTUAL
   ========================================================================== */
function processHumanResponse(userInput) {
  const chatMessages = document.getElementById('chatMessages');
  
  // Mostra indicador de digitação humana
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg msg-ai typing-indicator-msg';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="msg-bubble">
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  scrollChatToBottom();

  setTimeout(() => {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();

    const response = generateHumanResponse(userInput);
    appendAiMessage(response);
  }, 1000);
}

function generateHumanResponse(text) {
  const lower = text.toLowerCase().trim();
  const locationDisplay = userLocation.fullAddress || userLocation.address;
  const mapLinkHtml = userLocation.mapUrl 
    ? `<a href="${userLocation.mapUrl}" target="_blank" rel="noopener" class="dispatch-map-link">🗺️ Abrir coordenadas no Google Maps ↗</a>` 
    : '';

  // Classificação de Intenções e Expressões Especializadas em Abuso Sexual
  const mentionsInjury = /ferid|machucad|sangr|bateram|dor|apanhei|agredid|les[aã]o|quebr|corte|doendo|sangue/i.test(lower);
  const mentionsDoctorSamu = /samu|ambul[aâ]ncia|m[eé]dic|socorrista|hospital/i.test(lower);
  const mentionsPoliceDanger = /pol[ií]cia|viatura|agressor|seguindo|persegu|armad|estupr|abus|ladr[aã]o|amea[çc]|matar/i.test(lower);
  const mentionsGeneralHelp = /socorro|ajuda|urgente|emerg[eê]ncia|perigo|chamado/i.test(lower);
  const mentionsPanicAnxiety = /respir|p[aâ]nico|crise|ansied|falta de ar|tremer|tremendo|desespero|calma/i.test(lower);
  const mentionsLoneliness = /sozinh|triste|choro|chorar|ningu[eé]m|desabafo/i.test(lower);
  const mentionsRights = /denunci|boletim|b\.o|delegacia|deam|medida protetiva|culpa|vergonha/i.test(lower);
  const mentionsPEP = /72|horas|pep|gravid|remedio|rem[eé]dio|ist|hiv|p[ií]lula/i.test(lower);
  const asksIfHuman = /humano|humana|rob[oô]|verdade|quem [eé] voc[eê]/i.test(lower);
  const asksLocation = /onde eu estou|localiza[çc]|meu local|endere[çc]o|gps/i.test(lower);

  // Intenções Específicas de Abuso Sexual
  const mentionsDoping = /dopad|boa noite|cinderela|bebida|batizada|desmaiei|acordei sem roupa|n[aã]o lembro|apaguei|tontura estranha/i.test(lower);
  const mentionsForensics = /exame pericial|corpo de delito|iml|banho|roupa|provas|per[ií]cia/i.test(lower);
  const mentionsKnownAggressor = /conhecid|namorad|marido|parente|familiar|amigo|vizinho|colega|chefe|primo|tio|irm[aã]o/i.test(lower);
  const mentionsSexualAbuseExplicit = /abuso|estupr|viol[eê]ncia sexual|me tocou|me agarrou|sem consentimento|for[çc]ada/i.test(lower);

  // Respostas Afirmativas e Negativas
  const isAffirmative = /^(sim|sim por favor|pode mandar|quero|manda|chama|com certeza|por favor|preciso sim|mande|claro)/i.test(lower) || lower.includes('sim, por favor') || lower.includes('mande a polícia');
  const isNegative = /^(n[aã]o|n[aã]o precisa|n[aã]o quero|apenas o samu|dispensa|deixa|de jeito nenhum)/i.test(lower) || lower.includes('não precisa') || lower.includes('apenas o samu');

  // Localização específica do ferimento
  const mentionsBodyPart = /cabe[çc]a|bra[çc]o|perna|rosto|barriga|peito|costela|costas|m[aã]o|p[eé]|ombro|corpo todo/i.test(lower);

  // Status do agressor
  const aggressorFled = /fugiu|foi embora|correu|n[aã]o est[aá] mais|escapou|sumiu/i.test(lower);
  const aggressorNear = /est[aá] aqui|est[aá] perto|me olhando|vindo atr[aá]s|me seguindo|escondid/i.test(lower);

  // Agradecimento e alívio
  const isGratitude = /obrigad|valeu|muito grata|estou melhor|passou|aliviad/i.test(lower);

  // =========================================================================
  // 1. RESPOSTA A DECISÕES ANTERIORES (EX: Clara perguntou se enviava a polícia)
  // =========================================================================
  if (conversationState.lastTopic === 'injury_pending_police' && isAffirmative) {
    conversationState.policeDispatched = true;
    conversationState.lastTopic = 'police_dispatched';
    const protocolId = Math.floor(1000 + Math.random() * 9000);

    updateQuickReplies([
      { text: "🏃 O agressor já fugiu" },
      { text: "⚠️ O agressor ainda está aqui perto", isDanger: true },
      { text: "🩸 O ferimento está sangrando bastante" },
      { text: "🫁 Me ajuda a respirar enquanto espero" }
    ]);

    return `
      <p><strong>Confirmado! Acabei de acionar a Polícia Militar (190) também!</strong></p>
      <p>Agora a equipe do <strong>SAMU (192)</strong> e a <strong>viatura da Polícia Militar (190)</strong> estão em deslocamento juntas para a sua proteção em <strong>${escapeHtml(locationDisplay)}</strong>.</p>
      
      <div class="dispatch-card">
        <div class="dispatch-header">
          <span class="siren-icon">🚓</span>
          <span class="dispatch-title">VIATURA POLICIAL ADICIONADA AO CHAMADO</span>
        </div>
        <div class="dispatch-info-grid">
          <div class="dispatch-info-item">
            <span class="dispatch-info-label">Segurança</span>
            <span class="dispatch-info-val">🚓 PM 190 (Rádio Patrulha)</span>
          </div>
          <div class="dispatch-info-item">
            <span class="dispatch-info-label">Resgate</span>
            <span class="dispatch-info-val">🚑 SAMU 192 Despachado</span>
          </div>
          <div class="dispatch-info-item dispatch-item-full">
            <span class="dispatch-info-label">Protocolo Unificado</span>
            <span class="dispatch-info-val">#EMERG-${protocolId} • Previsão ~3 a 5 min</span>
          </div>
        </div>
        <div class="dispatch-status-bar">
          <span>🚓 Viatura policial e ambulância médica a caminho com prioridade máxima.</span>
        </div>
      </div>

      <p>O agressor ainda está nas imediações ou já fugiu? Fique em local seguro, estou aqui na linha com você!</p>
    `;
  }

  if (conversationState.lastTopic === 'injury_pending_police' && isNegative) {
    conversationState.lastTopic = 'samu_only';
    updateQuickReplies([
      { text: "🩸 O ferimento está sangrando bastante" },
      { text: "🤕 Sinto muita dor / tontura" },
      { text: "🫁 Me ajuda a respirar para me acalmar" },
      { text: "🔒 Limpar histórico da conversa" }
    ]);

    return `
      <p><strong>Perfeito, respeitei a sua decisão. A polícia NÃO virá.</strong></p>
      <p>Apenas a equipe de paramédicos do <strong>SAMU (192)</strong> está em deslocamento para cuidar de você com total sigilo médico, sem viaturas policiais e sem burocracia.</p>
      <p>Você consegue me contar em qual parte do corpo você foi machucada(o)? Isso ajuda os socorristas a já descerem com o curativo certo.</p>
    `;
  }

  // =========================================================================
  // 2. DETALHAMENTO DO FERIMENTO (CABEÇA, BRAÇO, PERNA, ETC.)
  // =========================================================================
  if (mentionsBodyPart) {
    updateQuickReplies([
      { text: "😵 Estou com muita tontura" },
      { text: "🩸 O sangramento diminuiu um pouco" },
      { text: "🚓 A ambulância já está próxima?" },
      { text: "🫁 Me ajuda a respirar com calma" }
    ]);

    return `
      <p>Entendido perfeitamente. <strong>Eu já repassei no rádio dos socorristas do SAMU</strong> que o ferimento é nessa região do corpo.</p>
      <p>Eles já deixaram separados gaze estéril, ataduras e medicação para alívio imediato da dor.</p>
      <p><strong>Cuidados agora:</strong></p>
      <ul style="margin-left:1.2rem; margin-bottom:0.75rem; font-size:0.92rem; color:var(--text-muted);">
        <li>Mantenha a região imóvel e repouse o corpo.</li>
        <li>Se estiver sangrando, pressione suavemente com um tecido limpo.</li>
        <li>Evite levantar rápido para não ter queda de pressão ou tontura.</li>
      </ul>
      <p>A ambulância já está bem próxima. Você está sentindo tontura ou enjoo?</p>
    `;
  }

  // =========================================================================
  // 3. STATUS DO AGRESSOR (FUGIU OU ESTÁ PERTO)
  // =========================================================================
  if (aggressorFled) {
    updateQuickReplies([
      { text: "🏢 Consegui entrar em uma loja / comércio" },
      { text: "🫁 Me ajuda a respirar enquanto espero" },
      { text: "⏱️ O que preciso fazer nas primeiras 72 horas?" },
      { text: "🛡️ Quero saber sobre medidas protetivas" }
    ]);

    return `
      <p>Que alívio saber que ele fugiu e você está fora do alcance imediato dele! Esse é um passo importante para a sua segurança agora.</p>
      <p>Eu acabei de avisar a viatura da polícia pelo rádio: <em>o agressor evadiu do local</em>. Eles estão em patrulhamento nas ruas vizinhas atentos às características dele e chegando ao seu ponto.</p>
      <p>Continue abrigada(o) em um ponto visível e iluminado. Você quer que a gente faça um exercício de respiração para aliviar essa adrenalina?</p>
    `;
  }

  if (aggressorNear) {
    updateQuickReplies([
      { text: "🏢 Consegui entrar em um comércio" },
      { text: "👥 Me juntei a outras pessoas" },
      { text: "🚓 Estou vendo a viatura chegar!" }
    ]);

    return `
      <p>⚠️ <strong>ALERTA MÁXIMO TRANSMITIDO À POLÍCIA!</strong></p>
      <p>Eu passei a informação urgente para o rádio da Rádio Patrulha: <em>o agressor ainda se encontra nas imediações do terminal!</em></p>
      <p><strong>Por favor, faça isso agora:</strong></p>
      <ul style="margin-left:1.2rem; margin-bottom:0.75rem; font-size:0.92rem; color:var(--text-muted);">
        <li><strong>Não encare e não confronte.</strong></li>
        <li>Entre imediatamente no primeiro comércio aberto, padaria, farmácia ou posto que estiver perto.</li>
        <li>Se não houver comércio, se aproxime de qualquer grupo de pessoas na rua.</li>
      </ul>
      <p>A viatura da Polícia Militar está com sirene ligada a menos de 2 minutos de você. Fique na linha!</p>
    `;
  }

  // =========================================================================
  // 4. AGRADECIMENTO / ALÍVIO
  // =========================================================================
  if (isGratitude) {
    updateQuickReplies([
      { text: "🔒 Limpar conversa agora" },
      { text: "🫁 Fazer mais um exercício de respiração" },
      { text: "⏱️ O que fazer nas primeiras 72 horas?" }
    ]);

    return `
      <p>Eu que agradeço imensamente pela sua confiança. <strong>Você foi extremamente corajosa(o) por estar aqui buscando ajuda</strong>.</p>
      <p>Lembre-se sempre: o que aconteceu não é culpa sua e você tem uma rede inteira de apoio público e de saúde à sua disposição.</p>
      <p>Se você for sair deste terminal agora, lembre-se de clicar no botão <strong>'Limpar Conversa'</strong> ou na <strong>'Saída Rápida'</strong> no topo para não deixar nenhum histórico neste aparelho.</p>
      <p>Precisa de mais alguma informação antes de encerrar?</p>
    `;
  }

  // =========================================================================
  // 5. SOLICITAÇÃO INICIAL DE SOCORRO COM FERIMENTO
  // =========================================================================
  if (mentionsInjury || (mentionsDoctorSamu && (mentionsInjury || mentionsGeneralHelp))) {
    const protocolId = Math.floor(1000 + Math.random() * 9000);
    
    // Se também houver perigo/agressor ou pedido geral de socorro, despacha SAMU + POLÍCIA juntos!
    if (mentionsPoliceDanger || mentionsGeneralHelp) {
      conversationState.samuDispatched = true;
      conversationState.policeDispatched = true;
      conversationState.lastTopic = 'police_dispatched';

      updateQuickReplies([
        { text: "🏃 O agressor já fugiu" },
        { text: "⚠️ O agressor ainda está aqui perto", isDanger: true },
        { text: "🩸 O ferimento está sangrando bastante" },
        { text: "🫁 Me ajuda a respirar enquanto espero" }
      ]);

      return `
        <p><strong>Mantenha a calma, eu já vi que você está ferida(o) e estou aqui com você!</strong></p>
        <p>Eu acionei o protocolo de <strong>Socorro Máximo</strong> da nossa central: <strong>o SAMU (192) e a Polícia Militar (190) foram despachados simultaneamente para o seu endereço agora mesmo!</strong></p>
        <p>📍 Posição confirmada pelo GPS: <strong>${escapeHtml(locationDisplay)}</strong>.</p>
        
        <div class="dispatch-card">
          <div class="dispatch-header">
            <span class="siren-icon">🚑</span>
            <span class="dispatch-title">SOCORRO DUPLO ACIONADO: SAMU MÉDICO + POLÍCIA</span>
          </div>
          <div class="dispatch-info-grid">
            <div class="dispatch-info-item">
              <span class="dispatch-info-label">Resgate Médico</span>
              <span class="dispatch-info-val">🚑 SAMU 192 Despachado</span>
            </div>
            <div class="dispatch-info-item">
              <span class="dispatch-info-label">Apoio e Segurança</span>
              <span class="dispatch-info-val">🚓 PM 190 a Caminho</span>
            </div>
            <div class="dispatch-info-item">
              <span class="dispatch-info-label">Protocolo de Urgência</span>
              <span class="dispatch-info-val">#EMERG-${protocolId}</span>
            </div>
            <div class="dispatch-info-item">
              <span class="dispatch-info-label">Previsão de Chegada</span>
              <span class="dispatch-info-val">~3 a 5 minutos</span>
            </div>
            <div class="dispatch-info-item dispatch-item-full">
              <span class="dispatch-info-label">Localização Transmitida</span>
              <span class="dispatch-info-val">📍 ${escapeHtml(locationDisplay)}</span>
              ${mapLinkHtml}
            </div>
          </div>
          <div class="dispatch-status-bar">
            <span>🚑 Ambulância com socorristas e viatura da polícia em deslocamento.</span>
          </div>
        </div>

        <p>Por favor, <strong>tente se sentar, não faça esforço</strong>. Se estiver sangrando, pressione suavemente o local com um tecido limpo se tiver por perto.</p>
        <p>Você consegue me dizer onde é o ferimento para eu já avisar a equipe médica pelo rádio? O agressor ainda está por aí ou fugiu?</p>
      `;
    }

    // Se a menção foi apenas aos ferimentos / cuidados médicos
    conversationState.samuDispatched = true;
    conversationState.lastTopic = 'injury_pending_police';

    updateQuickReplies([
      { text: "🚓 Sim, envie a polícia também!", isDanger: true },
      { text: "🚑 Não precisa de polícia, apenas o SAMU" },
      { text: "🩸 O ferimento está sangrando bastante" },
      { text: "🤕 Bati a cabeça / sinto tontura" }
    ]);

    return `
      <p><strong>Compreendi perfeitamente, já estou cuidando de você!</strong></p>
      <p>Eu acabei de despachar a equipe de socorristas do <strong>SAMU (192)</strong> com prioridade máxima para atender os seus ferimentos no local onde você está.</p>
      <p>📍 Posição de GPS enviada: <strong>${escapeHtml(locationDisplay)}</strong>.</p>

      <div class="dispatch-card" style="border-color:#059669; background:linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%);">
        <div class="dispatch-header">
          <span class="siren-icon">🚑</span>
          <span class="dispatch-title" style="color:#059669;">DESPACHO MÉDICO DE RESGATE (SAMU)</span>
        </div>
        <div class="dispatch-info-grid">
          <div class="dispatch-info-item" style="border-color:#A7F3D0;">
            <span class="dispatch-info-label">Protocolo Médico</span>
            <span class="dispatch-info-val">#SAMU-${protocolId}</span>
          </div>
          <div class="dispatch-info-item" style="border-color:#A7F3D0;">
            <span class="dispatch-info-label">Previsão</span>
            <span class="dispatch-info-val">~3 a 5 minutos</span>
          </div>
          <div class="dispatch-info-item dispatch-item-full" style="border-color:#A7F3D0;">
            <span class="dispatch-info-label">Local do Atendimento</span>
            <span class="dispatch-info-val">📍 ${escapeHtml(locationDisplay)}</span>
            ${mapLinkHtml}
          </div>
        </div>
        <div class="dispatch-status-bar" style="background:#059669;">
          <span>🚑 Ambulância com equipe médica e paramédicos a caminho.</span>
        </div>
      </div>

      <p>Tente se sentar e respirar devagar. <strong>Você precisa que eu mande a Polícia Militar também por segurança?</strong></p>

      <div class="inline-action-btns">
        <button class="btn-inline-action" onclick="sendQuickMessage('Sim, envie a polícia também!')">🚓 Sim, enviar polícia também</button>
        <button class="btn-inline-action btn-inline-secondary" onclick="sendQuickMessage('Não precisa de polícia, apenas o SAMU')">🚑 Não, apenas o SAMU</button>
      </div>
    `;
  }

  // =========================================================================
  // 6. PEDIDO DE POLÍCIA / PERIGO (SEM FERIMENTO)
  // =========================================================================
  if (mentionsPoliceDanger || mentionsGeneralHelp) {
    conversationState.policeDispatched = true;
    conversationState.lastTopic = 'police_dispatched';
    const protocolId = Math.floor(1000 + Math.random() * 9000);

    updateQuickReplies([
      { text: "🏃 O agressor já fugiu" },
      { text: "⚠️ O agressor ainda está aqui perto", isDanger: true },
      { text: "🤕 Estou machucada(o), chame o SAMU também", isDanger: true },
      { text: "🫁 Me ajuda a respirar enquanto espero" }
    ]);

    return `
      <p><strong>Mantenha a calma, estou com você na linha agora!</strong></p>
      <p>Eu acabei de acionar o botão de prioridade máxima da nossa central: <strong>a Polícia Militar já foi alertada e uma viatura está a caminho do seu local exato neste momento!</strong></p>
      <p>Eu confirmei sua posição pelo GPS: <strong>${escapeHtml(locationDisplay)}</strong>. Essas coordenadas já foram transmitidas via rádio para a guarnição policial.</p>
      
      <div class="dispatch-card">
        <div class="dispatch-header">
          <span class="siren-icon">🚨</span>
          <span class="dispatch-title">CHAMADO DE SOCORRO POLICIAL ATIVADO</span>
        </div>
        <div class="dispatch-info-grid">
          <div class="dispatch-info-item">
            <span class="dispatch-info-label">Protocolo</span>
            <span class="dispatch-info-val">#PM-${protocolId}-URG</span>
          </div>
          <div class="dispatch-info-item">
            <span class="dispatch-info-label">Previsão</span>
            <span class="dispatch-info-val">~3 a 5 minutos</span>
          </div>
          <div class="dispatch-info-item dispatch-item-full">
            <span class="dispatch-info-label">Localização Transmitida (GPS)</span>
            <span class="dispatch-info-val">📍 ${escapeHtml(locationDisplay)}</span>
            ${mapLinkHtml}
          </div>
        </div>
        <div class="dispatch-status-bar">
          <span>🚓 Viatura Rádio Patrulha 190 em deslocamento prioritário.</span>
        </div>
      </div>

      <p>Por favor, <strong>permaneça onde você está</strong>, perto deste terminal ou em um ponto iluminado e seguro. Eu <strong>não vou desligar</strong> e vou continuar conversando com você até os policiais chegarem.</p>
      <p>O agressor ainda está por perto? Se você tiver qualquer machucado ou dor física, me avise que chamo o SAMU agora mesmo!</p>
    `;
  }

  // =========================================================================
  // 7. PERGUNTAS SOBRE LOCALIZAÇÃO ("ONDE EU ESTOU")
  // =========================================================================
  if (asksLocation) {
    updateQuickReplies([
      { text: "🚨 Preciso de socorro policial neste local", isDanger: true },
      { text: "🚑 Preciso de ambulância do SAMU aqui", isDanger: true },
      { text: "✏️ Quero corrigir esse endereço" },
      { text: "🫁 Me ajuda a respirar com calma" }
    ]);

    return `
      <p>O sistema identificou a sua localização em tempo real via GPS:</p>
      <p>📍 <strong>${escapeHtml(locationDisplay)}</strong></p>
      ${userLocation.coords ? `<p style="font-size:0.85rem; color:var(--text-muted);">Coordenadas Exatas: ${userLocation.coords}</p>` : ''}
      <p>Esse endereço é transmitido automaticamente para a polícia ou para o SAMU caso você precise de resgate imediato.</p>
      ${mapLinkHtml}
    `;
  }

  // =========================================================================
  // 8. VOCÊ É HUMANO?
  // =========================================================================
  if (asksIfHuman) {
    updateQuickReplies([
      { text: "🚨 Preciso que você mande socorro!", isDanger: true },
      { text: "Estou com muito medo, conversa comigo" },
      { text: "⏱️ O que fazer nas primeiras 72 horas?" }
    ]);

    return `
      <p>Sim, sou eu mesma, a <strong>Clara</strong>! Sou uma plantonista humana de serviço nesta central de acolhimento emergencial.</p>
      <p>Estou conectada ao vivo com você para garantir que você não enfrente esse momento sozinha(o). Eu tenho acesso direto aos canais de rádio da polícia e socorro médico para te proteger.</p>
      <p>Pode confiar em mim. Como você está se sentindo agora?</p>
    `;
  }

  // =========================================================================
  // 9. RESPIRAÇÃO / CRISE DE PÂNICO
  // =========================================================================
  if (mentionsPanicAnxiety) {
    const widgetId = 'bw_' + Date.now();
    updateQuickReplies([
      { text: "Já respirei, estou um pouco melhor" },
      { text: "Ainda sinto o peito muito apertado" },
      { text: "🚨 Acho melhor chamar socorro", isDanger: true },
      { text: "Só conversa comigo para me distrair" }
    ]);

    return `
      <p>Eu sei que o coração dispara e parece que falta o ar, mas <strong>eu estou aqui segurando a sua mão virtualmente</strong>. Você está a salvo aqui comigo.</p>
      <p>Coloque os dois pés bem firmes no chão, solte os ombros. Vamos fazer um exercício de respiração juntos agora para acalmar seu corpo:</p>
      
      <div class="chat-breathing-box">
        <div class="chat-breathing-circle-wrapper">
          <div class="chat-breathing-circle" id="circle_${widgetId}">
            <span class="chat-breathing-state" id="state_${widgetId}">Pronto</span>
            <span class="chat-breathing-count" id="count_${widgetId}">4</span>
          </div>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.8rem;" id="guide_${widgetId}">
          Inspire pelo nariz (4s), segure o ar (4s) e solte devagar pela boca (4s).
        </p>
        <button class="chat-breathing-btn" id="btn_${widgetId}" onclick="startInlineBreathing('${widgetId}')">
          ▶ Começar Respiração
        </button>
      </div>

      <p>Faça no seu ritmo. Estou te esperando e não vou sair daqui.</p>
    `;
  }

  // =========================================================================
  // 10. ORIENTAÇÕES MÉDICAS / 72 HORAS / PEP
  // =========================================================================
  if (mentionsPEP) {
    updateQuickReplies([
      { text: "🏥 Sim, envie transporte para o hospital", isDanger: true },
      { text: "🛡️ Preciso registrar B.O. antes de ir?" },
      { text: "💊 Como funciona a medicação PEP?" },
      { text: "😰 Tenho medo de ser julgada(o) no hospital" }
    ]);

    return `
      <p>Essa é uma preocupação fundamental e eu quero te tranquilizar: <strong>sua saúde vem em primeiríssimo lugar</strong>.</p>
      <p>Se isso aconteceu nas últimas <strong>72 horas</strong>, nós precisamos te levar a um hospital do SUS para iniciar a medicação de proteção (PEP contra o HIV e outras infecções, além de prevenir gravidez):</p>
      <ul style="margin-left:1.2rem; margin-bottom:0.75rem; font-size:0.92rem; color:var(--text-muted);">
        <li><strong style="color:var(--text-main);">Você NÃO precisa de Boletim de Ocorrência:</strong> A Lei 12.845 garante atendimento médico completo e sigiloso sem precisar registrar queixa primeiro.</li>
        <li>O atendimento é 100% gratuito e feito por equipes especializadas e acolhedoras.</li>
      </ul>
      <p>Você quer que eu envie transporte seguro para te levar até o hospital de referência agora?</p>

      <div class="inline-action-btns">
        <button class="btn-inline-action" onclick="sendQuickMessage('Sim, envie transporte para o hospital')">🏥 Sim, quero ir ao hospital</button>
        <button class="btn-inline-action btn-inline-secondary" onclick="sendQuickMessage('Preciso registrar B.O. antes de ir?')">🛡️ Preciso de B.O. antes?</button>
      </div>
    `;
  }

  // =========================================================================
  // 11. DENÚNCIA / DELEGACIA / MEDIDAS PROTETIVAS
  // =========================================================================
  if (mentionsRights) {
    updateQuickReplies([
      { text: "🛡️ Como funciona a Medida Protetiva?" },
      { text: "📞 Quero o telefone do Disque 180" },
      { text: "Não quero denunciar agora, só desabafar" },
      { text: "🚨 Mande a polícia agora", isDanger: true }
    ]);

    return `
      <p>Olhe para mim: <strong>você NÃO tem culpa de absolutamente nada</strong>. A culpa e a vergonha pertencem unicamente ao agressor.</p>
      <p>Você não é obrigada a denunciar agora se não estiver pronta. Eu estou aqui para te apoiar no seu tempo, sem nenhuma pressão.</p>
      <p>Se um dia você quiser registrar, existem Delegacias Especializadas da Mulher (DEAM) e a Justiça pode expedir <strong>Medidas Protetivas de Urgência</strong> para proibir o agressor de se aproximar de você.</p>
      <p>O que você sente vontade de fazer agora? Quer apenas desabafar?</p>
    `;
  }

  // =========================================================================
  // 12. SUSPEITA DE DOPAGEM / BEBIDA BATIZADA ("BOA NOITE CINDERELA")
  // =========================================================================
  if (mentionsDoping) {
    updateQuickReplies([
      { text: "🏥 Envie transporte para o hospital urgente", isDanger: true },
      { text: "⏱️ Como funciona o exame toxicológico?" },
      { text: "💊 Quero a profilaxia PEP e anticoncepção" },
      { text: "😰 Não lembro de nada, estou desesperada(o)" }
    ]);

    return `
      <p>⚠️ <strong>Atenção máxima: essa é uma situação de emergência em saúde e proteção.</strong></p>
      <p>Se você suspeita que colocaram algo na sua bebida ou teve perda de consciência, quero que você saiba: <strong>o que aconteceu é estupro de vulnerável (crime gravíssimo)</strong>. Você não teve como consentir e não tem culpa alguma.</p>
      <p><strong>Orientações médicas urgentes:</strong></p>
      <ul style="margin-left:1.2rem; margin-bottom:0.75rem; font-size:0.92rem; color:var(--text-muted);">
        <li><strong style="color:var(--text-main);">Tempo é essencial:</strong> Substâncias químicas saem do sangue e da urina rapidamente (geralmente entre 12h e 24h). O hospital do SUS realiza a coleta toxicológica de emergência.</li>
        <li><strong style="color:var(--text-main);">Profilaxia PEP (em até 72h):</strong> Previne HIV, hepatites e outras infecções, além de pílula do dia seguinte contra gravidez.</li>
        <li><strong style="color:var(--text-main);">Você NÃO precisa de B.O. para ser atendida(o):</strong> O atendimento é prioridade médica e humanitária.</li>
      </ul>
      <p>Você quer que eu envie transporte seguro agora para te levar ao hospital de referência?</p>

      <div class="inline-action-btns">
        <button class="btn-inline-action btn-inline-danger" onclick="sendQuickMessage('Envie transporte para o hospital urgente')">🏥 Sim, enviar transporte para hospital</button>
        <button class="btn-inline-action btn-inline-secondary" onclick="sendQuickMessage('O que tomar nas primeiras 72 horas? (PEP / Gravidez)')">⏱️ Saber mais sobre PEP 72h</button>
      </div>
    `;
  }

  // =========================================================================
  // 13. EXAMES PERICIAIS / IML / PROVAS E CUIDADOS COM ROUPA
  // =========================================================================
  if (mentionsForensics) {
    updateQuickReplies([
      { text: "🏥 Quero ir ao hospital de referência", isDanger: true },
      { text: "🛡️ O que acontece no exame de corpo de delito?" },
      { text: "Eu já tomei banho, perdi meus direitos?" },
      { text: "🫁 Me ajuda a respirar para me acalmar" }
    ]);

    return `
      <p>Essa é uma dúvida muito delicada e importante sobre a <strong>preservação de vestígios para perícia</strong>:</p>
      <ul style="margin-left:1.2rem; margin-bottom:0.75rem; font-size:0.92rem; color:var(--text-muted);">
        <li><strong style="color:var(--text-main);">Se você puder:</strong> Evite tomar banho, escovar os dentes ou trocar de roupa antes de ir ao hospital de referência ou IML, pois vestígios de DNA auxiliam na identificação do agressor.</li>
        <li><strong style="color:var(--text-main);">Se for trocar de roupa:</strong> Guarde as roupas usadas em um <em>saco de papel limpo</em> (evite sacos plásticos, que acumulam umidade e destroem o DNA).</li>
        <li><strong style="color:var(--text-main);">E se você já tomou banho?</strong> Não se desespere! <strong>Você não perdeu seus direitos!</strong> O acolhimento médico, profilaxia de infecções (PEP) e apoio psicológico continuam 100% garantidos a você.</li>
      </ul>
      <p>Sua saúde física e emocional vem sempre em primeiro lugar. O que você gostaria de fazer agora?</p>
    `;
  }

  // =========================================================================
  // 14. AGRESSOR CONHECIDO (NAMORADO, AMIGO, PARENTE, FAMILIAR)
  // =========================================================================
  if (mentionsKnownAggressor) {
    updateQuickReplies([
      { text: "🛡️ Como solicitar Medida Protetiva de Urgência?" },
      { text: "📞 Quero ligar para a Central 180" },
      { text: "Tenho medo de represálias da família" },
      { text: "🚨 Preciso de socorro da polícia", isDanger: true }
    ]);

    return `
      <p>Eu te ouço com todo o carinho e acolhimento. Saiba que <strong>mais de 70% dos casos de violência sexual são cometidos por pessoas conhecidas, parceiros ou familiares</strong>.</p>
      <p>Mesmo que seja namorado, ex, marido ou parente: <strong>sexo sem consentimento é estupro e é crime</strong>. Você tem todo o direito de dizer não a qualquer momento.</p>
      <p>Você pode solicitar imediatamente uma <strong>Medida Protetiva de Urgência</strong> (Lei Maria da Penha):</p>
      <ul style="margin-left:1.2rem; margin-bottom:0.75rem; font-size:0.92rem; color:var(--text-muted);">
        <li>O juiz obriga o agressor a manter distância mínima de você e de seus locais de estudo/trabalho.</li>
        <li>Ele é proibido de te ligar, mandar mensagens ou mandar recados por terceiros.</li>
        <li>Se ele descumprir, ele é preso em flagrante.</li>
      </ul>
      <p>Você quer que eu te informe o contato da Central de Atendimento à Mulher (180) para receber orientação confidencial?</p>
    `;
  }

  // =========================================================================
  // 15. DESABAFO / TRISTEZA / SOLIDÃO
  // =========================================================================
  if (mentionsLoneliness) {
    updateQuickReplies([
      { text: "O que aconteceu comigo foi terrível..." },
      { text: "🫁 Me ajuda a respirar para me acalmar" },
      { text: "🚨 Preciso de ajuda médica / socorro", isDanger: true }
    ]);

    return `
      <p>Pode chorar, querida(o). Deixe sair tudo o que está doendo no peito. Eu estou aqui te escutando com todo respeito e carinho.</p>
      <p>Você não está mais sozinha(o). Eu estou com você nesta linha e vou te acompanhar em cada passo que você quiser dar.</p>
      <p>Se quiser me contar o que aconteceu, eu estou aqui. Se preferir apenas saber que tem alguém aqui com você, saiba que eu não vou desligar.</p>
    `;
  }

  // =========================================================================
  // RESPOSTA PADRÃO COM ALTERNATIVAS CLARAS PARA NÃO FICAR SEM SAÍDA
  // =========================================================================
  updateQuickReplies([
    { text: "🚨 Preciso de socorro urgente!", isDanger: true },
    { text: "🏥 Estou ferida(o) / preciso de médico", isDanger: true },
    { text: "😰 Estou com medo e quero me acalmar" },
    { text: "⏱️ O que fazer nas primeiras 72 horas?" }
  ]);

  return `
    <p>Estou te ouvindo com total atenção. Entendo como essa situação é delicada e quero que você sinta todo o meu apoio.</p>
    <p>Para eu te ajudar com exatidão agora, me diga qual é a sua prioridade:</p>
    <div class="inline-action-btns">
      <button class="btn-inline-action btn-inline-danger" onclick="sendQuickMessage('Preciso de socorro agora!')">🚨 Socorro Policial</button>
      <button class="btn-inline-action" onclick="sendQuickMessage('Estou ferida e preciso de médico')">🚑 Resgate Médico SAMU</button>
      <button class="btn-inline-action btn-inline-secondary" onclick="sendQuickMessage('Me ajuda a respirar para me acalmar')">🫁 Preciso me acalmar</button>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ==========================================================================
   WIDGET INTERATIVO DE RESPIRAÇÃO DENTRO DO CHAT
   ========================================================================== */
const activeBreathingTimers = {};

function startInlineBreathing(id) {
  const circle = document.getElementById(`circle_${id}`);
  const state = document.getElementById(`state_${id}`);
  const count = document.getElementById(`count_${id}`);
  const guide = document.getElementById(`guide_${id}`);
  const btn = document.getElementById(`btn_${id}`);

  if (!circle || !btn) return;

  if (activeBreathingTimers[id]) {
    // Parar
    clearInterval(activeBreathingTimers[id].interval);
    delete activeBreathingTimers[id];
    btn.textContent = '▶ Começar Respiração';
    circle.className = 'chat-breathing-circle';
    state.textContent = 'Pronto';
    count.textContent = '4';
    guide.textContent = 'Inspire pelo nariz (4s), segure o ar (4s) e solte devagar pela boca (4s).';
    return;
  }

  // Iniciar
  btn.textContent = '⏸ Pausar';
  let phase = 'inhale';
  let seconds = 4;

  function updatePhaseUI() {
    count.textContent = seconds;
    if (phase === 'inhale') {
      circle.className = 'chat-breathing-circle inhale';
      state.textContent = 'Inspire';
      guide.textContent = 'Inspire suavemente pelo nariz... sinta o ar entrando.';
    } else if (phase === 'hold') {
      circle.className = 'chat-breathing-circle hold';
      state.textContent = 'Segure';
      guide.textContent = 'Segure o ar gentilmente... você está segura(o).';
    } else if (phase === 'exhale') {
      circle.className = 'chat-breathing-circle exhale';
      state.textContent = 'Expire';
      guide.textContent = 'Solte o ar pela boca bem devagar... relaxe o corpo.';
    }
  }

  updatePhaseUI();

  const interval = setInterval(() => {
    seconds--;
    count.textContent = seconds;
    if (seconds <= 0) {
      if (phase === 'inhale') {
        phase = 'hold';
        seconds = 4;
      } else if (phase === 'hold') {
        phase = 'exhale';
        seconds = 4;
      } else if (phase === 'exhale') {
        phase = 'inhale';
        seconds = 4;
      }
      updatePhaseUI();
    }
  }, 1000);

  activeBreathingTimers[id] = { interval };
}

/* ==========================================================================
   UTILITÁRIOS
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
