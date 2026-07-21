export interface PersistedTab {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
}

export interface PersistedEditorState {
  tabs: PersistedTab[];
  activeTabId: string;
  wordWrap: boolean;
}

const databaseName = "tabpad";
const storeName = "editor";
const stateKey = "current";
export const legacyStorageKey = "tabpad.editorState.v2";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadEditorState(): Promise<PersistedEditorState | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(stateKey);
    request.onsuccess = () =>
      resolve((request.result as PersistedEditorState) ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export async function saveEditorState(state: PersistedEditorState) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(state, stateKey);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export function readLegacyState(): PersistedEditorState | null {
  try {
    const raw = localStorage.getItem(legacyStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedEditorState>;
    if (!Array.isArray(parsed.tabs) || typeof parsed.activeTabId !== "string")
      return null;
    return {
      tabs: parsed.tabs,
      activeTabId: parsed.activeTabId,
      wordWrap: true,
    };
  } catch {
    return null;
  }
}

export function finishLegacyMigration() {
  localStorage.removeItem(legacyStorageKey);
}
