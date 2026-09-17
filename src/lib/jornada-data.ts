export interface ExercicioFixacao {
  id: string;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: string;
  explicacao: string;
}

export interface ModuloJornada {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  tempoEstimado: string;
  conceitoChave: string;
  intuicao: string;
  mecanismo: string[];
  exemplosResolvidos: {
    problema: string;
    passoAPasso: string;
    conclusao: string;
  }[];
  exerciciosFixacao: ExercicioFixacao[];
}

export const MODULOS_JORNADA: ModuloJornada[] = [
  {
    id: "modulo-0",
    numero: 0,
    titulo: "Fundamentos sem Trauma",
    subtitulo: "Regra de sinais, frações visuais e números decimais",
    tempoEstimado: "15 min",
    conceitoChave: "Matemática básica não é dom, é apenas vocabulário correto.",
    intuicao: "Pense nos números positivos como dinheiro que você tem no bolso e nos negativos como dívidas. Se você tem R$ 10 (+10) e deve R$ 15 (-15), você não tem R$ 25 nem R$ 5, você está devendo R$ 5 (-5). A fração nada mais é do que fatias de uma pizza: o número de baixo (denominador) diz em quantas fatias a pizza foi cortada, e o de cima (numerador) diz quantas você comeu.",
    mecanismo: [
      "Soma e Subtração: Sinais iguais = soma e conserva o sinal (+3 + 5 = +8, -3 - 5 = -8). Sinais diferentes = subtrai o menor do maior e dá o sinal do maior (+10 - 4 = +6, -10 + 4 = -6).",
      "Multiplicação e Divisão: Sinais iguais sempre dão POSITIVO (+ com + = +, - com - = +). Sinais diferentes sempre dão NEGATIVO (+ com - = -).",
      "Fração Borboleta: Para somar 1/2 + 1/3, multiplique em cruz (1x3 = 3, 2x1 = 2 -> 3+2=5) e multiplique os denominadores (2x3 = 6) -> 5/6.",
      "Vírgula na Adição: Vírgula sempre debaixo de vírgula (ex: 2,5 + 0,35 = 2,50 + 0,35 = 2,85).",
    ],
    exemplosResolvidos: [
      {
        problema: "Quanto é -7 - (-12)?",
        passoAPasso: "O menos antes do parênteses inverte o sinal de dentro: -(-12) vira +12. Então temos: -7 + 12. Tenho 12 e devo 7, fico com +5.",
        conclusao: "+5",
      },
      {
        problema: "Quanto é 3/4 de 80?",
        passoAPasso: "A palavra 'de' em matemática significa multiplicação. 3/4 × 80 = (3 × 80) / 4 = 240 / 4 = 60.",
        conclusao: "60",
      },
    ],
    exerciciosFixacao: [
      {
        id: "m0-q1",
        pergunta: "Qual o resultado da expressão: -15 + 8?",
        opcoes: ["-7", "+7", "-23", "+23"],
        respostaCorreta: "-7",
        explicacao: "Sinais diferentes: subtraia 15 - 8 = 7 e mantenha o sinal do maior (-15), logo o resultado é -7.",
      },
      {
        id: "m0-q2",
        pergunta: "Quanto é 2/5 + 1/3?",
        opcoes: ["11/15", "3/8", "3/15", "7/15"],
        respostaCorreta: "11/15",
        explicacao: "Regra da borboleta: (2×3 + 5×1) / (5×3) = (6 + 5) / 15 = 11/15.",
      },
    ],
  },
  {
    id: "modulo-1",
    numero: 1,
    titulo: "O Tradutor Algébrico",
    subtitulo: "Desmistificando o 'X' e montando equações a partir do texto",
    tempoEstimado: "20 min",
    conceitoChave: "A letra 'X' não é um monstro: é apenas uma caixa preta com um número escondido dentro.",
    intuicao: "Imagine uma balança de dois pratos em equilíbrio perfeito. Se você tirar 5 quilos de um lado, é obrigado a tirar 5 quilos do outro lado para a balança não tombar. É exatamente isso que fazemos ao resolver uma equação: o sinal de igual (=) é o fiel da balança. Quando passamos um número para o outro lado invertendo a operação (+ vira -, × vira ÷), estamos apenas mantendo a balança equilibrada.",
    mecanismo: [
      "Letras de um lado, números do outro: Agrupe tudo que tem 'x' à esquerda e números puros à direita.",
      "Inversão de Operação: Quem está somando passa subtraindo; quem está multiplicando passa dividindo (sem trocar o sinal!). Ex: 3x = 12 -> x = 12 / 3 = 4.",
      "Traduzindo o Português: 'O dobro de um número mais 6 é 20' -> 2x + 6 = 20.",
      "Sistemas de 2 equações: Isole uma letra simples ou multiplique uma linha por -1 para somar e cancelar.",
    ],
    exemplosResolvidos: [
      {
        problema: "Resolva: 4x - 5 = 15.",
        passoAPasso: "O -5 passa somando: 4x = 15 + 5 -> 4x = 20. O 4 que multiplica passa dividindo: x = 20 / 4 = 5.",
        conclusao: "x = 5",
      },
      {
        problema: "A soma de dois números é 30 e a diferença entre eles é 10. Quais são os números?",
        passoAPasso: "Equações: x + y = 30 e x - y = 10. Somando as duas linhas: 2x = 40 -> x = 20. Se x = 20, então 20 + y = 30 -> y = 10.",
        conclusao: "20 e 10",
      },
    ],
    exerciciosFixacao: [
      {
        id: "m1-q1",
        pergunta: "Qual o valor de x na equação 3x + 9 = 24?",
        opcoes: ["5", "6", "11", "3"],
        respostaCorreta: "5",
        explicacao: "3x = 24 - 9 -> 3x = 15 -> x = 15 / 3 = 5.",
      },
      {
        id: "m1-q2",
        pergunta: "'O triplo da idade de Carlos menos 4 anos é igual a 26'. Qual a idade de Carlos?",
        opcoes: ["10 anos", "8 anos", "12 anos", "7 anos"],
        respostaCorreta: "10 anos",
        explicacao: "Equação: 3x - 4 = 26 -> 3x = 30 -> x = 10 anos.",
      },
    ],
  },
  {
    id: "modulo-2",
    numero: 2,
    titulo: "O Coração dos Concursos",
    subtitulo: "Razão, proporção, regra de três simples e porcentagem direta",
    tempoEstimado: "25 min",
    conceitoChave: "Mais de 60% das questões de nível médio usam apenas proporção.",
    intuicao: "Se uma receita de bolo para 4 pessoas leva 2 xícaras de farinha, para 8 pessoas (o dobro) levará 4 xícaras (o dobro). Isso é proporção direta. Agora, se 2 pedreiros constroem um muro em 6 dias, 4 pedreiros (o dobro de força) vão demorar 3 dias (a metade do tempo!). Isso é proporção inversa. Entender quem ajuda e quem divide o trabalho é o segredo de toda regra de três.",
    mecanismo: [
      "Razão entre A e B: É sempre a divisão A / B na ordem em que o texto falou.",
      "Regra de Três Direta: Grandezas que crescem juntas (mais peças custam mais dinheiro). Multiplique em cruz (X).",
      "Regra de Três Inversa: Uma cresce e a outra diminui (mais velocidade gasta menos tempo, mais operários gastam menos dias). Multiplique em linha reta (=).",
      "Porcentagem Direta com Fator: Aumento de 25% = multiplicar por 1,25. Desconto de 30% = multiplicar por 0,70.",
    ],
    exemplosResolvidos: [
      {
        problema: "Se um carro gasta 8 litros para rodar 100 km, quantos litros gastará para rodar 250 km?",
        passoAPasso: "Mais km gastam mais litros (direta): 8 / 100 = x / 250 -> 100x = 2000 -> x = 20 litros.",
        conclusao: "20 litros",
      },
      {
        problema: "Um celular de R$ 1.200 teve desconto de 15% à vista. Quanto custou?",
        passoAPasso: "Desconto de 15% significa pagar 85% (1,00 - 0,15 = 0,85). Conta direta: 1200 × 0,85 = 1020.",
        conclusao: "R$ 1.020,00",
      },
    ],
    exerciciosFixacao: [
      {
        id: "m2-q1",
        pergunta: "Se 3 operários levam 12 horas para fazer um serviço, em quantas horas 6 operários fariam o mesmo serviço?",
        opcoes: ["6 horas", "24 horas", "9 horas", "4 horas"],
        respostaCorreta: "6 horas",
        explicacao: "Grandeza inversa: o dobro de operários faz na metade do tempo. 12 / 2 = 6 horas.",
      },
      {
        id: "m2-q2",
        pergunta: "Um produto que custava R$ 50 teve um aumento de 20%. Qual o novo valor?",
        opcoes: ["R$ 60", "R$ 70", "R$ 55", "R$ 65"],
        respostaCorreta: "R$ 60",
        explicacao: "Multiplique por 1,20: 50 × 1,20 = R$ 60.",
      },
    ],
  },
  {
    id: "modulo-3",
    numero: 3,
    titulo: "O Dinheiro do Concurso",
    subtitulo: "Matemática financeira essencial: Juros Simples e Juros Compostos",
    tempoEstimado: "20 min",
    conceitoChave: "Juros Simples é aluguel fixo; Juros Compostos é bola de neve.",
    intuicao: "No juros simples, o rendimento é fixo todo mês sobre o dinheiro original (como se todo mês o banco te pagasse R$ 20 de juros, faça chuva ou faça sol). No juros compostos, o juro que rendeu no 1º mês passa a render juro no 2º mês (juros sobre juros). Para prazos pequenos de concurso (2 ou 3 meses), juros compostos podem ser calculados simplesmente mês a mês multiplicando pelo fator!",
    mecanismo: [
      "Fórmula do Juros Simples: J = C · i · t (Capital × Taxa decimal × Tempo).",
      "Montante: M = C + J (O que você colocou + o que rendeu).",
      "Regra Sagrada da Unidade: Taxa ao mês exige tempo em meses; taxa ao ano exige tempo em anos!",
      "Juros Compostos: M = C(1 + i)^t. Para 2 meses com taxa i: aplique o fator duas vezes sucessivas.",
    ],
    exemplosResolvidos: [
      {
        problema: "Calcule os juros simples de R$ 5.000 a 2% ao mês durante 6 meses.",
        passoAPasso: "J = 5000 × 0,02 × 6 = 100 × 6 = 600.",
        conclusao: "R$ 600,00",
      },
      {
        problema: "Aplicação de R$ 2.000 a juros compostos de 10% a.m. por 2 meses. Qual o montante final?",
        passoAPasso: "1º mês: 2000 × 1,10 = 2200. 2º mês: 2200 × 1,10 = 2420.",
        conclusao: "R$ 2.420,00",
      },
    ],
    exerciciosFixacao: [
      {
        id: "m3-q1",
        pergunta: "Um empréstimo de R$ 1.000 foi feito a juros simples de 3% a.m. por 4 meses. Quanto de JUROS foi pago?",
        opcoes: ["R$ 120", "R$ 1.120", "R$ 150", "R$ 90"],
        respostaCorreta: "R$ 120",
        explicacao: "J = 1000 × 0,03 × 4 = 30 × 4 = R$ 120.",
      },
      {
        id: "m3-q2",
        pergunta: "Em juros compostos, R$ 100 a 10% a.m. durante 2 meses rende quanto de juros?",
        opcoes: ["R$ 21", "R$ 20", "R$ 121", "R$ 10"],
        respostaCorreta: "R$ 21",
        explicacao: "Montante final: 100 × 1,10 × 1,10 = 121. Como o capital era 100, os juros são 121 - 100 = R$ 21.",
      },
    ],
  },
  {
    id: "modulo-4",
    numero: 4,
    titulo: "O Espaço e as Formas",
    subtitulo: "Geometria plana intuitiva: perímetros, áreas e o triângulo 3-4-5",
    tempoEstimado: "20 min",
    conceitoChave: "Perímetro é cerca; Área é piso.",
    intuicao: "Nunca confunda perímetro com área. Se você comprar arame para cercar um terreno, você está medindo o PERÍMETRO (soma dos lados em metros). Se você for colocar grama ou piso no chão, você está medindo a ÁREA (em metros quadrados m²). E no triângulo retângulo, 90% das bancas de concurso usam o triângulo sagrado de lados 3, 4 e hipotenusa 5 (ou o dobro: 6, 8 e 10).",
    mecanismo: [
      "Perímetro: Some todos os lados em volta da figura.",
      "Área do Retângulo: Base × Altura.",
      "Área do Triângulo: (Base × Altura) / 2 (porque é exatamente a metade de um retângulo!).",
      "Teorema de Pitágoras: Hipotenusa² = Cateto² + Cateto². Guarde o terno (3, 4, 5).",
    ],
    exemplosResolvidos: [
      {
        problema: "Um terreno retangular tem 12m de largura e 20m de comprimento. Qual o perímetro e a área?",
        passoAPasso: "Perímetro (cerca): 12 + 12 + 20 + 20 = 64 metros. Área (piso): 12 × 20 = 240 m².",
        conclusao: "Perímetro: 64m | Área: 240 m²",
      },
      {
        problema: "Um triângulo retângulo tem catetos de 6 cm e 8 cm. Quanto mede o maior lado (hipotenusa)?",
        passoAPasso: "Note que 6 = 3 × 2 e 8 = 4 × 2. Pelo terno 3-4-5, a hipotenusa é 5 × 2 = 10 cm.",
        conclusao: "10 cm",
      },
    ],
    exerciciosFixacao: [
      {
        id: "m4-q1",
        pergunta: "Qual a área de um triângulo que tem base de 10 cm e altura de 6 cm?",
        opcoes: ["30 cm²", "60 cm²", "16 cm²", "25 cm²"],
        respostaCorreta: "30 cm²",
        explicacao: "Área do triângulo = (base × altura) / 2 = (10 × 6) / 2 = 60 / 2 = 30 cm².",
      },
      {
        id: "m4-q2",
        pergunta: "Qual o perímetro de uma sala quadrada de lado 7 metros?",
        opcoes: ["28 metros", "49 m²", "14 metros", "21 metros"],
        respostaCorreta: "28 metros",
        explicacao: "Perímetro é a soma dos 4 lados: 7 + 7 + 7 + 7 = 28 metros.",
      },
    ],
  },
  {
    id: "modulo-5",
    numero: 5,
    titulo: "Lógica Imbatível",
    subtitulo: "Proposições, negações clássicas e equivalências da condicional",
    tempoEstimado: "20 min",
    conceitoChave: "Raciocínio lógico não é opinião; é álgebra de Verdadeiro e Falso.",
    intuicao: "No dia a dia, a gente usa a palavra 'ou' de forma confusa. Na lógica de concurso, ela é matemática pura: 'P ou Q' só é falso se as duas coisas forem falsas. Já a promessa 'Se você passar, eu te dou um carro' só é uma mentira (falsa) se você REALMENTE passar e eu NÃO te der o carro (Vera Fischer é Falsa). Se você não passar, a promessa não foi quebrada!",
    mecanismo: [
      "Conectivo E (^): Só é VERDADE se tudo for verdade. Se tiver um F, já é falso.",
      "Conectivo OU (v): Só é FALSO se tudo for falso. Se tiver um V, já é verdade.",
      "Condicional (Se... Então ->): Só é FALSA no caso V -> F (Vera Fischer é Falsa).",
      "Negação do Se... Então (Regra do MANÉ): MAntém a primeira E NEga a segunda. (~(P -> Q) = P ^ ~Q).",
      "Equivalência (Contrapositiva): Inverte e nega tudo (Se estudo, passo <=> Se não passo, não estudei).",
    ],
    exemplosResolvidos: [
      {
        problema: "Qual a negação lógica da frase: 'Se chove, a rua fica molhada'?",
        passoAPasso: "Regra do MANÉ: Mantém a 1ª ('Chove') + conectivo 'E' + Nega a 2ª ('A rua não fica molhada').",
        conclusao: "Chove e a rua não fica molhada",
      },
    ],
    exerciciosFixacao: [
      {
        id: "m5-q1",
        pergunta: "A negação de 'Se eu trabalhar, recebo salário' é:",
        opcoes: [
          "Trabalho e não recebo salário",
          "Se não trabalho, não recebo salário",
          "Não trabalho ou recebo salário",
          "Se recebo salário, trabalhei",
        ],
        respostaCorreta: "Trabalho e não recebo salário",
        explicacao: "Regra do MANÉ: Mantém a primeira E Nega a segunda.",
      },
      {
        id: "m5-q2",
        pergunta: "A condicional 'Se P, então Q' é FALSA somente quando:",
        opcoes: [
          "P é verdadeira e Q é falsa",
          "P é falsa e Q é verdadeira",
          "P e Q são falsas",
          "P e Q são verdadeiras",
        ],
        respostaCorreta: "P é verdadeira e Q é falsa",
        explicacao: "O único caso de falsidade da condicional é V -> F (Vera Fischer).",
      },
    ],
  },
];
