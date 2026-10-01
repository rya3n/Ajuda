module.exports = function (_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ available: false, state: 'browser', engine: 'browser-whisper', language: 'pt-BR', sampleRate: 16000 });
};
