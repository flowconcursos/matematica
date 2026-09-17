export interface TermoTraducao {
  id: string;
  expressaoPortugues: string;
  traducaoMatematica: string;
  categoria: "operacoes" | "relacoes" | "porcentagem" | "algebra";
  exemploFrase: string;
  exemploEquacao: string;
  dica: string;
}

export interface DesafioTraducao {
  id: string;
  fraseConcurso: string;
  bancaOrigem: string;
  opcoes: string[];
  opcaoCorreta: string;
  explicacaoPassoAPasso: string;
}

export const TERMOS_TRADUCAO: TermoTraducao[] = [
  {
    id: "igualdade",
    expressaoPortugues: "É, resulta em, totaliza, tem-se, equivale a",
    traducaoMatematica: "=",
    categoria: "relacoes",
    exemploFrase: "A soma de dois números é 50.",
    exemploEquacao: "x + y = 50",
    dica: "Sempre que o verbo indicar estado ou resultado, troque imediatamente pelo sinal de igualdade.",
  },
  {
    id: "preposicao-de",
    expressaoPortugues: "De, do, da, dos, das",
    traducaoMatematica: "\\times",
    categoria: "operacoes",
    exemploFrase: "Dois quintos do salário de Ana.",
    exemploEquacao: "\\frac{2}{5} \\times S",
    dica: "A preposição 'de' após frações ou porcentagens significa MULTIPLICAÇÃO sem exceção.",
  },
  {
    id: "dobro-triplo",
    expressaoPortugues: "O dobro, o triplo, o quádruplo de algo",
    traducaoMatematica: "2x, \\; 3x, \\; 4x",
    categoria: "algebra",
    exemploFrase: "O triplo de um valor.",
    exemploEquacao: "3x",
    dica: "Multiplicação direta da incógnita pelo fator numérico.",
  },
  {
    id: "metade-terca",
    expressaoPortugues: "A metade, a terça parte, a quarta parte",
    traducaoMatematica: "\\frac{x}{2}, \\; \\frac{x}{3}, \\; \\frac{x}{4}",
    categoria: "operacoes",
    exemploFrase: "A metade de um número mais 8.",
    exemploEquacao: "\\frac{x}{2} + 8",
    dica: "Divisão da incógnita pelo número correspondente.",
  },
  {
    id: "razao",
    expressaoPortugues: "A razão entre A e B",
    traducaoMatematica: "\\frac{A}{B}",
    categoria: "relacoes",
    exemploFrase: "A razão entre o número de homens e mulheres é 3 para 5.",
    exemploEquacao: "\\frac{H}{M} = \\frac{3}{5}",
    dica: "Razão é divisão. Coloque sempre o primeiro que foi citado em cima (numerador) e o segundo embaixo (denominador).",
  },
  {
    id: "diferenca",
    expressaoPortugues: "A diferença entre dois valores",
    traducaoMatematica: "A - B",
    categoria: "operacoes",
    exemploFrase: "A diferença entre a idade de Pedro e Maria é 6 anos.",
    exemploEquacao: "P - M = 6",
    dica: "Diferença é a subtração do primeiro pelo segundo.",
  },
  {
    id: "consecutivos",
    expressaoPortugues: "Dois números inteiros consecutivos",
    traducaoMatematica: "x \\quad \\text{e} \\quad x + 1",
    categoria: "algebra",
    exemploFrase: "A soma de dois números consecutivos é 41.",
    exemploEquacao: "x + (x + 1) = 41",
    dica: "O número seguinte sempre tem uma unidade a mais que o anterior.",
  },
  {
    id: "aumento-percentual",
    expressaoPortugues: "Aumentou em P%",
    traducaoMatematica: "\\times (1 + \\frac{P}{100})",
    categoria: "porcentagem",
    exemploFrase: "O preço X sofreu reajuste de 12%.",
    exemploEquacao: "X \\times 1{,}12",
    dica: "Some a taxa decimal a 1,00 para ter o multiplicador do valor já aumentado.",
  },
  {
    id: "desconto-percentual",
    expressaoPortugues: "Diminuiu ou teve desconto de P%",
    traducaoMatematica: "\\times (1 - \\frac{P}{100})",
    categoria: "porcentagem",
    exemploFrase: "O produto Y teve desconto de 18%.",
    exemploEquacao: "Y \\times 0{,}82",
    dica: "Subtraia a taxa decimal de 1,00 (100% - 18% = 82% -> 0,82).",
  },
  {
    id: "excede",
    expressaoPortugues: "A excede B em C unidades (ou A tem C a mais que B)",
    traducaoMatematica: "A = B + C \\quad \\text{ou} \\quad A - B = C",
    categoria: "relacoes",
    exemploFrase: "O salário de João excede o de Marcos em R$ 400.",
    exemploEquacao: "J = M + 400",
    dica: "Quem excede tem a mais: pegue o menor e some a diferença para igualar.",
  },
];

