export interface FormulaItem {
  id: string;
  titulo: string;
  area: "aritmetica" | "proporcionalidade" | "financeira" | "algebra" | "geometria" | "logica";
  categoriaLabel: string;
  formula: string;
  descricao: string;
  quandoUsar: string;
  macete: string;
  exemplo: {
    problema: string;
    resolucao: string;
    resposta: string;
  };
  pegadinhaComum: string;
}

export const FORMULAS_DATA: FormulaItem[] = [
  // 1. ARITMÉTICA
  {
    id: "fracoes-soma-subtracao",
    titulo: "Soma e Subtração de Frações (Regra da Borboleta)",
    area: "aritmetica",
    categoriaLabel: "Aritmética & Frações",
    formula: "\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{a \\cdot d \\pm b \\cdot c}{b \\cdot d}",
    descricao: "Operação rápida de soma ou subtração de duas frações sem precisar tirar MMC.",
    quandoUsar: "Quando tiver que somar ou subtrair duas frações com denominadores diferentes rapidamente.",
    macete: "Multiplique cruzado (em 'X') os numeradores pelos denominadores opostos e multiplique os denominadores entre si.",
    exemplo: {
      problema: "Calcule $\\frac{3}{4} + \\frac{2}{5}$",
      resolucao: "Cruzado: $3 \\times 5 = 15$ e $4 \\times 2 = 8$. Embaixo: $4 \\times 5 = 20$. Logo, $\\frac{15 + 8}{20} = \\frac{23}{20}$.",
      resposta: "\\frac{23}{20}",
    },
    pegadinhaComum: "Nunca some os denominadores diretamente (ex: 3/4 + 2/5 NÃO é 5/9!).",
  },
  {
    id: "fracoes-divisao",
    titulo: "Divisão de Frações",
    area: "aritmetica",
    categoriaLabel: "Aritmética & Frações",
    formula: "\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{a \\cdot d}{b \\cdot c}",
    descricao: "Divisão de uma fração por outra transformando em produto.",
    quandoUsar: "Em problemas que dividem uma quantidade fracionária por partes fracionárias menores.",
    macete: "Conserva a primeira fração e multiplica pelo inverso da segunda.",
    exemplo: {
      problema: "Quantos copos de $\\frac{1}{4}$ de litro cabem em uma garrafa de $\\frac{3}{2}$ de litro?",
      resolucao: "$\\frac{3}{2} \\div \\frac{1}{4} = \\frac{3}{2} \\times \\frac{4}{1} = \\frac{12}{2} = 6$.",
      resposta: "6 copos",
    },
    pegadinhaComum: "Inverter a primeira fração em vez da segunda. Apenas a segunda fração deve ser invertida.",
  },
  {
    id: "mmc-vs-mdc",
    titulo: "MMC vs. MDC (Como Diferenciar no Enunciado)",
    area: "aritmetica",
    categoriaLabel: "Aritmética & Frações",
    formula: "MMC(a, b) \\times MDC(a, b) = a \\times b",
    descricao: "Regra para identificar instantaneamente se a questão pede MMC ou MDC.",
    quandoUsar: "Questões de encontros periódicos, escalas de plantão ou divisão de lotes em partes iguais.",
    macete: "Ideia de 'quando vão se encontrar de novo', 'simultaneamente' ou 'coincidir' = MMC. Ideia de 'dividir em partes iguais', 'maior tamanho possível' ou 'máximo de grupos' = MDC.",
    exemplo: {
      problema: "Dois remédios são tomados de 6 em 6 horas e de 8 em 8 horas. Se tomados juntos agora, daqui a quantas horas coincidirão novamente?",
      resolucao: "Ideia de encontro futuro: calcula-se o $MMC(6, 8) = 24$.",
      resposta: "24 horas",
    },
    pegadinhaComum: "Fazer MDC em questões de encontros periódicos. Se a resposta precisar ser maior que os números dados, é MMC.",
  },

  // 2. PROPORCIONALIDADE & PORCENTAGEM
  {
    id: "porcentagem-fatores",
    titulo: "Fator Multiplicativo (Aumento e Desconto)",
    area: "proporcionalidade",
    categoriaLabel: "Porcentagem & Proporcionalidade",
    formula: "\\text{Aumento de } p\\%: (1 + \\frac{p}{100}) \\quad | \\quad \\text{Desconto de } p\\%: (1 - \\frac{p}{100})",
    descricao: "Cálculo direto do valor final com apenas uma multiplicação simples.",
    quandoUsar: "Para achar o valor final após aumento ou desconto sem ter que calcular a porcentagem separadamente para depois somar ou subtrair.",
    macete: "Aumento de 20% = multiplicar por $1{,}20$. Desconto de 15% = multiplicar por $0{,}85$ ($100 - 15 = 85$).",
    exemplo: {
      problema: "Um item de R$ 350 teve desconto de 20%. Qual o valor final?",
      resolucao: "Multiplique direto: $350 \\times 0{,}80 = 280$.",
      resposta: "R$ 280,00",
    },
    pegadinhaComum: "Achar que um aumento de 20% seguido de um desconto de 20% anula o efeito. O valor fica $1{,}20 \\times 0{,}80 = 0{,}96$ (ou seja, 4% de perda!).",
  },
  {
    id: "descontos-sucessivos",
    titulo: "Descontos e Aumentos Sucessivos",
    area: "proporcionalidade",
    categoriaLabel: "Porcentagem & Proporcionalidade",
    formula: "V_f = V_0 \\times (1 \\pm i_1) \\times (1 \\pm i_2)",
    descricao: "Efeito acumulado de alterações percentuais em série.",
    quandoUsar: "Quando um preço sobe e depois cai, ou sofre dois aumentos consecutivos.",
    macete: "NUNCA some as porcentagens! Multiplique os fatores multiplicativos. Use o valor fictício de R$ 100 se o enunciado não der o valor inicial.",
    exemplo: {
      problema: "Dois aumentos sucessivos de 10% e 20% equivalem a um aumento único de quanto?",
      resolucao: "Fator: $1{,}10 \\times 1{,}20 = 1{,}32$. Um fator de 1,32 corresponde a 32% de aumento (e não 30%!).",
      resposta: "32%",
    },
    pegadinhaComum: "Somar 10% + 20% = 30%. A banca sempre coloca 30% na alternativa A para pegar quem não estuda por macete.",
  },
  {
    id: "regra-tres-composta-processo-produto",
    titulo: "Regra de Três Composta (Método Processo x Produto)",
    area: "proporcionalidade",
    categoriaLabel: "Porcentagem & Proporcionalidade",
    formula: "\\frac{\\text{Quem} \\times \\text{Tempo}}{\\text{O que foi feito}} = \\text{Constante}",
    descricao: "O método definitivo para nunca mais errar setas para cima ou para baixo em regra de três composta.",
    quandoUsar: "Questões envolvendo operários, horas por dia, dias trabalhados e peças produzidas ou metros construídos.",
    macete: "Separe em duas partes: PROCESSO (quem faz e quanto tempo trabalha: operários, horas, dias, máquinas) e PRODUTO (o objetivo final: peças, buracos, relatórios, quilômetros). Multiplique tudo do Processo e cruze no Produto!",
    exemplo: {
      problema: "4 operários trabalhando 6 horas/dia produzem 120 peças. Quantas peças 6 operários trabalhando 8 horas/dia produzirão?",
      resolucao: "Processo 1: $4 \\times 6 = 24$. Produto 1: 120. Processo 2: $6 \\times 8 = 48$. Produto 2: $x$. Fórmula: $\\frac{24}{120} = \\frac{48}{x} \\Rightarrow x = \\frac{48 \\times 120}{24} = 240$.",
      resposta: "240 peças",
    },
    pegadinhaComum: "Confundir o que é produto. 'Dias' ou 'horas' NUNCA são produto; o produto é o resultado final da ação.",
  },

  // 3. MATEMÁTICA FINANCEIRA
  {
    id: "juros-simples",
    titulo: "Juros Simples (J = C . i . t)",
    area: "financeira",
    categoriaLabel: "Matemática Financeira",
    formula: "J = C \\cdot i \\cdot t \\quad \\text{e} \\quad M = C + J = C(1 + i \\cdot t)",
    descricao: "Rendimento linear calculado sempre sobre o capital inicial.",
    quandoUsar: "Empréstimos ou aplicações simples em que o enunciado expressar 'a juros simples'.",
    macete: "A taxa $i$ e o tempo $t$ DEVEM estar na mesma unidade de tempo (se a taxa é mensal, o tempo precisa estar em meses; se anual, em anos).",
    exemplo: {
      problema: "Qual o rendimento de um capital de R$ 2.000 aplicado a 1,5% ao mês durante 8 meses?",
      resolucao: "$J = 2000 \\times 0{,}015 \\times 8 = 2000 \\times 0{,}12 = 240$.",
      resposta: "R$ 240,00",
    },
    pegadinhaComum: "Esquecer de converter a taxa percentual para decimal (ex: usar 1,5 em vez de 0,015) ou misturar taxa ao mês com tempo em anos.",
  },
  {
    id: "juros-compostos",
    titulo: "Juros Compostos (Juros sobre Juros)",
    area: "financeira",
    categoriaLabel: "Matemática Financeira",
    formula: "M = C \\cdot (1 + i)^t \\quad \\text{e} \\quad J = M - C",
    descricao: "Cálculo exponencial em que os juros de cada período rendem juros nos períodos seguintes.",
    quandoUsar: "Sempre que a questão citar 'capitalização mensal/composta' ou concursos bancários (Caixa, Banco do Brasil).",
    macete: "Para prazos curtos de 2 períodos (como 2 anos ou 2 meses): $M = C(1 + 2i + i^2)$. Ou calcule período a período aplicando o fator multiplicativo.",
    exemplo: {
      problema: "Um capital de R$ 1.000 aplicado a 10% a.m. por 2 meses resulta em qual montante?",
      resolucao: "1º mês: $1000 \\times 1{,}10 = 1100$. 2º mês: $1100 \\times 1{,}10 = 1210$.",
      resposta: "R$ 1.210,00",
    },
    pegadinhaComum: "A fórmula direta dá o MONTANTE ($M$), e não o juro ($J$). Se a questão pedir o juro, subtraia o capital: $J = M - C$.",
  },

  // 4. ÁLGEBRA & EQUAÇÕES
  {
    id: "sistemas-lineares-adicao",
    titulo: "Sistemas de 1º Grau (Método da Adição Rápida)",
    area: "algebra",
    categoriaLabel: "Álgebra & Equações",
    formula: "\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}",
    descricao: "Resolução de duas equações com duas incógnitas sem isolar fração.",
    quandoUsar: "Problemas clássicos de 'cabeças e pés', 'carros e motos', 'notas de 10 e notas de 50'.",
    macete: "Multiplique uma das equações por um número negativo para cancelar uma das letras quando somar as duas equações membro a membro.",
    exemplo: {
      problema: "Em um estacionamento há 20 veículos entre carros e motos, somando 64 rodas. Quantos carros há?",
      resolucao: "Equações: $c + m = 20$ e $4c + 2m = 64$. Multiplique a primeira por $-2$: $-2c - 2m = -40$. Some: $2c = 24 \\Rightarrow c = 12$.",
      resposta: "12 carros",
    },
    pegadinhaComum: "Esquecer de multiplicar o lado direito (o resultado) da equação ao multiplicar a linha inteira.",
  },
  {
    id: "equacao-2grau-soma-produto",
    titulo: "Equação do 2º Grau (Soma e Produto em 5 Segundos)",
    area: "algebra",
    categoriaLabel: "Álgebra & Equações",
    formula: "x^2 - S x + P = 0 \\quad \\text{onde} \\quad S = -\\frac{b}{a} \\quad \\text{e} \\quad P = \\frac{c}{a}",
    descricao: "Encontrar as raízes de uma equação quadrática mentalmente sem calcular Bháskara.",
    quandoUsar: "Sempre que $a = 1$. Economiza pelo menos 3 minutos de prova.",
    macete: "Pense em dois números que MULTIPLICADOS dão $c$ e SOMADOS dão o sinal oposto de $b$.",
    exemplo: {
      problema: "Encontre as raízes de $x^2 - 7x + 10 = 0$.",
      resolucao: "Multiplicados dão $10$ e somados dão $+7$. Os números são $2$ e $5$ ($2 \\times 5 = 10$ e $2 + 5 = 7$).",
      resposta: "x_1 = 2 \\quad \\text{e} \\quad x_2 = 5",
    },
    pegadinhaComum: "Esquecer de inverter o sinal de $b$ na soma (a soma é $-b/a$).",
  },

  // 5. GEOMETRIA PLANA
  {
    id: "teorema-pitagoras-ternos",
    titulo: "Teorema de Pitágoras & Ternos Sagrados (3-4-5)",
    area: "geometria",
    categoriaLabel: "Geometria Plana",
    formula: "a^2 + b^2 = c^2 \\quad \\text{Terno padrão: } (3, 4, 5)",
    descricao: "Relação métrica no triângulo retângulo e seus múltiplos mais frequentes em provas.",
    quandoUsar: "Cálculo de diagonais, alturas, distâncias perpendiculares e triângulos retângulos.",
    macete: "90% das questões usam múltiplos do terno 3-4-5: $(6, 8, 10)$, $(9, 12, 15)$, $(15, 20, 25)$ ou o terno $(5, 12, 13)$. Se dois lados forem múltiplos de 3 e 4, a hipotenusa é o mesmo múltiplo de 5!",
    exemplo: {
      problema: "Um triângulo retângulo tem catetos de 9 cm e 12 cm. Qual a hipotenusa?",
      resolucao: "Note que $9 = 3 \\times 3$ e $12 = 4 \\times 3$. Pelo terno 3-4-5, a hipotenusa é $5 \\times 3 = 15$ cm.",
      resposta: "15 cm",
    },
    pegadinhaComum: "Aplicar o terno 3-4-5 quando o 5 for um cateto e não a hipotenusa. O maior lado SEMPRE deve ser a hipotenusa.",
  },
  {
    id: "areas-figuras-planas",
    titulo: "Áreas das Principais Figuras Planas",
    area: "geometria",
    categoriaLabel: "Geometria Plana",
    formula: "A_{\\text{ret}} = b \\cdot h \\quad | \\quad A_{\\text{tri}} = \\frac{b \\cdot h}{2} \\quad | \\quad A_{\\text{trap}} = \\frac{(B + b) \\cdot h}{2} \\quad | \\quad A_{\\text{circ}} = \\pi r^2",
    descricao: "Fórmulas de área mais cobradas em concursos públicos.",
    quandoUsar: "Problemas de colocação de piso, pintura de paredes, plantio ou terrenos.",
    macete: "O trapézio é a 'média das bases vezes a altura'. O triângulo é sempre metade do retângulo correspondente.",
    exemplo: {
      problema: "Calcule a área de um trapézio com bases de 10 m e 6 m e altura de 4 m.",
      resolucao: "$A = \\frac{(10 + 6) \\times 4}{2} = \\frac{16 \\times 4}{2} = 32\\text{ m}^2$.",
      resposta: "32 m²",
    },
    pegadinhaComum: "Confundir área do círculo ($\\pi r^2$) com comprimento da circunferência ($2\\pi r$). Dica: Área tem unidade ao quadrado ($r^2$).",
  },

  // 6. RACIOCÍNIO LÓGICO & CONJUNTOS
  {
    id: "negacao-condicional-mane",
    titulo: "Negação do Se... Então (Regra do MANÉ)",
    area: "logica",
    categoriaLabel: "Raciocínio Lógico & Conjuntos",
    formula: "\\neg(P \\rightarrow Q) \\iff P \\land \\neg Q",
    descricao: "Como negar uma proposição condicional (Se P, então Q).",
    quandoUsar: "Questões que pedem explicitamente 'A negação da frase: Se chover, então não vou à praia'.",
    macete: "Regra do MANÉ: MAntém a primeira (P) E NEga a segunda (~Q). O 'se...então' NUNCA vira outro 'se...então' na negação!",
    exemplo: {
      problema: "Qual a negação de 'Se eu estudar, serei aprovado'?",
      resolucao: "Mantém a 1ª: 'Eu estudo'. Troca por 'E'. Nega a 2ª: 'Não sou aprovado'. Resultado: 'Eu estudo e não sou aprovado'.",
      resposta: "Eu estudo e não sou aprovado",
    },
    pegadinhaComum: "Achar que a negação de 'Se... então' continua sendo 'Se... então'. A negação vira um conectivo 'E' (conjunção).",
  },
  {
    id: "equivalencia-condicional-neuma",
    titulo: "Equivalências da Condicional (Contrapositiva & NEUMA)",
    area: "logica",
    categoriaLabel: "Raciocínio Lógico & Conjuntos",
    formula: "P \\rightarrow Q \\iff \\neg Q \\rightarrow \\neg P \\iff \\neg P \\lor Q",
    descricao: "Duas formas equivalentes de reescrever a condicional mantendo a mesma tabela-verdade.",
    quandoUsar: "Questões que pedem 'Uma afirmação logicamente equivalente a: Se trabalho, recebo salário'.",
    macete: "1) Contrapositiva: Inverte e nega as duas (Se não recebo salário, então não trabalho). 2) Regra do NEUMA: NEga a primeira OU MAntém a segunda (~P ou Q).",
    exemplo: {
      problema: "Qual a frase equivalente a 'Se bebo água, fico hidratado'?",
      resolucao: "Pela contrapositiva: 'Se não fico hidratado, então não bebi água'. Pelo NEUMA: 'Não bebo água ou fico hidratado'.",
      resposta: "Se não fico hidratado, não bebo água",
    },
    pegadinhaComum: "Apenas inverter sem negar (ex: Se Q, então P NÃO é equivalente!). É obrigatório inverter E negar.",
  },
  {
    id: "diagrama-venn-2conjuntos",
    titulo: "Conjuntos & Diagrama de Venn (União de 2 Conjuntos)",
    area: "logica",
    categoriaLabel: "Raciocínio Lógico & Conjuntos",
    formula: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
    descricao: "Total de elementos pertencentes a pelo menos um de dois conjuntos.",
    quandoUsar: "Pesquisas de preferência (leitores do jornal A e B, pessoas que consom produto X e Y).",
    macete: "Sempre comece preenchendo a INTERSEÇÃO (quem faz os dois). Depois subtraia esse valor dos grupos individuais para não contar duas vezes.",
    exemplo: {
      problema: "Em um grupo de 50 pessoas, 30 leem o jornal A, 25 leem o B e 10 leem ambos. Quantos não leem nenhum?",
      resolucao: "Ambos: 10. Apenas A: $30 - 10 = 20$. Apenas B: $25 - 10 = 15$. Total que lê: $20 + 10 + 15 = 45$. Não leem nenhum: $50 - 45 = 5$.",
      resposta: "5 pessoas",
    },
    pegadinhaComum: "Somar 30 + 25 = 55 e achar que ultrapassou o total porque esqueceu que os 10 de interseção foram somados duas vezes.",
  },
];