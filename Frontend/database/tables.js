// tables.js
import { getDB } from "./AllDatabase";

export const createUserInfoTable = async () => {
  const db = getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS userinfo (
      id TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      phoneNumber TEXT UNIQUE NOT NULL,
      profilePic TEXT,
      status TEXT DEFAULT 'Hey there! I am using WhatsApp.',
      userId TEXT UNIQUE NOT NULL,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("🧱 'userinfo' table created");
};

export const createFriendListTable = async () => {
  const db = getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS friend_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      friend_name TEXT,
      friend_avatar TEXT,
      friend_status TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES userinfo(id),
      FOREIGN KEY(friend_id) REFERENCES userinfo(id)
    );
  `);
  console.log("🧱 'friend_list' table created");
};

export const createPendingSyncTable = async () => {
  const db = getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pending_sync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT,
      data TEXT,
      status TEXT DEFAULT 'pending'
    );
  `);
  console.log("🧱 'pending_sync' table created");
};

// Optional: bundle all in one if needed
export const createAllTables = async () => {
  await createUserInfoTable();
  await createFriendListTable();
  await createPendingSyncTable();
};
