import type { areaEnum, nivelQuestaoEnum } from "@/db/schema";

type Area = (typeof areaEnum.enumValues)[number];
type NivelQuestao = (typeof nivelQuestaoEnum.enumValues)[number];

/**
 * Meta de tempo provisória por área/nível, usada até a Fase 3 estimar
 * tempo razoável por questão via IA (Tarefa A do documento de produto).
 * Editável aqui; qualquer mudança só afeta tentativas futuras porque o
 * valor é congelado em meta_segundos_na_epoca no momento do registro.
 */
export const META_SEGUNDOS_PADRAO: Record<Area, Record<NivelQuestao, number>> = {
  aritmetica: { facil: 60, medio: 90, dificil: 120 },
  algebra: { facil: 75, medio: 110, dificil: 150 },
  geometria: { facil: 75, medio: 110, dificil: 150 },
  raciocinio_logico: { facil: 90, medio: 120, dificil: 180 },
  estatistica: { facil: 75, medio: 110, dificil: 150 },
  financeira: { facil: 90, medio: 120, dificil: 160 },
  conjuntos: { facil: 60, medio: 90, dificil: 120 },
};

export function metaSegundos(area: Area, nivel: NivelQuestao): number {
  return META_SEGUNDOS_PADRAO[area][nivel];
}
