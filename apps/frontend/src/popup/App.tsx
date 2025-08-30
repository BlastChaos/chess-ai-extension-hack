import "./index.css";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { sendMessage } from "@/utils/sendMessage";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@radix-ui/react-label";
import { Loader2Icon } from "lucide-react";
import { getStorage, saveStorage } from "@/utils/storage";
import { useGetGameState } from "@/hook/useGetGameState";
import { TrafficLight } from "@/components/trafficLight";

export default function App() {
  const { mutateAsync, isPending } = useMutation(
    trpc.getBestMove.mutationOptions()
  );
  const { gameState } = useGetGameState();
  const [loading, setLoading] = useState(false);
  const [Autoplay, setAutoplay] = useState(false);

  /** Exécute le coup recommandé par l'IA */
  const finalTest = async () => {
    setLoading(true);

    try {
      const chessInfo = await sendMessage({ type: "getChessInfo" });
      if (!chessInfo) return;

      const bestMove = await mutateAsync(chessInfo.gameState);
      if (!bestMove) return;

      await sendMessage({
        type: "move",
        from: bestMove.initialPosition,
        to: bestMove.finalPosition,
      });
    } finally {
      setLoading(false);
    }
  };

  /** Gestion du switch Autoplay */
  const handleAutoplayChange = (value: boolean) => {
    saveStorage({ autoPlay: value });
    setAutoplay(value);
  };

  /** Charge la config initiale (storage) */
  useEffect(() => {
    getStorage("autoPlay").then((res) => {
      if (res != null) setAutoplay(res);
    });
  }, []);

  useEffect(() => {
    if (Autoplay && gameState?.isUserTurn && !loading && !isPending) {
      finalTest();
    }
  }, [gameState?.isUserTurn, Autoplay]);

  return (
    <div className="flex flex-col w-80">
      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight text-center border-b-1 opacity-bo  bg-background">
        Autoplay Chess AI
      </h4>
      <div className="p-4 flex flex-col space-y-3">
        <TrafficLight value={gameState?.isUserTurn == true} />
        <div className="flex items-center justify-end space-x-2">
          <h5 className="font-semibold text-sm"> AutoPlay </h5>
          <Switch checked={Autoplay} onCheckedChange={handleAutoplayChange} />
        </div>
        <Button
          onClick={finalTest}
          disabled={loading || isPending || Autoplay || !gameState?.isUserTurn}
        >
          {loading && !Autoplay && <Loader2Icon className="animate-spin" />}{" "}
          {gameState?.isUserTurn ? "Move" : "Wait for your turn"}
        </Button>
      </div>
    </div>
  );
}
