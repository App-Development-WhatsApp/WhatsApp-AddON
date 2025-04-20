// crud.js
import { getDB } from "./AllDatabase";

// Add a new user to the 'userinfo' table
export const addUser = async (user) => {
  try {
    console.log("👤 Adding user:", user);
    const db=getDB();
    console.log("📦 DB Instance:", db);

    const insertStatement = await db.prepareAsync(`
      INSERT OR REPLACE INTO userinfo (id, profilePic, userName, fullName, about,phoneNumber)
      VALUES ($id, $profilePic, $userName, $fullName, $about,$phoneNumber)
    `);

    await insertStatement.executeAsync({
      $id: user._id,
      $profilePic: user.profilePic || '',
      $userName: user.username,
      $fullName: user.fullName,
      $phoneNumber:user.phoneNumber,
      $about: user.about || 'Hey there! I am using WhatsApp.',
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
  } = props;

  const db = getDB();

  try {
    console.log(props,"-----",db)
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
export const getAllChatsSorted = async () => {
  const db = getDB();
    try {
    const results = await db.getAllAsync(`
      SELECT * FROM chats
      ORDER BY lastUpdated DESC;
    `);
    // console.log("✅ Sorted chats retrieved:", results);
    return results;
  } catch (error) {
    console.error("❌ Failed to fetch sorted chats:", error);
    return [];
  }
};

export const getChatById = async (chatId) => {
  const db = getDB();
  try {
    const result = await db.getFirstAsync(`
      SELECT * FROM chats
      WHERE id = $id;
    `, { $id: chatId });

    if (result) {
      console.log("✅ Chat found:", result);
    } else {
      console.log("ℹ️ No chat found with id:", chatId);
    }

    return result;
  } catch (error) {
    console.error("❌ Failed to fetch chat by id:", error);
    return null;
  }
};



export const deleteFriend = async (id) => {
  const db = getDB();
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
export const getUserInfoById = async (userId) => {
  const db = getDB();
  // console.log(userId,"------------------------",db)
  // console.log(db,"instace------------------")
  try {
    const result = await db.getFirstAsync(
      `SELECT * FROM userinfo WHERE id = ?`,
      [userId]
    );
    // console.log("result->",result)
    return result;
  } catch (error) {
    console.error("❌ Failed to fetch user info:", error);
    return null;
  }
};

// Update username and/or profilePic
export const updateUserProfile = async (userId, updates = {}) => {
  const fields = [];
  const values = [];
  const db = getDB()

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
