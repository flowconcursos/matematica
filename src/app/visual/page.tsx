"use client";

import { useState } from "react";
import Link from "next/link";
import { SIMULACOES } from "@/lib/simulacoes-data";
import { SimuladorFracaoPorcentagem } from "@/components/visual/SimuladorFracaoPorcentagem";
import { SimuladorRegraDeTres } from "@/components/visual/SimuladorRegraDeTres";
import { SimuladorVenn } from "@/components/visual/SimuladorVenn";
import { SimuladorFuncao } from "@/components/visual/SimuladorFuncao";

export default function VisualLabPage() {
  const [simulacaoAtivaId, setSimulacaoAtivaId] = useState<string>("fracoes-porcentagem");

  const simulacaoAtual = SIMULACOES.find((s) => s.id === simulacaoAtivaId) ?? SIMULACOES[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Navegação Superior */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          &larr; Voltar ao Hub Principal
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber font-mono">
          Laboratório Sensorial
        </span>
      </div>

      {/* Cabeçalho */}
      <header className="mt-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber">
            Aprendizado Acelerado
          </span>
          <span className="text-xs text-soft">&bull; Neurociência Aplicada</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
          Laboratório Visual Interativo
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-soft font-serif">
          O cérebro humano fixa relações matemáticas até 3x mais rápido quando enxerga o movimento e a geometria em vez de decorar fórmulas abstratas. Altere os valores, sinta as proporções e nunca mais caia em pegadinhas.
        </p>
      </header>

      {/* Seletor de Simulações (Cards de Abas) */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SIMULACOES.map((sim) => {
          const ativo = sim.id === simulacaoAtivaId;
          return (
            <button
              key={sim.id}
              onClick={() => setSimulacaoAtivaId(sim.id)}
              className={"flex flex-col justify-between rounded-xl border p-4 text-left transition-all " + (ativo ? "border-ink bg-surface shadow-md ring-1 ring-ink" : "border-line bg-surface/60 text-soft hover:border-line-strong hover:bg-surface")}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl">{sim.icone}</span>
                  <span className="text-[10px] font-mono uppercase text-soft">{sim.area}</span>
                </div>
                <h4 className={"mt-3 font-serif text-sm font-semibold " + (ativo ? "text-ink" : "text-soft")}>
                  {sim.titulo}
                </h4>
              </div>
              <span className={"mt-3 text-[11px] font-mono " + (ativo ? "font-bold text-amber" : "text-soft-light")}>
                {ativo ? "Visualizando Agora" : "Explorar &rarr;"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Banner de Dica Cognitiva da Simulação Atual */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber/30 bg-[#FDFBF7] p-4 text-xs font-serif text-soft">
        <span className="text-lg shrink-0">🧠</span>
        <div>
          <strong className="font-bold text-ink block font-sans text-xs">Por que isto funciona segundo a Neurociência:</strong>
          {simulacaoAtual.dicaNeuro}
        </div>
      </div>

      {/* Renderizador da Simulação Ativa */}
      <div className="mt-6">
        {simulacaoAtivaId === "fracoes-porcentagem" && <SimuladorFracaoPorcentagem />}
        {simulacaoAtivaId === "regra-de-tres" && <SimuladorRegraDeTres />}
        {simulacaoAtivaId === "diagrama-venn" && <SimuladorVenn />}
        {simulacaoAtivaId === "funcao-afim" && <SimuladorFuncao />}
      </div>

      {/* Atalhos Rápidos para Prática */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6">
        <div>
          <h4 className="font-serif text-lg font-normal text-ink">
            Agora fixe o conceito na prática!
          </h4>
          <p className="text-xs text-soft font-serif mt-0.5">
            Aplique o que você acabou de visualizar resolvendo questões reais de concursos públicos.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/jornada"
            className="rounded-xl border border-line bg-surface-alt px-4 py-2 text-xs font-mono font-medium text-ink hover:border-line-strong hover:bg-surface"
          >
            Trilha do Zero
          </Link>
          <Link
            href="/sessao"
            className="rounded-xl bg-ink px-4 py-2 text-xs font-mono font-medium text-paper hover:bg-[#2B2925]"
          >
            Resolver Questões &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
