import { db } from "../db/index.js";
import { chessInfo } from "../db/schema.js";
import { PlayAsArray } from "../types.js";
import { getChessInfo } from "../utils/getChessInfo.js";

const MAXIMUM_MOVES = 4000;

export const addUsersGame = async () => {
  const playAs = PlayAsArray;

  console.log("Getting chess info for ", playAs);
  const promises = playAs.map(async (playAs) => {
    const chessInfo = await getChessInfo(playAs, MAXIMUM_MOVES);
    return chessInfo;
  });

  const allChessInfos = await Promise.all(promises);

  console.log(`${playAs.length} chess info found`);

  const chessInfos = allChessInfos.flat();

  const chunkSize = 50; // or 100
  for (let i = 0; i < chessInfos.length; i += chunkSize) {
    await db.insert(chessInfo).values(chessInfos.slice(i, i + chunkSize));
  }

  console.log(`${chessInfos.length} chess info added`);
};
addUsersGame();
