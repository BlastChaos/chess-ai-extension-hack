import { Chess } from "chess.js";
import { Color, Piece } from "../types.js";

type Archives = {
  archives: string[];
};
type Game = {
  url: string;
  pgn: string;
};
type Games = {
  games: Game[];
};

type MoveInfo = {
  userName: string;
  gameState: string;
  from: string;
  to: string;
  color: string;
};

export async function getChessInfo(
  userName: string,
  maximumMoves: number
): Promise<MoveInfo[]> {
  const moveInfos: MoveInfo[] = [];

  //Get the archives
  const query = `https://api.chess.com/pub/player/${userName}/games/archives`;
  const response = await fetch(query);
  const data = (await response.json()) as Archives;
  const archives = data.archives.reverse();

  //For each archive, get the games
  for (const archive of archives) {
    const archiveResponse = await fetch(archive);
    const archiveData = (await archiveResponse.json()) as Games;
    for (const game of archiveData.games) {
      try {
        const data = getData(game.pgn, userName);
        moveInfos.push(...data);
        if (moveInfos.length >= maximumMoves) {
          break;
        }
      } catch (error) {
        console.log("error", error);
      }
    }
    if (moveInfos.length >= maximumMoves) {
      break;
    }
  }
  return moveInfos;
}

function getData(png: string, userName: string): MoveInfo[] {
  const chess = new Chess();
  chess.loadPgn(png);

  const headers = chess.getHeaders();
  const whitePlayer = headers.White;

  const userColor =
    whitePlayer?.toLowerCase() === userName.toLowerCase() ? "w" : "b";

  const history = chess.history({
    verbose: true,
  });

  const newChess = new Chess();

  const moves: MoveInfo[] = [];

  for (const move of history) {
    if (move.color !== userColor) {
      newChess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      continue;
    }
    const gameState = getGameState(newChess);
    moves.push({
      gameState,
      color: Color[move.color],
      from: move.from,
      to: move.to,
      userName,
    });
    newChess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
  }

  return moves;
}

function getGameState(chess: Chess): string {
  const board = chess.board();
  const positions: string[] = [];

  for (const row of board) {
    for (const cell of row) {
      if (cell) {
        positions.push(
          `${cell.square} ${Color[cell.color]} ${Piece[cell.type]}`
        );
      }
    }
  }
  return positions.join(", ");
}
