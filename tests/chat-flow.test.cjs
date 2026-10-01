const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { createHarness } = require('./call-speech.test.cjs');

const plain = value => JSON.parse(JSON.stringify(value));
const messageText = payload => payload.contents.map(turn => turn.parts[0].text).join('\n');
const promptText = payload => payload.systemInstruction.parts[0].text;
const reply = text => ({ ok: true, json: async () => ({ text }) });

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function decodeText(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|apos|#39);/g, entity => ({
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'"
  }[entity]));
}

function createChatHarness(respond = request => reply(`Resposta ${request.number}`)) {
  const h = createHarness();
  h.requests = [];
  h.rendered = [];
  // The shared speech harness does not need HTML parsing. Chat assertions do:
  // model browser textContent for the small message fixtures used in this file.
  h.context.document.createElement = tagName => {
    let html = '';
    const node = {
      tagName, className: '', id: '', style: {}, dataset: {},
      get innerHTML() { return html; }, set innerHTML(value) { html = String(value); },
      get textContent() { return decodeText(html); }, set textContent(value) { html = String(value); },
      get outerHTML() { return `<${tagName} class="${this.className}">${html}</${tagName}>`; },
      classList: { add() {}, remove() {}, toggle() {} },
      remove() {}, appendChild() {}, setAttribute() {}, addEventListener() {}
    };
    return node;
  };
  // This helper belongs to portal.js; it has no bearing on conversation state.
  h.context.closeMobileSidebar = () => {};
  h.element('chatMessages').appendChild = node => {
    h.rendered.push(node);
    h.element('chatMessages').innerHTML += node.outerHTML;
  };
  h.context.fetch = (url, options = {}) => {
    assert.equal(url, '/api/chat', 'The conversation uses the local API endpoint.');
    const request = { number: h.requests.length + 1, payload: JSON.parse(options.body), options };
    h.requests.push(request);
    return Promise.resolve(respond(request));
  };
  vm.runInContext('apiConnection.configured = true; API_CONFIG.useExternalAPI = true;', h.context);
  return h;
}

test('API turns receive prior clean history and distinct instructions for every channel', async () => {
  const h = createChatHarness(request => reply(`Resposta do canal para ${messageText(request.payload)}`));
  const channels = ['soli', '190', '192', '180', '100', 'professional'];
  for (const persona of channels) {
    const first = `Primeira mensagem exclusiva ${persona}`;
    const second = `Continuação exclusiva ${persona}`;
    await h.context.queueConversationTurn(first, persona);
    await h.context.queueConversationTurn(second, persona);
    const request = h.requests.at(-1);
    const contents = plain(request.payload.contents);
    assert.equal(contents[0].parts[0].text, first);
    assert.equal(contents[1].role, 'model');
    assert.equal(contents[2].parts[0].text, second);
    const guidance = vm.runInContext(`CHANNEL_GUIDANCE[${JSON.stringify(persona)}]`, h.context);
    assert.ok(promptText(request.payload).includes(guidance), `${persona}: its own service instructions are included.`);
    for (const other of channels.filter(value => value !== persona)) {
      assert.ok(!messageText(request.payload).includes(`exclusiva ${other}`), `${persona} must not receive ${other}'s history.`);
    }
    assert.equal(h.state.channelHistories[persona].length, 4);
  }
});

test('Two rapid messages are queued in order and the second sees the first answer', async () => {
  const waiting = [];
  const h = createChatHarness(() => { const pending = deferred(); waiting.push(pending); return pending.promise; });
  const first = h.context.processAIResponse('Primeira pergunta');
  const second = h.context.processAIResponse('Segunda pergunta');
  await h.flush();
  assert.equal(h.requests.length, 1, 'Only the first turn may request a response initially.');
  assert.equal(messageText(h.requests[0].payload), 'Primeira pergunta');
  waiting[0].resolve(reply('Resposta para a primeira'));
  await first;
  await h.flush();
  assert.equal(h.requests.length, 2);
  assert.deepEqual(plain(h.requests[1].payload.contents), [
    { role: 'user', parts: [{ text: 'Primeira pergunta' }] },
    { role: 'model', parts: [{ text: 'Resposta para a primeira' }] },
    { role: 'user', parts: [{ text: 'Segunda pergunta' }] }
  ]);
  waiting[1].resolve(reply('Resposta para a segunda'));
  await second;
  const answers = h.rendered.filter(node => node.className === 'chat-msg msg-ai');
  assert.ok(answers[0].innerHTML.includes('Resposta para a primeira'));
  assert.ok(answers[1].innerHTML.includes('Resposta para a segunda'));
  assert.deepEqual(plain(h.state.channelHistories.soli).map(turn => turn.text), [
    'Primeira pergunta', 'Resposta para a primeira', 'Segunda pergunta', 'Resposta para a segunda'
  ]);
});

