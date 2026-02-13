import { escapeHtml } from "../../services/security.js";

function badgeClass(severity) {
  if (severity === "critical" || severity === "crit") {
    return "crit";
  }
  if (severity === "warn" || severity === "medium") {
    return "warn";
  }
  return "ok";
}

function renderImpactBadge(impact) {
  const normalized = String(impact).toLowerCase();
  const tone = normalized === "critical" || normalized === "high" ? "crit" : normalized === "medium" ? "warn" : "ok";
  return `<span class="badge ${tone}">${escapeHtml(normalized)}</span>`;
}

export { badgeClass, renderImpactBadge };
