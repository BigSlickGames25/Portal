import { escapeHtml, safeText } from "../../services/security.js";
import { formatMetric } from "../formatters.js";

function deltaClass(deltaText) {
  if (String(deltaText).trim().startsWith("-")) {
    return "down";
  }
  return "up";
}

function renderKpiCards(kpis) {
  return kpis
    .map(
      (kpi) => `
      <article class="kpi-card">
        <p class="kpi-label">${escapeHtml(kpi.label)}</p>
        <p class="kpi-value js-count" data-value="${Number(kpi.value)}" data-format="${escapeHtml(kpi.format)}">0</p>
        <p class="kpi-footer"><span class="delta ${deltaClass(kpi.delta)}">${escapeHtml(kpi.delta)}</span> ${safeText(
        kpi.note
      )}</p>
      </article>
    `
    )
    .join("");
}

function animateCounters(root) {
  const targets = root.querySelectorAll(".js-count");
  const canQueryMotion = typeof window.matchMedia === "function";
  const motionOff = canQueryMotion ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  const raf = typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame.bind(window) : null;

  targets.forEach((target) => {
    const value = Number(target.getAttribute("data-value"));
    const format = target.getAttribute("data-format");
    if (motionOff || Number.isNaN(value) || !raf) {
      target.textContent = formatMetric(value, format);
      return;
    }

    const duration = 850;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const frame = from + (value - from) * eased;
      target.textContent = formatMetric(frame, format);
      if (progress < 1) {
        raf(tick);
      }
    };

    raf(tick);
  });
}

export { renderKpiCards, animateCounters };
