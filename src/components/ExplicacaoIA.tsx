"use client";

import { useState } from "react";
import type { CausaErro } from "@/components/RegistroTentativa";
import { MathText } from "@/components/MathText";

type Nivel = "curta" | "passo_a_passo" | "por_que_erro_parecia_certo";

const ROTULO: Record<Nivel, string> = {
  curta: "Explicação curta",
  passo_a_passo: "Passo a passo",
  por_que_erro_parecia_certo: "Por que meu erro parecia certo",
};

type ExplicacaoResposta = {
  id: string;
  texto: string;
  util: boolean | null;
  deCache: boolean;
};

/**
 * Tarefa B (seção 5 do doc de produto): liberada só depois que o
 * usuário registrou a resposta. "Por que seu erro parecia certo" só
 * faz sentido depois de errar e declarar a causa.
 */
export function ExplicacaoIA({
  questaoId,
  acertou,
  alternativaEscolhida,
  causaErro,
  motivoDistrator,
  anotacao,
}: {
  questaoId: string;
  acertou: boolean;
  alternativaEscolhida?: string;
  causaErro?: CausaErro;
  motivoDistrator?: string;
  anotacao?: string;
}) {
  const [nivelAtivo, setNivelAtivo] = useState<Nivel | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ExplicacaoResposta | null>(null);

  const niveisDisponiveis: Nivel[] = acertou
    ? ["curta", "passo_a_passo"]
    : causaErro
      ? ["curta", "passo_a_passo", "por_que_erro_parecia_certo"]
      : ["curta", "passo_a_passo"];

  async function pedir(nivel: Nivel) {
    setNivelAtivo(nivel);
    setCarregando(true);
    setErro(null);
    setResultado(null);

    const resposta = await fetch("/api/ia/explicacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questaoId,
        nivel,
        alternativaEscolhida,
        causaErro,
        motivoDistrator,
        anotacao,
      }),
    });

    setCarregando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErro(corpo?.erro ?? "Não foi possível gerar a explicação agora.");
      return;
    }

    setResultado(await resposta.json());
  }

  async function marcarUtil(util: boolean) {
    if (!resultado) return;
    setResultado({ ...resultado, util });
    await fetch(`/api/ia/explicacao/${resultado.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ util }),
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-line bg-white/60 p-3">
      <div className="flex flex-wrap gap-2">
        {niveisDisponiveis.map((nivel) => (
          <button
            key={nivel}
            type="button"
            onClick={() => pedir(nivel)}
            className={`rounded border px-3 py-1 text-xs ${
              nivelAtivo === nivel
                ? "border-ink bg-ink text-white"
                : "border-line text-ink"
            }`}
          >
            {ROTULO[nivel]}
          </button>
        ))}
      </div>

      {carregando && <p className="text-sm text-soft">Gerando explicação…</p>}
      {erro && <p className="text-sm text-red">{erro}</p>}

      {resultado && !carregando && (
        <div className="flex flex-col gap-2">
          <div className="whitespace-pre-wrap text-sm text-ink leading-relaxed">
            <MathText text={resultado.texto} />
          </div>
          <p className="text-xs text-amber">Gerado por IA — impressão do modelo.</p>
          <div className="flex items-center gap-2 text-xs text-soft">
            <span>Foi útil?</span>
            <button
              type="button"
              onClick={() => marcarUtil(true)}
              className={resultado.util === true ? "font-semibold text-green" : ""}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => marcarUtil(false)}
              className={resultado.util === false ? "font-semibold text-red" : ""}
            >
              Não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
