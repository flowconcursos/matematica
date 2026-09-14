"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import {
  RegistroTentativa,
  type DadosTentativaConcluida,
} from "@/components/RegistroTentativa";
import {
  enfileirarTentativa,
  contarPendentes,
  sincronizarFila,
} from "@/lib/fila-offline";
import { metaSegundos } from "@/lib/meta-tempo";

type QuestaoRevisao = {
  id: string;
  enunciado: string;
  alternativas: string[] | null;
  gabarito: string;
  tipo: "multipla" | "certo_errado" | "discursiva" | "calculo";
  nivel: "facil" | "medio" | "dificil";
  topicos: { id: string; nome: string; area: string }[];
};

type ItemRevisao = {
  id: string;
  questao: QuestaoRevisao;
  ultimaAnotacao: string | null;
  errosAcumulados: number;
  heuristicasAtivas: { id: string; texto: string }[];
};

type Fila = { vencidas: ItemRevisao[]; alertas: ItemRevisao[] } | "carregando";

type FilaAcao = { tipo: "definir"; fila: { vencidas: ItemRevisao[]; alertas: ItemRevisao[] } };

function filaReducer(_estado: Fila, acao: FilaAcao): Fila {
  return acao.fila;
}

function contadorReducer(_estado: number, novoValor: number): number {
  return novoValor;
}

export default function CadernoPage() {
  const [fila, dispatchFila] = useReducer(filaReducer, "carregando" as Fila);
  const [pendentes, dispatchPendentes] = useReducer(contadorReducer, 0);
  const [salvando, setSalvando] = useState(false);

  const carregarFila = useCallback(async () => {
    const resposta = await fetch("/api/revisoes");
    const dados = await resposta.json();
    dispatchFila({ tipo: "definir", fila: dados });
  }, []);

  const atualizarPendentes = useCallback(async () => {
    dispatchPendentes(await contarPendentes());
  }, []);

  useEffect(() => {
    void carregarFila();
    void atualizarPendentes();
  }, [carregarFila, atualizarPendentes]);

  async function handleConcluir(item: ItemRevisao, dados: DadosTentativaConcluida) {
    setSalvando(true);
    await enfileirarTentativa({
      questaoId: item.questao.id,
      ...dados,
      modo: "revisao",
    });
    await sincronizarFila();
    setSalvando(false);
    await atualizarPendentes();
    await carregarFila();
  }

  if (fila === "carregando") {
    return <CentroTela>Carregando caderno de erros…</CentroTela>;
  }

  const atual = fila.vencidas[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between text-sm text-soft">
        <span>Caderno de erros</span>
        <div className="flex flex-col items-end text-right">
          <span>{fila.vencidas.length} vencida(s) hoje</span>
          {pendentes > 0 && <span>{pendentes} tentativa(s) aguardando envio</span>}
        </div>
      </header>

      {fila.alertas.length > 0 && (
        <section className="rounded border border-amber bg-amber/10 p-3">
          <h2 className="mb-2 text-sm font-semibold text-amber">
            Possível buraco de pré-requisito
          </h2>
          <ul className="flex flex-col gap-2">
            {fila.alertas.map((item) => (
              <li key={item.id} className="text-sm text-ink">
                Errou {item.errosAcumulados}x seguidas em &ldquo;
                {item.questao.enunciado.slice(0, 60)}
                {item.questao.enunciado.length > 60 ? "…" : ""}&rdquo;
                {item.questao.topicos[0] && ` (${item.questao.topicos[0].nome})`}.
                A trilha de base vai tratar isso na Fase 4 — por enquanto, fica
                fora da fila normal como alerta.
              </li>
            ))}
          </ul>
        </section>
      )}

      {!atual && (
        <CentroTelaConteudo>
          <p className="max-w-sm text-center text-soft">
            Nenhuma revisão vencida hoje. Volte quando o app avisar que há
            itens para refazer.
          </p>
        </CentroTelaConteudo>
      )}

      {atual && (
        <>
          {atual.ultimaAnotacao && (
            <div className="rounded border border-line bg-white/60 p-3 text-sm text-soft">
              Sua nota da vez passada: {atual.ultimaAnotacao}
            </div>
          )}

          {atual.heuristicasAtivas.length > 0 && (
            <div className="rounded border border-green/40 bg-green/5 p-3 text-sm text-ink">
              <p className="mb-1 text-xs font-semibold text-green">
                Heurística(s) deste tópico
              </p>
              <ul className="flex flex-col gap-1">
                {atual.heuristicasAtivas.map((h) => (
                  <li key={h.id}>{h.texto}</li>
                ))}
              </ul>
            </div>
          )}

          <RegistroTentativa
            key={atual.id}
            questao={atual.questao}
            metaSegundos={metaSegundos(
              (atual.questao.topicos[0]?.area ?? "aritmetica") as never,
              atual.questao.nivel,
            )}
            salvando={salvando}
            textoBotaoSalvar="Salvar e ir para a próxima revisão"
            anotacaoLabelErro="O que mudou desta vez?"
            onConcluir={(dados) => handleConcluir(atual, dados)}
          />
        </>
      )}
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

function CentroTelaConteudo({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {children}
    </div>
  );
}
