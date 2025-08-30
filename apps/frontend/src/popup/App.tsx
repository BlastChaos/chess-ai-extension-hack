import "./index.css";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { sendMessage } from "@/utils/sendMessage";
export default function App() {
  const { mutateAsync } = useMutation(trpc.getBestMove.mutationOptions());
  const finalTest = async () => {
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
      const bestMove = await mutateAsync(test);
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
  };
  return (
    <div className="p-4 flex flex-col w-64">
      <button className="bg-blue-500 text-white p-2 rounded-md" onClick={finalTest}>Get Chess Info</button>
    </div>
  );
}
