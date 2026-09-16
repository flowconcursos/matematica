"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [estado, action, pendente] = useActionState(login, undefined);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        {/* Emblema Superior */}
        <div className="mb-8 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-soft">
            Flow Concursos
          </span>
          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
            Painel de Treino
          </h1>
          <p className="mt-1.5 text-xs text-soft">
            Ambiente reservado de diagnóstico e alta performance matemática
          </p>
        </div>

        {/* Card de Acesso */}
        <form
          action={action}
          className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs"
        >
          <div className="mb-6 border-b border-line pb-4">
            <h2 className="font-serif text-xl font-normal text-ink">
              Identificação
            </h2>
            <p className="mt-0.5 text-xs text-soft">
              Digite sua credencial pessoal para abrir sua sessão de estudos.
            </p>
          </div>

          <label
            htmlFor="senha"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/80"
          >
            Chave de Acesso
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            autoFocus
            required
            placeholder="••••••••"
            className="mb-4 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder-soft/60 outline-none transition-all focus:border-ink focus:bg-surface focus:ring-1 focus:ring-ink"
          />

          {estado?.erro && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg border border-red/20 bg-[#FAF0ED] p-3 text-xs text-red"
              role="alert"
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{estado.erro}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pendente}
            className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white shadow-xs transition-all hover:bg-[#2A2824] disabled:opacity-50"
          >
            {pendente ? "Autenticando..." : "Acessar Plataforma →"}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-soft">
          Repetição espaçada · Grafo de pré-requisitos · Inteligência contextual
        </p>
      </div>
    </main>
  );
}

