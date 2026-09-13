import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { explicacao } from "@/db/schema";
import { exigirSessao } from "@/lib/api";

const marcarUtilSchema = z.object({ util: z.boolean() });

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/ia/explicacao/[id]">,
) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const { id } = await ctx.params;
  const corpo = await request.json();
  const dados = marcarUtilSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const [atualizada] = await db
    .update(explicacao)
    .set({ util: dados.data.util })
    .where(eq(explicacao.id, id))
    .returning();

  if (!atualizada) {
    return NextResponse.json({ erro: "Explicação não encontrada." }, { status: 404 });
  }

  return NextResponse.json(atualizada);
}
