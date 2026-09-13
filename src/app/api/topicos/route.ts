import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { topico, areaEnum } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import { exigirSessao } from "@/lib/api";

const criarTopicoSchema = z.object({
  nome: z.string().min(1),
  area: z.enum(areaEnum.enumValues),
  nivelBase: z.number().int().min(1).max(5),
  descricaoCurta: z.string().optional(),
});

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const topicos = await db
    .select()
    .from(topico)
    .where(isNull(topico.arquivadoEm))
    .orderBy(asc(topico.area), asc(topico.nivelBase), asc(topico.nome));

  return NextResponse.json(topicos);
}

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = criarTopicoSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: dados.error.flatten() },
      { status: 400 },
    );
  }

  const [criado] = await db.insert(topico).values(dados.data).returning();
  return NextResponse.json(criado, { status: 201 });
}
