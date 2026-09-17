export interface ProblemaGuiado {
  id: string;
  banca: string;
  concurso: string;
  enunciado: string;
  assunto: string;
  degraus: {
    degrau1: {
      titulo: string;
      pergunta: string;
      opcoes: string[];
      respostaCorreta: number;
      explicacao: string;
      dica: string;
    };
    degrau2: {
      titulo: string;
      pergunta: string;
      opcoes: string[];
      respostaCorreta: number;
      explicacao: string;
      formula: string;
    };
    degrau3: {
      titulo: string;
      pergunta: string;
      opcoes: string[];
      respostaCorreta: number;
      resolucaoDetalhada: string;
    };
  };
}

export const PROBLEMAS_GUIADOS: ProblemaGuiado[] = [
  {
    id: "prob-1",
    banca: "FGV",
    concurso: "Prefeitura - Nível Médio",
    assunto: "Regra de Três Inversa",
    enunciado: "Se 6 operários constroem um muro em 12 dias trabalhando no mesmo ritmo, em quantos dias 9 operários construiriam o mesmo muro?",
    degraus: {
      degrau1: {
        titulo: "Degrau 1: Filtrar os Dados e Relação de Grandezas",
        pergunta: "Qual é a relação entre a quantidade de operários e a quantidade de dias para fazer o mesmo serviço?",
        opcoes: [
          "Diretamente Proporcional: Se aumentam os operários, aumentam os dias necessários.",
          "Inversamente Proporcional: Mais operários trabalhando significa que a obra termina em MENOS dias.",
          "Não há relação matemática proporcional entre eles."
        ],
        respostaCorreta: 1,
        explicacao: "Excelente raciocínio! Mais braços trabalhando significa que o tempo necessário diminui. Portanto, a grandeza operários é INVERSAMENTE proporcional a dias.",
        dica: "Pense sempre: se você chamar 100 amigos para te ajudar a pintar uma sala, vai demorar mais tempo ou menos tempo?"
      },
      degrau2: {
        titulo: "Degrau 2: Montar a Estrutura Algébrica",
        pergunta: "Como devemos estruturar o cálculo da Regra de Três Inversa?",
        opcoes: [
          "Multiplicar em cruz: 6 · x = 9 · 12",
          "Multiplicar em linha reta (produtos constantes): 6 · 12 = 9 · x",
          "Somar operários e dias: 6 + 12 = 9 + x"
        ],
        respostaCorreta: 1,
        explicacao: "Perfeito! Na proporção INVERSA, o produto entre as grandezas é constante: Operários × Dias = constante. Logo, 6 × 12 = 9 × x.",
        formula: "6 \\times 12 = 9 \\times x \\implies 72 = 9x"
      },
      degrau3: {
        titulo: "Degrau 3: Executar o Cálculo e Concluir",
        pergunta: "Resolvendo a equação 9x = 72, qual é o valor final de x?",
        opcoes: [
          "8 dias",
          "18 dias",
          "6 dias",
          "10 dias"
        ],
        respostaCorreta: 0,
        resolucaoDetalhada: "9x = 72 -> x = 72 / 9 -> x = 8 dias. Observe o senso de realidade: 9 operários (mais gente) levaram 8 dias (menos que os 12 dias anteriores). Faz total sentido!"
      }
    }
  },
  {
    id: "prob-2",
    banca: "Cebraspe",
    concurso: "Técnico Administrativo",
    assunto: "Porcentagem e Aumento Sucessivo",
    enunciado: "Um produto que custava R$ 200 sofreu um aumento de 20% no mês de janeiro e, em fevereiro, um desconto de 20% sobre o novo valor. Qual é o preço final do produto?",
    degraus: {
      degrau1: {
        titulo: "Degrau 1: Desarmar a Pegadinha do Enunciado",
        pergunta: "Se aumentou 20% e depois baixou 20%, o preço volta a ser exatamente R$ 200?",
        opcoes: [
          "Sim, porque +20% anula perfeitamente o -20%.",
          "Não! Porque o desconto de 20% incide sobre um valor maior (após o aumento), resultando em um valor final menor que o original.",
          "O preço final será maior que R$ 200."
        ],
        respostaCorreta: 1,
        explicacao: "Muito bem! Essa é a pegadinha clássica número 1 de concursos. Aumentos e descontos sucessivos incidem sobre bases diferentes!",
        dica: "Aumentar 20% de 200 é ganhar R$ 40 (vai pra 240). Descontar 20% de 240 é tirar R$ 48!"
      },
      degrau2: {
        titulo: "Degrau 2: Fator de Multiplicação",
        pergunta: "Qual é o cálculo matemático correto usando Fatores Multiplicativos?",
        opcoes: [
          "Preço Final = 200 + 0,20 - 0,20",
          "Preço Final = 200 × (1 + 0,20) × (1 - 0,20) = 200 × 1,20 × 0,80",
          "Preço Final = 200 × (1,20 - 0,80)"
        ],
        respostaCorreta: 1,
        explicacao: "Exato! Aumento de 20% equivale a multiplicar por 1,20. Desconto de 20% equivale a multiplicar por 0,80. Multiplicador total: 1,20 × 0,80 = 0,96 (ou seja, 4% de perda global).",
        formula: "V_f = 200 \\times 1{,}20 \\times 0{,}80"
      },
      degrau3: {
        titulo: "Degrau 3: Finalizar o Cálculo",
        pergunta: "Quanto dá 200 × 1,20 × 0,80?",
        opcoes: [
          "R$ 200,00",
          "R$ 192,00",
          "R$ 180,00",
          "R$ 196,00"
        ],
        respostaCorreta: 1,
        resolucaoDetalhada: "Passo 1: 200 × 1,20 = 240 reais. Passo 2: 20% de 240 = 48 reais. Passo 3: 240 - 48 = 192 reais (ou 200 × 0,96 = 192). Resposta: R$ 192,00!"
      }
    }
  },
  {
    id: "prob-3",
    banca: "Vunesp",
    concurso: "Escrevente Técnico",
    assunto: "Equação do 1º Grau / Problema de Idades",
    enunciado: "A soma das idades de Carlos e seu filho Pedro é de 50 anos. Sabendo que Carlos tem o triplo da idade de Pedro mais 2 anos, qual é a idade de Pedro?",
    degraus: {
      degrau1: {
        titulo: "Degrau 1: Escolher a Incógnita Chave",
        pergunta: "A quem devemos chamar de x para facilitar a escrita da equação?",
        opcoes: [
          "Chamar a idade de Pedro de x, pois a idade do pai depende diretamente dela.",
          "Chamar a soma de x.",
          "Chamar os 50 anos de x."
        ],
        respostaCorreta: 0,
        explicacao: "Perfeito. Quando uma grandeza é descrita em função da outra (o triplo da idade de Pedro...), defina a grandeza de referência como x.",
        dica: "Pedro = x. Se o pai tem o triplo mais 2 anos: Carlos = 3x + 2."
      },
      degrau2: {
        titulo: "Degrau 2: Montar a Equação da Soma",
        pergunta: "A soma das idades é 50. Como fica a equação?",
        opcoes: [
          "x + 3x + 2 = 50",
          "3x = 50 + 2",
          "x × 3x = 50"
        ],
        respostaCorreta: 0,
        explicacao: "Muito bem! Carlos (3x + 2) + Pedro (x) = 50 anos.",
        formula: "(3x + 2) + x = 50 \\implies 4x + 2 = 50"
      },
      degrau3: {
        titulo: "Degrau 3: Resolver a Equação do 1º Grau",
        pergunta: "Resolvendo 4x + 2 = 50, qual é a idade de Pedro?",
        opcoes: [
          "10 anos",
          "12 anos",
          "14 anos",
          "15 anos"
        ],
        respostaCorreta: 1,
        resolucaoDetalhada: "4x + 2 = 50 -> 4x = 50 - 2 -> 4x = 48 -> x = 48 / 4 -> x = 12 anos. Verificação: Pedro tem 12. Carlos tem 3(12) + 2 = 36 + 2 = 38 anos. Soma: 12 + 38 = 50 anos! Tudo bateu perfeitamente."
      }
    }
  },
  {
    id: "prob-4",
    banca: "FCC",
    concurso: "Técnico Judiciário",
    assunto: "Geometria Básica / Teorema de Pitágoras",
    enunciado: "Uma escada de 10 metros está apoiada em uma parede vertical. A base da escada dista 6 metros da parede. A que altura do solo a ponta superior da escada encosta na parede?",
    degraus: {
      degrau1: {
        titulo: "Degrau 1: Visualizar a Geometria do Problema",
        pergunta: "A escada apoiada na parede com o chão forma qual figura geométrica?",
        opcoes: [
          "Um triângulo equilátero.",
          "Um triângulo retângulo, onde a escada é a hipotenusa e a parede e o chão são os catetos.",
          "Um paralelogramo."
        ],
        respostaCorreta: 1,
        explicacao: "Excelente! Parede vertical e chão horizontal formam um ângulo reto de 90°. A escada inclinada é a hipotenusa (lado oposto ao ângulo reto).",
        dica: "A hipotenusa é sempre o maior lado: aqui mede 10m."
      },
      degrau2: {
        titulo: "Degrau 2: Aplicar o Teorema de Pitágoras",
        pergunta: "Qual é a fórmula de Pitágoras para esse triângulo?",
        opcoes: [
          "10² = h² + 6²",
          "h² = 10² + 6²",
          "10 = h + 6"
        ],
        respostaCorreta: 0,
        explicacao: "Hipotenusa ao quadrado é igual à soma dos quadrados dos catetos: a² = b² + c² -> 10² = h² + 6².",
        formula: "10^2 = h^2 + 6^2 \\implies 100 = h^2 + 36"
      },
      degrau3: {
        titulo: "Degrau 3: Isolar a Altura e Extrair a Raiz",
        pergunta: "Qual é a altura h?",
        opcoes: [
          "8 metros",
          "4 metros",
          "7 metros",
          "64 metros"
        ],
        respostaCorreta: 0,
        resolucaoDetalhada: "h² = 100 - 36 -> h² = 64 -> h = √64 = 8 metros. Dica de mestre: Este é o clássico triângulo pitagórico 3-4-5 duplicado (6-8-10)!"
      }
    }
  }
];
