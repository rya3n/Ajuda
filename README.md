# Ponto Seguro

Protótipo acadêmico de acolhimento, feito com HTML, CSS e JavaScript. A única assistente é a Soli, um mascote sem gênero definido. Não há cadastro ou banco de dados. Um servidor Python serve a página, transcreve a voz localmente e conecta ao Gemini sem colocar a chave no JavaScript.

## Abrir a demonstração

Para a demonstração com IA e permissões de microfone/câmera, inicie o servidor local:

```powershell
python server.py
```

Acesse `http://127.0.0.1:8080`. Chrome e Edge são as opções usadas para conferir o protótipo. A interface também funciona em telas pequenas.

O reconhecimento local já está instalado nesta cópia. Ao levar o projeto para outro computador, prepare a voz uma vez com `python setup_speech.py`, antes de iniciar o servidor. Esse preparo baixa as dependências e o modelo público; depois, a transcrição funciona no computador, sem cadastro, chave ou outra API. Mantenha o servidor aberto durante a apresentação.

## Recursos

- Tela inicial com atalhos para crise, respiração, grounding, Soli, profissionais, rede de apoio e emergência.
- Respiração: quatro ciclos de inspiração de 4 segundos e expiração de 4 segundos, com pausa, retomada e reinício. O temporizador encerra ao fechar e pausa quando a página fica em segundo plano.
- Grounding 5–4–3–2–1: cinco etapas pelos sentidos, com próximo, anterior, conclusão e reinício. Cada etapa pode ser avançada no ritmo da pessoa.
- Chats da Soli, Polícia 190, SAMU 192, Central 180 e Disque 100 com instruções e presets próprios. Texto, voz e vídeo compartilham o histórico do canal nesta sessão; mensagens rápidas seguem uma fila para preservar a ordem.
- Áreas de neuropsicoeducação e artigos com links para as fontes públicas consultadas.
- Atendimento profissional simulado por texto, voz e vídeo.
- Contatos de confiança adicionados somente na memória da página. Recarregar remove os contatos e as conversas.
- Contatos de emergência, localização, tema escuro e modo apresentação.

## O que é simulado

Os chats e as chamadas não conectam a pessoas, profissionais ou centrais de emergência. Nenhuma ocorrência, viatura ou ambulância é acionada pelo protótipo. Os links `tel:` abrem o discador do dispositivo e podem iniciar uma ligação real quando confirmados nele.

A resposta é falada pelo navegador. O microfone e a câmera precisam de permissão. A captura de voz usa Web Audio; o servidor reconhece o português com o modelo Whisper base, em CPU, sem depender do serviço remoto de reconhecimento do navegador. A frase reconhecida aparece na ligação e entra no mesmo histórico do chat. O áudio bruto fica somente em memória no servidor local, sem ser salvo ou enviado à API. A câmera mostra uma prévia local; não envia vídeo a outra pessoa. Sem acesso à localização, o endereço aparece como indisponível, sem inventar coordenadas.

## Integração original

A demonstração usa automaticamente a API Gemini que já estava embutida no projeto. Não há janela, campo de chave ou cadastro de outra API. Basta iniciar `python server.py` e abrir a página.

A chave original fica no arquivo interno `.api-key.json`, carregado automaticamente pelo servidor. Esse arquivo acompanha esta cópia local do projeto, está fora do Git e não é servido ao navegador. A chave não aparece no JavaScript, na URL ou nas respostas do servidor.

A API recebe o histórico limpo do canal (até 80 mensagens), suas instruções específicas e a mensagem atual. Presets entram no mesmo fluxo, inclusive nas chamadas. O GPS automático aparece somente no dispositivo e não entra nesse histórico; um endereço escrito pela própria pessoa faz parte de sua mensagem. A IA recebe a transcrição, sem áudio bruto, câmera ou vídeo.

