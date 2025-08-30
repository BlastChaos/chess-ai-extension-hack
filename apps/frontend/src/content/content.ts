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

    if (useList) {
      return true;
    }
    return false;
  });

  observer.observe(boardLayout, {
    childList: true,
    subtree: true, // <-- important to include children-of-children
    attributes: true,
    attributeOldValue: true,
  });
};
isPlaying();
