export interface MateriaCustomEdital {
  materia: string;
  porcentagem: number;
  peso: "critico" | "alto" | "medio";
  dicaBanca: string;
  moduloJornadaSugerido?: number;
  concluido?: boolean;
}

export interface CustomEdital {
  id: string;
  nomeConcurso: string;
  orgao: string;
  banca: string;
  anoReferencia: string;
  descricao: string;
  dicaEstrategica: string;
  materias: MateriaCustomEdital[];
  pegadinhasClassicas: string[];
  criadoEm: string;
}

const STORAGE_KEY_EDITAIS = "flow_meus_editais";
const STORAGE_KEY_ATIVO = "flow_edital_ativo_id";

export function obterMeusEditais(): CustomEdital[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EDITAIS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function salvarEdital(edital: Omit<CustomEdital, "id" | "criadoEm">): CustomEdital {
  const editais = obterMeusEditais();
  const novo: CustomEdital = {
    ...edital,
    id: "custom-" + Date.now(),
    criadoEm: new Date().toISOString(),
    materias: edital.materias.map((m) => ({ ...m, concluido: false })),
  };

  const listaAtualizada = [novo, ...editais];
  localStorage.setItem(STORAGE_KEY_EDITAIS, JSON.stringify(listaAtualizada));
  definirEditalAtivo(novo.id);
  return novo;
}

export function alternarTopicoConcluido(editalId: string, materiaNome: string): CustomEdital | null {
  const editais = obterMeusEditais();
  const idx = editais.findIndex((e) => e.id === editalId);
  if (idx === -1) return null;

  const edital = editais[idx];
  edital.materias = edital.materias.map((m) => {
    if (m.materia === materiaNome) {
      return { ...m, concluido: !m.concluido };
    }
    return m;
  });

  editais[idx] = edital;
  localStorage.setItem(STORAGE_KEY_EDITAIS, JSON.stringify(editais));
  return edital;
}

export function excluirEdital(id: string): void {
  const editais = obterMeusEditais().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY_EDITAIS, JSON.stringify(editais));
  if (obterEditalAtivoId() === id) {
    localStorage.removeItem(STORAGE_KEY_ATIVO);
  }
}

export function obterEditalAtivoId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_ATIVO);
}

export function definirEditalAtivo(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ATIVO, id);
}
