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

      {/* Banner de Constância Diária */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber/30 bg-[#FCFBF7] p-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4EFE6] text-lg">
            🔥
          </span>
          <div>
            <strong className="block font-serif text-sm font-bold text-ink">
              Constância de Treino Deliberado
            </strong>
            <span className="text-soft">
              O segredo da aprovação é o contato diário com as fórmulas e resolução cronometrada.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Link
            href="/agilidade"
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:bg-[#262420] transition-colors"
          >
            ⚡ Cálculo Mental (60s)
          </Link>
          <Link
            href="/revisao-vespera"
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper transition-colors"
          >
            📄 PDF Véspera
          </Link>
        </div>
      </div>

      {/* Ações Imediatas (Hero Grid) */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Treino Rápido */}
        <Link
          href="/sessao"
          className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-ink p-6 text-paper shadow-md transition-all duration-200 hover:bg-[#262420] hover:shadow-lg sm:p-7"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Treino Ativo
              </span>
              <span className="text-xs text-paper/60 transition-transform duration-200 group-hover:translate-x-1">
                Iniciar →
              </span>
            </div>
            <h2 className="mt-4 font-serif text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Iniciar Sessão de Treino
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-paper/80">
              Prática cronometrada com registro de confiança declarada, detecção imediata de armadilhas e causa do erro.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-white/90">
            <span>Começar resolução de itens</span>
            <span className="text-white/60">· Fila personalizada</span>
          </div>
        </Link>

        {/* Caderno de Erros */}
        <Link
          href="/caderno"
          className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-6 shadow-xs transition-all duration-200 hover:border-line-strong hover:shadow-md sm:p-7"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF0ED] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-red">
                <span className="h-1.5 w-1.5 rounded-full bg-red" />
                Memória Espaçada
              </span>
              <span className="text-xs text-soft transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink">
                Revisar →
              </span>
            </div>
            <h2 className="mt-4 font-serif text-2xl font-normal tracking-tight text-ink sm:text-3xl">
              Caderno de Erros
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-soft">
              Fila de revisão inteligente nos ciclos de 1, 3, 7 e 21 dias. Prioriza lacunas conceituais e impede o esquecimento.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-ink">
            <span>Abrir questões pendentes</span>
            <span className="text-soft">· Algoritmo de repetição</span>
          </div>
        </Link>
      </section>

      {/* Hub em Categorias */}
      <div className="mt-12 space-y-10">
        {/* Seção 1: Fundamentação e Provas */}
        <section>
          <div className="flex items-center gap-3 border-b border-line pb-2">
            <span className="font-serif text-sm italic text-soft">I.</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Prática & Fundamentação
            </h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/formulario"
              className="group flex flex-col justify-between rounded-lg border border-amber/40 bg-[#FCFBF7] p-4 transition-all duration-150 hover:border-amber hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#F4EFE6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber">
                    Cola de Bolso
                  </span>
                  <span className="text-xs text-soft">25 Fórmulas</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-amber">
                  Formulário & Macetes
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Fórmulas essenciais de nível médio, pulo do gato e resolução em poucos passos.
                </p>
              </div>
              <span className="mt-3 text-xs font-semibold text-amber">Abrir formulário →</span>
            </Link>

            <Link
              href="/agilidade"
              className="group flex flex-col justify-between rounded-lg border border-red/30 bg-[#FAF0ED]/40 p-4 transition-all duration-150 hover:border-red hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#FAF0ED] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red">
                    Speed Math
                  </span>
                  <span className="text-xs text-soft">60s / 120s</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-red">
                  Cálculo Rápido & Agilidade
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Treine macetes mentais para não perder tempo fazendo conta na prova.
                </p>
              </div>
              <span className="mt-3 text-xs font-semibold text-red">Treinar velocidade →</span>
            </Link>

            <Link
              href="/editais"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-soft font-medium">Bancas Oficiais</span>
                  <span className="text-[10px] rounded bg-paper px-1.5 py-0.5 font-bold text-ink">4 Editais</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Editais Guiados
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Raio-X estatístico para Caixa/BB, Correios, TJ-SP e Cebraspe.
                </p>
              </div>
              <span className="mt-3 text-xs font-medium text-ink/70">Ver mapa de bancas →</span>
            </Link>

            <Link
              href="/trilha"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-soft font-medium">Pré-requisitos</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Trilha de Base
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Grafo de dependência de matérias, travas conceituais e reforço focado.
                </p>
              </div>
              <span className="mt-3 text-xs font-medium text-ink/70">Acessar trilha →</span>
            </Link>

            <Link
              href="/simulado"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-soft font-medium">Tempo Real</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Simulado Oficial
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Provas simuladas completas com ritmo de prova e cálculo de nota líquida.
                </p>
              </div>
              <span className="mt-3 text-xs font-medium text-ink/70">Iniciar simulado →</span>
            </Link>

            <Link
              href="/revisao-vespera"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-soft font-medium">Porta da Prova</span>
                  <span className="text-[10px] rounded bg-paper px-1.5 py-0.5 font-bold text-ink">A4</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Folha de Véspera (PDF)
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Resumo das 10 fórmulas críticas formatado para imprimir ou salvar em PDF.
                </p>
              </div>
              <span className="mt-3 text-xs font-medium text-ink/70">Gerar folha A4 →</span>
            </Link>
          </div>
        </section>

        {/* Seção 2: Inteligência Artificial */}
        <section>
          <div className="flex items-center gap-3 border-b border-line pb-2">
            <span className="font-serif text-sm italic text-soft">II.</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Laboratório de Inteligência (Gemini AI)
            </h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/tutor"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber">Diálogo Socrático</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Tutor Individual
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Instrução personalizada que guia pelo raciocínio sem entregar a resposta direta.
                </p>
              </div>
              <span className="mt-4 text-xs font-medium text-ink/70">Conversar com o tutor →</span>
            </Link>

            <Link
              href="/questoes/gerar"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-green">Inéditas</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Gerador de Questões
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Criação de novos itens calibrados no perfil de bancas com gabarito comentado.
                </p>
              </div>
              <span className="mt-4 text-xs font-medium text-ink/70">Gerar item com IA →</span>
            </Link>

            <Link
              href="/dossie"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-soft">Raio-X</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Dossiê da Banca
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Padrões recorrentes, pegadinhas prediletas e estilo de cobrança das bancas.
                </p>
              </div>
              <span className="mt-4 text-xs font-medium text-ink/70">Consultar dossiê →</span>
            </Link>

            <Link
              href="/heuristicas"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-soft">Técnicas</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Heurísticas
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Atalhos mentais, estimativas e padrões de eliminação rápida de alternativas.
                </p>
              </div>
              <span className="mt-4 text-xs font-medium text-ink/70">Ver métodos →</span>
            </Link>

            <Link
              href="/diagnostico"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs sm:col-span-2 lg:col-span-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-soft">Auditoria Global</span>
                </div>
                <h4 className="mt-2 font-serif text-lg font-medium text-ink group-hover:underline decoration-line-strong">
                  Diagnóstico Periódico
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-soft">
                  Varredura analítica do seu histórico para apontar pontos cegos e prioridades de estudo para a semana.
                </p>
              </div>
              <span className="mt-4 text-xs font-medium text-ink/70">Calcular prontidão →</span>
            </Link>
          </div>
        </section>

        {/* Seção 3: Gestão & Métricas */}
        <section>
          <div className="flex items-center gap-3 border-b border-line pb-2">
            <span className="font-serif text-sm italic text-soft">III.</span>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Métricas & Acervo
            </h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/painel"
              className="group rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Painel Analítico
              </h4>
              <p className="mt-1 text-xs text-soft">
                Acerto firme, calibração e constância diária.
              </p>
            </Link>

            <Link
              href="/importar"
              className="group rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Importar Prova
              </h4>
              <p className="mt-1 text-xs text-soft">
                Extração automática via PDF ou texto.
              </p>
            </Link>

            <Link
              href="/topicos/novo"
              className="group rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Novo Tópico
              </h4>
              <p className="mt-1 text-xs text-soft">
                Estruturar novas áreas do edital.
              </p>
            </Link>

            <Link
              href="/questoes/nova"
              className="group rounded-lg border border-line bg-surface p-4 transition-all duration-150 hover:border-line-strong hover:shadow-xs"
            >
              <h4 className="font-serif text-base font-medium text-ink group-hover:underline decoration-line-strong">
                Nova Questão
              </h4>
              <p className="mt-1 text-xs text-soft">
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

