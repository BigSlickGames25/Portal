import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getStoredRole } from "../lib/auth";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import type { Category, LibraryEntry, TaskCard } from "../types";
import { useToast } from "../components/ToastProvider";

type LibraryTab = "entries" | "tasks";
type ViewMode = "grid" | "list";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function LibraryPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const role = getStoredRole() ?? "Viewer";
  const readOnly = role === "Viewer";

  const [tab, setTab] = useState<LibraryTab>("entries");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");

  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then(setCategories)
      .catch((error) => pushToast(error instanceof Error ? error.message : "Failed to load categories", "error"));
  }, [pushToast]);

  const loadEntries = async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (selectedStatus) params.set("status", selectedStatus);
    if (selectedTag) params.set("tag", selectedTag);
    const query = params.toString();
    const data = await api.get<LibraryEntry[]>(`/entries${query ? `?${query}` : ""}`);
    setEntries(data);
  };

  const loadTasks = async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (selectedStatus) params.set("status", selectedStatus);
    if (selectedTag) params.set("tag", selectedTag);
    if (selectedPriority) params.set("priority", selectedPriority);
    if (selectedOwner) params.set("owner", selectedOwner);
    const query = params.toString();
    const data = await api.get<TaskCard[]>(`/tasks${query ? `?${query}` : ""}`);
    setTasks(data);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const runner = tab === "entries" ? loadEntries : loadTasks;
    runner()
      .catch((error) => {
        if (mounted) pushToast(error instanceof Error ? error.message : "Failed to load library", "error");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tab, debouncedSearch, selectedCategory, selectedStatus, selectedTag, selectedPriority, selectedOwner]);

  const owners = useMemo(() => {
    const list = Array.from(new Set(tasks.map((task) => task.owner)));
    return list.sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const allTags = useMemo(() => {
    const sourceTags = tab === "entries" ? entries.flatMap((entry) => entry.tags) : tasks.flatMap((task) => task.tags);
    return Array.from(new Set(sourceTags)).sort((a, b) => a.localeCompare(b));
  }, [tab, entries, tasks]);

  const archiveEntry = async (id: number) => {
    if (!window.confirm("Archive this entry?")) return;
    await api.post(`/entries/${id}/archive`);
    pushToast("Entry archived", "success");
    await loadEntries();
  };

  const archiveTask = async (id: number) => {
    if (!window.confirm("Archive this task?")) return;
    await api.post(`/tasks/${id}/archive`);
    pushToast("Task archived", "success");
    await loadTasks();
  };

  const duplicateEntry = async (id: number) => {
    await api.post(`/entries/${id}/duplicate`);
    pushToast("Entry duplicated", "success");
    await loadEntries();
  };

  const duplicateTask = async (id: number) => {
    await api.post(`/tasks/${id}/duplicate`);
    pushToast("Task duplicated", "success");
    await loadTasks();
  };

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <h2>Library</h2>
          <p className="muted">Manage entries and task cards in one portal module.</p>
        </div>
        <div className="inline-row">
          <button className={`btn ${tab === "entries" ? "" : "btn-secondary"}`} onClick={() => setTab("entries")} type="button">
            Entries
          </button>
          <button className={`btn ${tab === "tasks" ? "" : "btn-secondary"}`} onClick={() => setTab("tasks")} type="button">
            Tasks
          </button>
          {!readOnly ? (
            <>
              <button className="btn" type="button" onClick={() => navigate("/library/entry/new")}>
                Create Entry
              </button>
              <button className="btn" type="button" onClick={() => navigate("/library/task/new")}>
                Create Task
              </button>
            </>
          ) : null}
        </div>
      </header>

      <section className="panel controls-panel">
        <div className="field-grid">
          <div className="field-group">
            <label className="field-label">Search</label>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, objective, owner..." />
          </div>
          <div className="field-group">
            <label className="field-label">Category</label>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Status</label>
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
              <option value="">All Statuses</option>
              {tab === "entries" ? (
                <>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </>
              ) : (
                <>
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </>
              )}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Tag</label>
            <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option value={tag} key={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          {tab === "tasks" ? (
            <>
              <div className="field-group">
                <label className="field-label">Priority</label>
                <select value={selectedPriority} onChange={(event) => setSelectedPriority(event.target.value)}>
                  <option value="">All Priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Owner</label>
                <select value={selectedOwner} onChange={(event) => setSelectedOwner(event.target.value)}>
                  <option value="">All Owners</option>
                  {owners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
        </div>
        <div className="inline-row">
          <button className={`btn ${viewMode === "grid" ? "" : "btn-secondary"}`} type="button" onClick={() => setViewMode("grid")}>
            Grid
          </button>
          <button className={`btn ${viewMode === "list" ? "" : "btn-secondary"}`} type="button" onClick={() => setViewMode("list")}>
            List
          </button>
        </div>
      </section>

      {loading ? <p className="muted">Loading library data...</p> : null}

      {tab === "entries" ? (
        entries.length > 0 ? (
          <section className={viewMode === "grid" ? "card-grid three" : "stack"}>
            {entries.map((entry) => (
              <article key={entry.id} className="panel card-item">
                {entry.coverImageUrl ? <img src={entry.coverImageUrl} alt={entry.title} className="card-cover" /> : null}
                <h3>{entry.title}</h3>
                <p className="muted">{entry.shortDescription}</p>
                <p className="muted">
                  {entry.category?.name || "Uncategorized"} · {formatDate(entry.updatedAt)}
                </p>
                <div className="chip-list">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-row wrap">
                  <Link className="btn btn-small" to={`/library/entry/${entry.id}`}>
                    View
                  </Link>
                  {!readOnly ? (
                    <>
                      <Link className="btn btn-small btn-secondary" to={`/library/entry/${entry.id}/edit`}>
                        Edit
                      </Link>
                      <button className="btn btn-small btn-secondary" type="button" onClick={() => duplicateEntry(entry.id)}>
                        Duplicate
                      </button>
                      <button className="btn btn-small btn-secondary" type="button" onClick={() => archiveEntry(entry.id)}>
                        Archive
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <article className="panel empty-state">
            <h3>No entries found</h3>
            <p className="muted">Adjust filters or create a new entry.</p>
          </article>
        )
      ) : tasks.length > 0 ? (
        <section className={viewMode === "grid" ? "card-grid three" : "stack"}>
          {tasks.map((task) => (
            <article key={task.id} className="panel card-item">
              {task.imageUrls[0] ? <img src={task.imageUrls[0]} alt={task.title} className="card-cover" /> : null}
              <h3>{task.title}</h3>
              <p className="muted">{task.objective}</p>
              <p className="muted">
                {task.category?.name || "Uncategorized"} · {task.owner} · {formatDate(task.updatedAt)}
              </p>
              <div className="chip-list">
                <span className="chip">{task.priority}</span>
                {task.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="inline-row wrap">
                <Link className="btn btn-small" to={`/library/task/${task.id}`}>
                  View
                </Link>
                {!readOnly ? (
                  <>
                    <Link className="btn btn-small btn-secondary" to={`/library/task/${task.id}/edit`}>
                      Edit
                    </Link>
                    <button className="btn btn-small btn-secondary" type="button" onClick={() => duplicateTask(task.id)}>
                      Duplicate
                    </button>
                    <button className="btn btn-small btn-secondary" type="button" onClick={() => archiveTask(task.id)}>
                      Archive
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <article className="panel empty-state">
          <h3>No tasks found</h3>
          <p className="muted">Adjust filters or create a new task card.</p>
        </article>
      )}
    </section>
  );
}
