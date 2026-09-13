CREATE TABLE "liberacao_manual" (
	"topico_id" uuid PRIMARY KEY NOT NULL,
	"liberada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"acertos_no_teste" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "liberacao_manual" ADD CONSTRAINT "liberacao_manual_topico_id_topico_id_fk" FOREIGN KEY ("topico_id") REFERENCES "public"."topico"("id") ON DELETE cascade ON UPDATE no action;