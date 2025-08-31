import {
  index,
  pgTable,
  serial,
  text,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";

export type NewChessInfo = typeof chessInfo.$inferInsert;

export const chessInfo = pgTable(
  "chess_info",
  {
    id: serial("id").primaryKey(),
    userName: text("user_name").notNull(),
    gameState: text("game_state").notNull(),
    from: text("from").notNull(),
    to: text("to").notNull(),
    color: text("color").notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
    uniqueIndex("userName_idx").on(table.userName),
  ]
);
