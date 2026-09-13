"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { Cronometro } from "@/components/Cronometro";
import {
  enfileirarTentativa,
  contarPendentes,
  sincronizarFila,
} from "@/lib/fila-offline";
import { metaSegundos } from "@/lib/meta-tempo";

type Confianca = "certo" | "duvida" | "chute";
type CausaErro = "conceito" | "conta" | "leitura" | "tempo" | "distrator";

type Questao = {
  id: string;
  enunciado: string;
  alternativas: string[] | null;
  gabarito: string;
  tipo: "multipla" | "certo_errado" | "discursiva" | "calculo";
  nivel: "facil" | "medio" | "dificil";
  topicos: { id: string; area: string }[];
};

type Fase = "carregando" | "lendo" | "confianca" | "resposta" | "revisao" | "vazio";

type Estado = {
  fase: Fase;
  questao: Questao | null;
  area: string | null;
  inicioTimestamp: number | null;
  confiancaDeclarada: Confianca | null;
  respostaDada: string | null;
  segundosCongelados: number | null;
  acertou: boolean | null;
  causaErro: CausaErro | null;
  alternativaEscolhida: string | null;
  motivoDistrator: string;
  anotacao: string;
};

const ESTADO_INICIAL: Estado = {
  fase: "carregando",
  questao: null,
  area: null,
  inicioTimestamp: null,
  confiancaDeclarada: null,
  respostaDada: null,
  segundosCongelados: null,
  acertou: null,
  causaErro: null,
  alternativaEscolhida: null,
  motivoDistrator: "",
  anotacao: "",
};

const CHAVE_LOCAL = "sessao-treino-atual";

type Acao =
  | { tipo: "iniciarQuestao"; questao: Questao; area: string }
  | { tipo: "semQuestoes" }
  | { tipo: "irParaConfianca" }
  | { tipo: "declararConfianca"; confianca: Confianca }
  | { tipo: "submeterResposta"; resposta: string; segundos: number }
  | { tipo: "definirCausaErro"; causa: CausaErro | null }
  | { tipo: "definirMotivoDistrator"; motivo: string }
  | { tipo: "definirAnotacao"; anotacao: string }
  | { tipo: "restaurar"; estado: Estado }
  | { tipo: "resetar" };

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case "iniciarQuestao":
      return {
        ...ESTADO_INICIAL,
        fase: "lendo",
        questao: acao.questao,
        area: acao.area,
        inicioTimestamp: Date.now(),
      };
    case "semQuestoes":
      return { ...ESTADO_INICIAL, fase: "vazio" };
    case "irParaConfianca":
      return { ...estado, fase: "confianca" };
    case "declararConfianca":
      return { ...estado, confiancaDeclarada: acao.confianca, fase: "resposta" };
    case "submeterResposta": {
      const acertou = acao.resposta.trim() === estado.questao?.gabarito.trim();
      return {
        ...estado,
        respostaDada: acao.resposta,
        alternativaEscolhida: acao.resposta,
        segundosCongelados: acao.segundos,
        acertou,
        fase: "revisao",
      };
    }
    case "definirCausaErro":
      return { ...estado, causaErro: acao.causa };
    case "definirMotivoDistrator":
      return { ...estado, motivoDistrator: acao.motivo };
    case "definirAnotacao":
      return { ...estado, anotacao: acao.anotacao };
    case "restaurar":
      return acao.estado;
    case "resetar":
      return { ...ESTADO_INICIAL };
  }
}

