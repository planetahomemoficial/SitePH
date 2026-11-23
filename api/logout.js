// Encerra a sessão do painel neste navegador.
import { SESSION_COOKIE, apagarCookie, redirecionar } from "./_login.js";

export default function handler(req, res) {
  res.setHeader("Set-Cookie", apagarCookie(SESSION_COOKIE, "/"));
  redirecionar(res, "/admin/");
}
