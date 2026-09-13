"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Observado = {
  distribuicaoPorTopico: { topico: string; contagem: number }[];
  distribuicaoPorTipo: { tipo: string; contagem: number }[];
  tempoMedioSegundos: number;
  nQuestoes: number;
};

type Dossie = {
  versao: number;
  geradoEm: string;
  conteudo: { inferido: string; conhecimentoGeral: string };
} | null;

type Resposta = {
  banca: string;
  observado: Observado;
  confiabilidade: "baixa" | "media" | "alta";
  dossie: Dossie;
  podeGerar: boolean;
  proximaGeracaoDisponivelEm: string | null;
};

type Estado = Resposta | "carregando" | "sem_dados";

function reducer(_estado: Estado, novo: Estado): Estado {
  return novo;
}

const ROTULO_CONFIABILIDADE = {
  baixa: "Confiabilidade baixa",
  media: "Confiabilidade média",
  alta: "Confiabilidade alta",
};

export default function DossieBancaPage() {
  const { banca } = useParams<{ banca: string }>();
  const [estado, dispatch] = useReducer(reducer, "carregando" as Estado);
  const [gerando, setGerando] = useState(false);
  const [erroGeracao, setErroGeracao] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const resposta = await fetch(`/api/dossie/${banca}`);
    if (!resposta.ok) {
      dispatch("sem_dados");
      return;
    }
    dispatch(await resposta.json());
  }, [banca]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function gerarDossie() {
    setGerando(true);
    setErroGeracao(null);
    const resposta = await fetch(`/api/dossie/${banca}/gerar`, { method: "POST" });
    setGerando(false);
    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErroGeracao(corpo?.erro ?? "Não foi possível gerar o dossiê agora.");
      return;
    }
    await carregar();
  }

  if (estado === "carregando") {
    return <Centro>Carregando…</Centro>;
  }

  if (estado === "sem_dados") {
    return (
      <Centro>
        <p className="max-w-sm text-center text-soft">
          Sem questões registradas desta banca ainda. Não há dossiê — falta
          coletar dados: cadastre ou importe questões informando esta banca.
        </p>
        <Link href="/dossie" className="mt-4 text-sm text-ink underline">
          Voltar
        </Link>
      </Centro>
    );
  }

  const nomeBanca = decodeURIComponent(banca);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">{nomeBanca}</h1>
        <Link href="/dossie" className="text-sm text-soft underline">
          Voltar
        </Link>
      </header>

      <p className="text-xs text-soft">
        {estado.observado.nQuestoes} questão(ões) registrada(s) ·{" "}
        {ROTULO_CONFIABILIDADE[estado.confiabilidade]}
      </p>

      <section className="rounded border-2 border-ink bg-white/60 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink">
          Observado
        </h2>
        <p className="mb-2 text-xs text-soft">Extraído dos seus dados, com contagem.</p>

        <p className="mb-1 text-sm text-ink">Distribuição por tópico:</p>
        <ul className="mb-3 text-sm text-soft">
          {estado.observado.distribuicaoPorTopico.map((t) => (
            <li key={t.topico}>
              {t.topico}: {t.contagem}
            </li>
          ))}
        </ul>

        <p className="mb-1 text-sm text-ink">Distribuição por tipo:</p>
        <ul className="mb-3 text-sm text-soft">
          {estado.observado.distribuicaoPorTipo.map((t) => (
            <li key={t.tipo}>
              {t.tipo}: {t.contagem}
            </li>
          ))}
        </ul>

        <p className="text-sm text-ink">
          Tempo médio observado: {Math.round(estado.observado.tempoMedioSegundos)}s
        </p>
      </section>

      <section className="rounded border border-amber bg-amber/10 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber">
          Inferido
        </h2>
        <p className="mb-2 text-xs text-soft">
          Padrão visto nos dados, amostra pequena — leia com ressalva.
        </p>
        <p className="whitespace-pre-wrap text-sm text-ink">
          {estado.dossie?.conteudo.inferido ?? "Ainda não gerado."}
        </p>
      </section>

      <section className="rounded border border-line bg-white/40 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-soft">
          Conhecimento geral
        </h2>
        <p className="mb-2 text-xs text-soft">
          Impressão do modelo, sem lastro nos seus dados — não verificada.
        </p>
        <p className="whitespace-pre-wrap text-sm text-ink">
          {estado.dossie?.conteudo.conhecimentoGeral ?? "Ainda não gerado."}
        </p>
      </section>

      {estado.dossie && (
        <p className="text-xs text-soft">
          Versão {estado.dossie.versao}, gerado em{" "}
          {new Date(estado.dossie.geradoEm).toLocaleDateString("pt-BR")}
        </p>
      )}

      {erroGeracao && <p className="text-sm text-red">{erroGeracao}</p>}

      <button
        onClick={gerarDossie}
        disabled={gerando || !estado.podeGerar}
        className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
      >
        {gerando
          ? "Gerando…"
          : estado.dossie
            ? "Atualizar dossiê"
            : "Gerar dossiê"}
      </button>
      {!estado.podeGerar && estado.proximaGeracaoDisponivelEm && (
        <p className="text-xs text-soft">
          Próxima geração disponível em{" "}
          {new Date(estado.proximaGeracaoDisponivelEm).toLocaleDateString("pt-BR")}{" "}
          (no máximo 1x por semana).
        </p>
      )}
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
