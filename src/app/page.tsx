import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default function HomePage() {
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
        Fase 2: memória. Camada de IA (classificador, explicações, dossiê da
        banca) chega na Fase 3.
      </p>

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
