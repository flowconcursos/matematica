"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Topico = { id: string; nome: string; area: string };

const TIPOS = ["multipla", "certo_errado", "discursiva", "calculo"] as const;
const NIVEIS = ["facil", "medio", "dificil"] as const;

export default function NovaQuestaoPage() {
  const router = useRouter();
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("multipla");
  const [alternativas, setAlternativas] = useState(["", "", "", ""]);
  const [topicoIds, setTopicoIds] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/topicos")
      .then((r) => r.json())
      .then(setTopicos);
  }, []);

  function alternarTopico(id: string) {
    setTopicoIds((atual) =>
      atual.includes(id) ? atual.filter((t) => t !== id) : [...atual, id],
    );
  }

  async function enviar(formData: FormData) {
    if (topicoIds.length === 0) {
      setErro("Selecione ao menos um tópico.");
      return;
    }
    setEnviando(true);
    setErro(null);

    const resposta = await fetch("/api/questoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enunciado: formData.get("enunciado"),
        gabarito: formData.get("gabarito"),
        tipo,
        nivel: formData.get("nivel"),
        banca: formData.get("banca") || undefined,
        ano: formData.get("ano") ? Number(formData.get("ano")) : undefined,
        orgao: formData.get("orgao") || undefined,
        cargo: formData.get("cargo") || undefined,
        alternativas:
          tipo === "multipla" ? alternativas.filter((a) => a.trim()) : undefined,
        topicoIds,
      }),
    });

    setEnviando(false);
    if (!resposta.ok) {
      setErro("Não foi possível salvar a questão.");
      return;
    }
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Nova questão</h1>
      <form action={enviar} className="flex flex-col gap-3">
        <label className="text-sm text-ink">
          Enunciado
          <textarea
            name="enunciado"
            required
            rows={4}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>

        <label className="text-sm text-ink">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number])}
            className="mt-1 w-full rounded border border-line px-3 py-2"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {tipo === "multipla" && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-ink">Alternativas</span>
            {alternativas.map((alt, i) => (
              <input
                key={i}
                value={alt}
                onChange={(e) => {
                  const novas = [...alternativas];
                  novas[i] = e.target.value;
                  setAlternativas(novas);
                }}
                placeholder={`Alternativa ${i + 1}`}
                className="rounded border border-line px-3 py-2"
              />
            ))}
          </div>
        )}

        <label className="text-sm text-ink">
          Gabarito {tipo === "multipla" ? "(texto exato de uma das alternativas)" : ""}
          <input
            name="gabarito"
            required
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>

        <label className="text-sm text-ink">
          Nível
          <select
            name="nivel"
            required
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
                  topicoIds.includes(t.id)
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={topicoIds.includes(t.id)}
                  onChange={() => alternarTopico(t.id)}
                />
                {t.nome}
              </label>
            ))}
          </div>
          {topicos.length === 0 && (
            <p className="text-sm text-soft">
              Nenhum tópico cadastrado ainda.{" "}
              <Link href="/topicos/novo" className="underline">
                Cadastre um primeiro
              </Link>
              .
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-ink">
            Banca (opcional)
            <input name="banca" className="mt-1 w-full rounded border border-line px-3 py-2" />
          </label>
          <label className="text-sm text-ink">
            Ano (opcional)
            <input
              name="ano"
              type="number"
              className="mt-1 w-full rounded border border-line px-3 py-2"
            />
          </label>
          <label className="text-sm text-ink">
            Órgão (opcional)
            <input name="orgao" className="mt-1 w-full rounded border border-line px-3 py-2" />
          </label>
          <label className="text-sm text-ink">
            Cargo (opcional)
            <input name="cargo" className="mt-1 w-full rounded border border-line px-3 py-2" />
          </label>
        </div>

        {erro && <p className="text-sm text-red">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
        >
          {enviando ? "Salvando…" : "Salvar questão"}
        </button>
      </form>
    </main>
  );
}
