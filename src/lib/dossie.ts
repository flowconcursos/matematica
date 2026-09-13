export type ConfiabilidadeDossie = "baixa" | "media" | "alta";

/**
 * Seção 5, Tarefa E: baixa abaixo de 50 questões, média até 200, alta
 * acima.
 */
export function calcularConfiabilidade(nQuestoes: number): ConfiabilidadeDossie {
  if (nQuestoes < 50) return "baixa";
  if (nQuestoes < 200) return "media";
  return "alta";
}

export type QuestaoObservada = {
  tipo: string;
  topicoNomes: string[];
};

export type TentativaObservada = {
  segundos: number;
};

export type Observado = {
  distribuicaoPorTopico: { topico: string; contagem: number }[];
  distribuicaoPorTipo: { tipo: string; contagem: number }[];
  tempoMedioSegundos: number;
  nQuestoes: number;
};

/**
 * Camada OBSERVADO do dossiê (Tarefa E): puramente calculada a partir
 * dos dados do usuário, sem IA — extraído dos dados dele, com contagem.
 */
export function calcularObservado(
  questoes: QuestaoObservada[],
  tentativas: TentativaObservada[],
): Observado {
  const porTopico = new Map<string, number>();
  const porTipo = new Map<string, number>();

  for (const q of questoes) {
    porTipo.set(q.tipo, (porTipo.get(q.tipo) ?? 0) + 1);
    for (const nome of q.topicoNomes) {
      porTopico.set(nome, (porTopico.get(nome) ?? 0) + 1);
    }
  }

  const tempoMedioSegundos = tentativas.length
    ? tentativas.reduce((soma, t) => soma + t.segundos, 0) / tentativas.length
    : 0;

  return {
    distribuicaoPorTopico: [...porTopico.entries()]
      .map(([topico, contagem]) => ({ topico, contagem }))
      .sort((a, b) => b.contagem - a.contagem),
    distribuicaoPorTipo: [...porTipo.entries()]
      .map(([tipo, contagem]) => ({ tipo, contagem }))
      .sort((a, b) => b.contagem - a.contagem),
    tempoMedioSegundos,
    nQuestoes: questoes.length,
  };
}

const DIAS_ENTRE_GERACOES = 7;

/**
 * "Análises pesadas rodam sob demanda ou no máximo uma vez por semana"
 * (seção 2 do doc de produto).
 */
export function podeGerarNovamente(ultimaGeracao: Date | null, agora: Date): boolean {
  if (!ultimaGeracao) return true;
  const diasDesde = (agora.getTime() - ultimaGeracao.getTime()) / (1000 * 60 * 60 * 24);
  return diasDesde >= DIAS_ENTRE_GERACOES;
}

export function proximaGeracaoDisponivelEm(ultimaGeracao: Date): Date {
  const proxima = new Date(ultimaGeracao);
  proxima.setDate(proxima.getDate() + DIAS_ENTRE_GERACOES);
  return proxima;
}
