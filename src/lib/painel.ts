import { acertoFirme, type TentativaParaCalculo } from "@/lib/calculo";
import { classificarDominio } from "@/lib/dominio";

export type CausaErro = "conceito" | "conta" | "leitura" | "tempo" | "distrator";

export type TentativaPainel = TentativaParaCalculo & {
  causaErro: CausaErro | null;
  data: Date;
  questaoId: string;
};

export function taxaAcertoFirme(tentativas: TentativaPainel[]): number {
  if (tentativas.length === 0) return 0;
  return tentativas.filter(acertoFirme).length / tentativas.length;
}

export function tempoMedioSegundos(tentativas: TentativaPainel[]): number {
  if (tentativas.length === 0) return 0;
  return tentativas.reduce((soma, t) => soma + t.segundos, 0) / tentativas.length;
}

export function calibracaoPorConfianca(tentativas: TentativaPainel[]) {
  const niveis = ["certo", "duvida", "chute"] as const;
  return niveis.map((nivel) => {
    const doNivel = tentativas.filter((t) => t.confiancaDeclarada === nivel);
    const acertos = doNivel.filter((t) => t.acertou).length;
    return {
      nivel,
      n: doNivel.length,
      taxaAcerto: doNivel.length ? acertos / doNivel.length : null,
    };
  });
}

function chaveDia(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function constanciaDiaria(tentativas: TentativaPainel[], dias = 30) {
  const contagemPorDia = new Map<string, number>();
  for (const t of tentativas) {
    const chave = chaveDia(t.data);
    contagemPorDia.set(chave, (contagemPorDia.get(chave) ?? 0) + 1);
  }

  const hoje = new Date();
  const resultado: { dia: string; quantidade: number }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const chave = chaveDia(d);
    resultado.push({ dia: chave, quantidade: contagemPorDia.get(chave) ?? 0 });
  }
  return resultado;
}

function inicioDaSemana(data: Date): Date {
  const d = new Date(data);
  const diaSemana = d.getDay();
  const deslocamento = (diaSemana + 6) % 7; // semana começa na segunda
  d.setDate(d.getDate() - deslocamento);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const CAUSAS: CausaErro[] = [
  "conceito",
  "conta",
  "leitura",
  "tempo",
  "distrator",
];

export function causasPorSemana(tentativas: TentativaPainel[], semanas = 8) {
  const erros = tentativas.filter((t) => !t.acertou && t.causaErro);

  const hoje = inicioDaSemana(new Date());
  const semanasLista: Date[] = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i * 7);
    semanasLista.push(d);
  }

  return semanasLista.map((inicioSemana) => {
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 7);

    const daSemana = erros.filter(
      (t) => t.data >= inicioSemana && t.data < fimSemana,
    );

    const porCausa = Object.fromEntries(
      CAUSAS.map((c) => [c, daSemana.filter((t) => t.causaErro === c).length]),
    ) as Record<CausaErro, number>;

    return {
      semanaLabel: inicioSemana.toISOString().slice(0, 10),
      total: daSemana.length,
      porCausa,
    };
  });
}

export function tempoMedioPorTopico(
  tentativas: TentativaPainel[],
  questaoParaTopicos: Map<string, string[]>,
  topicos: { id: string; nome: string }[],
) {
  const porTopico = new Map<string, number[]>();
  for (const t of tentativas) {
    const topicoIds = questaoParaTopicos.get(t.questaoId) ?? [];
    for (const topicoId of topicoIds) {
      const lista = porTopico.get(topicoId) ?? [];
      lista.push(t.segundos);
      porTopico.set(topicoId, lista);
    }
  }

  return topicos
    .map((topico) => {
      const segundos = porTopico.get(topico.id) ?? [];
      const media = segundos.length
        ? segundos.reduce((a, b) => a + b, 0) / segundos.length
        : null;
      return { topicoId: topico.id, nome: topico.nome, mediaSegundos: media, n: segundos.length };
    })
    .filter((t) => t.mediaSegundos !== null)
    .sort((a, b) => (b.mediaSegundos ?? 0) - (a.mediaSegundos ?? 0));
}

export type DominioContagem = {
  firmes: number;
  avaliados: number;
};

export function contarTopicosFirmes(
  tentativas: TentativaPainel[],
  questaoParaTopicos: Map<string, string[]>,
  topicoIds: string[],
): DominioContagem {
  const porTopico = new Map<string, TentativaPainel[]>();
  for (const t of tentativas) {
    for (const topicoId of questaoParaTopicos.get(t.questaoId) ?? []) {
      const lista = porTopico.get(topicoId) ?? [];
      lista.push(t);
      porTopico.set(topicoId, lista);
    }
  }

  let firmes = 0;
  let avaliados = 0;
  for (const topicoId of topicoIds) {
    const dominio = classificarDominio(porTopico.get(topicoId) ?? []);
    if (dominio === "nao_avaliado") continue;
    avaliados++;
    if (dominio === "firme") firmes++;
  }
  return { firmes, avaliados };
}
