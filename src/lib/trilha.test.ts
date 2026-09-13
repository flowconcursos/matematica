import { describe, expect, it } from "vitest";
import { topicoLiberado, relampagoAprovado, RELAMPAGO_TOTAL_QUESTOES } from "./trilha";
import type { DominioTopico } from "./dominio";

function mapaDominio(entradas: [string, DominioTopico][]): Map<string, DominioTopico> {
  return new Map(entradas);
}

describe("topicoLiberado", () => {
  it("libera um tópico sem pré-requisitos", () => {
    expect(topicoLiberado([], new Map())).toBe(true);
  });

  it("libera quando todos os pré-requisitos diretos estão firmes", () => {
    const dominio = mapaDominio([
      ["base-1", "firme"],
      ["base-2", "firme"],
    ]);
    expect(topicoLiberado(["base-1", "base-2"], dominio)).toBe(true);
  });

  it("bloqueia quando um pré-requisito não está firme", () => {
    const dominio = mapaDominio([
      ["base-1", "firme"],
      ["base-2", "em_construcao"],
    ]);
    expect(topicoLiberado(["base-1", "base-2"], dominio)).toBe(false);
  });

  it("bloqueia quando um pré-requisito não foi avaliado (fora do mapa)", () => {
    const dominio = mapaDominio([["base-1", "firme"]]);
    expect(topicoLiberado(["base-1", "base-2"], dominio)).toBe(false);
  });

  it("bloqueia quando o pré-requisito está frágil", () => {
    const dominio = mapaDominio([["base-1", "fragil"]]);
    expect(topicoLiberado(["base-1"], dominio)).toBe(false);
  });
});

describe("relampagoAprovado", () => {
  it(`aprova com as ${RELAMPAGO_TOTAL_QUESTOES} questões corretas`, () => {
    expect(relampagoAprovado(RELAMPAGO_TOTAL_QUESTOES)).toBe(true);
  });

  it("reprova com um erro sequer", () => {
    expect(relampagoAprovado(RELAMPAGO_TOTAL_QUESTOES - 1)).toBe(false);
  });

  it("reprova com zero acertos", () => {
    expect(relampagoAprovado(0)).toBe(false);
  });
});
