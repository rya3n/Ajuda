const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHarness } = require('./call-speech.test.cjs');

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const response = (data, ok = true) => ({ ok, json: async () => data });
const samples = () => new Float32Array(3200).fill(.12);

function createLocalHarness(options = {}) {
  const h = createHarness(options);
  h.captures = [];
  h.transcriptions = [];
  h.requests = [];
  // Use the actual WAV encoder; fake only the device and audio callbacks.
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'local-speech.js'), 'utf8'), h.context, { filename: 'local-speech.js' });
  h.context.LocalSpeechCapture = class {
    constructor(callbacks) {
      this.callbacks = callbacks;
      this.enabled = false;
      this.stopped = false;
      this.stopCalls = 0;
      this.enabledChanges = [];
      h.captures.push(this);
    }
    async start(stream) {
      this.stream = stream;
      if (options.captureStart) await options.captureStart(this);
    }
    setEnabled(enabled) {
      this.enabled = enabled && !this.stopped;
      this.enabledChanges.push(this.enabled);
    }
    async stop() {
      this.stopCalls++;
      this.stopped = true;
      this.setEnabled(false);
      if (options.captureStop) await options.captureStop(this);
    }
    // Force permits an event already in flight when mute/stop disabled capture.
    speech(audio = samples(), force = false) {
      if (this.enabled || force) return this.callbacks.onSpeech(audio);
    }
    error() { this.callbacks.onError(new Error('Simulated capture error')); }
    level(value) { this.callbacks.onLevel(value); }
  };
  h.context.fetch = (url, request = {}) => {
    h.requests.push({ url, request });
    if (url === '/api/speech/status') return Promise.resolve(response({ available: true, state: 'ready' }));
    if (url === '/api/status') return Promise.resolve(response({ configured: false }));
    if (url === '/api/transcribe') {
      const turn = { number: h.transcriptions.length + 1, ...request };
      h.transcriptions.push(turn);
      return options.transcribe
        ? Promise.resolve(options.transcribe(turn))
        : Promise.resolve(response({ text: 'Estou com ansiedade' }));
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };
  h.currentCapture = () => h.manager.localCapture;
  return h;
}

async function listen(h, type) {
  h.open(type);
  await h.advance(50);
  assert.ok(h.currentCapture());
  assert.equal(h.manager.isSpeaking, true);
  assert.equal(h.currentCapture().enabled, false);
  h.finish();
  await h.advance(600);
  assert.equal(h.manager.isListening, true);
  assert.equal(h.currentCapture().enabled, true);
  assert.equal(h.recognizers.length, 0, 'A ready local service bypasses native recognition.');
}

