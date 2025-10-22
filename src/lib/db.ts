import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GenieDB extends DBSchema {
  documents: {
    key: string;
    value: {
      id: string;
      name: string;
      file: Blob;
      uploadedAt: string;
      userId: string;
    };
    indexes: { 'by-user': string };
  };
  chatMessages: {
    key: string;
    value: {
      id: string;
      sessionId: string;
      role: 'user' | 'model';
      content: string;
      timestamp: string;
      userId: string;
    };
    indexes: { 'by-session': string; 'by-user': string };
  };
}

let dbInstance: IDBPDatabase<GenieDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<GenieDB>('genie-guiado-db', 1, {
    upgrade(db) {
      // Documents store
      const docStore = db.createObjectStore('documents', { keyPath: 'id' });
      docStore.createIndex('by-user', 'userId');

      // Chat messages store
      const chatStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
      chatStore.createIndex('by-session', 'sessionId');
      chatStore.createIndex('by-user', 'userId');
    },
  });

  return dbInstance;
}

// Document operations
export async function saveDocument(doc: GenieDB['documents']['value']) {
  const db = await getDB();
  await db.add('documents', doc);
}

export async function getDocuments(userId: string) {
  const db = await getDB();
  return db.getAllFromIndex('documents', 'by-user', userId);
}

export async function deleteDocument(id: string) {
  const db = await getDB();
  await db.delete('documents', id);
}

// Chat message operations
export async function saveChatMessage(message: GenieDB['chatMessages']['value']) {
  const db = await getDB();
  await db.add('chatMessages', message);
}

export async function getChatMessages(sessionId: string) {
  const db = await getDB();
  return db.getAllFromIndex('chatMessages', 'by-session', sessionId);
}

export async function getUserChatSessions(userId: string) {
  const db = await getDB();
  const messages = await db.getAllFromIndex('chatMessages', 'by-user', userId);
  const sessions = new Set(messages.map(m => m.sessionId));
  return Array.from(sessions);
}
