"use client";

import { useState } from "react";
import Link from "next/link";
import { PROBLEMAS_GUIADOS } from "@/lib/resolucao-guiada-data";
import { MathFormula } from "@/components/MathText";

export default function ResolucaoGuiadaPage() {
  const [problemaIdx, setProblemaIdx] = useState(0);
  const [degrauAtivo, setDegrauAtivo] = useState<1 | 2 | 3>(1);
  const [respostas, setRespostas] = useState<{ 1?: number; 2?: number; 3?: number }>({});
  const [mostrarDica, setMostrarDica] = useState(false);

  const problema = PROBLEMAS_GUIADOS[problemaIdx];

  const handleSelectOpcao = (degrau: 1 | 2 | 3, opcaoIdx: number) => {
    setRespostas((prev) => ({ ...prev, [degrau]: opcaoIdx }));
  };

  const handleAvancarDegrau = () => {
    if (degrauAtivo === 1) setDegrauAtivo(2);
    else if (degrauAtivo === 2) setDegrauAtivo(3);
    setMostrarDica(false);
  };

  const handleReiniciarProblema = () => {
    setDegrauAtivo(1);
    setRespostas({});
    setMostrarDica(false);
  };

  const handleMudarProblema = (idx: number) => {
    setProblemaIdx(idx);
    setDegrauAtivo(1);
    setRespostas({});
    setMostrarDica(false);
  };

  const d1Correto = respostas[1] === problema.degraus.degrau1.respostaCorreta;
  const d2Correto = respostas[2] === problema.degraus.degrau2.respostaCorreta;
  const d3Correto = respostas[3] === problema.degraus.degrau3.respostaCorreta;

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-stone-900 selection:bg-amber-100 font-sans pb-20">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors text-sm font-medium"
            >
              &larr; Voltar
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-mono text-amber-700 font-semibold">
                  Andaime Cognitivo
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                  3 Degraus
                </span>
              </div>
              <h1 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                Resolução Guiada de Questões
              </h1>
            </div>
          </div>
          <button
            onClick={handleReiniciarProblema}
            className="flex items-center gap-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <span>&#x21bb;</span> Reiniciar
          </button>
        </div>
      </header>

      {/* Explicação da Metodologia */}
      <section className="max-w-5xl mx-auto px-4 pt-6">
        <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl shadow-sm border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
              <span>&#10022;</span> Por que o método dos 3 degraus funciona?
            </div>
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl font-serif">
              90% dos erros em concursos não são de contas, e sim de interpretação e escolha de fórmula. Aqui nós dividimos qualquer questão em 3 etapas sucessivas:
              <strong className="text-white"> 1. Identificar Dados</strong> &rarr; 
              <strong className="text-white"> 2. Montar Estratégia</strong> &rarr; 
              <strong className="text-white"> 3. Executar Conta</strong>.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {PROBLEMAS_GUIADOS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => handleMudarProblema(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                  idx === problemaIdx
                    ? "bg-amber-500 text-stone-950 font-bold shadow"
                    : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                Q{idx + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Questão + Degraus */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Card do Enunciado */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                {problema.banca}
              </span>
              <span className="text-xs text-stone-500 font-sans">
                {problema.concurso}
              </span>
            </div>
            <span className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
              {problema.assunto}
            </span>
          </div>
          <p className="text-stone-800 font-serif text-lg leading-relaxed">
            {problema.enunciado}
          </p>
        </div>

        {/* Stepper dos 3 Degraus */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { n: 1, label: "Degrau 1", sub: "Filtrar & Interpretar" },
            { n: 2, label: "Degrau 2", sub: "Estratégia & Fórmula" },
            { n: 3, label: "Degrau 3", sub: "Cálculo & Resposta" },
          ].map((s) => {
            const isActive = degrauAtivo === s.n;
            const isCompleted =
              (s.n === 1 && degrauAtivo > 1) ||
              (s.n === 2 && degrauAtivo > 2) ||
              (s.n === 3 && d3Correto);

            return (
              <button
                key={s.n}
                onClick={() => {
                  if (s.n <= degrauAtivo || (s.n === 2 && d1Correto) || (s.n === 3 && d2Correto)) {
                    setDegrauAtivo(s.n as 1 | 2 | 3);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-sm"
                    : isCompleted
                    ? "bg-stone-50 border-stone-300 text-stone-600"
                    : "bg-stone-50/50 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                    {s.label}
                  </span>
                  {isCompleted && (
                    <span className="text-emerald-600 font-bold">&#x2713;</span>
                  )}
                </div>
                <div className="text-xs font-serif text-stone-900 mt-1 truncate">
                  {s.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Conteúdo do Degrau Ativo */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {degrauAtivo === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-700 uppercase tracking-widest font-semibold">
                    {problema.degraus.degrau1.titulo}
                  </span>
                  <button
                    onClick={() => setMostrarDica(!mostrarDica)}
                    className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-mono"
                  >
                    <span>&#128161;</span> {mostrarDica ? "Ocultar Dica" : "Ver Dica"}
                  </button>
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                  {problema.degraus.degrau1.pergunta}
                </h3>
              </div>

              {mostrarDica && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <span className="text-amber-600 shrink-0 text-base leading-none">&#128161;</span>
                  <div>
                    <span className="font-semibold font-mono">DICA DO PROFESSOR: </span>
                    {problema.degraus.degrau1.dica}
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                {problema.degraus.degrau1.opcoes.map((opcao, idx) => {
                  const isSelected = respostas[1] === idx;
                  const isCorrect = idx === problema.degraus.degrau1.respostaCorreta;
                  const showResult = respostas[1] !== undefined;

                  let borderStyle = "border-stone-200 hover:border-amber-400 bg-stone-50/50";
                  if (showResult) {
                    if (isSelected && isCorrect) borderStyle = "border-emerald-500 bg-emerald-50/50";
                    else if (isSelected && !isCorrect) borderStyle = "border-rose-500 bg-rose-50/50";
                    else if (isCorrect) borderStyle = "border-emerald-300 bg-emerald-50/20";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOpcao(1, idx)}
                      className={`w-full p-4 rounded-xl border text-left transition-all font-sans text-sm flex items-start gap-3 ${borderStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-stone-800 leading-relaxed font-serif">
                        {opcao}
                      </span>
                    </button>
                  );
                })}
              </div>

              {respostas[1] !== undefined && (
                <div
                  className={`p-4 rounded-xl border text-sm ${
                    d1Correto
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-rose-50 border-rose-200 text-rose-950"
                  }`}
                >
                  <p className="font-serif leading-relaxed">
                    {problema.degraus.degrau1.explicacao}
                  </p>
                  {d1Correto && (
                    <button
                      onClick={handleAvancarDegrau}
                      className="mt-4 flex items-center gap-2 bg-emerald-700 text-white font-mono text-xs px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
                    >
                      Subir para o Degrau 2 &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {degrauAtivo === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-amber-700 uppercase tracking-widest font-semibold">
                  {problema.degraus.degrau2.titulo}
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                  {problema.degraus.degrau2.pergunta}
                </h3>
              </div>

              <div className="space-y-2.5">
                {problema.degraus.degrau2.opcoes.map((opcao, idx) => {
                  const isSelected = respostas[2] === idx;
                  const isCorrect = idx === problema.degraus.degrau2.respostaCorreta;
                  const showResult = respostas[2] !== undefined;

                  let borderStyle = "border-stone-200 hover:border-amber-400 bg-stone-50/50";
                  if (showResult) {
                    if (isSelected && isCorrect) borderStyle = "border-emerald-500 bg-emerald-50/50";
                    else if (isSelected && !isCorrect) borderStyle = "border-rose-500 bg-rose-50/50";
                    else if (isCorrect) borderStyle = "border-emerald-300 bg-emerald-50/20";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOpcao(2, idx)}
                      className={`w-full p-4 rounded-xl border text-left transition-all font-sans text-sm flex items-start gap-3 ${borderStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-stone-800 leading-relaxed font-serif">
                        {opcao}
                      </span>
                    </button>
                  );
                })}
              </div>

              {respostas[2] !== undefined && (
                <div
                  className={`p-4 rounded-xl border text-sm ${
                    d2Correto
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-rose-50 border-rose-200 text-rose-950"
                  }`}
                >
                  <p className="font-serif leading-relaxed">
                    {problema.degraus.degrau2.explicacao}
                  </p>
                  {d2Correto && (
                    <div className="mt-3">
                      <div className="text-xs font-mono text-stone-600 mb-1">
                        FÓRMULA ARMADA:
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-stone-200 inline-block">
                        <MathFormula formula={problema.degraus.degrau2.formula} />
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={handleAvancarDegrau}
                          className="flex items-center gap-2 bg-emerald-700 text-white font-mono text-xs px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
                        >
                          Subir para o Degrau 3 &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {degrauAtivo === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-amber-700 uppercase tracking-widest font-semibold">
                  {problema.degraus.degrau3.titulo}
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                  {problema.degraus.degrau3.pergunta}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {problema.degraus.degrau3.opcoes.map((opcao, idx) => {
                  const isSelected = respostas[3] === idx;
                  const isCorrect = idx === problema.degraus.degrau3.respostaCorreta;
                  const showResult = respostas[3] !== undefined;

                  let borderStyle = "border-stone-200 hover:border-amber-400 bg-stone-50/50";
                  if (showResult) {
                    if (isSelected && isCorrect) borderStyle = "border-emerald-500 bg-emerald-50/50";
                    else if (isSelected && !isCorrect) borderStyle = "border-rose-500 bg-rose-50/50";
                    else if (isCorrect) borderStyle = "border-emerald-300 bg-emerald-50/20";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOpcao(3, idx)}
                      className={`p-4 rounded-xl border text-left transition-all font-sans text-sm flex items-center gap-3 ${borderStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-xs font-mono shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-stone-900 font-serif font-bold text-base">
                        {opcao}
                      </span>
                    </button>
                  );
                })}
              </div>

              {respostas[3] !== undefined && (
                <div
                  className={`p-5 rounded-xl border text-sm ${
                    d3Correto
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-rose-50 border-rose-200 text-rose-950"
                  }`}
                >
                  <div className="font-mono text-xs font-bold uppercase tracking-wider mb-1">
                    {d3Correto ? "Gabarito Conquistado! 🎉" : "Atenção ao cálculo"}
                  </div>
                  <p className="font-serif leading-relaxed">
                    {problema.degraus.degrau3.resolucaoDetalhada}
                  </p>

                  {d3Correto && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {problemaIdx < PROBLEMAS_GUIADOS.length - 1 ? (
                        <button
                          onClick={() => handleMudarProblema(problemaIdx + 1)}
                          className="flex items-center gap-1.5 bg-stone-900 text-white font-mono text-xs px-4 py-2.5 rounded-lg hover:bg-stone-800 transition-colors"
                        >
                          Próxima Questão Guiada ({problemaIdx + 2}/{PROBLEMAS_GUIADOS.length}) &rarr;
                        </button>
                      ) : (
                        <Link
                          href="/jornada"
                          className="flex items-center gap-1.5 bg-amber-600 text-white font-mono text-xs px-4 py-2.5 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Continuar na Jornada do Zero &rarr;
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
