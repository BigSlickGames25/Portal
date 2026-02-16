import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { getStoredRole } from "../lib/auth";
import type { LibraryEntry, TaskCard } from "../types";
import { useToast } from "../components/ToastProvider";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const role = getStoredRole() ?? "Viewer";

  const [task, setTask] = useState<TaskCard | null>(null);
  const [relatedEntries, setRelatedEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.get<TaskCard>(`/tasks/${id}`);
      setTask(data);

      const related = await Promise.all(
        (data.relatedEntryIds || []).map(async (entryId) => {
          try {
            return await api.get<LibraryEntry>(`/entries/${entryId}`);
          } catch {
            return null;
          }
        })
      );
      setRelatedEntries(related.filter((item): item is LibraryEntry => Boolean(item)));
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Failed to load task", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const archive = async () => {
    if (!id) return;
    if (!window.confirm("Archive this task?")) return;
    await api.post(`/tasks/${id}/archive`);
    pushToast("Task archived", "success");
    navigate("/library");
  };

  const hardDelete = async () => {
    if (!id) return;
    if (!window.confirm("Hard delete this task? This cannot be undone.")) return;
    await api.delete(`/tasks/${id}`);
    pushToast("Task deleted", "success");
    navigate("/library");
  };

  if (loading) return <p className="muted">Loading task...</p>;
  if (!task) return <p className="muted">Task not found.</p>;

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <h2>{task.title}</h2>
          <p className="muted">
            {task.category?.name || "Uncategorized"} · {task.status} · {task.priority} · Owner {task.owner}
          </p>
        </div>
        <div className="inline-row">
          <Link className="btn btn-secondary" to="/library">
            Back
          </Link>
          {role !== "Viewer" ? (
            <>
              <Link className="btn btn-secondary" to={`/library/task/${task.id}/edit`}>
                Edit
              </Link>
              <button className="btn btn-secondary" type="button" onClick={archive}>
                Archive
              </button>
            </>
          ) : null}
          {role === "Admin" ? (
            <button className="btn btn-danger" type="button" onClick={hardDelete}>
              Hard Delete
            </button>
          ) : null}
        </div>
      </header>

      <article className="panel">
        <h3>Objective</h3>
        <p>{task.objective}</p>
      </article>

      <article className="panel">
        <h3>Checklist</h3>
        <ul className="checklist-view">
          {task.stepsChecklist.map((item, index) => (
            <li key={`${item.text}-${index}`}>
              <input type="checkbox" checked={Boolean(item.done)} readOnly /> {item.text}
            </li>
          ))}
        </ul>
      </article>

      {task.imageUrls.length > 0 ? (
        <article className="panel">
          <h3>Images</h3>
          <div className="gallery-grid">
            {task.imageUrls.map((url) => (
              <img src={url} alt="Task visual" key={url} className="gallery-image" />
            ))}
          </div>
        </article>
      ) : null}

      {task.attachmentUrls.length > 0 ? (
        <article className="panel">
          <h3>Attachments</h3>
          <ul className="link-list">
            {task.attachmentUrls.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {relatedEntries.length > 0 ? (
        <article className="panel">
          <h3>Related Entries</h3>
          <ul className="link-list">
            {relatedEntries.map((entry) => (
              <li key={entry.id}>
                <Link to={`/library/entry/${entry.id}`}>{entry.title}</Link>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
