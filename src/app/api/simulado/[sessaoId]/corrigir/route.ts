import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { questao, sessao, confiancaEnum } from "@/db/schema";
import { exigirSessao } from "@/lib/api";

const corrigirSchema = z.object({
  respostas: z
    .array(
      z.object({
        questaoId: z.string().uuid(),
        confiancaDeclarada: z.enum(confiancaEnum.enumValues),
        respostaDada: z.string().min(1),
        segundos: z.number().int().min(0),
      }),
    )
    .min(1),
});

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/simulado/[sessaoId]/corrigir">,
) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const { sessaoId } = await ctx.params;
  const corpo = await request.json();
  const dados = corrigirSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const [sessaoAtual] = await db.select().from(sessao).where(eq(sessao.id, sessaoId));
  if (!sessaoAtual) {
    return NextResponse.json({ erro: "Sessão não encontrada." }, { status: 404 });
  }

  // Idempotente de propósito: só calcula e revela o gabarito, não grava
  // tentativa nenhuma (isso só acontece em /finalizar). Recarregar esta
  // tela ou o double-effect do React em dev não deve virar erro.
  const questaoIds = dados.data.respostas.map((r) => r.questaoId);
  const questoes = await db
    .select({ id: questao.id, gabarito: questao.gabarito, enunciado: questao.enunciado })
    .from(questao)
    .where(inArray(questao.id, questaoIds));
  const gabaritoPorId = new Map(questoes.map((q) => [q.id, q]));

  const resultados = dados.data.respostas.map((r) => {
    const q = gabaritoPorId.get(r.questaoId);
    const acertou = q ? r.respostaDada.trim() === q.gabarito.trim() : false;
    return {
      questaoId: r.questaoId,
      enunciado: q?.enunciado ?? "",
      gabarito: q?.gabarito ?? "",
      respostaDada: r.respostaDada,
      confiancaDeclarada: r.confiancaDeclarada,
      segundos: r.segundos,
      acertou,
    };
  });

  await db.update(sessao).set({ fim: new Date() }).where(eq(sessao.id, sessaoId));

  return NextResponse.json({
    resultados,
    acertos: resultados.filter((r) => r.acertou).length,
    total: resultados.length,
  });
}
