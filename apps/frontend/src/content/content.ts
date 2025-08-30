import { getGameState } from "@/services/getGameState";
import { move } from "@/services/movePiece";
import { MessageType, Props } from "@/utils/sendMessage";

console.log("[Chess AI] Hello world from content script!");

chrome.runtime.onMessage.addListener(
  (message: Props<MessageType>, _, sendResponse) => {
    if (message.type === "getChessInfo") {
      return sendResponse(getGameState());
    }
    if (message.type === "move") {
      return sendResponse(move(message as Props<"move">));
    }
  }
);
