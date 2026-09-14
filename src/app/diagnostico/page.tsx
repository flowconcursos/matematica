"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";

type Diagnostico = {
  id: string;
  geradoEm: string;
  periodoAnalisado: string;
  hipotesePrincipal: string;
  prescricao: string;
  modelo: string;
  evidencias: {
    evidencias: { afirmacao: string; numero: string }[];
    comoDerrubarHipotese: string[];
    comparacaoComAnterior: string | null;
  };
};

type Estado = {
  historico: Diagnostico[];
  tentativasDesdeUltimo: number;
  elegivel: boolean;
} | "carregando";

function estadoReducer(_atual: Estado, novo: Exclude<Estado, "carregando">): Estado {
  return novo;
}

export default function DiagnosticoPage() {
  const [estado, dispatch] = useReducer(estadoReducer, "carregando" as Estado);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const resposta = await fetch("/api/diagnostico");
    dispatch(await resposta.json());
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function gerar() {
    setGerando(true);
    setErro(null);
    const resposta = await fetch("/api/diagnostico/gerar", { method: "POST" });
    setGerando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErro(corpo?.erro ?? "Não foi possível gerar o diagnóstico agora.");
      return;
    }
    await carregar();
  }

  if (estado === "carregando") {
    return <Centro>Carregando diagnóstico…</Centro>;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Diagnóstico periódico</h1>
        <Link href="/" className="text-sm text-soft underline">
          Início
        </Link>
      </header>

      <p className="text-sm text-soft">
        A cada 7 dias ou 100 tentativas, analisa os agregados do período (não
        a base inteira) e testa se a sua autoavaliação de erro por tempo e
        desatenção se sustenta nos dados — ou se é fluência frágil disfarçada.
      </p>

      <div className="rounded border border-line bg-white/60 p-3 text-sm text-ink">
        <p>{estado.tentativasDesdeUltimo} tentativa(s) desde o último diagnóstico.</p>
        {!estado.elegivel && (
          <p className="text-xs text-soft">
            Ainda não elegível — faltam dias ou tentativas para o próximo.
          </p>
        )}
      </div>

      <button
        onClick={gerar}
        disabled={gerando || !estado.elegivel}
        className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
      >
        {gerando ? "Analisando…" : "Gerar novo diagnóstico"}
      </button>

      {erro && <p className="text-sm text-red">{erro}</p>}

      {estado.historico.length === 0 && (
        <p className="text-sm text-soft">Nenhum diagnóstico gerado ainda.</p>
      )}

      <section className="flex flex-col gap-4">
        {estado.historico.map((d) => (
          <article key={d.id} className="rounded border border-line bg-white/40 p-4">
            <p className="text-xs text-soft">
              {new Date(d.geradoEm).toLocaleDateString("pt-BR")} · período: {d.periodoAnalisado}
            </p>
            <h2 className="mt-1 text-sm font-semibold text-ink">{d.hipotesePrincipal}</h2>

            {d.evidencias.comparacaoComAnterior && (
              <p className="mt-2 rounded border border-amber/40 bg-amber/10 p-2 text-xs text-amber">
                {d.evidencias.comparacaoComAnterior}
              </p>
            )}

            <ul className="mt-2 flex flex-col gap-1 text-sm text-ink">
              {d.evidencias.evidencias.map((e, i) => (
                <li key={i}>
                  {e.afirmacao} <span className="text-soft">({e.numero})</span>
                </li>
              ))}
            </ul>

            <p className="mt-2 text-xs font-semibold text-soft">O que observar para derrubar a hipótese:</p>
            <ul className="mt-1 flex flex-col gap-1 text-xs text-soft">
              {d.evidencias.comoDerrubarHipotese.map((c, i) => (
                <li key={i}>· {c}</li>
              ))}
            </ul>

            <p className="mt-2 text-sm text-ink">
              <span className="font-semibold">Prescrição da semana: </span>
              {d.prescricao}
            </p>
          </article>
        ))}
      </section>
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
