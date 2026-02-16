import { escapeHtml } from "../../services/security.js";

function actionLabelForType(type) {
  const normalized = String(type ?? "").toLowerCase();
  if (normalized === "pdf") {
    return "Open PDF";
  }
  if (normalized === "md") {
    return "Open Markdown";
  }
  return "Open File";
}

const libraryDocsScreen = {
  title: "Library",
  kicker: "Portal Guides and References",
  render(ctx) {
    const files = Array.isArray(ctx.data.studioFiles) ? ctx.data.studioFiles : [];
    const typeSummary = Array.from(new Set(files.map((file) => String(file.type ?? "").toUpperCase()).filter(Boolean))).join(", ");

    return `
      <section class="screen-grid">
        <article class="panel span-12" data-layout="librarydocs-overview">
          <h3>Library</h3>
          <p class="panel-subtitle">Reference materials for onboarding, development, and deployment.</p>
          <div class="stats-grid">
            <div class="stat-box"><p>Total Resources</p><strong>${files.length}</strong></div>
            <div class="stat-box"><p>Formats</p><strong>${typeSummary || "-"}</strong></div>
            <div class="stat-box"><p>Location</p><strong>Repository Root + src/Documents</strong></div>
          </div>
        </article>

        <article class="panel span-12" data-layout="librarydocs-table">
          <h3>Library Resources</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                ${files
                  .map(
                    (file) => `
                    <tr>
                      <td>${escapeHtml(file.name)}</td>
                      <td><span class="file-chip">${escapeHtml(String(file.type ?? "").toUpperCase())}</span></td>
                      <td>
                        ${file.path
                          ? `<a class="file-link" href="${escapeHtml(file.path)}" target="_blank" rel="noreferrer">${actionLabelForType(file.type)}</a>`
                          : "-"}
                      </td>
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
};

export { libraryDocsScreen };
