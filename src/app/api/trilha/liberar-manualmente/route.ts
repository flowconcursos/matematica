import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { liberacaoManual } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { relampagoAprovado, RELAMPAGO_TOTAL_QUESTOES } from "@/lib/trilha";

const schema = z.object({
  topicoId: z.string().uuid(),
  acertos: z.number().int().min(0).max(RELAMPAGO_TOTAL_QUESTOES),
});

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = schema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  if (!relampagoAprovado(dados.data.acertos)) {
    return NextResponse.json(
      {
        erro: `Não aprovado: acertou ${dados.data.acertos} de ${RELAMPAGO_TOTAL_QUESTOES}. O tópico continua bloqueado.`,
      },
      { status: 400 },
    );
  }

  const [liberada] = await db
    .insert(liberacaoManual)
    .values({ topicoId: dados.data.topicoId, acertosNoTeste: dados.data.acertos })
    .onConflictDoUpdate({
      target: liberacaoManual.topicoId,
      set: { liberadaEm: new Date(), acertosNoTeste: dados.data.acertos },
    })
    .returning();

  return NextResponse.json(liberada);
}
