// crud.js
import { useDatabase } from "../context/DbContext";
import { getDB, initDatabase } from "./AllDatabase";
import { createChatsTable } from "./tables";

export const addUser = async (user) => {
  console.log(user)

  try {
    console.log("👤 Adding user:", user);
    console.log("📦 DB Instance:", db);

    // Ensure updated table exists
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS userinfo (
        id TEXT PRIMARY KEY,
        profilePic TEXT,
        userName TEXT NOT NULL,
        fullName TEXT NOT NULL,
        about TEXT DEFAULT 'Hey there! I am using WhatsApp.',
        Chats TEXT DEFAULT '[]',
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);


    // Prepare INSERT statement
    const insertStatement = await db.prepareAsync(
      `INSERT INTO userinfo (id, profilePic, userName,fullName, about, Chats)
       VALUES ($id, $profilePic,$fullName, $userName, $about, $Chats)`
    );

    await insertStatement.executeAsync({
      $id: user._id,
      $profilePic: user.profilePic || '',
      $userName: user.username,
      $fullName: user.fullName,
      $about: user.about || 'Hey there! I am using WhatsApp.',
      $Chats: JSON.stringify(user.Chats || []),
    });

    await insertStatement.finalizeAsync();

    console.log("✅ User added to 'userinfo' table successfully.");
  } catch (error) {
    console.error("❌ Failed to add user to 'userinfo':", error);
  }
};




export const addfriends = async (props) => {
  console.log("Hello");
  const { _id, profilePic, description, name, lastMessage, Unseen, isGroup, Ids,db } = props;
  console.log(props);

  try {
    console.log("📦 DB Instance:", db);

    // ✅ Create the 'chats' table if it doesn't exist
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
        members TEXT DEFAULT '[]'
      );
    `);
    console.log("💬 'chats' table created");

    // ✅ Prepare and insert or replace the chat entry
    const insertStatement = await db.prepareAsync(`
      INSERT OR REPLACE INTO chats (
        id,
        profilePic,
        name,
        description,
        lastMessage,
        unseenCount,
        isGroup,
        members
      ) VALUES (
        $id,
        $profilePic,
        $name,
        $description,
        $lastMessage,
        $unseenCount,
        $isGroup,
        $members
      );
    `);

    await insertStatement.executeAsync({
      $id: _id,
      $profilePic: profilePic || '',
      $name: name,
      $description: description || '',
      $lastMessage: lastMessage || '',
      $unseenCount: Unseen || 0,
      $isGroup: isGroup ? 1 : 0,
      $members: JSON.stringify(Ids)
    });

    await insertStatement.finalizeAsync();

    console.log("✅ Friend/chat added successfully.");
  } catch (error) {
    console.error("❌ Failed to add friend to chats:", error);
  }
};

export const getAllChatsSorted = async (db) => {
  try {

    const results = await db.getAllAsync(`
      SELECT * FROM chats
      ORDER BY lastUpdated DESC;
    `);

    console.log("✅ Sorted chats retrieved:", results);
    return results;
  } catch (error) {
    console.error("❌ Failed to fetch sorted chats:", error);
    return [];
  }
};


export const deleteChat = async(id,db) => {

  console.log(db)
  try {
    const result = await db.execAsync(`
    DELETE FROM chats WHERE id = ?;
  `, [id]);

    console.log("🗑️ Chat deleted:", result);
    return true;
  } catch (error) {
    console.error("❌ Delete failed:", error);
    return false;
  }
};


// Get full user info by userId
export const getUserInfoById = async (userId,db) => {
  console.log("Fetching user info for ID:", userId);
  console.log("📦 DB Instance:", db);
  return await db.getFirstAsync(`SELECT * FROM userinfo WHERE id = ?`, [userId]);
};


// Update username, avatar, or both
export const updateUserProfile = async (userId, updates = {},db) => {
  const fields = [];
  const values = [];

  if (updates.username) {
    fields.push("username = ?");
    values.push(updates.username);
  }

  if (updates.avatar) {
    fields.push("avatar = ?");
    values.push(updates.avatar);
  }

  if (fields.length === 0) {
    console.warn("⚠️ No updates provided for updateUserProfile.");
    return;
  }

  values.push(userId);
  const query = `UPDATE userinfo SET ${fields.join(', ')} WHERE userId = ?`;
  await db.runAsync(query, values);
  console.log("✅ User profile updated");
};

// Update status/about text
export const updateUserStatus = async (userId, newStatus,db) => {
  await db.runAsync(
    `UPDATE userinfo SET status = ? WHERE userId = ?`,
    [newStatus, userId]
  );
  console.log("📝 Status updated");
};

// Update last seen
export const updateLastSeen = async (userId,db) => {
  await db.runAsync(
    `UPDATE userinfo SET last_seen = CURRENT_TIMESTAMP WHERE userId = ?`,
    [userId]
  );
  console.log("📅 Last seen updated");
};
