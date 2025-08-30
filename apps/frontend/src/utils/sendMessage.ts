import type { GameState, Position } from "@chess-ai/ai";

export type MessageType = "getChessInfo" | "move" | "GameState";

export type Props<T extends MessageType> = {
  type: T;
} & (T extends "move" ? { from: Position; to: Position } : T extends "GameState" ? { gameState: GameState } : {});

type Output<T extends MessageType> = T extends "getChessInfo"
  ? GameState
  : never;

export async function sendMessage<T extends MessageType>(
  message: Props<T>
): Promise<Output<T> | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab.id) {
    return null;
  }
  return chrome.tabs.sendMessage(tab.id, message);
}
