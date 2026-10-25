// Random ID kept in the browser. Not derived from any personal/device info.
const KEY = "gfg_orientation_device_id";
const MARKED_KEY = "gfg_orientation_marked";

function randomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID().replace(/-/g, "");
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (some in-app browsers): fall back to a per-load ID.
    return randomId();
  }
}

export function wasMarkedBefore() {
  try {
    return localStorage.getItem(MARKED_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberMarked() {
  try {
    localStorage.setItem(MARKED_KEY, "1");
  } catch {
    /* ignore */
  }
}
