"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [estado, action, pendente] = useActionState(login, undefined);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <form
        action={action}
        className="w-full max-w-sm rounded border border-line bg-paper p-6 shadow-sm"
      >
        <h1 className="mb-1 text-lg font-semibold text-ink">
          Painel de treino
        </h1>
        <p className="mb-6 text-sm text-soft">Acesso restrito.</p>

        <label htmlFor="senha" className="mb-1 block text-sm text-ink">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoFocus
          required
          className="mb-4 w-full rounded border border-line bg-white px-3 py-2 text-ink outline-none focus:border-ink"
        />

        {estado?.erro && (
          <p className="mb-4 text-sm text-red" role="alert">
            {estado.erro}
          </p>
        )}

        <button
          type="submit"
          disabled={pendente}
          className="w-full rounded bg-ink px-3 py-2 text-white disabled:opacity-60"
        >
          {pendente ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
