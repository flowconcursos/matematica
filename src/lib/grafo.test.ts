import { describe, expect, it } from "vitest";
import { haveriaCiclo, type Aresta } from "./grafo";

describe("haveriaCiclo", () => {
  it("rejeita autorreferência (A depende de A)", () => {
    expect(haveriaCiclo([], { topicoId: "A", dependeDeTopicoId: "A" })).toBe(
      true,
    );
  });

  it("aceita a primeira aresta de um grafo vazio", () => {
    expect(
      haveriaCiclo([], { topicoId: "A", dependeDeTopicoId: "B" }),
    ).toBe(false);
  });

  it("rejeita ciclo direto (A depende de B, tentando B depende de A)", () => {
    const existentes: Aresta[] = [{ topicoId: "A", dependeDeTopicoId: "B" }];
    expect(
      haveriaCiclo(existentes, { topicoId: "B", dependeDeTopicoId: "A" }),
    ).toBe(true);
  });

  it("rejeita ciclo mais longo (A->B->C, tentando C->A)", () => {
    const existentes: Aresta[] = [
      { topicoId: "A", dependeDeTopicoId: "B" },
      { topicoId: "B", dependeDeTopicoId: "C" },
    ];
    expect(
      haveriaCiclo(existentes, { topicoId: "C", dependeDeTopicoId: "A" }),
    ).toBe(true);
  });

  it("aceita um grafo em diamante (A e B dependem de D, C depende de A e B)", () => {
    const existentes: Aresta[] = [
      { topicoId: "A", dependeDeTopicoId: "D" },
      { topicoId: "B", dependeDeTopicoId: "D" },
      { topicoId: "C", dependeDeTopicoId: "A" },
    ];
    expect(
      haveriaCiclo(existentes, { topicoId: "C", dependeDeTopicoId: "B" }),
    ).toBe(false);
  });

  it("aceita aresta desconectada do restante do grafo", () => {
    const existentes: Aresta[] = [{ topicoId: "A", dependeDeTopicoId: "B" }];
    expect(
      haveriaCiclo(existentes, { topicoId: "X", dependeDeTopicoId: "Y" }),
    ).toBe(false);
  });

  it("não trava em grafos com muitos nós compartilhados (sem loop infinito)", () => {
    const existentes: Aresta[] = [
      { topicoId: "A", dependeDeTopicoId: "B" },
      { topicoId: "A", dependeDeTopicoId: "C" },
      { topicoId: "B", dependeDeTopicoId: "D" },
      { topicoId: "C", dependeDeTopicoId: "D" },
    ];
    expect(
      haveriaCiclo(existentes, { topicoId: "D", dependeDeTopicoId: "E" }),
    ).toBe(false);
  });
});
