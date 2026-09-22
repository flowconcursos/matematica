"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { MapaConhecimentoTree } from "@/components/visual/MapaConhecimentoTree";

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
  const [modoVisual, setModoVisual] = useState<"mapa" | "lista">("mapa");
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

  const listaTopicos = Array.isArray(topicos) ? topicos : [];
  const porId = new Map(listaTopicos.map((t) => [t.id, t]));

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
      <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8">
        <p className="text-soft font-mono">Carregando mapa cósmico de habilidades…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Link href="/" className="text-xs text-soft hover:text-ink transition-colors">
            ← Voltar ao Hub Principal
          </Link>
          <h1 className="text-2xl font-serif font-normal text-ink mt-1">
            Trilha de Conhecimento & Pré-Requisitos
          </h1>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex rounded-xl border border-line bg-surface-alt p-1">
            <button
              onClick={() => setModoVisual("mapa")}
              className={"px-3 py-1.5 text-xs font-medium rounded-lg transition-all " + (modoVisual === "mapa" ? "bg-surface font-semibold text-ink shadow-xs" : "text-soft hover:text-ink")}
            >
              🌌 Mapa Cósmico (Skill Tree)
            </button>
            <button
              onClick={() => setModoVisual("lista")}
              className={"px-3 py-1.5 text-xs font-medium rounded-lg transition-all " + (modoVisual === "lista" ? "bg-surface font-semibold text-ink shadow-xs" : "text-soft hover:text-ink")}
            >
              📋 Visão em Lista & Gestão
            </button>
          </div>
        </div>
      </header>

      {modoVisual === "mapa" && (
        <div>
          <MapaConhecimentoTree topicos={listaTopicos} />
        </div>
      )}

      {modoVisual === "lista" && (
        <section className="flex flex-col gap-3">
          <p className="text-xs text-soft font-serif">
            Um tópico só libera quando todos os seus pré-requisitos diretos estão firmes. O bloqueio evita que você tente resolver problemas complexos com lacunas na base.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {listaTopicos.map((t) => {
              const bloqueadores = t.prerequisitos
                .map((id) => porId.get(id))
                .filter((p): p is TopicoTrilha => !!p && p.dominio !== "firme");

              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-base font-normal text-ink">{t.nome}</p>
                      <p className="text-xs text-soft font-mono mt-0.5">
                        {t.area.replace("_", " ")} • Nível {t.nivelBase}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={"inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase " + (t.dominio === "firme" ? "bg-green/10 text-green" : t.dominio === "fragil" ? "bg-red/10 text-red" : "bg-amber/10 text-amber")}>
                        {ROTULO_DOMINIO[t.dominio]}
                      </span>
                      <p className={"text-xs font-mono mt-1 " + (t.liberado ? "text-green font-semibold" : "text-red")}>
                        {t.liberado ? "Liberado" : "Bloqueado"}
                        {t.liberadoManualmente && " (manual)"}
                      </p>
                    </div>
                  </div>

                  {!t.liberado && bloqueadores.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5 border-t border-line/60 pt-2.5 text-xs">
                      <p className="text-soft">
                        Bloqueado por: <strong>{bloqueadores.map((b) => b.nome).join(", ")}</strong>
                      </p>
                      <Link
                        href={"/trilha/relampago/" + bloqueadores[0].id}
                        className="self-start text-xs font-mono font-semibold text-amber hover:underline"
                      >
                        ⚡ Não concordo com o bloqueio (Teste)
                      </Link>
                    </div>
                  )}

                  {t.dominio === "fragil" && (
                    <div className="mt-3 border-t border-line/60 pt-2.5">
                      <Link
                        href={"/trilha/reforco/" + t.id}
                        className="text-xs font-mono font-semibold text-red hover:underline"
                      >
                        🎯 Reforçar este tópico agora
                      </Link>
                    </div>
                  )}

                  {t.prerequisitos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line/60 pt-2.5">
                      {t.prerequisitos.map((id) => {
                        const p = porId.get(id);
                        if (!p) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => removerPrerequisito(t.id, id)}
                            title="Remover pré-requisito"
                            className="rounded-lg border border-line bg-surface-alt px-2 py-1 text-[11px] font-mono text-soft hover:text-red hover:border-red"
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
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink mb-3 font-mono">
          Adicionar / Conectar Pré-requisito
        </h2>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <select
            value={origemId}
            onChange={(e) => setOrigemId(e.target.value)}
            className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-mono text-ink"
          >
            <option value="">Selecione o Tópico…</option>
            {listaTopicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <span className="self-center text-xs text-soft font-mono">depende de</span>
          <select
            value={dependeDeId}
            onChange={(e) => setDependeDeId(e.target.value)}
            className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-mono text-ink"
          >
            <option value="">Selecione o Pré-requisito…</option>
            {listaTopicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <button
            onClick={adicionarPrerequisito}
            disabled={salvandoAresta || !origemId || !dependeDeId}
            className="rounded-xl bg-ink px-4 py-2 text-xs font-mono font-semibold text-paper disabled:opacity-50 hover:bg-[#2B2925]"
          >
            Conectar Elo →
          </button>
        </div>
        {erroAresta && <p className="mt-2 text-xs font-mono text-red">{erroAresta}</p>}
      </section>
    </main>
  );
}
