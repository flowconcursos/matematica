CREATE TYPE "public"."nivel_explicacao" AS ENUM('curta', 'passo_a_passo', 'por_que_erro_parecia_certo');--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" timestamp with time zone DEFAULT now() NOT NULL,
	"tarefa" text NOT NULL,
	"modelo" text NOT NULL,
	"tokens_entrada" integer NOT NULL,
	"tokens_saida" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explicacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questao_id" uuid NOT NULL,
	"nivel" "nivel_explicacao" NOT NULL,
	"texto" text NOT NULL,
	"gerado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"modelo" text NOT NULL,
	"util" boolean
);
--> statement-breakpoint
ALTER TABLE "explicacao" ADD CONSTRAINT "explicacao_questao_id_questao_id_fk" FOREIGN KEY ("questao_id") REFERENCES "public"."questao"("id") ON DELETE no action ON UPDATE no action;