for (const type of ['voice', 'video']) {
  test(`${type}: captured PCM becomes a WAV request, response, spoken reply and renewed listening`, async () => {
    const h = createLocalHarness();
    await listen(h, type);
    const originalCapture = h.currentCapture();
    originalCapture.speech();
    await h.flush();
    assert.equal(h.transcriptions.length, 1);
    const request = h.transcriptions[0];
    assert.equal(request.method, 'POST');
    assert.equal(request.headers['Content-Type'], 'audio/wav');
    const bytes = new Uint8Array(request.body);
    assert.equal(Buffer.from(bytes.subarray(0, 4)).toString('ascii'), 'RIFF');
    assert.equal(Buffer.from(bytes.subarray(8, 12)).toString('ascii'), 'WAVE');
    assert.equal(new DataView(bytes.buffer).getUint32(24, true), 16000);
    assert.equal(bytes.length, 44 + samples().length * 2);
    assert.equal(h.state.callDialogueHistory.filter(turn => turn.role === 'user')[0].text, 'Estou com ansiedade');
    assert.equal(h.utterances.length, 2);
    assert.equal(h.utterances.at(-1).text, h.state.callDialogueHistory.at(-1).text);
    assert.equal(h.manager.isSpeaking, true);
    assert.equal(h.manager.isListening, false);
    assert.equal(originalCapture.enabled, false);
    h.finish();
    await h.advance(600);
    assert.equal(h.manager.isListening, true);
    assert.equal(h.currentCapture(), originalCapture);
    assert.equal(originalCapture.enabled, true);
    h.close(type);
  });

  test(`${type}: captured events during Soli speech or mute are ignored`, async () => {
    const h = createLocalHarness();
    h.open(type);
    await h.advance(50);
    h.currentCapture().speech(samples(), true);
    await h.flush();
    assert.equal(h.transcriptions.length, 0, 'The greeting must not become another user phrase.');
    h.finish();
    await h.advance(600);
    h.mute(type);
    h.currentCapture().speech(samples(), true);
    await h.flush();
    assert.equal(h.transcriptions.length, 0);
    assert.equal(h.manager.isListening, false);
    assert.equal(h.currentCapture().enabled, false);
    assert.equal(h.manager.audioStream.track.enabled, false);
    h.mute(type);
    await h.advance(50);
    assert.equal(h.manager.isListening, true);
    assert.equal(h.currentCapture().enabled, true);
    h.close(type);
  });

  test(`${type}: mute aborts an in-flight transcription and discards its late text`, async () => {
    const pending = deferred();
    const h = createLocalHarness({ transcribe: () => pending.promise });
    await listen(h, type);
    h.currentCapture().speech();
    await h.flush();
    assert.equal(h.manager.isTranscribing, true);
    h.mute(type);
    assert.equal(h.transcriptions[0].signal.aborted, true);
    pending.resolve(response({ text: 'Frase entregue depois de mutar' }));
    await h.flush();
    assert.equal(h.manager.isTranscribing, false);
    assert.equal(h.manager.isListening, false);
    assert.equal(h.state.callDialogueHistory.filter(turn => turn.role === 'user').length, 0);
    assert.equal(h.utterances.length, 1);
    h.mute(type);
    await h.advance(50);
    assert.equal(h.manager.isListening, true);
    h.close(type);
  });

  test(`${type}: empty transcription keeps the call usable without an invented reply`, async () => {
    const h = createLocalHarness({ transcribe: () => response({ text: '   ' }) });
    await listen(h, type);
    h.currentCapture().speech();
    await h.flush();
    assert.equal(h.transcriptions.length, 1);
    assert.equal(h.utterances.length, 1);
    assert.equal(h.state.callDialogueHistory.filter(turn => turn.role === 'user').length, 0);
    assert.equal(h.manager.isTranscribing, false);
    assert.equal(h.manager.isListening, true);
    assert.equal(h.currentCapture().enabled, true);
    assert.match(h.element('callUserSpeechText').textContent, /Não entendi/);
    h.close(type);
  });

  test(`${type}: transcription failure releases resources and explicit retry recovers`, async () => {
    const h = createLocalHarness({ transcribe: request => request.number === 1
      ? response({ error: 'failed' }, false)
      : response({ text: 'Agora o microfone funcionou' }) });
    await listen(h, type);
    const capture = h.currentCapture();
    const stream = h.manager.audioStream;
    capture.speech();
    await h.flush();
    assert.equal(h.manager.blockedReason, 'speech-service');
    assert.equal(h.manager.isListening, false);
    assert.equal(h.manager.audioStream, null);
    assert.equal(stream.track.readyState, 'ended');
    assert.equal(capture.stopped, true);
    await h.manager.retry();
    await h.advance(50);
    assert.equal(h.manager.blockedReason, '');
    assert.equal(h.manager.isListening, true);
    assert.notEqual(h.currentCapture(), capture);
    h.currentCapture().speech();
    await h.flush();
    assert.equal(h.transcriptions.length, 2);
    assert.ok(h.state.callDialogueHistory.some(turn => turn.role === 'user' && turn.text === 'Agora o microfone funcionou'));
    h.close(type);
  });

  test(`${type}: closing aborts transcription and stops capture and its microphone track`, async () => {
    const pending = deferred();
    const h = createLocalHarness({ transcribe: () => pending.promise });
    await listen(h, type);
    const capture = h.currentCapture();
    const stream = h.manager.audioStream;
    capture.speech();
    await h.flush();
    h.close(type);
    assert.equal(h.transcriptions[0].signal.aborted, true);
    assert.equal(capture.stopped, true);
    assert.equal(capture.enabled, false);
    assert.equal(stream.track.readyState, 'ended');
    assert.equal(h.manager.audioStream, null);
    assert.equal(h.manager.localCapture, null);
    assert.equal(h.manager.isCalling, false);
    pending.resolve(response({ text: 'Não deve responder após fechar' }));
    await h.flush();
    assert.equal(h.utterances.length, 1);
    assert.equal(h.state.callDialogueHistory.filter(turn => turn.role === 'user').length, 0);
  });
}

test('A late transcript from voice cannot enter a newly opened video call', async () => {
  const pending = deferred();
  const h = createLocalHarness({ transcribe: () => pending.promise });
  await listen(h, 'voice');
  h.currentCapture().speech();
  await h.flush();
  h.close('voice');
  h.open('video');
  await h.advance(50);
  const current = h.currentCapture();
  const spoken = h.utterances.length;
  pending.resolve(response({ text: 'Transcrição da sessão anterior' }));
  await h.flush();
  assert.equal(h.manager.activeModalType, 'video');
  assert.equal(h.currentCapture(), current);
  assert.equal(h.utterances.length, spoken);
  assert.ok(!h.state.callDialogueHistory.some(turn => turn.text === 'Transcrição da sessão anterior'));
  assert.equal(h.manager.isSpeaking, true, 'The new greeting stays in control.');
  h.close('video');
});

test('Callbacks from a stopped capture cannot disrupt its replacement after retry', async () => {
  const h = createLocalHarness();
  await listen(h, 'voice');
  const old = h.currentCapture();
  old.error();
  await h.manager.retry();
  await h.advance(50);
  const current = h.currentCapture();
  assert.notEqual(current, old);
  old.level(.9);
  old.speech(samples(), true);
  old.error();
  await h.flush();
  assert.equal(h.currentCapture(), current);
  assert.equal(h.manager.blockedReason, '');
  assert.equal(h.manager.isListening, true);
  assert.equal(h.transcriptions.length, 0);
  assert.notEqual(h.element('callMicLevel').value, 90);
  h.close('voice');
});

