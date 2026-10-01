const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadSpeechModule(browserApis = {}) {
  const sandbox = { console, Float32Array, Int16Array, Uint8Array, ArrayBuffer, DataView, Math, Blob, URL, setTimeout, clearTimeout };
  Object.assign(sandbox, browserApis);
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'local-speech.js'), 'utf8'), sandbox, { filename: 'local-speech.js' });
  const utils = sandbox.SpeechAudioUtils;
  assert.ok(utils, 'The speech module exposes its audio utilities.');
  return { ...utils, LocalSpeechCapture: sandbox.LocalSpeechCapture, UtteranceSegmenter: utils.UtteranceSegmenter || sandbox.UtteranceSegmenter };
}

function tone(duration, sampleRate = 16000, amplitude = 0.08, frequency = 180) {
  const samples = new Float32Array(Math.round(duration * sampleRate));
  for (let i = 0; i < samples.length; i++) samples[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  return samples;
}

function silence(duration, sampleRate = 16000) {
  return new Float32Array(Math.round(duration * sampleRate));
}

function pushBlocks(segmenter, samples, blockLength = 320) {
  for (let start = 0; start < samples.length; start += blockLength) segmenter.push(samples.subarray(start, start + blockLength));
}

function createSegmenter() {
  const { UtteranceSegmenter } = loadSpeechModule();
  assert.equal(typeof UtteranceSegmenter, 'function', 'The segmenter is exposed for independent audio testing.');
  const utterances = [], levels = [];
  const segmenter = new UtteranceSegmenter({ sampleRate: 16000, onSpeech: samples => utterances.push(samples), onLevel: level => levels.push(level) });
  segmenter.setEnabled(true);
  return { segmenter, utterances, levels };
}

test('Resampling produces 16 kHz PCM with the original duration and pitch', () => {
  const { resamplePCM } = loadSpeechModule();
  for (const inputRate of [44100, 48000]) {
    const output = resamplePCM(tone(1, inputRate, 0.4, 440), inputRate);
    assert.ok(output instanceof Float32Array);
    assert.ok(Math.abs(output.length - 16000) <= 1);
    assert.ok(output.every(Number.isFinite));
    let positiveCrossings = 0;
    for (let i = 1; i < output.length; i++) if (output[i - 1] <= 0 && output[i] > 0) positiveCrossings++;
    assert.ok(Math.abs(positiveCrossings - 440) <= 2, `Pitch stays near 440 Hz after resampling ${inputRate} Hz.`);
  }
});

test('Resampling preserves samples already at 16 kHz and supports empty input', () => {
  const { resamplePCM } = loadSpeechModule();
  const samples = new Float32Array([-0.6, 0, 0.1, 0.7]);
  assert.deepEqual(Array.from(resamplePCM(samples, 16000)), Array.from(samples));
  assert.equal(resamplePCM(new Float32Array(0), 48000).length, 0);
});

test('WAV contains a mono PCM16 header and saturated little endian samples', async () => {
  const { encodeWav } = loadSpeechModule();
  const input = new Float32Array([-1, -0.5, 0, 0.5, 1, 1.3, -1.3]);
  const encoded = encodeWav(input, 16000);
  const bytes = encoded instanceof Blob ? new Uint8Array(await encoded.arrayBuffer()) : encoded instanceof ArrayBuffer ? new Uint8Array(encoded) : encoded;
  assert.ok(ArrayBuffer.isView(bytes), 'WAV is supplied as bytes, ArrayBuffer, or Blob.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = offset => String.fromCharCode(...new Uint8Array(bytes.buffer, bytes.byteOffset + offset, 4));
  assert.equal(tag(0), 'RIFF');
  assert.equal(tag(8), 'WAVE');
  assert.equal(tag(12), 'fmt ');
  assert.equal(tag(36), 'data');
  assert.equal(view.getUint32(4, true), 36 + input.length * 2);
  assert.equal(view.getUint16(20, true), 1);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 16000);
  assert.equal(view.getUint32(28, true), 32000);
  assert.equal(view.getUint16(32, true), 2);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(view.getUint32(40, true), input.length * 2);
  assert.equal(bytes.byteLength, 44 + input.length * 2);
  const expected = [-32768, -16384, 0, 16384, 32767, 32767, -32768];
  expected.forEach((value, index) => assert.ok(Math.abs(view.getInt16(44 + index * 2, true) - value) <= 1));
});

test('Silence and quiet background noise never create an empty utterance', () => {
  const { segmenter, utterances, levels } = createSegmenter();
  pushBlocks(segmenter, silence(3));
  pushBlocks(segmenter, tone(3, 16000, 0.002));
  pushBlocks(segmenter, silence(1));
  assert.equal(utterances.length, 0);
  assert.ok(levels.length > 0);
  assert.ok(levels.every(level => Number.isFinite(level) && level >= 0));
});

test('A spoken phrase is submitted once after at most 800 ms of silence', () => {
  const { segmenter, utterances } = createSegmenter();
  pushBlocks(segmenter, tone(0.5, 16000, 0.002));
  pushBlocks(segmenter, tone(0.7));
  pushBlocks(segmenter, silence(0.64));
  assert.equal(utterances.length, 0, 'A brief pause leaves the utterance open.');
  pushBlocks(segmenter, silence(0.16));
  assert.equal(utterances.length, 1);
  assert.ok(utterances[0] instanceof Float32Array);
  assert.ok(utterances[0].length >= 0.7 * 16000);
  assert.ok(utterances[0].some(sample => Math.abs(sample) > 0.04));
  pushBlocks(segmenter, silence(2));
  assert.equal(utterances.length, 1, 'Idle silence does not resubmit the preceding phrase.');
});

test('A short sound below the minimum speech duration is ignored', () => {
  const { segmenter, utterances } = createSegmenter();
  pushBlocks(segmenter, silence(0.5));
  pushBlocks(segmenter, tone(0.08));
  pushBlocks(segmenter, silence(1));
  assert.equal(utterances.length, 0);
});

test('Muted capture discards the pending phrase and does not submit speaker audio', () => {
  const { segmenter, utterances } = createSegmenter();
  pushBlocks(segmenter, tone(0.6));
  segmenter.setEnabled(false);
  pushBlocks(segmenter, tone(2));
  pushBlocks(segmenter, silence(1));
  assert.equal(utterances.length, 0);
  segmenter.setEnabled(true);
  pushBlocks(segmenter, silence(1));
  assert.equal(utterances.length, 0, 'Unmuting does not restore discarded speech.');
  pushBlocks(segmenter, tone(0.5));
  pushBlocks(segmenter, silence(0.8));
  assert.equal(utterances.length, 1, 'A fresh phrase is accepted after unmuting.');
  assert.ok(utterances[0].length < 2 * 16000, 'The new phrase excludes the earlier muted audio.');
});

test('Reset removes any speech from the preceding capture session', () => {
  const { segmenter, utterances } = createSegmenter();
  pushBlocks(segmenter, tone(0.4));
  segmenter.reset();
  pushBlocks(segmenter, silence(1));
  assert.equal(utterances.length, 0);
  pushBlocks(segmenter, tone(0.4));
  pushBlocks(segmenter, silence(0.8));
  assert.equal(utterances.length, 1);
});

test('Continuous speech is bounded to 18 seconds rather than growing indefinitely', () => {
  const { segmenter, utterances } = createSegmenter();
  pushBlocks(segmenter, tone(20));
  assert.ok(utterances.length >= 1, 'Long speech is submitted even without a pause.');
  assert.ok(utterances[0].length <= Math.round(18 * 16000) + 320);
  assert.ok(utterances[0].length >= Math.round(17 * 16000));
  segmenter.setEnabled(false);
  pushBlocks(segmenter, silence(1));
  assert.equal(utterances.length, 1, 'Muting drops the unfinished remainder.');
});

function captureHarness({ worklet = true, waitForModule = false } = {}) {
  const nodes = [], contexts = [], utterances = [], errors = [];
  let releaseModule;
  const moduleReady = waitForModule ? new Promise(resolve => { releaseModule = resolve; }) : Promise.resolve();
  const stream = { stopped: false, getTracks() { return [{ stop: () => { stream.stopped = true; } }]; } };
  function node(kind) {
    const result = { kind, connected: [], disconnected: 0, connect(other) { this.connected.push(other); }, disconnect() { this.disconnected++; } };
    nodes.push(result);
    return result;
  }
  class AudioContext {
    constructor() {
      this.sampleRate = 48000; this.state = 'suspended'; this.closeCalls = 0;
      this.destination = node('destination');
      if (worklet) this.audioWorklet = { addModule: () => moduleReady };
      contexts.push(this);
    }
    async resume() { this.state = 'running'; }
    createMediaStreamSource(suppliedStream) { assert.equal(suppliedStream, stream); return node('source'); }
    createGain() { return Object.assign(node('gain'), { gain: { value: 1 } }); }
    createScriptProcessor() { return node('processor'); }
    async close() { this.closeCalls++; this.state = 'closed'; }
  }
  function AudioWorkletNode() { return Object.assign(node('worklet'), { port: { onmessage: null } }); }
  const { LocalSpeechCapture } = loadSpeechModule({ AudioContext, AudioWorkletNode });
  const capture = new LocalSpeechCapture({ onSpeech: samples => utterances.push(samples), onLevel() {}, onError: error => errors.push(error) });
  function push(samples) {
    const processingNode = nodes.find(value => value.kind === (worklet ? 'worklet' : 'processor'));
    assert.ok(processingNode, 'Capture creates an audio processor.');
    for (let start = 0; start < samples.length; start += 960) {
      const block = samples.subarray(start, start + 960);
      if (worklet) processingNode.port.onmessage?.({ data: block });
      else processingNode.onaudioprocess?.({ inputBuffer: { getChannelData: () => block } });
    }
  }
  return { capture, stream, contexts, nodes, utterances, errors, push, releaseModule };
}

for (const worklet of [true, false]) {
  test(`${worklet ? 'AudioWorklet' : 'Web Audio fallback'} capture transcribes only enabled input and cleans up on stop`, async () => {
    const h = captureHarness({ worklet });
    h.capture.setEnabled(true);
    await h.capture.start(h.stream);
    h.push(tone(0.5, 48000));
    h.push(silence(0.8, 48000));
    assert.equal(h.utterances.length, 1);
    assert.ok(h.utterances[0] instanceof Float32Array);
    assert.ok(h.utterances[0].length > 0.5 * 16000 && h.utterances[0].length <= 1.4 * 16000, 'Captured device audio is resampled to 16 kHz.');
    assert.equal(h.nodes.find(value => value.kind === 'gain').gain.value, 0, 'The processing graph does not play microphone input through the speaker.');
    h.capture.setEnabled(false);
    h.push(tone(1, 48000));
    h.push(silence(0.8, 48000));
    assert.equal(h.utterances.length, 1);
    await h.capture.stop();
    h.capture.setEnabled(true);
    h.push(tone(1, 48000));
    h.push(silence(0.8, 48000));
    assert.equal(h.utterances.length, 1, 'Stopped callbacks cannot submit audio.');
    assert.equal(h.contexts[0].state, 'closed');
    for (const current of h.nodes.filter(value => value.kind !== 'destination')) assert.equal(current.disconnected, 1);
    assert.equal(h.stream.stopped, false, 'The manager retains ownership of the supplied microphone stream.');
    assert.equal(h.errors.length, 0);
  });
}

test('Stopping while the worklet loads prevents stale capture from connecting', async () => {
  const h = captureHarness({ waitForModule: true });
  const started = h.capture.start(h.stream);
  await Promise.resolve();
  await h.capture.stop();
  h.releaseModule();
  await started;
  assert.equal(h.nodes.some(value => value.kind === 'worklet'), false);
  assert.equal(h.nodes.some(value => value.connected.length > 0), false);
  assert.equal(h.contexts[0].state, 'closed');
  assert.equal(h.utterances.length, 0);
});
