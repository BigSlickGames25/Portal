import { renderDetail } from "../components/gameDetail.js?v=mini-portal-20260213";
import { compactFormatter } from "../formatters.js";
import { escapeHtml } from "../../services/security.js";

function titleCase(value = "") {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getPlatformOptions(games) {
  const options = new Map();

  games.forEach((game) => {
    String(game.platforms ?? "")
      .split(",")
      .map((platform) => platform.trim())
      .filter(Boolean)
      .forEach((platform) => {
        const key = platform.toLowerCase();
        if (!options.has(key)) {
          options.set(key, platform);
        }
      });
  });

  return Array.from(options.entries()).sort((a, b) => a[1].localeCompare(b[1]));
}

function getStatusCounts(games) {
  return games.reduce(
    (counts, game) => {
      const key = game.lifecycle ?? "";
      if (Object.prototype.hasOwnProperty.call(counts, key)) {
        counts[key] += 1;
      }
      return counts;
    },
    { live: 0, growth: 0, stabilize: 0, alpha: 0 }
  );
}

const libraryScreen = {
  title: "Games Catalog",
  kicker: "Portfolio Index",
  render(ctx) {
    const games = Array.isArray(ctx.data.gameLibrary) ? ctx.data.gameLibrary : [];
    const selected = games[0];
    const platformOptions = getPlatformOptions(games);
    const statusCounts = getStatusCounts(games);

    return `
      <section class="screen-grid">
        <article class="panel span-12" data-layout="library-panel">
          <h3>Games Catalog</h3>
          <p class="panel-subtitle">Browse titles, filter by lifecycle and platform, then inspect roadmap and health metrics.</p>
          <div class="catalog-stats">
            <div class="catalog-stat"><p>Total Titles</p><strong>${games.length}</strong></div>
            <div class="catalog-stat"><p>Live</p><strong>${statusCounts.live}</strong></div>
            <div class="catalog-stat"><p>Growth</p><strong>${statusCounts.growth}</strong></div>
            <div class="catalog-stat"><p>Stabilize</p><strong>${statusCounts.stabilize}</strong></div>
            <div class="catalog-stat"><p>Alpha</p><strong>${statusCounts.alpha}</strong></div>
          </div>
          <div class="library-controls" data-layout="library-controls">
            <input id="library-search" type="search" placeholder="Search game, genre, tag...">
            <select id="library-status">
              <option value="all">All statuses</option>
              <option value="live">Live</option>
              <option value="growth">Growth</option>
              <option value="stabilize">Stabilize</option>
              <option value="alpha">Alpha</option>
            </select>
            <select id="library-platform">
              <option value="all">All platforms</option>
              ${platformOptions
                .map(
                  ([key, label]) => `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`
                )
                .join("")}
            </select>
            <select id="library-sort">
              <option value="name">Sort: Name (A-Z)</option>
              <option value="dau">Sort: DAU (High-Low)</option>
              <option value="patch">Sort: Last Patch (Newest)</option>
            </select>
          </div>
          <p id="library-results" class="library-results">${games.length} titles</p>
          <div class="library-layout">
            <div class="library-list" id="library-list" data-layout="library-list">
              ${games
                .map(
                  (game, index) => `
                  <button
                    class="game-card ${index === 0 ? "is-active" : ""}"
                    type="button"
                    data-game-id="${escapeHtml(game.id)}"
                    data-game-name="${escapeHtml(game.name)}"
                    data-game-genre="${escapeHtml(game.genre)}"
                    data-game-tags="${escapeHtml(game.tags.join(" ").toLowerCase())}"
                    data-game-status="${escapeHtml(game.lifecycle)}"
                    data-game-platforms="${escapeHtml(String(game.platforms ?? "").toLowerCase())}"
                    data-game-dau="${Number(game.dau) || 0}"
                    data-game-patch="${escapeHtml(String(game.lastPatch ?? ""))}"
                  >
                    <div class="game-card-head">
                      <h4>${escapeHtml(game.name)}</h4>
                      <span class="status-pill status-${escapeHtml(game.lifecycle)}">${escapeHtml(
                        titleCase(game.lifecycle)
                      )}</span>
                    </div>
                    <p>${escapeHtml(game.genre)} &middot; ${escapeHtml(game.platforms)}</p>
                    <div class="game-card-metrics">
                      <span>DAU ${compactFormatter.format(game.dau)}</span>
                      <span>Patch ${escapeHtml(game.lastPatch)}</span>
                    </div>
                  </button>
                `
                )
                .join("")}
              <p id="library-empty" class="empty-note is-hidden">No titles match this filter.</p>
            </div>
            <div class="detail-panel" id="library-detail" data-layout="library-detail">${
              selected ? renderDetail(selected) : '<p class="empty-note">No games available.</p>'
            }</div>
          </div>
        </article>
      </section>
    `;
  },
  init(root, ctx) {
    const games = Array.isArray(ctx.data.gameLibrary) ? ctx.data.gameLibrary : [];
    const searchInput = root.querySelector("#library-search");
    const statusSelect = root.querySelector("#library-status");
    const platformSelect = root.querySelector("#library-platform");
    const sortSelect = root.querySelector("#library-sort");
    const listRoot = root.querySelector("#library-list");
    const detailRoot = root.querySelector("#library-detail");
    const emptyState = root.querySelector("#library-empty");
    const resultsNode = root.querySelector("#library-results");
    const gameCards = Array.from(root.querySelectorAll(".game-card"));

    if (!searchInput || !statusSelect || !platformSelect || !sortSelect || !listRoot || !detailRoot || !emptyState) {
      return;
    }

    let activeId = gameCards[0]?.dataset.gameId ?? null;
    let activeTab = "overview";

    const setActive = (gameId) => {
      activeId = gameId;
      activeTab = "overview";
      gameCards.forEach((card) => {
        card.classList.toggle("is-active", card.dataset.gameId === gameId);
      });
      const game = games.find((item) => item.id === gameId);
      if (game) {
        detailRoot.innerHTML = renderDetail(game, activeTab);
      }
    };

    const renderActiveDetail = () => {
      const game = games.find((item) => item.id === activeId);
      if (game) {
        detailRoot.innerHTML = renderDetail(game, activeTab);
      }
    };

    const parsePatchDate = (value) => {
      const timestamp = Date.parse(value ?? "");
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    const sortVisibleCards = (cards, sortMode) => {
      cards.sort((left, right) => {
        if (sortMode === "dau") {
          return Number(right.dataset.gameDau ?? 0) - Number(left.dataset.gameDau ?? 0);
        }
        if (sortMode === "patch") {
          return parsePatchDate(right.dataset.gamePatch) - parsePatchDate(left.dataset.gamePatch);
        }
        return (left.dataset.gameName ?? "").localeCompare(right.dataset.gameName ?? "");
      });
    };

    const applyFilters = () => {
      const query = searchInput.value.trim().toLowerCase();
      const status = statusSelect.value;
      const platform = platformSelect.value;
      const sortMode = sortSelect.value;
      const visibleCards = [];

      gameCards.forEach((card) => {
        const haystack = [
          card.dataset.gameName ?? "",
          card.dataset.gameGenre ?? "",
          card.dataset.gameTags ?? "",
          card.dataset.gamePlatforms ?? ""
        ]
          .join(" ")
          .toLowerCase();
        const queryMatch = haystack.includes(query);
        const statusMatch = status === "all" || card.dataset.gameStatus === status;
        const platformMatch = platform === "all" || (card.dataset.gamePlatforms ?? "").includes(platform);
        const visible = queryMatch && statusMatch && platformMatch;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          visibleCards.push(card);
        }
      });

      sortVisibleCards(visibleCards, sortMode);
      gameCards.forEach((card) => {
        card.style.order = String(Number.MAX_SAFE_INTEGER);
      });
      visibleCards.forEach((card, index) => {
        card.style.order = String(index);
      });

      const visibleCount = visibleCards.length;
      if (resultsNode) {
        resultsNode.textContent = visibleCount === 1 ? "1 title" : `${visibleCount} titles`;
      }
      emptyState.classList.toggle("is-hidden", visibleCount > 0);

      if (visibleCount === 0) {
        detailRoot.innerHTML = '<p class="empty-note">No titles match your current filters.</p>';
        return;
      }

      const activeCard = visibleCards.find((card) => card.dataset.gameId === activeId);
      setActive((activeCard ?? visibleCards[0]).dataset.gameId);
    };

    listRoot.addEventListener("click", (event) => {
      const button = event.target.closest(".game-card");
      if (!button) {
        return;
      }
      setActive(button.dataset.gameId);
    });

    detailRoot.addEventListener("click", (event) => {
      const tabButton = event.target.closest("[data-mini-tab]");
      if (!tabButton) {
        return;
      }
      activeTab = tabButton.dataset.miniTab ?? "overview";
      renderActiveDetail();
    });

    searchInput.addEventListener("input", applyFilters);
    statusSelect.addEventListener("change", applyFilters);
    platformSelect.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);
    applyFilters();
  }
};

export { libraryScreen };
