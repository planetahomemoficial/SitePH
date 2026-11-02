# Painel de edição (Sveltia CMS)

Endereço: **https://planetahomem.com.br/admin/**

O painel edita os arquivos em `src/content/articles/` pelo navegador. **Cada salvamento vira um commit na branch `main` e a Vercel publica sozinha**, em cerca de 1 minuto. Ele não aparece no Google (`noindex` e `Disallow: /admin/` no `robots.txt`).

## Primeiro acesso: criar o token

O painel entra no GitHub com um token pessoal. Faça uma vez:

1. Entre no GitHub com a conta **planetahomemoficial**.
2. Abra https://github.com/settings/personal-access-tokens/new (Configurações > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token).
3. **Token name:** `Painel Planeta Homem`.
4. **Expiration:** 90 dias (ou o prazo que preferir; ao vencer, você cria outro).
5. **Repository access:** *Only select repositories* e escolha **SitePH**.
6. **Permissions > Repository permissions:** *Contents* = **Read and write**. (*Metadata* = Read-only aparece sozinho.)
7. **Generate token** e copie o código (começa com `github_pat_`). Ele só aparece uma vez.

## Entrar no painel

1. Abra `/admin/`.
2. Clique em **Entrar Usando Token de Acesso** e cole o token.
3. O painel lembra o login nesse navegador.

> Não use "Entrar com GitHub": esse botão exige um serviço extra de login que não está configurado.

## Editar um artigo

1. Em **Artigos**, escolha o artigo (dá para agrupar por categoria e ordenar por data).
2. Altere os campos: título, categoria, resumo, capa, crédito da imagem, data, autor e texto.
3. Clique em **Salvar**. O site atualiza em ~1 minuto.

No texto, use `##` para subtítulo, `**negrito**`, `> ` para caixa de destaque e `[texto](endereço)` para link.

## Criar um artigo novo

1. **Artigos > Novo**.
2. Preencha os campos. A **capa** pode ser enviada ali mesmo (vai para `public/img/capas`).
3. O endereço do artigo nasce do título (sem acento, até 60 caracteres). Se quiser um endereço mais curto, peça antes de publicar.
4. **Salvar**. Depois do deploy, confira a página e peça o **IndexNow** para avisar o Bing.

## Cuidados

- **Não dá para excluir artigo pelo painel** (de propósito, para evitar acidente).
- **O painel não mostra a página final do site.** Para ver como ficou, abra o artigo no site depois do deploy.
- **Capas:** imagem 16:9 (ex.: 1672x941), de preferência `.webp`, até ~300 KB.
- **Segurança do token:** ele dá acesso de escrita ao repositório. Use só em computador seu. Se perder ou suspeitar, revogue em https://github.com/settings/personal-access-tokens e crie outro.
- **Categorias:** são as 11 que o site já tem. Uma categoria nova exige editar `src/content.config.ts` e `public/admin/config.yml`.
- **Facebook:** o painel não dispara postagem. Isso continua separado.

## Detalhes técnicos

- A biblioteca vem de `unpkg.com`, fixada na versão **0.245.1** com verificação de integridade (`integrity` em `public/admin/index.html`). Para atualizar, troque a versão e o hash juntos.
- O endereço da categoria (`categorySlug`) é derivado do nome da categoria em `src/content.config.ts`. O campo `categorySlug` nos arquivos antigos é ignorado.
