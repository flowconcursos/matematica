"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Banca = { banca: string; nQuestoes: number; confiabilidade: "baixa" | "media" | "alta" };

const ROTULO_CONFIABILIDADE: Record<Banca["confiabilidade"], string> = {
  baixa: "Confiabilidade baixa",
  media: "Confiabilidade média",
  alta: "Confiabilidade alta",
};

export default function DossiePage() {
  const [bancas, setBancas] = useState<Banca[] | "carregando">("carregando");

  useEffect(() => {
    fetch("/api/dossie")
      .then((r) => r.json())
      .then(setBancas);
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Dossiê da banca</h1>
        <Link href="/" className="text-sm text-soft underline">
          Voltar
        </Link>
      </header>

      {bancas === "carregando" && <p className="text-soft">Carregando…</p>}

      {bancas !== "carregando" && bancas.length === 0 && (
        <p className="text-soft">
          Sem questões com banca registrada ainda. Cadastre ou importe
          questões informando a banca para começar a coletar dados.
        </p>
      )}

      {bancas !== "carregando" &&
        bancas.map((b) => (
          <Link
            key={b.banca}
            href={`/dossie/${encodeURIComponent(b.banca)}`}
            className="rounded border border-line bg-white/60 p-3"
          >
            <p className="text-ink">{b.banca}</p>
            <p className="text-xs text-soft">
              {b.nQuestoes} questão(ões) · {ROTULO_CONFIABILIDADE[b.confiabilidade]}
            </p>
          </Link>
        ))}
    </main>
  );
}
