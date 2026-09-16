"use client";

import { useState } from "react";
import Link from "next/link";
import { EDITAIS_CONCURSOS, EditalConcurso } from "@/lib/editais-data";

export default function EditaisPage() {
  const [editalSelecionado, setEditalSelecionado] = useState<EditalConcurso>(EDITAIS_CONCURSOS[0]);

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
          🎯 Editais Guiados
        </span>
      </div>

      <header className="mt-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#FAF0ED] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red">
            Mapeamento de Provas
          </span>
          <span className="text-xs text-soft">· Nível Médio</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
          Raio-X de Editais & Bancas
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-soft">
          Não estude às cegas. Cada banca examinadora tem um perfil e uma lista de pegadinhas prediletas. Escolha o seu concurso-alvo para entender os pesos reais e onde focar sua energia.
        </p>
      </header>

      {/* Seletor de Concursos (Abas) */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EDITAIS_CONCURSOS.map((edital) => {
          const selecionado = editalSelecionado.id === edital.id;
          return (
            <button
              key={edital.id}
              onClick={() => setEditalSelecionado(edital)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selecionado
                  ? "border-ink bg-surface shadow-md ring-1 ring-ink"
                  : "border-line bg-surface/60 text-soft hover:border-line-strong hover:bg-surface"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber">
                {edital.banca}
              </span>
              <h3 className="mt-1 font-serif text-base font-normal text-ink line-clamp-2">
                {edital.nomeConcurso}
              </h3>
              <span className="mt-2 block text-[11px] text-soft">
                {edital.orgao}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detalhes do Edital Selecionado */}
      <article className="mt-8 space-y-6">
        {/* Card Principal de Resumo */}
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink">
                  Banca: {editalSelecionado.banca}
                </span>
                <span className="text-xs text-soft">{editalSelecionado.anoReferencia}</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-normal text-ink sm:text-3xl">
                {editalSelecionado.nomeConcurso}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-soft">
                {editalSelecionado.descricao}
              </p>
            </div>

            <div className="shrink-0 flex sm:flex-col gap-2">
              <Link
                href="/sessao"
                className="rounded-lg bg-ink px-4 py-2.5 text-center text-xs font-medium text-paper shadow-xs hover:bg-[#262420]"
              >
                Treinar Questões →
              </Link>
              <Link
                href="/formulario"
                className="rounded-lg border border-line bg-paper px-4 py-2.5 text-center text-xs font-medium text-ink hover:bg-surface"
              >
                Ver Fórmulas 📖
              </Link>
            </div>
          </div>

          {/* Dica Estratégica da Banca */}
          <div className="mt-6 rounded-xl border border-amber/30 bg-[#FCFBF7] p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-amber text-[11px]">
              <span>💡 Dica de Estratégia de Prova</span>
            </div>
            <p className="mt-1.5 leading-relaxed text-ink/90 font-medium">
              {editalSelecionado.dicaEstrategica}
            </p>
          </div>

          {/* Distribuição de Conteúdo com Pesos */}
          <div className="mt-8">
            <h3 className="font-serif text-xl font-normal text-ink">
              Distribuição Estatística de Conteúdo
            </h3>
            <p className="mt-0.5 text-xs text-soft">
              Incidência média histórica nos últimos concursos dessa banca:
            </p>

            <div className="mt-4 space-y-4">
              {editalSelecionado.materias.map((m, idx) => (
                <div key={idx} className="rounded-lg border border-line bg-paper/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base text-ink font-medium">
                        {m.materia}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          m.peso === "critico"
                            ? "bg-red/10 text-red"
                            : m.peso === "alto"
                            ? "bg-amber/10 text-amber"
                            : "bg-soft/10 text-soft"
                        }`}
                      >
                        Peso {m.peso}
                      </span>
                    </div>
                    <span className="font-serif text-lg font-bold text-ink">
                      {m.porcentagem}%
                    </span>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-ink"
                      style={{ width: `${m.porcentagem}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-soft">
                    <strong>Como a banca cobra:</strong> {m.dicaBanca}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pegadinhas Clássicas */}
          <div className="mt-8 rounded-xl border border-red/20 bg-[#FAF0ED] p-5">
            <h4 className="font-serif text-lg font-normal text-red">
              ⚠️ Pegadinhas Clássicas que mais Reprovam nesta Banca
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs text-red/90 list-disc list-inside">
              {editalSelecionado.pegadinhasClassicas.map((pegadinha, i) => (
                <li key={i} className="leading-relaxed">
                  {pegadinha}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      {/* Rodapé */}
      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-soft">
        <p>Flow Concursos · Inteligência de Editais & Estatística de Bancas</p>
      </footer>
    </main>
  );
}