test('A retry awaiting capture shutdown cannot modify a newer call', async () => {
  const shutdown = deferred();
  let waitingCapture;
  const h = createLocalHarness({ captureStop: capture => capture === waitingCapture ? shutdown.promise : undefined });
  await listen(h, 'voice');
  waitingCapture = h.currentCapture();
  const retry = h.manager.retry();
  await h.flush();
  h.close('voice');
  h.open('video');
  await h.advance(50);
  const current = h.currentCapture();
  const stream = h.manager.audioStream;
  const count = h.captures.length;
  shutdown.resolve();
  await retry;
  await h.flush();
  assert.equal(h.manager.activeModalType, 'video');
  assert.equal(h.currentCapture(), current);
  assert.equal(h.manager.audioStream, stream);
  assert.equal(h.captures.length, count, 'No third capture may be allocated by an obsolete retry.');
  h.close('video');
});

test('Two retries awaiting capture shutdown create only one replacement capture', async () => {
  const shutdown = deferred();
  let waitingCapture;
  const h = createLocalHarness({ captureStop: capture => capture === waitingCapture ? shutdown.promise : undefined });
  await listen(h, 'voice');
  waitingCapture = h.currentCapture();
  const stream = h.manager.audioStream;
  const originalCount = h.captures.length;
  const first = h.manager.retry();
  const second = h.manager.retry();
  await h.flush();
  assert.equal(h.manager.isPreparing, true);
  assert.equal(h.currentCapture(), null);
  assert.equal(h.captures.length, originalCount, 'Replacement must wait until the old capture has stopped.');
  shutdown.resolve();
  await Promise.all([first, second]);
  await h.advance(50);
  assert.equal(h.captures.length, originalCount + 1);
  assert.equal(h.mediaRequests.length, 1, 'Retry reuses the still-live permission stream.');
  assert.equal(h.manager.audioStream, stream);
  assert.equal(h.currentCapture().stream, stream);
  assert.equal(h.manager.isPreparing, false);
  assert.equal(h.manager.isListening, true);
  h.close('voice');
});

test('Two retries awaiting microphone permission allocate one stream and one capture', async () => {
  const permission = deferred();
  const h = createLocalHarness({ mediaProvider: (makeStream, count) => count === 1
    ? Promise.resolve(makeStream())
    : permission.promise });
  await listen(h, 'video');
  const old = h.currentCapture();
  const oldStream = h.manager.audioStream;
  old.error();
  assert.equal(oldStream.track.readyState, 'ended');
  const first = h.manager.retry();
  await h.flush();
  assert.equal(h.mediaRequests.length, 2);
  assert.equal(h.manager.isPreparing, true);
  const second = h.manager.retry();
  await h.flush();
  assert.equal(h.mediaRequests.length, 2, 'The second retry must not request another permission stream.');
  const newStream = h.makeStream();
  permission.resolve(newStream);
  await Promise.all([first, second]);
  await h.advance(50);
  assert.equal(h.captures.length, 2, 'Exactly one capture replaces the failed original.');
  assert.equal(h.manager.audioStream, newStream);
  assert.equal(h.currentCapture().stream, newStream);
  assert.equal(h.streams.filter(stream => stream.track.readyState === 'live').length, 1);
  assert.equal(h.manager.isPreparing, false);
  assert.equal(h.manager.isListening, true);
  h.close('video');
  assert.equal(newStream.track.readyState, 'ended');
});

test('Native fallback accepts a single-character answer', async () => {
  const h = createHarness();
  h.context.fetch = async url => {
    assert.equal(url, '/api/status');
    return response({ configured: false });
  };
  h.open('voice');
  await h.advance(50);
  h.finish();
  await h.advance(600);
  h.recognizer.result('É', true);
  await h.advance(900);
  assert.ok(h.state.callDialogueHistory.some(turn => turn.role === 'user' && turn.text === 'É'));
  assert.equal(h.utterances.length, 2);
  assert.equal(h.manager.isSpeaking, true);
  h.close('voice');
});

test('Synthesis that never starts releases local capture after the 2.5-second startup deadline', async () => {
  const h = createLocalHarness();
  h.context.speechSynthesis.speak = utterance => { h.utterances.push(utterance); };
  h.context.speechSynthesis.speaking = false;
  h.context.speechSynthesis.pending = false;
  h.open('video');
  await h.advance(2400);
  assert.equal(h.manager.isSpeaking, true);
  assert.equal(h.currentCapture().enabled, false);
  await h.advance(650);
  assert.equal(h.manager.isSpeaking, false, 'The 2.5-second deadline plus the speaker gap must unlock capture.');
  assert.equal(h.manager.isListening, true);
  assert.equal(h.currentCapture().enabled, true);
  h.close('video');
});
