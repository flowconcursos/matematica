CREATE TYPE "public"."heuristica_status" AS ENUM('ativa', 'superada', 'arquivada');--> statement-breakpoint
CREATE TABLE "diagnostico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gerado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"periodo_analisado" text NOT NULL,
	"hipotese_principal" text NOT NULL,
	"evidencias" jsonb NOT NULL,
	"prescricao" text NOT NULL,
	"modelo" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "heuristica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"texto" text NOT NULL,
	"topico_id" uuid NOT NULL,
	"origem" text NOT NULL,
	"tentativas_evidencia" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"acertos_consecutivos_desde" integer DEFAULT 0 NOT NULL,
	"status" "heuristica_status" DEFAULT 'ativa' NOT NULL,
	"fixada_pelo_usuario" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "heuristica" ADD CONSTRAINT "heuristica_topico_id_topico_id_fk" FOREIGN KEY ("topico_id") REFERENCES "public"."topico"("id") ON DELETE cascade ON UPDATE no action;