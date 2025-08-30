import { InputGameState } from "@/utils/sendMessage";
import { getStorage } from "@/utils/storage";
import { GameState } from "@chess-ai/ai";
import { useEffect, useState } from "react";

type Output = {
  gameState: GameState | null;
  loading: boolean;
};

export const useGetGameState = (): Output => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });

    const loadGameState = (message: InputGameState) => {
      if (message.type === "GameState") {
        setGameState(message.gameState);
        setLoading(false);
      }
    };

    port.onMessage.addListener(loadGameState);

    getStorage("gameState").then((res) => {
      if (!gameState) {
        setGameState(res);
      }
      setLoading(false);
    });

    return () => {
      port.onMessage.removeListener(loadGameState);
    };
  });

  return {
    gameState,
    loading,
  };
};
