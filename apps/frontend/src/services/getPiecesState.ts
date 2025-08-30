import { PieceState, Color, Piece } from "@chess-ai/ai";

export function getPieces(): PieceState[] {
  const whites = getColorPieces("w");

  const blacks = getColorPieces("b");
  return [...whites, ...blacks];
}

export function getColorPieces(color: keyof typeof Color): PieceState[] {
  const pieceKeys = Object.keys(Piece);
  const piecesName = Object.values(pieceKeys).map((piece) => {
    return `div.${color}${piece}`;
  });

  const pieces = Array.from(document.querySelectorAll(piecesName.join(", ")));
  return pieces.map((piece) => {
    const classnames = piece.className.split(" ");

    const type = classnames.find((classname) => {
      return classname.length === 2;
    })?.[1] as keyof typeof Piece;

    const position =
      classnames
        .find((classname) => {
          return classname.startsWith("square-");
        })
        ?.replace("square-", "")
        .split("")
        .map((item) => Number(item)) ?? [];

    return {
      color: Color[color],
      piece: Piece[type],
      position: {
        x: position[0] ?? 0,
        y: position[1] ?? 0,
      },
    };
  });
}
