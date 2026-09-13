import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  questao,
  questaoTopico,
  topico,
  tipoQuestaoEnum,
  nivelQuestaoEnum,
} from "@/db/schema";
import { exigirSessao } from "@/lib/api";

const criarQuestaoSchema = z.object({
  enunciado: z.string().min(1),
  alternativas: z.array(z.string()).optional(),
  gabarito: z.string().min(1),
  tipo: z.enum(tipoQuestaoEnum.enumValues),
  nivel: z.enum(nivelQuestaoEnum.enumValues),
  banca: z.string().optional(),
  ano: z.number().int().optional(),
  orgao: z.string().optional(),
  cargo: z.string().optional(),
  topicoIds: z.array(z.string().uuid()).min(1),
});

export async function GET(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const topicoId = request.nextUrl.searchParams.get("topicoId");

  const linhas = await db
    .select({ questao, topicoId: topico.id, area: topico.area })
    .from(questao)
    .innerJoin(questaoTopico, eq(questaoTopico.questaoId, questao.id))
    .innerJoin(topico, eq(topico.id, questaoTopico.topicoId))
    .where(topicoId ? eq(questaoTopico.topicoId, topicoId) : isNull(questao.arquivadoEm));

  const porQuestao = new Map<
    string,
    { topicos: { id: string; area: string }[] } & typeof questao.$inferSelect
  >();
  for (const linha of linhas) {
    const existente = porQuestao.get(linha.questao.id);
    if (existente) {
      existente.topicos.push({ id: linha.topicoId, area: linha.area });
    } else {
      porQuestao.set(linha.questao.id, {
        ...linha.questao,
        topicos: [{ id: linha.topicoId, area: linha.area }],
      });
    }
  }

  return NextResponse.json(Array.from(porQuestao.values()));
}

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = criarQuestaoSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: dados.error.flatten() },
      { status: 400 },
    );
  }

  const { topicoIds, ...camposQuestao } = dados.data;

  const criada = await db.transaction(async (tx) => {
    const [nova] = await tx
      .insert(questao)
      .values({
        ...camposQuestao,
        origem: "manual",
        revisadoPorHumano: true,
      })
      .returning();

    await tx
      .insert(questaoTopico)
      .values(topicoIds.map((topicoId) => ({ questaoId: nova.id, topicoId })));

    return nova;
  });

  return NextResponse.json(criada, { status: 201 });
}
