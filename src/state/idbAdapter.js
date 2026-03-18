// src/state/idbAdapter.js
import { get, set } from "idb-keyval";

const PREFS_KEY = "sp:prefs";
const LOGS_KEY = "sp:logs";

export class IdbAdapter {
  async getPrefs() {
    return (await get(PREFS_KEY)) ?? {};
  }

  async setPrefs(partial) {
    const current = (await get(PREFS_KEY)) ?? {};
    const next = { ...current, ...partial, updatedAt: new Date().toISOString() };
    await set(PREFS_KEY, next);
  }

  async addLog(log) {
    const list = (await get(LOGS_KEY)) ?? [];
    list.push(log);
    await set(LOGS_KEY, list);
  }

  async getLogsByDate(dateISO) {
    const list = (await get(LOGS_KEY)) ?? [];
    return list.filter((l) => l.dateISO === dateISO);
  }

  async getLogsRange(startISO, endISO) {
    const list = (await get(LOGS_KEY)) ?? [];
    return list.filter((l) => l.dateISO >= startISO && l.dateISO <= endISO);
  }

  async deleteLog(id) {
    const list = (await get(LOGS_KEY)) ?? [];
    const next = list.filter((l) => l.id !== id);
    await set(LOGS_KEY, next);
  }
}
