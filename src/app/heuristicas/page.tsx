"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";

type Heuristica = {
  id: string;
  texto: string;
  topicoNome: string;
  origem: string;
  criadaEm: string;
  acertosConsecutivosDesde: number;
  status: "ativa" | "superada" | "arquivada";
  fixadaPeloUsuario: boolean;
  tentativasEvidencia: string[];
};

type Lista = Heuristica[] | "carregando";

function listaReducer(_estado: Lista, nova: Heuristica[]): Lista {
  return nova;
}

const ROTULO_STATUS: Record<Heuristica["status"], string> = {
  ativa: "ativa",
  superada: "superada — 5 acertos firmes seguidos",
  arquivada: "arquivada por inatividade (60 dias sem evidência)",
};

export default function HeuristicasPage() {
  const [lista, dispatchLista] = useReducer(listaReducer, "carregando" as Lista);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const resposta = await fetch("/api/heuristicas");
    dispatchLista(await resposta.json());
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function gerar() {
    setGerando(true);
    setErro(null);
    setAviso(null);

    const resposta = await fetch("/api/heuristicas/gerar", { method: "POST" });
    setGerando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErro(corpo?.erro ?? "Não foi possível destilar heurísticas agora.");
      return;
    }

    const corpo = await resposta.json();
    setAviso(`${corpo.criadas.length} heurística(s) nova(s) destilada(s).`);
    await carregar();
  }

  async function alternarFixada(h: Heuristica) {
    await fetch(`/api/heuristicas/${h.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fixadaPeloUsuario: !h.fixadaPeloUsuario }),
    });
    await carregar();
  }

  if (lista === "carregando") {
    return <Centro>Carregando heurísticas…</Centro>;
  }

  const ativas = lista.filter((h) => h.status === "ativa");
  const outras = lista.filter((h) => h.status !== "ativa");

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Heurísticas</h1>
        <Link href="/" className="text-sm text-soft underline">
          Início
        </Link>
      </header>

      <p className="text-sm text-soft">
        Regras curtas destiladas dos seus próprios erros recentes, cada uma
        ligada a um gatilho no enunciado. Superada após 5 acertos firmes
        seguidos no tópico; arquivada sem evidência nova em 60 dias — a menos
        que você a fixe.
      </p>

      <button
        onClick={gerar}
        disabled={gerando}
        className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
      >
        {gerando ? "Destilando…" : "Destilar novas heurísticas"}
      </button>

      {erro && <p className="text-sm text-red">{erro}</p>}
      {aviso && <p className="text-sm text-green">{aviso}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">Ativas ({ativas.length})</h2>
        {ativas.length === 0 && (
          <p className="text-sm text-soft">
            Nenhuma heurística ativa ainda. Registre mais tentativas e destile.
          </p>
        )}
        {ativas.map((h) => (
          <ItemHeuristica key={h.id} h={h} onAlternarFixada={alternarFixada} />
        ))}
      </section>

      {outras.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-soft">Superadas / arquivadas</h2>
          {outras.map((h) => (
            <ItemHeuristica key={h.id} h={h} onAlternarFixada={alternarFixada} />
          ))}
        </section>
      )}
    </main>
  );
}

function ItemHeuristica({
  h,
  onAlternarFixada,
}: {
  h: Heuristica;
  onAlternarFixada: (h: Heuristica) => void;
}) {
  return (
    <div
      className={`rounded border p-3 ${
        h.status === "ativa" ? "border-line bg-white/60" : "border-line bg-white/20"
      }`}
    >
      <p className="text-xs text-soft">{h.topicoNome}</p>
      <p className="text-sm text-ink">{h.texto}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-soft">
        <span>
          {ROTULO_STATUS[h.status]} · {h.tentativasEvidencia.length} evidência(s)
          {h.status === "ativa" && ` · ${h.acertosConsecutivosDesde}/5 acertos firmes seguidos`}
        </span>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={h.fixadaPeloUsuario}
            onChange={() => onAlternarFixada(h)}
          />
          fixar
        </label>
      </div>
    </div>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center text-ink">
      {children}
    </main>
  );
}
