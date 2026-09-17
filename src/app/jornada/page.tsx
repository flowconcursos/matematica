"use client";

import { useState } from "react";
import Link from "next/link";
import { MODULOS_JORNADA, ModuloJornada } from "@/lib/jornada-data";

export default function JornadaPage() {
  const [moduloAtivoIndex, setModuloAtivoIndex] = useState<number>(0);
  const [respostasUsuario, setRespostasUsuario] = useState<Record<string, string>>({});
  const [feedbackRevelado, setFeedbackRevelado] = useState<Record<string, boolean>>({});

  const modulo = MODULOS_JORNADA[moduloAtivoIndex];

  const responder = (perguntaId: string, opcao: string) => {
    setRespostasUsuario((prev) => ({ ...prev, [perguntaId]: opcao }));
    setFeedbackRevelado((prev) => ({ ...prev, [perguntaId]: true }));
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Barra de Navegação */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          ← Voltar ao Hub Principal
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber">
          🗺️ Do Zero ao Gabarito
        </span>
      </div>

      <header className="mt-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#FAF0ED] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red">
            Construção de Base
          </span>
          <span className="text-xs text-soft">· Passo a Passo Linear</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
          Jornada: Matemática do Zero ao Gabarito
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-soft">
          Sem jargões complicados e sem pular etapas. Uma trilha sequencial estruturada para tapar todos os buracos da escola e te dar a segurança necessária para passar em qualquer concurso de nível médio.
        </p>
      </header>

      {/* Trilha de Módulos (Stepper / Abas) */}
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {MODULOS_JORNADA.map((m, idx) => {
          const ativo = idx === moduloAtivoIndex;
          return (
            <button
              key={m.id}
              onClick={() => setModuloAtivoIndex(idx)}
              className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                ativo
                  ? "border-ink bg-surface shadow-md ring-1 ring-ink"
                  : "border-line bg-surface/60 text-soft hover:border-line-strong hover:bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber">
                  Nível {m.numero}
                </span>
                <span className="text-[10px] text-soft">{m.tempoEstimado}</span>
              </div>
              <h3 className="mt-1 font-serif text-xs font-medium text-ink line-clamp-2">
                {m.titulo}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Conteúdo do Módulo Ativo */}
      <article className="mt-8 space-y-8 rounded-2xl border border-line bg-surface p-6 sm:p-10 shadow-xs">
        {/* Cabeçalho do Módulo */}
        <div className="border-b border-line pb-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink">
              Módulo {modulo.numero} de 5
            </span>
            <span className="text-xs text-soft">Tempo estimado: {modulo.tempoEstimado}</span>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-normal text-ink sm:text-3xl">
            {modulo.titulo}
          </h2>
          <p className="mt-1 text-sm text-soft">{modulo.subtitulo}</p>

          <div className="mt-4 rounded-xl border border-amber/30 bg-[#FCFBF7] p-3.5 text-xs text-amber font-medium">
            💡 Princípio Fundamental: {modulo.conceitoChave}
          </div>
        </div>

        {/* 1. A Intuição */}
        <section className="space-y-2">
          <h3 className="font-serif text-xl font-normal text-ink flex items-center gap-2">
            <span>🌍 1. A Intuição do Mundo Real</span>
          </h3>
          <p className="rounded-xl border border-line bg-paper/30 p-5 text-sm leading-relaxed text-ink/90">
            {modulo.intuicao}
          </p>
        </section>

        {/* 2. O Mecanismo Passo a Passo */}
        <section className="space-y-3">
          <h3 className="font-serif text-xl font-normal text-ink flex items-center gap-2">
            <span>⚙️ 2. Como Funciona na Prática (Regras Claras)</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {modulo.mecanismo.map((regra, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-4 text-xs leading-relaxed text-soft shadow-2xs">
                <span className="font-bold text-ink block mb-1 text-[11px] uppercase tracking-wider">
                  Regra {i + 1}
                </span>
                <span className="text-ink/90">{regra}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Exemplos Resolvidos */}
        <section className="space-y-3">
          <h3 className="font-serif text-xl font-normal text-ink flex items-center gap-2">
            <span>📝 3. Pensando em Voz Alta (Exemplos Resolvidos)</span>
          </h3>
          <div className="space-y-3">
            {modulo.exemplosResolvidos.map((ex, i) => (
              <div key={i} className="rounded-xl border border-line bg-paper/20 p-4 text-xs space-y-2">
                <div className="font-serif text-sm font-semibold text-ink">
                  Exemplo {i + 1}: {ex.problema}
                </div>
                <div className="text-soft leading-relaxed">
                  <strong>Raciocínio:</strong> {ex.passoAPasso}
                </div>
                <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                  <span className="text-soft">Resultado:</span>
                  <span className="rounded bg-surface px-2.5 py-1 font-bold text-green border border-green/30">
                    {ex.conclusao}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Exercícios de Fixação */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div>
            <h3 className="font-serif text-xl font-normal text-ink">
              🎯 4. Fixação Imediata (Valide sua Aprendizagem)
            </h3>
            <p className="mt-0.5 text-xs text-soft">
              Responda as questões abaixo para confirmar o domínio deste módulo:
            </p>
          </div>

          <div className="space-y-6">
            {modulo.exerciciosFixacao.map((q, idx) => {
              const respostaDada = respostasUsuario[q.id];
              const revelado = feedbackRevelado[q.id];
              const acertou = respostaDada === q.respostaCorreta;

              return (
                <div key={q.id} className="rounded-xl border border-line bg-surface p-5 shadow-xs space-y-3">
                  <div className="font-serif text-sm text-ink font-medium">
                    Questão {idx + 1}: {q.pergunta}
                  </div>

                  {/* Opções */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.opcoes.map((opcao) => (
                      <button
                        key={opcao}
                        type="button"
                        onClick={() => responder(q.id, opcao)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-all ${
                          respostaDada === opcao
                            ? acertou
                              ? "border-green bg-green/10 text-green"
                              : "border-red bg-red/10 text-red"
                            : "border-line bg-paper/30 text-ink hover:border-line-strong hover:bg-surface"
                        }`}
                      >
                        {opcao}
                      </button>
                    ))}
                  </div>

                  {/* Feedback Explicativo */}
                  {revelado && (
                    <div
                      className={`rounded-lg p-3 text-xs leading-relaxed ${
                        acertou
                          ? "border border-green/20 bg-green/5 text-green"
                          : "border border-red/20 bg-red/5 text-red"
                      }`}
                    >
                      <strong>{acertou ? "✓ Exato! " : "✗ Não foi bem assim: "}</strong>
                      <span className="text-ink/80">{q.explicacao}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Botão de Avanço de Módulo */}
        <div className="flex items-center justify-between pt-6 border-t border-line">
          {moduloAtivoIndex > 0 ? (
            <button
              onClick={() => setModuloAtivoIndex(moduloAtivoIndex - 1)}
              className="rounded-lg border border-line bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-paper"
            >
              ← Módulo Anterior
            </button>
          ) : <div />}

          {moduloAtivoIndex < MODULOS_JORNADA.length - 1 ? (
            <button
              onClick={() => setModuloAtivoIndex(moduloAtivoIndex + 1)}
              className="rounded-lg bg-ink px-5 py-2.5 text-xs font-semibold text-paper shadow-sm hover:bg-[#262420]"
            >
              Avançar para o Próximo Módulo →
            </button>
          ) : (
            <Link
              href="/sessao"
              className="rounded-lg bg-green px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
            >
              🎉 Jornada Concluída! Ir para as Questões →
            </Link>
          )}
        </div>
      </article>

      {/* Rodapé */}
      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-soft">
        <p>Flow Concursos · Método Linear de Aprendizagem Matemática</p>
      </footer>
    </main>
  );
}
