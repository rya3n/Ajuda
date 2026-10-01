const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const output = path.join(__dirname, 'public');
// Este caminho fixo contém somente arquivos gerados pelo próprio build.
if (path.dirname(path.resolve(output)) !== path.resolve(__dirname)) throw new Error('Saída inválida.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
const files = ['index.html', 'style.css', 'portal.css', 'script.js', 'conversation.js', 'portal.js', 'local-speech.js', 'audio-capture-worklet.js', 'browser-speech.js', 'browser-speech-worker.js'];
for (const file of files) fs.copyFileSync(path.join(__dirname, file), path.join(output, file));
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'assets', 'soli.png'), path.join(output, 'assets', 'soli.png'));
async function preserveOriginalAPI() {
  let key = '';
  try { key = JSON.parse(fs.readFileSync(path.join(__dirname, '.api-key.json'), 'utf8')).apiKey || ''; } catch (_) {}
  if (!key) {
    // A revisão anterior é imutável e pertence a este mesmo projeto. A migração
    // reaproveita sua integração embutida, sem campo de chave ou outra API.
    let original;
    const revision = '4af0c98374f462041c0947a7691f56869686f98a';
    try { original = execFileSync('git', ['show', `${revision}:script.js`], { cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
    catch (_) {
      const response = await fetch(`https://raw.githubusercontent.com/rya3n/Ajuda/${revision}/script.js`, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Não foi possível carregar a integração original do projeto.');
      original = await response.text();
    }
    key = original.match(/\bapiKey\s*:\s*(['"])([^'"\r\n]+)\1/)?.[2] || '';
  }
  if (!/^[\x21-\x7e]{10,256}$/.test(key)) throw new Error('A integração original não foi encontrada.');
  fs.mkdirSync(path.join(__dirname, 'lib'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'lib', 'generated-api-key.cjs'), 'module.exports = ' + JSON.stringify(key) + ';\n');
  console.log('Demonstração preparada. Integração original preservada no servidor.');
}
preserveOriginalAPI().catch(() => { console.error('Falha ao preparar a integração original. Nenhum dado de chave foi registrado.'); process.exitCode = 1; });
