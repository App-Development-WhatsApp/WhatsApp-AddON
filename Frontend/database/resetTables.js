// reset.js
import { getDB } from "./AllDatabase";

export const dropAllTables = async () => {
  const db = getDB();

  await db.execAsync(`
    DROP TABLE IF EXISTS pending_sync;
    DROP TABLE IF EXISTS friend_list;
    DROP TABLE IF EXISTS userinfo;
  `);

  console.log("🧹 All tables dropped (userinfo, friend_list, pending_sync)");
};
