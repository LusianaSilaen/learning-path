// src/scripts/utils/indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'berbagi-cerita-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

export async function saveStory(story) {
  if (!story || !story.id) {
    console.warn('Data story tidak valid untuk disimpan:', story);
    return;
  }
  const db = await dbPromise;
  await db.put(STORE_NAME, story);
  console.log('Story tersimpan di IndexedDB:', story);
}

export async function getStories() {
  const db = await dbPromise;
  const stories = await db.getAll(STORE_NAME);
  // pastikan SELALU array
  return Array.isArray(stories) ? stories : [];
}

export async function deleteStory(id) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
  console.log('Story dihapus dari IndexedDB, id:', id);
}
