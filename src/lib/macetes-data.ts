export interface MaceteLeitura {
  id: string;
  titulo: string;
  icone: string;
  resumo: string;
  comoAplicar: string[];
  exemploPratico: {
    enunciado: string;
    aplicacao: string;
  };
}

export interface TermoTrapaceiro {
  id: string;
  expressao: string;
  oQueParece: string;
  oQueRealmenteSignifica: string;
  exemplo: string;
  dicaMestre: string;
}

export interface DesafioInterpretacao {
  id: string;
  banca: string;
  enunciado: string;
  perguntaInterpretativa: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacaoDidatica: string;
}

export const MACETES_LEITURA: MaceteLeitura[] = [
  {
    id: "leitura-reversa",
    titulo: "A Técnica da Leitura Reversa",
    icone: "🎯",
    resumo: "Leia a ÚLTIMA frase (o comando) antes de ler todo o texto longo da questão.",
    comoAplicar: [
      "Vá direto ao ponto de interrogação ou à última frase: descubra o que a banca quer (ex: 'quantos sobraram?', 'qual é a média?', 'qual a razão entre homens e mulheres?').",
      "Agora que seu cérebro sabe o que procurar, leia a história do início já filtrando apenas os números relevantes.",
      "Economiza até 40% do tempo de prova e impede que você resolva a conta certa para a pergunta errada."
    ],
    exemploPratico: {
      enunciado: "Uma fábrica tem 120 funcionários. No primeiro mês 20% foram demitidos, no segundo mês foram contratados 10 funcionários. Ao final do terceiro mês, um terço dos funcionários pediu demissão. Quantos funcionários foram DEMITIDOS no total?",
      aplicacao: "Se você lê sem foco, calcula o número final de funcionários (quem sobrou). Lendo o comando primeiro, você percebe que a pergunta quer apenas a SOMA DOS DEMITIDOS!"
    }
  },
  {
    id: "sublinhado-3-cores",
    titulo: "O Método do Sublinhado Cirúrgico",
    icone: "🖍️",
    resumo: "Separe visualmente: o que eu quero, o que eu tenho e as armadilhas limitantes.",
    comoAplicar: [
      "Sublinhado Duplo: O QUE EU QUERO ACHAR (a incógnita ou comando final).",
      "Círculo: DADOS NUMÉRICOS E SUAS UNIDADES (ex: '3 horas', '180 km/h').",
      "Caixa / Alerta: PALAVRAS LIMITANTES (ex: 'exceto', 'respectivamente', 'apenas', 'números inteiros', 'não')."
    ],
    exemploPratico: {
      enunciado: "Em um concurso, o candidato deve acertar NO MÍNIMO 60% das questões de matemática e NÃO PODE zerar nenhuma disciplina.",
      aplicacao: "Colocar 'NO MÍNIMO' e 'NÃO PODE ZERAR' em caixas de alerta evita o erro de considerar 59% como aprovado ou esquecer da trava de zerar."
    }
  },
  {
    id: "eliminacao-absurdos",
    titulo: "Eliminação Prévia por Senso de Realidade",
    icone: "✂️",
    resumo: "Antes de armar qualquer conta, risque alternativas matemáticas ou fisicamente impossíveis.",
    comoAplicar: [
      "Se mais pessoas estão trabalhando, o tempo TEM QUE SER MENOR que o original. Risque qualquer alternativa maior.",
      "Se um produto teve 20% de aumento e 20% de desconto, o valor final NUNCA pode ser igual ao inicial. Risque a alternativa que repete o valor.",
      "Em geometria, a hipotenusa é sempre maior que qualquer cateto. Qualquer valor menor é impossível."
    ],
    exemploPratico: {
      enunciado: "Um pintor leva 8 horas para pintar um muro. Com a ajuda de outro pintor de mesmo ritmo, em quantas horas farão o serviço? A) 16h B) 10h C) 8h D) 4h",
      aplicacao: "Duas pessoas trabalhando juntas demoram menos que 8h. As opções A, B e C são absurdos óbvios! Resta apenas a D sem nem fazer cálculo."
    }
  },
  {
    id: "teste-letra-c",
    titulo: "Estratégia do Ponto Médio nas Alternativas",
    icone: "⚖️",
    resumo: "Quando a questão pede um número e as alternativas estão em ordem crescente, teste a alternativa C.",
    comoAplicar: [
      "Se as opções forem A) 10, B) 20, C) 30, D) 40, E) 50, teste o número 30 na história do problema.",
      "Se o resultado deu muito baixo, você já elimina A, B e C de uma vez só! Só sobram D e E.",
      "Se deu muito alto, só sobram A e B. Você resolve o problema testando no máximo 2 opções."
    ],
    exemploPratico: {
      enunciado: "O triplo de um número somado a 5 é igual a 65. Alternativas: A) 10 B) 15 C) 20 D) 25",
      aplicacao: "Teste C (20): 3 × 20 + 5 = 65. Bateu exato de primeira! Se desse 80, saberíamos que a resposta só poderia ser menor (A ou B)."
    }
  }
];

