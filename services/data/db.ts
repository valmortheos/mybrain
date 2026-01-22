// services/data/db.ts
import { AppBackupData } from '../../types';

const DB_NAME = 'MyBrainDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const KEY_ID = 'current_session';

/**
 * Utilitas wrapper native IndexedDB yang ringan.
 */
class LocalDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported");
        resolve(); // Fallback gracefully if needed
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Database error:", (event.target as IDBOpenDBRequest).error);
        reject("Gagal membuka database");
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveState(data: Partial<AppBackupData>): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      // Selalu simpan dengan ID yang sama untuk "Current Session"
      const request = store.put({ id: KEY_ID, ...data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Gagal menyimpan data");
    });
  }

  async loadState(): Promise<AppBackupData | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY_ID);

      request.onsuccess = () => {
        resolve(request.result as AppBackupData || null);
      };
      request.onerror = () => reject("Gagal memuat data");
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Gagal menghapus data");
    });
  }
}

export const db = new LocalDatabase();