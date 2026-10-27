/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_DEMO_DATA } from '../data/initialData.ts';
import { AppStateData } from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const JSON_DB_PATH = path.join(DATA_DIR, 'ruangmuda.json');

// Ensure database directory exists
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Initializes the JSON database.
 * If the JSON file does not exist, it seeds it with initial demo data.
 */
export function initJsonDatabase(): AppStateData {
  ensureDataDir();

  if (!fs.existsSync(JSON_DB_PATH)) {
    console.log(`[JSON DB] Initializing fresh JSON database at ${JSON_DB_PATH}`);
    writeJsonDatabase(INITIAL_DEMO_DATA);
    return INITIAL_DEMO_DATA;
  }

  try {
    const raw = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions)) {
      console.warn('[JSON DB] Invalid structure found, re-seeding with initial data');
      writeJsonDatabase(INITIAL_DEMO_DATA);
      return INITIAL_DEMO_DATA;
    }
    return parsed;
  } catch (err) {
    console.error('[JSON DB] Error reading JSON database, re-seeding:', err);
    writeJsonDatabase(INITIAL_DEMO_DATA);
    return INITIAL_DEMO_DATA;
  }
}

/**
 * Read the entire database state from the JSON file.
 */
export function readJsonDatabase(): AppStateData {
  ensureDataDir();
  try {
    if (fs.existsSync(JSON_DB_PATH)) {
      const raw = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[JSON DB] Failed to read JSON file:', err);
  }
  return initJsonDatabase();
}

/**
 * Atomic write to JSON database file with formatting and timestamp update.
 */
export function writeJsonDatabase(data: AppStateData): void {
  ensureDataDir();
  data.lastUpdated = new Date().toISOString();

  const tempPath = `${JSON_DB_PATH}.tmp`;
  const serialized = JSON.stringify(data, null, 2);

  // Write to temporary file first then atomic rename
  fs.writeFileSync(tempPath, serialized, 'utf-8');
  fs.renameSync(tempPath, JSON_DB_PATH);
}

/**
 * Reset JSON database back to demo initial state.
 */
export function resetJsonDatabase(): AppStateData {
  writeJsonDatabase(INITIAL_DEMO_DATA);
  return readJsonDatabase();
}

/**
 * Clear data for real village input.
 */
export function clearJsonDatabase(user = 'Administrator', role = 'admin'): AppStateData {
  const emptyState: AppStateData = {
    initialBalance: 0,
    isDemoMode: false,
    lastUpdated: new Date().toISOString(),
    transactions: [],
    contributions: [],
    families: [],
    members: [],
    announcements: [],
    events: [],
    workPrograms: [],
    inventory: [],
    umkm: [],
    documents: [],
    auditLogs: [
      {
        id: 'log-clear-' + Date.now(),
        timestamp: new Date().toISOString(),
        user,
        role: role as any,
        action: 'Pembersihan Data',
        details: 'Data simulasi DEMO dikosongkan pada basis data JSON. Memulai pencatatan data riil desa.',
      },
    ],
  };
  writeJsonDatabase(emptyState);
  return emptyState;
}

/**
 * Generic collection CRUD helper: Read collection
 */
export function getJsonCollection<K extends keyof AppStateData>(collectionName: K): AppStateData[K] {
  const state = readJsonDatabase();
  return state[collectionName];
}

/**
 * Generic collection CRUD helper: Create an item
 */
export function createJsonItem(collectionName: string, item: any): any {
  const state = readJsonDatabase();
  const list = (state as any)[collectionName];
  if (!Array.isArray(list)) {
    throw new Error(`Koleksi ${collectionName} bukan array di basis data JSON`);
  }

  if (!item.id) {
    item.id = `${collectionName}-${Date.now()}`;
  }

  list.unshift(item);
  state.auditLogs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    user: 'Petugas Desa',
    role: 'pengurus',
    action: `Tambah Data ${collectionName}`,
    details: `ID: ${item.id} berhasil ditambahkan ke JSON database.`,
  });

  writeJsonDatabase(state);
  return item;
}

/**
 * Generic collection CRUD helper: Update an item
 */
export function updateJsonItem(collectionName: string, id: string, updatedFields: any): any {
  const state = readJsonDatabase();
  const list = (state as any)[collectionName];
  if (!Array.isArray(list)) {
    throw new Error(`Koleksi ${collectionName} bukan array di basis data JSON`);
  }

  const idx = list.findIndex((x: any) => x.id === id);
  if (idx === -1) {
    throw new Error(`Item dengan ID ${id} tidak ditemukan di ${collectionName}`);
  }

  list[idx] = { ...list[idx], ...updatedFields };
  state.auditLogs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    user: 'Petugas Desa',
    role: 'pengurus',
    action: `Ubah Data ${collectionName}`,
    details: `ID: ${id} diperbarui pada JSON database.`,
  });

  writeJsonDatabase(state);
  return list[idx];
}

/**
 * Generic collection CRUD helper: Delete an item
 */
export function deleteJsonItem(collectionName: string, id: string): boolean {
  const state = readJsonDatabase();
  const list = (state as any)[collectionName];
  if (!Array.isArray(list)) {
    throw new Error(`Koleksi ${collectionName} bukan array di basis data JSON`);
  }

  const initialLen = list.length;
  (state as any)[collectionName] = list.filter((x: any) => x.id !== id);

  if ((state as any)[collectionName].length === initialLen) {
    return false;
  }

  state.auditLogs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    user: 'Petugas Desa',
    role: 'admin',
    action: `Hapus Data ${collectionName}`,
    details: `ID: ${id} dihapus dari JSON database.`,
  });

  writeJsonDatabase(state);
  return true;
}

/**
 * Returns detailed JSON database statistics
 */
export function getJsonDatabaseStats() {
  const state = readJsonDatabase();
  let fileSize = '0 KB';
  let lastMtime = state.lastUpdated || new Date().toISOString();

  try {
    if (fs.existsSync(JSON_DB_PATH)) {
      const stats = fs.statSync(JSON_DB_PATH);
      const kb = (stats.size / 1024).toFixed(2);
      fileSize = `${kb} KB (${stats.size.toLocaleString('id-ID')} bytes)`;
      lastMtime = stats.mtime.toISOString();
    }
  } catch (err) {
    console.warn('[JSON DB] Could not read file stats:', err);
  }

  return {
    engine: 'JSON File-Based Database (Native ACID JSON Store)',
    dbFile: 'data/ruangmuda.json',
    format: 'Pretty-printed UTF-8 JSON with Atomic Rename',
    status: 'CONNECTED & ACTIVE',
    fileSize,
    lastModified: lastMtime,
    tables: {
      transactions: state.transactions.length,
      members: state.members.length,
      contributions: state.contributions.length,
      families: state.families.length,
      announcements: state.announcements.length,
      events: state.events.length,
      work_programs: state.workPrograms.length,
      inventory: state.inventory.length,
      umkm: state.umkm.length,
      documents: state.documents.length,
      audit_logs: state.auditLogs.length,
    },
  };
}
