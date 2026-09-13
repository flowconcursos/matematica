import { and, isNull, lte } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tentativa, topico, questaoTopico, revisao } from "@/db/schema";
import { verificarSessao } from "@/lib/session";
import {
  taxaAcertoFirme,
  tempoMedioSegundos,
  calibracaoPorConfianca,
  constanciaDiaria,
  causasPorSemana,
  tempoMedioPorTopico,
  contarTopicosFirmes,
  CAUSAS,
  type TentativaPainel,
} from "@/lib/painel";

function formatarSegundos(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = Math.round(segundos % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const ROTULO_CONFIANCA: Record<string, string> = {
  certo: "Certeza",
  duvida: "Dúvida",
  chute: "Chute",
};

const ROTULO_CAUSA: Record<string, string> = {
  conceito: "Conceito",
  conta: "Conta",
  leitura: "Leitura",
  tempo: "Tempo",
  distrator: "Distrator",
};

export default async function PainelPage() {
  const sessao = await verificarSessao();
  if (!sessao) redirect("/login");

  const agora = new Date();

  const [todasTentativas, todosTopicos, associacoes, revisoesVencidas] =
    await Promise.all([
      db
        .select({
          questaoId: tentativa.questaoId,
          data: tentativa.data,
          segundos: tentativa.segundos,
          metaSegundosNaEpoca: tentativa.metaSegundosNaEpoca,
          confiancaDeclarada: tentativa.confiancaDeclarada,
          acertou: tentativa.acertou,
          causaErro: tentativa.causaErro,
        })
        .from(tentativa),
      db.select({ id: topico.id, nome: topico.nome }).from(topico),
      db
        .select({ questaoId: questaoTopico.questaoId, topicoId: questaoTopico.topicoId })
        .from(questaoTopico),
      db
        .select({ id: revisao.id })
        .from(revisao)
        .where(and(isNull(revisao.concluidaEm), lte(revisao.proximaData, agora))),
    ]);

  const tentativas: TentativaPainel[] = todasTentativas;

  const questaoParaTopicos = new Map<string, string[]>();
  for (const { questaoId, topicoId } of associacoes) {
    const lista = questaoParaTopicos.get(questaoId) ?? [];
    lista.push(topicoId);
    questaoParaTopicos.set(questaoId, lista);
  }

  const revisoesVencidasHoje = revisoesVencidas.length;

  const acertoFirmeRate = taxaAcertoFirme(tentativas);
  const tempoMedio = tempoMedioSegundos(tentativas);
  const calibracao = calibracaoPorConfianca(tentativas);
  const diario = constanciaDiaria(tentativas, 30);
  const semanas = causasPorSemana(tentativas, 8);
  const tempoPorTopico = tempoMedioPorTopico(tentativas, questaoParaTopicos, todosTopicos);
  const dominio = contarTopicosFirmes(
    tentativas,
    questaoParaTopicos,
    todosTopicos.map((t) => t.id),
  );

  const maxDiario = Math.max(1, ...diario.map((d) => d.quantidade));
  const maxSemanaCausa: Record<string, number> = Object.fromEntries(
    CAUSAS.map((c) => [c, Math.max(1, ...semanas.map((s) => s.porCausa[c]))]),
  );
  const maxTempoTopico = Math.max(1, ...tempoPorTopico.map((t) => t.mediaSegundos ?? 0));

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Painel</h1>
        <Link href="/" className="text-sm text-soft underline">
          Voltar
        </Link>
      </header>

      {tentativas.length === 0 ? (
        <p className="text-soft">
          Nenhuma tentativa registrada ainda. O painel aparece depois que você
          começar a treinar.
        </p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Estatistica
              rotulo="Acerto firme"
              valor={`${Math.round(acertoFirmeRate * 100)}%`}
            />
            <Estatistica rotulo="Tempo médio" valor={formatarSegundos(tempoMedio)} />
            <Estatistica
              rotulo="Revisões vencidas"
              valor={String(revisoesVencidasHoje)}
            />
            <Estatistica
              rotulo="Tópicos firmes"
              valor={
                dominio.avaliados
                  ? `${dominio.firmes}/${dominio.avaliados}`
                  : "sem dados"
              }
            />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">
              Calibração — acerto real por confiança declarada
            </h2>
            <div className="flex flex-col gap-2">
              {calibracao.map((c) => (
                <div key={c.nivel} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm text-ink">
                    {ROTULO_CONFIANCA[c.nivel]}
                  </span>
                  <div className="h-4 flex-1 rounded bg-line/60">
                    <div
                      className="h-4 rounded bg-ink"
                      style={{ width: `${(c.taxaAcerto ?? 0) * 100}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs text-soft">
                    {c.n === 0
                      ? "sem dados"
                      : `${Math.round((c.taxaAcerto ?? 0) * 100)}% de ${c.n}`}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">
              Causas de erro nas últimas {semanas.length} semanas
            </h2>
            <div className="flex flex-col gap-3">
              {CAUSAS.map((causa) => (
                <div key={causa} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-ink">
                    {ROTULO_CAUSA[causa]}
                  </span>
                  <div className="flex flex-1 items-end gap-1">
                    {semanas.map((s) => (
                      <div
                        key={s.semanaLabel}
                        title={`${s.porCausa[causa]} em ${s.semanaLabel}`}
                        className="flex-1 rounded-sm bg-red/70"
                        style={{
                          height: `${Math.max(
                            2,
                            (s.porCausa[causa] / maxSemanaCausa[causa]) * 28,
                          )}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">
              Constância diária (últimos 30 dias)
            </h2>
            <div className="flex gap-1">
              {diario.map((d) => (
                <div
                  key={d.dia}
                  title={`${d.dia}: ${d.quantidade} tentativa(s)`}
                  className="h-6 flex-1 rounded-sm"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--ink) ${
                      d.quantidade === 0 ? 8 : 20 + (d.quantidade / maxDiario) * 80
                    }%, var(--paper))`,
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">
              Tempo médio por tópico
            </h2>
            <div className="flex flex-col gap-2">
              {tempoPorTopico.map((t) => (
                <div key={t.topicoId} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-ink">
                    {t.nome}
                  </span>
                  <div className="h-4 flex-1 rounded bg-line/60">
                    <div
                      className="h-4 rounded bg-soft"
                      style={{
                        width: `${((t.mediaSegundos ?? 0) / maxTempoTopico) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs text-soft">
                    {formatarSegundos(t.mediaSegundos ?? 0)}
                  </span>
                </div>
              ))}
              {tempoPorTopico.length === 0 && (
                <p className="text-sm text-soft">Sem tentativas suficientes ainda.</p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Estatistica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded border border-line bg-white/60 p-3">
      <div className="font-mono text-2xl tabular-nums text-ink">{valor}</div>
      <div className="text-xs text-soft">{rotulo}</div>
    </div>
  );
}
