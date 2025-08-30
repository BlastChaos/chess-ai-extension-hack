import { GameState } from "@chess-ai/ai";

type Output = {
  gameState: GameState;
  loading: boolean;
};

export const useGetGameState = (): Output => {
  return {
    gameState: {
      history: [],
      userColor: "black",
      isUserTurn: true,
      currentTurn: "black",
      pieces: [
        {
          color: "black",
          piece: "rook",
          position: {
            x: 0,
            y: 0,
          },
        },
      ],
    },
    loading: false,
  };
};
