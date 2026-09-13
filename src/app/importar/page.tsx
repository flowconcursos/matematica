"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Topico = { id: string; nome: string };

type ItemExtraido = {
  enunciado: string;
  alternativas: string[];
  gabarito: string;
  tipo: "multipla" | "certo_errado" | "discursiva" | "calculo";
  banca: string;
  ano: number;
  orgao: string;
  cargo: string;
  nivel: "facil" | "medio" | "dificil";
  topicoNomesSugeridos: string[];
  duplicataDe: { id: string; enunciado: string; similaridade: number } | null;
};

const TIPOS = ["multipla", "certo_errado", "discursiva", "calculo"] as const;
const NIVEIS = ["facil", "medio", "dificil"] as const;

export default function ImportarPage() {
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [texto, setTexto] = useState("");
  const [extraindo, setExtraindo] = useState(false);
  const [erroExtracao, setErroExtracao] = useState<string | null>(null);
  const [itens, setItens] = useState<ItemExtraido[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [aprovados, setAprovados] = useState(0);
  const [descartados, setDescartados] = useState(0);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/topicos")
      .then((r) => r.json())
      .then(setTopicos);
  }, []);

  async function extrair() {
    const arquivo = inputArquivoRef.current?.files?.[0];
    if (!arquivo && !texto.trim()) {
      setErroExtracao("Envie um PDF ou cole o texto da prova.");
      return;
    }

    setExtraindo(true);
    setErroExtracao(null);

    const formData = new FormData();
    if (arquivo) {
      formData.append("arquivo", arquivo);
      setNomeArquivo(arquivo.name);
    } else {
      formData.append("texto", texto);
    }

    const resposta = await fetch("/api/importacao/extrair", {
      method: "POST",
      body: formData,
    });

    setExtraindo(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => null);
      setErroExtracao(corpo?.erro ?? "Não foi possível extrair as questões.");
      return;
    }

    const corpo = await resposta.json();
    if (corpo.itens.length === 0) {
      setErroExtracao("Nenhuma questão foi identificada no material enviado.");
      return;
    }
    setItens(corpo.itens);
    setIndice(0);
    setAprovados(0);
    setDescartados(0);
  }

  async function aprovarItem(item: ItemExtraido, topicoIds: string[]) {
    await fetch("/api/questoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enunciado: item.enunciado,
        alternativas: item.tipo === "multipla" ? item.alternativas : undefined,
        gabarito: item.gabarito,
        tipo: item.tipo,
        nivel: item.nivel,
        banca: item.banca || undefined,
        ano: item.ano || undefined,
        orgao: item.orgao || undefined,
        cargo: item.cargo || undefined,
        topicoIds,
        origem: "pdf",
        arquivoOrigem: nomeArquivo ?? "texto colado",
      }),
    });
    setAprovados((n) => n + 1);
    avancar();
  }

  function descartarItem() {
    setDescartados((n) => n + 1);
    avancar();
  }

  function avancar() {
    setIndice((i) => {
      if (!itens || i + 1 >= itens.length) {
        setItens(null);
        return 0;
      }
      return i + 1;
    });
  }

  if (!itens) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Importar prova</h1>
          <Link href="/" className="text-sm text-soft underline">
            Voltar
          </Link>
        </header>

        {(aprovados > 0 || descartados > 0) && (
          <p className="text-sm text-green">
            Importação anterior: {aprovados} aprovada(s), {descartados} descartada(s).
          </p>
        )}

        <p className="text-sm text-soft">
          Envie um PDF da prova ou cole o texto. A IA extrai as questões, mas
          nada entra no banco antes de você conferir item por item.
        </p>

        <label className="text-sm text-ink">
          PDF da prova
          <input
            ref={inputArquivoRef}
            type="file"
            accept="application/pdf"
            className="mt-1 block w-full text-sm"
          />
        </label>

        <p className="text-center text-xs text-soft">— ou —</p>

        <label className="text-sm text-ink">
          Colar texto da prova
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>

        {erroExtracao && <p className="text-sm text-red">{erroExtracao}</p>}

        <button
          onClick={extrair}
          disabled={extraindo}
          className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
        >
          {extraindo ? "Extraindo questões…" : "Extrair questões"}
        </button>
      </main>
    );
  }

  return (
    <ItemConferencia
      key={indice}
      item={itens[indice]}
      indice={indice}
      total={itens.length}
      topicos={topicos}
      onAprovar={aprovarItem}
      onDescartar={descartarItem}
    />
  );
}

