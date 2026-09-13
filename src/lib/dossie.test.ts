import { describe, expect, it } from "vitest";
import {
  calcularConfiabilidade,
  calcularObservado,
  podeGerarNovamente,
  proximaGeracaoDisponivelEm,
} from "./dossie";

describe("calcularConfiabilidade", () => {
  it("é baixa abaixo de 50 questões", () => {
    expect(calcularConfiabilidade(0)).toBe("baixa");
    expect(calcularConfiabilidade(49)).toBe("baixa");
  });

  it("é média entre 50 (inclusive) e 200 (exclusive)", () => {
    expect(calcularConfiabilidade(50)).toBe("media");
    expect(calcularConfiabilidade(199)).toBe("media");
  });

  it("é alta a partir de 200", () => {
    expect(calcularConfiabilidade(200)).toBe("alta");
    expect(calcularConfiabilidade(1000)).toBe("alta");
  });
});

describe("calcularObservado", () => {
  it("conta questões por tópico e por tipo, e tempo médio das tentativas", () => {
    const observado = calcularObservado(
      [
        { tipo: "multipla", topicoNomes: ["Porcentagem"] },
        { tipo: "multipla", topicoNomes: ["Porcentagem", "Juros simples"] },
        { tipo: "calculo", topicoNomes: ["Juros simples"] },
      ],
      [{ segundos: 30 }, { segundos: 60 }],
    );

    expect(observado.nQuestoes).toBe(3);
    expect(observado.tempoMedioSegundos).toBe(45);
    expect(observado.distribuicaoPorTipo).toEqual([
      { tipo: "multipla", contagem: 2 },
      { tipo: "calculo", contagem: 1 },
    ]);
    const porcentagem = observado.distribuicaoPorTopico.find((t) => t.topico === "Porcentagem");
    const juros = observado.distribuicaoPorTopico.find((t) => t.topico === "Juros simples");
    expect(porcentagem?.contagem).toBe(2);
    expect(juros?.contagem).toBe(2);
  });

  it("não quebra com listas vazias", () => {
    const observado = calcularObservado([], []);
    expect(observado.nQuestoes).toBe(0);
    expect(observado.tempoMedioSegundos).toBe(0);
    expect(observado.distribuicaoPorTopico).toEqual([]);
  });
});

describe("podeGerarNovamente / proximaGeracaoDisponivelEm", () => {
  it("permite gerar quando nunca foi gerado", () => {
    expect(podeGerarNovamente(null, new Date())).toBe(true);
  });

  it("bloqueia antes de 7 dias", () => {
    const agora = new Date("2026-01-10T00:00:00Z");
    const geradoEm = new Date("2026-01-05T00:00:00Z");
    expect(podeGerarNovamente(geradoEm, agora)).toBe(false);
  });

  it("libera com 7 dias ou mais", () => {
    const agora = new Date("2026-01-12T00:00:00Z");
    const geradoEm = new Date("2026-01-05T00:00:00Z");
    expect(podeGerarNovamente(geradoEm, agora)).toBe(true);
  });

  it("proximaGeracaoDisponivelEm soma 7 dias à última geração", () => {
    const geradoEm = new Date("2026-01-05T00:00:00Z");
    expect(proximaGeracaoDisponivelEm(geradoEm).toISOString()).toBe(
      "2026-01-12T00:00:00.000Z",
    );
  });
});
