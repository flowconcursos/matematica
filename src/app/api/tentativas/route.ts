import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  tentativa,
  questao,
  questaoTopico,
  topico,
  confiancaEnum,
  causaErroEnum,
  modoTentativaEnum,
} from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { metaSegundos } from "@/lib/meta-tempo";
import { registrarResultadoRevisao } from "@/lib/revisao-db";
import { atualizarContadoresHeuristicas } from "@/lib/heuristica-db";
import { acertoFirme } from "@/lib/calculo";

const registrarTentativaSchema = z
  .object({
    questaoId: z.string().uuid(),
    segundos: z.number().int().min(0),
    confiancaDeclarada: z.enum(confiancaEnum.enumValues),
    respostaDada: z.string().min(1),
    acertou: z.boolean(),
    causaErro: z.enum(causaErroEnum.enumValues).optional(),
    alternativaEscolhida: z.string().optional(),
    motivoDistrator: z.string().optional(),
    anotacao: z.string().optional(),
    modo: z.enum(modoTentativaEnum.enumValues).default("treino"),
  })
  .refine((dados) => dados.acertou || dados.causaErro, {
    message: "causaErro é obrigatória quando a tentativa não é correta.",
    path: ["causaErro"],
  });

export async function GET(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const questaoId = request.nextUrl.searchParams.get("questaoId");

  const tentativas = questaoId
    ? await db
        .select()
        .from(tentativa)
        .where(eq(tentativa.questaoId, questaoId))
    : await db.select().from(tentativa);

  return NextResponse.json(tentativas);
}

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = registrarTentativaSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: dados.error.flatten() },
      { status: 400 },
    );
  }

  const [questaoInfo] = await db
    .select({ nivel: questao.nivel, area: topico.area })
    .from(questao)
    .innerJoin(questaoTopico, eq(questaoTopico.questaoId, questao.id))
    .innerJoin(topico, eq(topico.id, questaoTopico.topicoId))
    .where(eq(questao.id, dados.data.questaoId))
    .limit(1);

  if (!questaoInfo) {
    return NextResponse.json({ erro: "Questão não encontrada." }, { status: 404 });
  }

  const meta = metaSegundos(questaoInfo.area, questaoInfo.nivel);

  const [criada] = await db
    .insert(tentativa)
    .values({ ...dados.data, metaSegundosNaEpoca: meta })
    .returning();

  await registrarResultadoRevisao(
    db,
    dados.data.questaoId,
    dados.data.acertou,
    criada.data,
  );

  await atualizarContadoresHeuristicas(
    dados.data.questaoId,
    acertoFirme({
      acertou: criada.acertou,
      confiancaDeclarada: criada.confiancaDeclarada,
      segundos: criada.segundos,
      metaSegundosNaEpoca: criada.metaSegundosNaEpoca,
    }),
  );

  return NextResponse.json(criada, { status: 201 });
}
