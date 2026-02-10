import { renderBarChart, renderDonutChart, renderLineChart } from "./charts.js";
import { escapeHtml, safeText } from "../services/security.js";

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const preciseCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

function formatMetric(value, format) {
  if (format === "currency") {
    return currencyFormatter.format(value);
  }
  if (format === "percent") {
    return `${percentFormatter.format(value)}%`;
  }
  if (format === "percentPrecise") {
    return `${Number(value).toFixed(2)}%`;
  }
  if (format === "decimalCurrency") {
    return preciseCurrencyFormatter.format(value);
  }
  return compactFormatter.format(value);
}

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

function badgeClass(severity) {
  if (severity === "critical" || severity === "crit") {
    return "crit";
  }
  if (severity === "warn" || severity === "medium") {
    return "warn";
  }
  return "ok";
}

function toCalendarMap(events) {
  return events.reduce((map, event) => {
    if (!map[event.date]) {
      map[event.date] = [];
    }
    map[event.date].push(event);
    return map;
  }, {});
}

function monthMatrix(referenceDate) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const start = new Date(year, month, 1);
  const firstWeekday = start.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderCalendar(referenceDate, events) {
  const map = toCalendarMap(events);
  const cells = monthMatrix(referenceDate);
  const todayKey = formatDateKey(new Date());

  return cells
    .map((cell) => {
      if (!cell) {
        return `<div class="day-cell empty"></div>`;
      }
      const key = formatDateKey(cell);
      const hasToday = key === todayKey;
      const eventRows = (map[key] ?? [])
        .slice(0, 2)
        .map((event) => `<div class="calendar-event">${escapeHtml(event.title)}</div>`)
        .join("");
      return `
        <div class="day-cell ${hasToday ? "today" : ""}">
          <div class="day-number">${cell.getDate()}</div>
          ${eventRows}
        </div>
      `;
    })
    .join("");
}

