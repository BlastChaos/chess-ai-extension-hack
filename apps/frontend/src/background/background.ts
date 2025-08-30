import { InputGameState, MessageInput } from "@/utils/sendMessage";
import { saveStorage } from "@/utils/storage";

// Keep track of connected popup port(s). There may be multiple popup connections if you support multi-windows.
const popupPorts = new Set<chrome.runtime.Port>();

chrome.runtime.onConnect.addListener((port) => {
  // We name popup connections 'popup' from the popup script
  if (port.name === "popup") {
    popupPorts.add(port);
    port.onDisconnect.addListener(() => popupPorts.delete(port));
  }
});

// Receive messages from content scripts
chrome.runtime.onMessage.addListener((msg: MessageInput) => {
  if (msg.type === "GameState") {
    const gameState = msg.gameState;
    saveStorage({ gameState: gameState ?? undefined });
    for (const port of popupPorts) {
      try {
        port.postMessage({
          type: "GameState",
          gameState: gameState,
        } satisfies InputGameState);
      } catch (e) {
        // ignore send errors
      }
    }
  }
});
