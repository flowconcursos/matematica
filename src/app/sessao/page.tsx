"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";
import {
  RegistroTentativa,
  type DadosTentativaConcluida,
  type QuestaoParaRegistro,
} from "@/components/RegistroTentativa";
import {
  enfileirarTentativa,
  contarPendentes,
  sincronizarFila,
} from "@/lib/fila-offline";
import { metaSegundos } from "@/lib/meta-tempo";

type Questao = QuestaoParaRegistro & {
  nivel: "facil" | "medio" | "dificil";
  topicos: { id: string; area: string }[];
};

const CHAVE_QUESTAO_ATUAL = "sessao-treino-questao-atual";

function lerQuestaoSalva(): Questao | null {
  if (typeof window === "undefined") return null;
  const salva = localStorage.getItem(CHAVE_QUESTAO_ATUAL);
  if (!salva) return null;
  try {
    return JSON.parse(salva) as Questao;
  } catch {
    return null;
  }
}

type QuestaoEstado = Questao | "carregando" | "vazio";
type QuestaoAcao = { tipo: "definir"; questao: Questao } | { tipo: "vazio" };

function questaoReducer(_estado: QuestaoEstado, acao: QuestaoAcao): QuestaoEstado {
  return acao.tipo === "vazio" ? "vazio" : acao.questao;
}

export default function SessaoPage() {
  const [questao, dispatchQuestao] = useReducer(
    questaoReducer,
    undefined,
    () => lerQuestaoSalva() ?? ("carregando" as QuestaoEstado),
  );
  const [pendentes, setPendentes] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const carregarProximaQuestao = useCallback(async () => {
    const resposta = await fetch("/api/questoes");
    const questoes: Questao[] = await resposta.json();
    if (!questoes.length) {
      dispatchQuestao({ tipo: "vazio" });
      return;
    }
    const escolhida = questoes[Math.floor(Math.random() * questoes.length)];
    localStorage.setItem(CHAVE_QUESTAO_ATUAL, JSON.stringify(escolhida));
    dispatchQuestao({ tipo: "definir", questao: escolhida });
  }, []);

  useEffect(() => {
    void sincronizarPendentesEAtualizar();
    if (lerQuestaoSalva()) return;
    void carregarProximaQuestao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sincronizarPendentesEAtualizar() {
    setPendentes(await contarPendentes());
  }

  async function handleConcluir(dados: DadosTentativaConcluida) {
    if (questao === "carregando" || questao === "vazio" || !questao) return;

    setSalvando(true);
    await enfileirarTentativa({
      questaoId: questao.id,
      ...dados,
      modo: "treino",
    });
    await sincronizarFila();
    setSalvando(false);
    await sincronizarPendentesEAtualizar();
    localStorage.removeItem(CHAVE_QUESTAO_ATUAL);
    await carregarProximaQuestao();
  }

  if (questao === "carregando") {
    return <CentroTela>Carregando questão…</CentroTela>;
  }

  if (questao === "vazio") {
    return (
      <CentroTela>
        <p className="max-w-sm text-center text-soft">
          Nenhuma questão cadastrada ainda. Cadastre tópicos e questões antes
          de iniciar uma sessão de treino.
        </p>
        <Link
          href="/questoes/nova"
          className="mt-4 rounded bg-ink px-4 py-2 text-white"
        >
          Cadastrar questão
        </Link>
      </CentroTela>
    );
  }

  const meta = metaSegundos(
    (questao.topicos[0]?.area ?? "aritmetica") as never,
    questao.nivel,
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between text-sm text-soft">
        <span>Treino livre</span>
        {pendentes > 0 && (
          <span>{pendentes} tentativa(s) aguardando envio</span>
        )}
      </header>

      <RegistroTentativa
        key={questao.id}
        questao={questao}
        metaSegundos={meta}
        salvando={salvando}
        onConcluir={handleConcluir}
      />
    </main>
  );
}

function CentroTela({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-ink">
      {children}
    </main>
  );
}
