import { Position } from "../types.js";

export const squareToChess = (position: Position): string => {
  const file = String.fromCharCode(96 + position.x);
  return `${file}${position.y}`;
};

export const chessToSquare = (position: string): Position | null => {
  if (position.length !== 2) {
    return null;
  }
  const file = position.charCodeAt(0) - 96;
  const rank = Number(position[1]);
  return { x: file, y: rank };
};
