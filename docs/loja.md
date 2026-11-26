# Loja (página /loja/)

Estilo vitrine, igual à da Grid News: seções com cartões (imagem, selo, tamanho, nome, "Ver na Amazon", "Detalhes").

- Dados: `src/data/loja.json`. Uma `secao` tem `id`, `titulo`, `subtitulo` (opcional) e `produtos`.
- Produto: `nome`, `tag` (selo, ex.: "Speed Champions · Ferrari"), `tamanho` (opcional: Grande, Médio, Pequeno), `imagem` (arquivo em `public/img/loja/`, usado como `/img/loja/arquivo.webp`), `link` (afiliado amzn.to), `detalhes` (opcional; sem ele o botão não aparece).
- Seção sem produtos não aparece. Com 2 ou mais seções, aparecem atalhos no topo.
- Links saem com `rel="sponsored nofollow noopener"` e há aviso de afiliado no rodapé da página.
- Os artigos de review antigos continuam no ar (só o menu "Produtos" foi escondido em BaseLayout.astro). Cada seção vira um segmento filtrável no topo da loja; `rotulo` (opcional) é o nome curto do botão.
