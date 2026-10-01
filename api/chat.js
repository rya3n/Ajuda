const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
const projectApiKey = require('../lib/project-api');
function failure(status, code, message) { return Object.assign(new Error(message), { status, code }); }
function invalid() { return failure(400, 'invalid_request', 'Confira os dados da conversa e tente novamente.'); }
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw invalid();
  let total = 0;
  function parts(value, count, limit) {
    if (!Array.isArray(value) || !value.length || value.length > count) throw invalid();
    return value.map(part => {
      if (!part || typeof part.text !== 'string') throw invalid();
      const text = part.text.trim(); total += text.length;
      if (!text || text.length > limit || total > 80000) throw invalid();
      return { text };
    });
  }
  if (!Array.isArray(body.contents) || !body.contents.length || body.contents.length > 80) throw invalid();
  const contents = body.contents.map(turn => {
    if (!turn || !['user', 'model'].includes(turn.role)) throw invalid();
    return { role: turn.role, parts: parts(turn.parts, 10, 12000) };
  });
  if (!body.systemInstruction) throw invalid();
  const systemInstruction = { parts: parts(body.systemInstruction.parts, 4, 20000) };
  const generation = body.generationConfig || {};
  if (typeof generation !== 'object' || Array.isArray(generation)) throw invalid();
  const temperature = generation.temperature ?? .65, maxOutputTokens = generation.maxOutputTokens ?? 1000;
  if (typeof temperature !== 'number' || !Number.isFinite(temperature) || temperature < 0 || temperature > 2
      || !Number.isInteger(maxOutputTokens) || maxOutputTokens < 64 || maxOutputTokens > 4096) throw invalid();
  return { contents, systemInstruction, generationConfig: { temperature, maxOutputTokens } };
}
async function generate(payload, key, fetcher = fetch) {
  if (!key) throw failure(503, 'not_configured', 'A integração original está indisponível. As respostas locais continuam disponíveis.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    for (const model of MODELS) {
      const response = await fetcher(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(payload), signal: controller.signal
      });
      if (response.status === 404 && model === MODELS[0]) { await response.body?.cancel(); continue; }
      if (!response.ok) {
        await response.body?.cancel();
        if ([401, 403].includes(response.status)) throw failure(401, 'credentials', 'A API original recusou a autenticação. As respostas locais continuam disponíveis.');
        if (response.status === 429) throw failure(429, 'quota', 'O limite da API foi atingido. Tente novamente mais tarde.');
        throw failure(503, 'unavailable', 'A API está indisponível no momento.');
      }
      const reader = response.body.getReader();
      let bytes = 0; const chunks = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 1024 * 1024) { await reader.cancel(); throw new Error('Resposta longa.'); }
        chunks.push(Buffer.from(value));
      }
      const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const text = (result.candidates?.[0]?.content?.parts || [])
        .filter(part => typeof part.text === 'string' && !part.thought).map(part => part.text).join('').trim();
      if (!text) throw new Error('Resposta vazia.');
      return { text, model };
    }
    throw new Error('Modelo indisponível.');
  } catch (error) {
    if (error.code && error.status) throw error;
    throw failure(503, 'unavailable', 'Não foi possível acessar a API agora.');
  } finally { clearTimeout(timeout); }
}
async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method !== 'POST') throw failure(405, 'invalid_request', 'Use POST para conversar.');
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) throw failure(403, 'invalid_request', 'Use a própria página para conversar.');
    if (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])) throw failure(403, 'invalid_request', 'Use a própria página para conversar.');
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) throw failure(415, 'invalid_request', 'Envie JSON.');
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw) > 128 * 1024) throw failure(413, 'invalid_request', 'A conversa é longa demais.');
    let body;
    try { body = JSON.parse(raw); } catch (_) { throw invalid(); }
    const payload = validate(body);
    const key = projectApiKey();
    res.status(200).json(await generate(payload, key));
  } catch (error) {
    res.status(error.status || 400).json({ error: error.code || 'invalid_request', message: error.status ? error.message : 'Confira os dados enviados.' });
  }
}
module.exports = handler;
module.exports.validate = validate;
module.exports.generate = generate;
