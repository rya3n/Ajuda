/* Telas do protótipo. Sem dependências, contas ou persistência de dados pessoais. */
const portalState = {
  view: 'home', exercise: null, timer: null, returnView: 'home',
  previousFocus: null, contacts: [], contactCounter: 0
};
const SOLI_IMAGE = 'assets/soli.png';
const SOURCES = {
  trauma: 'https://www.nimh.nih.gov/health/publications/post-traumatic-stress-disorder-ptsd',
  dissociation: 'https://www.nimh.nih.gov/news/science-updates/2022/feelings-of-detachment-after-trauma-may-signal-worse-mental-health-outcomes',
  grounding: 'https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises/',
  breathing: 'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/',
  brain: 'https://www.ncbi.nlm.nih.gov/books/NBK20367/'
};
const EDUCATION_SOURCES = {
  trauma: {
    url: 'https://www.rcpsych.ac.uk/mental-health/translations/portuguese/post-traumatic-stress-disorder-(ptsd)',
    label: 'Royal College of Psychiatrists'
  },
  executive: {
    url: 'https://repositorio.ufsc.br/handle/123456789/213995',
    label: 'UFSC'
  },
  dissociation: {
    url: 'https://www.msdmanuals.com/pt/casa/dist%C3%BArbios-de-sa%C3%BAde-mental/transtornos-dissociativos/transtorno-de-despersonaliza%C3%A7%C3%A3o-desrealiza%C3%A7%C3%A3o',
    label: 'Manual MSD'
  },
  plasticity: {
    url: 'https://jornal.usp.br/artigos/reconectando-pela-neurociencia/',
    label: 'USP'
  }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}
function soliImage(className = '', alt = 'Soli, nosso mascote de acolhimento') {
  return `<img class="soli-image ${className}" src="${SOLI_IMAGE}" alt="${alt}" draggable="false">`;
}
function portalIcon(name) {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    leaf: '<path d="M20 4C7 2 2 10 6 16s16 2 14-12Z"/><path d="m5 21 10-13"/>',
    breath: '<path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6"/>',
    chat: '<path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z"/><path d="M8 10h8M8 14h5"/>',
    person: '<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3Z"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M20 21v-3a6 6 0 0 0-3-5"/>',
    phone: '<path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3v3c-1 3-8 1-13-4S1 4 4 3Z"/>',
    brain: '<path d="M12 5c-4-6-9 0-7 3-5 2-3 9 0 9-1 5 6 6 7 2 1 4 8 3 7-2 3 0 5-7 0-9 2-3-3-9-7-3Z"/><path d="M12 5v14M7 10l2 2M15 8l2 2M6 16l3-1M15 16l3-1"/>',
    book: '<path d="M12 5C9 3 6 3 3 4v16c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v16"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16v1"/>',
    eye: '<path d="M2 12c5-9 15-9 20 0-5 9-15 9-20 0Z"/><circle cx="12" cy="12" r="3"/>',
    hand: '<path d="M7 12V5a2 2 0 0 1 4 0v7-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v8c0 6-8 9-11 4l-4-5a2 2 0 0 1 3-2l3 3"/>',
    ear: '<path d="M8 8c0-7 12-7 12 1 0 5-7 4-7 10 0 4-7 4-7-1M12 9c0-3 5-3 5 0 0 2-3 2-3 5"/>',
    heart: '<path d="M12 21 3 12C-3 4 8 0 12 7c4-7 15-3 9 5Z"/>',
    pin: '<path d="M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
    mic: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    video: '<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m16 10 6-4v12l-6-4"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = portalIcon(el.dataset.icon); });
  navigatePortal('home', false);
  document.getElementById('exercisePause').addEventListener('click', toggleExercisePause);
  document.getElementById('exerciseNext').addEventListener('click', nextExerciseStep);
  document.getElementById('exerciseBack').addEventListener('click', previousExerciseStep);
  document.getElementById('exerciseClose').addEventListener('click', closeExercise);
  document.getElementById('exerciseRestart').addEventListener('click', () => startExercise(portalState.exercise.type, false));
  document.getElementById('contactForm').addEventListener('submit', addSupportContact);
  document.getElementById('exerciseDialog').addEventListener('cancel', event => { event.preventDefault(); closeExercise(); });
  document.getElementById('contactDialog').addEventListener('close', () => portalState.previousFocus?.focus());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && portalState.exercise?.type === 'breathing' && !portalState.exercise.paused && !portalState.exercise.complete) toggleExercisePause();
  });
});

