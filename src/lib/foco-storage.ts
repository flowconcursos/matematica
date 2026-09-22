export interface HistoricoFoco {
  streakAtual: number;
  ultimoDiaAtivo: string; // YYYY-MM-DD
  minutosFocadosHoje: number;
  sessoesConcluidas: number;
}

const STORAGE_KEY = "flow_modo_foco_streak_v1";

function getHojeISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function carregarHistoricoFoco(): HistoricoFoco {
  if (typeof window === "undefined") {
    return { streakAtual: 1, ultimoDiaAtivo: getHojeISO(), minutosFocadosHoje: 0, sessoesConcluidas: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { streakAtual: 1, ultimoDiaAtivo: getHojeISO(), minutosFocadosHoje: 0, sessoesConcluidas: 0 };
    }
    const dados = JSON.parse(raw);
    const hoje = getHojeISO();

    // Se mudou o dia, zera minutosFocadosHoje
    if (dados.ultimoDiaAtivo !== hoje) {
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      const ontemISO = ontem.toISOString().split("T")[0];

      const manteveStreak = dados.ultimoDiaAtivo === ontemISO;
      dados.streakAtual = manteveStreak ? dados.streakAtual : 1;
      dados.minutosFocadosHoje = 0;
      dados.ultimoDiaAtivo = hoje;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }
    return dados;
  } catch {
    return { streakAtual: 1, ultimoDiaAtivo: getHojeISO(), minutosFocadosHoje: 0, sessoesConcluidas: 0 };
  }
}

export function registrarMinutosFoco(minutos: number): HistoricoFoco {
  const atual = carregarHistoricoFoco();
  const hoje = getHojeISO();

  atual.minutosFocadosHoje += minutos;
  atual.sessoesConcluidas += 1;
  atual.ultimoDiaAtivo = hoje;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atual));
  } catch (e) {
    console.error("Falha ao salvar sessão de foco", e);
  }
  return atual;
}
