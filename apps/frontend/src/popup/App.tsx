import "./index.css";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { sendMessage } from "@/utils/sendMessage";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2Icon } from "lucide-react";
import { getStorage, saveStorage } from "@/utils/storage";
import { useGetGameState } from "@/hook/useGetGameState";
import { TrafficLight } from "@/components/trafficLight";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoveHistory } from "@/components/ui/move-history";
import type { PlayAs } from "@chess-ai/ai";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function App() {
  const PlayAs: Record<PlayAs, string> = {
    gothamchess: "Levy Rozman",
    hikaru: "Hikaru Nakamura",
    magnuscarlsen: "Magnus Carlsen",
  } as const;
  const [key, setKey] = useState(+new Date());

  const { mutateAsync, isPending } = useMutation(
    trpc.getBestMove.mutationOptions()
  );
  const { gameState } = useGetGameState();
  const [loading, setLoading] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [reason, setReason] = useState<string[]>([]);
  const [player, setPlayer] = useState<PlayAs | undefined>(undefined);
  const playBestMove = async () => {
    setLoading(true);
    try {
      const chessInfo = await sendMessage({ type: "getChessInfo" });
      if (!chessInfo) return;

      const bestMove = await mutateAsync({
        ...chessInfo.gameState,
        playAs: player,
      });
      if (!bestMove) return;

      getStorage("reason").then((res) => {
        if (res == null) {
          var reason = bestMove.reason ?? "No explanation available";
          setReason([reason]);
          saveStorage({ reason: [reason] });
        } else {
          var reason2 = [...res, bestMove.reason ?? "No explanation available"];

          setReason(reason2);
          saveStorage({ reason: reason2 });
        }
      });
      await sendMessage({
        type: "move",
        from: bestMove.initialPosition,
        to: bestMove.finalPosition,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoplayChange = (value: boolean) => {
    saveStorage({ autoPlay: value });
    setAutoplay(value);
  };

  useEffect(() => {
    getStorage("autoPlay").then((res) => {
      if (res != null) setAutoplay(res);
    });
    getStorage("reason").then((res) => {
      if (res != null) setReason(res);
    });
  }, []);

  useEffect(() => {
    if (gameState?.history == undefined || gameState.history.length === 0) {
      setReason([]);
      saveStorage({ reason: [] });
    } else {
      var length = gameState.history.filter(
        (s) => s.color === gameState?.userColor
      ).length;
      console.log("reason", reason.length);
      console.log("history", length);
      if (reason.length > length) {
        var currentReason = reason[reason.length - 1];
        const newReason = reason.slice(0, length - 1);
        newReason.push(currentReason!);
        setReason(newReason);
        saveStorage({ reason: newReason });
        console.log("reason final", newReason.length);
      }
    }
  }, [gameState?.history]);

  useEffect(() => {
    if (autoplay && gameState?.isUserTurn && !loading && !isPending) {
      playBestMove();
    }
  }, [gameState?.isUserTurn, autoplay, loading]);
  // Object.entries(PlayAs).map(([key, value]) => {
  //   console.log(value);
  // })
  console.log(player);
  return (
    <Card className="w-80 shadow-md  rounded-none pt-0 pb-4 gap-4">
      <CardHeader className=" pt-3 bg-background">
        <CardTitle className="text-center text-lg font-semibold">
          ♘ Chess AI
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-4 space-y-4">
            {/* État du jeu */}
            <div className="flex justify-center">
              <TrafficLight value={gameState?.isUserTurn === true} />
            </div>

            <div className="flex flex-col justify-center w-full">
              <div>Play the game as:</div>
              <Select value={player} onValueChange={setPlayer} key={key}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pro player</SelectLabel>
                    <SelectItem value={"gothamchess"}>
                      {PlayAs.gothamchess + " (gothamchess)"}
                    </SelectItem>
                    <SelectItem value={"hikaru"}>
                      {PlayAs.hikaru + " (hikaru)"}
                    </SelectItem>
                    <SelectItem value={"magnuscarlsen"}>
                      {PlayAs.magnuscarlsen + " (magnuscarlsen)"}
                    </SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <Button
                    className="w-full px-2"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayer(undefined);
                      setKey(+new Date());
                    }}
                  >
                    Clear
                  </Button>
                </SelectContent>
              </Select>
            </div>
            {/* Autoplay switch */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Autoplay</span>
              <Switch
                checked={autoplay}
                onCheckedChange={handleAutoplayChange}
              />
            </div>

            {/* Move longer*/}
            {gameState?.history && gameState?.history.length >= 24 && (
              <span className="text-sm font-light">
                AI’s serious now—thinking will take longer. 🧐
              </span>
            )}

            {/* Bouton Move */}
            <Button
              onClick={playBestMove}
              disabled={
                loading || isPending || autoplay || !gameState?.isUserTurn
              }
              className="w-full"
            >
              {loading && !autoplay && (
                <Loader2Icon className="animate-spin mr-2" />
              )}
              {gameState?.isUserTurn ? "Make Move" : "Waiting for Opponent..."}
            </Button>
          </TabsContent>

          <TabsContent value="history" className="text-sm">
            {gameState?.history?.length ? (
              <MoveHistory
                history={gameState.history}
                userColor={gameState?.userColor}
                reason={reason}
              />
            ) : (
              <p className="text-muted-foreground">No moves recorded yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
