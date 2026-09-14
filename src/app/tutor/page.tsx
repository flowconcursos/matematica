"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";

type Mensagem = { role: "user" | "model"; texto: string };

type QuestaoRevisao = { id: string; questao: { id: string; enunciado: string } };

type Estado = "carregando" | "bloqueado" | "pronto";

function estadoReducer(_atual: Estado, novo: Estado): Estado {
  return novo;
}

export default function TutorPage() {
  const [estado, dispatchEstado] = useReducer(estadoReducer, "carregando" as Estado);
  const [questoesPendentes, setQuestoesPendentes] = useState<QuestaoRevisao[]>([]);
  const [questaoId, setQuestaoId] = useState<string>("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pedidosSolucao, setPedidosSolucao] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ia/tutor")
      .then((r) => r.json())
      .then((d) => dispatchEstado(d.bloqueadoPorSimulado ? "bloqueado" : "pronto"));
    fetch("/api/revisoes")
      .then((r) => r.json())
      .then((d) => setQuestoesPendentes(d.vencidas ?? []));
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviar = useCallback(
    async (texto: string, pedirSolucao = false) => {
      if (!texto.trim()) return;
      const novasMensagens: Mensagem[] = [...mensagens, { role: "user", texto }];
      setMensagens(novasMensagens);
      setEntrada("");
      setEnviando(true);
      setErro(null);

      const proximoPedidos = pedirSolucao ? pedidosSolucao + 1 : pedidosSolucao;
      if (pedirSolucao) setPedidosSolucao(proximoPedidos);

      const resposta = await fetch("/api/ia/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagens: novasMensagens,
          questaoId: questaoId || undefined,
          pedidosSolucaoCompleta: proximoPedidos,
        }),
      });

      setEnviando(false);

      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        setErro(corpo?.erro ?? "Não foi possível falar com o tutor agora.");
        return;
      }

      const corpo = await resposta.json();
      setMensagens((atual) => [...atual, { role: "model", texto: corpo.texto }]);
    },
    [mensagens, pedidosSolucao, questaoId],
  );

  if (estado === "carregando") {
    return <Centro>Carregando tutor…</Centro>;
  }

  if (estado === "bloqueado") {
    return (
      <Centro>
        <p className="max-w-sm text-center text-ink">
          Tutor bloqueado durante o simulado — modo prova não permite ajuda.
          Volte aqui depois de finalizar.
        </p>
        <Link href="/" className="mt-4 text-sm text-soft underline">
          Início
        </Link>
      </Centro>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Tutor</h1>
        <Link href="/" className="text-sm text-soft underline">
          Início
        </Link>
      </header>

      <label className="text-sm text-ink">
        Falando sobre (opcional)
        <select
          value={questaoId}
          onChange={(e) => {
            setQuestaoId(e.target.value);
            setPedidosSolucao(0);
          }}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        >
          <option value="">Nenhuma questão específica</option>
          {questoesPendentes.map((r) => (
            <option key={r.id} value={r.questao.id}>
              {r.questao.enunciado.slice(0, 60)}
              {r.questao.enunciado.length > 60 ? "…" : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded border border-line bg-white/40 p-3">
        {mensagens.length === 0 && (
          <p className="text-sm text-soft">
            Pergunte sobre conteúdo ou estratégia. Se escolher uma questão
            pendente de revisão acima, o tutor dá pistas em vez de resolver —
            você precisa pedir a solução completa duas vezes para recebê-la.
          </p>
        )}
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded p-2 text-sm ${
              m.role === "user"
                ? "self-end bg-ink text-white"
                : "self-start border border-line bg-white text-ink"
            }`}
          >
            {m.texto}
          </div>
        ))}
        <div ref={fimRef} />
      </div>

      {erro && <p className="text-sm text-red">{erro}</p>}

      {questaoId && (
        <button
          onClick={() => enviar("Quero a solução completa, por favor.", true)}
          disabled={enviando}
          className="self-start rounded border border-amber px-3 py-1 text-xs text-amber disabled:opacity-60"
        >
          Pedir a solução completa ({pedidosSolucao}/2)
        </button>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(entrada);
        }}
      >
        <input
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          placeholder="Sua pergunta…"
          className="flex-1 rounded border border-line px-3 py-2"
        />
        <button
          type="submit"
          disabled={enviando || !entrada.trim()}
          className="rounded bg-ink px-4 py-2 text-white disabled:opacity-60"
        >
          {enviando ? "…" : "Enviar"}
        </button>
      </form>
    </main>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center text-ink">
      {children}
    </main>
  );
}
