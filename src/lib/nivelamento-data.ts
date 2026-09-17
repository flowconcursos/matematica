export interface QuestaoNivelamento {
  id: number;
  area: string;
  moduloRecomendado: number;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
}

export const QUESTOES_NIVELAMENTO: QuestaoNivelamento[] = [
  {
    id: 1,
    area: "Jogo de Sinais e Operações Básicas",
    moduloRecomendado: 0,
    pergunta: "Qual é o resultado da expressão: -7 - (-12) + (-3)?",
    opcoes: [
      "-22",
      "2",
      "-2",
      "8"
    ],
    respostaCorreta: 1,
    explicacao: "-(-12) vira +12. Então temos: -7 + 12 - 3 = 5 - 3 = 2."
  },
  {
    id: 2,
    area: "Frações e MMC",
    moduloRecomendado: 0,
    pergunta: "Ao somar 2/3 com 1/4, obtemos:",
    opcoes: [
      "3/7",
      "11/12",
      "8/12",
      "3/12"
    ],
    respostaCorreta: 1,
    explicacao: "MMC de 3 e 4 é 12. Ajustando: (8/12) + (3/12) = 11/12. Nunca some os denominadores diretamente!"
  },
  {
    id: 3,
    area: "Porcentagem Mental e Descontos",
    moduloRecomendado: 1,
    pergunta: "Quanto é 35% de R$ 180?",
    opcoes: [
      "R$ 54,00",
      "R$ 63,00",
      "R$ 72,00",
      "R$ 60,00"
    ],
    respostaCorreta: 1,
    explicacao: "10% de 180 = 18. Logo, 30% = 3 × 18 = 54. Metade de 10% (5%) = 9. Total: 54 + 9 = R$ 63,00."
  },
  {
    id: 4,
    area: "Regra de Três Simples e Composta",
    moduloRecomendado: 2,
    pergunta: "Se 4 digitadores digitam um relatório em 6 horas, em quanto tempo 8 digitadores no mesmo ritmo fariam o mesmo serviço?",
    opcoes: [
      "12 horas",
      "3 horas",
      "4 horas",
      "2 horas"
    ],
    respostaCorreta: 1,
    explicacao: "Inversamente proporcional! Dobrando a quantidade de pessoas (4 para 8), o tempo cai pela metade: 6h / 2 = 3 horas."
  },
  {
    id: 5,
    area: "Equações do 1º Grau",
    moduloRecomendado: 3,
    pergunta: "Qual é o valor de x na equação: 3(x - 2) + 4 = 2x + 5?",
    opcoes: [
      "x = 7",
      "x = 5",
      "x = 9",
      "x = 3"
    ],
    respostaCorreta: 0,
    explicacao: "Distributiva: 3x - 6 + 4 = 2x + 5 -> 3x - 2 = 2x + 5 -> 3x - 2x = 5 + 2 -> x = 7."
  },
  {
    id: 6,
    area: "Juros Simples vs Compostos",
    moduloRecomendado: 4,
    pergunta: "Um capital de R$ 1.000 aplicado a juros simples de 2% ao mês durante 5 meses renderá quanto de JUROS?",
    opcoes: [
      "R$ 100,00",
      "R$ 1.100,00",
      "R$ 104,00",
      "R$ 50,00"
    ],
    respostaCorreta: 0,
    explicacao: "J = C · i · t = 1000 · 0,02 · 5 = 1000 · 0,10 = R$ 100 de juros (o montante total seria 1.100, mas a pergunta pede apenas os juros)."
  },
  {
    id: 7,
    area: "Geometria Básica e Perímetros/Áreas",
    moduloRecomendado: 5,
    pergunta: "Um terreno retangular tem 15 metros de comprimento e 8 metros de largura. Seu perímetro e sua área valem, respectivamente:",
    opcoes: [
      "46 m e 120 m²",
      "23 m e 120 m²",
      "46 m e 60 m²",
      "120 m e 46 m²"
    ],
    respostaCorreta: 0,
    explicacao: "Perímetro = 2(15 + 8) = 2(23) = 46 metros. Área = base × altura = 15 × 8 = 120 m²."
  },
  {
    id: 8,
    area: "Raciocínio Lógico Proposicional",
    moduloRecomendado: 1,
    pergunta: "Qual é a negação lógica da proposição: 'Todo concurseiro estuda todo dia'?",
    opcoes: [
      "Nenhum concurseiro estuda todo dia.",
      "Existe pelo menos um concurseiro que não estuda todo dia.",
      "Todos os concurseiros não estudam.",
      "Se é concurseiro, não estuda todo dia."
    ],
    respostaCorreta: 1,
    explicacao: "A negação de 'Todo A é B' é 'Pelo menos um A NÃO é B' (ou 'Existe algum A que não é B'). Não se nega 'Todo' com 'Nenhum'!"
  }
];
