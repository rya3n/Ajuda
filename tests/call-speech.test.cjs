const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// The call logic is exercised with browser events, without a microphone, network,
// or real speaker. This covers the state transitions behind both call dialogs.
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function createHarness(options = {}) {
  let now = 0;
  let nextTimer = 1;
  const timers = new Map();
  const elements = new Map();
  const recognizers = [];
  const utterances = [];
  const streams = [];
  const mediaRequests = [];
  const logs = [];
  let currentUtterance = null;

  function timer(fn, delay, interval = false) {
    const id = nextTimer++;
    timers.set(id, { fn, due: now + Math.max(0, Number(delay) || 0), interval, delay: Math.max(1, Number(delay) || 1) });
    return id;
  }
  function element(id) {
    if (!elements.has(id)) {
      let content = '';
      const classes = new Set();
      const attributes = new Map();
      elements.set(id, {
        id, value: '', style: {}, dataset: {}, disabled: false,
        get innerText() { return content; }, set innerText(value) { content = String(value); },
        get textContent() { return content; }, set textContent(value) { content = String(value); },
        innerHTML: '',
        classList: {
          add: (...names) => names.forEach(name => classes.add(name)),
          remove: (...names) => names.forEach(name => classes.delete(name)),
          contains: name => classes.has(name),
          toggle(name, forced) { const added = forced === undefined ? !classes.has(name) : forced; added ? classes.add(name) : classes.delete(name); return added; }
        },
        setAttribute: (name, value) => attributes.set(name, String(value)),
        getAttribute: name => attributes.get(name),
        removeAttribute: name => attributes.delete(name),
        addEventListener() {}, removeEventListener() {},
        querySelector(selector) { return element(`${id} ${selector}`); }, querySelectorAll() { return []; },
        appendChild() {}, remove() {}, focus() {}, closest() { return null; }
      });
    }
    return elements.get(id);
  }

  function makeStream() {
    const track = {
      enabled: true, readyState: 'live', stopCalls: 0,
      stop() { this.stopCalls++; this.readyState = 'ended'; },
      addEventListener() {}, removeEventListener() {}
    };
    const stream = { track, getTracks: () => [track], getAudioTracks: () => [track] };
    streams.push(stream);
    return stream;
  }

  class FakeRecognition {
    constructor() {
      this.active = false;
      this.starting = false;
      this.startCalls = 0;
      this.stopCalls = 0;
      this.abortCalls = 0;
      recognizers.push(this);
    }
    start() {
      if (this.active || this.starting) throw Object.assign(new Error('Already started'), { name: 'InvalidStateError' });
      this.startCalls++;
      this.starting = true;
      timer(() => {
        if (!this.starting) return;
        this.starting = false;
        this.active = true;
        this.onstart?.({});
      }, 0);
    }
    stop() { this.stopCalls++; this.end(); }
    abort() { this.abortCalls++; this.end(); }
    end() {
      const wasRunning = this.active || this.starting;
      this.active = false;
      this.starting = false;
      if (wasRunning) timer(() => this.onend?.({}), 0);
    }
    result(text, isFinal = true) {
      this.results([{ text, isFinal }]);
    }
    results(segments, resultIndex = 0) {
      const results = segments.map(segment => {
        const result = [{ transcript: segment.text, confidence: 0.95 }];
        result.isFinal = segment.isFinal;
        return result;
      });
      this.onresult?.({ resultIndex, results });
    }
    error(error) {
      this.onerror?.({ error });
      this.end();
    }
  }

  const speechSynthesis = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [{ lang: 'pt-BR', name: 'Test Portuguese voice' }],
    speak(utterance) {
      utterances.push(utterance);
      currentUtterance = utterance;
      this.speaking = true;
      utterance.onstart?.({});
    },
    cancel() {
      const previous = currentUtterance;
      currentUtterance = null;
      this.speaking = false;
      if (previous) timer(() => previous.onerror?.({ error: 'canceled' }), 0);
    },
    resume() { this.paused = false; }, pause() { this.paused = true; },
    addEventListener() {}, removeEventListener() {}
  };

  class FakeDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }

  const sandbox = {
    console: { log: (...args) => logs.push(args), warn: (...args) => logs.push(args), error: (...args) => logs.push(args) },
    document: {
      getElementById: element,
      createElement: () => element('created-' + nextTimer++),
      querySelector: () => null, querySelectorAll: () => [],
      addEventListener() {}, removeEventListener() {},
      body: element('body'), documentElement: element('html')
    },
    navigator: {
      userAgent: 'Regression browser',
      mediaDevices: {
        getUserMedia(constraints) {
          mediaRequests.push(constraints);
          if (options.mediaProvider) return options.mediaProvider(makeStream, mediaRequests.length);
          if (options.mediaError) return Promise.reject(Object.assign(new Error(options.mediaError), { name: options.mediaError }));
          return Promise.resolve(makeStream());
        },
        addEventListener() {}, removeEventListener() {}
      },
      permissions: { query: async () => ({ state: 'granted', addEventListener() {} }) }
    },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    speechSynthesis,
    setTimeout: (fn, delay) => timer(fn, delay), clearTimeout: id => timers.delete(id),
    setInterval: (fn, delay) => timer(fn, delay, true), clearInterval: id => timers.delete(id),
    requestAnimationFrame: fn => timer(() => fn(now), 16), cancelAnimationFrame: id => timers.delete(id),
    Date: FakeDate, performance: { now: () => now },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    isSecureContext: true,
    location: { protocol: 'http:', hostname: '127.0.0.1', href: 'http://127.0.0.1:8080/', replace() {} },
    innerWidth: 1440,
    fetch: async () => { throw new Error('No network is needed for local call replies.'); },
    AbortController,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char])),
    soliImage: () => '<img alt="Soli">',
    navigatePortal() {}
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  if (options.recognition !== false) {
    sandbox.SpeechRecognition = FakeRecognition;
    sandbox.webkitSpeechRecognition = FakeRecognition;
  }
  const context = vm.createContext(sandbox);
  const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'conversation.js'), 'utf8'), context, { filename: 'conversation.js' });
  vm.runInContext(source + '\nglobalThis.__calls = { manager: CallSpeechManager, state: appState };', context, { filename: 'script.js' });

  async function flush() { for (let i = 0; i < 30; i++) await Promise.resolve(); }
  async function advance(ms = 0) {
    await flush();
    const until = now + ms;
    let turns = 0;
    while (true) {
      let selected;
      for (const [id, value] of timers) {
        if (value.due <= until && (!selected || value.due < selected[1].due)) selected = [id, value];
      }
      if (!selected) break;
      if (++turns > 1000) throw new Error('Timer loop: recognition must not restart synchronously forever.');
      const [id, value] = selected;
      now = value.due;
      if (value.interval) value.due += value.delay;
      else timers.delete(id);
      value.fn();
      await flush();
    }
    now = until;
    await flush();
  }
  const harness = {
    manager: sandbox.__calls.manager, state: sandbox.__calls.state,
    context, elements, recognizers, utterances, streams, mediaRequests, logs,
    makeStream, advance, flush, element,
    open(type) { sandbox[type === 'voice' ? 'openVoiceCallModal' : 'openVideoCallModal'](); },
    close(type) { sandbox[type === 'voice' ? 'closeVoiceCallModal' : 'closeVideoCallModal'](); },
    mute(type) { sandbox[type === 'voice' ? 'toggleCallMute' : 'toggleVideoMic'](); },
    finish(utterance = currentUtterance) {
      if (utterance === currentUtterance) { currentUtterance = null; speechSynthesis.speaking = false; }
      utterance?.onend?.({});
    },
    get recognizer() { return this.manager.recognition || recognizers.at(-1); },
    get starts() { return recognizers.reduce((sum, item) => sum + item.startCalls, 0); }
  };
  return harness;
}

