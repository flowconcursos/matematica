import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { metaSegundos } from "../lib/meta-tempo";
import { registrarResultadoRevisao } from "@/lib/revisao-db";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

type Area = (typeof schema.areaEnum.enumValues)[number];
type Nivel = (typeof schema.nivelQuestaoEnum.enumValues)[number];

const TOPICOS: { nome: string; area: Area; nivelBase: number; descricaoCurta: string }[] = [
  { nome: "Operações com números naturais e frações", area: "aritmetica", nivelBase: 1, descricaoCurta: "Base indispensável de aritmética." },
  { nome: "Porcentagem e proporcionalidade", area: "aritmetica", nivelBase: 2, descricaoCurta: "Razão, proporção e porcentagem aplicada." },
  { nome: "Equações e inequações do 1º grau", area: "algebra", nivelBase: 2, descricaoCurta: "Resolução de equações simples." },
  { nome: "Sistemas de equações", area: "algebra", nivelBase: 3, descricaoCurta: "Sistemas lineares 2x2." },
  { nome: "Áreas e perímetros de figuras planas", area: "geometria", nivelBase: 2, descricaoCurta: "Cálculo de área e perímetro." },
  { nome: "Ângulos e triângulos", area: "geometria", nivelBase: 2, descricaoCurta: "Relações angulares básicas." },
  { nome: "Sequências lógicas", area: "raciocinio_logico", nivelBase: 1, descricaoCurta: "Padrões numéricos e figurais." },
  { nome: "Lógica proposicional", area: "raciocinio_logico", nivelBase: 3, descricaoCurta: "Conectivos, tabela-verdade, negação." },
  { nome: "Medidas de tendência central", area: "estatistica", nivelBase: 2, descricaoCurta: "Média, mediana e moda." },
  { nome: "Probabilidade básica", area: "estatistica", nivelBase: 3, descricaoCurta: "Espaço amostral e eventos." },
  { nome: "Juros simples", area: "financeira", nivelBase: 2, descricaoCurta: "Cálculo de juros simples." },
  { nome: "Juros compostos", area: "financeira", nivelBase: 3, descricaoCurta: "Cálculo de juros compostos." },
  { nome: "Operações entre conjuntos", area: "conjuntos", nivelBase: 1, descricaoCurta: "União, interseção, diferença." },
  { nome: "Problemas com diagrama de Venn", area: "conjuntos", nivelBase: 2, descricaoCurta: "Contagem com 2 e 3 conjuntos." },
];

type QuestaoSeed = {
  topicoNome: string;
  enunciado: string;
  alternativas?: string[];
  gabarito: string;
  tipo: (typeof schema.tipoQuestaoEnum.enumValues)[number];
  nivel: Nivel;
};

