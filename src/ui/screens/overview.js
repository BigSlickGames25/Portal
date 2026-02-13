import { renderBarChart, renderLineChart } from "../charts.js";
import { renderKpiCards, animateCounters } from "../components/kpiCards.js";
import { badgeClass } from "../components/badges.js";
import { escapeHtml } from "../../services/security.js";

const monthLabels = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

const overviewScreen = {
  title: "Business Overview",
  kicker: "Studio Intelligence",
  render(ctx) {
    const releases = ctx.data.releaseCalendar.slice(0, 4);
    return `
      <div class="kpi-grid" data-layout="overview-kpis">${renderKpiCards(ctx.data.kpis)}</div>
      <section class="screen-grid">
        <article class="panel span-8" data-layout="overview-revenue">
          <h3>Revenue Momentum (12 months)</h3>
          <p class="panel-subtitle">Gross booking trend across all active titles</p>
          <div id="overview-revenue-chart" class="chart-canvas"></div>
        </article>
        <article class="panel span-4" data-layout="overview-users">
          <h3>User Growth</h3>
          <p class="panel-subtitle">Monthly active users</p>
          <div id="overview-users-chart" class="chart-canvas"></div>
        </article>
        <article class="panel span-6" data-layout="overview-alerts">
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
        <article class="panel span-6" data-layout="overview-calendar">
          <h3>Upcoming Calendar</h3>
          <ul class="list">
            ${releases
              .map(
                (event) => `
                <li class="list-item">
                  <h4>${escapeHtml(event.title)}</h4>
                  <p>${escapeHtml(event.date)} Â· ${escapeHtml(event.type)}</p>
                </li>
              `
              )
              .join("")}
          </ul>
        </article>
        <article class="panel span-12" data-layout="overview-strategic">
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
    renderLineChart(root.querySelector("#overview-revenue-chart"), ctx.data.revenueTrend, monthLabels);
    renderBarChart(root.querySelector("#overview-users-chart"), ctx.data.userTrend);
    animateCounters(root);
  }
};

export { overviewScreen };
