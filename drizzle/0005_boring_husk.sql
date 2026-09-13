CREATE TYPE "public"."confiabilidade" AS ENUM('baixa', 'media', 'alta');--> statement-breakpoint
CREATE TABLE "dossie_banca" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"banca" text NOT NULL,
	"versao" integer DEFAULT 1 NOT NULL,
	"gerado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"baseado_em_n_questoes" integer NOT NULL,
	"conteudo" jsonb NOT NULL,
	"confiabilidade" "confiabilidade" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" timestamp with time zone DEFAULT now() NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fim" timestamp with time zone,
	"modo" "modo_tentativa" NOT NULL,
	"meta_segundos" integer NOT NULL,
	"observacao" text
);
--> statement-breakpoint
ALTER TABLE "tentativa" ADD COLUMN "sessao_id" uuid;--> statement-breakpoint
ALTER TABLE "tentativa" ADD CONSTRAINT "tentativa_sessao_id_sessao_id_fk" FOREIGN KEY ("sessao_id") REFERENCES "public"."sessao"("id") ON DELETE no action ON UPDATE no action;