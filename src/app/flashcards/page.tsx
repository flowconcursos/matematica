"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FLASHCARDS_MESTRES, Flashcard } from "@/lib/flashcards-data";
import {
  carregarProgressoCards,
  registrarRevisaoCard,
  CardProgresso,
  ClassificacaoCard,
} from "@/lib/flashcards-storage";

export default function FlashcardsPage() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isVirado, setIsVirado] = useState<boolean>(false);
  const [progressoMap, setProgressoMap] = useState<Record<string, CardProgresso>>({});

  useEffect(() => {
    setProgressoMap(carregarProgressoCards());
  }, []);

  const cardsFiltrados = FLASHCARDS_MESTRES.filter((c) =>
    categoriaFiltro === "todas" ? true : c.categoria === categoriaFiltro
  );

  const cardAtual: Flashcard | undefined = cardsFiltrados[cardIndex] ?? cardsFiltrados[0];
  const progressoAtual = cardAtual ? progressoMap[cardAtual.id] : undefined;

  const virarCard = () => {
    setIsVirado((prev) => !prev);
  };

  const proximoCard = () => {
    setIsVirado(false);
    setCardIndex((prev) => (prev + 1) % cardsFiltrados.length);
  };

  const cardAnterior = () => {
    setIsVirado(false);
    setCardIndex((prev) => (prev - 1 + cardsFiltrados.length) % cardsFiltrados.length);
  };

  const responder = (classificacao: ClassificacaoCard) => {
    if (!cardAtual) return;
    const atualizado = registrarRevisaoCard(cardAtual.id, classificacao);
    setProgressoMap((prev) => ({ ...prev, [cardAtual.id]: atualizado }));
    proximoCard();
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      {/* Navegação Superior */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          &larr; Voltar ao Hub Principal
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-purple font-mono">
          🃏 Repetição Espaçada 3D
        </span>
      </div>

      {/* Cabeçalho */}
      <header className="mt-6 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="rounded-full bg-purple/10 border border-purple/20 px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-purple">
            Fixação Mnemônica
          </span>
          <span className="text-xs text-soft font-mono">Curva de Ebbinghaus</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
          Flashcards 3D: Fórmulas & Macetes de Banca
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-soft font-serif">
          Gire o cartão para testar sua memória ativa. Classifique sua facilidade para que o algoritmo de repetição espaçada agende a próxima revisão antes do esquecimento.
        </p>
      </header>

      {/* Filtros de Categoria */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center sm:justify-start">
        {[
          { id: "todas", label: "✨ Todos os Cards" },
          { id: "rlm_conectivos", label: "🧠 RLM & Conectivos" },
          { id: "porcentagem_juros", label: "💰 Porcentagem & Juros" },
          { id: "geometria", label: "📐 Geometria Plana" },
          { id: "regras_sinais", label: "➕ Regras de Sinais" },
          { id: "pegadinhas_bancas", label: "⚠️ Pegadinhas de Bancas" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoriaFiltro(cat.id);
              setCardIndex(0);
              setIsVirado(false);
            }}
            className={"rounded-xl px-3 py-1.5 text-xs font-mono transition-all " + (categoriaFiltro === cat.id ? "bg-ink font-semibold text-paper shadow-xs" : "border border-line bg-surface text-soft hover:border-line-strong hover:text-ink")}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Status da Fila */}
      <div className="mt-6 flex items-center justify-between text-xs font-mono text-soft px-1">
        <span>
          Card <strong>{cardIndex + 1}</strong> de <strong>{cardsFiltrados.length}</strong>
        </span>
        {progressoAtual && (
          <span className="flex items-center gap-1.5 text-purple font-semibold">
            <span>Nível de Fixação:</span>
            {"★".repeat(progressoAtual.nivel + 1)}
            {"☆".repeat(3 - progressoAtual.nivel)}
          </span>
        )}
      </div>

      {/* CARTÃO 3D FLIP */}
      {cardAtual && (
        <div className="mt-4 perspective-1000 w-full min-h-[360px]">
          <div
            onClick={virarCard}
            className={"relative w-full min-h-[360px] preserve-3d transition-transform duration-500 cursor-pointer " + (isVirado ? "rotate-y-180" : "")}
          >
            {/* FRENTE DO CARTÃO */}
            <div className="absolute inset-0 backface-hidden rounded-3xl border border-line bg-gradient-to-br from-[#FFFFFF] via-[#FAF9F5] to-[#F5F2EA] p-8 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-surface border border-line px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-soft shadow-2xs">
                  {cardAtual.tituloCategoria}
                </span>
                <span className="text-xs text-soft font-mono">Clique para virar ↻</span>
              </div>

              <div className="my-auto py-6 text-center">
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-ink leading-snug">
                  {cardAtual.frente}
                </h3>
                {cardAtual.dica && (
                  <p className="mt-4 text-xs font-serif italic text-amber bg-amber/10 inline-block px-3 py-1 rounded-full border border-amber/20">
                    💡 Dica de memória: {cardAtual.dica}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-soft-light pt-4 border-t border-line/60">
                <span>Cobrado em: {cardAtual.bancasMaisCobram ?? "Principais bancas"}</span>
                <span className="text-ink font-semibold">Toque para ver a resposta &rarr;</span>
              </div>
            </div>

            {/* VERSO DO CARTÃO (RESPOSTA & MNEMÔNICO) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border border-purple-200/80 bg-gradient-to-br from-[#FAF8FD] via-[#F6F2FC] to-[#F2EBFB] p-8 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple/15 border border-purple/30 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-purple">
                  Solução & Regra de Ouro
                </span>
                <span className="text-xs text-purple-700 font-mono">Girar de volta ↺</span>
              </div>

              <div className="my-auto py-4 text-center">
                <div className="font-serif text-lg sm:text-xl font-medium text-ink whitespace-pre-line leading-relaxed">
                  {cardAtual.verso}
                </div>
                {cardAtual.mnemonicoOuVisual && (
                  <div className="mt-4 rounded-xl border border-purple-300/60 bg-white/70 p-3 text-xs font-mono text-purple-900 shadow-xs">
                    <strong className="block text-[10px] uppercase tracking-wider text-purple-600 mb-0.5">
                      🔑 Mnemônico Mental:
                    </strong>
                    {cardAtual.mnemonicoOuVisual}
                  </div>
                )}
              </div>

              <div className="text-center text-[11px] font-mono text-purple-700/70 pt-3 border-t border-purple-200/60">
                Autoavaliação para agendamento de repetição:
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação e Classificação SRS */}
      {isVirado ? (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-xs font-mono text-soft">Como foi lembrar disso?</span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => responder("dificil")}
              className="flex-1 sm:flex-none rounded-xl border border-red/30 bg-[#FEF2F2] px-4 py-2.5 text-xs font-mono font-semibold text-red hover:bg-red/10 transition-colors"
            >
              ❌ Difícil (Rever Amanhã)
            </button>
            <button
              onClick={() => responder("bom")}
              className="flex-1 sm:flex-none rounded-xl border border-amber/30 bg-[#FFFBEB] px-4 py-2.5 text-xs font-mono font-semibold text-amber hover:bg-amber/10 transition-colors"
            >
              ⚡ Bom (+3 dias)
            </button>
            <button
              onClick={() => responder("facil")}
              className="flex-1 sm:flex-none rounded-xl border border-green/30 bg-[#ECFDF5] px-4 py-2.5 text-xs font-mono font-semibold text-green hover:bg-green/10 transition-colors"
            >
              🎯 Fácil (+10 dias)
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={cardAnterior}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-mono text-soft hover:border-line-strong hover:text-ink transition-colors"
          >
            &larr; Anterior
          </button>
          <button
            onClick={virarCard}
            className="rounded-xl bg-ink px-6 py-2 text-xs font-mono font-semibold text-paper hover:bg-[#2B2925] shadow-xs"
          >
            Virar Cartão ↻
          </button>
          <button
            onClick={proximoCard}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-mono text-soft hover:border-line-strong hover:text-ink transition-colors"
          >
            Próximo &rarr;
          </button>
        </div>
      )}
    </main>
  );
}
