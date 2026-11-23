// Funções de apoio do login do painel (/admin). O prefixo "_" impede a Vercel de expor este arquivo como rota.
//
// Fluxo: Google identifica a pessoa -> se o e-mail estiver em ALLOWED_EMAILS, o site grava uma sessão
// assinada (cookie) -> o painel (Sveltia CMS) pede o token do GitHub a /api/auth, que só entrega o token
// a quem tem sessão válida. O token do GitHub fica na Vercel (GITHUB_TOKEN), nunca no repositório.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ph_session";
export const STATE_COOKIE = "ph_state";
export const SESSION_SECONDS = 12 * 60 * 60;
export const STATE_SECONDS = 10 * 60;

/** Lê as variáveis de ambiente. Devolve null se faltar alguma, para o login falhar de forma segura. */
export function getConfig(env = process.env) {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const githubToken = env.GITHUB_TOKEN;
  const secret = env.AUTH_SECRET;
  const allowed = new Set(
    (env.ALLOWED_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
  if (!clientId || !clientSecret || !githubToken || !secret || secret.length < 32 || allowed.size === 0) return null;
  const origin = (env.SITE_ORIGIN || "https://planetahomem.com.br").replace(/\/+$/, "");
  return { clientId, clientSecret, githubToken, secret, allowed, origin };
}

const assinar = (segredo, texto) => createHmac("sha256", segredo).update(texto).digest("base64url");

function iguais(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Valor assinado "carga.assinatura". A carga usa base64url e não contém ponto. */
export function criarValorAssinado(segredo, objeto) {
  const carga = Buffer.from(JSON.stringify(objeto)).toString("base64url");
  return `${carga}.${assinar(segredo, carga)}`;
}

export function lerValorAssinado(segredo, valor) {
  if (typeof valor !== "string") return null;
  const [carga, assinatura, resto] = valor.split(".");
  if (!carga || !assinatura || resto !== undefined) return null;
  if (!iguais(assinatura, assinar(segredo, carga))) return null;
  try {
    return JSON.parse(Buffer.from(carga, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function lerCookie(req, nome) {
  const cabecalho = req.headers?.cookie ?? "";
  for (const parte of cabecalho.split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return valor.join("=");
  }
  return null;
}

export const cookieDe = (nome, valor, segundos, caminho = "/") =>
  `${nome}=${valor}; Path=${caminho}; Max-Age=${segundos}; HttpOnly; Secure; SameSite=Lax`;

export const apagarCookie = (nome, caminho = "/") => cookieDe(nome, "", 0, caminho);

/** Devolve o e-mail da sessão válida e permitida, ou null. */
export function sessaoValida(req, cfg, agora = Date.now()) {
  const dados = lerValorAssinado(cfg.secret, lerCookie(req, SESSION_COOKIE));
  if (!dados || typeof dados.email !== "string" || typeof dados.exp !== "number") return null;
  if (dados.exp < agora) return null;
  const email = dados.email.toLowerCase();
  return cfg.allowed.has(email) ? email : null;
}

/** Cabeçalhos de segurança comuns às respostas do login. */
export function cabecalhosBase(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
}

export function paginaSimples(res, status, titulo, mensagem) {
  cabecalhosBase(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
  res.statusCode = status;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  res.end(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(titulo)}</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#1a2026}a{color:#1d5b78}</style></head><body><h1>${esc(titulo)}</h1><p>${esc(mensagem)}</p><p><a href="/admin/">Voltar ao painel</a></p></body></html>`);
}

export function redirecionar(res, destino, status = 302) {
  cabecalhosBase(res);
  res.statusCode = status;
  res.setHeader("Location", destino);
  res.end();
}
