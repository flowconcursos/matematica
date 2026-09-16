"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FORMULAS_DATA, FormulaItem } from "@/lib/formulas-data";
import { MathFormula, MathText } from "@/components/MathText";

type AreaFiltro = "todas" | FormulaItem["area"];

export default function FormularioPage() {
  const [busca, setBusca] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState<AreaFiltro>("todas");
  const [exemplosAbertos, setExemplosAbertos] = useState<Record<string, boolean>>({});

  const toggleExemplo = (id: string) => {
    setExemplosAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categorias = [
    { id: "todas", label: "Todas as Fórmulas" },
    { id: "aritmetica", label: "Aritmética & Frações" },
    { id: "proporcionalidade", label: "Porcentagem & Proporção" },
    { id: "financeira", label: "Matemática Financeira" },
    { id: "algebra", label: "Álgebra & Equações" },
    { id: "geometria", label: "Geometria Plana" },
    { id: "logica", label: "Lógica & Conjuntos" },
  ];

  const formulasFiltradas = useMemo(() => {
    return FORMULAS_DATA.filter((item) => {
      const correspondeArea = areaSelecionada === "todas" || item.area === areaSelecionada;
      const termo = busca.toLowerCase().trim();
      const correspondeBusca =
        !termo ||
        item.titulo.toLowerCase().includes(termo) ||
        item.descricao.toLowerCase().includes(termo) ||
        item.macete.toLowerCase().includes(termo) ||
        item.quandoUsar.toLowerCase().includes(termo) ||
        item.pegadinhaComum.toLowerCase().includes(termo);

      return correspondeArea && correspondeBusca;
    });
  }, [busca, areaSelecionada]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Navegação e Cabeçalho */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          ← Voltar ao Hub Principal
        </Link>
        <Link
          href="/sessao"
          className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-all hover:bg-[#262420]"
        >
          Praticar em Questões →
        </Link>
      </div>

      <header className="mt-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber">
            Guia Rápido de Bolso
          </span>
          <span className="text-xs text-soft">· Concursos de Nível Médio</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
          Formulário & Macetes de Ouro
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-soft">
          As 25 fórmulas indispensáveis para provas de nível médio (Caixa, BB, Correios, TJ-SP, PM, INSS), com métodos de resolução em poucos passos, o pulo do gato e as armadilhas mais comuns das bancas.
        </p>
      </header>

      {/* Barra de Pesquisa e Filtros */}
      <section className="mt-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fórmula, macete ou palavra-chave (ex: juros, borboleta, MANÉ, pitágoras, aumento)..."
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
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-3 top-3 text-xs text-soft hover:text-ink"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Pílulas de Categoria */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categorias.map((cat) => {
            const ativa = areaSelecionada === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setAreaSelecionada(cat.id as AreaFiltro)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  ativa
                    ? "bg-ink text-paper shadow-xs"
                    : "border border-line bg-surface text-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-soft">
          Exibindo <strong>{formulasFiltradas.length}</strong> {formulasFiltradas.length === 1 ? "fórmula" : "fórmulas"}
        </div>
      </section>

      {/* Grid de Fórmulas */}
      <div className="mt-6 space-y-6">
        {formulasFiltradas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface p-12 text-center">
            <p className="font-serif text-lg text-ink">Nenhuma fórmula encontrada para &ldquo;{busca}&rdquo;</p>
            <p className="mt-1 text-xs text-soft">Tente buscar por termos mais genéricos como &ldquo;juros&rdquo;, &ldquo;área&rdquo; ou &ldquo;fração&rdquo;.</p>
            <button
              onClick={() => { setBusca(""); setAreaSelecionada("todas"); }}
              className="mt-4 rounded-md border border-line bg-paper px-3 py-1.5 text-xs text-ink hover:bg-surface"
            >
              Ver todas as fórmulas
            </button>
          </div>
        ) : (
          formulasFiltradas.map((item) => {
            const exemploAberto = !!exemplosAbertos[item.id];

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs transition-all duration-200 hover:border-line-strong hover:shadow-sm"
              >
                {/* Cabeçalho do Card */}
                <div className="border-b border-line bg-paper/50 px-5 py-3 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-soft">
                      {item.categoriaLabel}
                    </span>
                    <span className="text-[11px] text-soft italic">
                      Uso frequente em bancas
                    </span>
                  </div>
                  <h2 className="mt-1 font-serif text-xl font-normal text-ink sm:text-2xl">
                    {item.titulo}
                  </h2>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {/* Bloco de Fórmula KaTeX */}
                  <div className="rounded-lg border border-line bg-paper/30 py-4 px-3 text-center">
                    <MathFormula formula={item.formula} block className="text-lg sm:text-xl text-ink font-semibold" />
                  </div>

                  {/* Descrição & Quando Usar */}
                  <div className="grid gap-4 text-xs sm:grid-cols-2">
                    <div className="rounded-lg border border-line bg-surface p-3.5">
                      <strong className="block font-semibold uppercase tracking-wider text-ink/80 text-[10px] mb-1">
                        Definição Rápida
                      </strong>
                      <p className="leading-relaxed text-soft">{item.descricao}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-surface p-3.5">
                      <strong className="block font-semibold uppercase tracking-wider text-ink/80 text-[10px] mb-1">
                        Quando Usar na Prova
                      </strong>
                      <p className="leading-relaxed text-soft">{item.quandoUsar}</p>
                    </div>
                  </div>

                  {/* O Pulo do Gato (Macete de Ouro) */}
                  <div className="rounded-lg border border-amber/30 bg-[#FCF9F2] p-4 text-xs">
                    <div className="flex items-center gap-2 text-amber font-semibold uppercase tracking-wider text-[11px]">
                      <span>⚡ O Pulo do Gato (Macete de Prova)</span>
                    </div>
                    <div className="mt-1.5 leading-relaxed text-ink/90 font-medium">
                      <MathText text={item.macete} />
                    </div>
                  </div>

                  {/* Exemplo Real Desdobrável */}
                  <div className="rounded-lg border border-line bg-surface">
                    <button
                      onClick={() => toggleExemplo(item.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-ink transition-colors hover:bg-paper/40"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-soft">📝 Exemplo Prático de Prova:</span>
                        <strong className="text-ink"><MathText text={item.exemplo.problema} /></strong>
                      </span>
                      <span className="text-soft transition-transform">
                        {exemploAberto ? "Ocultar ▲" : "Ver Resolução ▼"}
                      </span>
                    </button>

                    {exemploAberto && (
                      <div className="border-t border-line bg-paper/20 px-4 py-3.5 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-soft block mb-1">Resolução Passo a Passo:</span>
                          <div className="leading-relaxed text-ink">
                            <MathText text={item.exemplo.resolucao} />
                          </div>
                        </div>
                        <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                          <span className="text-soft">Gabarito Final:</span>
                          <span className="rounded bg-surface px-2.5 py-1 font-bold text-green border border-green/30">
                            <MathText text={item.exemplo.resposta} />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pegadinha Comum */}
                  <div className="flex items-start gap-2 rounded-lg border border-red/20 bg-[#FAF0ED] p-3 text-xs text-red">
                    <span className="shrink-0 font-bold">⚠️ Pegadinha da Banca:</span>
                    <span className="text-red/90 leading-relaxed"><MathText text={item.pegadinhaComum} /></span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Rodapé */}
      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-soft">
        <p>Flow Concursos · Formulário de Matemática & Raciocínio Lógico</p>
      </footer>
    </main>
  );
}
