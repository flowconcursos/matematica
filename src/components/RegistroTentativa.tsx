"use client";

import { useEffect, useReducer, useState } from "react";
import { Cronometro } from "@/components/Cronometro";
import { ExplicacaoIA } from "@/components/ExplicacaoIA";
import { MathText } from "@/components/MathText";
import { RascunhoDigital } from "@/components/RascunhoDigital";

export type Confianca = "certo" | "duvida" | "chute";
export type CausaErro = "conceito" | "conta" | "leitura" | "tempo" | "distrator";

export type QuestaoParaRegistro = {
  id: string;
  enunciado: string;
  alternativas: string[] | null;
  gabarito: string;
  tipo: "multipla" | "certo_errado" | "discursiva" | "calculo";
};

export type DadosTentativaConcluida = {
  confiancaDeclarada: Confianca;
  respostaDada: string;
  segundos: number;
  acertou: boolean;
  causaErro?: CausaErro;
  alternativaEscolhida?: string;
  motivoDistrator?: string;
  anotacao?: string;
};

type Fase = "lendo" | "confianca" | "resposta" | "revisao";

type Estado = {
  fase: Fase;
  inicioTimestamp: number;
  confiancaDeclarada: Confianca | null;
  respostaDada: string | null;
  segundosCongelados: number | null;
  acertou: boolean | null;
  causaErro: CausaErro | null;
  alternativaEscolhida: string | null;
  motivoDistrator: string;
  anotacao: string;
};

function estadoInicial(inicioTimestamp: number): Estado {
  return {
    fase: "lendo",
    inicioTimestamp,
    confiancaDeclarada: null,
    respostaDada: null,
    segundosCongelados: null,
    acertou: null,
    causaErro: null,
    alternativaEscolhida: null,
    motivoDistrator: "",
    anotacao: "",
  };
}

type Acao =
  | { tipo: "irParaConfianca" }
  | { tipo: "declararConfianca"; confianca: Confianca }
  | { tipo: "submeterResposta"; resposta: string; segundos: number; gabarito: string }
  | { tipo: "definirCausaErro"; causa: CausaErro | null }
  | { tipo: "definirMotivoDistrator"; motivo: string }
  | { tipo: "definirAnotacao"; anotacao: string }
  | { tipo: "restaurar"; estado: Estado };

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case "irParaConfianca":
      return { ...estado, fase: "confianca" };
    case "declararConfianca":
      return { ...estado, confiancaDeclarada: acao.confianca, fase: "resposta" };
    case "submeterResposta": {
      const acertou = acao.resposta.trim() === acao.gabarito.trim();
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
  }
}

/**
 * Fluxo de registro compartilhado entre treino livre e caderno de
 * erros: cronômetro + ordem obrigatória e não invertível (seção 4.1) —
 * confiança declarada, resposta dada, gabarito revelado, causa do erro.
 * Persiste em localStorage por questão para sobreviver a reload.
 */
export function RegistroTentativa({
  questao,
  metaSegundos,
  anotacaoLabelAcerto = "Anotação (opcional)",
  anotacaoLabelErro = "Anotação (opcional)",
  textoBotaoSalvar = "Salvar e ir para a próxima",
  salvando,
  onConcluir,
}: {
  questao: QuestaoParaRegistro;
  metaSegundos: number;
  anotacaoLabelAcerto?: string;
  anotacaoLabelErro?: string;
  textoBotaoSalvar?: string;
  salvando: boolean;
  onConcluir: (dados: DadosTentativaConcluida) => void | Promise<void>;
}) {
  const chaveLocal = `registro-tentativa-${questao.id}`;
  const [estado, dispatch] = useReducer(
    reducer,
    undefined,
    () => estadoInicial(Date.now()),
  );

  useEffect(() => {
    const salvo = typeof window !== "undefined" && localStorage.getItem(chaveLocal);
    if (salvo) {
      try {
        dispatch({ tipo: "restaurar", estado: JSON.parse(salvo) as Estado });
      } catch {
        // ignora estado corrompido
      }
    }
  }, [chaveLocal]);

  useEffect(() => {
    localStorage.setItem(chaveLocal, JSON.stringify(estado));
  }, [chaveLocal, estado]);

  async function salvar() {
    if (estado.acertou === null || estado.segundosCongelados === null) return;
    if (!estado.acertou && !estado.causaErro) return;

    await onConcluir({
      confiancaDeclarada: estado.confiancaDeclarada!,
      respostaDada: estado.respostaDada!,
      segundos: estado.segundosCongelados,
      acertou: estado.acertou,
      causaErro: estado.causaErro ?? undefined,
      alternativaEscolhida: estado.alternativaEscolhida ?? undefined,
      motivoDistrator: estado.motivoDistrator || undefined,
      anotacao: estado.anotacao || undefined,
    });
    localStorage.removeItem(chaveLocal);
  }

  return (
    <div className="flex flex-col gap-6">
      <Cronometro
        inicioTimestamp={estado.inicioTimestamp}
        metaSegundos={metaSegundos}
        parado={estado.fase === "revisao"}
      />

      <section className="rounded-xl border border-line bg-surface p-5 shadow-xs">
        <div className="whitespace-pre-wrap text-base leading-relaxed text-ink">
          <MathText text={questao.enunciado} />
        </div>
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
          inicioTimestamp={estado.inicioTimestamp}
          onSubmeter={(resposta, segundos) =>
            dispatch({ tipo: "submeterResposta", resposta, segundos, gabarito: questao.gabarito })
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
            <strong className="font-bold"><MathText text={questao.gabarito} /></strong>
          </div>

          {!estado.acertou && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm text-soft">Causa do erro</legend>
              {(["conceito", "conta", "leitura", "tempo", "distrator"] as const).map((c) => (
                <label key={c} className="flex items-center gap-2 text-ink">
                  <input
                    type="radio"
                    name="causaErro"
                    checked={estado.causaErro === c}
                    onChange={() => dispatch({ tipo: "definirCausaErro", causa: c })}
                  />
                  {c}
                </label>
              ))}
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
            placeholder={estado.acertou ? anotacaoLabelAcerto : anotacaoLabelErro}
            value={estado.anotacao}
            onChange={(e) => dispatch({ tipo: "definirAnotacao", anotacao: e.target.value })}
            className="rounded border border-line px-3 py-2"
          />

          <ExplicacaoIA
            questaoId={questao.id}
            acertou={estado.acertou ?? false}
            alternativaEscolhida={estado.alternativaEscolhida ?? undefined}
            causaErro={estado.causaErro ?? undefined}
            motivoDistrator={estado.motivoDistrator || undefined}
            anotacao={estado.anotacao || undefined}
          />

          <button
            onClick={salvar}
            disabled={salvando || (!estado.acertou && !estado.causaErro)}
            className="rounded bg-ink px-4 py-4 text-lg text-white disabled:opacity-50"
          >
            {salvando ? "Salvando…" : textoBotaoSalvar}
          </button>
        </div>
      )}

      {/* Rascunho Digital Flutuante */}
      <RascunhoDigital />
    </div>
  );
}

function RespostaForm({
  questao,
  inicioTimestamp,
  onSubmeter,
}: {
  questao: QuestaoParaRegistro;
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
            <MathText text={op} />
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
