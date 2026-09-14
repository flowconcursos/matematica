import { NextResponse } from "next/server";
import { exigirSessao } from "@/lib/api";
import { listarHeuristicas } from "@/lib/heuristica-db";

export async function GET() {
  const naoAutenticado = await exigirSessao();
  if (naoAutenticado) return naoAutenticado;

  return NextResponse.json(await listarHeuristicas());
}
