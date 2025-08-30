import type { GameState, Move } from "@chess-ai/ai";
import { getHistory } from "./getHistory";
import { getPiecesState } from "./getPiecesState";
import { getUserColor } from "./getUserColor";

export function getGameState(): GameState {
  const pieces = getPiecesState();
  const userColor = getUserColor();
  const history = getHistory();
  const lastTurn: Move | null = history[history.length - 1] ?? null;

  const isFirstTurn = lastTurn === null;

  const isUserTurn =
    (isFirstTurn && userColor === "white") || lastTurn.color === userColor;

  return {
    pieces,
    userColor,
    isUserTurn,
    history,
    currentTurn: userColor,
  };
}
