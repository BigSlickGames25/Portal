import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { getStoredRole } from "../lib/auth";
import type { LibraryEntry } from "../types";
import { useToast } from "../components/ToastProvider";

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const role = getStoredRole() ?? "Viewer";

  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.get<LibraryEntry>(`/entries/${id}`);
      setEntry(data);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Failed to load entry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const archive = async () => {
    if (!id) return;
    if (!window.confirm("Archive this entry?")) return;
    await api.post(`/entries/${id}/archive`);
    pushToast("Entry archived", "success");
    navigate("/library");
  };

  const hardDelete = async () => {
    if (!id) return;
    if (!window.confirm("Hard delete this entry? This cannot be undone.")) return;
    await api.delete(`/entries/${id}`);
    pushToast("Entry deleted", "success");
    navigate("/library");
  };

  if (loading) return <p className="muted">Loading entry...</p>;
  if (!entry) return <p className="muted">Entry not found.</p>;

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <h2>{entry.title}</h2>
          <p className="muted">
            {entry.category?.name || "Uncategorized"} · {entry.status} · Updated {new Date(entry.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="inline-row">
          <Link className="btn btn-secondary" to="/library">
            Back
          </Link>
          {role !== "Viewer" ? (
            <>
              <Link className="btn btn-secondary" to={`/library/entry/${entry.id}/edit`}>
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

      {entry.coverImageUrl ? <img src={entry.coverImageUrl} className="hero-image" alt={entry.title} /> : null}

      <article className="panel">
        <h3>Summary</h3>
        <p>{entry.shortDescription}</p>
      </article>

      <article className="panel">
        <h3>Full Content</h3>
        <p>{entry.fullDescription}</p>
      </article>

      <article className="panel">
        <h3>Tags</h3>
        <div className="chip-list">
          {entry.tags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </article>

      {entry.galleryImageUrls.length > 0 ? (
        <article className="panel">
          <h3>Gallery</h3>
          <div className="gallery-grid">
            {entry.galleryImageUrls.map((url) => (
              <img src={url} alt="Gallery item" key={url} className="gallery-image" />
            ))}
          </div>
        </article>
      ) : null}

      {entry.attachmentUrls.length > 0 ? (
        <article className="panel">
          <h3>Attachments</h3>
          <ul className="link-list">
            {entry.attachmentUrls.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {entry.linkUrls.length > 0 ? (
        <article className="panel">
          <h3>Related Links</h3>
          <ul className="link-list">
            {entry.linkUrls.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
