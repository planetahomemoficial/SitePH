// Passo 2 do login: o Google devolve a pessoa para cá. Confere o estado, troca o código pelo e-mail
// (conversa direta do servidor com o Google) e, se o e-mail estiver na lista, grava a sessão.
import {
  SESSION_COOKIE,
  SESSION_SECONDS,
  STATE_COOKIE,
  apagarCookie,
  cookieDe,
  criarValorAssinado,
  getConfig,
  lerCookie,
  lerValorAssinado,
  paginaSimples,
  redirecionar,
} from "./_login.js";

export default async function handler(req, res) {
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

  const { code, state, error } = req.query ?? {};
  const guardado = lerValorAssinado(cfg.secret, lerCookie(req, STATE_COOKIE));
  const limpar = apagarCookie(STATE_COOKIE, "/api");

  if (error) {
    res.setHeader("Set-Cookie", limpar);
    paginaSimples(res, 400, "Entrada cancelada", "O login com o Google foi cancelado ou recusado.");
    return;
  }

  const estadoOk =
    guardado &&
    typeof state === "string" &&
    typeof code === "string" &&
    guardado.state === state &&
    typeof guardado.exp === "number" &&
    guardado.exp > Date.now();
  if (!estadoOk) {
    res.setHeader("Set-Cookie", limpar);
    paginaSimples(res, 400, "Login inválido ou expirado", "Volte ao painel e tente entrar de novo.");
    return;
  }

  let email;
  try {
    const troca = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: `${cfg.origin}/api/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!troca.ok) throw new Error(`token ${troca.status}`);
    const { access_token: acesso } = await troca.json();
    if (!acesso) throw new Error("sem access_token");

    const perfilResposta = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${acesso}` },
    });
    if (!perfilResposta.ok) throw new Error(`userinfo ${perfilResposta.status}`);
    const perfil = await perfilResposta.json();
    if (perfil.email_verified === true && typeof perfil.email === "string") email = perfil.email.toLowerCase();
  } catch {
    res.setHeader("Set-Cookie", limpar);
    paginaSimples(res, 502, "Não foi possível entrar", "Falha ao falar com o Google. Tente de novo em instantes.");
    return;
  }

  if (!email || !cfg.allowed.has(email)) {
    res.setHeader("Set-Cookie", limpar);
    paginaSimples(res, 403, "Acesso negado", "Esta conta do Google não tem permissão para usar o painel.");
    return;
  }

  const sessao = criarValorAssinado(cfg.secret, { email, exp: Date.now() + SESSION_SECONDS * 1000 });
  res.setHeader("Set-Cookie", [limpar, cookieDe(SESSION_COOKIE, sessao, SESSION_SECONDS, "/")]);
  redirecionar(res, "/admin/");
}
