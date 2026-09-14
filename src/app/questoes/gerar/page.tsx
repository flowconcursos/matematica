"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Topico = { id: string; nome: string };

type Alternativa = { texto: string; correta: boolean; erroCapturado: string };

type QuestaoGerada = {
  enunciado: string;
  alternativas: Alternativa[];
  gabarito: string;
  explicacao: string;
  topicoId: string;
  topicoNome: string;
  nivel: "facil" | "medio" | "dificil";
  modelo: string;
};

const NIVEIS = ["facil", "medio", "dificil"] as const;

export default function GerarQuestaoPage() {
  const router = useRouter();
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [topicoId, setTopicoId] = useState("");
  const [nivel, setNivel] = useState<(typeof NIVEIS)[number]>("medio");
  const [banca, setBanca] = useState("");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [gerada, setGerada] = useState<QuestaoGerada | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/topicos")
      .then((r) => r.json())
      .then((ts: Topico[]) => {
        setTopicos(ts);
        if (ts[0]) setTopicoId(ts[0].id);
      });
  }, []);

  async function gerar() {
    if (!topicoId) {
      setErro("Selecione um tópico.");
      return;
    }
    setGerando(true);
    setErro(null);
    setGerada(null);

    const resposta = await fetch("/api/ia/gerar-questao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicoId, nivel, banca: banca.trim() || undefined }),
    });

    setGerando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErro(corpo?.erro ?? "Não foi possível gerar a questão agora.");
      return;
    }

    setGerada(await resposta.json());
  }

  async function salvar() {
    if (!gerada) return;
    setSalvando(true);

    const resposta = await fetch("/api/questoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enunciado: gerada.enunciado,
        alternativas: gerada.alternativas.map((a) => a.texto),
        gabarito: gerada.gabarito,
        tipo: "multipla",
        nivel: gerada.nivel,
        topicoIds: [gerada.topicoId],
        origem: "gerada_ia",
        geradoPorModelo: gerada.modelo,
        explicacaoInicial: gerada.explicacao,
      }),
    });

    setSalvando(false);
    if (!resposta.ok) {
      setErro("Não foi possível salvar a questão.");
      return;
    }
    router.push("/");
  }

  function descartar() {
    setGerada(null);
  }

  if (gerada) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
        <header className="text-sm text-soft">Conferência da questão gerada</header>

        <p className="rounded border border-amber bg-amber/10 p-2 text-xs text-amber">
          Gerada por IA — rótulo permanente, nunca usada em simulado tratado
          como termômetro. Confira antes de salvar.
        </p>

        <p className="text-xs text-soft">
          {gerada.topicoNome} · {gerada.nivel}
        </p>

        <p className="text-sm text-ink">{gerada.enunciado}</p>

        <ul className="flex flex-col gap-2">
          {gerada.alternativas.map((a, i) => (
            <li
              key={i}
              className={`rounded border p-2 text-sm ${
                a.correta ? "border-green/60 bg-green/10" : "border-line"
              }`}
            >
              <p className="text-ink">{a.texto}</p>
              {a.erroCapturado && (
                <p className="mt-1 text-xs text-soft">Captura: {a.erroCapturado}</p>
              )}
              {a.correta && <p className="mt-1 text-xs text-green">Correta</p>}
            </li>
          ))}
        </ul>

        <div className="rounded border border-line bg-white/60 p-3 text-sm text-ink">
          <p className="mb-1 text-xs font-semibold text-soft">Explicação passo a passo</p>
          {gerada.explicacao}
        </div>

        {erro && <p className="text-sm text-red">{erro}</p>}

        <div className="flex gap-3">
          <button
            onClick={descartar}
            className="flex-1 rounded border border-line px-4 py-3 text-ink"
          >
            Descartar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Aprovar e salvar"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Gerar questão de treino</h1>
        <Link href="/" className="text-sm text-soft underline">
          Voltar
        </Link>
      </header>

      <p className="text-sm text-soft">
        A IA gera uma questão inédita com distratores construídos para
        capturar erros específicos. Nada entra no banco antes de você
        conferir.
      </p>

      <label className="text-sm text-ink">
        Tópico
        <select
          value={topicoId}
          onChange={(e) => setTopicoId(e.target.value)}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        >
          {topicos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-ink">
        Nível
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value as (typeof NIVEIS)[number])}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        >
          {NIVEIS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-ink">
        Banca (opcional — usa o dossiê dela se houver)
        <input
          value={banca}
          onChange={(e) => setBanca(e.target.value)}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>

      {erro && <p className="text-sm text-red">{erro}</p>}

      <button
        onClick={gerar}
        disabled={gerando || topicos.length === 0}
        className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
      >
        {gerando ? "Gerando…" : "Gerar questão"}
      </button>

      {topicos.length === 0 && (
        <p className="text-sm text-soft">
          Nenhum tópico cadastrado ainda.{" "}
          <Link href="/topicos/novo" className="underline">
            Cadastre um primeiro
          </Link>
          .
        </p>
      )}
    </main>
  );
}
