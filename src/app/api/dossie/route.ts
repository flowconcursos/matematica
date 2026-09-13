import { NextResponse } from "next/server";
import { isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { questao } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { calcularConfiabilidade } from "@/lib/dossie";

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const linhas = await db
    .select({ banca: questao.banca })
    .from(questao)
    .where(isNotNull(questao.banca));

  const contagem = new Map<string, number>();
  for (const { banca } of linhas) {
    if (!banca) continue;
    contagem.set(banca, (contagem.get(banca) ?? 0) + 1);
  }

  const bancas = [...contagem.entries()]
    .map(([banca, nQuestoes]) => ({
      banca,
      nQuestoes,
      confiabilidade: calcularConfiabilidade(nQuestoes),
    }))
    .sort((a, b) => b.nQuestoes - a.nQuestoes);

  return NextResponse.json(bancas);
}
