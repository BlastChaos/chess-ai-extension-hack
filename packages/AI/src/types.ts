export const Piece = {
  n: "knight",
  q: "queen",
  r: "rook",
  b: "bishop",
  p: "pawn",
} as const;
export type Piece = (typeof Piece)[keyof typeof Piece];

export const Color = {
  w: "white",
  b: "black",
} as const;
export type Color = (typeof Color)[keyof typeof Color];

export type Position = {
  x: number;
  y: number;
};

export type Move = {
  from: Position;
  to: Position;
  piece: Piece;
  color: Color;
  turn: number;
  promotion?: Piece;
};

export type PieceState = {
  piece: Piece;
  color: Color;
  position: Position;
};

export type GameState = {
  pieces: PieceState[];
  history: Move[];
  currentTurn: Color;
  userColor: Color;
  isUserTurn: boolean;
};
