import { NextResponse } from "next/server";
import { count, desc, gt } from "drizzle-orm";
import { db } from "@/db";
import { diagnostico, tentativa } from "@/db/schema";
import { exigirSessao } from "@/lib/api";
import { elegivelParaDiagnostico } from "@/lib/diagnostico";

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  const historico = await db.select().from(diagnostico).orderBy(desc(diagnostico.geradoEm));
  const ultimo = historico[0] ?? null;

  const [{ total }] = ultimo
    ? await db
        .select({ total: count() })
        .from(tentativa)
        .where(gt(tentativa.data, ultimo.geradoEm))
    : await db.select({ total: count() }).from(tentativa);

  const agora = new Date();

  return NextResponse.json({
    historico,
    tentativasDesdeUltimo: total,
    elegivel: elegivelParaDiagnostico(ultimo?.geradoEm ?? null, agora, total),
  });
}
