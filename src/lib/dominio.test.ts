import { describe, expect, it } from "vitest";
import { classificarDominio, type TentativaParaDominio } from "./dominio";

function tentativa(
  data: string,
  overrides: Partial<TentativaParaDominio> = {},
): TentativaParaDominio {
  return {
    acertou: true,
    confiancaDeclarada: "certo",
    segundos: 30,
    metaSegundosNaEpoca: 60,
    data,
    ...overrides,
  };
}

function gerarTentativasFirmes(dias: string[]): TentativaParaDominio[] {
  const tentativas: TentativaParaDominio[] = [];
  for (const dia of dias) {
    tentativas.push(tentativa(dia));
  }
  return tentativas;
}

describe("classificarDominio", () => {
  it("não avaliado quando não há tentativas", () => {
    expect(classificarDominio([])).toBe("nao_avaliado");
  });

  it("frágil quando a taxa de acerto firme é baixa", () => {
    const tentativas = [
      tentativa("2026-01-01", { acertou: false }),
      tentativa("2026-01-01", { confiancaDeclarada: "chute" }),
      tentativa("2026-01-02"),
    ];
    expect(classificarDominio(tentativas)).toBe("fragil");
  });

  it("em construção com taxa alta mas volume insuficiente (<15 tentativas)", () => {
    const dias = Array.from({ length: 10 }, (_, i) => `2026-01-${String(i + 1).padStart(2, "0")}`);
    expect(classificarDominio(gerarTentativasFirmes(dias))).toBe("em_construcao");
  });

  it("em construção com volume suficiente mas tudo no mesmo dia (não conta como domínio)", () => {
    const dias = Array.from({ length: 20 }, () => "2026-01-01");
    expect(classificarDominio(gerarTentativasFirmes(dias))).toBe("em_construcao");
  });

  it("firme com taxa >= 80%, >= 15 tentativas, em pelo menos 2 dias diferentes", () => {
    const dias = [
      ...Array.from({ length: 10 }, () => "2026-01-01"),
      ...Array.from({ length: 10 }, () => "2026-01-02"),
    ];
    expect(classificarDominio(gerarTentativasFirmes(dias))).toBe("firme");
  });

  it("não é firme se a taxa cair abaixo de 80% mesmo com volume e dias suficientes", () => {
    const tentativas = [
      ...Array.from({ length: 12 }, () => tentativa("2026-01-01")),
      ...Array.from({ length: 4 }, () => tentativa("2026-01-02", { acertou: false })),
    ];
    expect(classificarDominio(tentativas)).toBe("em_construcao");
  });
});