async function beginListening(h, type) {
  h.open(type);
  await h.advance(50);
  assert.ok(h.utterances.length, 'A call starts with a spoken greeting.');
  assert.equal(h.manager.isSpeaking, true);
  h.finish();
  await h.advance(1600);
  assert.equal(h.manager.isCalling, true);
  assert.equal(h.manager.isListening, true, 'Recognition resumes after the greeting.');
  assert.equal(h.recognizer.active, true);
}

module.exports = { createHarness };

if (require.main === module) {
for (const type of ['voice', 'video']) {
  for (const isFinal of [true, false]) {
    test(`${type}: ${isFinal ? 'final' : 'interim'} speech receives a reply and resumes listening`, async () => {
      const h = createHarness();
      await beginListening(h, type);
      const count = h.utterances.length;
      h.recognizer.result('Estou com ansiedade', isFinal);
      await h.advance(2200);
      assert.equal(h.utterances.length, count + 1);
      assert.match(h.utterances.at(-1).text, /ansiedade|medo|respirar|devagar|passo/i);
      assert.equal(h.state.callDialogueHistory.filter(turn => turn.role === 'user').length, 1);
      assert.equal(h.manager.isSpeaking, true);
      assert.equal(h.manager.isListening, false, 'Soli must not listen to her own response.');
      h.recognizer.result('fala do alto-falante', true);
      await h.advance(1500);
      assert.equal(h.utterances.length, count + 1, 'Recognizer events during the response are discarded.');
      h.finish();
      await h.advance(1600);
      assert.equal(h.manager.isListening, true);
      assert.equal(h.recognizer.active, true);
      h.close(type);
    });
  }

  test(`${type}: mute cancels pending speech, and a new call starts unmuted`, async () => {
    const h = createHarness();
    await beginListening(h, type);
    const count = h.utterances.length;
    h.recognizer.result('Eu ainda estou falando', false);
    await h.advance(50);
    h.mute(type);
    await h.advance(2400);
    assert.equal(h.state.isMuted, true);
    assert.equal(h.manager.isListening, false);
    assert.equal(h.utterances.length, count, 'No pending phrase is sent after mute.');
    assert.equal(h.recognizer.active, false, 'Mute stops the recognizer itself.');
    h.close(type);
    await h.advance(50);
    await beginListening(h, type);
    assert.equal(h.state.isMuted, false);
    const label = h.element(type === 'voice' ? 'callMuteLabel' : 'videoMicLabel').innerText;
    assert.match(label, /ativo|ativado|ligado/i);
    h.close(type);
  });

  test(`${type}: no-speech restarts with a delay, rather than a tight loop`, async () => {
    const h = createHarness();
    await beginListening(h, type);
    const before = h.starts;
    h.recognizer.error('no-speech');
    await h.advance(0);
    assert.equal(h.starts, before, 'The end event must not immediately start another recognition.');
    assert.equal(h.manager.isListening, false);
    await h.advance(2200);
    assert.ok(h.starts > before);
    assert.equal(h.manager.isListening, true);
    h.close(type);
  });

  test(`${type}: denied microphone never claims to be listening`, async () => {
    const h = createHarness({ mediaError: 'NotAllowedError' });
    h.open(type);
    await h.advance(50);
    h.finish();
    await h.advance(1500);
    assert.equal(h.manager.isListening, false);
    assert.ok(h.manager.blockedReason, 'The permission problem must be represented in state.');
    const before = h.starts;
    await h.advance(20000);
    assert.equal(h.starts, before, 'Permission denial must not cause repeated starts.');
    const label = h.element(type === 'voice' ? 'callStateLabel' : 'videoStatusLabel').innerText;
    assert.doesNotMatch(label, /ouvindo|pode falar|microfone ativo/i);
    h.close(type);
  });

  test(`${type}: unavailable recognition is reported without pretending to hear`, async () => {
    const h = createHarness({ recognition: false });
    h.open(type);
    await h.advance(50);
    h.finish();
    await h.advance(2200);
    assert.equal(h.manager.isListening, false);
    assert.ok(h.manager.blockedReason);
    assert.equal(h.starts, 0);
    const label = h.element(type === 'voice' ? 'callStateLabel' : 'videoStatusLabel').innerText;
    assert.doesNotMatch(label, /ouvindo|pode falar|microfone ativo/i);
    h.close(type);
  });

  test(`${type}: recognition permission and service errors do not loop`, async () => {
    for (const reason of ['not-allowed', 'service-not-allowed', 'audio-capture', 'network']) {
      const h = createHarness();
      await beginListening(h, type);
      h.recognizer.error(reason);
      await h.advance(20000);
      assert.equal(h.manager.isListening, false, reason);
      assert.ok(h.manager.blockedReason, reason);
      const before = h.starts;
      await h.advance(20000);
      assert.equal(h.starts, before, `${reason}: retries must terminate instead of running forever.`);
      assert.ok(h.starts <= 6, `${reason}: bounded retry count.`);
      h.close(type);
    }
  });

  test(`${type}: closing invalidates pending recognition text and old synthesis callbacks`, async () => {
    const h = createHarness();
    await beginListening(h, type);
    h.recognizer.result('frase de uma ligação encerrada', false);
    h.close(type);
    await h.advance(50);
    h.open(type);
    await h.advance(50);
    const current = h.utterances.at(-1);
    const old = h.utterances[0];
    old.onend?.({});
    old.onerror?.({ error: 'canceled' });
    await h.advance(1200);
    assert.equal(h.manager.isSpeaking, true, 'An old utterance cannot clear the current speaking state.');
    assert.equal(h.manager.isListening, false);
    assert.equal(h.state.callDialogueHistory.filter(turn => turn.role === 'user').length, 0);
    h.finish(current);
    await h.advance(1600);
    assert.equal(h.manager.isListening, true);
    h.close(type);
  });
}

test('A delayed microphone permission from a closed call is released and cannot replace the new stream', async () => {
  const oldPermission = deferred();
  let currentStream;
  const h = createHarness({
    mediaProvider(makeStream, count) {
      if (count === 1) return oldPermission.promise;
      currentStream = makeStream();
      return Promise.resolve(currentStream);
    }
  });
  h.open('voice');
  await h.advance(50);
  const oldSession = h.manager.sessionId;
  h.close('voice');
  h.open('video');
  await h.advance(50);
  assert.notEqual(h.manager.sessionId, oldSession);
  const oldStream = h.makeStream();
  oldPermission.resolve(oldStream);
  await h.advance(50);
  assert.equal(oldStream.track.readyState, 'ended');
  assert.equal(h.manager.audioStream, currentStream, 'The newer call keeps its own microphone stream.');
  h.close('video');
  assert.equal(currentStream.track.readyState, 'ended');
});

test('Unmuting during synthesis does not activate recognition until Soli finishes', async () => {
  const h = createHarness();
  await beginListening(h, 'voice');
  h.recognizer.result('Estou sentindo medo', true);
  await h.advance(2200);
  assert.equal(h.manager.isSpeaking, true);
  h.mute('voice');
  h.mute('voice');
  await h.advance(800);
  assert.equal(h.state.isMuted, false);
  assert.equal(h.manager.isSpeaking, true);
  assert.equal(h.manager.isListening, false);
  h.finish();
  await h.advance(1600);
  assert.equal(h.manager.isListening, true);
  h.close('voice');
});

test('The speech watchdog unlocks both microphones when synthesis never emits end or error', async () => {
  for (const type of ['voice', 'video']) {
    const h = createHarness();
    h.open(type);
    await h.advance(50);
    assert.equal(h.manager.isSpeaking, true);
    const stuck = h.utterances.at(-1);
    // Even cancellation fails to emit events in the faulty embedded-browser case.
    stuck.onend = stuck.onerror = null;
    await h.advance(65000);
    assert.equal(h.manager.isSpeaking, false, `${type}: the speaking state has a deadline.`);
    assert.equal(h.manager.isListening, true, `${type}: recognition resumes after that deadline.`);
    assert.equal(h.recognizer.active, true);
    assert.equal(h.utterances.length, 1, 'Recovery must not repeat the greeting or invent an answer.');
    h.close(type);
  }
});

test('Continuous final and interim results preserve the complete phrase without repeating earlier segments', async () => {
  for (const type of ['voice', 'video']) {
    const h = createHarness();
    await beginListening(h, type);
    const count = h.utterances.length;
    h.recognizer.results([
      { text: 'Eu estou', isFinal: true },
      { text: 'com me', isFinal: false }
    ], 0);
    await h.advance(200);
    h.recognizer.results([
      { text: 'Eu estou', isFinal: true },
      { text: 'com medo', isFinal: true },
      { text: 'ago', isFinal: false }
    ], 1);
    await h.advance(200);
    h.recognizer.results([
      { text: 'Eu estou', isFinal: true },
      { text: 'com medo', isFinal: true },
      { text: 'agora', isFinal: true }
    ], 2);
    await h.advance(2200);
    const userTurns = h.state.callDialogueHistory.filter(turn => turn.role === 'user');
    assert.equal(userTurns.length, 1);
    assert.equal(userTurns[0].text, 'Eu estou com medo agora');
    assert.equal(h.utterances.length, count + 1);
    h.finish();
    await h.advance(1600);
    assert.equal(h.manager.isListening, true);
    h.close(type);
  }
});

}
