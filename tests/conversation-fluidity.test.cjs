const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const sandbox = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'conversation.js'), 'utf8'), sandbox);

function conversation(channel, context = {}) {
  const history = [];
  return {
    history,
    say(message) {
      const answer = sandbox.getLocalConversationReply(message, channel, history, context);
      assert.equal(typeof answer, 'string');
      assert.ok(answer.trim(), 'Every ordinary utterance receives a usable reply.');
      assert.doesNotMatch(answer, /<[^>]+>/);
      assert.doesNotMatch(answer, /enviei.*viatura|ambul[aâ]ncia.*enviada|den[uú]ncia.*registrada|protocolo n[uú]mero/i);
      history.push({ role: 'user', text: message }, { role: 'model', text: answer });
      return answer;
    }
  };
}

const consciousnessQuestion = /(?:a pessoa|ela|sua m[aã]e).{0,35}(?:consciente|acordada)\?/i;
const breathingQuestion = /(?:respira(?:ndo)?|respira[cç][aã]o).{0,25}(?:normal|bem).{0,8}\?/i;
const spentGeneric = /J[aá] organizamos algumas possibilidades|Podemos continuar a partir do que voc[eê] contou|Estou acompanhando o que voc[eê] contou\. Voc[eê] pode continuar no seu ritmo/i;

test('SAMU follows six natural turns without confusing acknowledgements with pending questions', () => {
  const c = conversation('192');
  c.say('Minha mãe caiu e está com dor');
  const awake = c.say('Ela está acordada e falando comigo');
  assert.doesNotMatch(awake, consciousnessQuestion);
  const breathing = c.say('Respira bem');
  assert.doesNotMatch(breathing, /n[aã]o consegui entender se.*consciente/i);
  assert.doesNotMatch(breathing, consciousnessQuestion);
  assert.doesNotMatch(breathing, breathingQuestion);
  assert.match(breathing, /quando|tempo|come[cç]ou|aconteceu/i);
  const duration = c.say('Faz uns vinte minutos');
  assert.doesNotMatch(duration, consciousnessQuestion);
  assert.doesNotMatch(duration, breathingQuestion);
  const symptom = c.say('A perna esquerda dela está doendo');
  assert.match(symptom, /perna|dor|doendo/i);
  const summary = c.say('O que digo ao atendente quando ligar?');
  const rememberedFacts = [/queda|caiu|cair/i, /consciente|acordada|falando/i, /respira/i, /vinte|20|minutos/i, /perna/i];
  assert.ok(rememberedFacts.filter(pattern => pattern.test(summary)).length >= 3,
    'The direct request receives information already reported, rather than another unrelated question.');
  assert.doesNotMatch(summary, spentGeneric);
});

test('Police accepts a descriptive departure and keeps the reported address for a direct question', () => {
  const c = conversation('190');
  c.say('Um cara está me seguindo');
  const departure = c.say('Ele já foi embora');
  assert.match(departure, /foi embora|saiu|afast|n[aã]o est[aá].*(?:perto|mais)/i);
  assert.doesNotMatch(departure, /voc[eê] n[aã]o souber onde a pessoa est[aá]/i);
  c.say('Entrei em uma loja');
  c.say('Estou na Rua das Flores, em frente ao mercado');
  const call = c.say('O que eu preciso falar quando ligar?');
  assert.match(call, /segu|foi embora|saiu|Rua das Flores|mercado|loja/i);
  assert.doesNotMatch(call, spentGeneric);
  const knownAddress = c.say('Já passei o endereço. O que mais preciso informar?');
  assert.doesNotMatch(knownAddress, /voc[eê] j[aá] sabe o endere[cç]o|qual [eé].*endere[cç]o/i);
  assert.match(knownAddress, /aconteceu|situa[cç][aã]o|pessoa|hor[aá]rio|risco|segu/i);
});

