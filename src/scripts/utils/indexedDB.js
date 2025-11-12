const dbName = 'storiesDB';
const storeName = 'stories';

// Buka database IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    // Jika versi database diupgrade, buat object store baru
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      store.createIndex('title', 'title', { unique: false });
    };

    // Jika berhasil membuka database
    request.onsuccess = () => resolve(request.result);

    // Tangani error saat membuka database
    request.onerror = (e) => reject(`Failed to open DB: ${e.target.error}`);
  });
}

// Simpan cerita baru ke IndexedDB
export function saveStory(story) {
  return openDB()
    .then((db) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.add(story);
      return tx.complete;
    })
    .catch((error) => console.error('Error saving story:', error));
}

// Ambil semua cerita dari IndexedDB
export function getStories() {
  return openDB()
    .then((db) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return store.getAll();  // Mengambil semua cerita
    })
    .catch((error) => {
      console.error('Error fetching stories:', error);
      return [];
    });
}

// Ambil cerita berdasarkan ID
export function getStoryById(id) {
  return openDB()
    .then((db) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return store.get(id);  // Mengambil cerita berdasarkan ID
    })
    .catch((error) => {
      console.error(`Error fetching story with ID ${id}:`, error);
      return null;
    });
}

// Hapus cerita dari IndexedDB berdasarkan ID
export function deleteStory(id) {
  return openDB()
    .then((db) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(id);  // Menghapus cerita berdasarkan ID
      return tx.complete;
    })
    .catch((error) => console.error(`Error deleting story with ID ${id}:`, error));
}
