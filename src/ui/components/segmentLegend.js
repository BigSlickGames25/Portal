import { escapeHtml } from "../../services/security.js";

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

export { renderSegmentLegend };
