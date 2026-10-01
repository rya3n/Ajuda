// A chave original é migrada para um arquivo privado durante o build.
module.exports = function projectApiKey() {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  try { return require('./generated-api-key.cjs'); } catch (_) { return ''; }
};
