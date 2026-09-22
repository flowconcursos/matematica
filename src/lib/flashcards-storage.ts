export type ClassificacaoCard = "dificil" | "bom" | "facil";

export interface CardProgresso {
  cardId: string;
  nivel: number; // 0 a 3
  acertos: number;
  ultimaRevisao: string;
  proximaRevisao: string;
}

const STORAGE_KEY = "flow_flashcards_progress_v1";

export function carregarProgressoCards(): Record<string, CardProgresso> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function registrarRevisaoCard(cardId: string, resposta: ClassificacaoCard): CardProgresso {
  const todos = carregarProgressoCards();
  const anterior = todos[cardId] || {
    cardId,
    nivel: 0,
    acertos: 0,
    ultimaRevisao: new Date().toISOString(),
    proximaRevisao: new Date().toISOString(),
  };

  let novoNivel = anterior.nivel;
  let diasAdicionar = 1;

  if (resposta === "dificil") {
    novoNivel = Math.max(0, anterior.nivel - 1);
    diasAdicionar = 1; // rever amanha
  } else if (resposta === "bom") {
    novoNivel = Math.min(3, anterior.nivel + 1);
    diasAdicionar = novoNivel === 1 ? 2 : novoNivel === 2 ? 4 : 7;
  } else if (resposta === "facil") {
    novoNivel = Math.min(3, anterior.nivel + 2);
    diasAdicionar = 10;
  }

  const proxima = new Date();
  proxima.setDate(proxima.getDate() + diasAdicionar);

  const atualizado: CardProgresso = {
    cardId,
    nivel: novoNivel,
    acertos: resposta !== "dificil" ? anterior.acertos + 1 : anterior.acertos,
    ultimaRevisao: new Date().toISOString(),
    proximaRevisao: proxima.toISOString(),
  };

  todos[cardId] = atualizado;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error("Falha ao salvar progresso do flashcard", e);
  }

  return atualizado;
}
