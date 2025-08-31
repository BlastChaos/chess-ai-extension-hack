export const PlayAsArray = ["gothamchess", "hikaru", "magnuscarlsen"] as const;

export type PlayAs = (typeof PlayAsArray)[number];
export const Piece = {
  n: "knight",
  q: "queen",
  r: "rook",
  b: "bishop",
  p: "pawn",
  k: "king",
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
  moveString: string;
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
  playAs?: PlayAs;
};
