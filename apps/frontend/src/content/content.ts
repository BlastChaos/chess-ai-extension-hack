import { getGameState } from "@/services/getGameState";
import { move } from "@/services/movePiece";
import { debounce } from "@/utils/debounce";
import { MessageInput } from "@/utils/sendMessage";

console.log("[Chess AI] Hello world from content script!");

chrome.runtime.onMessage.addListener(
  (message: MessageInput, _, sendResponse) => {
    if (message.type === "getChessInfo") {
      return sendResponse(getGameState());
    }
    if (message.type === "move") {
      return sendResponse(move(message));
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

  const getGameInfo = () => {
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

    chrome.runtime.sendMessage<MessageInput>({
      type: "GameState",
      gameState: gameState.gameState,
    });
  };

  const getGameInfoDebounced = debounce(getGameInfo, 500);

  const observer = new MutationObserver(getGameInfoDebounced);

  observer.observe(boardLayout, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
  });
};
isPlaying();
