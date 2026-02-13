import { renderBarChart, renderDonutChart } from "../charts.js";
import { escapeHtml } from "../../services/security.js";
import { compactFormatter, currencyFormatter, percentFormatter } from "../formatters.js";

const financeScreen = {
  title: "Finance and Economy",
  kicker: "Revenue, Spend, Chips",
  render(ctx) {
    const sinks = ctx.data.chipsEconomy.sinks;
    return `
      <section class="screen-grid">
        <article class="panel span-5" data-layout="finance-spend">
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
        <article class="panel span-7" data-layout="finance-burn">
          <h3>Revenue vs Spend</h3>
          <p class="panel-subtitle">Revenue (blue) and operational spend (gold), values in thousands USD</p>
          <div id="finance-burn-chart" class="chart-canvas"></div>
        </article>
        <article class="panel span-6" data-layout="finance-chips">
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
        <article class="panel span-6" data-layout="finance-ledger">
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
};

export { financeScreen };
