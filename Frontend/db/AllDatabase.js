// db.js
import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabase('whatsappDB');

  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Create user profile table
    CREATE TABLE IF NOT EXISTS userinfo (
      id TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      avatar TEXT,
      userId TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'Hey there! I am using WhatsApp.',
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create friend list table
    CREATE TABLE IF NOT EXISTS friend_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      friend_name TEXT,
      friend_avatar TEXT,
      friend_status TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES userinfo(id),
      FOREIGN KEY(friend_id) REFERENCES userinfo(id)
    );

    -- Track pending operations for sync
    CREATE TABLE IF NOT EXISTS pending_sync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT,
      data TEXT,
      status TEXT DEFAULT 'pending'
    );
  `);

  console.log('📦 SQLite DB initialized with userinfo, friend_list, and pending_sync tables.');
};

export const getDB = () => db;
