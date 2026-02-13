import { escapeHtml } from "../../services/security.js";
import { compactFormatter, preciseCurrencyFormatter, percentFormatter } from "../formatters.js";

function titleCase(value = "") {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderDetail(game) {
  return `
    <h3>${escapeHtml(game.name)}</h3>
    <p class="panel-subtitle">${escapeHtml(game.summary)}</p>
    <div class="detail-grid">
      <div class="stat-box"><p>Lifecycle</p><strong>${escapeHtml(titleCase(game.lifecycle))}</strong></div>
      <div class="stat-box"><p>Genre</p><strong>${escapeHtml(game.genre)}</strong></div>
      <div class="stat-box"><p>DAU</p><strong>${compactFormatter.format(game.dau)}</strong></div>
      <div class="stat-box"><p>ARPDAU</p><strong>${preciseCurrencyFormatter.format(game.arpdau)}</strong></div>
      <div class="stat-box"><p>D30 Retention</p><strong>${percentFormatter.format(game.d30)}%</strong></div>
      <div class="stat-box"><p>Platforms</p><strong>${escapeHtml(game.platforms)}</strong></div>
      <div class="stat-box"><p>Last Patch</p><strong>${escapeHtml(game.lastPatch)}</strong></div>
      <div class="stat-box"><p>Current Version</p><strong>${escapeHtml(game.version)}</strong></div>
    </div>
    <h4>Tags</h4>
    <ul class="pill-list">${game.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
    <h4>Roadmap</h4>
    <ul class="list">
      ${game.roadmap.map((roadmapItem) => `<li class="list-item"><p>${escapeHtml(roadmapItem)}</p></li>`).join("")}
    </ul>
  `;
}

export { renderDetail };
