const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const sandbox = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'conversation.js'), 'utf8'), sandbox);
const presets = vm.runInContext('CHANNEL_PRESETS', sandbox);
const guidance = vm.runInContext('CHANNEL_GUIDANCE', sandbox);
const reply = sandbox.getLocalConversationReply;

const expectedTopics = {
  soli: [/respira/i, /grounding|cinco coisas/i, /culpa|viol[eê]ncia/i, /PEP|72 horas/],
  '190': [/190|perigo/i, /seguido|perto/i, /abrigo|lugar/i, /endere[cç]o|localiza/i],
  '192': [/ferimento|dor/i, /PEP|72 horas/, /sangramento|les[aã]o/i, /subst[aâ]ncia|bebida/i],
  '180': [/medida.*protetiva/i, /DEAM|Delegacia/i, /den[uú]ncia/i, /abrigo|acolhimento/i],
  '100': [/an[oô]nima|identificar/i, /crian[cç]a|adolescente/i, /[oó]rg[aã]os|Defensoria/i, /recebe.*encaminha/i],
  professional: [/ansiedade/i, /acompanhamento/i]
};

for (const channel of Object.keys(presets)) {
  test(`${channel}: presets answer their subjects without generic duplicates`, () => {
    const results = presets[channel].map((preset, index) => {
      assert.equal(sandbox.getPresetForChannel(channel, preset.id), preset);
      assert.ok(preset.message && preset.intent);
      const answer = reply(preset.message, channel, [], { intent: preset.intent });
      assert.match(answer, expectedTopics[channel][index]);
      assert.doesNotMatch(answer, /<[^>]+>/);
      assert.doesNotMatch(answer, /enviei.*viatura|ambul[aâ]ncia.*enviada|den[uú]ncia.*registrada|protocolo n[uú]mero/i);
      return answer;
    });
    assert.equal(new Set(results).size, presets[channel].length);
  });
}

test('Each channel has its own guidance and presets also work as ordinary messages', () => {
  assert.equal(new Set(Object.values(guidance)).size, Object.keys(guidance).length);
  for (const [channel, options] of Object.entries(presets)) {
    options.forEach((preset, index) => assert.match(reply(preset.message, channel, []), expectedTopics[channel][index]));
  }
});

function nextTurn(channel, presetId, answer, history = []) {
  const preset = sandbox.getPresetForChannel(channel, presetId);
  const first = reply(preset.message, channel, history, { intent: preset.intent });
  const conversation = [...history, { role: 'user', text: preset.message }, { role: 'model', text: first }, { role: 'user', text: answer }];
  return { first, second: reply(answer, channel, conversation), history: conversation };
}

test('Police interprets a short no as an answer to the current risk question', () => {
  const { first, second } = nextTurn('190', 'followed', 'Não');
  assert.notEqual(second, first);
  assert.match(second, /n[aã]o est[aá] mais perto/i);
  assert.doesNotMatch(second, /ainda est[aá] perto de voc[eê]\?/i);
});

test('SAMU follows consciousness with breathing and keeps uncertainty honest', () => {
  const conscious = nextTurn('192', 'injured', 'Sim');
  assert.match(conscious.second, /respirando normalmente/i);
  const history = [...conscious.history, { role: 'model', text: conscious.second }, { role: 'user', text: 'Não sei' }];
  const unknown = reply('Não sei', '192', history);
  assert.match(unknown, /n[aã]o consegue confirmar|192/i);
  assert.doesNotMatch(unknown, /pessoa est[aá] consciente\?/i);
});

test('Soli respects declining breathing instead of restarting the exercise', () => {
  const { first, second } = nextTurn('soli', 'breathing', 'Não');
  assert.notEqual(second, first);
  assert.match(second, /deixar o exerc[ií]cio de lado/i);
  assert.doesNotMatch(second, /inspire|quer come[cç]ar/i);
});

test('Grounding advances using an ordinary descriptive answer', () => {
  const { first, second } = nextTurn('soli', 'grounding', 'Uma parede, uma planta e meu celular');
  assert.notEqual(second, first);
  assert.match(second, /quatro coisas|tocar|toque/i);
});

test('PEP remembers that the user has already answered the exposure time', () => {
  const { first, second } = nextTurn('192', 'pep', 'Ontem à noite');
  assert.notEqual(second, first);
  assert.match(second, /equipe de sa[uú]de|servi[cç]o de sa[uú]de agora/i);
  assert.doesNotMatch(second, /h[aá] quanto tempo ocorreu/i);
});

