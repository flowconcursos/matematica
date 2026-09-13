"use client";

import { useEffect, useReducer, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RegistroTentativa,
  type DadosTentativaConcluida,
  type QuestaoParaRegistro,
} from "@/components/RegistroTentativa";
import { metaSegundos } from "@/lib/meta-tempo";
import { enfileirarTentativa, sincronizarFila } from "@/lib/fila-offline";

type Questao = QuestaoParaRegistro & {
  nivel: "facil" | "medio" | "dificil";
  topicos: { id: string; area: string }[];
};

type Topico = { id: string; nome: string; descricaoCurta: string | null };

type Dominio = "nao_avaliado" | "fragil" | "em_construcao" | "firme";

const ORDEM_NIVEL = { facil: 0, medio: 1, dificil: 2 } as const;

const ROTULO_DOMINIO: Record<Dominio, string> = {
  nao_avaliado: "Não avaliado",
  fragil: "Frágil",
  em_construcao: "Em construção",
  firme: "Firme",
};

type Etapa = "carregando" | "conceito" | "exemplos" | "fixacao" | "reavaliacao";

const TOTAL_FIXACAO = 10;

type EstadoExplicacao =
  | { status: "carregando" }
  | { status: "pronta"; texto: string }
  | { status: "erro" };

function explicacaoReducer(
  _estado: EstadoExplicacao,
  novoEstado: EstadoExplicacao,
): EstadoExplicacao {
  return novoEstado;
}

