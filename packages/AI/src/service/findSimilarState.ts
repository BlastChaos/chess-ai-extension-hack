import { and, cosineDistance, desc, gt, sql, eq } from "drizzle-orm";
import { GameState } from "../types.js";
import { squareToChess } from "../utils/convert.js";
import { generateEmbedding } from "../utils/generateEmbedding.js";
import { chessInfo } from "../db/schema.js";
import { db } from "../db/index.js";

export const findSimilarState = async (gameState: GameState) => {
  if (!gameState.playAs) {
    return [];
  }

  const sortedPieces = gameState.pieces.sort((a, b) => {
    if (a.position.x !== b.position.x) {
      return a.position.x - b.position.x;
    }
    return b.position.y - a.position.y;
  });

  const positions: string[] = [];

  for (const piece of sortedPieces) {
    positions.push(
      `${squareToChess(piece.position)} ${piece.color} ${piece.piece}`
    );
  }

  const positionsString = positions.join(", ");

  const embedding = await generateEmbedding(positionsString);

  const similarity = sql<number>`1 - (${cosineDistance(chessInfo.embedding, embedding)})`;

  const similarGuides = await db
    .select({
      from: chessInfo.from,
      to: chessInfo.to,
      similarity,
      gameState: chessInfo.gameState,
      color: chessInfo.color,
    })
    .from(chessInfo)
    .where(
      and(
        gt(similarity, 0.5),
        eq(chessInfo.userName, gameState.playAs),
        eq(chessInfo.color, gameState.userColor)
      )
    )
    .orderBy((t) => desc(t.similarity))
    .limit(4);

  console.log("similarGuides", similarGuides);
};
