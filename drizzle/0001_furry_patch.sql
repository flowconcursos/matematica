CREATE TABLE "revisao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questao_id" uuid NOT NULL,
	"etapa" integer DEFAULT 0 NOT NULL,
	"proxima_data" timestamp with time zone,
	"historico" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"concluida_em" timestamp with time zone,
	CONSTRAINT "revisao_questao_unica" UNIQUE("questao_id"),
	CONSTRAINT "etapa_range" CHECK ("revisao"."etapa" between 0 and 3)
);
--> statement-breakpoint
ALTER TABLE "revisao" ADD CONSTRAINT "revisao_questao_id_questao_id_fk" FOREIGN KEY ("questao_id") REFERENCES "public"."questao"("id") ON DELETE no action ON UPDATE no action;