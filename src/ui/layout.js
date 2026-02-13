import { layoutConfig } from "../config/layoutConfig.js";

const defaultLayout = layoutConfig.defaults ?? {
  offsetX: 0,
  offsetY: 0,
  scaleX: 1,
  scaleY: 1
};

function toPixels(value, fallback = "0px") {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "number") {
    return `${value}px`;
  }
  return String(value);
}

function toScale(value, fallback = 1) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return fallback;
  }
  return Number(value);
}

function applyLayout(root = document) {
  const nodes = root.querySelectorAll("[data-layout]");
  nodes.forEach((node) => {
    const key = node.dataset.layout;
    const config = layoutConfig.elements?.[key] ?? defaultLayout;
    node.style.setProperty("--layout-offset-x", toPixels(config.offsetX, toPixels(defaultLayout.offsetX)));
    node.style.setProperty("--layout-offset-y", toPixels(config.offsetY, toPixels(defaultLayout.offsetY)));
    node.style.setProperty("--layout-scale-x", String(toScale(config.scaleX, defaultLayout.scaleX)));
    node.style.setProperty("--layout-scale-y", String(toScale(config.scaleY, defaultLayout.scaleY)));
  });
}

export { applyLayout };
