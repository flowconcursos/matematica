"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gerarDesafio, DesafioCalculo } from "@/lib/calculo-rapido-engine";
import { MathFormula } from "@/components/MathText";

interface HistoricoItem {
  desafio: DesafioCalculo;
  respostaUsuario: string;
  acertou: boolean;
}

export default function AgilidadePage() {
  const [fase, setFase] = useState<"config" | "jogando" | "finalizado">("config");
  const [tempoEscolhido, setTempoEscolhido] = useState<number>(60);
  const [modalidade, setModalidade] = useState<string>("todas");

  const [tempoRestante, setTempoRestante] = useState<number>(60);
  const [desafioAtual, setDesafioAtual] = useState<DesafioCalculo | null>(null);
  const [resposta, setResposta] = useState<string>("");
  const [pontos, setPontos] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maiorCombo, setMaiorCombo] = useState<number>(0);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [feedbackVisual, setFeedbackVisual] = useState<"acerto" | "erro" | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Iniciar partida
  const iniciarJogo = () => {
    setTempoRestante(tempoEscolhido);
    setPontos(0);
    setCombo(0);
    setMaiorCombo(0);
    setHistorico([]);
    setResposta("");
    setDesafioAtual(gerarDesafio(modalidade));
    setFase("jogando");
  };

  // Timer do jogo
  useEffect(() => {
    if (fase !== "jogando") return;

    if (tempoRestante <= 0) {
      setFase("finalizado");
      return;
    }

    const timer = setInterval(() => {
      setTempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [fase, tempoRestante]);

  // Manter foco no input durante o jogo
  useEffect(() => {
    if (fase === "jogando") {
      inputRef.current?.focus();
    }
  }, [fase, desafioAtual]);

  // Submeter resposta
  const handleSubmeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desafioAtual || !resposta.trim()) return;

    const acertou = resposta.trim() === desafioAtual.respostaCorreta.trim();

    if (acertou) {
      const novoCombo = combo + 1;
      setCombo(novoCombo);
      if (novoCombo > maiorCombo) setMaiorCombo(novoCombo);
      setPontos((prev) => prev + 10 + novoCombo * 2);
      setFeedbackVisual("acerto");
    } else {
      setCombo(0);
      setFeedbackVisual("erro");
    }

    setHistorico((prev) => [
      ...prev,
      {
        desafio: desafioAtual,
        respostaUsuario: resposta.trim(),
        acertou,
      },
    ]);

    setResposta("");
    setDesafioAtual(gerarDesafio(modalidade));

    setTimeout(() => {
      setFeedbackVisual(null);
    }, 300);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      {/* Navegação superior */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          ← Voltar ao Hub Principal
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber">
          ⚡ Agilidade & Speed Math
        </span>
      </div>

      {/* 1. TELA DE CONFIGURAÇÃO */}
      {fase === "config" && (
        <div className="mt-8 space-y-8">
          <header>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FAF0ED] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red">
                Sem Calculadora
              </span>
              <span className="text-xs text-soft">· Treino de Velocidade de Concurso</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
              Academia de Cálculo Rápido
            </h1>
            <p className="mt-1.5 text-sm text-soft">
              Em provas de concurso, quem perde tempo fazendo conta no cantinho da folha é eliminado pelo relógio. Treine seus macetes mentais para resolver contas 3 vezes mais rápido.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Escolha do Tempo */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
              <h2 className="font-serif text-lg font-medium text-ink">1. Duração do Desafio</h2>
              <p className="mt-0.5 text-xs text-soft">Escolha o ritmo do seu treino de tiro rápido:</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTempoEscolhido(60)}
                  className={`rounded-lg border p-4 text-center transition-all ${
                    tempoEscolhido === 60
                      ? "border-ink bg-ink text-paper shadow-xs"
                      : "border-line bg-paper/40 text-ink hover:border-line-strong"
                  }`}
                >
                  <span className="block font-serif text-2xl font-normal">60s</span>
                  <span className="text-[11px] opacity-80">Tiro Rápido</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTempoEscolhido(120)}
                  className={`rounded-lg border p-4 text-center transition-all ${
                    tempoEscolhido === 120
                      ? "border-ink bg-ink text-paper shadow-xs"
                      : "border-line bg-paper/40 text-ink hover:border-line-strong"
                  }`}
                >
                  <span className="block font-serif text-2xl font-normal">120s</span>
                  <span className="text-[11px] opacity-80">Ritmo de Prova</span>
                </button>
              </div>
            </div>

            {/* Escolha da Modalidade */}
            <div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
              <h2 className="font-serif text-lg font-medium text-ink">2. Tipo de Macete</h2>
              <p className="mt-0.5 text-xs text-soft">Foque no seu ponto fraco ou treine todos misturados:</p>
              <div className="mt-3 space-y-2">
                {[
                  { id: "todas", label: "Misto (Todas as operações)" },
                  { id: "divisao5", label: "Divisão rápida por 5" },
                  { id: "mult11", label: "Multiplicação relâmpago por 11" },
                  { id: "porcentagem", label: "Porcentagens de cabeça" },
                  { id: "quadrado", label: "Quadrados perfeitos" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all ${
                      modalidade === item.id
                        ? "border-ink bg-paper font-semibold text-ink"
                        : "border-line bg-surface text-soft hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    <span>{item.label}</span>
                    <input
                      type="radio"
                      name="modalidade"
                      checked={modalidade === item.id}
                      onChange={() => setModalidade(item.id)}
                      className="hidden"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={iniciarJogo}
            className="w-full rounded-xl bg-ink py-4 text-center font-serif text-xl font-normal text-paper shadow-md transition-all hover:bg-[#262420] sm:text-2xl"
          >
            Começar Desafio de {tempoEscolhido} Segundos →
          </button>
        </div>
      )}

      {/* 2. TELA DE JOGO ATIVO */}
      {fase === "jogando" && desafioAtual && (
        <div className="mt-6 space-y-6">
          {/* Barra de Status (Cronômetro, Combo e Pontos) */}
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-6 py-4 shadow-xs">
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-soft">
                Tempo Restante
              </span>
              <span
                className={`font-serif text-3xl font-bold ${
                  tempoRestante <= 10 ? "text-red animate-pulse" : "text-ink"
                }`}
              >
                {tempoRestante}s
              </span>
            </div>

            <div className="text-center">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-soft">
                Sequência
              </span>
              <span className="inline-flex items-center gap-1 font-serif text-2xl font-bold text-amber">
                🔥 x{combo}
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-soft">
                Pontuação
              </span>
              <span className="font-serif text-3xl font-bold text-ink">{pontos} pts</span>
            </div>
          </div>

          {/* Card Principal da Expressão */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-8 sm:p-12 text-center shadow-md transition-colors duration-200 ${
              feedbackVisual === "acerto"
                ? "border-green bg-green/5"
                : feedbackVisual === "erro"
                ? "border-red bg-red/5"
                : "border-line bg-surface"
            }`}
          >
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-soft">
              {desafioAtual.tituloTipo}
            </span>

            <div className="my-6">
              <MathFormula
                formula={desafioAtual.expressao}
                block
                className="text-4xl sm:text-5xl font-serif text-ink"
              />
            </div>

            {/* Formulário de Resposta */}
            <form onSubmit={handleSubmeter} className="mx-auto max-w-xs space-y-3">
              <input
                ref={inputRef}
                type="number"
                step="any"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Sua resposta"
                className="w-full rounded-xl border-2 border-line bg-paper px-4 py-3 text-center text-2xl font-bold text-ink outline-none transition-all focus:border-ink focus:bg-surface focus:ring-2 focus:ring-ink"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-ink py-3 text-sm font-medium text-paper shadow-xs hover:bg-[#262420]"
              >
                Confirmar [Enter] ↵
              </button>
            </form>
          </div>

          {/* Dica rápida de macete */}
          <div className="rounded-lg border border-amber/20 bg-[#FCFBF7] p-3 text-center text-xs text-amber font-medium">
            💡 Dica de Ouro: {desafioAtual.macete}
          </div>
        </div>
      )}

      {/* 3. TELA DE RESULTADO FINAL */}
      {fase === "finalizado" && (
        <div className="mt-8 space-y-8">
          <header className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-soft">
              Desafio Concluído
            </span>
            <h1 className="mt-1 font-serif text-4xl font-normal text-ink">
              {pontos >= 150 ? "Velocidade de Elite! 🚀" : "Treino Finalizado! 🎯"}
            </h1>
            <p className="mt-1 text-sm text-soft">
              Você resolveu {historico.length} operações em {tempoEscolhido} segundos.
            </p>
          </header>

          {/* Resumo de Métricas */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface p-4 text-center shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-soft">
                Pontos
              </span>
              <strong className="mt-1 block font-serif text-3xl font-bold text-ink">
                {pontos}
              </strong>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4 text-center shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-soft">
                Acertos
              </span>
              <strong className="mt-1 block font-serif text-3xl font-bold text-green">
                {historico.filter((h) => h.acertou).length}/{historico.length}
              </strong>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4 text-center shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-soft">
                Maior Combo
              </span>
              <strong className="mt-1 block font-serif text-3xl font-bold text-amber">
                🔥 x{maiorCombo}
              </strong>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4 text-center shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-soft">
                Velocidade
              </span>
              <strong className="mt-1 block font-serif text-3xl font-bold text-ink">
                {Math.round((historico.length / (tempoEscolhido / 60)) * 10) / 10} <span className="text-xs font-normal text-soft">op/min</span>
              </strong>
            </div>
          </div>

          {/* Histórico e Macetes das Contas */}
          <div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
            <h2 className="font-serif text-xl font-medium text-ink">
              Raio-X do Treino & Macetes Rápidos
            </h2>
            <p className="mt-0.5 text-xs text-soft">
              Revise o pulo do gato das operações que você resolveu:
            </p>

            <div className="mt-4 divide-y divide-line">
              {historico.map((item, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.acertou ? "bg-green" : "bg-red"
                        }`}
                      />
                      <span className="font-serif text-base text-ink">
                        <MathFormula formula={item.desafio.expressao} /> ={" "}
                        <strong className="font-bold text-ink">
                          {item.desafio.respostaCorreta}
                        </strong>
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-soft">
                      ⚡ Macete: {item.desafio.macete} ({item.desafio.dicaPasso})
                    </p>
                  </div>
                  <div className="text-xs">
                    {item.acertou ? (
                      <span className="rounded bg-green/10 px-2 py-0.5 font-medium text-green">
                        Acertou
                      </span>
                    ) : (
                      <span className="rounded bg-red/10 px-2 py-0.5 font-medium text-red">
                        Digitou: {item.respostaUsuario || "vazio"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={iniciarJogo}
              className="flex-1 rounded-xl bg-ink py-3.5 text-center font-medium text-paper shadow-xs hover:bg-[#262420]"
            >
              Jogar Novamente ↺
            </button>
            <Link
              href="/"
              className="rounded-xl border border-line bg-surface px-6 py-3.5 text-center font-medium text-ink hover:bg-paper"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
