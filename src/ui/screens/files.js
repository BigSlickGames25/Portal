import { escapeHtml } from "../../services/security.js";

function uniqueTypes(files) {
  return Array.from(new Set(files.map((file) => String(file.type ?? "").toLowerCase()).filter(Boolean))).sort();
}

const filesScreen = {
  title: "Documents",
  kicker: "Source Documents",
  render(ctx) {
    const files = Array.isArray(ctx.data.studioFiles) ? ctx.data.studioFiles : [];
    const types = uniqueTypes(files);

    return `
      <section class="screen-grid">
        <article class="panel span-12" data-layout="files-overview">
          <h3>Documents Overview</h3>
          <div class="files-stats">
            <div class="stat-box"><p>Total Documents</p><strong>${files.length}</strong></div>
            <div class="stat-box"><p>Source Folder</p><strong>src/Documents</strong></div>
            <div class="stat-box"><p>Type</p><strong>${types.length ? escapeHtml(types.join(", ").toUpperCase()) : "-"}</strong></div>
            <div class="stat-box"><p>Status</p><strong>Live</strong></div>
          </div>
        </article>
        <article class="panel span-12" data-layout="files-table">
          <h3>Document Repository</h3>
          <div class="files-controls" data-layout="files-controls">
            <input id="files-search" type="search" placeholder="Search document name...">
            <select id="files-type">
              <option value="all">All document types</option>
              ${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type.toUpperCase())}</option>`).join("")}
            </select>
          </div>
          <p id="files-results" class="files-results">${files.length} documents</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody id="files-table-body">
                ${files
                  .map(
                    (file) => `
                    <tr
                      class="files-row"
                      data-file-name="${escapeHtml(file.name)}"
                      data-file-type="${escapeHtml(String(file.type ?? "").toLowerCase())}"
                    >
                      <td>${escapeHtml(file.name)}</td>
                      <td><span class="file-chip">${escapeHtml(String(file.type ?? "").toUpperCase())}</span></td>
                      <td>
                        ${file.path
                          ? `<a class="file-link" href="${escapeHtml(file.path)}" target="_blank" rel="noreferrer">${
                              String(file.type ?? "").toLowerCase() === "pdf" ? "Open PDF" : "Open File"
                            }</a>`
                          : "-"}
                      </td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          <p id="files-empty" class="empty-note is-hidden">No documents match this filter.</p>
        </article>
      </section>
    `;
  },
  init(root) {
    const searchInput = root.querySelector("#files-search");
    const typeSelect = root.querySelector("#files-type");
    const resultsNode = root.querySelector("#files-results");
    const emptyNode = root.querySelector("#files-empty");
    const rows = Array.from(root.querySelectorAll(".files-row"));

    if (!searchInput || !typeSelect || !resultsNode || !emptyNode) {
      return;
    }

    // Reset controls in case the browser restores prior form state.
    searchInput.value = "";
    typeSelect.value = "all";

    const applyFilters = () => {
      const query = searchInput.value.trim().toLowerCase();
      const selectedType = typeSelect.value;
      let visibleCount = 0;

      rows.forEach((row) => {
        const haystack = [
          row.dataset.fileName ?? "",
          row.dataset.fileType ?? ""
        ]
          .join(" ")
          .toLowerCase();
        const queryMatch = haystack.includes(query);
        const typeMatch = selectedType === "all" || row.dataset.fileType === selectedType;
        const visible = queryMatch && typeMatch;
        row.classList.toggle("is-hidden", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      resultsNode.textContent = visibleCount === 1 ? "1 document" : `${visibleCount} documents`;
      emptyNode.classList.toggle("is-hidden", visibleCount > 0);
    };

    searchInput.addEventListener("input", applyFilters);
    typeSelect.addEventListener("change", applyFilters);
    applyFilters();
  }
};

export { filesScreen };
