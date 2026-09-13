import "server-only";
import { gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { aiUsage } from "@/db/schema";
import type { Schema } from "@google/genai";
import {
  chamarGemini,
  comRetentativa,
  comTimeout,
  orcamentoExcedido,
  OrcamentoDiarioExcedidoError,
} from "@/lib/ai";

export async function tokensUsadosHoje(): Promise<number> {
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);

  const [linha] = await db
    .select({
      total: sql<number>`coalesce(sum(${aiUsage.tokensEntrada} + ${aiUsage.tokensSaida}), 0)`,
    })
    .from(aiUsage)
    .where(gte(aiUsage.data, inicioDoDia));

  return Number(linha?.total ?? 0);
}

function tetoDiarioConfigurado(): number {
  return Number(process.env.AI_TETO_DIARIO_TOKENS ?? 0);
}

export async function verificarOrcamento(): Promise<void> {
  const teto = tetoDiarioConfigurado();
  if (teto <= 0) return; // sem teto configurado = sem limite
  const usados = await tokensUsadosHoje();
  if (orcamentoExcedido(usados, teto)) {
    throw new OrcamentoDiarioExcedidoError(usados, teto);
  }
}

export async function registrarUso(dados: {
  tarefa: string;
  modelo: string;
  tokensEntrada: number;
  tokensSaida: number;
}): Promise<void> {
  await db.insert(aiUsage).values(dados);
}

/**
 * Ponto único de chamada ao Gemini para saída estruturada (regra 5 da
 * seção 5 do doc: toda saída que alimenta o banco usa responseSchema).
 * Verifica orçamento diário, aplica timeout + retry com backoff, e
 * registra tokens em ai_usage antes de devolver o JSON já parseado.
 */
export async function gerarSaidaEstruturada<T>(params: {
  tarefa: string;
  modelo: string;
  prompt: string;
  responseSchema: Schema;
  timeoutMs?: number;
  arquivo?: { base64: string; mimeType: string };
}): Promise<T> {
  await verificarOrcamento();

  const resultado = await comRetentativa(() =>
    comTimeout(
      chamarGemini({
        modelo: params.modelo,
        prompt: params.prompt,
        responseSchema: params.responseSchema,
        arquivo: params.arquivo,
      }),
      params.timeoutMs ?? 30_000,
    ),
  );

  await registrarUso({
    tarefa: params.tarefa,
    modelo: params.modelo,
    tokensEntrada: resultado.tokensEntrada,
    tokensSaida: resultado.tokensSaida,
  });

  return JSON.parse(resultado.texto) as T;
}
