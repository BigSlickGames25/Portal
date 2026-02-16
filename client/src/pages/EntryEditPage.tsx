import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadInput } from "../components/UploadInput";
import { useToast } from "../components/ToastProvider";
import { api } from "../lib/api";
import { getStoredRole } from "../lib/auth";
import type { Category, LibraryEntry } from "../types";

interface EntryFormState {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: number;
  tags: string;
  status: LibraryEntry["status"];
  coverImageUrl: string;
  galleryImageUrls: string[];
  attachmentUrls: string[];
  linkUrls: string[];
}

export function EntryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const role = getStoredRole() ?? "Editor";

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<EntryFormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.get<LibraryEntry>(`/entries/${id}`), api.get<Category[]>("/categories")])
      .then(([entry, categoryList]) => {
        setCategories(categoryList);
        setForm({
          title: entry.title,
          shortDescription: entry.shortDescription,
          fullDescription: entry.fullDescription,
          categoryId: entry.categoryId,
          tags: entry.tags.join(", "),
          status: entry.status,
          coverImageUrl: entry.coverImageUrl || "",
          galleryImageUrls: entry.galleryImageUrls,
          attachmentUrls: entry.attachmentUrls,
          linkUrls: entry.linkUrls
        });
      })
      .catch((error) => pushToast(error instanceof Error ? error.message : "Failed to load entry", "error"));
  }, [id, pushToast]);

  if (!form) return <p className="muted">Loading entry...</p>;

  const setField = <K extends keyof EntryFormState>(key: K, value: EntryFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        categoryId: Number(form.categoryId),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status: form.status,
        coverImageUrl: form.coverImageUrl || null,
        galleryImageUrls: form.galleryImageUrls,
        attachmentUrls: form.attachmentUrls,
        linkUrls: form.linkUrls,
        updatedBy: role
      };
      await api.put(`/entries/${id}`, payload);
      pushToast("Entry updated", "success");
      navigate(`/library/entry/${id}`);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Failed to update entry", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-shell">
      <header className="page-header">
        <h2>Edit Entry</h2>
      </header>

      <form className="panel stack" onSubmit={save}>
        <div className="field-group">
          <label className="field-label">Title</label>
          <input value={form.title} onChange={(event) => setField("title", event.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">Short Description</label>
          <textarea value={form.shortDescription} onChange={(event) => setField("shortDescription", event.target.value)} rows={3} required />
        </div>
        <div className="field-group">
          <label className="field-label">Full Description</label>
          <textarea value={form.fullDescription} onChange={(event) => setField("fullDescription", event.target.value)} rows={8} required />
        </div>
        <div className="field-grid">
          <div className="field-group">
            <label className="field-label">Category</label>
            <select value={form.categoryId} onChange={(event) => setField("categoryId", Number(event.target.value))}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Status</label>
            <select value={form.status} onChange={(event) => setField("status", event.target.value as LibraryEntry["status"])}>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Tags</label>
          <input value={form.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="tag1, tag2" />
        </div>
        <div className="field-group">
          <label className="field-label">Cover Image URL</label>
          <input value={form.coverImageUrl} onChange={(event) => setField("coverImageUrl", event.target.value)} placeholder="https://..." />
        </div>

        <UploadInput
          label="Gallery Images"
          accept="image/png,image/jpeg,image/webp"
          urls={form.galleryImageUrls}
          onChange={(urls) => setField("galleryImageUrls", urls)}
        />

        <UploadInput
          label="Attachments"
          accept="application/pdf,application/zip,application/x-zip-compressed"
          urls={form.attachmentUrls}
          onChange={(urls) => setField("attachmentUrls", urls)}
        />

        <div className="field-group">
          <label className="field-label">Links</label>
          <textarea
            value={form.linkUrls.join("\n")}
            onChange={(event) =>
              setField(
                "linkUrls",
                event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
              )
            }
            rows={4}
            placeholder="One URL per line"
          />
        </div>

        <div className="inline-row">
          <button className="btn btn-secondary" type="button" onClick={() => navigate(`/library/entry/${id}`)}>
            Cancel
          </button>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </form>
    </section>
  );
}