O endpoint continua sendo o original do Google. Os modelos antigos 1.5/2.0 foram substituídos por `gemini-3.1-flash-lite`, com alternativa `gemini-2.5-flash` somente em erro 404. A integração segue a [API generateContent](https://ai.google.dev/api/generate-content) e a [lista oficial de modelos](https://ai.google.dev/gemini-api/docs/models).

Em 1º de outubro de 2026, o teste real com a chave original retornou **401 UNAUTHENTICATED** no Google, tanto ao consultar modelos quanto ao gerar uma resposta. O site continua tentando essa integração; enquanto o serviço recusa a autenticação, identifica o modo local e usa orientações simples por assunto e histórico. A contingência tem alcance limitado; a fluidez de conversa aberta depende de uma autenticação aceita pelo serviço.

## Arquivos

Na Vercel, o build migra automaticamente a chave da integração que já existia neste repositório para um arquivo privado do servidor. Usa o arquivo interno local, quando presente, ou a revisão anterior fixa `4af0c98`. A chave não entra em `public/`, no novo commit ou no JavaScript entregue ao visitante. Não existe configuração de chave na interface.

Na versão publicada, o reconhecimento de voz roda no navegador com [Transformers.js](https://huggingface.co/docs/transformers.js/pipelines) e o modelo Whisper base. Na primeira ligação, os arquivos do modelo são baixados e a tela mostra o preparo; depois ficam no cache do navegador. O áudio permanece no dispositivo. O servidor recebe somente a transcrição para conversar com a mesma API original.

- `index.html`: estrutura, navegação e modais.
- `style.css`: estilos da estrutura original de chat e chamadas.
- `portal.css`: paleta, novas telas, mascote, exercícios e responsividade.
- `script.js`: fila e histórico de conversas, conexão da IA, chamadas, localização e controles.
- `conversation.js`: instruções por canal, presets e contingência local.
- `server.py`: servidor local, proxy Gemini e endpoint de transcrição.
- `speech.py`: validação do WAV e reconhecimento local de português.
- `local-speech.js` e `audio-capture-worklet.js`: captura do microfone, pausas entre frases e conversão do áudio para WAV.
- `setup_speech.py` e `requirements-voice.txt`: preparo único da voz no PC; os pacotes e pesos baixados ficam fora do Git e da página.
- `browser-speech.js` e `browser-speech-worker.js`: reconhecimento no próprio navegador para a versão publicada, com modelo público em cache.
- `api/`, `build.js` e `vercel.json`: proxy da mesma API original e publicação na Vercel; somente `public/` contém arquivos servidos ao visitante.
- `portal.js`: navegação, conteúdos, contatos da sessão e exercícios guiados.
- `assets/soli.png`: mascote com fundo transparente, preparado a partir da referência enviada.

Paleta: Matcha `#809671`, Almond `#E5E0D8`, Pistache `#B3B792`, Chai `#D2AB80`, Carob `#725C3A` e Vanilla `#E5D2B8`. O destaque de crise usa um tom complementar de terracota para identificação rápida.

## Verificação

Conferido no Microsoft Edge com Playwright: navegação, conclusão/pausa/retomada/reinício da respiração, cinco etapas do grounding, encerramento com Escape, chat local, texto com HTML, troca de canais, descarte de resposta de conversa apagada, inclusão e remoção de contatos, conteúdos, links de emergência e abertura/encerramento dos modais de chamadas. Também foram conferidas as oito telas em larguras de 320, 390, 768, 1024 e 1440 pixels. Sem erros de JavaScript ou rolagem horizontal nessas verificações.

Revisão de layout: chamadas de voz e vídeo em nove tamanhos, de 320 × 568 a 1440 × 900, incluindo 818 × 584 e modo paisagem 844 × 390. Conferidos o alinhamento do conteúdo, controles dentro da tela, legendas separadas do campo de mensagem e acesso por rolagem a textos longos. Chats, contatos, conteúdos expandidos e exercícios também conferidos em seis tamanhos.

Correção da chamada de vídeo no PC: reproduzida na prévia do Codex a sobreposição causada pelo CSS antigo em cache. CSS e JavaScript recebem versão na URL, e a legenda/formulário usam posição normal dentro de uma linha separada dos controles. Conferidos os quatro botões sem elementos cobrindo o ponto de clique em 1386 × 700, 818 × 584, 320 × 568 e 844 × 390, inclusive carregando a folha de estilos antiga. O botão de microfone mudou de estado e Encerrar fechou a chamada na prévia.

Áudio das chamadas: o mesmo gerenciador atende voz e vídeo, reinicia o microfone a cada ligação e confirma a escuta somente após iniciar a captura real de áudio. Enquanto a Soli fala, a transcrição pausa; quando a resposta termina, retoma. Mute, respostas antigas e permissões pendentes ficam isolados por sessão. Falhas de permissão, dispositivo, navegador e conexão mostram uma ajuda com nova tentativa, sem reinício em loop.

Para apresentar com voz, abra http://127.0.0.1:8080/, permita o microfone, aguarde a saudação terminar e fale quando aparecer “Ouvindo você”. Faça uma breve pausa ao terminar a frase. A barra “Entrada do microfone” mostra o som captado; em seguida a transcrição aparece na tela e o canal responde. Enquanto a resposta é falada, a captura pausa e retoma ao terminar. Se não entender o áudio, a ligação continua ouvindo para uma nova tentativa. Mute e Encerrar descartam áudio pendente. Esse fluxo atende tanto voz quanto vídeo.

O serviço nativo de voz da prévia retornava `network`, antes de transcrever qualquer fala. A captura local corrige essa dependência. Os testes de áudio cobrem PCM/WAV, conversão para 16 kHz, detecção de frases, resposta/retomada, mute/reabertura, síntese sem término, erros e callbacks antigos. Dispositivo e síntese são simulados nos testes automatizados; a precisão do modelo também é conferida com frases sintéticas em português pelo endpoint real.

Câmera real e ligações telefônicas não foram testadas com hardware/serviços reais. A API Gemini foi testada com respostas simuladas e, após autorização explícita do usuário, com a chave original do projeto. O Google recusou a autenticação real com erro 401. A configuração manual foi removida conforme solicitado.

Conversas: conferidos os 20 presets dos cinco canais na prévia nos três modos: texto, voz e vídeo (60 verificações), incluindo continuidade com respostas curtas. Controles da videochamada visíveis e clicáveis em 320 × 568 e 1386 × 700 após incluir os presets. Os 94 testes JavaScript e 34 testes Python passaram (128 no total). Os testes automatizados cobrem histórico, canais, fila, descarte de respostas antigas, payloads da API, chamadas e proxy. Execute `node --test tests/*.test.cjs` e `python -m unittest discover -s tests -p 'test*.py'`.

Verificação na versão publicada: fala captada no microfone, transcrição e resposta na videochamada. O modelo de voz roda no navegador na Vercel e fica em cache após a primeira preparação. Pedidos explícitos para parar de conversar são respeitados em todos os canais, e os atalhos do chat quebram em linhas para permanecerem visíveis.

## Mascote

A imagem foi preparada com a ferramenta nativa de geração de imagens, usando a folha de personagem enviada como referência, e salva em `assets/soli.png`. Prompt utilizado:

> Use case: background-extraction. Asset type: mascot PNG for a simple Ponto Seguro web app. Input image is an edit target / character identity reference: use ONLY the large full-body Soli mascot in the upper left-middle of the supplied character sheet. Extract and recreate that same friendly gender-neutral small sage/pistachio green sprout creature, two sprout leaves on its head (green and chai), big warm brown eyes, soft smile, short rounded limbs, subtle glowing cream four-point star on chest, one hand waving. Preserve the exact character design, colors, soft matte 3D rendered texture and comforting feeling. Deliver ONE isolated full-body mascot centered with modest padding, on truly transparent background. Remove everything else: NO text, palette blocks, black background, other mascots, UI, furniture, ground ellipse or decorative sparkles. High quality clean silhouette and alpha edges, square composition. Palette matcha #809671 pistache #B3B792 chai #D2AB80 carob #725C3A vanilla #E5D2B8.
