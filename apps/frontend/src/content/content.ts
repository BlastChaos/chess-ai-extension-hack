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

const isPlaying = () => {
  // document.querySelector("wc-simple-move-list");
  const boardLayout = document.querySelector("div.board-layout-sidebar");

  if (!boardLayout) {
    console.log("boardLayout not found");
    return false;
  }

  const observer = new MutationObserver(() => {
    //Have access to the history

    const currentActiveButton = document.getElementsByClassName(
      "underlined-tabs-active"
    )[0] as HTMLButtonElement;

    const button = document.querySelector<HTMLButtonElement>(
      'button[data-tab="GameViewTab.Moves"]'
    );
    if (button) {
      button.click();
    }

    const useList = document.querySelector("wc-simple-move-list");

    if (currentActiveButton) {
      currentActiveButton.click();
    }

    const isPlaying = !!useList;

    if (!isPlaying) {
      console.log("User is not playing");
      return;
    }
    console.log("User is playing");
    const gameState = getGameState();

    chrome.runtime.sendMessage<Props<"GameState">>({
      type: "GameState",
      gameState: gameState,
    });
  });

  observer.observe(boardLayout, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
  });
};
isPlaying();
