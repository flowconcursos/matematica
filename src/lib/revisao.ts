import type { EntradaHistoricoRevisao } from "@/db/schema";

/** Intervalos de repetição espaçada, um por etapa (0 a 3), em dias. */
export const INTERVALOS_DIAS = [1, 3, 7, 21] as const;
const ULTIMA_ETAPA = INTERVALOS_DIAS.length - 1;

export const LIMITE_ERROS_SEGUIDOS = 3;

export type ResultadoRevisao = {
  etapa: number;
  proximaData: Date | null;
  concluidaEm: Date | null;
};

function somarDias(data: Date, dias: number): Date {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

/**
 * Avalia a próxima etapa de revisão espaçada (seção 3 e 4.2 do documento
 * de produto). Errar sempre volta para a etapa 0 (mesmo que já tivesse
 * graduado). Acertar avança uma etapa; acertar na última etapa gradua o
 * item (concluida_em), tirando-o da fila ativa.
 */
export function avaliarRevisao(
  etapaAtual: number,
  acertou: boolean,
  agora: Date,
): ResultadoRevisao {
  if (!acertou) {
    return {
      etapa: 0,
      proximaData: somarDias(agora, INTERVALOS_DIAS[0]),
      concluidaEm: null,
    };
  }

  if (etapaAtual >= ULTIMA_ETAPA) {
    return { etapa: etapaAtual, proximaData: null, concluidaEm: agora };
  }

  const novaEtapa = etapaAtual + 1;
  return {
    etapa: novaEtapa,
    proximaData: somarDias(agora, INTERVALOS_DIAS[novaEtapa]),
    concluidaEm: null,
  };
}

export function errosSeguidos(historico: EntradaHistoricoRevisao[]): number {
  let contagem = 0;
  for (let i = historico.length - 1; i >= 0; i--) {
    if (historico[i].resultado === "errou") {
      contagem++;
    } else {
      break;
    }
  }
  return contagem;
}

/**
 * Item errado 3 vezes seguidas sai da fila normal e vira alerta de
 * buraco de pré-requisito (seção 4.2).
 */
export function temAlertaPrerequisito(
  historico: EntradaHistoricoRevisao[],
): boolean {
  return errosSeguidos(historico) >= LIMITE_ERROS_SEGUIDOS;
}
