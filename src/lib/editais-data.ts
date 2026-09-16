export interface MateriaEdital {
  materia: string;
  porcentagem: number;
  peso: "critico" | "alto" | "medio";
  dicaBanca: string;
}

export interface EditalConcurso {
  id: string;
  nomeConcurso: string;
  orgao: string;
  banca: string;
  anoReferencia: string;
  descricao: string;
  dicaEstrategica: string;
  materias: MateriaEdital[];
  pegadinhasClassicas: string[];
}

export const EDITAIS_CONCURSOS: EditalConcurso[] = [
  {
    id: "caixa-bb-cesgranrio",
    nomeConcurso: "Caixa Econômica Federal & Banco do Brasil",
    orgao: "Carreiras Bancárias",
    banca: "Fundação Cesgranrio",
    anoReferencia: "2024 - 2026",
    descricao: "O maior concurso bancário do país. Exige matemática financeira afiada, juros compostos, amortização básica e muita probabilidade aplicada a finanças.",
    dicaEstrategica: "A Cesgranrio quase nunca cobra contas difíceis de cabeça; ela cobra interpretação de taxas equivalentes e leitura atenta de enunciados longos. Domine o fator (1 + i)^t!",
    materias: [
      {
        materia: "Matemática Financeira (Juros Simples & Compostos)",
        porcentagem: 40,
        peso: "critico",
        dicaBanca: "Preste muita atenção se a taxa está ao mês (a.m.) e a aplicação em anos (a.a.). A Cesgranrio sempre coloca o distrator de quem esqueceu de converter.",
      },
      {
        materia: "Porcentagem & Proporcionalidade Comercial",
        porcentagem: 25,
        peso: "critico",
        dicaBanca: "Aumentos e descontos sucessivos em operações de crédito. Lembre-se: 10% + 10% NÃO é 20%.",
      },
      {
        materia: "Probabilidade & Análise Combinatória Básica",
        porcentagem: 20,
        peso: "alto",
        dicaBanca: "Sorteios de prêmios, clientes na agência e combinações simples de senhas.",
      },
      {
        materia: "Sequências Numéricas (PA & PG)",
        porcentagem: 15,
        peso: "medio",
        dicaBanca: "Crescimento de depósitos em poupança ao longo dos meses.",
      },
    ],
    pegadinhasClassicas: [
      "Taxa nominal vs taxa efetiva.",
      "Calcular o montante quando o enunciado pediu apenas os juros.",
      "Desconto comercial (por fora) vs desconto racional (por dentro).",
    ],
  },
  {
    id: "correios-ibfc",
    nomeConcurso: "Correios (Agente de Correios)",
    orgao: "Empresa Brasileira de Correios e Telégrafos",
    banca: "IBFC / IADES",
    anoReferencia: "2024 - 2026",
    descricao: "Concurso com foco na matemática do dia a dia logístico: cálculo de fretes, pesagem, volumes de caixas, escalas de entregas e regras de três.",
    dicaEstrategica: "A IBFC é direta e tradicional. Se você dominar frações, MMC/MDC e regra de três composta, garante mais de 80% da prova.",
    materias: [
      {
        materia: "Aritmética Básica, Frações & Decimais",
        porcentagem: 35,
        peso: "critico",
        dicaBanca: "Conversão de unidades (gramas para quilos, metros cúbicos para litros). Treine operações com números decimais sem calculadora.",
      },
      {
        materia: "Regra de Três Simples e Composta",
        porcentagem: 30,
        peso: "critico",
        dicaBanca: "Questões clássicas de carteiros distribuindo correspondências em determinados dias e horas.",
      },
      {
        materia: "Geometria Espacial Básica (Volumes de Caixas)",
        porcentagem: 20,
        peso: "alto",
        dicaBanca: "Volume de paralelepípedo (comprimento × largura × altura) e capacidade de caixas de encomendas.",
      },
      {
        materia: "Porcentagem e Descontos",
        porcentagem: 15,
        peso: "medio",
        dicaBanca: "Cálculo de acréscimo de frete por peso excedente.",
      },
    ],
    pegadinhasClassicas: [
      "Misturar grandezas diretamente e inversamente proporcionais na regra de três.",
      "Conversão de unidades de tempo (ex: 2,5 horas são 2 horas e 30 minutos, NÃO 2h50m).",
      "Esquecer de somar a embalagem no peso total da encomenda.",
    ],
  },
  {
    id: "tjsp-pm-vunesp",
    nomeConcurso: "TJ-SP (Escrevente) & Polícia Militar",
    orgao: "Tribunais e Segurança Pública",
    banca: "Fundação VUNESP",
    anoReferencia: "2024 - 2026",
    descricao: "A Vunesp tem um estilo muito característico: questões contextualizadas como historinhas do cotidiano que se traduzem em equações e geometria.",
    dicaEstrategica: "A Vunesp adora o triângulo retângulo (Pitágoras 3-4-5) e problemas que viram sistemas de duas equações (cabeças e pés, notas de dinheiro).",
    materias: [
      {
        materia: "Geometria Plana (Áreas, Perímetros & Pitágoras)",
        porcentagem: 30,
        peso: "critico",
        dicaBanca: "A Vunesp ama terrenos retangulares com um caminho ou calçada em volta, e problemas que usam o terno 3-4-5.",
      },
      {
        materia: "Equações e Sistemas do 1º Grau",
        porcentagem: 25,
        peso: "critico",
        dicaBanca: "Traduzir o texto em álgebra: 'o dobro da idade de João mais 5 anos'.",
      },
      {
        materia: "MMC e MDC Aplicados",
        porcentagem: 25,
        peso: "alto",
        dicaBanca: "Escala de plantões de policiais ou funcionários de fórum que se cruzam periodicamente.",
      },
      {
        materia: "Raciocínio Lógico Proposicional",
        porcentagem: 20,
        peso: "alto",
        dicaBanca: "Tabela-verdade, negações (regra do MANÉ) e equivalência da condicional.",
      },
    ],
    pegadinhasClassicas: [
      "A banca pede o perímetro, mas calcula-se a área (ou vice-versa).",
      "O terno 3-4-5 invertido com o 5 no cateto.",
      "Distratores com a resposta de apenas uma das incógnitas do sistema quando a questão pedia a soma ou diferença.",
    ],
  },
  {
    id: "inss-administrativos-cebraspe",
    nomeConcurso: "INSS & Carreiras Administrativas Federais",
    orgao: "Serviço Público Federal",
    banca: "Cebraspe (Cespe)",
    anoReferencia: "2024 - 2026",
    descricao: "O famoso modelo Certo ou Errado onde uma questão errada anula uma certa. Foco total em Raciocínio Lógico Matemático Puro.",
    dicaEstrategica: "No Cebraspe, o segredo é a segurança lógica: nunca chute sem certeza! As questões de tabela-verdade e argumentos válidos são 100% mecânicas com as regras certas.",
    materias: [
      {
        materia: "Lógica Proposicional & Tabela-Verdade",
        porcentagem: 40,
        peso: "critico",
        dicaBanca: "Valores lógicos de proposições compostas. Lembre-se: 'Se P, então Q' só é falsa se for V -> F (Vera Fischer).",
      },
      {
        materia: "Equivalências e Negações Lógicas",
        porcentagem: 30,
        peso: "critico",
        dicaBanca: "Contrapositiva (inverte e nega), regra do NEUMA e negação do condicional (MANÉ).",
      },
      {
        materia: "Diagramas Lógicos & Conjuntos",
        porcentagem: 20,
        peso: "alto",
        dicaBanca: "Negação dos quantificadores lógicos: Todo, Algum e Nenhum.",
      },
      {
        materia: "Princípio da Casa dos Pombos",
        porcentagem: 10,
        peso: "medio",
        dicaBanca: "Garantir o pior caso possível para ter certeza de um evento.",
      },
    ],
    pegadinhasClassicas: [
      "Achar que a negação de 'Todo mundo é honesto' é 'Ninguém é honesto'. A negação correta é 'Pelo menos um NÃO é honesto'.",
      "Confundir equivalência com negação.",
      "Afirmações com dupla negação sutil no enunciado.",
    ],
  },
];
