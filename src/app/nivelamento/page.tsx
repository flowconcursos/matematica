"use client";

import { useState } from "react";
import Link from "next/link";
import { QUESTOES_NIVELAMENTO } from "@/lib/nivelamento-data";

export default function NivelamentoPage() {
  const [respostas, setRespostas] = useState<{ [key: number]: number }>({});
  const [finalizado, setFinalizado] = useState(false);

  const handleSelect = (questaoId: number, opcaoIdx: number) => {
    if (finalizado) return;
    setRespostas((prev) => ({ ...prev, [questaoId]: opcaoIdx }));
  };

  const handleFinalizar = () => {
    setFinalizado(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReiniciar = () => {
    setRespostas({});
    setFinalizado(false);
  };

  const totalRespondidas = Object.keys(respostas).length;
  const podeFinalizar = totalRespondidas === QUESTOES_NIVELAMENTO.length;

  const questoesCorretas = QUESTOES_NIVELAMENTO.filter(
    (q) => respostas[q.id] === q.respostaCorreta
  );
  const acertos = questoesCorretas.length;
  const percentual = Math.round((acertos / QUESTOES_NIVELAMENTO.length) * 100);

  // Determinar módulo recomendado baseado nos erros
  const modulosComErro = QUESTOES_NIVELAMENTO
    .filter((q) => respostas[q.id] !== undefined && respostas[q.id] !== q.respostaCorreta)
    .map((q) => q.moduloRecomendado);

  const menorModulo = modulosComErro.length > 0 ? Math.min(...modulosComErro) : 5;

  const moduloNomes: { [key: number]: { nome: string; desc: string } } = {
    0: { nome: "Nível 0: Operações Básicas & Jogo de Sinais", desc: "Solidifique as bases de sinais, frações e vírgula." },
    1: { nome: "Nível 1: Porcentagem & Multiplicadores", desc: "Aprenda a calcular 10%, 1% e fatores sem sofrimento." },
    2: { nome: "Nível 2: Regra de Três sem Decoreba", desc: "Domine proporções diretas e inversas com lógica." },
    3: { nome: "Nível 3: Álgebra Básica & Equações do 1º Grau", desc: "Perca o medo da letra x e resolva problemas reais." },
    4: { nome: "Nível 4: Matemática Financeira Essencial", desc: "Domine juros simples e compostos para concursos." },
    5: { nome: "Nível 5: Geometria Plana Básica & Raciocínio Lógico", desc: "Áreas, perímetros e lógica para gabaritar." },
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-stone-900 selection:bg-amber-100 font-sans pb-20">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
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
                  Diagnóstico Inicial
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                  8 Questões
                </span>
              </div>
              <h1 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                Teste de Nivelamento & Raio-X de Lacunas
              </h1>
            </div>
          </div>
          {finalizado && (
            <button
              onClick={handleReiniciar}
              className="flex items-center gap-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <span>&#x21bb;</span> Refazer
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner introdutório ou Resultado */}
        {!finalizado ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0 text-xl font-bold">
                &#9678;
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-stone-900">
                  Descubra exatamente onde está a sua trava em Matemática
                </h2>
                <p className="font-serif text-sm text-stone-600 mt-1.5 leading-relaxed">
                  Não tente adivinhar por onde começar. Este teste rápido de 8 questões avalia desde o jogo de sinais até equações e porcentagem. No final, entregamos o seu <strong>Raio-X de Lacunas</strong> e apontamos o módulo ideal na Jornada do Zero para você não perder tempo com o que já sabe e nem patinar no que ainda falta.
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs font-mono text-stone-500">
                  <span>Respondidas: <strong className="text-stone-900">{totalRespondidas} de {QUESTOES_NIVELAMENTO.length}</strong></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-medium mb-2">
                  <span>&#10022;</span> Raio-X Diagnóstico Concluído
                </div>
                <h2 className="font-serif font-bold text-2xl text-stone-900">
                  Seu Desempenho: {acertos} de {QUESTOES_NIVELAMENTO.length} acertos ({percentual}%)
                </h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-mono font-black text-amber-600">
                  {percentual}%
                </span>
                <span className="block text-xs text-stone-400 font-mono">Índice de Base</span>
              </div>
            </div>

            {/* Recomendação de Rota */}
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-800 font-bold uppercase tracking-wider">
                <span>&#128214;</span> Ponto de Partida Recomendado
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-amber-950">
                  {moduloNomes[menorModulo]?.nome}
                </h3>
                <p className="font-serif text-sm text-amber-900/80 mt-1">
                  {moduloNomes[menorModulo]?.desc}
                </p>
              </div>
              <Link
                href="/jornada"
                className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs font-mono px-5 py-3 rounded-xl hover:bg-stone-800 transition-colors font-medium shadow"
              >
                Ir para a Jornada do Zero ao Gabarito &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Lista de Questões */}
        <div className="space-y-6">
          {QUESTOES_NIVELAMENTO.map((q, qIndex) => {
            const respostaDada = respostas[q.id];
            const isRespondida = respostaDada !== undefined;
            const isCorreta = respostaDada === q.respostaCorreta;

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-2xl p-6 transition-all ${
                  finalizado
                    ? isCorreta
                      ? "border-emerald-200 ring-1 ring-emerald-100"
                      : "border-rose-200 ring-1 ring-rose-100"
                    : "border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-mono text-xs flex items-center justify-center font-bold">
                      {qIndex + 1}
                    </span>
                    <span className="text-xs font-mono uppercase text-stone-500 tracking-wider">
                      {q.area}
                    </span>
                  </div>
                  {finalizado && (
                    <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
                      {isCorreta ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span className="font-bold">&#x2713;</span> Correto
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1">
                          <span className="font-bold">&#x2717;</span> Lacuna Detectada
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="font-serif text-base text-stone-900 leading-relaxed mb-4">
                  {q.pergunta}
                </p>

                <div className="space-y-2">
                  {q.opcoes.map((opcao, opIdx) => {
                    const isSelected = respostaDada === opIdx;
                    let style = "border-stone-200 hover:border-amber-400 bg-stone-50/50";

                    if (finalizado) {
                      if (opIdx === q.respostaCorreta) {
                        style = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium";
                      } else if (isSelected && !isCorreta) {
                        style = "border-rose-500 bg-rose-50 text-rose-950 line-through";
                      } else {
                        style = "border-stone-200 opacity-60";
                      }
                    } else if (isSelected) {
                      style = "border-amber-500 bg-amber-50/80 font-medium text-amber-950 ring-1 ring-amber-400";
                    }

                    return (
                      <button
                        key={opIdx}
                        disabled={finalizado}
                        onClick={() => handleSelect(q.id, opIdx)}
                        className={`w-full p-3.5 rounded-xl border text-left text-sm flex items-center gap-3 transition-all ${style}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-xs font-mono shrink-0">
                          {String.fromCharCode(65 + opIdx)}
                        </span>
                        <span className="font-serif">{opcao}</span>
                      </button>
                    );
                  })}
                </div>

                {finalizado && (
                  <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-serif leading-relaxed text-stone-700">
                    <strong className="font-mono text-stone-900 block mb-1">
                      EXPLICAÇÃO DIDÁTICA:
                    </strong>
                    {q.explicacao}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão de Finalizar */}
        {!finalizado && (
          <div className="sticky bottom-6 bg-white/90 backdrop-blur-md border border-stone-200 p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4">
            <div className="text-xs font-mono text-stone-600">
              {podeFinalizar ? (
                <span className="text-emerald-700 font-semibold">
                  Pronto! Todas as questões respondidas.
                </span>
              ) : (
                <span>Faltam {QUESTOES_NIVELAMENTO.length - totalRespondidas} questões para responder.</span>
              )}
            </div>
            <button
              disabled={!podeFinalizar}
              onClick={handleFinalizar}
              className={`px-6 py-3 rounded-xl font-mono text-xs font-bold transition-all ${
                podeFinalizar
                  ? "bg-amber-600 text-white hover:bg-amber-700 shadow"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              Ver Meu Raio-X & Diagnóstico &rarr;
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
