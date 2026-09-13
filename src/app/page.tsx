import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { tokensUsadosHoje } from "@/lib/ai-db";

// Precisa ser renderizado a cada request: uso de IA muda ao longo do dia.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const teto = Number(process.env.AI_TETO_DIARIO_TOKENS ?? 0);
  const usados = teto > 0 ? await tokensUsadosHoje() : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Painel de treino</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-soft underline">
            Sair
          </button>
        </form>
      </header>

      <p className="text-sm text-soft">
        Fase 3: IA básica. Classificador de questão e explicação em 3
        níveis já funcionam; dossiê da banca e diagnóstico chegam depois.
      </p>

      {usados !== null && (
        <p
          className={`text-xs ${usados >= teto ? "text-red" : "text-soft"}`}
        >
          IA hoje: {usados.toLocaleString("pt-BR")} de{" "}
          {teto.toLocaleString("pt-BR")} tokens
          {usados >= teto && " — teto atingido, novas chamadas bloqueadas até amanhã."}
        </p>
      )}

      <nav className="flex flex-col gap-3">
        <Link
          href="/sessao"
          className="rounded bg-ink px-4 py-4 text-center text-lg text-white"
        >
          Iniciar sessão de treino
        </Link>
        <Link
          href="/caderno"
          className="rounded bg-ink px-4 py-4 text-center text-lg text-white"
        >
          Caderno de erros
        </Link>
        <Link
          href="/painel"
          className="rounded border border-line bg-white px-4 py-3 text-center text-ink"
        >
          Painel
        </Link>
        <Link
          href="/trilha"
          className="rounded border border-line bg-white px-4 py-3 text-center text-ink"
        >
          Trilha de base
        </Link>
        <Link
          href="/topicos/novo"
          className="rounded border border-line bg-white px-4 py-3 text-center text-ink"
        >
          Cadastrar tópico
        </Link>
        <Link
          href="/questoes/nova"
          className="rounded border border-line bg-white px-4 py-3 text-center text-ink"
        >
          Cadastrar questão
        </Link>
      </nav>
    </main>
  );
}
