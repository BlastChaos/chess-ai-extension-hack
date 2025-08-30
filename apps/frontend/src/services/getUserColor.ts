import type { Color } from "@chess-ai/ai";

export function getUserColor(): Color {
  const el = document.querySelector("wc-chess-board");
  if (!el) {
    return "white";
  }
  if (el.className === "board") {
    return "white";
  }
  return "black";
}