test('Soli connects college, work and sleep to a practical request beyond three follow-ups', () => {
  const c = conversation('soli');
  const first = c.say('Estou sobrecarregada com a faculdade');
  assert.match(first, /sobrecarg|sobrecarreg|faculdade|estud|cobran|cans|rotina/i);
  c.say('As provas e o trabalho estão me deixando sem tempo');
  const sleep = c.say('Tenho dormido muito pouco');
  assert.match(sleep, /dorm|sono|descans|cans/i);
  const practical = c.say('O que posso fazer hoje para lidar com tudo isso?');
  assert.match(practical, /pausa|prioridad|tarefa|um passo|pequeno|descans|organizar|dividir/i);
  assert.doesNotMatch(practical, spentGeneric);
  const preference = c.say('Quero só conversar, sem exercício');
  assert.doesNotMatch(preference, /inspire|quatro coisas|cinco coisas|come[cç]ar um exerc[ií]cio/i);
  const fear = c.say('Acho que tenho medo de decepcionar as pessoas');
  assert.match(fear, /decepcion|expectativ|cobran|medo|press[aã]o/i);
  assert.doesNotMatch(fear, spentGeneric);
});

test('A direct question takes priority over the previous emotional follow-up', () => {
  const c = conversation('soli');
  c.say('Tenho medo de apresentar meu trabalho na sala');
  c.say('Na última vez eu travei e fiquei com vergonha');
  const advice = c.say('Como posso me preparar para a apresentação de amanhã?');
  assert.match(advice, /apresenta|ensaia|ensaiar|trein|roteiro|pratic|prepara/i);
  assert.doesNotMatch(advice, spentGeneric);
});

test('Changing the subject and declining an exercise do not trigger the old exercise', () => {
  const c = conversation('soli');
  c.say('Quero tentar respirar com calma');
  const change = c.say('Na verdade, prefiro conversar sobre as provas. Não quero exercício agora');
  assert.match(change, /prova|faculdade|estud|convers|exerc[ií]cio de lado|sem exerc[ií]cio/i);
  assert.doesNotMatch(change, /inspire|solte o ar|quatro coisas|cinco coisas/i);
  const next = c.say('É muita matéria e acho que não vou dar conta');
  assert.match(next, /mat[eé]ria|prova|estud|dar conta|cobran|tarefa|sobrecarg/i);
  assert.doesNotMatch(next, spentGeneric);
});

test('Central 180 answers the request for information without forcing the previous city question', () => {
  const c = conversation('180');
  c.say('Queria entender uma medida protetiva');
  c.say('Não quero procurar agora, só entender');
  c.say('Meu medo é ele descobrir que procurei ajuda');
  const choice = c.say('Posso pedir informação sem decidir denunciar agora?');
  assert.match(choice, /orienta|informa/i);
  assert.match(choice, /sem.*(?:decidir|denunci)|n[aã]o.*(?:precisa|obriga|decidir)|seu (?:tempo|receio)|respeit.*decis/i);
  assert.doesNotMatch(choice, /qual [eé] a sua cidade e estado\?/i);
  const uncertainty = c.say('Ainda não tenho certeza do que fazer');
  assert.doesNotMatch(uncertainty, /voc[eê] informou.*(?:decidiu|denunciar|segura)/i);
  const direct = c.say('O que eu posso perguntar ao 180?');
  assert.match(direct, /medida|protetiva|direitos|rede|acolhimento|servi[cç]os/i);
  assert.doesNotMatch(direct, spentGeneric);
});

test('Disque 100 recognizes older-person mistreatment and answers informal anonymity wording', () => {
  const c = conversation('100');
  const elder = c.say('Quero relatar algo que aconteceu com um idoso');
  assert.match(elder, /idos|direitos|viola[cç][aã]o|prote[cç][aã]o/i);
  c.say('Ele sofre maus tratos');
  c.say('Não tem perigo agora');
  c.say('Foi na casa dele, não sei o endereço completo');
  const anonymous = c.say('Posso fazer isso sem dar meu nome?');
  assert.match(anonymous, /an[oô]nim|sem.*(?:identif|nome|dados pessoais)|n[aã]o.*(?:identif|nome)/i);
  assert.doesNotMatch(anonymous, spentGeneric);
  const missingAddress = c.say('E se eu não souber o endereço certinho?');
  assert.match(missingAddress, /endere[cç]o|refer[eê]ncia|local|informa[cç][aã]o/i);
  assert.doesNotMatch(missingAddress, /endere[cç]o (?:que|j[aá]).*informou|qual [eé] o endere[cç]o completo\?/i);
});