export default function ReforcoPage() {
  const { topicoId } = useParams<{ topicoId: string }>();
  const [topico, setTopico] = useState<Topico | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("carregando");

  const [exemplos, setExemplos] = useState<Questao[]>([]);
  const [indiceExemplo, setIndiceExemplo] = useState(0);
  const [explicacaoExemplo, dispatchExplicacao] = useReducer(
    explicacaoReducer,
    { status: "carregando" } as EstadoExplicacao,
  );

  const [fixacao, setFixacao] = useState<Questao[]>([]);
  const [indiceFixacao, setIndiceFixacao] = useState(0);

  const [dominioAtualizado, setDominioAtualizado] = useState<Dominio | null>(null);

  useEffect(() => {
    async function carregar() {
      const [respTopicos, respQuestoes] = await Promise.all([
        fetch("/api/topicos"),
        fetch(`/api/questoes?topicoId=${topicoId}`),
      ]);
      const topicos: Topico[] = await respTopicos.json();
      const questoes: Questao[] = await respQuestoes.json();

      setTopico(topicos.find((t) => t.id === topicoId) ?? null);

      const ordenadas = [...questoes].sort(
        (a, b) => ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel],
      );
      const escolhidasExemplo: Questao[] = [];
      for (const nivel of ["facil", "medio", "dificil"] as const) {
        const encontrada = ordenadas.find(
          (q) => q.nivel === nivel && !escolhidasExemplo.includes(q),
        );
        if (encontrada) escolhidasExemplo.push(encontrada);
      }
      setExemplos(escolhidasExemplo);

      const restantes = ordenadas.filter((q) => !escolhidasExemplo.includes(q));
      const embaralhadas = [...restantes].sort(() => Math.random() - 0.5);
      setFixacao(embaralhadas.slice(0, TOTAL_FIXACAO));

      setEtapa("conceito");
    }
    void carregar();
  }, [topicoId]);

  useEffect(() => {
    if (etapa !== "exemplos" || exemplos.length === 0) return;
    const questaoAtual = exemplos[indiceExemplo];
    dispatchExplicacao({ status: "carregando" });
    fetch("/api/ia/explicacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questaoId: questaoAtual.id, nivel: "passo_a_passo" }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((corpo) =>
        dispatchExplicacao(
          corpo?.texto
            ? { status: "pronta", texto: corpo.texto }
            : { status: "erro" },
        ),
      )
      .catch(() => dispatchExplicacao({ status: "erro" }));
  }, [etapa, indiceExemplo, exemplos]);

  async function handleConcluirFixacao(dados: DadosTentativaConcluida) {
    const questaoAtual = fixacao[indiceFixacao];
    await enfileirarTentativa({ questaoId: questaoAtual.id, ...dados, modo: "treino" });
    await sincronizarFila();

    const proximo = indiceFixacao + 1;
    if (proximo >= fixacao.length) {
      const resposta = await fetch("/api/trilha");
      const trilha: { id: string; dominio: Dominio }[] = await resposta.json();
      setDominioAtualizado(trilha.find((t) => t.id === topicoId)?.dominio ?? null);
      setEtapa("reavaliacao");
      return;
    }
    setIndiceFixacao(proximo);
  }

  if (etapa === "carregando") {
    return <Centro>Carregando…</Centro>;
  }

  if (etapa === "conceito") {
    return (
      <Centro>
        <h1 className="mb-2 text-lg font-semibold text-ink">
          {topico?.nome ?? "Tópico"}
        </h1>
        <p className="max-w-md text-center text-ink">
          {topico?.descricaoCurta || "Nenhuma descrição curta cadastrada ainda para este tópico."}
        </p>
        <button
          onClick={() => setEtapa("exemplos")}
          className="mt-6 rounded bg-ink px-4 py-3 text-white"
        >
          Ver exemplos resolvidos
        </button>
      </Centro>
    );
  }

  if (etapa === "exemplos") {
    if (exemplos.length === 0) {
      return (
        <Centro>
          <p className="max-w-sm text-center text-soft">
            Nenhuma questão cadastrada neste tópico ainda para servir de
            exemplo.
          </p>
          <button
            onClick={() => setEtapa("fixacao")}
            className="mt-4 rounded bg-ink px-4 py-3 text-white"
          >
            Continuar
          </button>
        </Centro>
      );
    }

    const questaoAtual = exemplos[indiceExemplo];
    const ultimo = indiceExemplo + 1 >= exemplos.length;

    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6">
        <header className="text-sm text-soft">
          Exemplo resolvido {indiceExemplo + 1} de {exemplos.length} ({questaoAtual.nivel})
        </header>
        <section className="rounded border border-line bg-white/60 p-4">
          <p className="whitespace-pre-wrap text-ink">{questaoAtual.enunciado}</p>
          <p className="mt-3 font-semibold text-green">Gabarito: {questaoAtual.gabarito}</p>
        </section>
        <section className="rounded border border-line bg-white/60 p-4 text-sm text-ink">
          {explicacaoExemplo.status === "carregando" && (
            <p className="text-soft">Gerando explicação…</p>
          )}
          {explicacaoExemplo.status === "pronta" && (
            <p className="whitespace-pre-wrap">{explicacaoExemplo.texto}</p>
          )}
          {explicacaoExemplo.status === "erro" && (
            <p className="text-soft">Não foi possível gerar a explicação agora.</p>
          )}
        </section>
        <button
          onClick={() =>
            ultimo ? setEtapa("fixacao") : setIndiceExemplo(indiceExemplo + 1)
          }
          className="rounded bg-ink px-4 py-3 text-white"
        >
          {ultimo ? "Continuar para as questões de fixação" : "Próximo exemplo"}
        </button>
      </main>
    );
  }

  if (etapa === "fixacao") {
    if (fixacao.length === 0) {
      return (
        <Centro>
          <p className="max-w-sm text-center text-soft">
            Não há questões suficientes neste tópico para as 10 de fixação.
          </p>
          <Link href="/trilha" className="mt-4 text-sm text-ink underline">
            Voltar para a trilha
          </Link>
        </Centro>
      );
    }

    const questaoAtual = fixacao[indiceFixacao];
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-6">
        <header className="text-sm text-soft">
          Fixação — questão {indiceFixacao + 1} de {fixacao.length}
        </header>
        <RegistroTentativa
          key={questaoAtual.id}
          questao={questaoAtual}
          metaSegundos={metaSegundos(
            (questaoAtual.topicos[0]?.area ?? "aritmetica") as never,
            questaoAtual.nivel,
          )}
          salvando={false}
          textoBotaoSalvar={
            indiceFixacao + 1 >= fixacao.length ? "Concluir e reavaliar" : "Próxima questão"
          }
          onConcluir={handleConcluirFixacao}
        />
      </main>
    );
  }

  return (
    <Centro>
      <p className="text-ink">Reavaliação concluída.</p>
      <p className="mt-2 text-lg font-semibold text-ink">
        {dominioAtualizado ? ROTULO_DOMINIO[dominioAtualizado] : "—"}
      </p>
      <Link href="/trilha" className="mt-6 text-sm text-ink underline">
        Voltar para a trilha
      </Link>
    </Centro>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center text-ink">
      {children}
    </main>
  );
}