test('New chat invalidates old pending and queued turns without delaying the new history', async () => {
  const waiting = [];
  const h = createChatHarness(() => { const pending = deferred(); waiting.push(pending); return pending.promise; });
  const first = h.context.processAIResponse('Pergunta da conversa encerrada');
  const queued = h.context.processAIResponse('Outra pergunta da conversa encerrada');
  await h.flush();
  const oldHistory = h.state.channelHistories.soli;
  h.context.startNewChat();
  assert.notEqual(h.state.channelHistories.soli, oldHistory);
  const fresh = h.context.processAIResponse('Pergunta da conversa nova');
  await h.flush();
  assert.equal(h.requests.length, 2, 'A new history is independent of the old queue.');
  waiting[1].resolve(reply('Resposta nova'));
  await fresh;
  waiting[0].resolve(reply('Resposta antiga que chegou tarde'));
  await Promise.all([first, queued]);
  assert.equal(h.requests.length, 2, 'The queued old question is cancelled before calling the API.');
  const newText = h.state.channelHistories.soli.map(turn => turn.text).join('\n');
  assert.ok(newText.includes('Pergunta da conversa nova'));
  assert.ok(newText.includes('Resposta nova'));
  assert.doesNotMatch(newText, /conversa encerrada|Resposta antiga/);
  assert.ok(!h.rendered.some(node => node.innerHTML.includes('Resposta antiga que chegou tarde')));
});

test('A reply from a closed voice call cannot speak or enter the new video session', async () => {
  const waiting = [];
  const h = createChatHarness(() => { const pending = deferred(); waiting.push(pending); return pending.promise; });
  h.open('voice');
  await h.advance(50);
  const pending = h.context.handleCallUserSpeech('Mensagem na ligação antiga');
  await h.flush();
  assert.equal(h.requests.length, 1);
  h.close('voice');
  h.open('video');
  await h.advance(50);
  const spoken = h.utterances.length;
  waiting[0].resolve(reply('Resposta atrasada da ligação antiga'));
  await pending;
  assert.equal(h.manager.activeModalType, 'video');
  assert.equal(h.manager.isCalling, true);
  assert.equal(h.utterances.length, spoken);
  assert.ok(!h.state.channelHistories.soli.some(turn => turn.text.includes('Resposta atrasada')));
  assert.ok(!h.rendered.some(node => node.innerHTML.includes('Resposta atrasada')));
  h.close('video');
});

test('Detected GPS stays local and never appears automatically in API context', async () => {
  const h = createChatHarness();
  vm.runInContext("userLocation.coords = '-23.54321,-46.98765'; userLocation.fullAddress = 'LOCAL PRIVADO DETECTADO 987';", h.context);
  await h.context.processAIResponse('Quero conversar sobre como estou me sentindo');
  assert.doesNotMatch(JSON.stringify(h.requests[0].payload), /-23\.54321|-46\.98765|LOCAL PRIVADO DETECTADO/);
  h.state.selectedPersona = '190';
  const before = h.requests.length;
  await h.context.sendChannelPreset('location');
  assert.equal(h.requests.length, before + 1, 'The shortcut asks the API for generic address guidance.');
  assert.match(promptText(h.requests.at(-1).payload), /atalho location/);
  h.open('voice');
  await h.advance(50);
  await h.context.sendChannelPreset('location', true);
  assert.equal(h.requests.length, before + 2);
  for (const request of h.requests) {
    assert.doesNotMatch(JSON.stringify(request.payload), /-23\.54321|-46\.98765|LOCAL PRIVADO DETECTADO/);
  }
  assert.ok(!h.state.channelHistories['190'].some(turn => turn.text.includes('LOCAL PRIVADO DETECTADO')));
  assert.ok(h.rendered.some(node => node.innerHTML.includes('LOCAL PRIVADO DETECTADO')), 'Location remains visible locally when requested.');
  h.close('voice');
});

test('Message history contains model content, excluding reactions, audio controls and simulation labels', async () => {
  const h = createChatHarness();
  h.state.selectedPersona = '190';
  h.context.appendMessage('user', 'Pergunta inicial');
  h.context.appendMessage('ai', '<p>Resposta limpa &amp; curta.</p>');
  const rendered = h.rendered.at(-1).innerHTML;
  assert.match(rendered, /msg-reactions-bar|reaction-btn/);
  assert.match(rendered, /Mensagem de voz|voice-note-player/);
  assert.match(rendered, /Atendimento simulado/);
  assert.equal(h.state.channelHistories['190'][1].text, 'Resposta limpa & curta.');
  await h.context.processAIResponse('Quero continuar');
  const payload = JSON.stringify(h.requests.at(-1).payload.contents);
  assert.ok(payload.includes('Resposta limpa & curta.'));
  assert.doesNotMatch(payload, /Apoio|Gratidão|Segura|Abraço|Mensagem de voz|Atendimento simulado|reaction-btn/);
});

