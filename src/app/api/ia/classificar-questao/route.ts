import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Type } from "@google/genai";
import { db } from "@/db";
import { topico, tipoQuestaoEnum, nivelQuestaoEnum } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";

const classificarSchema = z.object({
  enunciado: z.string().min(1),
  alternativas: z.array(z.string()).optional(),
  gabarito: z.string().min(1),
  tipo: z.enum(tipoQuestaoEnum.enumValues),
  nivel: z.enum(nivelQuestaoEnum.enumValues),
  banca: z.string().optional(),
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    topicoNomesSugeridos: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Nomes de tópicos, escolhidos apenas entre os tópicos existentes fornecidos. Vazio se nenhum se encaixar bem.",
    },
    prerequisitosSugeridos: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Nomes de tópicos (entre os existentes) que são pré-requisito para resolver esta questão.",
    },
    tipoArmadilha: {
      type: Type.STRING,
      description: "Armadilha típica desta questão, em poucas palavras.",
    },
    competenciaReal: {
      type: Type.STRING,
      enum: ["interpretacao", "calculo", "modelagem", "memoria_formula"],
    },
    tempoRazoavelSegundos: {
      type: Type.NUMBER,
      description: "Tempo razoável estimado para resolver, em segundos.",
    },
  },
  required: [
    "topicoNomesSugeridos",
    "prerequisitosSugeridos",
    "tipoArmadilha",
    "competenciaReal",
    "tempoRazoavelSegundos",
  ],
};

type SaidaClassificador = {
  topicoNomesSugeridos: string[];
  prerequisitosSugeridos: string[];
  tipoArmadilha: string;
  competenciaReal: "interpretacao" | "calculo" | "modelagem" | "memoria_formula";
  tempoRazoavelSegundos: number;
};

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const corpo = await request.json();
  const dados = classificarSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: dados.error.flatten() },
      { status: 400 },
    );
  }

  const topicosExistentes = await db
    .select({ nome: topico.nome })
    .from(topico);

  if (topicosExistentes.length === 0) {
    return NextResponse.json(
      { erro: "Cadastre ao menos um tópico antes de usar o classificador." },
      { status: 400 },
    );
  }

  const prompt = `Você classifica questões de concursos públicos brasileiros (matemática e raciocínio lógico) para um app de treino pessoal.

Regras:
- Nunca invente fatos sobre a banca, a prova ou o edital. Se não souber, deixe o campo vazio ou genérico.
- Em "topicoNomesSugeridos" e "prerequisitosSugeridos", use exclusivamente nomes desta lista de tópicos existentes (não invente tópicos novos): ${JSON.stringify(topicosExistentes.map((t) => t.nome))}
- competenciaReal é a habilidade realmente cobrada, não o assunto: "interpretacao" (entender o enunciado), "calculo" (executar contas), "modelagem" (montar a equação/estrutura certa), ou "memoria_formula" (só lembrar uma fórmula).
- tempoRazoavelSegundos é uma estimativa realista para alguém com domínio médio do tópico, considerando o nível declarado (${dados.data.nivel}).

Questão:
Tipo: ${dados.data.tipo}
Nível declarado: ${dados.data.nivel}
Banca: ${dados.data.banca ?? "não informada"}
Enunciado: ${dados.data.enunciado}
Alternativas: ${dados.data.alternativas ? JSON.stringify(dados.data.alternativas) : "não se aplica"}
Gabarito: ${dados.data.gabarito}`;

  try {
    const resultado = await gerarSaidaEstruturada<SaidaClassificador>({
      tarefa: "classificador_questao",
      modelo: MODELO_FLASH,
      prompt,
      responseSchema,
    });

    return NextResponse.json(resultado);
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha no classificador de questão:", erro);
    return NextResponse.json(
      { erro: "Não foi possível classificar a questão agora." },
      { status: 502 },
    );
  }
}
