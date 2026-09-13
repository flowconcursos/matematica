import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessao, tentativa } from "@/db/schema";
import { exigirSessao } from "@/lib/api";

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const sessoes = await db.select().from(sessao);

  const resultado = (
    await Promise.all(
      sessoes
        .filter((s) => s.modo === "simulado")
        .map(async (s) => {
          const tentativas = await db
            .select({ acertou: tentativa.acertou, segundos: tentativa.segundos })
            .from(tentativa)
            .where(eq(tentativa.sessaoId, s.id));

          return {
            id: s.id,
            data: s.data,
            inicio: s.inicio,
            fim: s.fim,
            metaSegundos: s.metaSegundos,
            nQuestoes: tentativas.length,
            acertos: tentativas.filter((t) => t.acertou).length,
          };
        }),
    )
  )
    // Só sessões realmente finalizadas (com tentativas gravadas). Uma
    // sessão que só chegou a /corrigir mas nunca a /finalizar (ex.: usuário
    // fechou a aba antes de salvar) não deve aparecer como um simulado feito.
    .filter((s) => s.nQuestoes > 0);

  resultado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return NextResponse.json(resultado);
}
