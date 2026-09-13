"use server";

import { redirect } from "next/navigation";
import { criarSessao, destruirSessao } from "@/lib/session";

export type EstadoLogin = { erro?: string } | undefined;

export async function login(
  _estado: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const senha = formData.get("senha");
  const senhaEsperada = process.env.APP_PASSWORD;

  if (!senhaEsperada) {
    return { erro: "APP_PASSWORD não configurada no servidor." };
  }

  if (typeof senha !== "string" || senha !== senhaEsperada) {
    return { erro: "Senha incorreta." };
  }

  await criarSessao();
  redirect("/");
}

export async function logout() {
  await destruirSessao();
  redirect("/login");
}
