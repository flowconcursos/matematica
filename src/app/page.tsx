import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { tokensUsadosHoje } from "@/lib/ai-db";

// Precisa ser renderizado a cada request: uso de IA muda ao longo do dia.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const teto = Number(process.env.AI_TETO_DIARIO_TOKENS ?? 0);
  const usados = teto > 0 ? await tokensUsadosHoje() : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Cabeçalho Editorial */}
      <header className="border-b border-line pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-soft">
                Flow Concursos
              </span>
              <span className="h-1 w-1 rounded-full bg-line-strong" />
              <span className="text-[11px] font-medium tracking-wider text-soft">
                Edição de Estudos
              </span>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
              Matemática & Raciocínio Lógico
            </h1>
            <p className="mt-1 text-sm text-soft">
              Instrumento de treino deliberado, repetição espaçada e diagnóstico assistido por inteligência artificial.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:self-start sm:pt-2">
            {usados !== null && (
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs shadow-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    usados >= teto ? "bg-red" : "bg-green"
                  }`}
                />
                <span className="text-soft">
                  Tokens IA:{" "}
                  <strong className="font-semibold text-ink">
                    {usados.toLocaleString("pt-BR")}
                  </strong>
                  /{teto.toLocaleString("pt-BR")}
                </span>
              </div>
            )}

            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-soft transition-colors hover:border-line-strong hover:text-ink shadow-xs"
              >
                Encerrar Sessão
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Banner de Constância Diária & Estado de Flow */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber/30 bg-gradient-to-r from-[#FDFBF7] via-[#FAF6ED] to-[#FDFBF7] p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-xl shadow-xs">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="font-serif text-base font-bold text-ink">
                Constância & Estado de Flow
              </strong>
              <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber">
                Diário
              </span>
            </div>
            <p className="text-xs text-soft mt-0.5">
              O aprendizado matemático consolida-se através de estímulos diários de curta duração e alta concentração.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <Link
            href="/agilidade"
            className="rounded-xl bg-ink px-4 py-2 text-xs font-mono font-semibold text-paper shadow-sm hover:bg-[#2B2925] hover:shadow-md transition-all active:scale-95"
          >
            ⚡ Speed Math (60s)
          </Link>
          <Link
            href="/revisao-vespera"
            className="rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-mono font-medium text-ink hover:border-line-strong hover:bg-paper transition-all active:scale-95"
          >
            📄 PDF Véspera
          </Link>
        </div>
      </div>

      {/* Ações Imediatas (Hero Grid de Alta Carga Cognitiva) */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Treino Ativo */}
        <Link
          href="/sessao"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1B18] via-[#24221E] to-[#171614] p-6 text-paper shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-7"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono font-semibold tracking-wide text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Treino Deliberado
              </span>
              <span className="text-xs font-mono text-paper/70 transition-transform duration-200 group-hover:translate-x-1">
                Iniciar Sessão &rarr;
              </span>
            </div>
            <h2 className="mt-5 font-serif text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Iniciar Sessão de Treino
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-paper/80 font-serif">
              Prática cronometrada com registro de confiança declarada, detecção de pegadinhas em tempo real e causa raiz de cada erro.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-white/90 relative z-10 pt-4 border-t border-white/10">
            <span className="font-semibold text-emerald-300">Começar questões</span>
            <span className="text-white/40">· Fila adaptativa individual</span>
          </div>
        </Link>

        {/* Caderno de Erros */}
        <Link
          href="/caderno"
          className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-md sm:p-7"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF0ED] border border-red/20 px-3 py-1 text-[11px] font-mono font-semibold tracking-wide text-red">
                <span className="h-2 w-2 rounded-full bg-red" />
                Memória Espaçada
              </span>
              <span className="text-xs font-mono text-soft transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink">
                Revisar Fila &rarr;
              </span>
            </div>
            <h2 className="mt-5 font-serif text-2xl font-normal tracking-tight text-ink sm:text-3xl">
              Caderno de Erros
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-soft font-serif">
              Fila inteligente nos ciclos de 1, 3, 7 e 21 dias. Prioriza lacunas conceituais e atua antes que a curva do esquecimento apague o aprendizado.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-ink pt-4 border-t border-line/60">
            <span className="font-semibold">Abrir pendências</span>
            <span className="text-soft">· Algoritmo de Repetição Espaçada</span>
          </div>
        </Link>
      </section>

      {/* Hub em Categorias */}
      <div className="mt-12 space-y-10">
        {/* Seção 0: Construção de Base (Pegando pelos Braços) */}
        <section>
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div className="flex items-center gap-3">
              <span className="font-serif text-sm italic text-amber font-bold">★</span>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                Construção de Base &bull; Pegando Pelos Braços
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full font-medium">
              Do Zero ao Gabarito
            </span>
          </div>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Nivelamento */}
            <Link
              href="/nivelamento"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-stone-700">
                    Ponto de Partida
                  </span>
                  <span className="text-xs font-mono text-soft">8 Itens</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-stone-400">
                  Teste de Nivelamento
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Raio-X de lacunas: descubra exatamente onde você trava e qual o seu ponto inicial ideal.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-stone-900 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Fazer diagnóstico &rarr;
              </span>
            </Link>

            {/* 2. Jornada Passo a Passo */}
            <Link
              href="/jornada"
              className="group flex flex-col justify-between rounded-2xl border border-amber/40 bg-gradient-to-br from-[#FDFBF7] to-[#FAF5EB] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber/15 border border-amber/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-amber">
                    Trilha Estruturada
                  </span>
                  <span className="text-xs text-amber font-mono font-bold">6 Níveis</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-amber">
                  Jornada do Zero
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Intuição prática, regras de ouro, exemplos dissecados e micro-quizzes de fixação.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-amber group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Abrir jornada &rarr;
              </span>
            </Link>

            {/* 3. Central de Interpretação & Raio-X com IA */}
            <Link
              href="/interpretacao"
              className="group flex flex-col justify-between rounded-2xl border border-purple-200/80 bg-gradient-to-br from-[#FCFBFD] via-[#FAF6FE] to-[#F7F2FD] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-400 hover:shadow-md sm:col-span-2 lg:col-span-1"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-100/80 border border-purple-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-purple-900">
                    Raio-X com IA
                  </span>
                  <span className="text-xs text-purple-700 font-mono font-semibold">Ponto a Ponto</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-purple-500">
                  Interpretação & Macetes
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Cole qualquer questão para dissecar dados, armadilhas, tradução e o pulo do gato com IA.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-purple-800 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Dissecar questão &rarr;
              </span>
            </Link>

            {/* 4. Tradutor de Enunciados */}
            <Link
              href="/tradutor-enunciados"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-blue-800">
                    Português &rarr; Álgebra
                  </span>
                  <span className="text-xs text-blue-700 font-mono">24 Termos</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-blue-400">
                  Tradutor de Enunciados
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Dicionário de termos de banca e treino para converter textos em equações exatas.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Aprender tradução &rarr;
              </span>
            </Link>

            {/* 5. Resolução Guiada */}
            <Link
              href="/resolucao-guiada"
              className="group flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-[#FAFDFB] to-[#F2FAF5] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-emerald-800">
                    Andaime Cognitivo
                  </span>
                  <span className="text-xs text-emerald-700 font-mono font-semibold">3 Degraus</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-emerald-500">
                  Resolução Guiada
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Aprenda a pensar como um concurseiro experiente: Dados &rarr; Estratégia &rarr; Conta.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Praticar degraus &rarr;
              </span>
            </Link>

            {/* 6. Laboratório Visual Interativo */}
            <Link
              href="/visual"
              className="group flex flex-col justify-between rounded-2xl border border-amber/40 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F7EFE1] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber/20 border border-amber/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-amber">
                    Simulações Vivas
                  </span>
                  <span className="text-xs font-mono text-amber-800 font-bold">Sliders & SVG</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-amber">
                  Laboratório Visual
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Fatiamento de frações, balança de regra de três e diagrama de Venn interativos.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-amber group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Abrir laboratório &rarr;
              </span>
            </Link>

            {/* 7. Flashcards 3D com Repetição Espaçada */}
            <Link
              href="/flashcards"
              className="group flex flex-col justify-between rounded-2xl border border-purple-200/80 bg-gradient-to-br from-[#FCFBFD] via-[#F8F4FD] to-[#F3EBFB] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-400 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-100/80 border border-purple-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-purple-900">
                    Memória Ativa
                  </span>
                  <span className="text-xs font-mono text-purple-700 font-semibold">Flip 3D &bull; SRS</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-purple-500">
                  Flashcards 3D
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Memorização relâmpago de fórmulas e macetes de banca com efeito 3D e repetição espaçada.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-purple-800 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Revisar cards &rarr;
              </span>
            </Link>
          </div>
        </section>

        {/* Seção 1: Fundamentação e Provas */}
        <section>
          <div className="flex items-center gap-3 border-b border-line pb-2">
            <span className="font-serif text-sm italic text-soft font-bold">I.</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink font-mono">
              Prática & Fundamentação
            </h3>
          </div>
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/formulario"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber/10 border border-amber/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-amber">
                    Cola de Bolso
                  </span>
                  <span className="text-xs font-mono text-soft">25 Fórmulas</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-amber">
                  Formulário & Macetes
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Fórmulas essenciais de nível médio, pulo do gato e resolução em poucos passos.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-amber group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Abrir formulário &rarr;
              </span>
            </Link>

            <Link
              href="/agilidade"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-red/10 border border-red/20 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-red">
                    Speed Math
                  </span>
                  <span className="text-xs font-mono text-soft">60s / 120s</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-red">
                  Cálculo Rápido & Agilidade
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Treine macetes mentais para não perder tempo fazendo conta na prova.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-semibold text-red group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Treinar velocidade &rarr;
              </span>
            </Link>

            <Link
              href="/editais"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-soft font-medium">Bancas Oficiais</span>
                  <span className="text-[10px] font-mono rounded bg-surface-alt px-2 py-0.5 font-bold text-ink">4 Editais</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Editais Guiados
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Raio-X estatístico para Caixa/BB, Correios, TJ-SP e Cebraspe.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Ver mapa de bancas &rarr;
              </span>
            </Link>

            <Link
              href="/trilha"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-soft font-medium">Pré-requisitos</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Trilha de Base
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Grafo de dependência de matérias, travas conceituais e reforço focado.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Acessar trilha &rarr;
              </span>
            </Link>

            <Link
              href="/simulado"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-soft font-medium">Tempo Real</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Simulado Oficial
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Provas simuladas completas com ritmo de prova e cálculo de nota líquida.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Iniciar simulado &rarr;
              </span>
            </Link>

            <Link
              href="/revisao-vespera"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-soft font-medium">Porta da Prova</span>
                  <span className="text-[10px] font-mono rounded bg-surface-alt px-2 py-0.5 font-bold text-ink">A4</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Folha de Véspera (PDF)
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Resumo das 10 fórmulas críticas formatado para imprimir ou salvar em PDF.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Gerar folha A4 &rarr;
              </span>
            </Link>
          </div>
        </section>

        {/* Seção 2: Inteligência Artificial */}
        <section>
          <div className="flex items-center gap-3 border-b border-line pb-2">
            <span className="font-serif text-sm italic text-soft font-bold">II.</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink font-mono">
              Laboratório de Inteligência (Gemini AI)
            </h3>
          </div>
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/tutor"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-amber">Diálogo Socrático</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Tutor Individual
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Instrução personalizada que guia pelo raciocínio sem entregar a resposta direta.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Conversar com o tutor &rarr;
              </span>
            </Link>

            <Link
              href="/questoes/gerar"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-green">Inéditas</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Gerador de Questões
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Criação de novos itens calibrados no perfil de bancas com gabarito comentado.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Gerar item com IA &rarr;
              </span>
            </Link>

            <Link
              href="/dossie"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-soft">Raio-X</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Dossiê da Banca
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Padrões recorrentes, pegadinhas prediletas e estilo de cobrança das bancas.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Consultar dossiê &rarr;
              </span>
            </Link>

            <Link
              href="/heuristicas"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-soft">Técnicas</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Heurísticas
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Atalhos mentais, estimativas e padrões de eliminação rápida de alternativas.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Ver métodos &rarr;
              </span>
            </Link>

            <Link
              href="/diagnostico"
              className="card-tactile group flex flex-col justify-between rounded-2xl p-5 sm:col-span-2 lg:col-span-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-soft">Auditoria Global</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Diagnóstico Periódico
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft font-serif">
                  Varredura analítica do seu histórico para apontar pontos cegos e prioridades de estudo para a semana.
                </p>
              </div>
              <span className="mt-4 text-xs font-mono font-medium text-ink/70 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Calcular prontidão &rarr;
              </span>
            </Link>
          </div>
        </section>

        {/* Seção 3: Gestão & Métricas */}
        <section>
          <div className="flex items-center gap-3 border-b border-line pb-2">
            <span className="font-serif text-sm italic text-soft font-bold">III.</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink font-mono">
              Métricas & Acervo
            </h3>
          </div>
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/painel"
              className="card-tactile group rounded-2xl p-5"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Painel Analítico
              </h4>
              <p className="mt-1 text-xs text-soft font-serif leading-relaxed">
                Acerto firme, calibração e constância diária.
              </p>
            </Link>

            <Link
              href="/importar"
              className="card-tactile group rounded-2xl p-5"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Importar Prova
              </h4>
              <p className="mt-1 text-xs text-soft font-serif leading-relaxed">
                Extração automática via PDF ou texto.
              </p>
            </Link>

            <Link
              href="/topicos/novo"
              className="card-tactile group rounded-2xl p-5"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Novo Tópico
              </h4>
              <p className="mt-1 text-xs text-soft font-serif leading-relaxed">
                Estruturar novas áreas do edital.
              </p>
            </Link>

            <Link
              href="/questoes/nova"
              className="card-tactile group rounded-2xl p-5"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Nova Questão
              </h4>
              <p className="mt-1 text-xs text-soft font-serif leading-relaxed">
                Cadastro manual com auxílio de IA.
              </p>
            </Link>
          </div>
        </section>
      </div>

      {/* Rodapé Editorial */}
      <footer className="mt-16 border-t border-line pt-6 text-center text-xs text-soft">
        <p>Flow Concursos · Sistema Especializado de Aprendizado de Alto Rendimento</p>
      </footer>
    </main>
  );
}