test('Voice and video presets register the user request and use the channel API instructions', async () => {
  for (const type of ['voice', 'video']) {
    for (const persona of ['soli', '190', '192', '180', '100', 'professional']) {
      const h = createChatHarness(() => reply('Resposta coerente ao atalho solicitado.'));
      h.state.selectedPersona = persona;
      const preset = vm.runInContext(`CHANNEL_PRESETS[${JSON.stringify(persona)}].find(preset => !preset.isLoc)`, h.context);
      h.open(type);
      await h.advance(50);
      await h.context.sendChannelPreset(preset.id, true);
      assert.equal(h.requests.length, 1);
      assert.ok(promptText(h.requests[0].payload).includes(`atalho ${preset.intent}`));
      assert.match(promptText(h.requests[0].payload), /lida em voz alta/);
      assert.equal(h.requests[0].payload.generationConfig.maxOutputTokens, 900);
      assert.ok(h.state.channelHistories[persona].some(turn => turn.role === 'user' && turn.text === preset.message));
      assert.equal(h.utterances.at(-1).text, 'Resposta coerente ao atalho solicitado.');
      assert.ok(h.element(type === 'voice' ? 'callQuickPrompts' : 'videoQuickPrompts').innerHTML.includes(preset.id));
      h.close(type);
    }
  }
});

test('The same channel history follows the conversation from text to voice to video', async () => {
  const h = createChatHarness(request => reply(`Resposta do turno ${request.number}`));
  await h.context.sendQuickMessage('Informação inicial por texto');
  const history = h.state.channelHistories.soli;
  h.open('voice');
  await h.advance(50);
  assert.equal(h.state.callDialogueHistory, history);
  await h.context.handleCallUserSpeech('Complemento por voz');
  h.close('voice');
  h.open('video');
  await h.advance(50);
  assert.equal(h.state.callDialogueHistory, history);
  await h.context.handleCallUserSpeech('Complemento por vídeo');
  assert.equal(h.state.channelHistories.soli, history);
  const received = messageText(h.requests.at(-1).payload);
  for (const text of ['Informação inicial por texto', 'Resposta do turno 1', 'Complemento por voz', 'Resposta do turno 2', 'Complemento por vídeo']) {
    assert.ok(received.includes(text), `The video turn retains: ${text}`);
  }
  assert.equal(history.filter(turn => turn.role === 'user').length, 3);
  h.close('video');
});

test('Switching the text channel keeps an active call attached to its original persona and history', async () => {
  const h = createChatHarness(() => reply('Resposta ainda no contexto policial.'));
  h.state.selectedPersona = '190';
  h.context.updateTopFriendDisplay();
  h.open('voice');
  await h.advance(50);
  const history = h.state.channelHistories['190'];
  h.context.switchChannel('soli');
  assert.equal(h.state.selectedPersona, 'soli');
  assert.equal(h.state.callPersonaId, '190');
  assert.equal(h.state.callDialogueHistory, history);
  await h.context.handleCallUserSpeech('A pessoa já saiu');
  assert.match(promptText(h.requests.at(-1).payload), /emergência policial/);
  assert.ok(history.some(turn => turn.role === 'user' && turn.text === 'A pessoa já saiu'));
  assert.ok(!h.state.channelHistories.soli.some(turn => turn.text === 'A pessoa já saiu'));
  assert.equal(h.element('callPersonaName').innerText, 'Polícia Militar 190');
  assert.equal(h.element('videoCounselorName').innerText, 'Polícia Militar 190');
  h.close('voice');
});

test('A pending answer is cached with its original channel when the user switches chats', async () => {
  const pending = deferred();
  const h = createChatHarness(() => pending.promise);
  h.state.selectedPersona = '190';
  const turn = h.context.processAIResponse('Pergunta exclusiva do canal policial');
  await h.flush();
  h.context.switchChannel('soli');
  const visibleBefore = h.rendered.length;
  pending.resolve(reply('Resposta exclusiva do canal policial'));
  await turn;
  assert.ok(h.state.channelDomCache['190'].includes('Resposta exclusiva do canal policial'));
  assert.ok(!h.rendered.slice(visibleBefore).some(node => node.innerHTML.includes('Resposta exclusiva do canal policial')));
  assert.ok(h.state.channelHistories['190'].some(item => item.text === 'Resposta exclusiva do canal policial'));
  assert.ok(!h.state.channelHistories.soli.some(item => item.text === 'Resposta exclusiva do canal policial'));
  h.context.switchChannel('190');
  assert.ok(h.element('chatMessages').innerHTML.includes('Resposta exclusiva do canal policial'));
});
