import type { GameState } from "@chess-ai/ai";
import { getHistory } from "./getHistory";
import { getPiecesState } from "./getPiecesState";
import { getUserColor } from "./getUserColor";

export function getGameState(): GameState {
  const pieces = getPiecesState();
  const userColor = getUserColor();
  const history = getHistory();
  const lastTurn = history[history.length - 1];
  const isUserTurn = lastTurn.color === userColor;

  return {
    pieces,
    userColor,
    isUserTurn,
    history,
    currentTurn: userColor,
  };
}
