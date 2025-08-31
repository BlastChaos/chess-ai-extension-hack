import { and, gt, eq } from "drizzle-orm";
import { GameState } from "../types.js";
import { squareToChess } from "../utils/convert.js";
import { chessInfo } from "../db/schema.js";
import { db } from "../db/index.js";

export const findSimilarState = async (gameState: GameState) => {
  if (!gameState.playAs) {
    return [];
  }

  const sortedPieces = gameState.pieces.sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return b.position.y - a.position.y;
    }
    return a.position.x - b.position.x;
  });

  const positions: string[] = [];

  for (const piece of sortedPieces) {
    positions.push(
      `${squareToChess(piece.position)} ${piece.color} ${piece.piece}`
    );
  }

  const positionsString = positions.join(", ");

  const similarGuides = await db
    .select({
      from: chessInfo.from,
      to: chessInfo.to,
    })
    .from(chessInfo)
    .where(
      and(
        gt(chessInfo.gameState, positionsString),
        eq(chessInfo.userName, gameState.playAs),
        eq(chessInfo.color, gameState.userColor)
      )
    );
  return similarGuides;
};
