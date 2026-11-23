# Painel de edição (Sveltia CMS)

Endereço: **https://planetahomem.com.br/admin**

O painel edita os arquivos em `src/content/articles/` pelo navegador. **Cada salvamento vira um commit na branch `main` e a Vercel publica sozinha**, em cerca de 1 minuto. Ele não aparece no Google (`noindex` e `Disallow: /admin/` no `robots.txt`).

## Como o login funciona

1. Você abre `/admin`. Se não houver sessão, o site manda você para o **login do Google**.
2. Voltando, o site confere se o seu e-mail está em `ALLOWED_EMAILS` e grava uma sessão (cookie assinado, 12 horas).
3. No painel, clique em **Entrar com GitHub**. Apesar do nome do botão, ele só abre uma janela rápida que pega o token do GitHub guardado na Vercel e fecha. Você não digita senha do GitHub.
4. Quem não está na lista não recebe sessão nem token.

Os arquivos do login estão em `api/` (`login.js`, `callback.js`, `session.js`, `auth.js`, `logout.js` e `_login.js`). O token do GitHub **nunca** fica no repositório.

## Configuração (uma vez)

### 1. Google Cloud (console.cloud.google.com)

1. Crie um projeto (ex.: "Painel Planeta Homem").
2. **APIs e serviços > Tela de permissão OAuth:** nome do app, público **Externo** e, em usuários de teste, o e-mail que vai usar o painel.
3. **Credenciais > Criar credenciais > ID do cliente OAuth > Aplicativo da Web**:
   - Origem JavaScript autorizada: `https://planetahomem.com.br`
   - URI de redirecionamento autorizado: `https://planetahomem.com.br/api/callback`
4. Copie o **ID do cliente** e a **chave secreta**.

### 2. Token do GitHub (fica só na Vercel)

Na conta **planetahomemoficial**, em https://github.com/settings/personal-access-tokens/new:

- **Repository access:** *Only select repositories* > **SitePH**
- **Repository permissions:** *Contents* = **Read and write**
- **Expiration:** até 1 ano (anote a data para renovar)

Copie o token (`github_pat_...`).

### 3. Variáveis de ambiente na Vercel

No projeto do Planeta Homem, em *Settings > Environment Variables* (Production), crie:

| Nome | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | ID do cliente do Google |
| `GOOGLE_CLIENT_SECRET` | chave secreta do Google |
| `ALLOWED_EMAILS` | e-mail(s) do Google liberados, separados por vírgula |
| `GITHUB_TOKEN` | token do GitHub do passo 2 |
| `AUTH_SECRET` | texto aleatório de 32+ caracteres (assina os cookies) |

Depois, faça um **Redeploy**. Para gerar o `AUTH_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Uso

1. Abra `/admin`, entre com o Google e clique em **Entrar com GitHub**.
2. Em **Artigos**, escolha o artigo (dá para agrupar por categoria e ordenar por data).
3. Altere título, categoria, resumo, capa, crédito da imagem, data, autor e texto. Clique em **Salvar**.

No texto, use `##` para subtítulo, `**negrito**`, `> ` para caixa de destaque e `[texto](endereço)` para link.

Para sair de um computador compartilhado: abra `/api/logout` e use **Sair** no painel.

## Plano B: token de acesso manual

Enquanto as variáveis da Vercel não estiverem configuradas, ou se o login do Google falhar, o painel abre normalmente e aceita **Entrar Usando Token de Acesso**: crie um token como no passo 2 e cole no painel.

## Criar um artigo novo

1. **Artigos > Novo**.
2. Preencha os campos. A **capa** pode ser enviada ali mesmo (vai para `public/img/capas`).
3. O endereço do artigo nasce do título (sem acento, até 60 caracteres). Se quiser um endereço mais curto, peça antes de publicar.
4. **Salvar**. Depois do deploy, confira a página e peça o **IndexNow** para avisar o Bing.

## Cuidados

- **Não dá para excluir artigo pelo painel** (de propósito, para evitar acidente).
- **O painel não mostra a página final do site.** Para ver como ficou, abra o artigo no site depois do deploy.
- **Capas:** imagem 16:9 (ex.: 1672x941), de preferência `.webp`, até ~300 KB.
- **Segurança:** o `GITHUB_TOKEN` dá acesso de escrita ao repositório. Quem entra no painel recebe esse token no navegador (o Sveltia o guarda no navegador). Use só em computador seu. Se suspeitar de vazamento, revogue em https://github.com/settings/personal-access-tokens e troque a variável na Vercel.
- **Para tirar o acesso de alguém:** remova o e-mail de `ALLOWED_EMAILS` e faça redeploy. A sessão antiga deixa de valer imediatamente.
- **Os commits saem em nome da conta dona do token** (`planetahomemoficial`), e não de cada pessoa.
- **Categorias:** são as 11 que o site já tem. Uma categoria nova exige editar `src/content.config.ts` e `public/admin/config.yml`.
- **Facebook:** o painel não dispara postagem. Isso continua separado.

## Detalhes técnicos

- A biblioteca vem de `unpkg.com`, fixada na versão **0.245.1** com verificação de integridade (`integrity` em `public/admin/index.html`). Para atualizar, troque a versão e o hash juntos.
- O painel só inicia depois de `/api/session`. Se a resposta for 401, vai para `/api/login`. Em qualquer outro caso o painel abre (o token só sai de `/api/auth` para quem tem sessão).
- O endereço da categoria (`categorySlug`) é derivado do nome da categoria em `src/content.config.ts`. O campo `categorySlug` nos arquivos antigos é ignorado.
