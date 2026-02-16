export function asStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function asNumberArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(Number).filter((item) => Number.isFinite(item));
  return String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}
