"use client";

import { useState } from "react";
import Link from "next/link";
import { MathFormula, MathText } from "@/components/MathText";
import { MACETES_LEITURA, TERMOS_TRAPACEIROS, DESAFIOS_INTERPRETACAO } from "@/lib/macetes-data";

interface AnaliseIA {
  comandoReal: string;
  dadosEssenciais: string[];
  ruidosEDistracoes: string[];
  armadilhasEPegadinhas: string[];
  traducaoAlgebrica: {
    fraseTexto: string;
    expressaoMatematica: string;
  }[];
  puloDoGato: string;
  passoAPassoSugerido: string[];
}

const EXEMPLOS_PRONTOS = [
  {
    banca: "FGV",
    assunto: "Porcentagem & Sobra",
    enunciado: "Um comerciante comprou um lote de mercadorias. Ele vendeu 40% das mercadorias com 20% de lucro sobre o custo, e o restante com 10% de prejuízo sobre o custo. No total da operação, o comerciante teve lucro ou prejuízo, e de quanto por cento?",
  },
  {
    banca: "Cebraspe",
    assunto: "Regra de Três Inversa & Horas",
    enunciado: "Para pavimentar um trecho de rodovia de 12 km, 15 operários com a mesma capacidade de trabalho operando 8 horas por dia concluíram a obra em 20 dias. Se a equipe fosse reforçada com mais 5 operários trabalhando 6 horas por dia, em quantos dias pavimentariam o mesmo trecho?",
  },
  {
    banca: "Vunesp",
    assunto: "Problema de Idades e Equação",
    enunciado: "Em uma repartição pública, a soma das idades do chefe e de seu assistente é 70 anos. Há 10 anos, a idade do chefe era o triplo da idade do assistente. Qual é a idade atual do assistente?",
  }
];

