import type { GameState } from "@chess-ai/ai";

type Storage = {
  isGaming: boolean;
  chessInfo: GameState;
};

export async function saveStorage(storage: Partial<Storage>) {
  await chrome.storage.local.set<Storage>(storage);
}

export async function getStorage<T extends keyof Storage>(
  key: T
): Promise<Storage[T] | null> {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? null;
}
