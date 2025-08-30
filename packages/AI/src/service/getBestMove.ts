import { generateObject } from "ai";
import { GameState, Piece, Position } from "../types.js";
import { chessToSquare, squareToChess } from "../utils/convert.js";
import { openai } from "@ai-sdk/openai";
import z from "zod";
import { rag } from "./RAG.js";

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
    return `${move.turn}: ${move.piece} ${move.moveString}`;
  });

  const prompt = `
You are a chess engine assistant. Using only the exact board state and move history I give below, choose the single BEST legal move for the side to move.

CONSTRAINTS ON MOVE:
- The move MUST be legal from the provided board position and must match "initialPosition" → "finalPosition".
- If castling, set initialPosition and finalPosition to the king's start and end squares (e.g. "e1" → "g1") and moveType "castle".
- If promotion, set "promotion" appropriately and moveType "promotion".

PREFERENCES (tie-breakers):
1. Forced checkmate sequence (shortest mate).
2. Clear material gain (captures that win material).
3. Long-term positional advantage (central control, piece activity, king safety).
4. Simpler, low-risk moves if equal.

BOARD STATUS (use only these):
${piecesString.join("\n")}

Old moves (chronological):
${oldMovesString.join("\n")}

Side to move: ${gameState.userColor}

Here's some information about the chess rules:
${rag}
  `;

  console.log("Waiting for best move");
  console.log("prompt", prompt);

  const numberOfMoves = oldMovesString.length;
  const gameLLM =
    numberOfMoves >= 40 ? openai("gpt-5-nano") : openai("gpt-4.1");
  const { object } = await generateObject({
    model: gameLLM,

    prompt: prompt,
    schema: z.object({
      initialPosition: z
        .string()
        .describe(`string, exactly 2 chars, algebraic square (e.g. "e2")`),
      finalPosition: z
        .string()
        .describe(`string, exactly 2 chars, algebraic square (e.g. "e4")`),
      promotion: z
        .nativeEnum(Piece)
        .nullable()
        .describe(
          `If this move is a promotion, set to one of ${Object.values(Piece).join(", ")}. Otherwise null.`
        ),
      reason: z
        .string()
        .describe(
          "1 to 3 concise sentences explaining *why* this move is best, referencing the current board and relevant previous moves. If a tactic or forced line exists, include the principal variation in SAN or UCI (max 5 plies) inside the reason."
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
