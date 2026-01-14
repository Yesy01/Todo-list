const KEY = "todo_app_state_v1";

export function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch {
    return false;
  }
}

export function saveState(state) {
  if (!storageAvailable("localStorage")) return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadState() {
  if (!storageAvailable("localStorage")) return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearState() {
  if (!storageAvailable("localStorage")) return;
  localStorage.removeItem(KEY);
}
