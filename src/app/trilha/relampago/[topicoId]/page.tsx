"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RegistroTentativa,
  type DadosTentativaConcluida,
  type QuestaoParaRegistro,
} from "@/components/RegistroTentativa";
import { metaSegundos } from "@/lib/meta-tempo";
import { RELAMPAGO_TOTAL_QUESTOES } from "@/lib/trilha";
import { enfileirarTentativa, sincronizarFila } from "@/lib/fila-offline";

type Questao = QuestaoParaRegistro & {
  nivel: "facil" | "medio" | "dificil";
  topicos: { id: string; area: string }[];
};

type Topico = { id: string; nome: string };

type EstadoTeste =
  | { fase: "carregando" }
  | { fase: "poucas_questoes" }
  | { fase: "em_andamento"; questoes: Questao[]; indice: number; acertos: number }
  | { fase: "concluido"; acertos: number; aprovado: boolean; erro?: string };

export default function TesteRelampagoPage() {
  const { topicoId } = useParams<{ topicoId: string }>();
  const [topico, setTopico] = useState<Topico | null>(null);
  const [estado, setEstado] = useState<EstadoTeste>({ fase: "carregando" });

  useEffect(() => {
    async function carregar() {
      const [respTopicos, respQuestoes] = await Promise.all([
        fetch("/api/topicos"),
        fetch(`/api/questoes?topicoId=${topicoId}`),
      ]);
      const topicos: Topico[] = await respTopicos.json();
      const questoes: Questao[] = await respQuestoes.json();

      setTopico(topicos.find((t) => t.id === topicoId) ?? null);

      if (questoes.length < RELAMPAGO_TOTAL_QUESTOES) {
        setEstado({ fase: "poucas_questoes" });
        return;
      }

      const embaralhadas = [...questoes].sort(() => Math.random() - 0.5);
      setEstado({
        fase: "em_andamento",
        questoes: embaralhadas.slice(0, RELAMPAGO_TOTAL_QUESTOES),
        indice: 0,
        acertos: 0,
      });
    }
    void carregar();
  }, [topicoId]);

  async function handleConcluir(dados: DadosTentativaConcluida) {
    if (estado.fase !== "em_andamento") return;

    const questaoAtual = estado.questoes[estado.indice];
    await enfileirarTentativa({ questaoId: questaoAtual.id, ...dados, modo: "treino" });
    await sincronizarFila();

    const acertos = estado.acertos + (dados.acertou ? 1 : 0);
    const proximoIndice = estado.indice + 1;

    if (proximoIndice >= estado.questoes.length) {
      const resposta = await fetch("/api/trilha/liberar-manualmente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicoId, acertos }),
      });
      const corpo = await resposta.json();
      setEstado({
        fase: "concluido",
        acertos,
        aprovado: resposta.ok,
        erro: resposta.ok ? undefined : corpo.erro,
      });
      return;
    }

    setEstado({ ...estado, indice: proximoIndice, acertos });
  }

  if (estado.fase === "carregando") {
    return <Centro>Carregando teste relâmpago…</Centro>;
  }

  if (estado.fase === "poucas_questoes") {
    return (
      <Centro>
        <p className="max-w-sm text-center text-soft">
          Este tópico tem menos de {RELAMPAGO_TOTAL_QUESTOES} questões
          cadastradas — não dá para montar o teste relâmpago ainda.
        </p>
        <Link href="/trilha" className="mt-4 text-sm text-ink underline">
          Voltar para a trilha
        </Link>
      </Centro>
    );
  }

  if (estado.fase === "concluido") {
    return (
      <Centro>
        <div
          className={`rounded p-4 text-center ${
            estado.aprovado ? "bg-green/10 text-green" : "bg-red/10 text-red"
          }`}
        >
          <p className="font-semibold">
            {estado.acertos} de {RELAMPAGO_TOTAL_QUESTOES} corretas
          </p>
          <p className="mt-1 text-sm">
            {estado.aprovado
              ? "Aprovado — o tópico foi liberado."
              : estado.erro}
          </p>
        </div>
        <Link href="/trilha" className="mt-4 text-sm text-ink underline">
          Voltar para a trilha
        </Link>
      </Centro>
    );
  }

  const questaoAtual = estado.questoes[estado.indice];

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-6">
      <header className="text-sm text-soft">
        Teste relâmpago{topico ? ` — ${topico.nome}` : ""} — questão{" "}
        {estado.indice + 1} de {RELAMPAGO_TOTAL_QUESTOES}
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
          estado.indice + 1 >= RELAMPAGO_TOTAL_QUESTOES
            ? "Concluir teste relâmpago"
            : "Próxima questão"
        }
        onConcluir={handleConcluir}
      />
    </main>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-ink">
      {children}
    </main>
  );
}
