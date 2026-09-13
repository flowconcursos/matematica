CREATE TABLE "prerequisito" (
	"topico_id" uuid NOT NULL,
	"depende_de_topico_id" uuid NOT NULL,
	CONSTRAINT "prerequisito_topico_id_depende_de_topico_id_pk" PRIMARY KEY("topico_id","depende_de_topico_id"),
	CONSTRAINT "prerequisito_nao_autorreferente" CHECK ("prerequisito"."topico_id" != "prerequisito"."depende_de_topico_id")
);
--> statement-breakpoint
ALTER TABLE "prerequisito" ADD CONSTRAINT "prerequisito_topico_id_topico_id_fk" FOREIGN KEY ("topico_id") REFERENCES "public"."topico"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prerequisito" ADD CONSTRAINT "prerequisito_depende_de_topico_id_topico_id_fk" FOREIGN KEY ("depende_de_topico_id") REFERENCES "public"."topico"("id") ON DELETE cascade ON UPDATE no action;