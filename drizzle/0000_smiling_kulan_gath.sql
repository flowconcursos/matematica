CREATE TYPE "public"."area" AS ENUM('aritmetica', 'algebra', 'geometria', 'raciocinio_logico', 'estatistica', 'financeira', 'conjuntos');--> statement-breakpoint
CREATE TYPE "public"."causa_erro" AS ENUM('conceito', 'conta', 'leitura', 'tempo', 'distrator');--> statement-breakpoint
CREATE TYPE "public"."confianca" AS ENUM('certo', 'duvida', 'chute');--> statement-breakpoint
CREATE TYPE "public"."modo_tentativa" AS ENUM('treino', 'revisao', 'simulado');--> statement-breakpoint
CREATE TYPE "public"."nivel_questao" AS ENUM('facil', 'medio', 'dificil');--> statement-breakpoint
CREATE TYPE "public"."origem_questao" AS ENUM('manual', 'pdf', 'gerada_ia');--> statement-breakpoint
CREATE TYPE "public"."tipo_questao" AS ENUM('multipla', 'certo_errado', 'discursiva', 'calculo');--> statement-breakpoint
CREATE TABLE "questao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origem" "origem_questao" NOT NULL,
	"enunciado" text NOT NULL,
	"alternativas" jsonb,
	"gabarito" text NOT NULL,
	"tipo" "tipo_questao" NOT NULL,
	"banca" text,
	"ano" integer,
	"orgao" text,
	"cargo" text,
	"nivel" "nivel_questao" NOT NULL,
	"arquivo_origem" text,
	"revisado_por_humano" boolean DEFAULT false NOT NULL,
	"gerado_por_modelo" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"arquivado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "questao_topico" (
	"questao_id" uuid NOT NULL,
	"topico_id" uuid NOT NULL,
	CONSTRAINT "questao_topico_questao_id_topico_id_pk" PRIMARY KEY("questao_id","topico_id")
);
--> statement-breakpoint
CREATE TABLE "tentativa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questao_id" uuid NOT NULL,
	"data" timestamp with time zone DEFAULT now() NOT NULL,
	"segundos" integer NOT NULL,
	"meta_segundos_na_epoca" integer NOT NULL,
	"confianca_declarada" "confianca" NOT NULL,
	"resposta_dada" text NOT NULL,
	"acertou" boolean NOT NULL,
	"causa_erro" "causa_erro",
	"alternativa_escolhida" text,
	"motivo_distrator" text,
	"anotacao" text,
	"modo" "modo_tentativa" DEFAULT 'treino' NOT NULL,
	CONSTRAINT "causa_erro_obrigatoria_em_erro" CHECK ("tentativa"."acertou" = true or "tentativa"."causa_erro" is not null)
);
--> statement-breakpoint
CREATE TABLE "topico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"area" "area" NOT NULL,
	"nivel_base" integer NOT NULL,
	"descricao_curta" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"arquivado_em" timestamp with time zone,
	CONSTRAINT "nivel_base_range" CHECK ("topico"."nivel_base" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "questao_topico" ADD CONSTRAINT "questao_topico_questao_id_questao_id_fk" FOREIGN KEY ("questao_id") REFERENCES "public"."questao"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questao_topico" ADD CONSTRAINT "questao_topico_topico_id_topico_id_fk" FOREIGN KEY ("topico_id") REFERENCES "public"."topico"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tentativa" ADD CONSTRAINT "tentativa_questao_id_questao_id_fk" FOREIGN KEY ("questao_id") REFERENCES "public"."questao"("id") ON DELETE no action ON UPDATE no action;