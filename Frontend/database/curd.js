// crud.js
import { getDB, initDatabase } from "./AllDatabase";
import { createChatsTable } from "./tables";


export const addUser = async (user) => {
  console.log(user)

  try {
    console.log("👤 Adding user:", user);
    const db = getDB();
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
  const { _id, profilePic,description, name, lastMessage, Unseen, isGroup } = props;

  try {
    const db = getDB();

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
        FOREIGN KEY (userId) REFERENCES userinfo(id) ON DELETE CASCADE
      );
    `);
    console.log("💬 'chats' table ensured");

    // const insertStatement = await db.prepareAsync(`
    //   INSERT OR REPLACE INTO chats (
    //     id,
    //     profilePic,
    //     name,
    //     description,
    //     lastMessage,
    //     unseenCount,
    //     isGroup
    //   ) VALUES (
    //     $id,
    //     $profilePic,
    //     $name,
    //     $description,
    //     $lastMessage,
    //     $unseenCount,
    //     $isGroup
    //   );
    // `);

    // await insertStatement.executeAsync({
    //   $id: _id,
    //   $profilePic: profilePic || '',
    //   $name: name,
    //   $description:description,
    //   $lastMessage: lastMessage || '',
    //   $unseenCount: Unseen || 0,
    //   $isGroup: isGroup ? 1 : 0
    // });

    console.log("✅ Friend/chat added successfully.");
  } catch (error) {
    console.error("❌ Failed to add friend to chats:", error);
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
  return await db.getFirstAsync(`SELECT * FROM userinfo WHERE id = ?`, [userId]);
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
