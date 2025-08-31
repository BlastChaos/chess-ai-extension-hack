import { generateObject } from "ai";
import { GameState, Piece, Position } from "../types.js";
import { chessToSquare, squareToChess } from "../utils/convert.js";
import { openai } from "@ai-sdk/openai";
import z from "zod";
import { chessInfo } from "./chessInfo.js";
import { findSimilarState } from "./findSimilarState.js";
type Response = {
  initialPosition: Position;
  finalPosition: Position;
  promotion: Piece | null;
  reason: string;
};

export async function getBestMove(gameState: GameState): Promise<Response> {
  const piecesString = gameState.pieces.map((piece) => {
    const position = squareToChess(piece.position);
    return `- ${piece.piece} ${piece.color} at ${position}`;
  });
  const similarState = await findSimilarState(gameState);

  const oldMovesString = gameState.history.map((move) => {
    return `${move.turn}: ${move.piece} ${move.moveString}`;
  });

  const similarStatesSet = new Set(
    similarState.map((state) => {
      return `Move from ${state.from} to ${state.to}`;
    })
  );

  const similarStateString = Array.from(similarStatesSet).join("\n");

  const prompt = `
You are a chess engine assistant. Using the exact board state I give below, choose the BEST LEGAL move I should make.
I'm the ${gameState.userColor}.

CONSTRAINTS ON MOVE:
- The move MUST be legal from the provided board position and must match "initialPosition" → "finalPosition".
- If castling, set initialPosition and finalPosition to the king's start and end squares (e.g. "e1" → "g1") and moveType "castle".
- If promotion, set "promotion" appropriately and moveType "promotion".

PREFERENCES (tie-breakers):
1. Forced checkmate sequence (shortest mate).
2. Clear material gain (captures that win material).
3. Long-term positional advantage (central control, piece activity, king safety).
4. Simpler, low-risk moves if equal.

BOARD STATUS:
${piecesString.join("\n")}

${
  similarStateString.length > 0
    ? `
Here's some suggested moves. You can use these moves as a reference. It's up to you.
${similarStateString}
`
    : ""
}

${
  similarStateString.length === 0
    ? `
Old moves (chronological):
${oldMovesString.join("\n")}
`
    : ""
}

Here's some information about the chess rules:
${chessInfo}
  `;

  console.log("Waiting for best move");
  console.log("prompt", prompt);

  const numberOfMoves = oldMovesString.length;
  const gameLLM = numberOfMoves >= 24 ? openai("gpt-5") : openai("gpt-4.1");
  const { object } = await generateObject({
    model: gameLLM,

    prompt: prompt,
    schema: z.object({
      initialPosition: z
        .string()
        .length(2)
        .describe(`This is the initial position we must move from. The position is based on the chess board and must contain only 2 chars. (e.g. "e2")`),
      finalPosition: z
        .string()
        .length(2)
        .describe(`This is the final position we must move to. The position is based on the chess board and must contain only 2 chars. (e.g. "e4")`),
      promotion: z
        .nativeEnum(Piece)
        .nullable()
        .describe(
          `If this move is a promotion, set to one of ${Object.values(Piece).join(", ")}. Otherwise null.`
        ),
      reason: z
        .string()
        .describe(
          `Explain simply why the AI made this move, its purpose, threats addressed, opportunities created, and immediate board advantage in 20 words or less. And it begins with "I choose {move} because...".`
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
