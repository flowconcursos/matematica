export interface Flashcard {
  id: string;
  categoria: "regras_sinais" | "porcentagem_juros" | "geometria" | "rlm_conectivos" | "pegadinhas_bancas";
  tituloCategoria: string;
  frente: string;
  dica?: string;
  verso: string;
  mnemonicoOuVisual?: string;
  bancasMaisCobram?: string;
}

export const FLASHCARDS_MESTRES: Flashcard[] = [
  {
    id: "fc-1",
    categoria: "rlm_conectivos",
    tituloCategoria: "Raciocínio Lógico",
    frente: "Como se nega uma proposição do tipo 'SE P, ENTÃO Q' (P → Q)?",
    dica: "Lembre-se da regra do marido traidor...",
    verso: "Regra do MANÉ:\nMantém a primeira (P)\nE\nNEGA a segunda (~Q).\n\nFórmula: ~(P → Q) = P ∧ ~Q",
    mnemonicoOuVisual: "MA-NE: Mantém a primeira, E, Nega a segunda.",
    bancasMaisCobram: "Cespe/Cebraspe, FGV, FCC",
  },
  {
    id: "fc-2",
    categoria: "rlm_conectivos",
    tituloCategoria: "Raciocínio Lógico",
    frente: "Qual é a equivalência lógica clássica (contrapositiva) de 'Se P, então Q'?",
    dica: "Inverta tudo e troque os sinais...",
    verso: "Volta negando tudo!\n\nP → Q  <=>  ~Q → ~P\n\nExemplo: 'Se chove, molha' equivale a 'Se NÃO molhou, NÃO choveu'.",
    mnemonicoOuVisual: "Regra do espelho: inverte a ordem e nega ambas.",
    bancasMaisCobram: "FGV, Vunesp, Cespe",
  },
  {
    id: "fc-3",
    categoria: "porcentagem_juros",
    tituloCategoria: "Matemática Financeira",
    frente: "Qual a fórmula infalível de Juros Simples?",
    dica: "O que o juro faz com seu bolso...",
    verso: "J = C × i × t\n(Juro = Capital × Taxa × Tempo)\n\nMontante = Capital + Juros",
    mnemonicoOuVisual: "J = C.I.T. (ou 'J = C.I.N.T.A.' / 100)",
    bancasMaisCobram: "Cesgranrio, FCC, Vunesp",
  },
  {
    id: "fc-4",
    categoria: "porcentagem_juros",
    tituloCategoria: "Porcentagem",
    frente: "Se um produto tem aumento de 20% e depois desconto de 20%, ele volta ao preço original?",
    dica: "A base de cálculo mudou no segundo passo!",
    verso: "NÃO! Ele fica 4% mais barato.\n\nCálculo com R$ 100:\n100 + 20% = R$ 120.\n120 - 20% (R$ 24) = R$ 96!\n\nPerda final = 4%.",
    mnemonicoOuVisual: "Aumentos e descontos sucessivos de mesma taxa x% SEMPRE resultam em prejuízo de (x²/100)%.",
    bancasMaisCobram: "Vunesp, Cespe, FGV",
  },
  {
    id: "fc-5",
    categoria: "regras_sinais",
    tituloCategoria: "Aritmética Básica",
    frente: "Qual é o resultado de: -5² versus (-5)²?",
    dica: "O parênteses protege o sinal?",
    verso: "-5² = - (5 × 5) = -25 (só o 5 está ao quadrado)\n\n(-5)² = (-5) × (-5) = +25 (o sinal também está ao quadrado!)",
    mnemonicoOuVisual: "Sem parênteses, o sinal de menos continua vivo!",
    bancasMaisCobram: "Todas as bancas de concurso",
  },
  {
    id: "fc-6",
    categoria: "geometria",
    tituloCategoria: "Geometria Plana",
    frente: "Qual a fórmula da área do Triângulo Equilátero em função do lado L?",
    dica: "Tem raiz de 3 no meio...",
    verso: "Área = (L² × √3) / 4\n\nAltura h = (L × √3) / 2",
    mnemonicoOuVisual: "L quadrado raiz de três sobre quatro.",
    bancasMaisCobram: "FCC, Cesgranrio, FGV",
  },
  {
    id: "fc-7",
    categoria: "geometria",
    tituloCategoria: "Geometria Plana",
    frente: "Teorema de Pitágoras e o 'Triângulo Sagrado' dos concursos:",
    dica: "A proporção 3, 4 e...",
    verso: "Triângulo 3-4-5:\nCateto 3, Cateto 4 -> Hipotenusa 5.\n\nSeus múltiplos aparecem em 80% das provas:\n6 - 8 - 10\n9 - 12 - 15\n12 - 16 - 20",
    mnemonicoOuVisual: "Identifique 3k, 4k e 5k para achar a resposta sem fazer contas!",
    bancasMaisCobram: "Cespe, FGV, Vunesp",
  },
  {
    id: "fc-8",
    categoria: "pegadinhas_bancas",
    tituloCategoria: "Armadilhas de Bancas",
    frente: "O que significa 'NÃO MAIS QUE 5' em um enunciado de concurso?",
    dica: "É menor ou menor igual?",
    verso: "Significa MENOR OU IGUAL A 5 (≤ 5).\n\nO 5 ESTÁ INCLUSO!\nExemplo: Se o problema pergunta inteiros positivos não maiores que 3: {1, 2, 3}.",
    mnemonicoOuVisual: "'Não mais que' = no máximo.",
    bancasMaisCobram: "Cespe, FGV",
  },
  {
    id: "fc-9",
    categoria: "pegadinhas_bancas",
    tituloCategoria: "Armadilhas de Bancas",
    frente: "Como calcular a média harmônica de velocidades em percursos de ida e volta iguais?",
    dica: "NÃO faça média aritmética simples (V1+V2)/2!",
    verso: "Vm = (2 × V1 × V2) / (V1 + V2)\n\nEx: Foi a 40 km/h e voltou a 60 km/h.\nVm = (2 × 40 × 60) / (40 + 60) = 4800 / 100 = 48 km/h (e não 50 km/h!).",
    mnemonicoOuVisual: "2 vezes o produto dividido pela soma!",
    bancasMaisCobram: "Cespe, FCC, FGV",
  },
  {
    id: "fc-10",
    categoria: "rlm_conectivos",
    tituloCategoria: "Raciocínio Lógico",
    frente: "Qual é a negação de 'Todo político é honesto'?",
    dica: "Cuidado! Não é 'Nenhum político é honesto'...",
    verso: "Basta UM contraexemplo!\n\n'Pelo menos um político NÃO é honesto' (ou 'Existe político que não é honesto').\n\nNUNCA negue 'Todo' usando 'Nenhum'.",
    mnemonicoOuVisual: "Regra do PEA: Pelo menos um / Existe / Algum ... NÃO É.",
    bancasMaisCobram: "Cespe/Cebraspe, FGV, FCC, Vunesp",
  },
];