export const TERMOS_TRAPACEIROS: TermoTrapaceiro[] = [
  {
    id: "tt-1",
    expressao: "Respectivamente",
    oQueParece: "Apenas uma palavra formal para enfeitar o texto.",
    oQueRealmenteSignifica: "A ORDEM IMPORTA RIGOROSAMENTE! O primeiro valor citado refere-se ao primeiro sujeito, o segundo ao segundo.",
    exemplo: "As idades de João e Maria são, respectivamente, 25 e 30 anos. (João tem 25, Maria tem 30. Se inverter nas opções, você erra a questão!).",
    dicaMestre: "Bancas adoram colocar na alternativa A a ordem invertida para pegar quem resolveu certo mas marcou apressado."
  },
  {
    id: "tt-2",
    expressao: "Aumentou EM X% vs Aumentou PARA X%",
    oQueParece: "Parecem a mesma coisa.",
    oQueRealmenteSignifica: "'Aumentou EM 20%' significa Somar 20% (vai para 120%). 'Aumentou PARA 120%' significa que o novo valor é 120%.",
    exemplo: "A inflação aumentou em 2% (era 5%, foi para 7%). A inflação aumentou para 2% (era 1%, agora é 2%).",
    dicaMestre: "A preposição 'EM' indica acréscimo relativo; 'PARA' indica o destino final."
  },
  {
    id: "tt-3",
    expressao: "Ao menos um / Pelo menos um",
    oQueParece: "Significa 'apenas um'.",
    oQueRealmenteSignifica: "Significa 1, 2, 3... ou TODOS! A única coisa que NÃO pode acontecer é ZERO (nenhum).",
    exemplo: "Pelo menos um dos três documentos deve ser apresentado.",
    dicaMestre: "Em probabilidade e raciocínio lógico, calcular 'pelo menos um' é sempre mais fácil pelo complementar: 1 - P(nenhum)."
  },
  {
    id: "tt-4",
    expressao: "Do restante / Do que sobrou",
    oQueParece: "Calcular a porcentagem ou fração sobre o total original.",
    oQueRealmenteSignifica: "A base de cálculo mudou! Deve-se subtrair o gasto anterior antes de aplicar a nova taxa.",
    exemplo: "Gastei 40% do meu salário e, DO RESTANTE, gastei metade.",
    dicaMestre: "Se tinha 100 e gastou 40%, sobraram 60. A metade de 60 é 30 (e não 50!). Cuidado máximo com essa frase."
  },
  {
    id: "tt-5",
    expressao: "Não necessariamente",
    oQueParece: "Que é falso ou impossível.",
    oQueRealmenteSignifica: "Pode ser verdade em alguns casos, mas não é uma garantia matemática universal.",
    exemplo: "Se dois números são pares, sua média é necessariamente inteira. (Falso: 2 e 4 média 3 - inteira; 2 e 6 média 4 - inteira; mas 2 e 8...) É sempre inteira!",
    dicaMestre: "Se você achar um único contraexemplo, a afirmação 'necessariamente' já cai por terra."
  },
  {
    id: "tt-6",
    expressao: "Diferença entre dois valores",
    oQueParece: "Apenas diminuir.",
    oQueRealmenteSignifica: "Sempre em módulo (valor positivo): Maior menos o Menor, a menos que o texto especifique a ordem.",
    exemplo: "A diferença entre o salário de Ana e Beto.",
    dicaMestre: "Diferença em matemática nunca dá tempo negativo nem distância negativa."
  }
];

