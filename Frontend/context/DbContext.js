// DatabaseContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase } from '../database/AllDatabase';

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({ children }) => {
  const [dbInstance, setDbInstance] = useState(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const db = await initDatabase();
        console.log('✅ DB initialized:', db);
        setDbInstance(db);
      } catch (error) {
        console.error('❌ Failed to initialize DB:', error);
      }
    };
    setup();
  }, []);

  useEffect(() => {
    if (dbInstance) {
      console.log('🔄 DB instance updated:', dbInstance);
    }
  }, [dbInstance]);

  if (!dbInstance) {
    return null; 
  }

  return (
    <DatabaseContext.Provider value={dbInstance}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('❌ useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
