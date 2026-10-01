const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup() {
  const workers = [];
  class Worker {
    constructor() { this.messages = []; workers.push(this); }
    postMessage(message) { this.messages.push(message); }
    terminate() { this.stopped = true; }
    answer(message) { this.onmessage({ data: message }); }
  }
  const context = { Worker, Float32Array, setTimeout, clearTimeout, console };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../browser-speech.js'), 'utf8'), context);
  return { recognizer: context.BrowserSpeechRecognizer, workers };
}
test('Browser voice downloads once and reuses the prepared worker between calls', async () => {
  const h = setup(); let progress;
  const first = h.recognizer.prepare(value => { progress = value; });
  const second = h.recognizer.prepare(value => { progress = value; });
  assert.equal(h.workers.length, 1);
  const worker = h.workers[0];
  assert.equal(worker.messages.length, 1);
  worker.answer({ type: 'progress', progress: 50 });
  assert.equal(progress, 50);
  worker.answer({ id: worker.messages[0].id, ready: true });
  await Promise.all([first, second]);
  await h.recognizer.prepare(() => {});
  assert.equal(worker.messages.length, 1);
});
test('Cancelling a transcript ignores a late worker answer and does not cancel the following call', async () => {
  const h = setup(), controller = new AbortController();
  const old = h.recognizer.transcribe(new Float32Array([.5]), controller.signal);
  const oldRejected = assert.rejects(old, /cancelada/);
  const worker = h.workers[0]; controller.abort(); await oldRejected;
  const next = h.recognizer.transcribe(new Float32Array([.2]));
  worker.answer({ id: worker.messages[0].id, text: 'fala antiga' });
  worker.answer({ id: worker.messages[1].id, text: 'fala atual' });
  assert.equal(await next, 'fala atual');
});
test('Worker failure rejects pending work and a new preparation recovers', async () => {
  const h = setup();
  const first = h.recognizer.prepare(() => {});
  const rejected = assert.rejects(first, /parou/);
  h.workers[0].onerror(); await rejected;
  assert.equal(h.workers[0].stopped, true);
  const next = h.recognizer.prepare(() => {});
  assert.equal(h.workers.length, 2);
  const worker = h.workers[1]; worker.answer({ id: worker.messages[0].id, ready: true });
  await next;
});