test('Professional conversation responds to a cost barrier with accessible-support guidance', () => {
  const c = conversation('professional');
  c.say('Estou me sentindo sobrecarregada');
  c.say('A faculdade e o trabalho estão tomando todo o meu tempo');
  c.say('Tenho dormido pouco');
  c.say('Eu não sei por onde começar');
  c.say('Não tenho dinheiro para terapia');
  const affordable = c.say('Como posso procurar apoio que caiba no meu orçamento?');
  assert.match(affordable, /p[uú]blic|gratuit|SUS|unidade.*sa[uú]de|UBS|cl[ií]nica.escola|servi[cç]o.*sa[uú]de/i);
  assert.doesNotMatch(affordable, spentGeneric);
  assert.doesNotMatch(affordable, /gratuit.*garant|vaga.*garant|atendimento.*garant/i);
});

test('Descriptive uncertainty never turns into a confirmed safety or health fact', () => {
  const police = conversation('190');
  police.say('Uma pessoa está me seguindo');
  const unclear = police.say('Eu não consigo ver se ela ainda está por perto');
  assert.doesNotMatch(unclear, /voc[eê] informou que.*(?:n[aã]o est[aá] mais perto|foi embora|saiu)/i);
  const medical = conversation('192');
  medical.say('Minha mãe caiu e está com dor');
  const unknown = medical.say('Não dá para saber, estou longe dela');
  assert.doesNotMatch(unknown, /(?:voc[eê] informou|conte.*que).*(?:est[aá] consciente|n[aã]o est[aá] consciente)/i);
});

test('Text, voice and video share natural local-dialogue behavior', () => {
  const messages = ['Minha mãe caiu e está com dor', 'Ela está acordada', 'Está respirando bem', 'Faz vinte minutos'];
  const replies = [];
  for (const context of [{}, { isCall: true }, { isCall: true, mode: 'video' }]) {
    const c = conversation('192', context);
    replies.push(messages.map(message => c.say(message)));
  }
  for (const sequence of replies) {
    assert.doesNotMatch(sequence[2], consciousnessQuestion);
    assert.doesNotMatch(sequence[2], breathingQuestion);
    assert.doesNotMatch(sequence[2], /n[aã]o consegui entender se.*consciente/i);
    assert.match(sequence[2], /quando|tempo|come[cç]ou|aconteceu/i);
    assert.notEqual(sequence[3], sequence[2], 'A new factual answer advances the conversation.');
  }
});

test('Questions and uncertainty never become confirmed health observations', () => {
  for (const message of ['Não sei se ela está consciente', 'Não sei se está respirando bem', 'Como eu sei se ela está consciente?']) {
    const c = conversation('192');
    c.say('Minha mãe caiu e está com dor');
    c.say(message);
    const facts = sandbox.conversationFacts(c.history, 'Ainda estou tentando entender');
    assert.notEqual(facts.conscious, true);
    assert.notEqual(facts.breathing, true);
  }
  const c = conversation('192');
  c.say('Minha mãe caiu e está com dor');
  c.say('Quero entender a PEP');
  assert.notEqual(sandbox.conversationFacts(c.history, 'Entendi').conscious, true);
});

test('A negative health observation stays negative in later turns', () => {
  const c = conversation('192');
  c.say('Minha mãe caiu e está com dor');
  const negative = c.say('Ela não está acordada');
  assert.match(negative, /não está consciente|192/i);
  assert.equal(sandbox.conversationFacts(c.history, 'Ela respira bem').conscious, false);
});

test('Declining a difficult subject and choosing studies does not reopen the previous subject', () => {
  const c = conversation('soli');
  c.say('Sofri violência, mas não quero falar disso');
  const study = c.say('Quero falar da faculdade');
  assert.match(study, /estud|faculdade/);
  assert.doesNotMatch(study, /culpa|violência|lugar seguro|190/);
});

test('Listening preferences survive later questions and an uncertain choice does not start breathing', () => {
  const c = conversation('soli');
  c.say('Quero conversar, sem exercício');
  assert.equal(sandbox.conversationFacts(c.history, 'O que eu faço?').listening, true);
  const exercise = conversation('soli');
  exercise.say('Quero fazer um exercício de respiração');
  assert.doesNotMatch(exercise.say('Não sei se quero fazer isso'), /inspire|solte o ar|prender/);
});
