// Diz à página /admin/ se há uma sessão válida. Não devolve o e-mail nem o token.
import { cabecalhosBase, getConfig, sessaoValida } from "./_login.js";

export default function handler(req, res) {
  cabecalhosBase(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const cfg = getConfig();
  if (!cfg) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: "not_configured" }));
    return;
  }
  const ok = Boolean(sessaoValida(req, cfg));
  res.statusCode = ok ? 200 : 401;
  res.end(JSON.stringify({ ok }));
}
