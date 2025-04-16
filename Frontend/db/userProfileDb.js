// crudOperations.js
import { getDB, initDatabase } from "./AllDatabase";

// CRUD operations for userinfo table

export const createUser = (username, phone, avatar, status,userId) => {
    console.log("Creating user:", username, phone, avatar, status,userId);
  const db = getDB();
  if(!db){
    const setup=async()=>{
        db=await initDatabase();
    }
    setup()
  }
  console.log(db, "db")
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO userinfo (id,username, phone, avatar, status,userId) VALUES (?, ?, ?, ?);',
      [userId,username, phone, avatar, status,userId],
      (_, result) => {
        console.log('User created:', result);
      },
      (_, error) => {
        console.error('Error creating user:', error);
        return false;
      }
    );
  });
};

export const getAllUser = () => {
    console.log("Fetching all users");
  const db = getDB();
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM userinfo;',
      [],
      (_, { rows }) => {
        console.log('Fetched user:', rows._array);
      },
      (_, error) => {
        console.error('Error fetching user:', error);
        return false;
      }
    );
  });
};

export const updateUser = (id, username, phone, avatar, status) => {
  const db = getDB();
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE userinfo SET username = ?, phone = ?, avatar = ?, status = ? WHERE id = ?;',
      [username, phone, avatar, status, id],
      (_, result) => {
        console.log('User updated:', result);
      },
      (_, error) => {
        console.error('Error updating user:', error);
        return false;
      }
    );
  });
};

export const deleteUser = (id) => {
  const db = getDB();
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM userinfo WHERE id = ?;',
      [id],
      (_, result) => {
        console.log('User deleted:', result);
      },
      (_, error) => {
        console.error('Error deleting user:', error);
        return false;
      }
    );
  });
};

// CRUD operations for friend_list table

export const addFriend = (user_id, friend_id, friend_name, friend_avatar, friend_status) => {
  const db = getDB();
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO friend_list (user_id, friend_id, friend_name, friend_avatar, friend_status) VALUES (?, ?, ?, ?, ?);',
      [user_id, friend_id, friend_name, friend_avatar, friend_status],
      (_, result) => {
        console.log('Friend added:', result);
      },
      (_, error) => {
        console.error('Error adding friend:', error);
        return false;
      }
    );
  });
};

export const getFriends = (user_id) => {
  const db = getDB();
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM friend_list WHERE user_id = ?;',
      [user_id],
      (_, { rows }) => {
        console.log('Fetched friends:', rows._array);
      },
      (_, error) => {
        console.error('Error fetching friends:', error);
        return false;
      }
    );
  });
};

export const removeFriend = (user_id, friend_id) => {
  const db = getDB();
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM friend_list WHERE user_id = ? AND friend_id = ?;',
      [user_id, friend_id],
      (_, result) => {
        console.log('Friend removed:', result);
      },
      (_, error) => {
        console.error('Error removing friend:', error);
        return false;
      }
    );
  });
};
