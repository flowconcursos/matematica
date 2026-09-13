import { get, set } from "idb-keyval";

const CHAVE = "tentativas-pendentes";

export type TentativaPendente = {
  idLocal: string;
  criadaEm: number;
  corpo: Record<string, unknown>;
};

async function lerFila(): Promise<TentativaPendente[]> {
  return (await get(CHAVE)) ?? [];
}

async function gravarFila(fila: TentativaPendente[]) {
  await set(CHAVE, fila);
}

/**
 * Grava a tentativa no IndexedDB antes de tentar enviar. Internet ruim
 * não pode custar um bloco inteiro de estudo (ver seção 2 do doc de produto).
 */
export async function enfileirarTentativa(corpo: Record<string, unknown>) {
  const item: TentativaPendente = {
    idLocal: crypto.randomUUID(),
    criadaEm: Date.now(),
    corpo,
  };
  const fila = await lerFila();
  fila.push(item);
  await gravarFila(fila);
  await sincronizarFila();
  return item.idLocal;
}

// Garante que chamadas concorrentes aguardem a mesma sincronização em
// andamento, em vez de retornar cedo demais e mentir sobre o estado da fila.
let sincronizacaoEmAndamento: Promise<void> | null = null;

export function sincronizarFila(): Promise<void> {
  if (!sincronizacaoEmAndamento) {
    sincronizacaoEmAndamento = executarSincronizacao().finally(() => {
      sincronizacaoEmAndamento = null;
    });
  }
  return sincronizacaoEmAndamento;
}

async function executarSincronizacao() {
  let fila = await lerFila();
  for (const item of [...fila]) {
    try {
      const resposta = await fetch("/api/tentativas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.corpo),
      });
      if (resposta.ok) {
        fila = fila.filter((i) => i.idLocal !== item.idLocal);
        await gravarFila(fila);
      }
    } catch {
      // sem rede: mantém na fila e tenta de novo depois
      break;
    }
  }
}

export async function contarPendentes(): Promise<number> {
  return (await lerFila()).length;
}