test('PEP does not restart after the immediate follow-up questions', () => {
  const start = nextTurn('192', 'pep', 'Ontem à noite');
  const history = [...start.history, { role: 'model', text: start.second }, { role: 'user', text: 'Sim' }];
  const third = reply('Sim', '192', history);
  history.push({ role: 'model', text: third }, { role: 'user', text: 'Não sei' });
  const fourth = reply('Não sei', '192', history);
  assert.notEqual(fourth, start.first);
  assert.doesNotMatch(fourth, /h[aá] quanto tempo ocorreu/i);
});

test('Central 180 receives the city without inventing an address or asking it again', () => {
  const { second } = nextTurn('180', 'deam', 'Curitiba, Paraná');
  assert.match(second, /180 real|n[aã]o consigo verificar endere[cç]os/i);
  assert.doesNotMatch(second, /qual [eé] a sua cidade|rua |avenida /i);
});

test('Saying yes does not falsely count as providing a city or medical observation', () => {
  const city = nextTurn('180', 'deam', 'Sim');
  assert.match(city.second, /ainda n[aã]o tenho esses dados/i);
  const health = nextTurn('192', 'injured', 'Não sei');
  assert.match(health.second, /n[aã]o consegue confirmar/i);
  assert.doesNotMatch(health.second, /conte.*que a pessoa est[aá] consciente/i);
});

test('Changing the subject does not answer a previous question by mistake', () => {
  const preset = sandbox.getPresetForChannel('180', 'deam');
  const history = [{ role: 'user', text: preset.message }, { role: 'model', text: reply(preset.message, '180', []) }];
  const answer = reply('Na verdade, tenho medo de fazer a denúncia', '180', history);
  assert.match(answer, /den[uú]ncia|receio/i);
  assert.doesNotMatch(answer, /cidade e o estado que voc[eê] informou/i);
});

test('Disque 100 follows the child-risk answer with the facts to report', () => {
  const { first, second } = nextTurn('100', 'child', 'Não');
  assert.notEqual(second, first);
  assert.match(second, /o que aconteceu|organizar o relato/i);
  assert.doesNotMatch(second, /est[aá] em risco agora\?/i);
});

test('State is provided by history and never leaks between channels or invocations', () => {
  const police = nextTurn('190', 'followed', 'Não');
  const freshSoli = reply('Não', 'soli', []);
  const freshSamu = reply('Não', '192', []);
  assert.doesNotMatch(freshSoli, /seguido|viatura|essa pessoa/i);
  assert.doesNotMatch(freshSamu, /seguido|viatura|essa pessoa/i);
  assert.equal(reply('Não', '190', police.history), police.second);
});

test('Replies preserve caller-owned history and accept an already-appended current message', () => {
  const preset = sandbox.getPresetForChannel('soli', 'violence');
  const first = reply(preset.message, 'soli', []);
  const history = [{ role: 'user', text: preset.message }, { role: 'model', text: first }, { role: 'user', text: 'Sim' }];
  const snapshot = JSON.stringify(history);
  const withCurrent = reply('Sim', 'soli', history);
  const withoutCurrent = reply('Sim', 'soli', history.slice(0, -1));
  assert.equal(withCurrent, withoutCurrent);
  assert.equal(JSON.stringify(history), snapshot);
  assert.match(withCurrent, /algu[eé]m de confian[cç]a/i);
});

test('Short uncertain messages continue context without requiring preset keywords', () => {
  const preset = sandbox.getPresetForChannel('180', 'protection');
  const first = reply(preset.message, '180', []);
  const history = [{ role: 'user', text: preset.message }, { role: 'model', text: first }];
  const second = reply('Talvez', '180', history);
  assert.notEqual(second, first);
  assert.match(second, /cidade e estado/i);
});

test('Unknown channels and malformed histories use a safe plain-text default', () => {
  assert.equal(sandbox.getPresetForChannel('missing', 'missing'), null);
  assert.equal(sandbox.getPresetForChannel('toString', 'missing'), null);
  assert.equal(sandbox.getPresetForChannel('soli', 'missing'), null);
  assert.equal(typeof reply('Oi', 'missing', null), 'string');
  assert.equal(typeof reply('Oi', 'toString', null), 'string');
  assert.equal(typeof reply('Preciso conversar', 'soli', [null, {}]), 'string');
});
