## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Rede de sites (leia antes de escrever ou editar qualquer artigo)

Sou dono de três sites que se complementam. Quando você escrever, revisar ou planejar um artigo, **pense também em quem, nos outros dois sites, vive o outro lado do mesmo assunto**. O objetivo é que o leitor encontre, naturalmente, o que o outro site tem de útil para a situação dele. O objetivo **não** é fabricar links.

### Os três sites

| Site | Para quem | Tom | Temas principais |
|---|---|---|---|
| **planetahomem.com.br** (este projeto) | Homens cristãos | Conversa de homem pra homem, direto, desafiador, com Bíblia no meio do texto | Saúde masculina, casamento, propósito e fé, dinheiro e carreira, vícios, paternidade |
| **amigabeauty.com.br** | Mulheres cristãs | Conversa de amiga para amiga, acolhedor | Beleza, comportamento, relacionamentos, casamento e família, propósito e fé |
| **invistonomeufilho.com.br** | Pais e mães de crianças e adolescentes | Orientação clara, sem sermão | Dinheiro e autonomia, telas e cultura, diálogo e vínculo, bem-estar, fé em casa |

**Neste projeto:** os artigos ficam em `src/content/articles/*.md` (frontmatter: `title, category, categorySlug, excerpt, image, date, author`). A publicação é por commit e push na `main` (deploy automático na Vercel). Antes do push, troque a conta do GitHub para `planetahomemoficial`.

**Lista atualizada dos artigos dos três sites:** rode `node scripts/rede-inventario.mjs --titles` (só lê, não altera nada). Para salvar: `--out=docs/rede-inventario.md`. Para um site só: `--site=invisto`, `--site=amigabeauty` ou `--site=planetahomem`.

### O princípio

> Escreva primeiro para o leitor deste site. Só depois pergunte: **"quem, nos outros dois, ajudaria este mesmo leitor, ou alguém da casa dele, com o outro lado deste assunto?"** Se a resposta não vier de imediato, **não faça link nenhum**. Artigo sem link cruzado é perfeitamente normal.

### O processo em cada artigo

1. **Antes de escrever, procure o espelho do tema.** Este assunto tem um "outro lado" na casa do leitor (a esposa, o filho adolescente)? Isso pode moldar o artigo: um trecho que já abra espaço para essa conversa.
2. **Levante candidatos reais** com o script acima. Abra as páginas candidatas. **Nunca invente endereço, e nunca use um link que você não conferiu com resposta 200.** Confirme que o conteúdo da página diz o que você vai prometer.
3. **Teste do amigo.** Só faça o link se você indicaria aquele texto a um amigo que acabou de ler este. Se for forçado, descarte.
4. **No máximo 1 ou 2 links cruzados por artigo,** em textos de 1.500 palavras ou mais. Textos curtos, normalmente zero ou um.
5. **Onde colocar:** dentro de uma frase ou de um parágrafo curto, no ponto em que o assunto aparece, não na abertura nem no fim por obrigação. O formato "Para ela / Para o seu filho" funciona quando o artigo realmente tem esse desdobramento.
6. **Transparência na primeira menção:** diga que é "nosso site irmão" (ex.: "nosso site irmão, o Amiga Beauty, escreveu para as mulheres sobre…").
7. **Texto do link:** descritivo e natural. Nada de "clique aqui" e nada de repetir sempre a mesma palavra-chave exata.
8. **Reciprocidade só quando for natural.** Ao publicar um artigo que recebe um link, veja se o artigo de lá também deveria apontar para cá. Se não fizer sentido nos dois sentidos, vale só um.

### O que nunca fazer
- Links em rodapé, menu ou barra lateral trocando os três sites, ou listas de "sites amigos".
- Links para páginas de afiliado, ofertas ou "achadinhos" do Amiga Beauty.
- Linkar artigos sobre **suicídio, autolesão, luto ou crise** para conteúdo comercial ou de outro público. Nesses casos, só o CVV (188) e orientação profissional.
- Forçar o tema (beleza em artigo masculino, aposta em artigo de beleza, e coisas assim).
- Afirmar algo sobre o artigo do outro site que você não leu.
- Mexer em outro projeto, conta de GitHub, hospedagem, Analytics ou automação que não seja o deste repositório. Os três são projetos separados.

### Registro de links
Mantenha `docs/links-entre-sites.md` com uma linha por link: `data | página de origem | página de destino | texto do link | motivo`. Antes de criar um novo link, consulte o registro para não repetir o mesmo destino em excesso nem usar sempre o mesmo texto.

### Ao terminar cada artigo, entregue este relatório curto
- **Links cruzados inseridos:** origem, destino, texto e por que fazem sentido.
- **Candidatos descartados** e o motivo.
- **Sugestão de retorno:** onde, em outro site, valeria apontar para este artigo (e em qual artigo de lá).
- **Ideia de par:** se este tema merece um artigo "do outro lado" em um dos irmãos (título sugerido, público, ângulo).

### Pontes que já existem hoje (confirme sempre a URL antes de usar)
São pistas de onde o encaixe é natural, e não ordens para linkar.

| Tema | Planeta Homem | Invisto no Meu Filho | Amiga Beauty |
|---|---|---|---|
| **Paternidade e vínculo** | Papel do homem no casamento, Como ser um bom marido, Homens fragilizados | `/artigos/paternidade-ativa/`, `/artigos/licenca-paternidade-direitos/`, `/artigos/tempo-em-familia/` | (a criar) |
| **IA, telas e adolescentes** | Namorar uma IA | `/artigos/telas-casa/` (o `/artigos/ia-tragedia-caso/` trata de suicídio de menor: não linkar sem cuidado, ver regras) | (a criar) |
| **Dinheiro em casa** | Como organizar finanças pessoais, vício em bets | `/artigos/mesada/` e `/artigos/educacao-financeira-em-familia/` (só quando o assunto for pai ensinando filho; não servem para finanças pessoais do adulto) | (a criar) |
| **Cansaço, saúde mental, escuta** | Depressão, Ansiedade em homens, Homens fragilizados | `/artigos/perguntas-para-filhos/` (ler antes de usar) | `/blog/autoestima-quem-cuida-de-voce` (já linkado daqui) |
| **Casamento, intimidade e limites** | Sexo no casamento, Homem casado pode ter amiga no trabalho?, Como ser um bom marido | (indireto) | `/blog/historia-real-adulterio-comecou-com-elogio` (ler antes de decidir se encaixa) |
| **Fé em casa** | Orar pela esposa, sacerdote do lar | `/artigos/fe-biblia-dinheiro/` | (a criar) |

**Não linkar:** `/artigos/fe-nao-sermao/` e `/artigos/fe-sofrer-sentido/` do Invisto são marcadores de pauta (a página diz que o artigo ainda não foi escrito) e não aparecem no sitemap. Rode o script para ver o estado atual antes de qualquer link.

### Planejamento de pares
Quando eu pedir um artigo, sugira também, em uma linha, se vale um **artigo-irmão** em outro site (ex.: o homem com vício em apostas e o artigo do Invisto sobre adolescentes e apostas online, ou a esposa que descobre a dívida). Isso orienta o calendário editorial dos três sites. Não escreva o artigo do outro site: apenas sugira.
