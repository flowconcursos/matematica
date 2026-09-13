"use client";

import { useEffect, useReducer, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CronometroTotal } from "@/components/CronometroTotal";

type Confianca = "certo" | "duvida" | "chute";

type Questao = {
  id: string;
  enunciado: string;
  alternativas: string[] | null;
  tipo: "multipla" | "certo_errado" | "discursiva" | "calculo";
  nivel: "facil" | "medio" | "dificil";
};

type Resposta = {
  questaoId: string;
  confiancaDeclarada: Confianca;
  respostaDada: string;
  segundos: number;
};

type SimuladoSalvo = {
  sessaoId: string;
  metaSegundos: number;
  inicioTimestamp: number;
  questoes: Questao[];
  respostas: Resposta[];
  indice: number;
};

const CHAVE_SIMULADO_ATUAL = "simulado-atual";

function lerSimuladoSalvo(sessaoId: string): SimuladoSalvo | null {
  if (typeof window === "undefined") return null;
  const salvo = localStorage.getItem(CHAVE_SIMULADO_ATUAL);
  if (!salvo) return null;
  try {
    const simulado = JSON.parse(salvo) as SimuladoSalvo;
    return simulado.sessaoId === sessaoId ? simulado : null;
  } catch {
    return null;
  }
}

type EstadoPagina = SimuladoSalvo | "invalido";

function reducer(_estado: EstadoPagina, novoEstado: EstadoPagina): EstadoPagina {
  return novoEstado;
}

export default function SimuladoExecucaoPage() {
  const { sessaoId } = useParams<{ sessaoId: string }>();
  const router = useRouter();
  const [estado, dispatch] = useReducer(
    reducer,
    undefined,
    () => lerSimuladoSalvo(sessaoId) ?? ("invalido" as EstadoPagina),
  );

  useEffect(() => {
    if (estado !== "invalido") {
      localStorage.setItem(CHAVE_SIMULADO_ATUAL, JSON.stringify(estado));
    }
  }, [estado]);

  if (estado === "invalido") {
    return (
      <Centro>
        <p className="max-w-sm text-center text-soft">
          Não encontramos este simulado em andamento neste navegador.
        </p>
      </Centro>
    );
  }

  function registrarResposta(resposta: Resposta) {
    if (estado === "invalido") return;
    const respostas = [...estado.respostas];
    respostas[estado.indice] = resposta;
    const proximoIndice = estado.indice + 1;

    if (proximoIndice >= estado.questoes.length) {
      localStorage.setItem(
        CHAVE_SIMULADO_ATUAL,
        JSON.stringify({ ...estado, respostas, indice: proximoIndice }),
      );
      router.push(`/simulado/${sessaoId}/resultado`);
      return;
    }

    dispatch({ ...estado, respostas, indice: proximoIndice });
  }

  function tempoEsgotado() {
    if (estado === "invalido") return;
    const respostas = [...estado.respostas];
    for (let i = estado.indice; i < estado.questoes.length; i++) {
      if (!respostas[i]) {
        respostas[i] = {
          questaoId: estado.questoes[i].id,
          confiancaDeclarada: "chute",
          respostaDada: "(sem resposta — tempo esgotado)",
          segundos: 0,
        };
      }
    }
    localStorage.setItem(
      CHAVE_SIMULADO_ATUAL,
      JSON.stringify({ ...estado, respostas, indice: estado.questoes.length }),
    );
    router.push(`/simulado/${sessaoId}/resultado`);
  }

  const questaoAtual = estado.questoes[estado.indice];

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <span className="text-sm text-soft">
          Questão {estado.indice + 1} de {estado.questoes.length}
        </span>
        <CronometroTotal
          inicioTimestamp={estado.inicioTimestamp}
          metaSegundos={estado.metaSegundos}
          onEsgotar={tempoEsgotado}
        />
      </header>

      <PerguntaSimulado
        key={estado.indice}
        questao={questaoAtual}
        onResponder={(confianca, resposta, segundos) =>
          registrarResposta({
            questaoId: questaoAtual.id,
            confiancaDeclarada: confianca,
            respostaDada: resposta,
            segundos,
          })
        }
      />
    </main>
  );
}

function PerguntaSimulado({
  questao,
  onResponder,
}: {
  questao: Questao;
  onResponder: (confianca: Confianca, resposta: string, segundos: number) => void;
}) {
  const [fase, setFase] = useState<"lendo" | "confianca" | "resposta">("lendo");
  const [confianca, setConfianca] = useState<Confianca | null>(null);
  const [inicio] = useState(() => Date.now());
  const [texto, setTexto] = useState("");

  return (
    <>
      <section className="rounded border border-line bg-white/60 p-4">
        <p className="whitespace-pre-wrap text-ink">{questao.enunciado}</p>
      </section>

      {fase === "lendo" && (
        <button
          onClick={() => setFase("confianca")}
          className="rounded bg-ink px-4 py-4 text-lg text-white"
        >
          Já sei minha resposta
        </button>
      )}

      {fase === "confianca" && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm text-soft">Qual sua confiança?</legend>
          {(["certo", "duvida", "chute"] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                setConfianca(c);
                setFase("resposta");
              }}
              className="rounded border border-line bg-white px-4 py-4 text-lg text-ink"
            >
              {c === "certo" ? "Certeza" : c === "duvida" ? "Dúvida" : "Chute"}
            </button>
          ))}
        </fieldset>
      )}

      {fase === "resposta" &&
        (questao.tipo === "multipla" || questao.tipo === "certo_errado" ? (
          <fieldset className="flex flex-col gap-3">
            {(questao.alternativas ?? ["Certo", "Errado"]).map((op) => (
              <button
                key={op}
                onClick={() => {
                  const segundos = Math.floor((Date.now() - inicio) / 1000);
                  onResponder(confianca!, op, segundos);
                }}
                className="rounded border border-line bg-white px-4 py-4 text-lg text-ink"
              >
                {op}
              </button>
            ))}
          </fieldset>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!texto.trim()) return;
              const segundos = Math.floor((Date.now() - inicio) / 1000);
              onResponder(confianca!, texto.trim(), segundos);
            }}
            className="flex flex-col gap-3"
          >
            <input
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Sua resposta"
              className="rounded border border-line px-3 py-3 text-lg"
            />
            <button type="submit" className="rounded bg-ink px-4 py-4 text-lg text-white">
              Responder
            </button>
          </form>
        ))}
    </>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center text-ink">
      {children}
    </main>
  );
}