export const DESAFIOS_INTERPRETACAO: DesafioInterpretacao[] = [
  {
    id: "des-1",
    banca: "Vunesp",
    enunciado: "Em uma gaveta há 10 meias pretas e 10 meias brancas. No escuro, quantas meias no mínimo uma pessoa deve retirar da gaveta para ter a certeza absoluta de que retirou pelo menos um par da mesma cor?",
    perguntaInterpretativa: "Qual é o raciocínio interpretativo correto para 'certeza absoluta' no pior caso?",
    opcoes: [
      "Calcular a probabilidade de 50% de cada cor e multiplicar por 10.",
      "Pensar no PIOR CENÁRIO POSSÍVEL (Princípio das Gavetas / Casa dos Pombos): retirar uma de cada cor primeiro.",
      "Dividir 20 meias por 2 pares.",
      "Retirar 11 meias para garantir a maioria."
    ],
    respostaCorreta: 1,
    explicacaoDidatica: "Excelente! 'Certeza absoluta' em concursos exige pensar na maior maré de azar possível: se tiro 1 preta e depois 1 branca (duas meias, nenhuma combinou), a 3ª meia OBRIGATORIAMENTE será preta ou branca, formando o par! Resposta: 3 meias."
  },
  {
    id: "des-2",
    banca: "FGV",
    enunciado: "Um comerciante comprou um lote de mercadorias. Ele vendeu um terço do lote com 10% de lucro, e o restante com 20% de lucro sobre o custo. No final, qual foi o lucro percentual total sobre o custo do lote?",
    perguntaInterpretativa: "Como interpretar a expressão 'o restante' e a melhor estratégia de tradução?",
    opcoes: [
      "O restante é 2/3 do lote. A melhor tática é adotar um valor fictício inteligente (ex: lote = R$ 300) em vez de carregar incógnitas x.",
      "O restante é 1/3 do lote e basta somar 10% + 20% = 30%.",
      "Calcular a média aritmética simples entre 10% e 20%, resultando em 15%."
    ],
    respostaCorreta: 0,
    explicacaoDidatica: "Perfeito! Quando o concurso não informa o valor monetário nem a quantidade do lote, adotar R$ 300 simplifica absurdamente: 1/3 = R$ 100 (lucro de R$ 10) e 2/3 = R$ 200 (lucro de R$ 40). Lucro total: R$ 50 sobre 300 = 16,66%."
  },
  {
    id: "des-3",
    banca: "Cebraspe",
    enunciado: "Considere a proposição: 'Se o servidor público cumpre suas metas e não falta ao expediente, então ele recebe gratificação de produtividade'.",
    perguntaInterpretativa: "O que o comando pede ao solicitar a NEGAÇÃO lógica de uma condicional 'Se P então Q'?",
    opcoes: [
      "Basta trocar o 'Se' por 'Não' e negar todas as palavras.",
      "A regra do 'MANÉ': Mantém a primeira parte e Nega a segunda parte (P e não Q).",
      "Transformar em 'Se ele recebe gratificação, então cumpre metas'."
    ],
    respostaCorreta: 1,
    explicacaoDidatica: "Corretíssimo! A única forma de uma promessa 'Se P então Q' ser mentirosa é a condição acontecer (o servidor cumpre as metas e não falta) E, mesmo assim, ele NÃO receber a gratificação."
  }
];