const QUESTOES: QuestaoSeed[] = [
  { topicoNome: "Operações com números naturais e frações", enunciado: "Quanto é 3/4 + 1/2?", alternativas: ["5/4", "1", "5/6", "3/2"], gabarito: "5/4", tipo: "multipla", nivel: "facil" },
  { topicoNome: "Operações com números naturais e frações", enunciado: "Qual o resultado de 7 - 2 x 3?", alternativas: ["15", "1", "-6", "9"], gabarito: "1", tipo: "multipla", nivel: "facil" },
  { topicoNome: "Porcentagem e proporcionalidade", enunciado: "Um produto de R$ 200 tem desconto de 15%. Qual o novo preço?", alternativas: ["R$ 170", "R$ 180", "R$ 185", "R$ 190"], gabarito: "R$ 170", tipo: "multipla", nivel: "medio" },
  { topicoNome: "Porcentagem e proporcionalidade", enunciado: "Se 5 operários fazem um serviço em 12 dias, em quantos dias 10 operários fariam o mesmo serviço?", alternativas: ["6", "24", "5", "10"], gabarito: "6", tipo: "multipla", nivel: "medio" },
  { topicoNome: "Equações e inequações do 1º grau", enunciado: "Resolva: 2x + 5 = 17. Informe o valor de x.", gabarito: "6", tipo: "calculo", nivel: "facil" },
  { topicoNome: "Equações e inequações do 1º grau", enunciado: "Certo ou errado: a inequação 3x - 1 > 5 tem como solução x > 2.", alternativas: ["Certo", "Errado"], gabarito: "Certo", tipo: "certo_errado", nivel: "medio" },
  { topicoNome: "Sistemas de equações", enunciado: "Resolva o sistema: x + y = 10, x - y = 2. Informe o valor de x.", gabarito: "6", tipo: "calculo", nivel: "medio" },
  { topicoNome: "Sistemas de equações", enunciado: "Resolva o sistema: 2x + y = 8, x + y = 5. Informe o valor de y.", gabarito: "2", tipo: "calculo", nivel: "dificil" },
  { topicoNome: "Áreas e perímetros de figuras planas", enunciado: "Qual a área de um retângulo de lados 4cm e 7cm?", alternativas: ["28 cm²", "22 cm²", "11 cm²", "14 cm²"], gabarito: "28 cm²", tipo: "multipla", nivel: "facil" },
  { topicoNome: "Áreas e perímetros de figuras planas", enunciado: "Qual o perímetro de um quadrado de lado 9cm?", gabarito: "36", tipo: "calculo", nivel: "facil" },
  { topicoNome: "Ângulos e triângulos", enunciado: "Certo ou errado: a soma dos ângulos internos de um triângulo é sempre 180°.", alternativas: ["Certo", "Errado"], gabarito: "Certo", tipo: "certo_errado", nivel: "facil" },
  { topicoNome: "Ângulos e triângulos", enunciado: "Um triângulo tem ângulos de 50° e 60°. Qual o terceiro ângulo?", gabarito: "70", tipo: "calculo", nivel: "medio" },
  { topicoNome: "Sequências lógicas", enunciado: "Qual o próximo número da sequência: 2, 4, 8, 16, ...?", alternativas: ["24", "32", "20", "18"], gabarito: "32", tipo: "multipla", nivel: "facil" },
  { topicoNome: "Sequências lógicas", enunciado: "Qual o próximo termo: 1, 1, 2, 3, 5, 8, ...?", alternativas: ["11", "13", "12", "10"], gabarito: "13", tipo: "multipla", nivel: "medio" },
  { topicoNome: "Lógica proposicional", enunciado: "A negação de 'Todo dia chove' é:", alternativas: ["Nenhum dia chove", "Algum dia não chove", "Todo dia não chove", "Nenhuma das anteriores"], gabarito: "Algum dia não chove", tipo: "multipla", nivel: "dificil" },
  { topicoNome: "Lógica proposicional", enunciado: "Certo ou errado: em 'p e q', se p é falso, a proposição composta é falsa independente de q.", alternativas: ["Certo", "Errado"], gabarito: "Certo", tipo: "certo_errado", nivel: "medio" },
  { topicoNome: "Medidas de tendência central", enunciado: "Qual a média de 4, 8, 6, 10 e 2?", gabarito: "6", tipo: "calculo", nivel: "facil" },
  { topicoNome: "Medidas de tendência central", enunciado: "Qual a mediana do conjunto {2, 9, 4, 7, 5}?", gabarito: "5", tipo: "calculo", nivel: "medio" },
  { topicoNome: "Probabilidade básica", enunciado: "Qual a probabilidade de sair um número par em um dado de 6 faces?", alternativas: ["1/6", "1/3", "1/2", "2/3"], gabarito: "1/2", tipo: "multipla", nivel: "medio" },
  { topicoNome: "Probabilidade básica", enunciado: "Em um baralho de 52 cartas, qual a chance de tirar um ás?", alternativas: ["1/52", "1/13", "1/4", "4/13"], gabarito: "1/13", tipo: "multipla", nivel: "dificil" },
  { topicoNome: "Juros simples", enunciado: "Um capital de R$ 1000 rende juros simples de 2% ao mês. Quanto de juros em 3 meses?", gabarito: "60", tipo: "calculo", nivel: "medio" },
  { topicoNome: "Juros simples", enunciado: "Certo ou errado: em juros simples, o juro de cada período incide sempre sobre o capital inicial.", alternativas: ["Certo", "Errado"], gabarito: "Certo", tipo: "certo_errado", nivel: "facil" },
  { topicoNome: "Juros compostos", enunciado: "Um capital de R$ 1000 a 10% ao mês por 2 meses em juros compostos gera montante de quanto?", alternativas: ["R$ 1200", "R$ 1210", "R$ 1220", "R$ 1100"], gabarito: "R$ 1210", tipo: "multipla", nivel: "dificil" },
  { topicoNome: "Operações entre conjuntos", enunciado: "Se A = {1,2,3} e B = {2,3,4}, qual é A ∩ B?", alternativas: ["{1,2,3,4}", "{2,3}", "{1}", "{4}"], gabarito: "{2,3}", tipo: "multipla", nivel: "facil" },
  { topicoNome: "Operações entre conjuntos", enunciado: "Se A = {1,2,3} e B = {2,3,4}, qual é A - B?", alternativas: ["{1}", "{4}", "{2,3}", "{}"], gabarito: "{1}", tipo: "multipla", nivel: "medio" },
  { topicoNome: "Problemas com diagrama de Venn", enunciado: "De 50 pessoas, 30 gostam de A, 20 de B e 10 de ambos. Quantas não gostam de nenhum?", gabarito: "10", tipo: "calculo", nivel: "dificil" },
];

