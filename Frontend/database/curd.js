// crud.js
import { useDatabase } from "../context/DbContext";
import { getDB, initDatabase } from "./AllDatabase";
import { createChatsTable } from "./tables";

// Add a new user to the 'userinfo' table
export const addUser = async (user) => {
  try {
    console.log("👤 Adding user:", user);
    console.log("📦 DB Instance:", db);

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

    const insertStatement = await db.prepareAsync(`
      INSERT OR REPLACE INTO userinfo (id, profilePic, userName, fullName, about, Chats)
      VALUES ($id, $profilePic, $userName, $fullName, $about, $Chats)
    `);

    await insertStatement.executeAsync({
      $id: user._id,
      $profilePic: user.profilePic || '',
      $userName: user.username,
      $fullName: user.fullName,
      $about: user.about || 'Hey there! I am using WhatsApp.',
      $Chats: JSON.stringify(user.Chats || [])
    });

    await insertStatement.finalizeAsync();
    console.log("✅ User added to 'userinfo' table successfully.");
  } catch (error) {
    console.error("❌ Failed to add user to 'userinfo':", error);
  }
};

// Add a new chat/friend to the 'chats' table
export const addFriends = async (props) => {
  const {
    _id,
    profilePic,
    description,
    name,
    lastMessage,
    Unseen,
    isGroup,
    Ids,
    db: passedDb
  } = props;

  const db = passedDb || getDB();

  try {
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

// Fetch all chats sorted by lastUpdated
export const getAllChatsSorted = async (db = getDB()) => {
  try {
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

// Delete a chat/friend by ID
// Delete a chat/friend by ID
// Delete a chat/friend by ID
export const deleteFriend = async (id, db = getDB()) => {
  try {
    const result = await db.runAsync(
      `DELETE FROM chats WHERE id = ?;`, [id]
    );

    // If result changes is 0, no rows were deleted, so the chat doesn't exist in the database
    if (result.changes === 0) {
      console.warn(`No chat with ID ${id} found to delete.`);
      return false; // Return false if nothing was deleted
    }

    console.log("🗑️ Friend/chat deleted successfully:", result);
    return true;
  } catch (error) {
    console.error("❌ Delete failed:", error);
    return false; // Return false on failure
  }
};



// Get full user info by userId
export const getUserInfoById = async (userId, db = getDB()) => {
  try {
    const result = await db.getFirstAsync(
      `SELECT * FROM userinfo WHERE id = ?`,
      [userId]
    );
    return result;
  } catch (error) {
    console.error("❌ Failed to fetch user info:", error);
    return null;
  }
};

// Update username and/or profilePic
export const updateUserProfile = async (userId, updates = {}, db = getDB()) => {
  const fields = [];
  const values = [];

  if (updates.userName) {
    fields.push("userName = ?");
    values.push(updates.userName);
  }

  if (updates.profilePic) {
    fields.push("profilePic = ?");
    values.push(updates.profilePic);
  }

  if (fields.length === 0) {
    console.warn("⚠️ No updates provided for updateUserProfile.");
    return;
  }

  values.push(userId);
  const query = `UPDATE userinfo SET ${fields.join(', ')} WHERE id = ?`;
  await db.runAsync(query, values);
  console.log("✅ User profile updated");
};

// Update user's status/about
export const updateUserStatus = async (userId, newStatus, db = getDB()) => {
  await db.runAsync(
    `UPDATE userinfo SET about = ? WHERE id = ?`,
    [newStatus, userId]
  );
  console.log("📝 Status updated");
};

// Update last seen timestamp
export const updateLastSeen = async (userId, db = getDB()) => {
  await db.runAsync(
    `UPDATE userinfo SET last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
    [userId]
  );
  console.log("📅 Last seen updated");
};
