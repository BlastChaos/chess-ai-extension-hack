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

export default function App() {
  const { mutateAsync, isPending } = useMutation(
    trpc.getBestMove.mutationOptions()
  );
  const { gameState } = useGetGameState();
  const [loading, setLoading] = useState(false);
  const [Autoplay, setAutoplay] = useState(false);
  const finalTest = async () => {
    setLoading(true);
    console.log("finalTest");
    const test = await sendMessage({
      type: "getChessInfo",
    });
    console.log("test send message", test);
    if (!test) {
      return;
    }
    if (test) {
      console.log("test mutate async", test);
      const bestMove = await mutateAsync(test.gameState);
      if (!bestMove) {
        return;
      }

      console.log("test send message", bestMove);
      await sendMessage({
        type: "move",
        from: bestMove.initialPosition,
        to: bestMove.finalPosition,
      });
    }
    setLoading(false);
  };
  const handleSwitchChange = (value: boolean) => {
    saveStorage({ autoPlay: value });
    setAutoplay(value)
  }

  useEffect(() => {
    if (Autoplay && gameState?.isUserTurn && !loading && !isPending) {
      finalTest();
    }
  }, [gameState?.isUserTurn, Autoplay]);

  getStorage("autoPlay").then((res) => {
    console.log("storage", res)
    if (res != null && res != Autoplay) {
      setAutoplay(res);
    }
  });
  return (
    <div className="p-4 flex flex-col w-64 space-y-3">
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-center border-b">
      Autoplay Chess AI
    </h4>
      <div className="flex items-center justify-between"></div>
      <div className="flex items-center justify-end space-x-2">
        <Label>Autoplay</Label>
        <Switch checked={Autoplay} onCheckedChange={handleSwitchChange} />
      </div>
      <Button onClick={finalTest} disabled={loading || isPending || Autoplay || !gameState?.isUserTurn}>
        {(loading && !Autoplay) && <Loader2Icon className="animate-spin" />} { gameState?.isUserTurn ? "Move" : "Wait for your turn"}
      </Button>
    </div>
  );
}
