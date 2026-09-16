"use client";

import Link from "next/link";
import { FORMULAS_DATA } from "@/lib/formulas-data";
import { MathFormula, MathText } from "@/components/MathText";

export default function RevisaoVesperaPage() {
  // Selecionar as 10 fórmulas de maior peso para a véspera
  const formulasVespera = FORMULAS_DATA.slice(0, 10);

  const imprimir = () => {
    window.print();
  };

  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-4 py-8 sm:px-8 print:p-0 print:max-w-none">
      {/* Barra de Ações (Oculta na Impressão) */}
      <div className="flex items-center justify-between border-b border-line pb-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          ← Voltar ao Hub Principal
        </Link>
        <button
          onClick={imprimir}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-paper shadow-sm transition-all hover:bg-[#262420]"
        >
          <span>🖨️</span>
          <span>Imprimir / Salvar em PDF</span>
        </button>
      </div>

      {/* Cabeçalho Oficial da Folha */}
      <header className="mt-6 border-b-2 border-ink pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-soft">
              Flow Concursos · Material Oficial de Revisão
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink print:text-2xl">
              Folha de Véspera: Matemática & Raciocínio Lógico
            </h1>
            <p className="mt-1 text-xs text-soft">
              Resumo executivo de fórmulas essenciais, macetes e gatilhos de pegadinha para revisão na porta da prova.
            </p>
          </div>
          <div className="hidden sm:block text-right text-[11px] text-soft print:block">
            <span>Nível Médio</span>
            <span className="block font-semibold text-ink">Edição 2026</span>
          </div>
        </div>
      </header>

      {/* 1. CHECKLIST DE ESTRATÉGIA NO DIA DA PROVA */}
      <section className="mt-6 rounded-xl border border-amber/40 bg-[#FCFBF7] p-4 text-xs print:border print:border-line print:bg-transparent">
        <h2 className="font-serif text-base font-bold text-ink">
          🎯 Protocolo dos 3 Minutos: Como Administrar a Prova de Matemática
        </h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-3 print:grid-cols-3">
          <div className="rounded border border-line bg-surface p-2.5">
            <strong className="block font-bold text-ink text-[11px]">1ª Rodada (As Fáceis)</strong>
            <p className="text-soft text-[11px] mt-0.5">Faça primeiro as questões de regra de três simples, porcentagem direta e leitura de gráficos. Garanta os pontos rápidos.</p>
          </div>
          <div className="rounded border border-line bg-surface p-2.5">
            <strong className="block font-bold text-ink text-[11px]">2ª Rodada (Cálculos Longos)</strong>
            <p className="text-soft text-[11px] mt-0.5">Juros compostos e sistemas lineares. Se passar de 3 minutos em uma conta com vírgula, pule e volte no final.</p>
          </div>
          <div className="rounded border border-line bg-surface p-2.5">
            <strong className="block font-bold text-ink text-[11px]">Eliminação por Estimativa</strong>
            <p className="text-soft text-[11px] mt-0.5">Olhe sempre o dígito final do produto e descarte as alternativas com ordens de grandeza absurdas antes de fazer a conta toda.</p>
          </div>
        </div>
      </section>

      {/* 2. TABELA DAS 10 FÓRMULAS ESSENCIAIS */}
      <section className="mt-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-ink border-b border-line pb-1">
          📐 Top 10 Fórmulas Críticas de Nível Médio
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {formulasVespera.map((f, i) => (
            <div
              key={f.id}
              className="rounded-lg border border-line bg-surface p-3.5 text-xs shadow-2xs print:border print:shadow-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-ink text-sm">
                  {i + 1}. {f.titulo}
                </span>
                <span className="text-[10px] uppercase font-semibold text-soft">
                  {f.categoriaLabel}
                </span>
              </div>

              <div className="my-2 rounded bg-paper/50 py-1.5 px-2 text-center">
                <MathFormula formula={f.formula} block className="text-sm font-semibold text-ink" />
              </div>

              <p className="text-soft text-[11px] leading-relaxed">
                ⚡ <strong>Macete:</strong> <MathText text={f.macete} />
              </p>

              <div className="mt-1.5 text-[11px] text-red font-medium">
                ⚠️ <strong>Atenção:</strong> <MathText text={f.pegadinhaComum} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. QUADRO DE MACETES RÁPIDOS */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-4 text-xs print:mt-4">
        <h2 className="font-serif text-base font-bold text-ink">
          ⚡ Macetes de Cálculo Rápido para não Perder Tempo
        </h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 list-disc list-inside text-soft text-[11px]">
          <li><strong>Dividir por 5:</strong> Dobre o número e divida por 10 (ex: 180 ÷ 5 → 360 → 36).</li>
          <li><strong>Multiplicar por 11:</strong> Abra os dígitos e some no meio (ex: 25 × 11 = 2[2+5]5 = 275).</li>
          <li><strong>Terno de Pitágoras 3-4-5:</strong> Se os catetos forem múltiplos de 3 e 4, a hipotenusa é o múltiplo de 5 (6-8-10, 9-12-15).</li>
          <li><strong>Regra do MANÉ:</strong> Negação de &ldquo;Se P, então Q&rdquo; = Mantém a primeira E Nega a segunda.</li>
          <li><strong>Descontos sucessivos:</strong> 10% + 20% NÃO é 30%. Multiplique os fatores: 0,90 × 0,80 = 0,72 (28% de desconto).</li>
        </ul>
      </section>

      {/* Rodapé da Folha */}
      <footer className="mt-8 border-t border-line pt-4 text-center text-[10px] text-soft print:mt-4">
        <p>Flow Concursos · Treino de Alto Rendimento em Matemática · Boa prova!</p>
      </footer>
    </main>
  );
}
