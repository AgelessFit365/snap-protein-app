// src/state/storage.js
import { IdbAdapter } from "./idbAdapter.js";

let adapter;

/**
 * Singleton accessor for whichever storage adapter we want to use.
 * For now: IndexedDB. Later we can swap in Supabase without touching Home.jsx.
 */
export function getStorage() {
  if (!adapter) {
    adapter = new IdbAdapter();
  }
  return adapter;
}
