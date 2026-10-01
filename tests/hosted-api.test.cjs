const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/chat');
const body = () => ({ contents: [
  { role: 'user', parts: [{ text: 'Estou com medo' }] },
  { role: 'model', parts: [{ text: 'O que aconteceu?' }] },
  { role: 'user', parts: [{ text: 'Preciso conversar' }] }
], systemInstruction: { parts: [{ text: 'Responda como Soli.' }] }, generationConfig: { temperature: .65, maxOutputTokens: 1000 } });
test('Hosted API keeps clean history and rejects invalid or oversized payloads', () => {
  assert.deepEqual(handler.validate(body()), body());
  for (const changes of [{ contents: [] }, { contents: [{ role: 'system', parts: [{ text: 'x' }] }] },
    { generationConfig: true }, { generationConfig: { temperature: NaN } },
    { generationConfig: { maxOutputTokens: 99999 } },
    { contents: [{ role: 'user', parts: [{ text: 'x'.repeat(12001) }] }] }]) {
    assert.throws(() => handler.validate({ ...body(), ...changes }), error => error.code === 'invalid_request');
  }
});
test('Hosted proxy uses only the original Google endpoint and omits thought parts', async () => {
  const reply = await handler.generate(body(), 'fake-test-key', async (url, options) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers['x-goog-api-key'], 'fake-test-key');
    assert.deepEqual(JSON.parse(options.body), body());
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'private reasoning', thought: true }, { text: 'Estou aqui.' }, { text: ' Pode me contar.' }] } }] }));
  });
  assert.equal(reply.text, 'Estou aqui. Pode me contar.');
});
test('Model fallback happens only for a missing model, and provider failures are sanitized', async () => {
  let count = 0;
  await handler.generate(body(), 'fake-test-key', async () => {
    if (++count === 1) return new Response('', { status: 404 });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Resposta.' }] } }] }));
  });
  assert.equal(count, 2);
  for (const [status, code] of [[401, 'credentials'], [403, 'credentials'], [429, 'quota'], [500, 'unavailable']]) {
    count = 0;
    await assert.rejects(handler.generate(body(), 'fake-test-key', async () => {
      count++; return new Response('private provider details fake-test-key', { status });
    }), error => error.code === code && !error.message.includes('fake-test-key'));
    assert.equal(count, 1);
  }
});
test('Hosted proxy bounds provider output and handles missing credentials', async () => {
  await assert.rejects(handler.generate(body(), ''), error => error.code === 'not_configured');
  await assert.rejects(handler.generate(body(), 'fake-test-key', async () => new Response('x'.repeat(1024 * 1024 + 1))), error => error.code === 'unavailable');
});
test('Hosted handler rejects wrong methods, cross-site requests and malformed bodies before calling Google', async () => {
  for (const [request, status] of [
    [{ method: 'GET', headers: {} }, 405],
    [{ method: 'POST', headers: { host: 'demo.example', origin: 'https://other.example' } }, 403],
    [{ method: 'POST', headers: { host: 'demo.example', 'sec-fetch-site': 'cross-site' } }, 403],
    [{ method: 'POST', headers: { 'content-type': 'text/plain' } }, 415],
    [{ method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' }, 400]
  ]) {
    const response = { setHeader() {}, status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; } };
    await handler(request, response);
    assert.equal(response.statusCode, status);
  }
});
