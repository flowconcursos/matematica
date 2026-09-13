"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";

type Dominio = "nao_avaliado" | "fragil" | "em_construcao" | "firme";

type TopicoTrilha = {
  id: string;
  nome: string;
  area: string;
  nivelBase: number;
  dominio: Dominio;
  prerequisitos: string[];
  liberado: boolean;
  liberadoManualmente: boolean;
};

const ROTULO_DOMINIO: Record<Dominio, string> = {
  nao_avaliado: "Não avaliado",
  fragil: "Frágil",
  em_construcao: "Em construção",
  firme: "Firme",
};

const COR_DOMINIO: Record<Dominio, string> = {
  nao_avaliado: "text-soft",
  fragil: "text-red",
  em_construcao: "text-amber",
  firme: "text-green",
};

type Estado = TopicoTrilha[] | "carregando";

function reducer(_estado: Estado, novoEstado: Estado): Estado {
  return novoEstado;
}

export default function TrilhaPage() {
  const [topicos, dispatch] = useReducer(reducer, "carregando" as Estado);
  const [origemId, setOrigemId] = useState("");
  const [dependeDeId, setDependeDeId] = useState("");
  const [erroAresta, setErroAresta] = useState<string | null>(null);
  const [salvandoAresta, setSalvandoAresta] = useState(false);

  const carregar = useCallback(async () => {
    const resposta = await fetch("/api/trilha");
    dispatch(await resposta.json());
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const porId = new Map((Array.isArray(topicos) ? topicos : []).map((t) => [t.id, t]));

  async function adicionarPrerequisito() {
    if (!origemId || !dependeDeId) return;
    setSalvandoAresta(true);
    setErroAresta(null);

    const resposta = await fetch("/api/prerequisitos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicoId: origemId, dependeDeTopicoId: dependeDeId }),
    });

    setSalvandoAresta(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErroAresta(corpo?.erro ?? "Não foi possível salvar.");
      return;
    }

    setOrigemId("");
    setDependeDeId("");
    await carregar();
  }

  async function removerPrerequisito(topicoId: string, dependeDeTopicoId: string) {
    await fetch("/api/prerequisitos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicoId, dependeDeTopicoId }),
    });
    await carregar();
  }

  if (topicos === "carregando") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-8">
        <p className="text-soft">Carregando trilha…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Trilha de base</h1>
        <Link href="/" className="text-sm text-soft underline">
          Voltar
        </Link>
      </header>

      <p className="text-sm text-soft">
        Um tópico só libera quando todos os seus pré-requisitos diretos
        estão firmes. O bloqueio é a função principal desta trilha.
      </p>

      <section className="flex flex-col gap-2">
        {topicos.map((t) => {
          const bloqueadores = t.prerequisitos
            .map((id) => porId.get(id))
            .filter((p): p is TopicoTrilha => !!p && p.dominio !== "firme");

          return (
            <div
              key={t.id}
              className="rounded border border-line bg-white/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-ink">{t.nome}</p>
                  <p className="text-xs text-soft">
                    {t.area} · nível base {t.nivelBase}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${COR_DOMINIO[t.dominio]}`}>
                    {ROTULO_DOMINIO[t.dominio]}
                  </p>
                  <p className={`text-xs ${t.liberado ? "text-green" : "text-red"}`}>
                    {t.liberado ? "Liberado" : "Bloqueado"}
                    {t.liberadoManualmente && " (manual)"}
                  </p>
                </div>
              </div>

              {!t.liberado && bloqueadores.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 border-t border-line pt-2 text-sm">
                  <p className="text-soft">
                    Bloqueado por:{" "}
                    {bloqueadores.map((b) => b.nome).join(", ")}
                  </p>
                  <Link
                    href={`/trilha/relampago/${bloqueadores[0].id}`}
                    className="self-start text-sm text-ink underline"
                  >
                    Não concordo com o bloqueio
                  </Link>
                </div>
              )}

              {t.dominio === "fragil" && (
                <div className="mt-2 border-t border-line pt-2">
                  <Link
                    href={`/trilha/reforco/${t.id}`}
                    className="text-sm text-ink underline"
                  >
                    Reforçar este tópico
                  </Link>
                </div>
              )}

              {t.prerequisitos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 border-t border-line pt-2">
                  {t.prerequisitos.map((id) => {
                    const p = porId.get(id);
                    if (!p) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => removerPrerequisito(t.id, id)}
                        title="Remover pré-requisito"
                        className="rounded border border-line px-2 py-1 text-xs text-soft"
                      >
                        depende de {p.nome} ×
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="rounded border border-line bg-white/60 p-3">
        <h2 className="mb-2 text-sm font-semibold text-ink">
          Adicionar pré-requisito
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={origemId}
            onChange={(e) => setOrigemId(e.target.value)}
            className="flex-1 rounded border border-line px-2 py-2 text-sm"
          >
            <option value="">Tópico…</option>
            {topicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <span className="self-center text-sm text-soft">depende de</span>
          <select
            value={dependeDeId}
            onChange={(e) => setDependeDeId(e.target.value)}
            className="flex-1 rounded border border-line px-2 py-2 text-sm"
          >
            <option value="">Pré-requisito…</option>
            {topicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <button
            onClick={adicionarPrerequisito}
            disabled={salvandoAresta || !origemId || !dependeDeId}
            className="rounded bg-ink px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>
        {erroAresta && <p className="mt-2 text-sm text-red">{erroAresta}</p>}
      </section>
    </main>
  );
}
