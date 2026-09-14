import { NextResponse } from "next/server";
import { desc, gt } from "drizzle-orm";
import { Type } from "@google/genai";
import { db } from "@/db";
import { tentativa, topico, questaoTopico, diagnostico } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_PRO, OrcamentoDiarioExcedidoError } from "@/lib/ai";
import { elegivelParaDiagnostico } from "@/lib/diagnostico";
import {
  taxaAcertoFirme,
  tempoMedioSegundos,
  calibracaoPorConfianca,
  causasPorTopico,
  tempoMedioPorTopico,
  CAUSAS,
  type TentativaPainel,
} from "@/lib/painel";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    hipotesePrincipal: {
      type: Type.STRING,
      description:
        "Hipótese principal sobre a causa real de erro do usuário, testando explicitamente a autoavaliação dele de 'erro por tempo e desatenção' contra os dados.",
    },
    evidencias: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          afirmacao: { type: Type.STRING },
          numero: { type: Type.STRING, description: "O número exato que sustenta a afirmação." },
        },
        required: ["afirmacao", "numero"],
      },
    },
    comoDerrubarHipotese: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "O que observar nas próximas semanas que derrubaria esta hipótese.",
    },
    comparacaoComAnterior: {
      type: Type.STRING,
      description:
        "Se houver diagnóstico anterior, declare explicitamente se a hipótese dele se confirmou ou não nos novos dados. Vazio se não houver anterior.",
    },
    prescricao: {
      type: Type.STRING,
      description: "Prescrição objetiva para a semana, ancorada nas evidências acima.",
    },
  },
  required: ["hipotesePrincipal", "evidencias", "comoDerrubarHipotese", "comparacaoComAnterior", "prescricao"],
};

type RespostaIA = {
  hipotesePrincipal: string;
  evidencias: { afirmacao: string; numero: string }[];
  comoDerrubarHipotese: string[];
  comparacaoComAnterior: string;
  prescricao: string;
};

export async function POST() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const [ultimo] = await db
    .select()
    .from(diagnostico)
    .orderBy(desc(diagnostico.geradoEm))
    .limit(1);

  const agora = new Date();
  const inicio = ultimo?.geradoEm ?? null;

  const tentativasPeriodo: TentativaPainel[] = await db
    .select({
      questaoId: tentativa.questaoId,
      data: tentativa.data,
      segundos: tentativa.segundos,
      metaSegundosNaEpoca: tentativa.metaSegundosNaEpoca,
      confiancaDeclarada: tentativa.confiancaDeclarada,
      acertou: tentativa.acertou,
      causaErro: tentativa.causaErro,
    })
    .from(tentativa)
    .where(inicio ? gt(tentativa.data, inicio) : undefined);

  if (!elegivelParaDiagnostico(inicio, agora, tentativasPeriodo.length)) {
    return NextResponse.json(
      { erro: "Ainda não passou 7 dias nem 100 tentativas desde o último diagnóstico." },
      { status: 400 },
    );
  }

  const [topicos, associacoes] = await Promise.all([
    db.select({ id: topico.id, nome: topico.nome }).from(topico),
    db.select({ questaoId: questaoTopico.questaoId, topicoId: questaoTopico.topicoId }).from(questaoTopico),
  ]);

  const questaoParaTopicos = new Map<string, string[]>();
  for (const { questaoId, topicoId } of associacoes) {
    const lista = questaoParaTopicos.get(questaoId) ?? [];
    lista.push(topicoId);
    questaoParaTopicos.set(questaoId, lista);
  }

  const errosNoPeriodo = tentativasPeriodo.filter((t) => !t.acertou);
  const causasTotais = CAUSAS.map((causa) => ({
    causa,
    contagem: errosNoPeriodo.filter((t) => t.causaErro === causa).length,
  }));

  const agregados = {
    periodo: { inicio: inicio?.toISOString() ?? null, fim: agora.toISOString() },
    totalTentativas: tentativasPeriodo.length,
    taxaAcertoBruto: tentativasPeriodo.length
      ? tentativasPeriodo.filter((t) => t.acertou).length / tentativasPeriodo.length
      : 0,
    taxaAcertoFirme: taxaAcertoFirme(tentativasPeriodo),
    tempoMedioSegundos: tempoMedioSegundos(tentativasPeriodo),
    calibracaoPorConfianca: calibracaoPorConfianca(tentativasPeriodo),
    causasTotais,
    causasPorTopico: causasPorTopico(tentativasPeriodo, questaoParaTopicos, topicos).slice(0, 12),
    tempoMedioPorTopico: tempoMedioPorTopico(tentativasPeriodo, questaoParaTopicos, topicos).slice(0, 12),
  };

  const prompt = `Você é o módulo de diagnóstico periódico de um app pessoal de treino de
matemática para concursos (Tarefa D, seção 5 do doc de produto).

Contexto do usuário: ele acredita que "sabe a teoria, erra por tempo e
desatenção". Trate isso como HIPÓTESE A SER TESTADA pelos dados, não como
verdade — é comum que a causa real seja fluência frágil (sabe o conceito
mas executa devagar, e por isso erra por falta de tempo para conferir). Se
as causas registradas apontarem "conceito" com frequência relevante, diga
isso com todas as letras e cite os tópicos, mesmo que seja desconfortável.

Regras obrigatórias:
- Toda afirmação cita o número exato que a sustenta (campo "numero").
- Nunca invente estatística fora dos agregados fornecidos abaixo.
- Abaixo de 30 tentativas em um tópico específico, declare volume
  insuficiente para conclusão sobre aquele tópico específico.
- Nada de elogio genérico ou linguagem de coach.
- Compare com o diagnóstico anterior (se houver) e declare explicitamente
  se a hipótese anterior se confirmou ou não nos novos dados.

${
  ultimo
    ? `Diagnóstico anterior (${ultimo.geradoEm.toISOString()}):\nHipótese: ${ultimo.hipotesePrincipal}\nPrescrição: ${ultimo.prescricao}`
    : "Não há diagnóstico anterior — esta é a primeira análise."
}

Agregados do período analisado (nunca a base inteira, só estes números):
${JSON.stringify(agregados, null, 2)}`;

  try {
    const resultado = await gerarSaidaEstruturada<RespostaIA>({
      tarefa: "diagnostico_periodico",
      modelo: MODELO_PRO,
      prompt,
      responseSchema,
      timeoutMs: 45_000,
    });

    const [criado] = await db
      .insert(diagnostico)
      .values({
        geradoEm: agora,
        periodoAnalisado: `${inicio?.toISOString() ?? "início"} — ${agora.toISOString()}`,
        hipotesePrincipal: resultado.hipotesePrincipal,
        prescricao: resultado.prescricao,
        modelo: MODELO_PRO,
        evidencias: {
          evidencias: resultado.evidencias,
          comoDerrubarHipotese: resultado.comoDerrubarHipotese,
          comparacaoComAnterior: resultado.comparacaoComAnterior || null,
        },
      })
      .returning();

    return NextResponse.json(criado, { status: 201 });
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha ao gerar diagnóstico:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar o diagnóstico agora." },
      { status: 502 },
    );
  }
}
