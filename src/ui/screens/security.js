import { escapeHtml } from "../../services/security.js";

const securityScreen = {
  title: "Security and Auth Setup",
  kicker: "AWS Staging Readiness",
  render(ctx) {
    const authState = ctx.authStatus;
    return `
      <section class="screen-grid">
        <article class="panel span-6" data-layout="security-auth">
          <h3>Authentication Status</h3>
          <div class="stats-grid">
            <div class="stat-box"><p>Auth Enabled</p><strong>${authState.enabled ? "Yes" : "No (staged)"}</strong></div>
            <div class="stat-box"><p>Provider</p><strong>${escapeHtml(authState.provider)}</strong></div>
            <div class="stat-box"><p>Region</p><strong>${escapeHtml(authState.region)}</strong></div>
          </div>
          <p class="panel-subtitle" style="margin-top:0.62rem;">Current role: ${escapeHtml(authState.role)}</p>
          <button id="security-role-btn" class="ghost-btn" type="button">Switch to Analyst Session</button>
        </article>
        <article class="panel span-6" data-layout="security-api">
          <h3>Staging API Connection</h3>
          <div class="stats-grid">
            <div class="stat-box"><p>Endpoint</p><strong>${escapeHtml(ctx.apiHealth.target)}</strong></div>
            <div class="stat-box"><p>Status</p><strong>${escapeHtml(ctx.apiHealth.status)}</strong></div>
            <div class="stat-box"><p>Auth Header</p><strong>${ctx.session?.accessToken ? "Attached" : "None"}</strong></div>
          </div>
          <p class="panel-subtitle" style="margin-top:0.62rem;">${escapeHtml(ctx.apiHealth.note)}</p>
        </article>
        <article class="panel span-12" data-layout="security-controls">
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
};

export { securityScreen };
