import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Type } from "@google/genai";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";
import { simuladoEmAndamento, montarContextoTutor } from "@/lib/tutor-db";

const tutorSchema = z.object({
  mensagens: z
    .array(z.object({ role: z.enum(["user", "model"]), texto: z.string() }))
    .min(1),
  questaoId: z.string().uuid().optional(),
  pedidosSolucaoCompleta: z.number().int().min(0).default(0),
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    texto: { type: Type.STRING },
    nivelDica: {
      type: Type.NUMBER,
      description: "1, 2 ou 3 se esta resposta for uma pista sobre a questão em discussão. 0 se não se aplica.",
    },
    entregouSolucaoCompleta: {
      type: Type.BOOLEAN,
      description: "true só se esta resposta contém a resolução completa da questão.",
    },
  },
  required: ["texto", "entregouSolucaoCompleta"],
};

type RespostaIA = { texto: string; nivelDica?: number; entregouSolucaoCompleta: boolean };

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  return NextResponse.json({ bloqueadoPorSimulado: await simuladoEmAndamento() });
}

export async function POST(request: NextRequest) {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  if (await simuladoEmAndamento()) {
    return NextResponse.json(
      { erro: "Tutor bloqueado durante o simulado — só disponível fora do modo prova." },
      { status: 403 },
    );
  }

  const corpo = await request.json();
  const dados = tutorSchema.safeParse(corpo);
  if (!dados.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const contexto = await montarContextoTutor(dados.data.questaoId);
  const podeEntregarSolucao = dados.data.pedidosSolucaoCompleta >= 2;

  const transcricao = dados.data.mensagens
    .map((m) => `${m.role === "user" ? "Usuário" : "Tutor"}: ${m.texto}`)
    .join("\n");

  const prompt = `Você é o tutor conversacional de um app pessoal de treino de matemática
para concursos (Tarefa G, seção 5 do doc de produto).

Regras obrigatórias:
- Acesso somente leitura ao histórico — você nunca decide nem registra nada,
  só responde.
- Toda afirmação sobre o desempenho do usuário cita o número que a
  sustenta (ex: "você já errou isso 3 vezes"). Sem número, sem afirmação.
- Abaixo de 30 tentativas no agregado relevante, declare volume
  insuficiente em vez de opinar.
- Nada de elogio genérico ou linguagem de coach.
${
  contexto.questao?.pendenteDeRevisao
    ? `- Esta questão está PENDENTE DE REVISÃO. NÃO resolva a questão nem revele o
  gabarito diretamente. Dê uma pista por vez, em até três níveis crescentes
  de especificidade (nível 1 = aponta o conceito envolvido; nível 2 = aponta
  o próximo passo; nível 3 = quase entrega, falta só executar).
  ${
    podeEntregarSolucao
      ? "O usuário já pediu a solução completa 2 vezes ou mais — agora você PODE entregar a solução completa se ele pedir. Marque entregouSolucaoCompleta=true nesse caso."
      : `O usuário pediu a solução completa ${dados.data.pedidosSolucaoCompleta} vez(es) — ainda não chegou a 2. NÃO entregue a solução completa; dê o próximo nível de dica em vez disso, e diga que ele pode pedir a solução completa de novo se quiser.`
  }`
    : "- Não há questão pendente de revisão em discussão (ou a questão já foi respondida/graduada) — pode responder livremente, sempre ancorado nos números."
}

Contexto (dados reais do usuário, nunca invente além disto):
${JSON.stringify(contexto, null, 2)}

Conversa até agora:
${transcricao}

Responda à última mensagem do usuário.`;

  try {
    const resultado = await gerarSaidaEstruturada<RespostaIA>({
      tarefa: "tutor_conversacional",
      modelo: MODELO_FLASH,
      prompt,
      responseSchema,
      timeoutMs: 30_000,
    });

    // Defesa em profundidade: mesmo que o modelo tente entregar a solução
    // completa cedo demais, o servidor recusa e devolve uma pista genérica.
    if (resultado.entregouSolucaoCompleta && !podeEntregarSolucao) {
      return NextResponse.json({
        texto:
          "Ainda não vou entregar a solução completa — peça explicitamente mais uma vez se for isso que você quer, ou me diga em que parte você travou para eu dar a próxima pista.",
        nivelDica: 0,
        entregouSolucaoCompleta: false,
      });
    }

    return NextResponse.json(resultado);
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha no tutor conversacional:", erro);
    return NextResponse.json(
      { erro: "Não foi possível falar com o tutor agora." },
      { status: 502 },
    );
  }
}
