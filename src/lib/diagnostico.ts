const DIAS_ENTRE_DIAGNOSTICOS = 7;
const TENTATIVAS_ENTRE_DIAGNOSTICOS = 100;

/**
 * Tarefa D (seção 5): "a cada 7 dias ou 100 tentativas". Precisa de ao
 * menos uma tentativa nova para não gerar diagnóstico vazio.
 */
export function elegivelParaDiagnostico(
  ultimoGeradoEm: Date | null,
  agora: Date,
  tentativasDesdeUltimo: number,
): boolean {
  if (tentativasDesdeUltimo <= 0) return false;
  if (!ultimoGeradoEm) return true;

  const dias = (agora.getTime() - ultimoGeradoEm.getTime()) / (1000 * 60 * 60 * 24);
  return dias >= DIAS_ENTRE_DIAGNOSTICOS || tentativasDesdeUltimo >= TENTATIVAS_ENTRE_DIAGNOSTICOS;
}
