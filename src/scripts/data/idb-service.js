// src/scripts/data/idb-service.js

import { openDB } from 'idb';

const DB_NAME = 'dicoding-story-app-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

/**
 * Membuka atau membuat database IndexedDB.
 * @returns {Promise<IDBDatabase>} Promise yang resolve dengan instance database.
 */
const openDatabase = () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Buat object store jika belum ada
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        // 'id' akan menjadi keyPath (kunci utama) untuk setiap objek cerita
        const store = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        // Anda bisa menambahkan index jika perlu untuk pencarian yang lebih efisien
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        console.log(`Object store "${OBJECT_STORE_NAME}" berhasil dibuat.`);
      }
    },
  });
};

/**
 * Menyimpan satu cerita ke IndexedDB.
 * Akan menimpa cerita jika ID sudah ada (perilaku 'put').
 * @param {object} story - Objek cerita yang akan disimpan.
 * @returns {Promise<string|number>} Promise yang resolve dengan ID cerita yang disimpan.
 */
const saveStoryToDB = async (story) => {
  if (!story || !story.id) {
    console.error('saveStoryToDB: Objek cerita atau ID cerita tidak valid.');
    throw new Error('Objek cerita atau ID cerita tidak valid untuk disimpan.');
  }
  const db = await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
  const store = tx.objectStore(OBJECT_STORE_NAME);
  const result = await store.put(story); // 'put' akan add atau update
  await tx.done; // Pastikan transaksi selesai
  console.log(`Cerita dengan ID "${story.id}" berhasil disimpan/diperbarui di IndexedDB.`);
  return result;
};

/**
 * Mengambil semua cerita dari IndexedDB.
 * @returns {Promise<Array<object>>} Promise yang resolve dengan array objek cerita.
 */
const getAllStoriesFromDB = async () => {
  const db = await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
  const store = tx.objectStore(OBJECT_STORE_NAME);
  const stories = await store.getAll();
  await tx.done;
  console.log(`Berhasil mengambil ${stories.length} cerita dari IndexedDB.`);
  return stories;
};

/**
 * Mengambil satu cerita berdasarkan ID dari IndexedDB.
 * @param {string} storyId - ID cerita yang akan diambil.
 * @returns {Promise<object|undefined>} Promise yang resolve dengan objek cerita atau undefined jika tidak ditemukan.
 */
const getStoryByIdFromDB = async (storyId) => {
  if (!storyId) {
    console.error('getStoryByIdFromDB: ID cerita tidak valid.');
    return undefined;
  }
  const db = await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
  const store = tx.objectStore(OBJECT_STORE_NAME);
  const story = await store.get(storyId);
  await tx.done;
  if (story) {
    console.log(`Cerita dengan ID "${storyId}" ditemukan di IndexedDB.`);
  } else {
    console.log(`Cerita dengan ID "${storyId}" tidak ditemukan di IndexedDB.`);
  }
  return story;
};

/**
 * Menghapus satu cerita berdasarkan ID dari IndexedDB.
 * @param {string} storyId - ID cerita yang akan dihapus.
 * @returns {Promise<void>}
 */
const deleteStoryFromDB = async (storyId) => {
  if (!storyId) {
    console.error('deleteStoryFromDB: ID cerita tidak valid.');
    throw new Error('ID cerita tidak valid untuk dihapus.');
  }
  const db = await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
  const store = tx.objectStore(OBJECT_STORE_NAME);
  await store.delete(storyId);
  await tx.done;
  console.log(`Cerita dengan ID "${storyId}" berhasil dihapus dari IndexedDB.`);
};

export {
  openDatabase,
  saveStoryToDB,
  getAllStoriesFromDB,
  getStoryByIdFromDB,
  deleteStoryFromDB,
};