export default function InterpretacaoPage() {
  const [abaAtiva, setAbaAtiva] = useState<"raiox" | "macetes" | "desafios">("raiox");

  // Estado do Raio-X com IA
  const [enunciado, setEnunciado] = useState("");
  const [banca, setBanca] = useState("FGV");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [analise, setAnalise] = useState<AnaliseIA | null>(null);

  // Estado dos Desafios
  const [desafioIdx, setDesafioIdx] = useState(0);
  const [respostaDesafio, setRespostaDesafio] = useState<number | null>(null);

  const handleCarregarExemplo = (ex: typeof EXEMPLOS_PRONTOS[0]) => {
    setEnunciado(ex.enunciado);
    setBanca(ex.banca);
    setAnalise(null);
    setErro(null);
  };

  const handleDissecarComIA = async () => {
    if (enunciado.trim().length < 15) {
      setErro("Por favor, cole um enunciado com pelo menos 15 caracteres.");
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/ia/interpretar-enunciado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enunciado: enunciado.trim(),
          banca,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.erro || "Falha ao analisar a questão.");
      }

      setAnalise(json.analise);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao conectar com a IA.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  const desafioAtual = DESAFIOS_INTERPRETACAO[desafioIdx];

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
                  Inteligência de Enunciados
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                  Raio-X com IA
                </span>
              </div>
              <h1 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                Central de Interpretação & Macetes
              </h1>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-mono">
            <button
              onClick={() => setAbaAtiva("raiox")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                abaAtiva === "raiox"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🔬 Raio-X com IA
            </button>
            <button
              onClick={() => setAbaAtiva("macetes")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                abaAtiva === "macetes"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              📖 Dicionário & Macetes
            </button>
            <button
              onClick={() => setAbaAtiva("desafios")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                abaAtiva === "desafios"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🎯 Treino Pré-Cálculo
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* ================= ABA 1: RAIO-X COM IA ================= */}
        {abaAtiva === "raiox" && (
          <div className="space-y-8">
            {/* Banner de Apresentação */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 mb-2">
                  <span>&#10022;</span> Análise Ponto a Ponto
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Cole qualquer questão: a IA disseca tudo antes de você fazer conta
                </h2>
                <p className="font-serif text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                  Não entregamos só a resposta pronta. A IA separa o <strong>Comando Real</strong>, filtra <strong>Dados vs Distrações</strong>, liga o <strong>Radar de Pegadinhas</strong>, traduz linha a linha para Álgebra e entrega o <strong>Pulo do Gato</strong>.
                </p>
              </div>
            </div>

            {/* Caixa de Entrada */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-stone-600">
                  <span>Banca Examinadora:</span>
                  <select
                    value={banca}
                    onChange={(e) => setBanca(e.target.value)}
                    className="border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="FGV">FGV</option>
                    <option value="Cebraspe">Cebraspe</option>
                    <option value="Vunesp">Vunesp</option>
                    <option value="FCC">FCC</option>
                    <option value="Cesgranrio">Cesgranrio</option>
                    <option value="Outra / Geral">Outra / Geral</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500">
                  <span>Testar com exemplos:</span>
                  {EXEMPLOS_PRONTOS.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleCarregarExemplo(ex)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 rounded border border-stone-200 text-stone-700 transition-colors"
                    >
                      {ex.banca}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={enunciado}
                  onChange={(e) => setEnunciado(e.target.value)}
                  placeholder="Cole aqui o texto da questão que você tem dificuldade de interpretar..."
                  className="w-full rounded-xl border border-stone-300 p-4 font-serif text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                />
              </div>

              {erro && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-serif text-rose-800 flex items-center justify-between">
                  <span>{erro}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-stone-400">
                  {enunciado.length} caracteres
                </span>
                <button
                  disabled={carregando || enunciado.trim().length < 15}
                  onClick={handleDissecarComIA}
                  className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow ${
                    carregando || enunciado.trim().length < 15
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                      : "bg-stone-900 text-white hover:bg-stone-800"
                  }`}
                >
                  {carregando ? "Dissecando com IA..." : "🔬 Fazer Raio-X do Enunciado →"}
                </button>
              </div>
            </div>

            {/* Painel de Resultados do Raio-X */}
            {analise && (
              <div className="space-y-6">
                {/* 1. O Comando Real */}
                <div className="bg-white border-2 border-amber-400/80 rounded-2xl p-6 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                    <span>🎯 1. O Que a Banca Realmente Está Pedindo</span>
                  </div>
                  <p className="font-serif text-xl font-bold text-stone-900 leading-snug">
                    {analise.comandoReal}
                  </p>
                  <p className="text-xs font-serif text-stone-500">
                    Dica: Não perca tempo calculando grandezas intermediárias se a banca não pediu por elas.
                  </p>
                </div>

                {/* 2. Dados Essenciais vs Ruídos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dados Fundamentais */}
                  <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                      <span>✓ Dados Essenciais (Entram na Conta)</span>
                    </div>
                    <ul className="space-y-2 text-sm font-serif text-stone-800">
                      {analise.dadosEssenciais.map((dado, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{dado}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ruídos e Distrações */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                      <span>✂️ Ruídos & Distrações da História</span>
                    </div>
                    <ul className="space-y-2 text-sm font-serif text-stone-500">
                      {analise.ruidosEDistracoes.map((ruido, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-stone-400">•</span>
                          <span>{ruido}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3. Radar de Pegadinhas */}
                {analise.armadilhasEPegadinhas.length > 0 && (
                  <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-800">
                      <span>⚠️ Radar de Pegadinhas e Armadilhas de Banca</span>
                    </div>
                    <ul className="space-y-2 text-sm font-serif text-rose-950">
                      {analise.armadilhasEPegadinhas.map((armadilha, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="text-rose-600 font-bold">!</span>
                          <span className="leading-relaxed">{armadilha}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. Tradução Linha a Linha: Português -> Álgebra */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-800">
                      <span>🗣️ 4. Tradução Português &rarr; Álgebra</span>
                    </div>
                    <span className="text-xs font-mono text-stone-400">Linha a linha</span>
                  </div>
                  <div className="space-y-3">
                    {analise.traducaoAlgebrica.map((trad, i) => (
                      <div key={i} className="p-3.5 bg-stone-50/70 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm font-serif text-stone-800 italic">
                          &ldquo;{trad.fraseTexto}&rdquo;
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-stone-900 font-mono text-sm self-start sm:self-auto shadow-xs">
                          <MathFormula formula={trad.expressaoMatematica} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. O Pulo do Gato (Macete de Prova) */}
                <div className="bg-stone-900 text-stone-100 border border-stone-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <span>💡 5. O Pulo do Gato & Macete de Resolução</span>
                  </div>
                  <p className="font-serif text-lg leading-relaxed text-stone-100 font-medium">
                    {analise.puloDoGato}
                  </p>
                  
                  {/* Roteiro de Ação */}
                  <div className="mt-4 pt-4 border-t border-stone-800">
                    <span className="text-xs font-mono uppercase text-stone-400 block mb-2">
                      Roteiro de Ação Recomendado:
                    </span>
                    <ol className="space-y-1.5 text-xs font-sans text-stone-300">
                      {analise.passoAPassoSugerido.map((passo, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-mono text-amber-400 font-bold">{i + 1}.</span>
                          <span>{passo}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 2: MACETES & DICIONÁRIO ================= */}
        {abaAtiva === "macetes" && (
          <div className="space-y-10">
            {/* Técnicas de Leitura Estratégica */}
            <section className="space-y-4">
              <div className="border-b border-stone-200 pb-2">
                <span className="text-xs font-mono text-amber-700 uppercase font-bold tracking-wider">
                  Metodologia Prática
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  As 4 Técnicas de Leitura Rápida do Concurseiro
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MACETES_LEITURA.map((macete) => (
                  <div
                    key={macete.id}
                    className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-2xl">{macete.icone}</span>
                        <h3 className="font-serif text-lg font-bold text-stone-900">
                          {macete.titulo}
                        </h3>
                      </div>
                      <p className="text-xs font-mono text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 mb-3">
                        {macete.resumo}
                      </p>
                      <ul className="space-y-1.5 text-xs font-serif text-stone-700">
                        {macete.comoAplicar.map((passo, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">→</span>
                            <span>{passo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-serif">
                      <strong className="font-mono text-[11px] text-stone-900 block mb-1 uppercase">
                        Exemplo de Prova:
                      </strong>
                      <p className="text-stone-600 italic mb-1.5">
                        &ldquo;{macete.exemploPratico.enunciado}&rdquo;
                      </p>
                      <p className="text-stone-900 font-medium bg-white p-2 rounded border border-stone-200">
                        {macete.exemploPratico.aplicacao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Dicionário de Termos Trapaceiros */}
            <section className="space-y-4">
              <div className="border-b border-stone-200 pb-2">
                <span className="text-xs font-mono text-rose-700 uppercase font-bold tracking-wider">
                  Cuidado Máximo
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Termos Trapaceiros que Mais Anulam Questões
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TERMOS_TRAPACEIROS.map((termo) => (
                  <div
                    key={termo.id}
                    className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3"
                  >
                    <div className="border-b border-stone-100 pb-2">
                      <span className="font-mono text-sm font-bold text-rose-700">
                        &ldquo;{termo.expressao}&rdquo;
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-serif">
                      <div>
                        <span className="text-stone-400 font-mono block">O que parece:</span>
                        <p className="text-stone-600 line-through">{termo.oQueParece}</p>
                      </div>

                      <div>
                        <span className="text-emerald-700 font-mono font-bold block">O que realmente significa:</span>
                        <p className="text-stone-900 font-medium">{termo.oQueRealmenteSignifica}</p>
                      </div>

                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900">
                        <span className="font-mono font-bold block text-[10px] uppercase">Dica de Mestre:</span>
                        <p>{termo.dicaMestre}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================= ABA 3: DESAFIOS PRÉ-CÁLCULO ================= */}
        {abaAtiva === "desafios" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                    {desafioAtual.banca}
                  </span>
                  <span className="text-xs text-stone-500 font-sans">
                    Desafio {desafioIdx + 1} de {DESAFIOS_INTERPRETACAO.length}
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                  Treino Sem Fazer Contas
                </span>
              </div>

              {/* Enunciado */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 mb-6">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block mb-1">
                  Texto da Prova:
                </span>
                <p className="font-serif text-stone-800 text-base leading-relaxed">
                  {desafioAtual.enunciado}
                </p>
              </div>

              {/* Pergunta Interpretativa */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {desafioAtual.perguntaInterpretativa}
                </h3>

                <div className="space-y-2.5">
                  {desafioAtual.opcoes.map((opcao, idx) => {
                    const isSelected = respostaDesafio === idx;
                    const isCorrect = idx === desafioAtual.respostaCorreta;
                    const respondido = respostaDesafio !== null;

                    let borderStyle = "border-stone-200 hover:border-amber-400 bg-white";
                    if (respondido) {
                      if (isSelected && isCorrect) borderStyle = "border-emerald-500 bg-emerald-50";
                      else if (isSelected && !isCorrect) borderStyle = "border-rose-500 bg-rose-50";
                      else if (isCorrect) borderStyle = "border-emerald-300 bg-emerald-50/30";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={respondido}
                        onClick={() => setRespostaDesafio(idx)}
                        className={`w-full p-4 rounded-xl border text-left text-sm flex items-start gap-3 transition-all ${borderStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-serif text-stone-900 leading-relaxed">
                          {opcao}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {respostaDesafio !== null && (
                  <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-serif leading-relaxed text-stone-800 space-y-3">
                    <div>
                      <strong className="font-mono text-stone-900 block mb-1 uppercase">
                        {respostaDesafio === desafioAtual.respostaCorreta ? "✓ Resposta Perfeita!" : "Atenção à Armadilha:"}
                      </strong>
                      <p>{desafioAtual.explicacaoDidatica}</p>
                    </div>

                    {desafioIdx < DESAFIOS_INTERPRETACAO.length - 1 && (
                      <button
                        onClick={() => {
                          setDesafioIdx(desafioIdx + 1);
                          setRespostaDesafio(null);
                        }}
                        className="px-4 py-2 bg-stone-900 text-white font-mono text-xs rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        Próximo Desafio Interpretativo &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
