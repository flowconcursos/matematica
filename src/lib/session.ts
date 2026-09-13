import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "sessao";
const DURACAO_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function chaveSecreta() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não definida");
  }
  return new TextEncoder().encode(secret);
}

async function encrypt(payload: { auth: true; expiraEm: number }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiraEm / 1000))
    .sign(chaveSecreta());
}

export async function decrypt(sessao: string | undefined) {
  if (!sessao) return null;
  try {
    const { payload } = await jwtVerify(sessao, chaveSecreta(), {
      algorithms: ["HS256"],
    });
    if (payload.auth !== true) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function criarSessao() {
  const expiraEm = Date.now() + DURACAO_MS;
  const token = await encrypt({ auth: true, expiraEm });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiraEm),
    path: "/",
  });
}

export async function destruirSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Verificação segura no servidor (route handlers, server actions). */
export async function verificarSessao() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return decrypt(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