export const DESAFIOS_TRADUCAO: DesafioTraducao[] = [
  {
    id: "desafio-1",
    fraseConcurso: "O triplo da quantia que Paulo possui, diminuído de R$ 40, é igual ao dobro da quantia de Paulo mais R$ 20.",
    bancaOrigem: "VUNESP - Nível Médio",
    opcoes: [
      "3P - 40 = 2P + 20",
      "3(P - 40) = 2P + 20",
      "3P + 40 = 2(P + 20)",
      "3P - 2P = 40 + 20",
    ],
    opcaoCorreta: "3P - 40 = 2P + 20",
    explicacaoPassoAPasso: "'O triplo da quantia de Paulo' = 3P. 'diminuído de 40' = - 40. 'é igual a' = '='. 'o dobro da quantia de Paulo' = 2P. 'mais 20' = + 20. Juntando: 3P - 40 = 2P + 20.",
  },
  {
    id: "desafio-2",
    fraseConcurso: "A soma de três números inteiros e consecutivos é igual a 72.",
    bancaOrigem: "Fundação Cesgranrio - Nível Médio",
    opcoes: [
      "x + (x + 1) + (x + 2) = 72",
      "x + y + z = 72",
      "3x = 72",
      "(x + 1) + (x + 2) + (x + 3) = 72",
    ],
    opcaoCorreta: "x + (x + 1) + (x + 2) = 72",
    explicacaoPassoAPasso: "Como são consecutivos, o 1º é x, o 2º é x+1 e o 3º é x+2. A soma dos três: x + (x+1) + (x+2) = 72.",
  },
  {
    id: "desafio-3",
    fraseConcurso: "Em um concurso, dois quintos dos candidatos inscritos faltaram à prova e 360 compareceram.",
    bancaOrigem: "IBFC - Agente de Correios",
    opcoes: [
      "3/5 de C = 360",
      "2/5 de C = 360",
      "C - 360 = 2/5",
      "2/5 + C = 360",
    ],
    opcaoCorreta: "3/5 de C = 360",
    explicacaoPassoAPasso: "Se 2/5 faltaram, quem compareceu foi o restante do total (1 inteiro menos 2/5 = 3/5). Logo, os 360 que compareceram equivalem a 3/5 do total C!",
  },
  {
    id: "desafio-4",
    fraseConcurso: "A idade de Maria é o dobro da idade de Joana, e a soma das duas idades é 45 anos.",
    bancaOrigem: "FGV - Nível Médio",
    opcoes: [
      "M = 2J e M + J = 45",
      "M = J/2 e M + J = 45",
      "2M + J = 45",
      "M + 2J = 45",
    ],
    opcaoCorreta: "M = 2J e M + J = 45",
    explicacaoPassoAPasso: "'A idade de Maria (M) é (=) o dobro de Joana (2J)' -> M = 2J. 'A soma das duas é 45' -> M + J = 45.",
  },
  {
    id: "desafio-5",
    fraseConcurso: "Um comerciante aumentou o preço de uma mercadoria em 20% e, na semana seguinte, deu um desconto de 20% sobre o novo preço.",
    bancaOrigem: "Cebraspe - Nível Médio",
    opcoes: [
      "Preço Final = P × 1,20 × 0,80",
      "Preço Final = P × 1,00",
      "Preço Final = P + 0,20 - 0,20",
      "Preço Final = P × (1,20 - 0,80)",
    ],
    opcaoCorreta: "Preço Final = P × 1,20 × 0,80",
    explicacaoPassoAPasso: "Aumento de 20% = fator 1,20. Desconto de 20% subsequente = fator 0,80. O preço final é a multiplicação sucessiva: P × 1,20 × 0,80.",
  },
];
