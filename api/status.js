const projectApiKey = require('../lib/project-api');
module.exports = function (_req, res) {
  const configured = !!projectApiKey();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ configured, mode: configured ? 'api' : 'local' });
};
