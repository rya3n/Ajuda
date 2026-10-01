/* Shared conversation instructions and presets for the academic demonstration.
 * General service information:
 * https://www.gov.br/mulheres/pt-br/ligue180
 * https://www.gov.br/pt-br/servicos/denunciar-violacao-de-direitos-humanos
 * https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/aids-hiv/pep
 * https://www.gov.br/mdh/pt-br/assuntos/noticias/2026/defeso-eleitoral/agosto/disque-100-a-denuncia-pode-ser-anonima-tire-suas-principais-duvidas
 */
const CHANNEL_GUIDANCE = {
  soli: 'Seu papel é acolher e conversar sobre sentimentos. Seja calorosa, sem frases prontas em sequência. Responda ao que a pessoa realmente contou e acompanhe o assunto ao longo dos turnos. Ofereça respiração ou grounding quando solicitado ou pertinente, sem insistir. Se a pessoa disser sim ou não, interprete como resposta à sua última pergunta. Em violência, acolha sem culpa e ajude a pensar em apoio humano; em PEP, indique avaliação de saúde, sem prescrição.',
  '190': 'Seu papel é uma demonstração de orientação para emergência policial. Use tom calmo, objetivo e breve. Diferencie ameaça atual, perseguição e dúvidas sobre segurança. Pergunte uma informação por vez, começando pelo risco atual; aproveite local e fatos já informados. Não faça terapia, investigação, julgamento jurídico ou perguntas sobre medicamentos. Oriente a ligação real 190 em perigo imediato. Nunca diga que enviou viatura, registrou ocorrência ou acompanha a pessoa em tempo real.',
  '192': 'Seu papel é uma demonstração de orientação sobre urgência médica. Use tom claro e cuidadoso. Considere os sintomas e o tempo já relatados; em situação urgente, indique o atendimento real 192 sem prolongar a conversa. Pergunte uma informação relevante de cada vez. Não diagnostique, prescreva, indique dose ou forneça procedimento médico detalhado. PEP requer avaliação em serviço de saúde o quanto antes; não prometa ambulância, atendimento ou disponibilidade de unidade. Não transforme todo sintoma em ansiedade nem ofereça respiração automaticamente.',
  '180': 'Seu papel é uma demonstração de acolhimento e orientação sobre violência contra a mulher. Diferencie medidas protetivas, denúncia, DEAM e rede de acolhimento. Respeite receio e escolhas; não pressione por denúncia nem peça relato detalhado de violência. O 180 real orienta sobre direitos e serviços da rede. Em emergência policial, indique 190. Não invente endereço, abrigo, vaga, prazo judicial ou resultado; peça cidade somente quando necessária para a dúvida. Não afirme ter registrado ou encaminhado denúncia.',
  '100': 'Seu papel é uma demonstração de orientação sobre violações de direitos humanos. Diferencie dúvidas sobre denúncia anônima, criança ou adolescente, pessoa idosa e encaminhamentos. Ajude a organizar o que ocorreu, quem está em risco e onde, sem pedir detalhes pessoais desnecessários. O Disque 100 real recebe e encaminha denúncias; este chat não as registra. Respeite anonimato. Nunca invente protocolo, encaminhamento ou providência. Em perigo imediato, indique 190; urgência médica, 192. Não use o tom de terapia nem repita acolhimento genérico a cada mensagem.',
  professional: 'Seu papel é um exemplo de acolhimento profissional para apresentação acadêmica, sem se identificar como profissional real. Escute a situação, acompanhe o que foi dito e ajude a pensar em apoio e acompanhamento. Não substitua atendimento de saúde, faça diagnósticos ou prescreva. Exercícios são opcionais e não devem aparecer em toda resposta.'
};

const CHANNEL_PRESETS = {
  soli: [
    { id: 'breathing', text: '🌿 Exercício de respiração', message: 'Quero fazer um exercício de respiração para me acalmar.', intent: 'breathing' },
    { id: 'grounding', text: '🍃 Voltar ao presente', message: 'Quero tentar o exercício de grounding para voltar ao presente.', intent: 'grounding' },
    { id: 'violence', text: '🛡️ Sofri violência e preciso de apoio', message: 'Sofri violência e preciso de ajuda para pensar no que fazer agora.', intent: 'violence', isSos: true },
    { id: 'pep', text: '⏱️ Orientações sobre PEP', message: 'Preciso entender a PEP e onde buscar atendimento após uma exposição de risco.', intent: 'pep' }
  ],
  '190': [
    { id: 'danger', text: '🚨 Estou em perigo agora', message: 'Estou em perigo agora e preciso de orientação para buscar ajuda.', intent: 'danger', isSos: true },
    { id: 'followed', text: '👀 Alguém está me seguindo', message: 'Uma pessoa está me seguindo e estou com medo.', intent: 'followed', isSos: true },
    { id: 'shelter', text: '🚪 Buscar um lugar seguro', message: 'Preciso pensar em um lugar mais seguro para me abrigar.', intent: 'shelter' },
    { id: 'location', text: '📍 Mostrar minha localização', message: 'Quero mostrar minha localização nesta conversa de demonstração.', intent: 'location', isLoc: true }
  ],
  '192': [
    { id: 'injured', text: '🚑 Estou ferida ou com dor', message: 'Estou com um ferimento ou dor e preciso de orientação sobre atendimento.', intent: 'injured', isSos: true },
    { id: 'pep', text: '⏱️ Atendimento para PEP', message: 'Preciso de informações sobre avaliação para PEP após uma exposição de risco.', intent: 'pep' },
    { id: 'bleeding', text: '🩸 Sangramento ou lesão', message: 'Há uma pessoa com sangramento ou uma lesão e preciso buscar ajuda.', intent: 'bleeding', isSos: true },
    { id: 'drugged', text: '🧪 Suspeita de bebida adulterada', message: 'Suspeito que colocaram uma substância na minha bebida e preciso de orientação.', intent: 'drugged' }
  ],
  '180': [
    { id: 'protection', text: '🛡️ Medida protetiva', message: 'Quero entender onde buscar orientação para solicitar uma medida protetiva.', intent: 'protection' },
    { id: 'deam', text: '📍 Encontrar uma DEAM', message: 'Como posso encontrar uma Delegacia de Atendimento à Mulher na minha região?', intent: 'deam' },
    { id: 'report', text: '📝 Ajuda para denunciar', message: 'Tenho receio de denunciar violência e quero entender como buscar ajuda.', intent: 'report' },
    { id: 'shelter', text: '🏠 Rede de acolhimento', message: 'Preciso de informações sobre abrigo e a rede de acolhimento à mulher.', intent: 'shelter' }
  ],
  '100': [
    { id: 'anonymous', text: '📝 Denúncia anônima', message: 'Quero saber como relatar uma violação de direitos humanos sem me identificar.', intent: 'anonymous' },
    { id: 'child', text: '👶 Criança ou adolescente', message: 'Preciso de orientação sobre uma violação de direitos de uma criança ou adolescente.', intent: 'child', isSos: true },
    { id: 'referral', text: '⚖️ Encaminhamento e apoio', message: 'Como buscar encaminhamento ao Ministério Público ou à Defensoria para uma violação de direitos?', intent: 'referral' },
    { id: 'service', text: '📋 Como funciona o Disque 100?', message: 'Como funciona o atendimento real do Disque 100 e o que preciso informar?', intent: 'service' }
  ],
  professional: [
    { id: 'anxiety', text: 'Estou sentindo ansiedade', message: 'Estou sentindo ansiedade e gostaria de conversar sobre isso.', intent: 'anxiety' },
    { id: 'support', text: 'Buscar acompanhamento', message: 'Gostaria de entender como buscar acompanhamento profissional.', intent: 'support' }
  ]
};

