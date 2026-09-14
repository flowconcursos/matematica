import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { db } from "@/db";
import { topico, heuristica } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { gerarSaidaEstruturada } from "@/lib/ai-db";
import { MODELO_FLASH, OrcamentoDiarioExcedidoError } from "@/lib/ai";
import {
  evidenciaSuficiente,
  podeDestilarNovamente,
  proximaDestilacaoDisponivelEm,
} from "@/lib/heuristica";
import { tentativasParaDestilacao, ultimaDestilacaoEm } from "@/lib/heuristica-db";

const DIAS_JANELA_EVIDENCIA = 30;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    heuristicas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topicoNome: {
            type: Type.STRING,
            description: "Deve ser exatamente um dos nomes de tópico fornecidos.",
          },
          texto: {
            type: Type.STRING,
            description:
              "Regra curta, acionável, em segunda pessoa, ligada a um gatilho observável no enunciado.",
          },
          tentativaIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "IDs das tentativas fornecidas que sustentam esta heurística. Mínimo de 3.",
          },
        },
        required: ["topicoNome", "texto", "tentativaIds"],
      },
    },
  },
  required: ["heuristicas"],
};

type CandidataIA = { topicoNome: string; texto: string; tentativaIds: string[] };

export async function POST() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const ultima = await ultimaDestilacaoEm();
  const agora = new Date();
  if (!podeDestilarNovamente(ultima, agora)) {
    return NextResponse.json(
      {
        erro: "Heurísticas já foram destiladas esta semana.",
        proximaDestilacaoDisponivelEm: proximaDestilacaoDisponivelEm(ultima!).toISOString(),
      },
      { status: 400 },
    );
  }

  const desde = new Date(agora.getTime() - DIAS_JANELA_EVIDENCIA * 24 * 60 * 60 * 1000);
  const linhas = await tentativasParaDestilacao(desde);

  if (linhas.length === 0) {
    return NextResponse.json(
      { erro: "Sem tentativas erradas recentes suficientes para destilar heurísticas." },
      { status: 404 },
    );
  }

  const topicos = await db.select({ id: topico.id, nome: topico.nome }).from(topico);
  const topicoIdPorNome = new Map(topicos.map((t) => [t.nome, t.id]));
  const nomePorTopicoId = new Map(topicos.map((t) => [t.id, t.nome]));

  const porTopico = new Map<string, typeof linhas>();
  for (const l of linhas) {
    const lista = porTopico.get(l.topicoId) ?? [];
    lista.push(l);
    porTopico.set(l.topicoId, lista);
  }

  const entradaPrompt = [...porTopico.entries()]
    .filter(([, itens]) => evidenciaSuficiente(itens.length))
    .map(([topicoId, itens]) => ({
      topico: nomePorTopicoId.get(topicoId) ?? "",
      tentativas: itens.map((i) => ({
        id: i.tentativaId,
        enunciado: i.enunciado,
        respostaDada: i.respostaDada,
        gabarito: i.gabarito,
        causaErro: i.causaErro,
        motivoDistrator: i.motivoDistrator,
      })),
    }));

  if (entradaPrompt.length === 0) {
    return NextResponse.json(
      {
        erro:
          "Nenhum tópico tem ao menos 3 tentativas erradas recentes — volume insuficiente para destilar.",
      },
      { status: 404 },
    );
  }

  const prompt = `Você destila heurísticas de estudo a partir de erros reais registrados
pelo usuário nos últimos ${DIAS_JANELA_EVIDENCIA} dias.

Regras (seção 5, Tarefa C do doc de produto):
- Regra curta, acionável, em segunda pessoa, ligada a um GATILHO OBSERVÁVEL
  no texto do enunciado (um padrão de palavras, não "preste atenção em X").
- Baseie-se exclusivamente nas tentativas fornecidas abaixo. Nunca invente
  evidência: "tentativaIds" deve conter apenas ids desta lista.
- Mínimo de 3 tentativas de evidência por heurística.
- Só proponha heurística quando o padrão for claro nos dados; não force uma
  regra para tópicos sem padrão real.

Exemplo do formato esperado (não copie o conteúdo, é só estilo):
Bom:  "Quando o enunciado disser 'sobre o valor anterior', o denominador é o
       valor anterior, não o inicial. Você errou isso em 4 de 5 tentativas."
Ruim: "Preste atenção em porcentagem."

Dados (por tópico):
${JSON.stringify(entradaPrompt, null, 2)}`;

  try {
    const resultado = await gerarSaidaEstruturada<{ heuristicas: CandidataIA[] }>({
      tarefa: "destilador_heuristicas",
      modelo: MODELO_FLASH,
      prompt,
      responseSchema,
      timeoutMs: 45_000,
    });

    const idsValidosPorTopico = new Map(
      entradaPrompt.map((e) => [e.topico, new Set(e.tentativas.map((t) => t.id))]),
    );

    const criadas = [];
    for (const candidata of resultado.heuristicas) {
      const topicoId = topicoIdPorNome.get(candidata.topicoNome);
      const idsValidos = idsValidosPorTopico.get(candidata.topicoNome);
      if (!topicoId || !idsValidos) continue; // tópico inventado, descarta

      const evidenciaReal = candidata.tentativaIds.filter((id) => idsValidos.has(id));
      if (!evidenciaSuficiente(evidenciaReal.length)) continue; // evidência insuficiente/inventada

      const [criada] = await db
        .insert(heuristica)
        .values({
          texto: candidata.texto,
          topicoId,
          origem: MODELO_FLASH,
          tentativasEvidencia: evidenciaReal,
        })
        .returning();
      criadas.push(criada);
    }

    if (criadas.length === 0) {
      return NextResponse.json(
        {
          erro:
            "A IA não encontrou nenhum padrão com evidência suficiente desta vez.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ criadas }, { status: 201 });
  } catch (erro) {
    if (erro instanceof OrcamentoDiarioExcedidoError) {
      return NextResponse.json({ erro: erro.message }, { status: 429 });
    }
    console.error("Falha ao destilar heurísticas:", erro);
    return NextResponse.json(
      { erro: "Não foi possível destilar heurísticas agora." },
      { status: 502 },
    );
  }
}
