import type { GameState, Position } from "@chess-ai/ai";

export type MessageType = "getChessInfo" | "move" | "GameState";

export type InputGetChessInfo = { type: "getChessInfo" };
export type InputMove = { type: "move"; from: Position; to: Position };
export type InputGameState = { type: "GameState"; gameState: GameState };

export type MessageInput = InputGetChessInfo | InputMove | InputGameState;

export type OutputGetChessInfo = { type: "getChessInfo"; gameState: GameState };
export type OutputMove = { type: "move" };
export type OutputGameState = { type: "GameState"  };

export type MessageOutput = OutputGetChessInfo | OutputMove | OutputGameState;

/**
 * Map an input message to the corresponding output type.
 * - If message.type === "getChessInfo" -> OutputGetChessInfo
 * - If message.type === "move" -> OutputMove
 * - If message.type === "GameState" -> OutputGameState
 */
export type MessageOutputFor<T extends MessageInput> = T extends {
  type: infer U;
}
  ? U extends MessageType
    ? Extract<MessageOutput, { type: U }>
    : never
  : never;

/**
 * Generic sendMessage: the returned Promise resolves to the exact output
 * type corresponding to the input message's `type` (or null).
 */
export async function sendMessage<T extends MessageInput>(
  message: T
): Promise<MessageOutputFor<T> | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) return null;

  // Wrap the chrome API in a Promise to be safe across callback/promise typings.
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id!, message, (resp) => {
      // cast because runtime payloads are untyped; we assert the mapping is correct.
      resolve(resp as MessageOutputFor<T> | null);
    });
  });
}
