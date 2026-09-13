"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AREAS = [
  "aritmetica",
  "algebra",
  "geometria",
  "raciocinio_logico",
  "estatistica",
  "financeira",
  "conjuntos",
] as const;

export default function NovoTopicoPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(formData: FormData) {
    setEnviando(true);
    setErro(null);
    const resposta = await fetch("/api/topicos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: formData.get("nome"),
        area: formData.get("area"),
        nivelBase: Number(formData.get("nivelBase")),
        descricaoCurta: formData.get("descricaoCurta") || undefined,
      }),
    });
    setEnviando(false);
    if (!resposta.ok) {
      setErro("Não foi possível salvar o tópico.");
      return;
    }
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-8">
      <h1 className="text-lg font-semibold text-ink">Novo tópico</h1>
      <form action={enviar} className="flex flex-col gap-3">
        <label className="text-sm text-ink">
          Nome
          <input
            name="nome"
            required
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>

        <label className="text-sm text-ink">
          Área
          <select
            name="area"
            required
            className="mt-1 w-full rounded border border-line px-3 py-2"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-ink">
          Nível base (1 = base indispensável, 5 = avançado)
          <input
            name="nivelBase"
            type="number"
            min={1}
            max={5}
            defaultValue={1}
            required
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>

        <label className="text-sm text-ink">
          Descrição curta (opcional)
          <textarea
            name="descricaoCurta"
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>

        {erro && <p className="text-sm text-red">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="rounded bg-ink px-4 py-3 text-white disabled:opacity-60"
        >
          {enviando ? "Salvando…" : "Salvar tópico"}
        </button>
      </form>
    </main>
  );
}
