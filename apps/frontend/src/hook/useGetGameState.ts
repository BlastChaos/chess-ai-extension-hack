import { GameState } from "@chess-ai/ai";

type Output = {
  gameState?: GameState;
  loading: boolean;
};

export const useGetGameState = (): Output => {
  return {
    gameState: {
      pieces: [
        // White back rank (y = 1)
        { piece: "rook", color: "white", position: { x: 1, y: 1 } }, // a1
        { piece: "knight", color: "white", position: { x: 2, y: 1 } }, // b1
        { piece: "bishop", color: "white", position: { x: 3, y: 1 } }, // c1
        { piece: "queen", color: "white", position: { x: 4, y: 1 } }, // d1
        { piece: "king", color: "white", position: { x: 5, y: 1 } }, // e1
        { piece: "bishop", color: "white", position: { x: 6, y: 1 } }, // f1
        { piece: "knight", color: "white", position: { x: 7, y: 1 } }, // g1
        { piece: "rook", color: "white", position: { x: 8, y: 1 } }, // h1

        // White pawns (y = 2)
        { piece: "pawn", color: "white", position: { x: 1, y: 2 } }, // a2
        { piece: "pawn", color: "white", position: { x: 2, y: 2 } }, // b2
        { piece: "pawn", color: "white", position: { x: 3, y: 2 } }, // c2
        { piece: "pawn", color: "white", position: { x: 4, y: 2 } }, // d2
        { piece: "pawn", color: "white", position: { x: 5, y: 2 } }, // e2
        { piece: "pawn", color: "white", position: { x: 6, y: 2 } }, // f2
        { piece: "pawn", color: "white", position: { x: 7, y: 2 } }, // g2
        { piece: "pawn", color: "white", position: { x: 8, y: 2 } }, // h2

        // Black pawns (y = 7)
        { piece: "pawn", color: "black", position: { x: 1, y: 7 } }, // a7
        { piece: "pawn", color: "black", position: { x: 2, y: 7 } }, // b7
        { piece: "pawn", color: "black", position: { x: 3, y: 7 } }, // c7
        { piece: "pawn", color: "black", position: { x: 4, y: 7 } }, // d7
        { piece: "pawn", color: "black", position: { x: 5, y: 7 } }, // e7
        { piece: "pawn", color: "black", position: { x: 6, y: 7 } }, // f7
        { piece: "pawn", color: "black", position: { x: 7, y: 7 } }, // g7
        { piece: "pawn", color: "black", position: { x: 8, y: 7 } }, // h7

        // Black back rank (y = 8)
        { piece: "rook", color: "black", position: { x: 1, y: 8 } }, // a8
        { piece: "knight", color: "black", position: { x: 2, y: 8 } }, // b8
        { piece: "bishop", color: "black", position: { x: 3, y: 8 } }, // c8
        { piece: "queen", color: "black", position: { x: 4, y: 8 } }, // d8
        { piece: "king", color: "black", position: { x: 5, y: 8 } }, // e8
        { piece: "bishop", color: "black", position: { x: 6, y: 8 } }, // f8
        { piece: "knight", color: "black", position: { x: 7, y: 8 } }, // g8
        { piece: "rook", color: "black", position: { x: 8, y: 8 } }, // h8
      ],

      history: [],
      currentTurn: "white",
      userColor: "white",
      isUserTurn: true,
    },
    loading: false,
  };
};
