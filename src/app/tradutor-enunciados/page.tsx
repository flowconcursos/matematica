"use client";

import { useState } from "react";
import Link from "next/link";
import { TERMOS_TRADUCAO, DESAFIOS_TRADUCAO } from "@/lib/tradutor-data";
import { MathFormula } from "@/components/MathText";

export default function TradutorEnunciadosPage() {
  const [abaAtiva, setAbaAtiva] = useState<"dicionario" | "desafios">("dicionario");
  const [buscaDicionario, setBuscaDicionario] = useState("");

  // Estado dos desafios
  const [desafioIndex, setDesafioIndex] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null);
  const [acertosDesafio, setAcertosDesafio] = useState(0);

  const termosFiltrados = TERMOS_TRADUCAO.filter((t) => {
    const termo = buscaDicionario.toLowerCase().trim();
    return (
      !termo ||
      t.expressaoPortugues.toLowerCase().includes(termo) ||
      t.exemploFrase.toLowerCase().includes(termo) ||
      t.dica.toLowerCase().includes(termo)
    );
  });

  const desafioAtual = DESAFIOS_TRADUCAO[desafioIndex];
  const acertouAtual = respostaSelecionada === desafioAtual?.opcaoCorreta;

  const handleEscolha = (opcao: string) => {
    if (respostaSelecionada !== null) return;
    setRespostaSelecionada(opcao);
    if (opcao === desafioAtual.opcaoCorreta) {
      setAcertosDesafio((prev) => prev + 1);
    }
  };

  const proximoDesafio = () => {
    setRespostaSelecionada(null);
    if (desafioIndex < DESAFIOS_TRADUCAO.length - 1) {
      setDesafioIndex((prev) => prev + 1);
    } else {
      setDesafioIndex(0);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Navegação superior */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          ← Voltar ao Hub Principal
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber">
          🗣️ Tradutor de Enunciados
        </span>
      </div>

      <header className="mt-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#FAF0ED] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red">
            Interpretação de Texto
          </span>
          <span className="text-xs text-soft">· Português para Álgebra</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
          Tradutor de Enunciados
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-soft">
          Mais de 70% dos concurseiros erram matemática não por falta de cálculo, mas porque não sabem transformar o texto da banca em equação. Aprenda a decodificar cada palavra-chave da prova.
        </p>
      </header>

      {/* Seletor de Abas */}
      <div className="mt-8 flex gap-3 border-b border-line pb-2">
        <button
          onClick={() => setAbaAtiva("dicionario")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
            abaAtiva === "dicionario"
              ? "bg-ink text-paper shadow-xs"
              : "border border-line bg-surface text-soft hover:border-line-strong hover:text-ink"
          }`}
        >
          📖 Dicionário de Termos (Português → Matemática)
        </button>
        <button
          onClick={() => setAbaAtiva("desafios")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
            abaAtiva === "desafios"
              ? "bg-ink text-paper shadow-xs"
              : "border border-line bg-surface text-soft hover:border-line-strong hover:text-ink"
          }`}
        >
          🎯 Academia de Tradução (Treinar Montagem)
        </button>
      </div>

      {/* ABA 1: DICIONÁRIO */}
      {abaAtiva === "dicionario" && (
        <section className="mt-6 space-y-6">
          <div className="relative">
            <input
              type="text"
              value={buscaDicionario}
              onChange={(e) => setBuscaDicionario(e.target.value)}
              placeholder="Buscar termo (ex: resulta em, dobro, de, razão, consecutivos, aumento)..."
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 pl-11 text-sm text-ink placeholder-soft/60 shadow-xs outline-none transition-all focus:border-ink focus:ring-1 focus:ring-ink"
            />
            <svg
              className="absolute left-3.5 top-3.5 h-4 w-4 text-soft"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {termosFiltrados.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-line bg-surface p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-line pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-soft">
                      No Português da Banca:
                    </span>
                    <h3 className="font-serif text-base font-semibold text-ink">
                      &ldquo;{t.expressaoPortugues}&rdquo;
                    </h3>
                  </div>
                  <div className="rounded-lg bg-paper px-3 py-1.5 text-center font-bold text-ink border border-line shrink-0">
                    <span className="text-[10px] text-soft block">Vira:</span>
                    <MathFormula formula={t.traducaoMatematica} />
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="rounded bg-paper/40 p-2.5">
                    <span className="text-soft block text-[11px]">Exemplo na prova:</span>
                    <strong className="text-ink">&ldquo;{t.exemploFrase}&rdquo;</strong>
                    <div className="mt-1 text-green font-semibold">
                      Montagem: {t.exemploEquacao}
                    </div>
                  </div>
                  <p className="text-soft text-[11px] leading-relaxed">
                    💡 <strong>Dica de ouro:</strong> {t.dica}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ABA 2: ACADEMIA DE TRADUÇÃO */}
      {abaAtiva === "desafios" && desafioAtual && (
        <section className="mt-6 space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-6 py-3 text-xs shadow-xs">
            <span className="text-soft">
              Desafio <strong>{desafioIndex + 1}</strong> de {DESAFIOS_TRADUCAO.length}
            </span>
            <span className="text-amber font-semibold">
              Banca: {desafioAtual.bancaOrigem}
            </span>
            <span className="text-green font-semibold">
              Acertos: {acertosDesafio}
            </span>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-soft">
                Frase Original da Questão de Concurso:
              </span>
              <blockquote className="mt-2 rounded-xl border-l-4 border-ink bg-paper/50 p-5 font-serif text-lg text-ink sm:text-xl leading-relaxed">
                &ldquo;{desafioAtual.fraseConcurso}&rdquo;
              </blockquote>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-soft">
                Como você traduz essa frase para uma equação matemática correta?
              </span>

              <div className="grid gap-2.5">
                {desafioAtual.opcoes.map((opcao) => {
                  const selecionada = respostaSelecionada === opcao;
                  const correta = opcao === desafioAtual.opcaoCorreta;

                  let estilo = "border-line bg-paper/20 hover:border-line-strong hover:bg-surface text-ink";
                  if (respostaSelecionada !== null) {
                    if (correta) {
                      estilo = "border-green bg-green/10 text-green font-bold";
                    } else if (selecionada) {
                      estilo = "border-red bg-red/10 text-red";
                    } else {
                      estilo = "border-line opacity-40 text-soft";
                    }
                  }

                  return (
                    <button
                      key={opcao}
                      type="button"
                      disabled={respostaSelecionada !== null}
                      onClick={() => handleEscolha(opcao)}
                      className={`rounded-xl border p-4 text-left font-serif text-base transition-all ${estilo}`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explicação da Tradução */}
            {respostaSelecionada !== null && (
              <div
                className={`rounded-xl p-5 text-xs space-y-2 ${
                  acertouAtual
                    ? "border border-green/20 bg-green/5 text-green"
                    : "border border-red/20 bg-red/5 text-red"
                }`}
              >
                <div className="font-bold text-sm">
                  {acertouAtual ? "✓ Tradução Perfeita!" : "✗ Tradução Incorreta!"}
                </div>
                <p className="text-ink/90 leading-relaxed text-xs">
                  {desafioAtual.explicacaoPassoAPasso}
                </p>

                <button
                  onClick={proximoDesafio}
                  className="mt-3 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-[#262420]"
                >
                  {desafioIndex < DESAFIOS_TRADUCAO.length - 1 ? "Próxima Frase →" : "Recomeçar Academia ↺"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Rodapé */}
      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-soft">
        <p>Flow Concursos · Método de Interpretação e Tradução Matemática</p>
      </footer>
    </main>
  );
}
