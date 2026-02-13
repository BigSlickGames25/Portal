function makeSvg(width, height, inner) {
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">${inner}</svg>`;
}

function maxValue(values) {
  return values.reduce((max, value) => Math.max(max, value), 0);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) {
    return outMin;
  }
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

function getAxisLines(width, height, left, right, top, bottom, ticks) {
  const usableHeight = height - top - bottom;
  const lines = [];
  for (let i = 0; i < ticks; i += 1) {
    const y = top + (usableHeight / (ticks - 1)) * i;
    lines.push(
      `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="rgba(141,196,220,0.14)" stroke-width="1" />`
    );
  }
  return lines.join("");
}

export function renderLineChart(container, values, labels = []) {
  if (!container || !Array.isArray(values) || values.length === 0) {
    return;
  }

  const width = 880;
  const height = 260;
  const left = 42;
  const right = 16;
  const top = 20;
  const bottom = 34;
  const usableWidth = width - left - right;
  const usableHeight = height - top - bottom;
  const max = maxValue(values) * 1.08;
  const min = 0;
  const stepX = values.length > 1 ? usableWidth / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = left + stepX * index;
    const y = mapRange(value, min, max, height - bottom, top);
    return { x, y, value };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${left},${height - bottom} ${polyline} ${left + stepX * (points.length - 1)},${height - bottom}`;

  const dots = points
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="4.2" fill="#39c7ff" stroke="#041722" stroke-width="2"></circle>`
    )
    .join("");

  const xLabels = points
    .map((point, index) => {
      const text = labels[index] ?? "";
      return `<text x="${point.x}" y="${height - 12}" fill="rgba(188,220,240,0.8)" font-size="11" text-anchor="middle">${text}</text>`;
    })
    .join("");

  container.innerHTML = makeSvg(
    width,
    height,
    `
      <defs>
        <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(57,199,255,0.35)"></stop>
          <stop offset="100%" stop-color="rgba(57,199,255,0)"></stop>
        </linearGradient>
      </defs>
      ${getAxisLines(width, height, left, right, top, bottom, 5)}
      <polygon points="${areaPoints}" fill="url(#line-fill)"></polygon>
      <polyline points="${polyline}" fill="none" stroke="#39c7ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${dots}
      ${xLabels}
    `
  );
}

export function renderBarChart(container, bars) {
  if (!container || !Array.isArray(bars) || bars.length === 0) {
    return;
  }

  const width = 880;
  const height = 260;
  const left = 36;
  const right = 12;
  const top = 18;
  const bottom = 40;
  const usableWidth = width - left - right;
  const usableHeight = height - top - bottom;
  const max = maxValue(
    bars.flatMap((bar) => (bar.secondary !== undefined ? [bar.value, bar.secondary] : [bar.value]))
  ) * 1.1;
  const groupWidth = usableWidth / bars.length;
  const hasSecondary = bars.some((bar) => bar.secondary !== undefined);

  const shapes = [];
  const labels = [];

  bars.forEach((bar, index) => {
    const x = left + groupWidth * index + groupWidth * 0.15;
    const primaryWidth = hasSecondary ? groupWidth * 0.28 : groupWidth * 0.62;
    const secondaryWidth = groupWidth * 0.28;
    const primaryHeight = mapRange(bar.value, 0, max, 0, usableHeight);
    const yPrimary = top + usableHeight - primaryHeight;

    shapes.push(
      `<rect x="${x}" y="${yPrimary}" width="${primaryWidth}" height="${primaryHeight}" rx="4" fill="#22b8a8"></rect>`
    );

    if (hasSecondary && bar.secondary !== undefined) {
      const secondaryHeight = mapRange(bar.secondary, 0, max, 0, usableHeight);
      const ySecondary = top + usableHeight - secondaryHeight;
      const xSecondary = x + primaryWidth + groupWidth * 0.1;
      shapes.push(
        `<rect x="${xSecondary}" y="${ySecondary}" width="${secondaryWidth}" height="${secondaryHeight}" rx="4" fill="#ffc778"></rect>`
      );
    }

    labels.push(
      `<text x="${left + groupWidth * index + groupWidth / 2}" y="${height - 13}" text-anchor="middle" font-size="11" fill="rgba(188,220,240,0.8)">${bar.label}</text>`
    );
  });

  container.innerHTML = makeSvg(
    width,
    height,
    `
      ${getAxisLines(width, height, left, right, top, bottom, 5)}
      ${shapes.join("")}
      ${labels.join("")}
    `
  );
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle)
  };
  const end = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle)
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function renderDonutChart(container, slices) {
  if (!container || !Array.isArray(slices) || slices.length === 0) {
    return;
  }

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) {
    container.textContent = "No chart data";
    return;
  }

  const width = 400;
  const height = 280;
  const cx = 140;
  const cy = 140;
  const radius = 82;
  const stroke = 36;
  let angle = -Math.PI / 2;

  const arcs = slices
    .map((slice, index) => {
      const portion = slice.value / total;
      const end = angle + portion * Math.PI * 2;
      const path = describeArc(cx, cy, radius, angle, end);
      const color = slice.color ?? ["#39c7ff", "#22b8a8", "#ffc778", "#ff8f97", "#86e6ff"][index % 5];
      angle = end;
      return `<path d="${path}" stroke="${color}" stroke-width="${stroke}" fill="none" stroke-linecap="butt"></path>`;
    })
    .join("");

  container.innerHTML = makeSvg(
    width,
    height,
    `
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="rgba(141,196,220,0.14)" stroke-width="${stroke}"></circle>
      ${arcs}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#ecf7ff" font-size="30" font-weight="700">${Math.round(
        total
      )}</text>
      <text x="${cx}" y="${cy + 20}" text-anchor="middle" fill="rgba(188,220,240,0.88)" font-size="12">Total Share</text>
    `
  );
}
