"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SimuladoHistorico = {
  id: string;
  data: string;
  inicio: string;
  fim: string;
  metaSegundos: number;
  nQuestoes: number;
  acertos: number;
};

export default function SimuladoHistoricoPage() {
  const [historico, setHistorico] = useState<SimuladoHistorico[] | "carregando">(
    "carregando",
  );

  useEffect(() => {
    fetch("/api/simulado")
      .then((r) => r.json())
      .then(setHistorico);
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Simulados</h1>
        <Link href="/" className="text-sm text-soft underline">
          Voltar
        </Link>
      </header>

      <Link
        href="/simulado/configurar"
        className="rounded bg-ink px-4 py-4 text-center text-lg text-white"
      >
        Novo simulado
      </Link>

      {historico === "carregando" && <p className="text-soft">Carregando…</p>}

      {historico !== "carregando" && historico.length === 0 && (
        <p className="text-soft">Nenhum simulado concluído ainda.</p>
      )}

      {historico !== "carregando" && historico.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink">Histórico</h2>
          {historico.map((s) => {
            const duracaoSegundos = Math.round(
              (new Date(s.fim).getTime() - new Date(s.inicio).getTime()) / 1000,
            );
            return (
              <div key={s.id} className="rounded border border-line bg-white/60 p-3">
                <p className="text-sm text-ink">
                  {new Date(s.data).toLocaleDateString("pt-BR")} —{" "}
                  {s.acertos}/{s.nQuestoes} acertos
                </p>
                <p className="text-xs text-soft">
                  {Math.round(duracaoSegundos / 60)} min usados de{" "}
                  {Math.round(s.metaSegundos / 60)} min
                </p>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
