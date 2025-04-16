// crud.js
import { getDB, initDatabase } from "./AllDatabase";



export const addUser = async (user) => {
  initDatabase(); // Make sure DB is initialized

  try {
    console.log("👤 Adding user:", user);
    const db = getDB();
    console.log("📦 DB Instance:", db);

    // Ensure table exists
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

    // Check if user exists
    const existing = await db.getFirstAsync('SELECT * FROM userinfo WHERE id = ?', [user._id]);
    if (existing) {
      console.log('⚠️ User already exists:', existing);
      return;
    }

    // INSERT user without using transactionAsync
    const insertStatement = await db.prepareAsync(
      `INSERT INTO userinfo (id, username, phoneNumber, profilePic, userId)
       VALUES ($id, $username, $phoneNumber, $profilePic, $userId)`
    );

    await insertStatement.executeAsync({
      $id: user._id,
      $username: user.username,
      $phoneNumber: user.phoneNumber,
      $profilePic: user.profilePic,
      $userId: user._id,
      $last_seen: new Date().toISOString(), // Set last_seen to current timestamp
    });

    await insertStatement.finalizeAsync();

    console.log("✅ User added to 'userinfo' table successfully.");
    return;
  } catch (error) {
    console.error("❌ Failed to add user to 'userinfo':", error);
    // return;
  }
};



// Get user by phone number
export const getUserByPhone = async (phone) => {
  const db = getDB();
  return await db.getFirstAsync(`SELECT * FROM userinfo WHERE phone = ?`, [phone]);
};

// Get full user info by userId
export const getUserInfoById = async (userId) => {
  const db = getDB();
  return await db.getFirstAsync(`SELECT * FROM userinfo WHERE userId = ?`, [userId]);
};


// Update username, avatar, or both
export const updateUserProfile = async (userId, updates = {}) => {
  const db = getDB();
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
export const updateUserStatus = async (userId, newStatus) => {
  const db = getDB();
  await db.runAsync(
    `UPDATE userinfo SET status = ? WHERE userId = ?`,
    [newStatus, userId]
  );
  console.log("📝 Status updated");
};

// Update last seen
export const updateLastSeen = async (userId) => {
  const db = getDB();
  await db.runAsync(
    `UPDATE userinfo SET last_seen = CURRENT_TIMESTAMP WHERE userId = ?`,
    [userId]
  );
  console.log("📅 Last seen updated");
};
