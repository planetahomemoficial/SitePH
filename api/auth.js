// Entrega o token do GitHub ao painel (Sveltia CMS), no formato que ele espera de um serviço de login.
// Só responde a quem tem sessão válida (login Google com e-mail permitido). Sem sessão, nada é entregue.
import { cabecalhosBase, getConfig, paginaSimples, sessaoValida } from "./_login.js";
import { randomBytes } from "node:crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const cfg = getConfig();
  if (!cfg) {
    paginaSimples(res, 500, "Login não configurado", "Faltam variáveis de ambiente do login na Vercel. Veja docs/painel-admin.md.");
    return;
  }

  if (!sessaoValida(req, cfg)) {
    paginaSimples(res, 401, "Faça login primeiro", "Abra o painel em /admin/ e entre com a sua conta do Google.");
    return;
  }

  // Protocolo do painel: a janela avisa "authorizing:github", o painel repete a mensagem, e só então
  // a janela envia o resultado. Tudo restrito à origem do próprio site.
  const nonce = randomBytes(16).toString("base64");
  const dados = JSON.stringify({ token: cfg.githubToken, provider: "github" });
  const script = `(function () {
  var origem = ${JSON.stringify(cfg.origin)};
  var resultado = ${JSON.stringify("authorization:github:success:" + dados)};
  if (!window.opener) { document.body.textContent = "Feche esta janela e tente de novo pelo painel."; return; }
  function receber(e) {
    if (e.source !== window.opener || e.origin !== origem || e.data !== "authorizing:github") return;
    window.removeEventListener("message", receber);
    window.opener.postMessage(resultado, origem);
  }
  window.addEventListener("message", receber);
  window.opener.postMessage("authorizing:github", origem);
})();`.replace(/</g, "\\u003c");

  cabecalhosBase(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy", `default-src 'none'; script-src 'nonce-${nonce}'`);
  res.statusCode = 200;
  res.end(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Entrando…</title></head><body>Entrando…<script nonce="${nonce}">${script}</script></body></html>`);
}