export default function SessaoPage() {
  const [estado, dispatch] = useReducer(reducer, ESTADO_INICIAL);
  const [pendentes, setPendentes] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const carregarProximaQuestao = useCallback(async () => {
    const resposta = await fetch("/api/questoes");
    const questoes: Questao[] = await resposta.json();
    if (!questoes.length) {
      dispatch({ tipo: "semQuestoes" });
      return;
    }

    const escolhida = questoes[Math.floor(Math.random() * questoes.length)];

    localStorage.removeItem(CHAVE_LOCAL);
    dispatch({
      tipo: "iniciarQuestao",
      questao: escolhida,
      area: escolhida.topicos[0]?.area ?? "aritmetica",
    });
  }, []);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_LOCAL);
    if (salvo) {
      try {
        const estadoSalvo = JSON.parse(salvo) as Estado;
        if (estadoSalvo.questao) {
          dispatch({ tipo: "restaurar", estado: estadoSalvo });
          void sincronizarPendentes();
          return;
        }
      } catch {
        // ignora estado corrompido
      }
    }
    void carregarProximaQuestao();
    void sincronizarPendentes();
  }, [carregarProximaQuestao]);

  useEffect(() => {
    if (estado.fase !== "carregando" && estado.fase !== "vazio") {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify(estado));
    }
  }, [estado]);

  async function sincronizarPendentes() {
    setPendentes(await contarPendentes());
  }

  const meta = estado.area
    ? metaSegundos(estado.area as never, estado.questao?.nivel ?? "medio")
    : 90;

  async function salvarESeguir() {
    if (!estado.questao || estado.acertou === null) return;
    if (!estado.acertou && !estado.causaErro) return;

    setSalvando(true);
    await enfileirarTentativa({
      questaoId: estado.questao.id,
      segundos: estado.segundosCongelados,
      confiancaDeclarada: estado.confiancaDeclarada,
      respostaDada: estado.respostaDada,
      acertou: estado.acertou,
      causaErro: estado.causaErro ?? undefined,
      alternativaEscolhida: estado.alternativaEscolhida ?? undefined,
      motivoDistrator: estado.motivoDistrator || undefined,
      anotacao: estado.anotacao || undefined,
      modo: "treino",
    });
    localStorage.removeItem(CHAVE_LOCAL);
    await sincronizarFila();
    setSalvando(false);
    await sincronizarPendentes();
    await carregarProximaQuestao();
  }

  if (estado.fase === "carregando") {
    return <CentroTela>Carregando questão…</CentroTela>;
  }

  if (estado.fase === "vazio") {
    return (
      <CentroTela>
        <p className="max-w-sm text-center text-soft">
          Nenhuma questão cadastrada ainda. Cadastre tópicos e questões antes
          de iniciar uma sessão de treino.
        </p>
        <a href="/questoes/nova" className="mt-4 rounded bg-ink px-4 py-2 text-white">
          Cadastrar questão
        </a>
      </CentroTela>
    );
  }

  const questao = estado.questao!;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between text-sm text-soft">
        <span>Treino livre</span>
        {pendentes > 0 && <span>{pendentes} tentativa(s) aguardando envio</span>}
      </header>

      <Cronometro
        inicioTimestamp={estado.inicioTimestamp!}
        metaSegundos={meta}
        parado={estado.fase === "revisao"}
      />

      <section className="rounded border border-line bg-white/60 p-4">
        <p className="whitespace-pre-wrap text-base text-ink">
          {questao.enunciado}
        </p>
      </section>

      {estado.fase === "lendo" && (
        <button
          onClick={() => dispatch({ tipo: "irParaConfianca" })}
          className="rounded bg-ink px-4 py-4 text-lg text-white"
        >
          Já sei minha resposta
        </button>
      )}

      {estado.fase === "confianca" && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm text-soft">
            Antes de responder: qual sua confiança?
          </legend>
          <BotaoGrande onClick={() => dispatch({ tipo: "declararConfianca", confianca: "certo" })}>
            Certeza
          </BotaoGrande>
          <BotaoGrande onClick={() => dispatch({ tipo: "declararConfianca", confianca: "duvida" })}>
            Dúvida
          </BotaoGrande>
          <BotaoGrande onClick={() => dispatch({ tipo: "declararConfianca", confianca: "chute" })}>
            Chute
          </BotaoGrande>
        </fieldset>
      )}

      {estado.fase === "resposta" && (
        <RespostaForm
          questao={questao}
          inicioTimestamp={estado.inicioTimestamp!}
          onSubmeter={(resposta, segundos) =>
            dispatch({ tipo: "submeterResposta", resposta, segundos })
          }
        />
      )}

      {estado.fase === "revisao" && (
        <div className="flex flex-col gap-4">
          <div
            className={`rounded p-3 text-center font-semibold ${
              estado.acertou ? "bg-green/10 text-green" : "bg-red/10 text-red"
            }`}
          >
            {estado.acertou ? "Você acertou." : "Você errou."} Gabarito:{" "}
            {questao.gabarito}
          </div>

          {!estado.acertou && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm text-soft">Causa do erro</legend>
              {(["conceito", "conta", "leitura", "tempo", "distrator"] as const).map(
                (c) => (
                  <label key={c} className="flex items-center gap-2 text-ink">
                    <input
                      type="radio"
                      name="causaErro"
                      checked={estado.causaErro === c}
                      onChange={() => dispatch({ tipo: "definirCausaErro", causa: c })}
                    />
                    {c}
                  </label>
                ),
              )}
              {estado.causaErro === "distrator" && (
                <input
                  placeholder="Que erro esse distrator capturou?"
                  value={estado.motivoDistrator}
                  onChange={(e) =>
                    dispatch({ tipo: "definirMotivoDistrator", motivo: e.target.value })
                  }
                  className="rounded border border-line px-3 py-2"
                />
              )}
            </fieldset>
          )}

          <textarea
            placeholder="Anotação (opcional)"
            value={estado.anotacao}
            onChange={(e) => dispatch({ tipo: "definirAnotacao", anotacao: e.target.value })}
            className="rounded border border-line px-3 py-2"
          />

          <button
            onClick={salvarESeguir}
            disabled={salvando || (!estado.acertou && !estado.causaErro)}
            className="rounded bg-ink px-4 py-4 text-lg text-white disabled:opacity-50"
          >
            {salvando ? "Salvando…" : "Salvar e ir para a próxima"}
          </button>
        </div>
      )}
    </main>
  );
}

function RespostaForm({
  questao,
  inicioTimestamp,
  onSubmeter,
}: {
  questao: Questao;
  inicioTimestamp: number;
  onSubmeter: (resposta: string, segundos: number) => void;
}) {
  const [texto, setTexto] = useState("");

  if (questao.tipo === "multipla" || questao.tipo === "certo_errado") {
    const opcoes = questao.alternativas ?? ["Certo", "Errado"];
    return (
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm text-soft">Sua resposta</legend>
        {opcoes.map((op) => (
          <BotaoGrande
            key={op}
            onClick={() => {
              const segundos = Math.floor((Date.now() - inicioTimestamp) / 1000);
              onSubmeter(op, segundos);
            }}
          >
            {op}
          </BotaoGrande>
        ))}
      </fieldset>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!texto.trim()) return;
        const segundos = Math.floor((Date.now() - inicioTimestamp) / 1000);
        onSubmeter(texto.trim(), segundos);
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
  );
}

function BotaoGrande({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded border border-line bg-white px-4 py-4 text-lg text-ink active:bg-line/40"
    >
      {children}
    </button>
  );
}

function CentroTela({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-ink">
      {children}
    </main>
  );
}
