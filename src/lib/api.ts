import "server-only";
import { NextResponse } from "next/server";
import { verificarSessao } from "@/lib/session";

/** Checagem de defesa em profundidade: o proxy já bloqueia, isto reforça na rota. */
export async function exigirSessao() {
  const sessao = await verificarSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }
  return null;
}
