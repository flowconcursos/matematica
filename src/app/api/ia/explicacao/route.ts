import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { Type } from "@google/genai";
import { db } from "@/db";
import { questao, explicacao, nivelExplicacaoEnum, causaErroEnum } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";

const explicarSchema = z
  .object({
    questaoId: z.string().uuid(),
    nivel: z.enum(nivelExplicacaoEnum.enumValues),
    alternativaEscolhida: z.string().optional(),
    causaErro: z.enum(causaErroEnum.enumValues).optional(),
    motivoDistrator: z.string().optional(),
    anotacao: z.string().optional(),
  })
  .refine(
    (dados) =>
      dados.nivel !== "por_que_erro_parecia_certo" || dados.alternativaEscolhida,
    {
      message:
        "alternativaEscolhida é obrigatória para o nível 'por_que_erro_parecia_certo'.",
      path: ["alternativaEscolhida"],
    },
  );

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    texto: { type: Type.STRING },
  },
  required: ["texto"],
};

function montarPrompt(
  dados: z.infer<typeof explicarSchema>,
  q: { enunciado: string; gabarito: string; alternativas: string[] | null },
): string {
  const base = `Enunciado: ${q.enunciado}\nAlternativas: ${
    q.alternativas ? JSON.stringify(q.alternativas) : "não se aplica"
  }\nGabarito: ${q.gabarito}`;

  if (dados.nivel === "curta") {
    return `Você explica questões de matemática/raciocínio lógico para concursos. Explique o caminho de resolução em no máximo duas linhas, direto ao ponto, sem repetir o enunciado.\n\n${base}`;
  }

  if (dados.nivel === "passo_a_passo") {
    return `Você explica questões de matemática/raciocínio lógico para concursos. Explique passo a passo a resolução completa, justificando cada passo, sem pular contas.\n\n${base}`;
  }

  return `Você explica erros de quem treina para concursos. O usuário respondeu "${dados.alternativaEscolhida}" (errado). Ele declarou a causa do erro como "${dados.causaErro ?? "não informada"}"${
    dados.motivoDistrator ? ` e disse que o distrator capturou: "${dados.motivoDistrator}"` : ""
  }${dados.anotacao ? `. Anotação do usuário: "${dados.anotacao}"` : ""}.

Explique especificamente onde o raciocínio dele desviou até chegar em "${dados.alternativaEscolhida}" — não apenas repita qual é a resposta correta.\n\n${base}`;
}

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = explicarSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: dados.error.flatten() },
      { status: 400 },
    );
  }

  const [q] = await db
    .select({
      enunciado: questao.enunciado,
      gabarito: questao.gabarito,
      alternativas: questao.alternativas,
    })
    .from(questao)
    .where(eq(questao.id, dados.data.questaoId))
    .limit(1);

  if (!q) {
    return NextResponse.json({ erro: "Questão não encontrada." }, { status: 404 });
  }

  const usaCache = dados.data.nivel !== "por_que_erro_parecia_certo";

  if (usaCache) {
    const [existente] = await db
      .select()
      .from(explicacao)
      .where(
        and(
          eq(explicacao.questaoId, dados.data.questaoId),
          eq(explicacao.nivel, dados.data.nivel),
        ),
      )
      .orderBy(desc(explicacao.geradoEm))
      .limit(1);

    if (existente) {
      return NextResponse.json({ ...existente, deCache: true });
    }
  }

  const prompt = montarPrompt(dados.data, q);

  try {
    const resultado = await gerarSaidaEstruturada<{ texto: string }>({
      tarefa: `explicacao_${dados.data.nivel}`,
      modelo: MODELO_FLASH,
      prompt,
      responseSchema,
    });

    const [criada] = await db
      .insert(explicacao)
      .values({
        questaoId: dados.data.questaoId,
        nivel: dados.data.nivel,
        texto: resultado.texto,
        modelo: MODELO_FLASH,
      })
      .returning();

    return NextResponse.json({ ...criada, deCache: false });
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha ao gerar explicação:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar a explicação agora." },
      { status: 502 },
    );
  }
}
