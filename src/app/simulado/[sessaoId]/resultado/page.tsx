"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Confianca = "certo" | "duvida" | "chute";
type CausaErro = "conceito" | "conta" | "leitura" | "tempo" | "distrator";

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
  questoes: { id: string; enunciado: string }[];
  respostas: Resposta[];
  indice: number;
};

type ResultadoItem = {
  questaoId: string;
  enunciado: string;
  gabarito: string;
  respostaDada: string;
  confiancaDeclarada: Confianca;
  segundos: number;
  acertou: boolean;
  causaErro?: CausaErro;
};

const CHAVE_SIMULADO_ATUAL = "simulado-atual";
const CAUSAS: CausaErro[] = ["conceito", "conta", "leitura", "tempo", "distrator"];

function calcularCurvaPorQuartil(itens: ResultadoItem[]) {
  const totalSegundos = itens.reduce((s, i) => s + i.segundos, 0);
  if (totalSegundos === 0) return [];

  const quartis = [0, 0, 0, 0];
  const acertosPorQuartil = [0, 0, 0, 0];
  let acumulado = 0;

  for (const item of itens) {
    const fracaoInicio = acumulado / totalSegundos;
    acumulado += item.segundos;
    const q = Math.min(3, Math.floor(fracaoInicio * 4));
    quartis[q]++;
    if (item.acertou) acertosPorQuartil[q]++;
  }

  return quartis.map((total, i) => ({
    quartil: i + 1,
    total,
    acertos: acertosPorQuartil[i],
    taxa: total > 0 ? acertosPorQuartil[i] / total : null,
  }));
}

export default function ResultadoSimuladoPage() {
  const { sessaoId } = useParams<{ sessaoId: string }>();
  const [itens, setItens] = useState<ResultadoItem[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const jaCorrigiuRef = useRef(false);

  useEffect(() => {
    if (jaCorrigiuRef.current) return;
    jaCorrigiuRef.current = true;

    async function corrigir() {
      const salvoLocal = localStorage.getItem(CHAVE_SIMULADO_ATUAL);
      if (!salvoLocal) {
        setErro("Não encontramos as respostas deste simulado neste navegador.");
        return;
      }
      const simulado = JSON.parse(salvoLocal) as SimuladoSalvo;
      if (simulado.sessaoId !== sessaoId) {
        setErro("Não encontramos as respostas deste simulado neste navegador.");
        return;
      }

      const resposta = await fetch(`/api/simulado/${sessaoId}/corrigir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas: simulado.respostas }),
      });

      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        setErro(corpo?.erro ?? "Não foi possível corrigir o simulado.");
        return;
      }

      const corpo = await resposta.json();
      setItens(
        corpo.resultados.map((r: ResultadoItem) => ({
          ...r,
          confiancaDeclarada:
            simulado.respostas.find((x) => x.questaoId === r.questaoId)
              ?.confiancaDeclarada ?? "chute",
        })),
      );
    }
    void corrigir();
  }, [sessaoId]);

  function definirCausa(questaoId: string, causa: CausaErro) {
    setItens((atual) =>
      atual
        ? atual.map((i) => (i.questaoId === questaoId ? { ...i, causaErro: causa } : i))
        : atual,
    );
  }

  async function salvar() {
    if (!itens) return;
    const faltaCausa = itens.some((i) => !i.acertou && !i.causaErro);
    if (faltaCausa) {
      setErro("Marque a causa do erro de todas as questões erradas antes de salvar.");
      return;
    }

    setSalvando(true);
    setErro(null);

    const resposta = await fetch(`/api/simulado/${sessaoId}/finalizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        respostas: itens.map((i) => ({
          questaoId: i.questaoId,
          confiancaDeclarada: i.confiancaDeclarada,
          respostaDada: i.respostaDada,
          segundos: i.segundos,
          causaErro: i.causaErro,
        })),
      }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErro(corpo?.erro ?? "Não foi possível salvar o simulado.");
      return;
    }

    localStorage.removeItem(CHAVE_SIMULADO_ATUAL);
    setSalvo(true);
  }

  if (salvo) {
    return (
      <Centro>
        <p className="text-ink">
          Simulado salvo. Erradas já entraram no caderno de erros.
        </p>
        <div className="mt-4 flex gap-4">
          <Link href="/simulado" className="text-sm text-ink underline">
            Ver histórico de simulados
          </Link>
          <Link href="/" className="text-sm text-soft underline">
            Início
          </Link>
        </div>
      </Centro>
    );
  }

  if (erro && !itens) {
    return (
      <Centro>
        <p className="max-w-sm text-center text-red">{erro}</p>
      </Centro>
    );
  }

  if (!itens) {
    return <Centro>Corrigindo simulado…</Centro>;
  }

  const acertos = itens.filter((i) => i.acertou).length;
  const curva = calcularCurvaPorQuartil(itens);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Resultado do simulado</h1>
      </header>

      <div className="rounded border border-line bg-white/60 p-4 text-center">
        <p className="font-mono text-3xl tabular-nums text-ink">
          {acertos}/{itens.length}
        </p>
        <p className="text-sm text-soft">acertos brutos</p>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink">
          Curva de acerto ao longo do tempo decorrido
        </h2>
        <p className="mb-2 text-xs text-soft">
          Mede resistência, não conhecimento: acerto caindo no fim indica cansaço.
        </p>
        <div className="flex gap-2">
          {curva.map((q) => (
            <div key={q.quartil} className="flex-1 text-center">
              <div className="h-16 rounded bg-line/40">
                {q.taxa !== null && (
                  <div
                    className="w-full rounded bg-ink"
                    style={{ height: `${q.taxa * 100}%`, marginTop: `${(1 - q.taxa) * 100}%` }}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-soft">
                {q.total > 0 ? `${Math.round((q.taxa ?? 0) * 100)}%` : "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">Questão a questão</h2>
        {itens.map((item, i) => (
          <div
            key={item.questaoId}
            className={`rounded border p-3 ${
              item.acertou ? "border-line bg-white/40" : "border-red/40 bg-red/5"
            }`}
          >
            <p className="text-xs text-soft">
              Questão {i + 1} · {item.segundos}s
            </p>
            <p className="text-sm text-ink">{item.enunciado.slice(0, 100)}</p>
            <p className="mt-1 text-sm">
              Sua resposta: {item.respostaDada} — Gabarito: {item.gabarito}
            </p>

            {!item.acertou && (
              <fieldset className="mt-2 flex flex-wrap gap-2">
                {CAUSAS.map((c) => (
                  <label
                    key={c}
                    className={`cursor-pointer rounded border px-2 py-1 text-xs ${
                      item.causaErro === c
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`causa-${item.questaoId}`}
                      className="hidden"
                      checked={item.causaErro === c}
                      onChange={() => definirCausa(item.questaoId, c)}
                    />
                    {c}
                  </label>
                ))}
              </fieldset>
            )}
          </div>
        ))}
      </section>

      {erro && <p className="text-sm text-red">{erro}</p>}

      <button
        onClick={salvar}
        disabled={salvando}
        className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
      >
        {salvando ? "Salvando…" : "Salvar resultado"}
      </button>
    </main>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center text-ink">
      {children}
    </main>
  );
}
