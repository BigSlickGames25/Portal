import { escapeHtml } from "../../services/security.js";
import { compactFormatter, preciseCurrencyFormatter, percentFormatter } from "../formatters.js";

function titleCase(value = "") {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const tabLabels = {
  overview: "Overview",
  information: "Information",
  roadmap: "Roadmap"
};

function renderTabButtons(activeTab) {
  return Object.entries(tabLabels)
    .map(([tabId, label]) => {
      const active = tabId === activeTab;
      return `
        <button
          type="button"
          class="mini-tab ${active ? "is-active" : ""}"
          data-mini-tab="${tabId}"
          role="tab"
          aria-selected="${active ? "true" : "false"}"
        >
          ${escapeHtml(label)}
        </button>
      `;
    })
    .join("");
}

function renderInformationContent(game, activeTab) {
  if (activeTab === "roadmap") {
    return `
      <p class="panel-subtitle">Roadmap items for ${escapeHtml(game.name)}</p>
      <ul class="list">
        ${game.roadmap.map((roadmapItem) => `<li class="list-item"><p>${escapeHtml(roadmapItem)}</p></li>`).join("")}
      </ul>
    `;
  }

  if (activeTab === "information") {
    return `
      <div class="mini-info-grid">
        <div class="stat-box"><p>Lifecycle</p><strong>${escapeHtml(titleCase(game.lifecycle))}</strong></div>
        <div class="stat-box"><p>Genre</p><strong>${escapeHtml(game.genre)}</strong></div>
        <div class="stat-box"><p>Platforms</p><strong>${escapeHtml(game.platforms)}</strong></div>
        <div class="stat-box"><p>Current Version</p><strong>${escapeHtml(game.version)}</strong></div>
        <div class="stat-box"><p>Last Patch</p><strong>${escapeHtml(game.lastPatch)}</strong></div>
        <div class="stat-box"><p>Tags</p><strong>${escapeHtml(game.tags.join(", "))}</strong></div>
      </div>
    `;
  }

  return `
    <p class="panel-subtitle">${escapeHtml(game.summary)}</p>
    <h4>Tags</h4>
    <ul class="pill-list">${game.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
  `;
}

function renderDetail(game, activeTab = "overview") {
  return `
    <h3>${escapeHtml(game.name)}</h3>
    <div class="mini-portal">
      <div class="mini-tabs" role="tablist" aria-label="Game mini portal tabs">
        ${renderTabButtons(activeTab)}
      </div>
      <div class="mini-portal-grid">
        <section class="mini-information-section">
          <h4>Information Section</h4>
          ${renderInformationContent(game, activeTab)}
        </section>
        <aside class="mini-stats-window">
          <h4>Mini Stats Window</h4>
          <div class="mini-stats-grid">
            <div class="stat-box"><p>DAU</p><strong>${compactFormatter.format(game.dau)}</strong></div>
            <div class="stat-box"><p>ARPDAU</p><strong>${preciseCurrencyFormatter.format(game.arpdau)}</strong></div>
            <div class="stat-box"><p>D30 Retention</p><strong>${percentFormatter.format(game.d30)}%</strong></div>
            <div class="stat-box"><p>Lifecycle</p><strong>${escapeHtml(titleCase(game.lifecycle))}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  `;
}

export { renderDetail };
