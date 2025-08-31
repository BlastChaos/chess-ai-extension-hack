import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Color, Move } from "@chess-ai/ai";
const pieceToIcon: Record<string, string> = {
  pawn: "♟",
  knight: "♞",
  bishop: "♝",
  rook: "♜",
  queen: "♛",
  king: "♚",
};

function formatMove(move: Move) {
  const icon = pieceToIcon[move.piece] || "";
  return `${icon} ${move.moveString}`;
}

export function MoveHistory({
  history,
  userColor,
  reason,
}: {
  history: Move[];
  userColor: Color;
  reason: string[];
}) {
  return (
    <div className="max-h-64 overflow-y-auto rounded-md px-3  bg-muted/30">
      <table className="w-full text-sm ">
        <thead className="text-muted-foreground sticky top-0 z-10  bg-muted">
          <tr>
            <th className="text-left w-10">#</th>
            <th className="text-left">White</th>
            <th className="text-left">Black</th>
          </tr>
        </thead>
        <tbody>
          {history.map((move, idx) => (
            <tr key={idx} className="border-t">
              <td className="py-1 pr-2 font-medium">{move.turn}</td>
              <td className="py-1">
                {move.color === "white" &&
                  (userColor === "white" ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="underline decoration-dotted cursor-help">
                          {formatMove(move)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{reason[idx / 2] ?? "No explanation available"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <p>{formatMove(move)}</p>
                  ))}
              </td>
              <td className="py-1">
                {move.color === "black" &&
                  (userColor === "black" ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="underline decoration-dotted cursor-help">
                          {formatMove(move)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            {reason[(idx - 1) / 2] ??
                              "No explanation available"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <p>{formatMove(move)}</p>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
