import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { heuristica } from "@/db/schema";
import { exigirSessao } from "@/lib/api";

const patchSchema = z.object({ fixadaPeloUsuario: z.boolean() });

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/heuristicas/[id]">,
) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const { id } = await ctx.params;
  const corpo = await request.json();
  const dados = patchSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const [atualizada] = await db
    .update(heuristica)
    .set({ fixadaPeloUsuario: dados.data.fixadaPeloUsuario })
    .where(eq(heuristica.id, id))
    .returning();

  if (!atualizada) {
    return NextResponse.json({ erro: "Heurística não encontrada." }, { status: 404 });
  }

  return NextResponse.json(atualizada);
}
