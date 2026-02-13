import { renderLineChart } from "../charts.js";
import { renderImpactBadge } from "../components/badges.js";
import { escapeHtml } from "../../services/security.js";

const sprintLabels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

const changesScreen = {
  title: "Game Change Tracking",
  kicker: "Releases and LiveOps",
  render(ctx) {
    return `
      <section class="screen-grid">
        <article class="panel span-12" data-layout="changes-velocity">
          <h3>Release Velocity</h3>
          <p class="panel-subtitle">Completed release units per sprint cycle</p>
          <div id="changes-velocity-chart" class="chart-canvas"></div>
        </article>
        <article class="panel span-12" data-layout="changes-feed">
          <h3>Latest Changes</h3>
          <ul class="timeline">
            ${ctx.data.changeFeed
              .map(
                (changeItem) => `
                <li class="timeline-item">
                  <header>
                    <h4>${escapeHtml(changeItem.game)} Â· ${escapeHtml(changeItem.title)}</h4>
                    ${renderImpactBadge(changeItem.impact)}
                  </header>
                  <p>${escapeHtml(changeItem.when)} Â· Owner: ${escapeHtml(changeItem.owner)}</p>
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
    renderLineChart(root.querySelector("#changes-velocity-chart"), ctx.data.velocityTrend, sprintLabels);
  }
};

export { changesScreen };