function ItemConferencia({
  item: itemInicial,
  indice,
  total,
  topicos,
  onAprovar,
  onDescartar,
}: {
  item: ItemExtraido;
  indice: number;
  total: number;
  topicos: Topico[];
  onAprovar: (item: ItemExtraido, topicoIds: string[]) => Promise<void>;
  onDescartar: () => void;
}) {
  const [item, setItem] = useState(itemInicial);
  const [topicoIdsAtual, setTopicoIdsAtual] = useState(() =>
    topicos.filter((t) => itemInicial.topicoNomesSugeridos.includes(t.nome)).map((t) => t.id),
  );
  const [salvando, setSalvando] = useState(false);

  function atualizarItem(patch: Partial<ItemExtraido>) {
    setItem((atual) => ({ ...atual, ...patch }));
  }

  function alternarTopico(id: string) {
    setTopicoIdsAtual((atual) =>
      atual.includes(id) ? atual.filter((t) => t !== id) : [...atual, id],
    );
  }

  async function aprovar() {
    setSalvando(true);
    await onAprovar(item, topicoIdsAtual);
    setSalvando(false);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
      <header className="text-sm text-soft">
        Conferência — item {indice + 1} de {total}
      </header>

      {item.duplicataDe && (
        <div className="rounded border border-amber bg-amber/10 p-3 text-sm text-amber">
          Possível duplicata (similaridade {Math.round(item.duplicataDe.similaridade * 100)}%)
          de uma questão já cadastrada: &ldquo;{item.duplicataDe.enunciado.slice(0, 80)}
          {item.duplicataDe.enunciado.length > 80 ? "…" : ""}&rdquo;
        </div>
      )}

      <label className="text-sm text-ink">
        Enunciado
        <textarea
          value={item.enunciado}
          onChange={(e) => atualizarItem({ enunciado: e.target.value })}
          rows={4}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>

      <label className="text-sm text-ink">
        Tipo
        <select
          value={item.tipo}
          onChange={(e) => atualizarItem({ tipo: e.target.value as ItemExtraido["tipo"] })}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      {item.tipo === "multipla" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-ink">Alternativas</span>
          {(item.alternativas.length ? item.alternativas : ["", "", "", ""]).map(
            (alt, i) => (
              <input
                key={i}
                value={alt}
                onChange={(e) => {
                  const novas = [...item.alternativas];
                  novas[i] = e.target.value;
                  atualizarItem({ alternativas: novas });
                }}
                className="rounded border border-line px-3 py-2"
              />
            ),
          )}
        </div>
      )}

      <label className="text-sm text-ink">
        Gabarito
        <input
          value={item.gabarito}
          onChange={(e) => atualizarItem({ gabarito: e.target.value })}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        />
      </label>

      <label className="text-sm text-ink">
        Nível
        <select
          value={item.nivel}
          onChange={(e) => atualizarItem({ nivel: e.target.value as ItemExtraido["nivel"] })}
          className="mt-1 w-full rounded border border-line px-3 py-2"
        >
          {NIVEIS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="mb-1 text-sm text-ink">Tópicos</legend>
        <div className="flex flex-wrap gap-2">
          {topicos.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded border px-3 py-2 text-sm ${
                topicoIdsAtual.includes(t.id)
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink"
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={topicoIdsAtual.includes(t.id)}
                onChange={() => alternarTopico(t.id)}
              />
              {t.nome}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-ink">
          Banca
          <input
            value={item.banca}
            onChange={(e) => atualizarItem({ banca: e.target.value })}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>
        <label className="text-sm text-ink">
          Ano
          <input
            type="number"
            value={item.ano || ""}
            onChange={(e) => atualizarItem({ ano: Number(e.target.value) })}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>
        <label className="text-sm text-ink">
          Órgão
          <input
            value={item.orgao}
            onChange={(e) => atualizarItem({ orgao: e.target.value })}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>
        <label className="text-sm text-ink">
          Cargo
          <input
            value={item.cargo}
            onChange={(e) => atualizarItem({ cargo: e.target.value })}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>
      </div>

      <p className="text-xs text-amber">
        Extraído por IA — confira contra o material original antes de aprovar.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onDescartar}
          className="flex-1 rounded border border-line px-4 py-3 text-ink"
        >
          Descartar
        </button>
        <button
          onClick={aprovar}
          disabled={salvando || topicoIdsAtual.length === 0}
          className="flex-1 rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Aprovar e ir para o próximo"}
        </button>
      </div>
    </main>
  );
}
