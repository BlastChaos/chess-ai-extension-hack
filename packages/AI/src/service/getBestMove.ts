import { generateObject } from "ai";
import { GameState, Piece, Position } from "../types.js";
import { chessToSquare, squareToChess } from "../utils/convert.js";
import { google } from "@ai-sdk/google";
import z from "zod";

type Response = {
  initialPosition: Position;
  finalPosition: Position;
  promotion: Piece | null;
  reason: string;
};

export async function getBestMove(gameState: GameState): Promise<Response> {
  const piecesString = gameState.pieces.map((piece) => {
    const position = squareToChess(piece.position);
    return `- Piece: ${piece.piece} ${piece.color} at ${position}`;
  });

  const oldMovesString = gameState.history.map((move) => {
    const from = squareToChess(move.from);
    const to = squareToChess(move.to);
    return `- ${move.piece} ${move.color} moved from ${from} to ${to}. Turn: ${move.turn}.`;
  });

  const prompt = `
You are a chess engine assistant. Using only the exact board state and move history I give below, choose the single BEST legal move for the side to move.

CONSTRAINTS ON MOVE:
- The move MUST be legal from the provided board position and must match "initialPosition" → "finalPosition".
- If castling, set initialPosition and finalPosition to the king's start and end squares (e.g. "e1" → "g1") and moveType "castle".
- If promotion, set "promotion" appropriately and moveType "promotion".
- Do not invent or change the board state, and do not rely on hidden knowledge beyond the provided piecesString and oldMovesString.

PREFERENCES (tie-breakers):
1. Forced checkmate sequence (shortest mate).
2. Clear material gain (captures that win material).
3. Long-term positional advantage (central control, piece activity, king safety).
4. Simpler, low-risk moves if equal.

BOARD & MOVE HISTORY (use only these):
${piecesString.join("\n")}

Old moves (chronological):
${oldMovesString.join("\n")}

Side to move: ${gameState.userColor}
It is this side's turn.
  `;

  const { object } = await generateObject({
    model: google("gemini-2.5-pro"),
    prompt: prompt,
    schema: z.object({
      initialPosition: z
        .string()
        .describe(`string, exactly 2 chars, algebraic square (e.g. "e2")`),
      finalPosition: z
        .string()
        .describe(`string, exactly 2 chars, algebraic square (e.g. "e4")`),
      promotion: z
        .string()
        .nullable()
        .describe(
          `If this move is a promotion, set to one of ["q","r","b","n"]. Otherwise null.`
        ),
      reason: z
        .string()
        .describe(
          "1–3 concise sentences explaining *why* this move is best, referencing the current board and relevant previous moves. If a tactic or forced line exists, include the principal variation in SAN or UCI (max 5 plies) inside the reason."
        ),
    }),
  });

  const initialPosition = chessToSquare(object.initialPosition);
  const finalPosition = chessToSquare(object.finalPosition);

  console.log("best move", object);

  return {
    initialPosition: initialPosition ?? { x: 0, y: 0 },
    finalPosition: finalPosition ?? { x: 0, y: 0 },
    promotion: object.promotion as Piece | null,
    reason: object.reason,
  };
}
