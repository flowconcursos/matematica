import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { prerequisito, topico } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { haveriaCiclo } from "@/lib/grafo";

const arestaSchema = z.object({
  topicoId: z.string().uuid(),
  dependeDeTopicoId: z.string().uuid(),
});

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const arestas = await db.select().from(prerequisito);
  return NextResponse.json(arestas);
}

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = arestaSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: dados.error.flatten() },
      { status: 400 },
    );
  }

  const [topicoExiste, dependeDeExiste] = await Promise.all([
    db.select({ id: topico.id }).from(topico).where(eq(topico.id, dados.data.topicoId)),
    db
      .select({ id: topico.id })
      .from(topico)
      .where(eq(topico.id, dados.data.dependeDeTopicoId)),
  ]);
  if (!topicoExiste.length || !dependeDeExiste.length) {
    return NextResponse.json({ erro: "Tópico não encontrado." }, { status: 404 });
  }

  const existentes = await db.select().from(prerequisito);
  if (haveriaCiclo(existentes, dados.data)) {
    return NextResponse.json(
      {
        erro:
          "Isso criaria um ciclo de pré-requisitos (o tópico já é, direta ou indiretamente, pré-requisito do outro).",
      },
      { status: 400 },
    );
  }

  const [criada] = await db.insert(prerequisito).values(dados.data).returning();
  return NextResponse.json(criada, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = arestaSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  await db
    .delete(prerequisito)
    .where(
      and(
        eq(prerequisito.topicoId, dados.data.topicoId),
        eq(prerequisito.dependeDeTopicoId, dados.data.dependeDeTopicoId),
      ),
    );

  return NextResponse.json({ ok: true });
}
