import { chessToSquare } from "@/utils/convert";
import type { Color, Piece, Move } from "@chess-ai/ai";

export function getHistory(): Move[] {
  //Have access to the history
  const button = document.querySelector<HTMLButtonElement>(
    'button[data-tab="GameViewTab.Moves"]'
  );
  if (button) {
    button.click();
  }

  const history = Array.from(
    document.getElementsByClassName("main-line-row")
  ) as HTMLElement[];
  const historyWithoutResult = history.filter(
    (item) => !item.className?.includes("result-row")
  );

  const sortedHistory = historyWithoutResult.sort((a, b) => {
    const aNumber = Number(a.dataset.wholeMoveNumber ?? 0);
    const bNumber = Number(b.dataset.wholeMoveNumber ?? 0);
    return aNumber - bNumber;
  });

  return sortedHistory.flatMap((item) => {
    const moveNumber = Number(item.dataset.wholeMoveNumber ?? 0);
    const white = item.querySelector<HTMLDivElement>("div.white-move")!;

    const whiteTurn = getMove(white, moveNumber, "white");

    const turns: Move[] = [whiteTurn];

    const black = item.querySelector<HTMLDivElement>("div.black-move");

    if (black) {
      const blackTurn = getMove(black, moveNumber + 1, "black");
      turns.push(blackTurn);
    }

    return turns;
  });
}

function getMove(item: HTMLElement, moveNumber: number, color: Color): Move {
  const piece = item?.querySelector<HTMLDivElement>("span.icon-font-chess");

  let pieceType: Piece;
  const classname = piece?.className;
  if (classname?.includes("knight")) {
    pieceType = "knight";
  } else if (classname?.includes("bishop")) {
    pieceType = "bishop";
  } else if (classname?.includes("rook")) {
    pieceType = "rook";
  } else if (classname?.includes("queen")) {
    pieceType = "queen";
  } else if (classname?.includes("king")) {
    pieceType = "king";
  } else {
    pieceType = "pawn";
  }

  let move = item?.textContent?.trim();

  const turn: Move = {
    color: color,
    from: chessToSquare(move ?? "") ?? { x: 0, y: 0 },
    to: chessToSquare(move ?? "") ?? { x: 0, y: 0 },
    piece: pieceType,
    turn: moveNumber,
    promotion: undefined,
    moveString: move ?? "",
  };

  return turn;
}
