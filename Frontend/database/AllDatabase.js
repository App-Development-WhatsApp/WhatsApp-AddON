import * as SQLite from 'expo-sqlite';
import { createAllTables } from './tables';


let db;

export const initDatabase = async () => {
  try {
    console.log("📦 Creating database...");
    db = await SQLite.openDatabaseAsync('whatsapp.db');
    console.log("✅ DB created successfully:", db);

    await createAllTables(db);
    console.log("✅ All tables created successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export const getDB = () => db;
