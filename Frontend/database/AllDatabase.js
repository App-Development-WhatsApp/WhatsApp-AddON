// db.js
import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('whatsappDB');
  console.log('✅ Database opened successfully');
  return db;
};

export const getDB = () => {
  if (!db) {
    throw new Error('❌ DB not initialized. Call initDatabase() first.');
  }
  return db;
};
