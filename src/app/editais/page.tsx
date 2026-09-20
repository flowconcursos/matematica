"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EDITAIS_CONCURSOS, EditalConcurso } from "@/lib/editais-data";
import {
  CustomEdital,
  obterMeusEditais,
  salvarEdital,
  alternarTopicoConcluido,
  excluirEdital,
  obterEditalAtivoId,
  definirEditalAtivo,
} from "@/lib/meus-editais-storage";

export default function EditaisPage() {
  const [abaAtiva, setAbaAtiva] = useState<"oficiais" | "meus">("oficiais");

  // Editais Oficiais
  const [editalSelecionado, setEditalSelecionado] = useState<EditalConcurso>(EDITAIS_CONCURSOS[0]);

  // Editais Personalizados
  const [meusEditais, setMeusEditais] = useState<CustomEdital[]>([]);
  const [meuEditalSelecionadoId, setMeuEditalSelecionadoId] = useState<string | null>(null);

  // Form de Upload / Análise
  const [mostrarModalUpload, setMostrarModalUpload] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [textoEdital, setTextoEdital] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  useEffect(() => {
    const lista = obterMeusEditais();
    setMeusEditais(lista);
    const ativoId = obterEditalAtivoId();
    if (ativoId && lista.some((e) => e.id === ativoId)) {
      setMeuEditalSelecionadoId(ativoId);
    } else if (lista.length > 0) {
      setMeuEditalSelecionadoId(lista[0].id);
    }
  }, []);

  const handleUploadEdital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo && textoEdital.trim().length < 20) {
      setErroUpload("Selecione um arquivo PDF ou cole pelo menos 20 caracteres do edital.");
      return;
    }

    setAnalisando(true);
    setErroUpload(null);

    const formData = new FormData();
    if (arquivo) {
      formData.append("arquivo", arquivo);
    }
    if (textoEdital.trim()) {
      formData.append("texto", textoEdital.trim());
    }

    try {
      const res = await fetch("/api/edital/analisar", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.erro || "Falha ao analisar edital.");
      }

      const novoEdital = salvarEdital(json.edital);
      const listaAtualizada = obterMeusEditais();
      setMeusEditais(listaAtualizada);
      setMeuEditalSelecionadoId(novoEdital.id);
      setAbaAtiva("meus");
      setMostrarModalUpload(false);
      setArquivo(null);
      setTextoEdital("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao processar o edital.";
      setErroUpload(msg);
    } finally {
      setAnalisando(false);
    }
  };

  const handleToggleChecklist = (editalId: string, materiaNome: string) => {
    const editalAtualizado = alternarTopicoConcluido(editalId, materiaNome);
    if (editalAtualizado) {
      setMeusEditais(obterMeusEditais());
    }
  };

  const handleExcluirEdital = (id: string) => {
    if (confirm("Tem certeza que deseja remover este edital personalizado?")) {
      excluirEdital(id);
      const lista = obterMeusEditais();
      setMeusEditais(lista);
      setMeuEditalSelecionadoId(lista.length > 0 ? lista[0].id : null);
    }
  };

  const meuEditalAtual = meusEditais.find((e) => e.id === meuEditalSelecionadoId);
  const totalTopicos = meuEditalAtual?.materias.length ?? 0;
  const topicosConcluidos = meuEditalAtual?.materias.filter((m) => m.concluido).length ?? 0;
  const pctConcluido = totalTopicos > 0 ? Math.round((topicosConcluidos / totalTopicos) * 100) : 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8 font-sans">
      {/* Navegação superior */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
        >
          &larr; Voltar ao Hub Principal
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber font-mono">
          🎯 Editais & Bancas
        </span>
      </div>

      <header className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FAF0ED] border border-red/20 px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-red">
              Estratégia de Aprovação
            </span>
            <span className="text-xs text-soft font-mono">· Análise com IA</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
            Raio-X de Editais & Conteúdo Programático
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-soft font-serif">
            Estude com mira telescópica. Consulte o perfil das bancas mais concorridas do país ou suba o edital do seu próprio concurso para ter um plano de batalha com IA e checklist interativo.
          </p>
        </div>

        <button
          onClick={() => setMostrarModalUpload(true)}
          className="self-start sm:self-auto rounded-xl bg-ink px-4 py-2.5 text-xs font-mono font-semibold text-paper shadow-sm hover:bg-[#2B2925] hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <span>+</span> Subir Meu Edital (PDF ou Texto)
        </button>
      </header>

      {/* Seletor de Modo (Abas) */}
      <div className="mt-8 flex items-center gap-2 border-b border-line pb-2">
        <button
          onClick={() => setAbaAtiva("oficiais")}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            abaAtiva === "oficiais"
              ? "bg-white text-stone-900 font-bold shadow-xs border border-line"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          🏛️ Editais Oficiais Mapeados ({EDITAIS_CONCURSOS.length})
        </button>
        <button
          onClick={() => setAbaAtiva("meus")}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            abaAtiva === "meus"
              ? "bg-white text-stone-900 font-bold shadow-xs border border-line"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          📁 Meus Editais Personalizados ({meusEditais.length})
        </button>
      </div>

      {/* ================= ABA 1: EDITAIS OFICIAIS ================= */}
      {abaAtiva === "oficiais" && (
        <div className="space-y-8 mt-6">
          {/* Seletor de Concursos */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EDITAIS_CONCURSOS.map((edital) => {
              const selecionado = editalSelecionado.id === edital.id;
              return (
                <button
                  key={edital.id}
                  onClick={() => setEditalSelecionado(edital)}
                  className={`card-tactile rounded-2xl p-4 text-left transition-all ${
                    selecionado
                      ? "border-amber bg-gradient-to-br from-[#FDFBF7] to-[#FAF5EB] shadow-md ring-1 ring-amber"
                      : ""
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber">
                    {edital.banca}
                  </span>
                  <h3 className="mt-1 font-serif text-base font-normal text-ink line-clamp-2">
                    {edital.nomeConcurso}
                  </h3>
                  <span className="mt-2 block text-[11px] font-mono text-soft">
                    {edital.orgao}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detalhes do Edital Oficial */}
          <article className="space-y-6">
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber uppercase">
                    {editalSelecionado.banca} · {editalSelecionado.anoReferencia}
                  </span>
                  <h2 className="mt-1 font-serif text-2xl font-normal text-ink">
                    {editalSelecionado.nomeConcurso}
                  </h2>
                </div>
                <span className="rounded-full bg-surface-alt border border-line px-3 py-1 text-xs font-mono text-ink">
                  {editalSelecionado.orgao}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-soft font-serif">
                {editalSelecionado.descricao}
              </p>

              {/* Dica Estratégica */}
              <div className="mt-5 rounded-xl border border-amber/30 bg-[#FCFBF7] p-4 text-xs font-serif text-ink">
                <strong className="block font-mono text-[11px] font-bold uppercase tracking-wider text-amber mb-1">
                  💡 Pulo do Gato da Banca:
                </strong>
                {editalSelecionado.dicaEstrategica}
              </div>
            </div>

            {/* Matérias e Pesos */}
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs">
              <div className="border-b border-line pb-3 mb-5">
                <h3 className="font-serif text-lg font-normal text-ink">
                  Incidência de Matérias & Dicas Pontuais
                </h3>
              </div>
              <div className="space-y-4">
                {editalSelecionado.materias.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl border border-line/80 bg-surface-alt/40 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-serif text-base font-medium text-ink">
                        {m.materia}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-ink">
                          {m.porcentagem}% da prova
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                            m.peso === "critico"
                              ? "bg-red/10 text-red border border-red/20"
                              : m.peso === "alto"
                              ? "bg-amber/15 text-amber border border-amber/30"
                              : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}
                        >
                          {m.peso}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-serif text-soft leading-relaxed">
                      {m.dicaBanca}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pegadinhas */}
            <div className="rounded-2xl border border-red/20 bg-[#FAF0ED]/40 p-6 shadow-xs">
              <h3 className="font-serif text-base font-bold text-red mb-3">
                ⚠️ As 3 Pegadinhas Prediletas Desta Banca
              </h3>
              <ul className="space-y-2 text-xs font-serif text-stone-800">
                {editalSelecionado.pegadinhasClassicas.map((peg, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red font-bold font-mono">!</span>
                    <span>{peg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      )}

      {/* ================= ABA 2: MEUS EDITAIS PERSONALIZADOS ================= */}
      {abaAtiva === "meus" && (
        <div className="space-y-8 mt-6">
          {meusEditais.length === 0 ? (
            <div className="card-tactile rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center text-2xl mx-auto text-amber">
                📄
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Nenhum edital importado ainda
                </h3>
                <p className="text-xs font-serif text-stone-600 mt-1.5 leading-relaxed">
                  Envie o arquivo PDF do edital do seu concurso ou cole o texto do conteúdo programático de matemática. Nossa IA criará um Raio-X completo e um checklist sob medida para sua aprovação.
                </p>
              </div>
              <button
                onClick={() => setMostrarModalUpload(true)}
                className="rounded-xl bg-ink px-5 py-2.5 text-xs font-mono font-semibold text-paper shadow hover:bg-[#2B2925] transition-all"
              >
                + Fazer Upload do Meu Edital Agora
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Seletor dos meus editais */}
              <div className="flex flex-wrap items-center gap-2">
                {meusEditais.map((edital) => (
                  <button
                    key={edital.id}
                    onClick={() => {
                      setMeuEditalSelecionadoId(edital.id);
                      definirEditalAtivo(edital.id);
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-left transition-all ${
                      meuEditalSelecionadoId === edital.id
                        ? "border-amber bg-gradient-to-br from-[#FDFBF7] to-[#FAF5EB] shadow-sm ring-1 ring-amber"
                        : "border-line bg-surface text-soft hover:border-line-strong"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold text-amber uppercase">
                      {edital.banca} · {edital.anoReferencia}
                    </div>
                    <div className="font-serif text-sm font-medium text-ink">
                      {edital.nomeConcurso}
                    </div>
                  </button>
                ))}
              </div>

              {meuEditalAtual && (
                <article className="space-y-6">
                  {/* Resumo do Edital Personalizado com Barra de Progresso */}
                  <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber uppercase">
                            {meuEditalAtual.banca} · {meuEditalAtual.anoReferencia}
                          </span>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 font-bold">
                            Edital Ativo
                          </span>
                        </div>
                        <h2 className="mt-1 font-serif text-2xl font-normal text-ink">
                          {meuEditalAtual.nomeConcurso}
                        </h2>
                        <span className="text-xs font-mono text-soft">
                          Órgão: {meuEditalAtual.orgao}
                        </span>
                      </div>
                      <button
                        onClick={() => handleExcluirEdital(meuEditalAtual.id)}
                        className="text-xs font-mono text-rose-700 hover:text-rose-900 self-start sm:self-auto border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        Excluir Edital
                      </button>
                    </div>

                    {/* Barra de Progresso do Edital */}
                    <div className="p-4 rounded-xl bg-surface-alt/60 border border-line space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-700 font-semibold">
                          Progresso do Conteúdo Programático:
                        </span>
                        <span className="font-bold text-amber">
                          {topicosConcluidos} de {totalTopicos} tópicos concluídos ({pctConcluido}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber h-full transition-all duration-300"
                          style={{ width: `${pctConcluido}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm font-serif text-soft leading-relaxed">
                      {meuEditalAtual.descricao}
                    </p>

                    {/* Dica Estratégica da IA */}
                    <div className="rounded-xl border border-amber/30 bg-[#FCFBF7] p-4 text-xs font-serif text-ink">
                      <strong className="block font-mono text-[11px] font-bold uppercase tracking-wider text-amber mb-1">
                        💡 Conselho Estratégico da IA para esta Prova:
                      </strong>
                      {meuEditalAtual.dicaEstrategica}
                    </div>
                  </div>

                  {/* Checklist Interativo dos Tópicos */}
                  <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs">
                    <div className="border-b border-line pb-3 mb-5 flex items-center justify-between">
                      <h3 className="font-serif text-lg font-normal text-ink">
                        Checklist do Conteúdo Programático
                      </h3>
                      <span className="text-xs font-mono text-soft">
                        Clique para marcar como estudado
                      </span>
                    </div>

                    <div className="space-y-4">
                      {meuEditalAtual.materias.map((m, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border transition-all ${
                            m.concluido
                              ? "border-emerald-200 bg-emerald-50/40 text-stone-700"
                              : "border-line/80 bg-surface-alt/40"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={!!m.concluido}
                                onChange={() => handleToggleChecklist(meuEditalAtual.id, m.materia)}
                                className="mt-1 h-4 w-4 rounded border-stone-300 text-amber focus:ring-amber cursor-pointer"
                              />
                              <div>
                                <h4
                                  className={`font-serif text-base font-medium ${
                                    m.concluido ? "line-through text-stone-500" : "text-ink"
                                  }`}
                                >
                                  {m.materia}
                                </h4>
                                <p className="text-xs font-serif text-soft mt-1 leading-relaxed">
                                  {m.dicaBanca}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 self-end sm:self-auto">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold text-ink">
                                  {m.porcentagem}% da prova
                                </span>
                                <span
                                  className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                                    m.peso === "critico"
                                      ? "bg-red/10 text-red border border-red/20"
                                      : m.peso === "alto"
                                      ? "bg-amber/15 text-amber border border-amber/30"
                                      : "bg-stone-100 text-stone-700 border border-stone-200"
                                  }`}
                                >
                                  {m.peso}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link
                                  href="/jornada"
                                  className="text-[11px] font-mono text-amber hover:underline"
                                >
                                  Estudar na Jornada &rarr;
                                </Link>
                                <Link
                                  href="/interpretacao"
                                  className="text-[11px] font-mono text-purple-700 hover:underline"
                                >
                                  Macetes &rarr;
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pegadinhas Clássicas */}
                  <div className="rounded-2xl border border-red/20 bg-[#FAF0ED]/40 p-6 shadow-xs">
                    <h3 className="font-serif text-base font-bold text-red mb-3">
                      ⚠️ Pegadinhas Típicas Desta Banca para este Concurso
                    </h3>
                    <ul className="space-y-2 text-xs font-serif text-stone-800">
                      {meuEditalAtual.pegadinhasClassicas.map((peg, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red font-bold font-mono">!</span>
                          <span>{peg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL DE UPLOAD / ANÁLISE ================= */}
      {mostrarModalUpload && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber">
                  Upload Inteligente
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Subir Edital de Concurso
                </h3>
              </div>
              <button
                onClick={() => setMostrarModalUpload(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-mono p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadEdital} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 uppercase mb-1">
                  1. Arquivo PDF do Edital (Até 15 MB)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setArquivo(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs font-mono text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-900 hover:file:bg-amber-100 border border-stone-200 rounded-xl p-2"
                />
                <span className="text-[11px] font-serif text-stone-400 block mt-1">
                  A IA localizará automaticamente a seção de matemática e raciocínio lógico no documento.
                </span>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-mono text-stone-400 uppercase">
                  Ou
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 uppercase mb-1">
                  2. Colar o Conteúdo Programático
                </label>
                <textarea
                  rows={4}
                  value={textoEdital}
                  onChange={(e) => setTextoEdital(e.target.value)}
                  placeholder="Ex: MATEMÁTICA: 1. Números inteiros e racionais. 2. Regra de três simples e composta. 3. Porcentagem. 4. Juros simples e compostos..."
                  className="w-full rounded-xl border border-stone-300 p-3 text-xs font-serif text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {erroUpload && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-serif text-rose-800">
                  {erroUpload}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalUpload(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={analisando}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white shadow ${
                    analisando ? "bg-stone-400 cursor-not-allowed" : "bg-stone-900 hover:bg-stone-800"
                  }`}
                >
                  {analisando ? "Analisando com Gemini AI..." : "Analisar e Criar Plano →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
