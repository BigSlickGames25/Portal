import { escapeHtml } from "../../services/security.js";

function fileStatusToBadge(status) {
  if (status === "approved") {
    return "ok";
  }
  if (status === "review") {
    return "warn";
  }
  return "crit";
}

function titleCase(value = "") {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function uniqueTypes(files) {
  return Array.from(new Set(files.map((file) => String(file.type ?? "").toLowerCase()).filter(Boolean))).sort();
}

function statusCounts(files) {
  return files.reduce(
    (counts, file) => {
      const key = String(file.status ?? "").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(counts, key)) {
        counts[key] += 1;
      }
      return counts;
    },
    { approved: 0, review: 0, draft: 0 }
  );
}

const filesScreen = {
  title: "Documents",
  kicker: "Studio Documents",
  render(ctx) {
    const files = Array.isArray(ctx.data.studioFiles) ? ctx.data.studioFiles : [];
    const updates = Array.isArray(ctx.data.fileUpdates) ? ctx.data.fileUpdates : [];
    const counts = statusCounts(files);
    const types = uniqueTypes(files);

    return `
      <section class="screen-grid">
        <article class="panel span-12" data-layout="files-overview">
          <h3>Documents Overview</h3>
          <div class="files-stats">
            <div class="stat-box"><p>Total Documents</p><strong>${files.length}</strong></div>
            <div class="stat-box"><p>Approved</p><strong>${counts.approved}</strong></div>
            <div class="stat-box"><p>In Review</p><strong>${counts.review}</strong></div>
            <div class="stat-box"><p>Draft</p><strong>${counts.draft}</strong></div>
          </div>
        </article>
        <article class="panel span-8" data-layout="files-table">
          <h3>Document Repository</h3>
          <div class="files-controls" data-layout="files-controls">
            <input id="files-search" type="search" placeholder="Search document name, game, owner...">
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
                  <th>Game</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Updated</th>
                  <th>Size</th>
                  <th>Status</th>
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
                      data-file-game="${escapeHtml(file.game)}"
                      data-file-owner="${escapeHtml(file.owner)}"
                      data-file-type="${escapeHtml(String(file.type ?? "").toLowerCase())}"
                    >
                      <td>${escapeHtml(file.name)}</td>
                      <td>${escapeHtml(file.game)}</td>
                      <td><span class="file-chip">${escapeHtml(String(file.type ?? "").toUpperCase())}</span></td>
                      <td>${escapeHtml(file.owner)}</td>
                      <td>${escapeHtml(file.updated)}</td>
                      <td>${escapeHtml(file.size)}</td>
                      <td><span class="badge ${fileStatusToBadge(file.status)}">${escapeHtml(titleCase(file.status))}</span></td>
                      <td>
                        ${
                          file.path
                            ? `<a class="file-link" href="${escapeHtml(file.path)}" target="_blank" rel="noreferrer">Open</a>`
                            : "-"
                        }
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
        <article class="panel span-4" data-layout="files-updates">
          <h3>Recent Document Updates</h3>
          <ul class="list">
            ${updates
              .map(
                (item) => `
                <li class="list-item">
                  <h4>${escapeHtml(item.title)}</h4>
                  <p>${escapeHtml(item.when)} | ${escapeHtml(item.by)}</p>
                  <p>${escapeHtml(item.note)}</p>
                </li>
              `
              )
              .join("")}
          </ul>
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

    const applyFilters = () => {
      const query = searchInput.value.trim().toLowerCase();
      const selectedType = typeSelect.value;
      let visibleCount = 0;

      rows.forEach((row) => {
        const haystack = [
          row.dataset.fileName ?? "",
          row.dataset.fileGame ?? "",
          row.dataset.fileOwner ?? "",
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
