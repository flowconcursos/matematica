"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AREAS = [
  "aritmetica",
  "algebra",
  "geometria",
  "raciocinio_logico",
  "estatistica",
  "financeira",
  "conjuntos",
] as const;

const CHAVE_SIMULADO_ATUAL = "simulado-atual";

export default function ConfigurarSimuladoPage() {
  const router = useRouter();
  const [bancas, setBancas] = useState<string[]>([]);
  const [nQuestoes, setNQuestoes] = useState(10);
  const [tempoTotalMinutos, setTempoTotalMinutos] = useState(30);
  const [areas, setAreas] = useState<string[]>([]);
  const [banca, setBanca] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    fetch("/api/dossie")
      .then((r) => r.json())
      .then((linhas: { banca: string }[]) => setBancas(linhas.map((l) => l.banca)));
  }, []);

  function alternarArea(area: string) {
    setAreas((atual) =>
      atual.includes(area) ? atual.filter((a) => a !== area) : [...atual, area],
    );
  }

  async function criar() {
    setCriando(true);
    setErro(null);

    const resposta = await fetch("/api/simulado/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nQuestoes,
        tempoTotalMinutos,
        areas: areas.length > 0 ? areas : undefined,
        banca: banca || undefined,
      }),
    });

    setCriando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErro(corpo?.erro ?? "Não foi possível criar o simulado.");
      return;
    }

    const dados = await resposta.json();
    localStorage.setItem(
      CHAVE_SIMULADO_ATUAL,
      JSON.stringify({
        sessaoId: dados.sessaoId,
        metaSegundos: dados.metaSegundos,
        inicioTimestamp: Date.now(),
        questoes: dados.questoes,
        respostas: [],
        indice: 0,
      }),
    );
    router.push(`/simulado/${dados.sessaoId}`);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Configurar simulado</h1>
        <Link href="/simulado" className="text-sm text-soft underline">
          Voltar
        </Link>
      </header>

      <p className="text-sm text-soft">
        Modo prova: sem explicação, sem gabarito parcial, sem cronômetro por
        questão. Só o tempo total corre.
      </p>

      <label className="text-sm text-ink">
        Número de questões
        <input
          type="number"
          min={1}
          max={200}
          value={nQuestoes}
          onChange={(e) => setNQuestoes(Number(e.target.value))}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>

      <label className="text-sm text-ink">
        Tempo total (minutos)
        <input
          type="number"
          min={1}
          max={600}
          value={tempoTotalMinutos}
          onChange={(e) => setTempoTotalMinutos(Number(e.target.value))}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>

      <fieldset>
        <legend className="mb-1 text-sm text-ink">
          Áreas (nenhuma selecionada = todas)
        </legend>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <label
              key={a}
              className={`cursor-pointer rounded border px-3 py-2 text-sm ${
                areas.includes(a) ? "border-ink bg-ink text-white" : "border-line text-ink"
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={areas.includes(a)}
                onChange={() => alternarArea(a)}
              />
              {a}
            </label>
          ))}
        </div>
      </fieldset>

      {bancas.length > 0 && (
        <label className="text-sm text-ink">
          Banca (opcional)
          <select
            value={banca}
            onChange={(e) => setBanca(e.target.value)}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          >
            <option value="">Todas</option>
            {bancas.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      )}

      {erro && <p className="text-sm text-red">{erro}</p>}

      <button
        onClick={criar}
        disabled={criando}
        className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
      >
        {criando ? "Preparando…" : "Iniciar simulado"}
      </button>
    </main>
  );
}
