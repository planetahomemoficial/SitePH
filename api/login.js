// Passo 1 do login: manda a pessoa para a tela de entrada do Google.
import { randomBytes } from "node:crypto";
import {
  STATE_COOKIE,
  STATE_SECONDS,
  cookieDe,
  criarValorAssinado,
  getConfig,
  paginaSimples,
  redirecionar,
} from "./_login.js";

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

  const state = randomBytes(16).toString("hex");
  const cookie = criarValorAssinado(cfg.secret, { state, exp: Date.now() + STATE_SECONDS * 1000 });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: `${cfg.origin}/api/callback`,
    response_type: "code",
    scope: "openid email",
    state,
    prompt: "select_account",
  }).toString();

  res.setHeader("Set-Cookie", cookieDe(STATE_COOKIE, cookie, STATE_SECONDS, "/api"));
  redirecionar(res, url.toString());
}