const CONFIANCAS = ["certo", "duvida", "chute"] as const;
const CAUSAS = ["conceito", "conta", "leitura", "tempo", "distrator"] as const;

// PRNG determinístico simples (mulberry32) para o seed ser reprodutível.
function criarRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const rng = criarRng(42);

  console.log("Limpando dados de seed anteriores...");
  await db.delete(schema.revisao);
  await db.delete(schema.tentativa);
  await db.delete(schema.questaoTopico);
  await db.delete(schema.questao);
  await db.delete(schema.topico);

  console.log("Inserindo tópicos...");
  const topicosCriados = await db.insert(schema.topico).values(TOPICOS).returning();
  const idPorNomeTopico = new Map(topicosCriados.map((t) => [t.nome, t]));

  console.log("Inserindo questões...");
  const questoesCriadas: (typeof schema.questao.$inferSelect & { area: Area })[] = [];
  for (const q of QUESTOES) {
    const topico = idPorNomeTopico.get(q.topicoNome);
    if (!topico) throw new Error(`Tópico não encontrado: ${q.topicoNome}`);

    const [criada] = await db
      .insert(schema.questao)
      .values({
        origem: "manual",
        enunciado: q.enunciado,
        alternativas: q.alternativas,
        gabarito: q.gabarito,
        tipo: q.tipo,
        nivel: q.nivel,
        revisadoPorHumano: true,
      })
      .returning();

    await db.insert(schema.questaoTopico).values({
      questaoId: criada.id,
      topicoId: topico.id,
    });

    questoesCriadas.push({ ...criada, area: topico.area });
  }

  console.log("Inserindo tentativas de teste...");
  const ALVO_TENTATIVAS = 60;
  const tentativasParaInserir: (typeof schema.tentativa.$inferInsert)[] = [];

  let diasAtras = 30;
  for (let i = 0; i < ALVO_TENTATIVAS; i++) {
    const questao = questoesCriadas[i % questoesCriadas.length];
    const meta = metaSegundos(questao.area, questao.nivel);

    const confianca = CONFIANCAS[Math.floor(rng() * CONFIANCAS.length)];
    // Viés proposital: confiança "certo" acerta mais, "chute" acerta menos,
    // para o painel de calibração (Fase 2) ter o que mostrar.
    const chanceAcerto =
      confianca === "certo" ? 0.85 : confianca === "duvida" ? 0.55 : 0.3;
    const acertou = rng() < chanceAcerto;

    const dentroDaMeta = rng() < 0.6;
    const segundos = dentroDaMeta
      ? Math.max(5, Math.round(meta * (0.5 + rng() * 0.45)))
      : Math.round(meta * (1.05 + rng() * 0.9));

    const causaErro = acertou
      ? undefined
      : CAUSAS[Math.floor(rng() * CAUSAS.length)];

    const respostaDada = acertou
      ? questao.gabarito
      : questao.alternativas?.find((a) => a !== questao.gabarito) ??
        `${questao.gabarito}-errado`;

    diasAtras -= rng() * 1.2;

    tentativasParaInserir.push({
      questaoId: questao.id,
      data: new Date(Date.now() - Math.max(0, diasAtras) * 24 * 60 * 60 * 1000),
      segundos,
      metaSegundosNaEpoca: meta,
      confiancaDeclarada: confianca,
      respostaDada,
      acertou,
      causaErro,
      alternativaEscolhida: respostaDada,
      modo: "treino",
    });
  }

  await db.insert(schema.tentativa).values(tentativasParaInserir);

  console.log("Reconstruindo histórico de revisão espaçada...");
  // tentativasParaInserir já está em ordem cronológica ascendente (diasAtras
  // decresce a cada iteração do loop acima), o que é necessário para a
  // progressão de etapas fazer sentido.
  for (const t of tentativasParaInserir) {
    await registrarResultadoRevisao(db, t.questaoId, t.acertou, t.data as Date);
  }

  console.log(
    `Seed concluído: ${topicosCriados.length} tópicos, ${questoesCriadas.length} questões, ${tentativasParaInserir.length} tentativas.`,
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
