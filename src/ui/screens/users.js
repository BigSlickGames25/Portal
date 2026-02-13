import { renderDonutChart } from "../charts.js";
import { renderSegmentLegend } from "../components/segmentLegend.js";
import { escapeHtml } from "../../services/security.js";

const usersScreen = {
  title: "User Analytics",
  kicker: "Acquisition and Retention",
  render(ctx) {
    return `
      <section class="screen-grid">
        <article class="panel span-6" data-layout="users-retention">
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
        <article class="panel span-6" data-layout="users-segments">
          <h3>Monetization Segments</h3>
          <div id="users-segment-chart" class="chart-canvas"></div>
          ${renderSegmentLegend(ctx.data.userSegments)}
        </article>
        <article class="panel span-12" data-layout="users-cohorts">
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
};

export { usersScreen };
