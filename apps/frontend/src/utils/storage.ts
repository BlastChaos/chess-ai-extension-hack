import type { GameState } from "@chess-ai/ai";

type Storage = {
  isGaming: boolean;
  chessInfo: GameState;
  autoPlay: boolean;
  reason: string[];
};

// cache mémoire local
let memoryCache: Record<string, any> = {};

// Sauvegarde avec mise à jour du cache
export async function saveStorage(storage: Partial<Record<string, any>>) {
  // maj du cache en mémoire
  Object.assign(memoryCache, storage);

  // maj dans le storage Chrome
  await chrome.storage.local.set(storage);
}

// Récupération avec cache
export async function getStorage<T extends string>(
  key: T
): Promise<any | null> {
  // Vérifie si le cache contient déjà la valeur
  if (key in memoryCache) {
    return memoryCache[key];
  }

  // Sinon va chercher dans chrome.storage.local
  if (!chrome?.storage?.local) {
    console.warn("chrome.storage.local is not available");
    return null;
  }

  const result = await chrome.storage.local.get(key);
  memoryCache[key] = result[key] ?? null;
  return memoryCache[key];
}
