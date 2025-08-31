import { db } from "../db/index.js";
import { chessInfo } from "../db/schema.js";
import { PlayAs } from "../types.js";
import { getChessInfo } from "../utils/getChessInfo.js";

const MAXIMUM_MOVES = 1000;

export const addUsersGame = async () => {
  const playAs = Object.keys(PlayAs);

  console.log("Getting chess info for ", playAs);
  const promises = playAs.map(async (playAs) => {
    const chessInfo = await getChessInfo(playAs, MAXIMUM_MOVES);
    return chessInfo;
  });

  const allChessInfos = await Promise.all(promises);

  console.log(`${playAs.length} chess info found`);

  const chessInfos = allChessInfos.flat();

  console.log(`${chessInfos.length} chess info to add`);
  await db.insert(chessInfo).values(chessInfos);

  console.log(`${chessInfos.length} chess info added`);
};
addUsersGame();
