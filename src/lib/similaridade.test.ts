import { describe, expect, it } from "vitest";
import {
  similaridadeJaccard,
  encontrarDuplicataMaisProxima,
  LIMIAR_DUPLICATA,
} from "./similaridade";

describe("similaridadeJaccard", () => {
  it("é 1 para textos idênticos", () => {
    expect(similaridadeJaccard("Quanto é 10% de 200?", "Quanto é 10% de 200?")).toBe(
      1,
    );
  });

  it("ignora maiúsculas, acentos e pontuação", () => {
    expect(
      similaridadeJaccard("Qual é a área do círculo?", "qual e a area do circulo"),
    ).toBe(1);
  });

  it("é alta para parafraseamento próximo", () => {
    const sim = similaridadeJaccard(
      "Um produto custa R$ 200 e tem desconto de 15%. Qual o novo preço?",
      "Um produto custa R$ 200 com desconto de 15%. Qual é o novo preço?",
    );
    expect(sim).toBeGreaterThanOrEqual(LIMIAR_DUPLICATA);
  });

  it("é baixa para questões de assuntos diferentes", () => {
    const sim = similaridadeJaccard(
      "Quanto é 10% de 200?",
      "Qual a probabilidade de sair um número par em um dado de 6 faces?",
    );
    expect(sim).toBeLessThan(LIMIAR_DUPLICATA);
  });

  it("é 0 quando um dos textos é vazio e o outro não", () => {
    expect(similaridadeJaccard("", "algo")).toBe(0);
  });
});

describe("encontrarDuplicataMaisProxima", () => {
  const existentes = [
    { id: "1", enunciado: "Quanto é 10% de 200?" },
    { id: "2", enunciado: "Qual a probabilidade de sair par em um dado?" },
  ];

  it("retorna null quando nada passa do limiar", () => {
    expect(
      encontrarDuplicataMaisProxima("Resolva a equação 2x + 5 = 17.", existentes),
    ).toBeNull();
  });

  it("encontra a duplicata mais próxima acima do limiar", () => {
    const resultado = encontrarDuplicataMaisProxima(
      "Quanto é 10% de 200?",
      existentes,
    );
    expect(resultado?.id).toBe("1");
    expect(resultado?.similaridade).toBe(1);
  });
});