function renderDetail(game) {
  return `
    <h3>${escapeHtml(game.name)}</h3>
    <p class="panel-subtitle">${escapeHtml(game.summary)}</p>
    <div class="detail-grid">
      <div class="stat-box"><p>Lifecycle</p><strong>${escapeHtml(game.lifecycle)}</strong></div>
      <div class="stat-box"><p>DAU</p><strong>${compactFormatter.format(game.dau)}</strong></div>
      <div class="stat-box"><p>ARPDAU</p><strong>${preciseCurrencyFormatter.format(game.arpdau)}</strong></div>
      <div class="stat-box"><p>D30 Retention</p><strong>${percentFormatter.format(game.d30)}%</strong></div>
      <div class="stat-box"><p>Platforms</p><strong>${escapeHtml(game.platforms)}</strong></div>
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

function renderImpactBadge(impact) {
  const normalized = String(impact).toLowerCase();
  const tone = normalized === "critical" || normalized === "high" ? "crit" : normalized === "medium" ? "warn" : "ok";
  return `<span class="badge ${tone}">${escapeHtml(normalized)}</span>`;
}

function renderSegmentLegend(segments) {
  return `
    <div class="chart-legend">
      ${segments
        .map(
          (segment) =>
            `<span class="legend-item"><span class="legend-dot" style="background:${segment.color};"></span>${escapeHtml(
              segment.label
            )} ${segment.value}%</span>`
        )
        .join("")}
    </div>
  `;
}

export function createScreens() {
  return {
    overview: {
      title: "Business Overview",
      kicker: "Studio Intelligence",
      render(ctx) {
        const releases = ctx.data.releaseCalendar.slice(0, 4);
        return `
          <div class="kpi-grid">${renderKpiCards(ctx.data.kpis)}</div>
          <section class="screen-grid">
            <article class="panel span-8">
              <h3>Revenue Momentum (12 months)</h3>
              <p class="panel-subtitle">Gross booking trend across all active titles</p>
              <div id="overview-revenue-chart" class="chart-canvas"></div>
            </article>
            <article class="panel span-4">
              <h3>User Growth</h3>
              <p class="panel-subtitle">Monthly active users</p>
              <div id="overview-users-chart" class="chart-canvas"></div>
            </article>
            <article class="panel span-6">
              <h3>Priority Alerts</h3>
              <ul class="list">
                ${ctx.data.alerts
                  .map(
                    (alert) => `
                    <li class="list-item">
                      <span class="badge ${badgeClass(alert.severity)}">${escapeHtml(alert.severity)}</span>
                      <h4>${escapeHtml(alert.title)}</h4>
                      <p>${escapeHtml(alert.message)}</p>
                    </li>
                  `
                  )
                  .join("")}
              </ul>
            </article>
            <article class="panel span-6">
              <h3>Upcoming Calendar</h3>
              <ul class="list">
                ${releases
                  .map(
                    (event) => `
                    <li class="list-item">
                      <h4>${escapeHtml(event.title)}</h4>
                      <p>${escapeHtml(event.date)} · ${escapeHtml(event.type)}</p>
                    </li>
                  `
                  )
                  .join("")}
              </ul>
            </article>
            <article class="panel span-12">
              <h3>Strategic Snapshot</h3>
              <div class="stats-grid">
                ${ctx.data.strategicStats
                  .map((stat) => `<div class="stat-box"><p>${escapeHtml(stat.label)}</p><strong>${escapeHtml(stat.value)}</strong></div>`)
                  .join("")}
              </div>
            </article>
          </section>
        `;
      },
      init(root, ctx) {
        renderLineChart(root.querySelector("#overview-revenue-chart"), ctx.data.revenueTrend, [
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb"
        ]);
        renderBarChart(root.querySelector("#overview-users-chart"), ctx.data.userTrend);
        animateCounters(root);
      }
    },
    finance: {
      title: "Finance and Economy",
      kicker: "Revenue, Spend, Chips",
      render(ctx) {
        const sinks = ctx.data.chipsEconomy.sinks;
        return `
          <section class="screen-grid">
            <article class="panel span-5">
              <h3>Spend Allocation (MTD)</h3>
              <div id="finance-spend-chart" class="chart-canvas"></div>
              <div class="chart-legend">
                ${ctx.data.spendBreakdown
                  .map(
                    (part) =>
                      `<span class="legend-item"><span class="legend-dot" style="background:${part.color};"></span>${escapeHtml(
                        part.label
                      )}</span>`
                  )
                  .join("")}
              </div>
            </article>
            <article class="panel span-7">
              <h3>Revenue vs Spend</h3>
              <p class="panel-subtitle">Revenue (blue) and operational spend (gold), values in thousands USD</p>
              <div id="finance-burn-chart" class="chart-canvas"></div>
            </article>
            <article class="panel span-6">
              <h3>Chip Economy Health</h3>
              <div class="stats-grid">
                <div class="stat-box"><p>Minted</p><strong>${compactFormatter.format(ctx.data.chipsEconomy.minted)}</strong></div>
                <div class="stat-box"><p>Redeemed</p><strong>${compactFormatter.format(ctx.data.chipsEconomy.redeemed)}</strong></div>
                <div class="stat-box"><p>Net Sink Rate</p><strong>${percentFormatter.format(
                  (ctx.data.chipsEconomy.redeemed / ctx.data.chipsEconomy.minted) * 100
                )}%</strong></div>
              </div>
              <div class="stack" style="margin-top:0.72rem;">
                ${sinks
                  .map(
                    (sink) => `
                    <div class="progress-item">
                      <div class="progress-head"><span>${escapeHtml(sink.label)}</span><span>${sink.value}%</span></div>
                      <div class="progress-track"><div class="progress-fill" style="width:${sink.value}%;"></div></div>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </article>
            <article class="panel span-6">
              <h3>Cost Center Ledger</h3>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Cost Center</th><th>Owner</th><th>Spend</th></tr>
                  </thead>
                  <tbody>
                    ${ctx.data.spendBreakdown
                      .map(
                        (part) => `
                        <tr>
                          <td>${escapeHtml(part.label)}</td>
                          <td>${escapeHtml(part.owner)}</td>
                          <td>${currencyFormatter.format(part.value)}</td>
                        </tr>
                      `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        `;
      },
      init(root, ctx) {
        renderDonutChart(root.querySelector("#finance-spend-chart"), ctx.data.spendBreakdown);
        renderBarChart(root.querySelector("#finance-burn-chart"), ctx.data.burnVsRevenue);
      }
    },
    users: {
      title: "User Analytics",
      kicker: "Acquisition and Retention",
      render(ctx) {
        return `
          <section class="screen-grid">
            <article class="panel span-6">
              <h3>Retention Funnel</h3>
              <div class="stack">
                ${ctx.data.retention
                  .map(
                    (retentionPoint) => `
                    <div class="progress-item">
                      <div class="progress-head"><span>${escapeHtml(retentionPoint.label)}</span><span>${retentionPoint.value}%</span></div>
                      <div class="progress-track"><div class="progress-fill" style="width:${retentionPoint.value}%;"></div></div>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </article>
            <article class="panel span-6">
              <h3>Monetization Segments</h3>
              <div id="users-segment-chart" class="chart-canvas"></div>
              ${renderSegmentLegend(ctx.data.userSegments)}
            </article>
            <article class="panel span-12">
              <h3>Cohort Retention Table</h3>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Cohort</th><th>Week 1</th><th>Week 2</th><th>Week 3</th><th>Week 4</th><th>Week 5</th></tr>
                  </thead>
                  <tbody>
                    ${ctx.data.cohorts
                      .map(
                        (cohort) => `
                        <tr>
                          <td>${escapeHtml(cohort.name)}</td>
                          <td>${cohort.week1}%</td>
                          <td>${cohort.week2}%</td>
                          <td>${cohort.week3}%</td>
                          <td>${cohort.week4}%</td>
                          <td>${cohort.week5}%</td>
                        </tr>
                      `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        `;
      },
      init(root, ctx) {
        renderDonutChart(root.querySelector("#users-segment-chart"), ctx.data.userSegments);
      }
    },
    changes: {
      title: "Game Change Tracking",
      kicker: "Releases and LiveOps",
      render(ctx) {
        return `
          <section class="screen-grid">
            <article class="panel span-12">
              <h3>Release Velocity</h3>
              <p class="panel-subtitle">Completed release units per sprint cycle</p>
              <div id="changes-velocity-chart" class="chart-canvas"></div>
            </article>
            <article class="panel span-12">
              <h3>Latest Changes</h3>
              <ul class="timeline">
                ${ctx.data.changeFeed
                  .map(
                    (changeItem) => `
                    <li class="timeline-item">
                      <header>
                        <h4>${escapeHtml(changeItem.game)} · ${escapeHtml(changeItem.title)}</h4>
                        ${renderImpactBadge(changeItem.impact)}
                      </header>
                      <p>${escapeHtml(changeItem.when)} · Owner: ${escapeHtml(changeItem.owner)}</p>
                      <p>${escapeHtml(changeItem.summary)}</p>
                    </li>
                  `
                  )
                  .join("")}
              </ul>
            </article>
          </section>
        `;
      },
      init(root, ctx) {
        renderLineChart(root.querySelector("#changes-velocity-chart"), ctx.data.velocityTrend, [
          "S1",
          "S2",
          "S3",
          "S4",
          "S5",
          "S6",
          "S7",
          "S8"
        ]);
      }
    },
    calendar: {
      title: "Studio Calendar",
      kicker: "Milestones and Events",
      render(ctx) {
        const now = new Date();
        const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
        return `
          <section class="screen-grid">
            <article class="panel span-12">
              <h3>${escapeHtml(monthName)} Planning Board</h3>
              <div class="calendar-grid">
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
                ${renderCalendar(now, ctx.data.releaseCalendar)}
              </div>
            </article>
            <article class="panel span-12">
              <h3>Upcoming Events</h3>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Event</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    ${ctx.data.releaseCalendar
                      .map(
                        (event) => `
                        <tr>
                          <td>${escapeHtml(event.date)}</td>
                          <td>${escapeHtml(event.title)}</td>
                          <td>${escapeHtml(event.type)}</td>
                        </tr>
                      `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        `;
      }
    },
    library: {
      title: "Game Library",
      kicker: "Portfolio Catalog",
      render(ctx) {
        const selected = ctx.data.gameLibrary[0];
        return `
          <section class="screen-grid">
            <article class="panel span-12">
              <h3>Game Information Library</h3>
              <p class="panel-subtitle">Filter by game status and inspect roadmap + health metrics.</p>
              <div class="library-controls">
                <input id="library-search" type="search" placeholder="Search game, genre, tag...">
                <select id="library-status">
                  <option value="all">All statuses</option>
                  <option value="live">Live</option>
                  <option value="growth">Growth</option>
                  <option value="stabilize">Stabilize</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>
              <div class="library-layout">
                <div class="library-list" id="library-list">
                  ${ctx.data.gameLibrary
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
                      >
                        <h4>${escapeHtml(game.name)}</h4>
                        <p>${escapeHtml(game.genre)} · ${escapeHtml(game.lifecycle)}</p>
                      </button>
                    `
                    )
                    .join("")}
                  <p id="library-empty" class="empty-note is-hidden">No titles match this filter.</p>
                </div>
                <div class="detail-panel" id="library-detail">${renderDetail(selected)}</div>
              </div>
            </article>
          </section>
        `;
      },
      init(root, ctx) {
        const searchInput = root.querySelector("#library-search");
        const statusSelect = root.querySelector("#library-status");
        const listRoot = root.querySelector("#library-list");
        const detailRoot = root.querySelector("#library-detail");
        const emptyState = root.querySelector("#library-empty");
        const gameCards = Array.from(root.querySelectorAll(".game-card"));

        let activeId = gameCards[0]?.dataset.gameId ?? null;

        const setActive = (gameId) => {
          activeId = gameId;
          gameCards.forEach((card) => {
            card.classList.toggle("is-active", card.dataset.gameId === gameId);
          });
          const game = ctx.data.gameLibrary.find((item) => item.id === gameId);
          if (game) {
            detailRoot.innerHTML = renderDetail(game);
          }
        };

        const applyFilters = () => {
          const query = searchInput.value.trim().toLowerCase();
          const status = statusSelect.value;
          let visibleCount = 0;

          gameCards.forEach((card) => {
            const haystack = [
              card.dataset.gameName ?? "",
              card.dataset.gameGenre ?? "",
              card.dataset.gameTags ?? ""
            ]
              .join(" ")
              .toLowerCase();
            const queryMatch = haystack.includes(query);
            const statusMatch = status === "all" || card.dataset.gameStatus === status;
            const visible = queryMatch && statusMatch;
            card.classList.toggle("is-hidden", !visible);
            if (visible) {
              visibleCount += 1;
            }
          });

          emptyState.classList.toggle("is-hidden", visibleCount > 0);
          const activeCard = gameCards.find((card) => card.dataset.gameId === activeId && !card.classList.contains("is-hidden"));
          if (!activeCard) {
            const firstVisible = gameCards.find((card) => !card.classList.contains("is-hidden"));
            if (firstVisible) {
              setActive(firstVisible.dataset.gameId);
            }
          }
        };

        listRoot.addEventListener("click", (event) => {
          const button = event.target.closest(".game-card");
          if (!button) {
            return;
          }
          setActive(button.dataset.gameId);
        });
        searchInput.addEventListener("input", applyFilters);
        statusSelect.addEventListener("change", applyFilters);
      }
    },
    security: {
      title: "Security and Auth Setup",
      kicker: "AWS Staging Readiness",
      render(ctx) {
        const authState = ctx.authStatus;
        return `
          <section class="screen-grid">
            <article class="panel span-6">
              <h3>Authentication Status</h3>
              <div class="stats-grid">
                <div class="stat-box"><p>Auth Enabled</p><strong>${authState.enabled ? "Yes" : "No (staged)"}</strong></div>
                <div class="stat-box"><p>Provider</p><strong>${escapeHtml(authState.provider)}</strong></div>
                <div class="stat-box"><p>Region</p><strong>${escapeHtml(authState.region)}</strong></div>
              </div>
              <p class="panel-subtitle" style="margin-top:0.62rem;">Current role: ${escapeHtml(authState.role)}</p>
              <button id="security-role-btn" class="ghost-btn" type="button">Switch to Analyst Session</button>
            </article>
            <article class="panel span-6">
              <h3>Staging API Connection</h3>
              <div class="stats-grid">
                <div class="stat-box"><p>Endpoint</p><strong>${escapeHtml(ctx.apiHealth.target)}</strong></div>
                <div class="stat-box"><p>Status</p><strong>${escapeHtml(ctx.apiHealth.status)}</strong></div>
                <div class="stat-box"><p>Auth Header</p><strong>${ctx.session?.accessToken ? "Attached" : "None"}</strong></div>
              </div>
              <p class="panel-subtitle" style="margin-top:0.62rem;">${escapeHtml(ctx.apiHealth.note)}</p>
            </article>
            <article class="panel span-12">
              <h3>Security Controls In Portal</h3>
              <ul class="security-list">
                ${ctx.data.securityControls
                  .map(
                    (control) => `
                    <li>
                      <h4>${escapeHtml(control.title)}</h4>
                      <p>${escapeHtml(control.detail)}</p>
                    </li>
                  `
                  )
                  .join("")}
              </ul>
            </article>
          </section>
        `;
      },
      init(root, ctx) {
        const roleButton = root.querySelector("#security-role-btn");
        roleButton.addEventListener("click", async () => {
          const activeRole = ctx.session?.roles?.[0];
          if (activeRole === "analyst") {
            await ctx.auth.loginAs("admin");
          } else {
            await ctx.auth.loginAs("analyst");
          }
          window.dispatchEvent(new CustomEvent("auth-updated"));
        });
      }
    }
  };
}
