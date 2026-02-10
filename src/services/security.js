const escapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => escapeMap[char]);
}

export function safeText(value, fallback = "N/A") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return escapeHtml(value);
}

export function clampNumber(value, min, max) {
  if (Number.isNaN(Number(value))) {
    return min;
  }
  return Math.min(Math.max(Number(value), min), max);
}