function getPresetForChannel(channelId, id) {
  const presets = Object.hasOwn(CHANNEL_PRESETS, channelId) ? CHANNEL_PRESETS[channelId] : [];
  return presets.find(preset => preset.id === id) || null;
}

function conversationNormalize(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Only the question at the end of a reply is pending. Statements in the body
// (for example, "está consciente") must not restart an earlier step.
function lastConversationQuestion(text) {
  return conversationNormalize(String(text || '').match(/[^.!?\n]+\?/g)?.at(-1) || '');
}

function conversationAnswer(text, question = '') {
  const current = conversationNormalize(text);
  if (/\b(nao sei|nao tenho certeza|nao consigo confirmar|nao da (?:para|pra) saber|nao consigo (?:ver|saber)|talvez)\b|^acho que\b/.test(current) || /\?|^(?:como|o que|quero (?:saber|entender)|sera que)\b/.test(current)) return null;
  if (/consciente|acordad/.test(question)) {
    if (/inconsciente|desmaiad|nao (?:esta |ta |esta mais )?(?:consciente|acordad|respond)|nao responde/.test(current)) return false;
    if (/consciente|acordad|respondendo|responde|falando comigo|conversando comigo/.test(current)) return true;
  }
  if (/respirando|respiracao/.test(question)) {
    if (/nao (?:esta |ta |consegue )?respir|falta de ar|dificuldade (?:para|de) respirar|ofegant/.test(current)) return false;
    if (/respir(?:a|ando|acao).*(?:bem|normal)|sem (?:falta de ar|dificuldade para respirar)/.test(current)) return true;
  }
  if (/perto|perigo|risco agora/.test(question)) {
    if (/foi embora|ja saiu|ja foi|nao esta mais (?:aqui|perto)|nao ha (?:mais )?(?:perigo|risco)|sem (?:perigo|risco)/.test(current)) return false;
    if (/ainda (?:esta |ta )?(?:aqui|perto)|esta (?:aqui|perto)|em perigo|em risco/.test(current)) return true;
  }
  if (/segur|lugar assim/.test(question)) {
    if (/nao.*segur|nao consigo (?:ir|sair)|ainda.*ameac/.test(current)) return false;
    if (/estou segur|lugar seguro|consegui (?:ir|chegar)|posso ir/.test(current)) return true;
  }
  if (/confianca|companhia|alguem.*apoio/.test(question)) {
    if (/ninguem|sozinh|nao tenho (?:ninguem|alguem)|nao consigo pedir/.test(current)) return false;
    if (/estou com|tem alguem|minha (?:mae|amiga|irma).*comigo|posso (?:pedir|ligar|chamar|falar)|vou (?:pedir|ligar|chamar|falar)/.test(current)) return true;
  }
  if (/^(?:nao|n|negativo)(?:[.! ]*|, ainda nao)$/.test(current) || /^claro que nao\b/.test(current)) return false;
  if (/^(?:sim|s|claro|isso|positivo)\b/.test(current)) return true;
  if (/exercicio|prefere|quer |consegue|precisa/.test(question)) {
    if (/^(?:pode ser|pode|quero|vamos|ok|consigo)\b/.test(current)) return true;
    if (/^(?:nao quero|nao consigo|prefiro nao)\b/.test(current)) return false;
  }
  return null;
}

function conversationSnippet(text) {
  return String(text || '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 110);
}

// Rebuild facts from user turns, never from claims in an assistant reply.
// Keeping this pure also keeps channels, new chats and calls isolated.
function conversationFacts(previous, userText) {
  const facts = {};
  let question = '';
  for (const turn of [...previous, { role: 'user', text: userText }]) {
    if (turn.role === 'model' || turn.role === 'ai') { question = lastConversationQuestion(turn.text); continue; }
    if (turn.role !== 'user') continue;
    const text = conversationNormalize(turn.text);
    const answer = conversationAnswer(text, question);
    const uncertain = /\b(nao sei|nao tenho certeza|nao consigo confirmar|nao da (?:para|pra) saber|nao consigo (?:ver|saber)|talvez)\b|^acho que\b/.test(text);
    const request = /\?|^(?:como|o que|quero (?:saber|entender)|sera que)\b/.test(text);
    if (/consciente|acordad/.test(question) && answer !== null) facts.conscious = answer;
    if (/respirando|respiracao/.test(question) && answer !== null) facts.breathing = answer;
    if (/perto|perigo|risco agora/.test(question) && answer !== null) facts.nearby = answer;
    if (/lugar seguro|lugar assim/.test(question) && answer !== null) facts.safe = answer;
    if (/confianca|companhia/.test(question) && answer !== null) facts.support = answer;
    if (uncertain) {
      if (/consciente|acordad/.test(text + question)) facts.conscious = null;
      if (/respir/.test(text + question)) facts.breathing = null;
      if (/perto|perigo|risco/.test(text + question)) facts.nearby = null;
    } else if (!request) {
      if (/inconsciente|nao (?:esta |ta |esta mais )?(?:consciente|acordad)|nao responde/.test(text)) facts.conscious = false;
      else if (/\b(?:consciente|acordad[ao])\b|falando comigo|conversando comigo/.test(text)) facts.conscious = true;
      if (/nao (?:esta |ta |consegue )?respir|dificuldade (?:para|de) respirar|falta de ar/.test(text) && !/sem (?:falta de ar|dificuldade para respirar)/.test(text)) facts.breathing = false;
      else if (/respir(?:a|ando|acao).*(?:bem|normal)|sem falta de ar/.test(text)) facts.breathing = true;
      if (/foi embora|ja saiu|nao esta mais (?:aqui|perto)|sem perigo|nao (?:ha|tem).*(?:perigo|risco)/.test(text)) facts.nearby = false;
      else if (/ainda (?:esta |ta )?(?:aqui|perto)|esta me (?:seguindo|ameacando)/.test(text)) facts.nearby = true;
      if (/estou segur|lugar seguro/.test(text) && !/nao.*segur/.test(text)) facts.safe = true;
      if (/nao (?:estou|me sinto).*segur/.test(text)) facts.safe = false;
      if (/estou sozinh|nao tenho ninguem/.test(text)) facts.support = false;
      if (/estou com (?:minha|meu|uma|um)|(?:mae|amiga|irma|vizinh[ao]) (?:esta |ta )?comigo/.test(text)) facts.support = true;
    }
    if (/cidade e estado/.test(question) && answer === null && !/nao sei|talvez|\?/.test(text)) facts.city = conversationSnippet(turn.text);
    if (/\b(?:rua|avenida|praca|estrada|rodovia)\b/.test(text) && !/nao sei|qual|como|\?/.test(text)) facts.address = conversationSnippet(turn.text);
    if (/\b(?:estou|to|cheguei|entrei|fiquei) (?:na|no|em)\b/.test(text)) facts.place = conversationSnippet(turn.text);
    if (/\b(?:minutos?|horas?|dias?|ontem|hoje|agora pouco|desde)\b/.test(text) && !/\?/.test(text)) facts.elapsed = conversationSnippet(turn.text);
    if (/so (?:quero )?(?:conversar|desabafar)|apenas (?:conversar|desabafar)|sem exercicio|nao quero.*exercicio/.test(text)) facts.listening = true;
    if (/quero.*(?:exercicio|respiracao|grounding)/.test(text) && !/nao quero|sem exercicio/.test(text)) facts.listening = false;
  }
  return facts;
}

function conversationRecap(previous, current) {
  const details = [...previous.filter(turn => turn.role === 'user').map(turn => turn.text), current]
    .filter(text => conversationNormalize(text).length > 18 && !/\?|^(?:como |o que |quero (?:saber|entender)|sim\b|nao sei\b)/.test(conversationNormalize(text)))
    .map(conversationSnippet);
  return [...new Set(details)].slice(-3).map(text => `“${text}”`).join('; ');
}

function getDirectConversationReply(current, channel, previous, facts) {
  if (/voce (?:ja )?(?:perguntou|esta repetindo)|ja (?:falei|respondi|disse)|nao (?:foi isso|me entendeu)|nao entendeu/.test(current)) {
    const recap = conversationRecap(previous, '');
    return recap ? `Vamos retomar sem repetir as perguntas. Você contou: ${recap}. Qual parte da minha resposta precisa mudar?` : 'Vamos corrigir isso. Qual parte da minha resposta não corresponde ao que você quis dizer?';
  }
  if (/o que (?:eu )?(?:ja )?(?:te (?:falei|contei)|voce lembra)|resum[ao]|resumir/.test(current)) {
    const recap = conversationRecap(previous, '');
    return recap ? `Você contou: ${recap}. Estou usando essas informações para continuar a conversa.` : 'Ainda não tenho detalhes sobre a sua situação. Você pode começar pelo que achar mais importante.';
  }
  if (/^(?:oi|ola|bom dia|boa tarde|boa noite)(?:[,! .]|$)/.test(current) && current.length < 45) {
    return channel === 'soli' || channel === 'professional'
      ? 'Oi! Estou aqui para conversar com você. Como está sendo seu dia?'
      : `Olá. Posso ajudar com dúvidas sobre o ${channel}. O que você precisa saber?`;
  }
  if (['soli', 'professional'].includes(channel)) {
    if (/quem (?:e|eh) voce|seu nome|voce (?:e|eh).*(?:robo|ia|pessoa)/.test(current)) return 'Sou a Soli, uma assistente virtual de acolhimento deste projeto. Posso conversar, ajudar você a organizar o que está sentindo ou acompanhar um exercício, se quiser.';
    if (/sem dinheiro|nao (?:tenho|posso).*pagar|nao tenho dinheiro|gratuit|pelo sus|apoio acessivel|apoio.*orcamento/.test(current)) return 'Não ter dinheiro para uma consulta não impede buscar apoio pelo SUS. Uma UBS pode orientar sobre o cuidado em saúde mental e os serviços da região, incluindo CAPS quando adequado. Você pode começar explicando como isso tem afetado seu dia.';
    if (/o que (?:e|eh).*grounding|como funciona.*grounding/.test(current)) return 'Grounding é um exercício de atenção ao presente: observar o que você vê, toca, ouve, cheira e saboreia, sem se forçar. Podemos fazê-lo devagar, se você quiser.';
    if (/so (?:quero )?(?:conversar|desabafar)|apenas (?:conversar|desabafar)|sem exercicio/.test(current)) return 'Tudo bem, vamos só conversar, sem exercícios nem pressa para resolver. Pode continuar de onde parou; não precisa contar tudo de novo.';
  }
  if (['190', '192'].includes(channel) && /(?:mand|envi|acion|cham).*(?:viatura|ambulancia|socorro)|(?:viatura|ambulancia).*(?:vindo|vem|chegar)/.test(current)) return `Esta demonstração não envia ${channel === '190' ? 'viatura' : 'ambulância'}. Para pedir atendimento real, ligue ${channel} e conte o que está acontecendo e onde.`;
  if (channel === '192' && /como.*(?:consciente|acordad|respirando)|sera que.*(?:consciente|respirando)/.test(current)) return 'Não consigo avaliar o estado da pessoa por esta conversa. Se você não consegue confirmar como ela está ou há urgência, ligue para o 192 real e explique sua dúvida; o atendente orientará você. Não precisa adivinhar uma resposta.';
  if (channel === '100' && /anonim|sem (?:me identificar|dar meu nome|informar meu nome)/.test(current) && !previous.length) return LOCAL_CONVERSATION_STARTERS['100'].anonymous;
  if (channel === '100' && /como funciona.*(?:disque|atendimento|100)/.test(current)) return LOCAL_CONVERSATION_STARTERS['100'].service;
  if (['190', '192', '180', '100'].includes(channel) && /como (?:eu )?(?:relat|explic|cont)|o que (?:eu )?(?:(?:devo|posso|preciso|vou) )?(?:dizer|digo|falar|informar)|o que mais preciso informar/.test(current)) {
    const recap = conversationRecap(previous, '');
    const focus = channel === '192' ? 'o que aconteceu, como a pessoa está e quando começou' : channel === '190' ? 'o que aconteceu, se o risco continua e onde você está' : 'o que aconteceu, quem precisa de proteção e o local, se souber';
    return `No atendimento real ${channel}, conte ${focus}.${recap ? ` Você já contou: ${recap}.` : ''} Não precisa adivinhar informações que não conhece.`;
  }
  if (channel === '180') {
    if (/o que.*(?:perguntar|pedir).*(?:180|atendimento)|quais.*direitos/.test(current)) return 'Você pode perguntar ao 180 sobre direitos, medidas protetivas e serviços de acolhimento da sua região. Também pode pedir que expliquem como buscar ajuda, sem precisar decidir agora sobre uma denúncia.';
    if (/so.*(?:informacao|orientacao)|(?:preciso|tenho que|obrigad[ao]).*denunciar|posso.*(?:informacao|orientacao)|nao quero denunciar/.test(current)) return 'Você pode procurar o Ligue 180 para pedir informação e orientação sobre direitos e serviços. Podemos esclarecer suas dúvidas sem pressionar você a denunciar nem pedir detalhes da violência. Qual informação ajudaria agora?';
    if (/funciona|horario|gratuit|pagar|24 horas/.test(current)) return 'O Ligue 180 real é gratuito e funciona 24 horas por dia. Ele oferece orientação sobre direitos e serviços da rede de atendimento à mulher e recebe denúncias; este protótipo não registra relatos.';
  }
  if (channel === '100') {
    if (/anonim|sem (?:me identificar|dar meu nome|informar meu nome)|(?:preciso|tenho que).*nome/.test(current) && previous.length) return 'A denúncia no Disque 100 real pode ser anônima: você não precisa informar seu nome. Para ajudar a análise, relate os fatos que conhece sobre a pessoa afetada e o local; não precisa investigar nem inventar dados.';
    if (/nao (?:sei|souber|conheco|tenho).*(?:endereco|local)|sem (?:o )?endereco/.test(current)) return 'Você pode informar ao Disque 100 real que não conhece o endereço completo e relatar as referências que sabe. Não se exponha para investigar ou conseguir dados. Qual referência do local você já conhece?';
    if (/idos[ao]|pessoa idosa|maus.?tratos/.test(current) && !previous.length) return 'O Disque 100 real recebe relatos de violações contra pessoas idosas, incluindo maus-tratos. A pessoa está em risco agora?';
  }
  return null;
}

function getSupportConversationReply(current, previous, facts) {
  const userTexts = previous.filter(turn => turn.role === 'user').map(turn => conversationNormalize(turn.text));
  const combined = [...userTexts, current].join(' ');
  const asked = text => previous.some(turn => (turn.role === 'model' || turn.role === 'ai') && turn.text.includes(text));
  const choose = questions => questions.find(text => !asked(text));
  const advice = /o que (?:eu )?(?:faco|fazer|posso fazer)|alguma (?:dica|ideia)|conselho|como (?:eu )?(?:(?:posso|devo) )?(?:me )?(?:lid|resolv|organiz|melhor|prepar)/.test(current);
  const study = /faculdade|prova|estud|trabalho.*curso|aula|apresentacao/.test(combined);
  const work = /trabalho|emprego|chefe|cobranca|sobrecarreg|muita coisa|nao dou conta/.test(combined);
  if (/decepcionar|decepcionei|fracass|nao sou (?:boa|bom)|nao sou capaz|culpa/.test(current)) return 'Parece que, além do que aconteceu, você está carregando uma cobrança sobre si. Um resultado ou um dia difícil não define tudo sobre você. Essa cobrança vem mais de você ou do que espera que outras pessoas pensem?';
  if (/nao me (?:escuta|ouve|entende)|ninguem me (?:escuta|ouve)|nao se importa/.test(current)) return 'É difícil tentar se explicar e sentir que não está sendo ouvido. Podemos ficar com o que você sente, sem decidir agora como resolver essa relação. O que você gostaria que essa pessoa entendesse?';
  if (/brig(?:uei|a|amos)|discuti|discussao|relacionamento|terminou comigo|separacao/.test(current)) return 'Uma discussão pode deixar muita coisa atravessada, mesmo depois que termina. Você quer desabafar sobre o que aconteceu ou pensar em como retomar a conversa com essa pessoa?';
  if (/dorm|sono|insonia|noite/.test(current)) {
    const question = choose(['O que costuma passar pela sua cabeça quando tenta descansar?', 'Isso começou agora ou já vem acontecendo há algum tempo?', 'O que costuma ajudar você a ter um momento de descanso?']);
    return `Esse descanso está fazendo falta.${study ? ' Com os estudos, a cobrança pode continuar mesmo quando você tenta parar.' : work ? ' Pelo que você contou da rotina, parece difícil encontrar uma pausa.' : ''} ${question || 'Se isso continua atrapalhando seu dia, vale conversar com um profissional de saúde.'}`;
  }
  if (advice) {
    if (/apresentacao|apresentar/.test(combined) && /prepar|apresentacao|apresentar/.test(current)) return 'Para essa apresentação, você pode preparar um roteiro curto e ensaiar uma parte de cada vez, começando pelo que quer dizer na abertura. Não precisa decorar cada palavra. O que ajudaria mais agora: organizar o roteiro ou praticar a fala?';
    if (study) return 'Com o que você contou dos estudos, uma possibilidade é escolher uma tarefa pequena para começar e separar o que pode esperar. Uma pausa também pode entrar nesse plano. Qual parte você precisa fazer primeiro?';
    if (work) return 'Pelo que você contou da sobrecarga, pode ajudar separar o que precisa acontecer hoje do que pode esperar e pensar em quem pode dividir uma tarefa. Não precisa resolver tudo de uma vez. O que seria possível aliviar primeiro?';
    return 'Podemos pensar em um passo pequeno a partir do que você contou, como conversar com alguém de confiança ou separar o que precisa de atenção agora. Qual dessas opções parece possível para você?';
  }
  if (/faculdade|prova|estud|aula|apresentacao|materia|conteudo|prazo/.test(current) || study && /dar conta|sem tempo/.test(current)) {
    const question = choose(['O que está pesando mais nos estudos agora?', 'A dificuldade está mais no conteúdo, no prazo ou na cobrança que você sente?', 'Como você gostaria que fosse esse próximo passo nos estudos?']);
    const acknowledgement = /(?:prova|faculdade|estud).*(?:trabalho|emprego)|(?:trabalho|emprego).*(?:prova|faculdade|estud)/.test(current)
      ? 'Você está tentando conciliar os estudos e o trabalho, e o tempo ficou apertado.'
      : /materia|conteudo|dar conta/.test(current) ? 'Essa quantidade de matéria parece estar pesando para você.'
      : asked('O que está pesando mais nos estudos agora?') ? 'Vamos olhar para essa parte dos estudos que você acabou de contar.' : 'Os estudos parecem estar exigindo bastante de você.';
    return `${acknowledgement}${question ? ` ${question}` : ' Podemos continuar por essa preocupação, sem colocar mais cobrança sobre você.'}`;
  }
  if (/trabalho|emprego|chefe|cobranca|sobrecarreg|muita coisa|nao dou conta/.test(current)) {
    const question = choose(['Qual parte dessa rotina está exigindo mais de você?', 'Você tem conseguido dividir alguma dessas responsabilidades?', 'O que você gostaria de aliviar primeiro?']);
    return `Parece que a rotina está exigindo bastante de você.${question ? ` ${question}` : ' Não precisa justificar o cansaço para poder falar dele.'}`;
  }
  if (/sozinh|solidao|sem companhia/.test(current)) {
    const question = choose(['Essa sensação aparece mais em algum momento do dia?', 'Tem alguém com quem você gostaria de retomar o contato?', 'O que você mais sente falta nessa companhia?']);
    return `Sentir falta de companhia pode pesar.${question ? ` ${question}` : ' Podemos ficar conversando sobre isso, no seu tempo.'}`;
  }
  if (/melhor|aliviad|mais calm|mais tranquil|ajudou/.test(current)) return 'Que bom saber que houve um pouco de alívio. Você pode ficar nesse ritmo, sem obrigação de continuar um exercício ou explicar mais do que quiser.';
  if (/trist|chor|desanim|cansad|frustr|medo|ansied|panico/.test(current)) {
    const question = choose(['Aconteceu algo hoje que deixou essa sensação mais forte?', 'O que você gostaria que eu entendesse melhor sobre esse momento?', 'Você quer falar do que aconteceu ou de como está se sentindo agora?']);
    const acknowledgement = /ansied/.test(current) ? 'Podemos conversar sobre essa ansiedade, sem precisar explicar tudo de uma vez.' : /medo|panico/.test(current) ? 'Vamos por partes com esse medo; não precisa explicar tudo de uma vez.' : 'Sinto muito que hoje esteja sendo pesado para você.';
    return `${acknowledgement}${question ? ` ${question}` : ' Estou aqui para ouvir o que você ainda quiser contar.'}`;
  }
  return null;
}

const LOCAL_CONVERSATION_TOPICS = {
  soli: { pep: /\bpep\b|profilax|exposicao de risco/, grounding: /grounding|voltar ao presente|cinco coisas|5 coisas/, breathing: /respiracao|exercicio de respirar/, violence: /violencia|abuso|agress|estupro/, study: /faculdade|prova|estud|aula|apresentacao/, work: /trabalho|emprego|chefe|sobrecarreg/, relationship: /brig|discussao|relacionamento|nao me escuta/, sleep: /dorm|sono|insonia/, anxiety: /ansied|panico|medo|crise|tremendo|choque|flashback|trist|sozinh|cansad|desanim|frustr/ },
  '190': { location: /localizacao|endereco|\bgps\b/, followed: /seguindo|persegu|segue|seguem/, shelter: /abrig|lugar (mais )?seguro/, danger: /perigo|ameac|agress|violencia|roub|socorro|invadi|armad/ },
  '192': { pep: /\bpep\b|profilax|exposicao de risco/, drugged: /dopag|bebida|substancia|adulterad/, bleeding: /sangra|sangue|lesao/, injured: /ferid|feriment|dor|desmai|consciente|respira|mal.?estar|passando mal/ },
  '180': { protection: /protetiv|protecao judicial/, deam: /\bdeam\b|delegacia/, report: /denunc|agress|violencia|abuso/, shelter: /abrig|acolhimento|casa da mulher/ },
  '100': { anonymous: /anonim|sem me identificar|sem dar meu nome/, child: /crianca|adolescente|menor/, referral: /encaminh|defensoria|ministerio publico/, service: /funciona|atendimento|informar|registr|denunc/ },
  professional: { support: /acompanh|profissional|psicolog|terapia/, study: /faculdade|prova|estud|aula|apresentacao/, work: /trabalho|emprego|chefe|sobrecarreg/, relationship: /brig|discussao|relacionamento|nao me escuta/, sleep: /dorm|sono|insonia/, anxiety: /ansied|medo|panico|crise/ }
};

const LOCAL_CONVERSATION_STARTERS = {
  soli: {
    breathing: 'Podemos fazer uma pausa com a respiração, sem forçar nem prender o ar. Quer começar um exercício guiado?',
    grounding: 'No grounding, vamos observar o presente no seu ritmo. Comece procurando cinco coisas que você consegue ver. O que você vê ao seu redor?',
    violence: 'Sinto muito por isso. A culpa não é sua. Se houver perigo imediato, ligue 190. Você está em um lugar seguro neste momento?',
    anxiety: 'Podemos ir devagar, sem precisar explicar tudo de uma vez. O que está mais difícil para você agora?'
  },
  '190': {
    danger: 'Se existe perigo imediato, ligue para o 190 real agora; esta conversa não aciona uma viatura. A pessoa que representa o risco ainda está perto de você?',
    followed: 'Ser seguido pode ser assustador. Se houver perigo imediato, busque ajuda pelo 190 real. Essa pessoa ainda está perto de você?',
    shelter: 'Para pensar em abrigo, considere um lugar acessível com outras pessoas ou alguém de confiança, se puder chegar sem se expor. Você consegue ir para um lugar assim?',
    location: 'Você pode mostrar o endereço nesta demonstração ou copiá-lo para o atendimento real. Nenhum endereço é enviado à Polícia pelo chat. Você já sabe o endereço ou um ponto de referência?'
  },
  '192': {
    injured: 'Ferimento ou dor precisam de avaliação de saúde. Em urgência, ligue 192 para atendimento real; este chat não solicita ambulância. A pessoa está consciente?',
    bleeding: 'Sangramento ou lesão precisam de avaliação de saúde. Em situação urgente, ligue para o 192 real. A pessoa está consciente?',
    drugged: 'Uma suspeita de substância na bebida merece avaliação de saúde o quanto antes. Se houver urgência, ligue 192. Há alguém de confiança com você agora?'
  },
  '180': {
    protection: 'O Ligue 180 real orienta sobre direitos e serviços que podem ajudar com medidas protetivas. A orientação adequada depende da situação; não posso garantir uma decisão judicial. Você precisa encontrar um serviço na sua cidade?',
    deam: 'A DEAM é uma Delegacia de Atendimento à Mulher. O Ligue 180 real pode orientar sobre os serviços da sua região. Qual é a sua cidade e estado?',
    report: 'Você pode buscar orientação no 180 real sem precisar decidir tudo nesta conversa. Podemos organizar suas dúvidas sobre denúncia, respeitando seu receio. Você consegue conversar sem que isso aumente o risco agora?',
    shelter: 'O Ligue 180 real pode orientar sobre a rede de acolhimento, incluindo serviços para quem precisa de abrigo. Não consigo confirmar vagas ou locais sigilosos. Qual é a sua cidade e estado?'
  },
  '100': {
    anonymous: 'No Disque 100 real, a denúncia pode ser anônima, sem informar seus dados pessoais. Este chat não registra a denúncia. A situação envolve quem precisa de proteção?',
    child: 'O Disque 100 real recebe relatos de violações contra crianças e adolescentes. Em perigo imediato, ligue 190. A criança ou adolescente está em risco agora?',
    referral: 'O Disque 100 real orienta e encaminha relatos de violações aos órgãos competentes. Ministério Público e Defensoria têm funções diferentes; o caminho depende da situação. Que tipo de violação você quer relatar?',
    service: 'O Disque 100 real recebe, analisa e encaminha denúncias de violações de direitos humanos. Relate o que aconteceu, quem está em risco e onde ocorreu; aqui nada é registrado no serviço. Quer ajuda para organizar essas informações?'
  },
  professional: {
    anxiety: 'Podemos conversar sobre como essa ansiedade aparece no seu dia. Este é um exemplo de acolhimento, sem diagnóstico. O que está mais difícil para você agora?',
    support: 'Você pode procurar um serviço de saúde ou um profissional para entender as opções de acompanhamento. O que você espera encontrar nesse apoio?'
  }
};

function getLocalConversationReply(userText, channelId, history = [], context = {}) {
  const channel = Object.hasOwn(CHANNEL_GUIDANCE, channelId) ? channelId : 'soli';
  const current = conversationNormalize(userText);
  // Do not mutate the shared history, which may already contain the current turn.
  const previous = (Array.isArray(history) ? history : []).filter(turn => turn && typeof turn.text === 'string').slice(-80);
  if (previous.at(-1)?.role === 'user' && conversationNormalize(previous.at(-1).text) === current) previous.pop();
  const lastModel = previous.findLast(turn => turn.role === 'model' || turn.role === 'ai');
  let question = lastConversationQuestion(lastModel?.text);
  const answer = conversationAnswer(current, question);
  const unknown = /\b(nao sei|nao tenho certeza|nao consigo confirmar|nao da (?:para|pra) saber|nao consigo (?:ver|saber)|talvez)\b|^acho que\b/.test(current);
  const yes = answer === true;
  const no = answer === false;
  const facts = conversationFacts(previous, userText);
  const topics = LOCAL_CONVERSATION_TOPICS[channel];
  const findTopic = text => Object.keys(topics).find(topic => topics[topic].test(conversationNormalize(text)));
  let topic = context?.intent && (context.intent === 'pep' || Object.hasOwn(topics, context.intent)) ? context.intent : findTopic(userText);
  const earlierTopicTurn = previous.findLast(turn => turn.role === 'user' && findTopic(turn.text));
  const earlierTopic = earlierTopicTurn ? findTopic(earlierTopicTurn.text) : null;
  // A new subject should not be mistaken for an answer to an old question.
  const answersPending = /endereco|referencia/.test(question) && !!facts.address
    || /sintoma|sentindo/.test(question) && channel === '192' && topic === 'injured';
  if (topic && earlierTopic && topic !== earlierTopic && !answersPending) question = '';
  if (!topic) topic = earlierTopic;

  if (/nao quero (?:mais )?(?:falar|conversar) (?:sobre\b|disso\b|desse assunto\b|desse tema\b)/.test(current)) {
    return 'Tudo bem, podemos deixar esse assunto de lado. Você prefere falar de outra coisa ou fazer uma pausa?';
  }
  const wantsToStop = /nao quero (?:mais )?(?:falar|conversar)\b|nao quero continuar (?:falando|conversando)\b|quero parar de (?:falar|conversar)\b|pare de falar comigo\b|(?:encerrar|terminar) (?:a |esta |essa )?conversa\b|(?:podemos |quero |vamos )?parar por aqui\b/.test(current);
  if (wantsToStop && !unknown) {
    return channel === 'soli' || channel === 'professional'
      ? 'Tudo bem, podemos parar por aqui. Se quiser voltar a conversar, estarei aqui.'
      : 'Tudo bem, podemos encerrar esta conversa. Se precisar de atendimento real, use o canal oficial.';
  }

  if (/\b(obrigad[oa]|valeu|agradeco)\b/.test(current)) {
    return channel === 'soli' || channel === 'professional'
      ? 'Você pode continuar no seu tempo. Quer retomar o que estávamos conversando ou falar de outra coisa?'
      : 'Se surgir outra dúvida sobre esse atendimento, podemos continuar por aqui. Para uma solicitação real, use o canal oficial.';
  }

  if (channel === '192' && (facts.breathing === false || facts.conscious === false) && !unknown) {
    return `Pelo que você informou, ${facts.breathing === false ? 'a respiração não está normal' : 'a pessoa não está consciente'}. Ligue para o 192 real agora e siga as orientações do atendente. Esta conversa não envia ambulância.`;
  }
  const directReply = getDirectConversationReply(current, channel, previous, facts);
  if (directReply) return directReply;

  if (question.includes('cidade e estado') && ['180', '100'].includes(channel)) {
    if (unknown || no) return 'Você pode consultar o canal oficial para localizar serviços quando tiver essa informação. Não vou inventar um endereço. Qual parte da orientação você gostaria de entender melhor?';
    if (yes) return 'Para procurar um serviço, é preciso informar a cidade e o estado, caso queira compartilhar. Ainda não tenho esses dados e não vou inventar um endereço. Você pode escrevê-los ou perguntar sobre o atendimento em geral.';
    return `Use a cidade e o estado que você informou para pedir orientação no ${channel} real. Não consigo verificar endereços ou disponibilidade por aqui. Você quer organizar o que perguntar ao serviço?`;
  }

  if (topic === 'pep') {
    if (question.includes('ha quanto tempo')) return 'Informe esse tempo à equipe de saúde e procure avaliação o quanto antes. A PEP para HIV tem limite de início de 72 horas, e a indicação é avaliada por um profissional. Você consegue buscar um serviço de saúde agora?';
    if (question.includes('servico de saude agora')) return no || unknown
      ? 'Podemos pensar em alguém de confiança que ajude você a chegar a um serviço de saúde. A avaliação não deve esperar por esta conversa. Existe alguém a quem você possa pedir esse apoio?'
      : 'Ao chegar ao serviço, conte quando ocorreu a exposição e peça avaliação para PEP. A equipe orientará os cuidados adequados. Qual dúvida sobre esse atendimento ainda ficou?';
    if (!previous.some(turn => (turn.role === 'model' || turn.role === 'ai') && /\bPEP\b|72 horas/i.test(turn.text))) return 'A PEP é uma prevenção após exposição de risco e precisa de avaliação em serviço de saúde o quanto antes. Para HIV, deve ser iniciada em até 72 horas; não é seguro escolher medicamentos por este chat. Há quanto tempo ocorreu a exposição?';
  }

  if (channel === 'soli' || channel === 'professional') {
    if (question.includes('exercicio guiado')) {
      if (no || facts.listening) return 'Podemos deixar o exercício de lado. Prefere conversar sobre o que está sentindo ou observar o ambiente?';
      if (!yes) return 'O exercício é opcional; podemos continuar conversando enquanto você decide. Você prefere conversar ou tentar o exercício?';
      return 'Inspire e solte o ar devagar, sem prender nem forçar. Se ficar desconfortável, volte ao seu ritmo normal. Como você se sente depois dessa pausa?';
    }
    if (question.includes('voce ve ao seu redor')) return unknown
      ? 'Pode começar com uma só coisa, como uma parede ou um objeto perto de você. Depois, observe algo que consegue sentir pelo toque, sem se forçar.'
      : 'Continue observando essas coisas no seu ritmo. Agora, perceba quatro coisas que consegue tocar ou sentir, como os pés no chão. O que você nota?';
    if (question.includes('lugar seguro neste momento')) return no || unknown
      ? 'Se houver perigo imediato, procure ajuda pelo 190 real e um lugar mais seguro, se puder. Há alguém de confiança a quem você possa pedir apoio?'
      : 'Podemos pensar no próximo apoio sem precisar contar tudo agora. Há alguém de confiança que possa ficar com você?';
    if (question.includes('alguem de confianca')) return no || unknown
      ? 'Você também pode buscar acolhimento em um serviço de saúde ou na rede de apoio. Quer ajuda para pensar em qual apoio procurar?'
      : 'Você pode pedir companhia e explicar apenas o que se sentir à vontade para contar. O que você mais precisa dessa pessoa agora?';
  }

  if (channel === '190') {
    if (question.includes('ainda esta perto de voce')) return no
      ? 'Você informou que essa pessoa não está mais perto. Se o risco voltar, ligue 190. Você precisa de orientação para relatar o que aconteceu ou para buscar um lugar mais seguro?'
      : 'Se houver risco imediato ou você não souber onde a pessoa está, ligue para o 190 real. Você consegue informar ao atendimento um endereço ou ponto de referência?';
    if (question.includes('lugar assim')) return no || unknown
      ? 'Se não consegue chegar a um lugar mais seguro, busque orientação no 190 real quando houver perigo. Há alguém de confiança que possa ajudar você agora?'
      : 'Considere esse lugar sem se expor para chegar até ele. Se o risco continuar, procure o atendimento real 190. Você precisa organizar as informações para essa ligação?';
    if (question.includes('endereco ou um ponto de referencia') || question.includes('endereco ou ponto de referencia')) return no || unknown
      ? 'Se não souber o endereço, diga isso ao atendente real e descreva o que consegue observar, sem se expor. Que referência você consegue identificar?'
      : 'Informe esse endereço ou referência ao 190 real junto com o que está acontecendo. Aqui não há envio à Polícia. Qual informação sobre a situação você quer organizar primeiro?';
  }

  if (channel === '192') {
    if (/nao consigo respirar|nao esta respirando|dificuldade para respirar/.test(current)) return 'Relate essa dificuldade ao atendimento real 192 agora e siga as orientações do atendente. Esta conversa não faz avaliação médica nem envia ambulância.';
    if (question.includes('pessoa esta consciente')) {
      if (no) return 'Diga ao atendimento real 192 que você informou que a pessoa não está consciente. Busque esse atendimento agora e siga as orientações do atendente; este chat não avalia a situação.';
      if (unknown) return 'Diga ao atendimento real 192 que você não consegue confirmar se a pessoa está consciente. Busque esse atendimento agora e siga as orientações do atendente.';
      if (yes || facts.conscious === true) return facts.breathing === true
        ? 'Você informou que a pessoa está consciente e respira normalmente. Desde quando começou o problema?'
        : 'Conte ao atendimento de saúde que a pessoa está consciente. Ela está respirando normalmente?';
      return 'Ainda não consegui entender se a pessoa está consciente. Não é preciso adivinhar: informe essa dúvida ao atendimento real 192, especialmente se a situação for urgente.';
    }
    if (question.includes('respirando normalmente')) return no || unknown
      ? 'Se a respiração não está normal ou você não consegue confirmar, procure o atendimento real 192 agora e siga suas orientações.'
      : facts.elapsed
        ? 'Você já contou como a pessoa está e quando o problema começou. Há mais algum sintoma que você precisa informar à equipe de saúde?'
        : 'A consciência e a respiração são informações importantes para relatar à equipe de saúde. Desde quando começou o problema?';
    if (question.includes('desde quando')) return 'Conte esse tempo e o que você observou à equipe de saúde. Isso ajuda a avaliação, mas não permite um diagnóstico por aqui. Há mais algum sintoma que você precisa informar?';
    if (question.includes('alguem de confianca')) return no || unknown
      ? 'Procure ajuda em um serviço de saúde; em urgência, ligue 192. Não espere conseguir identificar a substância para buscar avaliação. Você consegue pedir ajuda a alguém no local?'
      : 'Peça a essa pessoa apoio para buscar avaliação de saúde e conte a suspeita à equipe. Como você está se sentindo agora?';
  }

  if (channel === '180') {
    if (question.includes('servico na sua cidade')) return no
      ? 'Para entender o pedido de medida protetiva, o 180 real pode orientar sobre os serviços e os direitos envolvidos. Qual é sua principal dúvida sobre esse caminho?'
      : 'Podemos organizar a busca pelo serviço adequado. Qual é a sua cidade e estado?';
    if (question.includes('aumente o risco agora')) return no || unknown
      ? 'Você não precisa continuar o relato agora. Se houver perigo imediato, ligue 190; para orientação sobre a rede de apoio, procure o 180 real quando puder conversar com segurança.'
      : 'Podemos falar das suas dúvidas sem exigir detalhes da violência. O que mais preocupa você na ideia de buscar ajuda?';
  }

  if (channel === '100') {
    if (question.includes('em risco agora')) return yes || unknown
      ? 'Se houver perigo imediato ou uma ameaça em curso, busque o atendimento real 190; se houver urgência médica, 192. O 100 real orienta sobre a violação de direitos, mas este chat não aciona proteção.'
      : 'Podemos organizar o relato para o Disque 100 real. Descreva apenas o que você sabe, sem investigar por conta própria. O que aconteceu?';
    if (question.includes('organizar essas informacoes')) return no
      ? 'Você pode usar o Disque 100 real quando quiser orientação ou fizer o relato. Qual outra dúvida sobre o atendimento você tem?'
      : 'Podemos separar o que aconteceu, quem está em risco e onde ocorreu, sem expor seus dados pessoais. O que aconteceu?';
    if (question.includes('quem precisa de protecao')) return 'Você pode descrever a pessoa ou o grupo afetado sem se identificar como denunciante. No atendimento real, relate os fatos que conhece. O que aconteceu nessa situação?';
  }

  if (channel === 'soli' || channel === 'professional') {
    const supportReply = getSupportConversationReply(current, previous, facts);
    if (supportReply && !context.intent && !['violence', 'grounding', 'breathing', 'pep'].includes(topic)) return supportReply;
  }

  const starters = LOCAL_CONVERSATION_STARTERS[channel];
  const starter = starters[topic];
  if (starter && !previous.some(turn => (turn.role === 'model' || turn.role === 'ai') && turn.text === starter)) {
    if (channel === '190' && ['followed', 'danger'].includes(topic) && facts.nearby === false) return 'Você contou que essa pessoa já saiu. Isso não permite garantir que o risco terminou; se ele voltar, ligue 190. Você precisa organizar o relato ou pensar em um lugar mais seguro?';
    if (channel === '192' && ['injured', 'bleeding'].includes(topic) && facts.conscious === true) return facts.breathing === true
      ? 'Você informou que a pessoa está consciente e respira normalmente. Desde quando começou o problema?'
      : 'Você informou que a pessoa está consciente. Ela está respirando normalmente?';
    if (channel === '180' && ['deam', 'shelter'].includes(topic) && facts.city) return `Você já informou a cidade: ${facts.city}. O 180 real pode orientar sobre os serviços da região; não consigo verificar endereços ou vagas aqui. Qual dúvida sobre esse atendimento você quer esclarecer?`;
    return starter;
  }

  if (channel === '190' && previous.length && facts.place && /(?:estou|entrei|cheguei|to) (?:na|no|em)/.test(current)) {
    return facts.address
      ? `Você já informou o local: ${facts.address}. Conte ao atendimento real o que aconteceu e se o risco mudou. Há algum detalhe sobre essa pessoa ou situação que você ainda precisa relatar?`
      : `Você contou: “${conversationSnippet(userText)}”. Se o risco voltar, use o 190 real. Você consegue informar um endereço ou ponto de referência desse lugar?`;
  }
  if (channel === '192' && previous.length && /dor|doendo|feriment|sangr|perna|braco|cabeca/.test(current)) {
    return `Inclua também esse sintoma no relato à equipe de saúde: “${conversationSnippet(userText)}”.${facts.elapsed ? ' Você já informou quando começou.' : ''} Se houver urgência, busque o atendimento real 192 sem esperar por esta conversa.`;
  }

  const nextQuestions = {
    soli: ['O que você gostaria que eu entendesse melhor sobre isso?', 'O que parece mais importante para você neste momento?', 'Quer continuar falando desse assunto ou pensar em um próximo apoio?'],
    professional: ['O que você gostaria de trabalhar nesse acompanhamento?', 'Como isso tem afetado seu dia?', 'Qual parte desse apoio você gostaria de entender melhor?'],
    '190': ['O que aconteceu depois do que você já contou?', 'Qual informação sobre a situação você precisa organizar para o atendimento real?', 'Ficou alguma dúvida sobre como buscar ajuda?'],
    '192': ['O que mudou desde que o problema começou?', 'Qual informação sobre o que está sentindo você precisa organizar para a equipe de saúde?', 'Ficou alguma dúvida sobre como buscar atendimento?'],
    '180': ['Qual parte dessa orientação você quer entender melhor?', 'O que mais preocupa você ao buscar apoio?', 'Quer organizar as perguntas para o atendimento real 180?'],
    '100': ['Há algum detalhe do que aconteceu que você gostaria de acrescentar?', 'Qual informação você precisa organizar para o relato ao Disque 100 real?', 'Ficou alguma dúvida sobre esse caminho de denúncia?']
  };
  const alreadyAsked = text => previous.some(turn => (turn.role === 'model' || turn.role === 'ai') && turn.text.includes(text));
  const next = nextQuestions[channel].find(text => !alreadyAsked(text));
  if (previous.some(turn => turn.role === 'user') || lastModel && !/^(oi|ola|bom dia|boa tarde|boa noite)[.! ]*$/.test(current)) {
    const acknowledgement = unknown ? 'Tudo bem ainda não ter essa resposta.' : no ? 'Podemos deixar essa opção de lado.' : current.length > 20 && !current.includes('?') ? `Você trouxe mais uma parte: “${conversationSnippet(userText)}”.` : 'Vamos retomar o assunto pelo que você precisa agora.';
    if (next) return `${acknowledgement} ${next}`;
    if (channel === 'soli' || channel === 'professional') return `${acknowledgement} Você pode continuar no seu ritmo.${facts.listening ? ' Vamos ficar só na conversa, como você escolheu.' : ' Podemos ficar com o que você está sentindo, sem pressa de resolver.'}`;
    const recap = conversationRecap(previous, userText);
    return recap
      ? `Para retomar: ${recap}. Posso ajudar você a organizar esse relato ou esclarecer uma dúvida sobre o atendimento ${channel}.`
      : `Podemos retomar uma dúvida sobre o atendimento ${channel}. Você quer entender o serviço ou organizar o que aconteceu?`;
  }
  const introductions = {
    soli: 'Estou aqui com você. O que está acontecendo ou como você está se sentindo agora?',
    professional: 'Podemos conversar no seu tempo. O que você gostaria de trazer para este acolhimento?',
    '190': 'Vamos entender a situação policial que você quer relatar. Há perigo imediato neste momento?',
    '192': 'Vamos entender o motivo de você buscar orientação de saúde. O que aconteceu ou o que a pessoa está sentindo?',
    '180': 'Posso orientar sobre acolhimento à mulher e caminhos para buscar ajuda. Qual é a sua dúvida ou situação?',
    '100': 'Posso ajudar a entender o caminho para relatar uma violação de direitos humanos. O que aconteceu ou qual é a sua dúvida?'
  };
  return introductions[channel];
}
