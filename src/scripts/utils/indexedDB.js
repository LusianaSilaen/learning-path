const dbName = 'storiesDB';
const storeName = 'stories';

// Buka database IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      store.createIndex('title', 'title', { unique: false });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Simpan cerita baru ke IndexedDB
export function saveStory(story) {
  return openDB().then((db) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.add(story);
    return tx.complete;
  });
}

// Ambil semua cerita dari IndexedDB
export function getStories() {
  return openDB().then((db) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.getAll();
  });
}

// Hapus cerita dari IndexedDB
export function deleteStory(id) {
  return openDB().then((db) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);
    return tx.complete;
  });
}
