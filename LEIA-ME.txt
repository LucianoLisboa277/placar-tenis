# brk.Point · Placar de Tênis (app web)

App de placar de tênis para Android (Chrome), com formatos de partida configuráveis, vozes de árbitro em
inglês, português e espanhol (feminina e masculina), histórico, funcionamento offline e instalação na tela inicial.

## Publicar no GitHub Pages

O GitHub aceita cerca de 100 arquivos por envio. Este pacote tem mais, então o envio é feito em 4 etapas.
Em cada etapa, abra o repositório, clique em **Add file > Upload files**, arraste o que está indicado
e clique em **Commit changes**.

1. **Etapa 1, o app:** os arquivos soltos (`index.html`, `style.css`, `app.js`, `engine.js`, `sw.js`,
   `manifest.webmanifest`, `auth-config.js`, `LEIA-ME.md`, `LEIA-ME.txt`) e as pastas `icons` e `fonts`.
2. **Etapa 2, vozes em inglês:** a pasta `voices`, mas com apenas a subpasta `en` dentro.
3. **Etapa 3, vozes em português:** a pasta `voices`, com apenas a subpasta `pt`.
4. **Etapa 4, vozes em espanhol:** a pasta `voices`, com apenas a subpasta `es` e o arquivo `index.json`.
   Esta etapa vai por último, porque o `index.json` é o que avisa o app de que as vozes existem.

Depois: **Settings > Pages**, Branch `main`, pasta `/ (root)`, **Save**. Espere 1 a 2 minutos.

### Apagar do repositório (não são mais usados)

`demo3d.html`, `panel-geom.js`, a pasta `vendor`, as pastas `voices/F` e `voices/M` (vozes antigas em
inglês, criptografadas) e o arquivo antigo de leia-me se aparecer duplicado.

## No celular ou tablet (Chrome, Android)

1. Abra o link e entre com o login e a senha.
2. As vozes dos três idiomas baixam sozinhas (cerca de 7 MB, uma vez por aparelho) e ficam salvas.
3. Menu do Chrome (três pontos) > **Instalar app** ou **Adicionar à tela inicial**.

Se o app ficar preso na horizontal nas telas de configuração, desinstale o ícone e instale de novo.

## Atualizar o app

Envie os arquivos novos pelo mesmo caminho (os de mesmo nome são substituídos) e troque o número em
`VERSION` no `sw.js`, para os aparelhos pegarem a versão nova.

## Acesso (login e senha)

Os acessos ficam no `auth-config.js`, só como códigos de verificação (nunca a senha em texto). Para
criar ou trocar acessos, gere um `auth-config.js` novo e substitua o atual. As vozes não dependem da senha.

## Vozes

Pasta `voices/<idioma>/<F ou M>/NNN.mp3`, com `en`, `pt` e `es`, e faixas `001` a `038`. O arquivo
`voices/index.json` lista o que existe em cada idioma. Para acrescentar um idioma ou trocar uma faixa,
envie os MP3 e atualize o `index.json`.
