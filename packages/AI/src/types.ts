export const Pieces = {
  n: "knight",
  q: "queen",
  r: "rook",
  b: "bishop",
  p: "pawn",
} as const;
export type Pieces = (typeof Pieces)[keyof typeof Pieces];

export const Colors = {
  w: "white",
  b: "black",
} as const;
export type Colors = (typeof Colors)[keyof typeof Colors];

export type Position = {
  x: number;
  y: number;
};

export type Move = {
  from: Position;
  to: Position;
  piece: Pieces;
  color: Colors;
  turn: number;
  promotion?: Pieces;
};

export type GameState = {
  pieces: {
    piece: Pieces;
    color: Colors;
    position: Position;
  }[];
  history: Move[];
  currentTurn: Colors;
  userColor: Colors;
  isUserTurn: boolean;
};
