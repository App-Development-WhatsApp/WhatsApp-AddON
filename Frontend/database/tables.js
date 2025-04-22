
export const createUserInfoTable = async (db) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS userinfo (
      id TEXT UNIQUE NOT NULL,
      profilePic TEXT,
      userName TEXT NOT NULL,
      fullName TEXT NOT NULL,
      phoneNumber TEXT UNIQUE NOT NULL,
      about TEXT DEFAULT 'Hey there! I am using WhatsApp.',
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("🧱 'userinfo' table created");
};
export const createChatsTable = async (db) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      profilePic TEXT,
      name TEXT NOT NULL,
      description TEXT,
      unseenCount INTEGER DEFAULT 0,
      lastMessage TEXT,
      lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
      isGroup BOOLEAN DEFAULT 0,
      members TEXT DEFAULT '[]',
      calling TEXT DEFAULT '[]'  -- this will store array of { mode, type, time } as a JSON string
    );
  `);
  console.log("💬 'chats' table created");
};


export const createPendingSyncTable = async (db) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pending_sync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      senderId TEXT NOT NULL,
      isGroup BOOLEAN DEFAULT 0,
      receiverId TEXT NOT NULL,
      status TEXT DEFAULT 'pending'
    );
  `);
  console.log("🧱 'pending_sync' table created with updated fields");
};


// Optional: bundle all in one if needed
export const createAllTables = async (db) => {
  await createUserInfoTable(db);
  await createPendingSyncTable(db);
  await createChatsTable(db)
  console.log("Table Creation Completed");
};
