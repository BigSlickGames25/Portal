import { authConfig } from "./config/authConfig.js";
import { envConfig } from "./config/env.js";
import { dashboardData } from "./data/mockData.js";
import { ApiClient } from "./services/apiClient.js";
import { AuthService } from "./services/authService.js";
import { createScreens } from "./ui/screens.js";

const screenRoot = document.querySelector("#screen-root");
const navButtons = Array.from(document.querySelectorAll(".nav-item"));
const screenTitle = document.querySelector("#screen-title");
const screenKicker = document.querySelector("#screen-kicker");
const clockNode = document.querySelector("#clock");
const refreshButton = document.querySelector("#refresh-btn");
const sessionUserNode = document.querySelector("#session-user");
const envLabelNode = document.querySelector("#env-label");

const state = {
  activeScreen: "overview"
};

const auth = new AuthService(authConfig, envConfig);
const apiClient = new ApiClient(envConfig, auth, dashboardData);
const screens = createScreens();

let transitionToken = 0;

function canAnimate() {
  return envConfig.motionEnabled && typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
}

function renderFatal(message) {
  screenRoot.innerHTML = `
    <article class="panel span-12">
      <h3>Portal rendering error</h3>
      <p class="panel-subtitle">${String(message)}</p>
    </article>
  `;
}

function updateClock() {
  const now = new Date();
  clockNode.textContent = now.toLocaleTimeString("en-US", {
    hour12: false
  });
}

function setActiveNav(screenKey) {
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screen === screenKey);
  });
}

async function buildContext() {
  const [data, apiHealth] = await Promise.all([apiClient.getDashboardSnapshot(), apiClient.healthCheck()]);
  return {
    data,
    apiHealth,
    env: envConfig,
    auth,
    authStatus: auth.getStatus(),
    session: auth.getSession(),
    state
  };
}

function updateHeader(screenDef, context) {
  screenTitle.textContent = screenDef.title;
  screenKicker.textContent = screenDef.kicker;
  envLabelNode.textContent = `${context.env.envName} / ${context.env.region}`;

  if (!context.session) {
    sessionUserNode.textContent = "No active session";
    return;
  }

  const role = context.session.roles?.[0] ?? "none";
  sessionUserNode.textContent = `${context.session.name} (${role})`;
}

async function renderScreen(screenKey, withMotion = true) {
  const screenDef = screens[screenKey] ?? screens.overview;
  const context = await buildContext();
  const token = ++transitionToken;
  const previous = screenRoot.firstElementChild;
  const useMotion = withMotion && canAnimate();

  const nextScreen = document.createElement("section");
  nextScreen.className = "screen";
  try {
    nextScreen.innerHTML = screenDef.render(context);
  } catch (error) {
    renderFatal(error?.message ?? error);
    return;
  }

  if (previous) {
    if (useMotion) {
      await previous
        .animate(
          [
            { opacity: 1, transform: "translateY(0px)" },
            { opacity: 0, transform: "translateY(-10px)" }
          ],
          { duration: 170, easing: "ease-out", fill: "forwards" }
        )
        .finished.catch(() => undefined);
    }
    if (token !== transitionToken) {
      return;
    }
    previous.remove();
  }

  screenRoot.appendChild(nextScreen);
  if (useMotion) {
    nextScreen.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0px)" }
      ],
      { duration: 260, easing: "cubic-bezier(0.2, 0.7, 0, 1)" }
    );
  }

  try {
    screenDef.init?.(nextScreen, context);
  } catch (error) {
    renderFatal(error?.message ?? error);
    return;
  }
  updateHeader(screenDef, context);
}

async function gotoScreen(screenKey, withMotion = true) {
  state.activeScreen = screenKey;
  setActiveNav(screenKey);
  await renderScreen(screenKey, withMotion);
}

async function initializeApp() {
  await auth.initialize();
  updateClock();
  window.setInterval(updateClock, 1000);
  await gotoScreen(state.activeScreen, false);
}

navButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const screenKey = button.dataset.screen;
    if (!screenKey || screenKey === state.activeScreen) {
      return;
    }
    await gotoScreen(screenKey, true);
  });
});

refreshButton.addEventListener("click", async () => {
  await renderScreen(state.activeScreen, false);
});

window.addEventListener("auth-updated", async () => {
  await renderScreen(state.activeScreen, false);
});

window.addEventListener("error", (event) => {
  renderFatal(event.error?.message ?? event.message ?? "Unexpected error");
});

window.addEventListener("unhandledrejection", (event) => {
  renderFatal(event.reason?.message ?? event.reason ?? "Unhandled promise rejection");
});

initializeApp().catch((error) => {
  renderFatal(error?.message ?? error);
});
