CREATE TABLE "chess_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_name" text NOT NULL,
	"game_state" text NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"color" text NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "chess_info" USING hnsw ("embedding" vector_cosine_ops);