function closeMobileSidebar() {
  if (window.innerWidth <= 768) {
    document.getElementById('appSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
}
function navigatePortal(view, focus = true) {
  portalState.view = view;
  document.body.dataset.view = view;
  closeMobileSidebar();
  if (view !== 'chat') {
    closeVoiceCallModal(); closeVideoCallModal(); stopCurrentAudioAnimation();
  }
  document.querySelectorAll('[data-page]').forEach(button => {
    const selected = button.dataset.page === view;
    button.classList.toggle('is-selected', selected);
    if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  const names = { home: 'Seu espaço de acolhimento', crisis: 'Um passo de cada vez', education: 'Neuropsicoeducação', articles: 'Conteúdos para você', professionals: 'Apoio profissional', support: 'Sua rede de apoio', emergency: 'Ajuda e emergência' };
  document.getElementById('portalTitle').textContent = names[view] || 'Converse com a Soli';
  const screen = document.getElementById('portalScreen');
  const renderers = { home: renderHome, crisis: renderCrisis, education: renderEducation, articles: renderArticles, professionals: renderProfessionals, support: renderSupport, emergency: renderEmergency };
  if (renderers[view]) screen.innerHTML = `<div class="portal-content">${renderers[view]()}</div>`;
  screen.scrollTop = 0;
  if (focus && view !== 'chat') screen.querySelector('h1')?.focus({preventScroll: true});
}
function pageIntro(label, title, description) {
  return `<div class="page-intro"><span class="eyebrow">${label}</span><h1 tabindex="-1">${title}</h1><p>${description}</p></div>`;
}
function actionCard(icon, title, subtitle, action, className = '') {
  return `<button class="action-card ${className}" onclick="${action}"><span class="action-symbol">${portalIcon(icon)}</span><strong>${title}</strong><span>${subtitle}</span><span class="card-arrow">${portalIcon('arrow')}</span></button>`;
}
function renderHome() {
  return `<div class="home-hero"><div class="hero-copy"><span class="eyebrow">BEM-VINDO AO PONTO SEGURO</span><h1 tabindex="-1">Aqui, você pode<br> <em>ir no seu tempo.</em></h1><p>Eu sou a Soli. Estou aqui para ouvir, acolher e ajudar você a encontrar apoio.</p><span class="hero-signature">Sempre ao seu lado, no seu tempo.</span></div><div class="hero-mascot"><span class="organic-shape"></span>${soliImage()}<span class="mascot-spark spark-one">✦</span><span class="mascot-spark spark-two">✧</span></div></div>
    <div class="section-heading"><h2>Como você está agora?</h2><span>Escolha o que você precisa.</span></div>
    <div class="action-grid">
      ${actionCard('alert','Estou em crise','Vamos por partes, juntos.',"navigatePortal('crisis')",'card-crisis')}
      ${actionCard('breath','Respiração','Um momento para desacelerar.',"openExercise('breathing')",'card-matcha')}
      ${actionCard('leaf','Grounding','Volte para o aqui e agora.',"openExercise('grounding')",'card-pistache')}
      ${actionCard('chat','Conversar com a Soli','Por texto, voz ou vídeo.',"switchChannel('soli')",'card-vanilla')}
    </div><div class="support-grid">
      ${actionCard('person','Falar com um profissional','Conheça as formas de atendimento.',"navigatePortal('professionals')")}
      ${actionCard('people','Rede de apoio','Pessoas em quem você confia.',"navigatePortal('support')")}
      ${actionCard('phone','Ajuda / Emergência','Encontre os canais de apoio.',"navigatePortal('emergency')")}
    </div><div class="gentle-note">${portalIcon('heart')}<p>Você não precisa dar conta de tudo de uma vez. Um pequeno passo já importa.</p></div>`;
}
function renderCrisis() {
  return `${pageIntro('ESTOU EM CRISE','Vamos por partes.','Você pode escolher o que consegue fazer agora.')}
    <div class="crisis-welcome">${soliImage()}<div><h2>Estou aqui com você.</h2><p>Você não precisa explicar tudo. Podemos começar por um exercício ou conversar.</p></div></div>
    <div class="section-heading"><h2>O que está acontecendo?</h2></div><div class="crisis-options">
      ${['Estou tendo um flashback','Estou sentindo muita ansiedade','Estou em crise','Não estou me sentindo em segurança','Quero conversar sobre outra coisa'].map((text,index) => `<button class="list-action" onclick="startCrisisChat(${index})"><span>${text}</span>${portalIcon('arrow')}</button>`).join('')}
    </div><div class="support-grid two-columns">${actionCard('breath','Respirar com a Soli','Siga um ritmo confortável.',"openExercise('breathing')",'card-matcha')}${actionCard('leaf','Voltar para o presente','Observe o que está ao seu redor.',"openExercise('grounding')",'card-pistache')}</div>
    <button class="text-link emergency-text" onclick="navigatePortal('emergency')">Se há perigo imediato, veja os contatos de emergência →</button>`;
}
function startCrisisChat(index) {
  switchChannel('soli');
  const messages = ['Estou tendo um flashback e preciso de acolhimento.','Estou sentindo muita ansiedade.','Estou em crise e preciso de apoio.','Não estou me sentindo em segurança.','Gostaria de conversar sobre o que estou sentindo.'];
  sendQuickMessage(messages[index]);
}

const educationTopics = [
  {icon:'book', title:'Memória', subtitle:'Quando lembranças aparecem sem convite', text:'Depois de um trauma, lembranças podem voltar de forma intensa. Algumas pessoas também têm dificuldade de lembrar partes do acontecimento.', tip:'Você pode conversar sobre isso com alguém de confiança ou um profissional.', source:'trauma'},
  {icon:'eye', title:'Atenção', subtitle:'Por que se concentrar pode ficar difícil', text:'Sentir-se em alerta e dormir mal pode acompanhar o trauma. A dificuldade de concentração também pode aparecer.', tip:'Escolha uma pequena tarefa e permita-se fazer pausas.', source:'trauma'},
  {icon:'heart', title:'Emoções', subtitle:'Acolha o que você está sentindo', text:'Medo, irritação, culpa e tristeza podem surgir depois de experiências traumáticas. Cada pessoa reage de uma maneira.', tip:'Sentir isso não é sinal de fraqueza. Você pode buscar apoio.', source:'trauma'},
  {icon:'brain', title:'Funções executivas', subtitle:'Planejamento, escolhas e organização', text:'Planejar, organizar e tomar decisões são habilidades usadas no cotidiano.', tip:'Dividir uma tarefa em partes menores é uma opção para organizar o dia.', source:'executive'},
  {icon:'pin', title:'Consciência', subtitle:'A sensação de estar no presente', text:'Algumas pessoas sentem desconexão de si ou do ambiente após um trauma.', tip:'Você pode conversar sobre essa experiência com um profissional de saúde.', source:'dissociation'},
  {icon:'leaf', title:'Neuroplasticidade', subtitle:'O cérebro aprende com experiências', text:'O cérebro pode modificar suas conexões ao aprender. Essa capacidade é chamada neuroplasticidade.', tip:'Cada pessoa tem seu tempo. Buscar acompanhamento pode fazer parte do cuidado.', source:'plasticity'}
];
function renderEducation() {
  return `${pageIntro('ENTENDER TAMBÉM É CUIDAR','Entenda o que está acontecendo.','Explicações curtas para conhecer suas reações, sem julgamentos.')}
    <div class="topic-grid">${educationTopics.map(topic => `<details class="topic-card"><summary><span class="topic-icon">${portalIcon(topic.icon)}</span><span><strong>${topic.title}</strong><small>${topic.subtitle}</small></span><span class="details-plus">+</span></summary><div class="topic-content"><p>${topic.text}</p><p class="topic-tip">${topic.tip}</p><a href="${EDUCATION_SOURCES[topic.source].url}" target="_blank" rel="noopener noreferrer" lang="pt-BR">Ler a fonte em português · ${EDUCATION_SOURCES[topic.source].label} ↗</a></div></details>`).join('')}</div>
    <div class="gentle-note">${portalIcon('heart')}<p>Conteúdo educativo. Se as dificuldades persistirem ou afetarem seu dia, busque um profissional de saúde.</p></div><button class="primary-button" onclick="navigatePortal('articles')">Explorar artigos e conteúdos ${portalIcon('arrow')}</button>`;
}
function renderArticles() {
  const articles = [
    ['trauma','Trauma e saúde mental','Entenda reações que podem aparecer após uma experiência traumática.','NIMH • Inglês','brain'],
    ['breathing','Um momento para respirar','Orientações simples para uma respiração confortável.','NHS • Inglês','breath'],
    ['grounding','Volte para o presente','Conheça a técnica de grounding 5–4–3–2–1.','NHS Inform • Inglês','leaf'],
    ['brain','Como o cérebro aprende','Uma introdução ao cérebro, à aprendizagem e às suas conexões.','NIH • Inglês','book']
  ];
  return `${pageIntro('CONTINUE NO SEU TEMPO','Conteúdos para você.','Uma pequena seleção de fontes públicas para aprofundar o que você aprendeu.')}
    <div class="article-list">${articles.map(([key,title,text,source,icon]) => `<a class="article-card" href="${SOURCES[key]}" target="_blank" rel="noopener noreferrer"><span class="article-icon">${portalIcon(icon)}</span><span><small>${source}</small><h2>${title}</h2><p>${text}</p></span><span aria-hidden="true">↗</span></a>`).join('')}</div>`;
}
function renderProfessionals() {
  return `${pageIntro('VOCÊ PODE BUSCAR APOIO','Falar com um profissional.','Escolha como prefere conversar. Nesta apresentação, o atendimento é simulado.')}
    <div class="professional-profile"><span class="professional-avatar">${portalIcon('person')}</span><div><h2>Profissional de acolhimento</h2><p>Exemplo de atendimento psicológico</p><span class="demo-pill">Demonstração</span></div></div>
    <div class="mode-list">${['chat','voice','video'].map((mode,i) => `<button class="list-action" onclick="openProfessional('${mode}')"><span class="topic-icon">${portalIcon(['chat','mic','video'][i])}</span><span><strong>${['Chat','Áudio','Vídeo'][i]}</strong><small>${['Converse por texto','Chamada de voz simulada','Chamada de vídeo simulada'][i]}</small></span>${portalIcon('arrow')}</button>`).join('')}</div>
    <div class="gentle-note">${portalIcon('heart')}<p>Para atendimento real, procure uma unidade de saúde ou um profissional de sua região.</p></div>`;
}
function openProfessional(mode) {
  switchChannel('professional');
  if (mode === 'voice') openVoiceCallModal();
  if (mode === 'video') openVideoCallModal();
}
function renderSupport() {
  return `${pageIntro('PESSOAS EM QUEM VOCÊ CONFIA','Sua rede de apoio.','Adicione um contato para ter o telefone por perto durante esta sessão.')}
    <div class="contact-list">${portalState.contacts.length ? portalState.contacts.map(contact => `<div class="contact-card"><span class="topic-icon">${portalIcon('person')}</span><span><strong>${escapeHtml(contact.name)}</strong><small>${escapeHtml(contact.phone)}</small></span><a class="icon-button" href="tel:${contact.phone.replace(/[^\d+]/g,'')}" aria-label="Ligar para ${escapeHtml(contact.name)}">${portalIcon('phone')}</a><button class="icon-button" onclick="removeSupportContact(${contact.id})" aria-label="Remover ${escapeHtml(contact.name)}">×</button></div>`).join('') : '<div class="empty-contacts"><span class="topic-icon">'+portalIcon('people')+'</span><h2>Quem faz parte da sua rede?</h2><p>Uma pessoa próxima pode ser um ponto de apoio.</p></div>'}</div>
    <button class="primary-button" onclick="openContactDialog()">＋ Adicionar contato</button><p class="small-note">Os contatos ficam apenas nesta página e somem ao recarregar.</p>
    <div class="resource-list"><button class="list-action" onclick="copyLocationCoords()"><span class="topic-icon">${portalIcon('pin')}</span><span><strong>Copiar minha localização</strong><small>Compartilhe o endereço com alguém de confiança.</small></span>${portalIcon('arrow')}</button><button class="list-action" onclick="navigatePortal('emergency')"><span class="topic-icon">${portalIcon('phone')}</span><span><strong>Serviços de emergência</strong><small>Apoio policial e canais de acolhimento.</small></span>${portalIcon('arrow')}</button></div>`;
}
function openContactDialog() {
  portalState.previousFocus = document.activeElement;
  document.getElementById('contactForm').reset();
  document.getElementById('contactDialog').showModal();
}
function addSupportContact(event) {
  event.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const phoneInput = document.getElementById('contactPhone');
  const phone = phoneInput.value.trim();
  const digits = phone.replace(/\D/g, '');
  if (!name || digits.length < 8 || digits.length > 15) {
    phoneInput.setCustomValidity('Informe um telefone com DDD, entre 8 e 15 dígitos.');
    phoneInput.reportValidity(); return;
  }
  phoneInput.setCustomValidity('');
  portalState.contacts.push({id: ++portalState.contactCounter, name, phone});
  document.getElementById('contactDialog').close();
  navigatePortal('support');
  showToast('Contato adicionado nesta sessão.');
}
function removeSupportContact(id) {
  portalState.contacts = portalState.contacts.filter(contact => contact.id !== id);
  navigatePortal('support', false);
}
function renderEmergency() {
  const services = [['190','Polícia Militar','Perigo imediato / emergência policial','phone'],['192','SAMU','Urgência médica / ambulância','heart'],['180','Central 180','Acolhimento e orientação à mulher','people'],['100','Disque 100','Violações de direitos humanos','alert']];
  return `${pageIntro('AJUDA E EMERGÊNCIA','Encontre o apoio que você precisa.','Os botões de ligação abrem o discador do seu dispositivo.')}
    <div class="emergency-grid">${services.map(([number,title,subtitle,icon]) => `<div class="emergency-service"><span class="topic-icon">${portalIcon(icon)}</span><h2>${title}</h2><p>${subtitle}</p><a class="primary-button" href="tel:${number}">Ligar ${number} ${portalIcon('phone')}</a><button class="text-link" onclick="switchChannel('${number}')">Ver atendimento simulado →</button></div>`).join('')}</div>
    <div class="resource-list"><button class="list-action" onclick="copyLocationCoords()"><span class="topic-icon">${portalIcon('pin')}</span><span><strong>Minha localização</strong><small id="emergencyLocationText">${escapeHtml(userLocation.fullAddress)}</small></span>${portalIcon('arrow')}</button><div class="info-card"><h2>Delegacia / Delegacia da Mulher</h2><p>O Ligue 180 pode orientar sobre serviços de atendimento à mulher e a rede de apoio.</p><a class="text-link" href="tel:180">Ligar 180 →</a></div></div><p class="small-note">O protótipo não envia ocorrências nem aciona viaturas ou ambulâncias.</p>`;
}

/* Exercícios: um único temporizador, encerrado ao fechar ou trocar o exercício. */
const groundingSteps = [
  {count:5, icon:'eye', title:'Olhe ao seu redor', instruction:'Encontre 5 coisas que você consegue ver.', example:'Uma planta, uma janela, uma cadeira, uma parede, seu celular.'},
  {count:4, icon:'hand', title:'Sinta seu corpo', instruction:'Perceba 4 coisas que você pode tocar ou sentir.', example:'Seus pés no chão, a roupa no corpo, a cadeira, suas mãos.'},
  {count:3, icon:'ear', title:'Ouça com atenção', instruction:'Identifique 3 sons ao seu redor.', example:'O vento, um ventilador, vozes ao longe. Tudo bem se houver silêncio.'},
  {count:2, icon:'leaf', title:'Perceba os aromas', instruction:'Note 2 cheiros que você consegue perceber.', example:'O ar, uma bebida ou um sabonete. Se não perceber, pode pular esta etapa.'},
  {count:1, icon:'heart', title:'Perceba um sabor', instruction:'Identifique 1 sabor, sem precisar comer nada.', example:'O gosto na sua boca ou um gole de água, se estiver ao seu alcance.'}
];
function openExercise(type) {
  portalState.returnView = portalState.view;
  portalState.previousFocus = document.activeElement;
  closeVoiceCallModal(); closeVideoCallModal();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.getElementById('exerciseDialog').showModal();
  startExercise(type);
}
function startExercise(type, announce = true) {
  clearInterval(portalState.timer); portalState.timer = null;
  portalState.exercise = {type, step:0, elapsed:0, paused:false, complete:false};
  renderExercise(announce);
  if (type === 'breathing') portalState.timer = setInterval(tickBreathing, 1000);
}
function tickBreathing() {
  const exercise = portalState.exercise;
  if (!exercise || exercise.paused || exercise.complete) return;
  exercise.elapsed++;
  if (exercise.elapsed === 4) {
    exercise.elapsed = 0; exercise.step++;
    if (exercise.step === 8) { finishExercise(); return; }
    renderExercise();
  } else updateBreathingProgress();
}
function updateBreathingProgress() {
  const exercise = portalState.exercise;
  const seconds = 4 - exercise.elapsed;
  document.getElementById('exerciseCount').textContent = `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
  const ring = document.getElementById('exerciseRing');
  ring.style.setProperty('--progress', `${exercise.elapsed / 4 * 360}deg`);
  ring.dataset.phase = exercise.step % 2 === 0 ? 'inhale' : 'exhale';
  ring.dataset.tick = exercise.elapsed;
}
function renderExercise(announce = true) {
  const exercise = portalState.exercise;
  const dialog = document.getElementById('exerciseDialog');
  dialog.dataset.exercise = exercise.type;
  dialog.dataset.complete = String(exercise.complete);
  dialog.dataset.paused = String(exercise.paused);
  const breathing = exercise.type === 'breathing';
  document.getElementById('exerciseKind').textContent = breathing ? 'Respiração' : 'Grounding';
  document.getElementById('exercisePause').hidden = !breathing || exercise.complete;
  document.getElementById('exerciseNext').hidden = breathing || exercise.complete;
  document.getElementById('exerciseRestart').hidden = !exercise.complete;
  document.getElementById('exerciseBack').hidden = breathing || exercise.complete || exercise.step === 0;
  document.getElementById('exerciseMenu').hidden = !exercise.complete;
  document.getElementById('exerciseCount').hidden = !breathing || exercise.complete;
  const ring = document.getElementById('exerciseRing');
  ring.classList.toggle('is-grounding', !breathing);
  ring.classList.toggle('is-complete', exercise.complete);
  const dots = document.getElementById('exerciseDots');
  const total = breathing ? 4 : 5;
  const active = breathing ? Math.floor(exercise.step / 2) : exercise.step;
  dots.innerHTML = Array.from({length:total}, (_,i) => `<span class="exercise-dot ${i <= active ? 'filled' : ''}"></span>`).join('');
  let title, instruction;
  if (exercise.complete) {
    title = breathing ? 'Você conseguiu!' : 'Você está aqui.';
    instruction = 'Obrigado por cuidar de você. Pode repetir ou seguir no seu tempo.';
    document.getElementById('exerciseStep').textContent = 'Um passo de cuidado';
    ring.innerHTML = soliImage();
    document.getElementById('exerciseExample').hidden = true;
  } else if (breathing) {
    const inhale = exercise.step % 2 === 0;
    title = inhale ? 'Inspire' : 'Expire';
    instruction = inhale ? 'Pelo nariz, devagar, sem forçar.' : 'Solte o ar devagar, no seu ritmo.';
    document.getElementById('exerciseStep').textContent = `Ciclo ${active + 1} de 4`;
    ring.innerHTML = `<span class="breath-orbit">${soliImage()}</span>`;
    document.getElementById('exerciseExample').hidden = true;
    document.getElementById('exercisePause').textContent = exercise.paused ? 'Continuar' : 'Pausar';
    updateBreathingProgress();
  } else {
    const step = groundingSteps[exercise.step];
    title = step.title; instruction = step.instruction;
    document.getElementById('exerciseStep').textContent = `Etapa ${exercise.step + 1} de 5`;
    ring.innerHTML = `<span class="sense-symbol">${portalIcon(step.icon)}</span><span class="sense-count">${step.count}</span>`;
    const example = document.getElementById('exerciseExample');
    example.hidden = false; example.textContent = step.example;
    document.getElementById('exerciseNext').innerHTML = `${exercise.step === 4 ? 'Concluir' : 'Próximo'} ${portalIcon('arrow')}`;
  }
  document.getElementById('exerciseTitle').textContent = title;
  document.getElementById('exerciseInstruction').textContent = instruction;
  document.getElementById('exerciseComfort').textContent = breathing ? 'Não precisa prender o ar. Se ficar desconfortável, pause e respire normalmente.' : 'Faça no seu tempo. Se algum sentido não estiver disponível, avance para o próximo.';
  if (announce) document.getElementById('exerciseAnnouncement').textContent = `${title}. ${instruction}`;
}
function toggleExercisePause() {
  if (!portalState.exercise || portalState.exercise.complete) return;
  portalState.exercise.paused = !portalState.exercise.paused;
  renderExercise(false);
  document.getElementById('exerciseAnnouncement').textContent = portalState.exercise.paused ? 'Exercício pausado.' : 'Exercício retomado.';
}
function nextExerciseStep() {
  const exercise = portalState.exercise;
  if (!exercise || exercise.complete) return;
  exercise.step++;
  if (exercise.step === 5) finishExercise(); else renderExercise();
}
function previousExerciseStep() {
  if (portalState.exercise?.step > 0) { portalState.exercise.step--; renderExercise(); }
}
function finishExercise() {
  clearInterval(portalState.timer); portalState.timer = null;
  portalState.exercise.complete = true;
  renderExercise();
}
function closeExercise() {
  clearInterval(portalState.timer); portalState.timer = null;
  portalState.exercise = null;
  document.getElementById('exerciseDialog').close();
  portalState.previousFocus?.focus();
}
function returnFromExercise() {
  const view = portalState.returnView;
  closeExercise(); navigatePortal(view);
}
