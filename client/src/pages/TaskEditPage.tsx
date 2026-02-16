import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadInput } from "../components/UploadInput";
import { useToast } from "../components/ToastProvider";
import { api } from "../lib/api";
import { getStoredRole } from "../lib/auth";
import type { Category, TaskCard } from "../types";

interface TaskFormState {
  title: string;
  objective: string;
  owner: string;
  dueDate: string;
  priority: TaskCard["priority"];
  status: TaskCard["status"];
  categoryId: number;
  tags: string;
  notes: string;
  relatedEntryIds: string;
  stepsChecklist: { text: string; done: boolean }[];
  imageUrls: string[];
  attachmentUrls: string[];
}

export function TaskEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const role = getStoredRole() ?? "Editor";

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<TaskFormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.get<TaskCard>(`/tasks/${id}`), api.get<Category[]>("/categories")])
      .then(([task, categoryList]) => {
        setCategories(categoryList);
        setForm({
          title: task.title,
          objective: task.objective,
          owner: task.owner,
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
          priority: task.priority,
          status: task.status,
          categoryId: task.categoryId,
          tags: task.tags.join(", "),
          notes: task.notes || "",
          relatedEntryIds: task.relatedEntryIds.join(", "),
          stepsChecklist: task.stepsChecklist,
          imageUrls: task.imageUrls,
          attachmentUrls: task.attachmentUrls
        });
      })
      .catch((error) => pushToast(error instanceof Error ? error.message : "Failed to load task", "error"));
  }, [id, pushToast]);

  if (!form) return <p className="muted">Loading task...</p>;

  const setField = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        objective: form.objective,
        owner: form.owner,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        priority: form.priority,
        status: form.status,
        categoryId: Number(form.categoryId),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: form.notes || null,
        relatedEntryIds: form.relatedEntryIds
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isFinite(item)),
        stepsChecklist: form.stepsChecklist,
        imageUrls: form.imageUrls,
        attachmentUrls: form.attachmentUrls,
        updatedBy: role
      };
      await api.put(`/tasks/${id}`, payload);
      pushToast("Task updated", "success");
      navigate(`/library/task/${id}`);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Failed to update task", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-shell">
      <header className="page-header">
        <h2>Edit Task</h2>
      </header>

      <form className="panel stack" onSubmit={save}>
        <div className="field-group">
          <label className="field-label">Title</label>
          <input value={form.title} onChange={(event) => setField("title", event.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">Objective</label>
          <textarea value={form.objective} onChange={(event) => setField("objective", event.target.value)} rows={4} required />
        </div>
        <div className="field-grid">
          <div className="field-group">
            <label className="field-label">Owner</label>
            <input value={form.owner} onChange={(event) => setField("owner", event.target.value)} required />
          </div>
          <div className="field-group">
            <label className="field-label">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(event) => setField("dueDate", event.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Priority</label>
            <select value={form.priority} onChange={(event) => setField("priority", event.target.value as TaskCard["priority"])}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Status</label>
            <select value={form.status} onChange={(event) => setField("status", event.target.value as TaskCard["status"])}>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
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
        </div>

        <div className="field-group">
          <label className="field-label">Tags</label>
          <input value={form.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="bug, release" />
        </div>

        <div className="field-group">
          <label className="field-label">Related Entry IDs</label>
          <input
            value={form.relatedEntryIds}
            onChange={(event) => setField("relatedEntryIds", event.target.value)}
            placeholder="1, 2, 3"
          />
        </div>

        <div className="field-group">
          <label className="field-label">Checklist</label>
          {form.stepsChecklist.map((item, index) => (
            <div className="checklist-row" key={`${item.text}-${index}`}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={(event) => {
                  const next = [...form.stepsChecklist];
                  next[index] = { ...next[index], done: event.target.checked };
                  setField("stepsChecklist", next);
                }}
              />
              <input
                value={item.text}
                onChange={(event) => {
                  const next = [...form.stepsChecklist];
                  next[index] = { ...next[index], text: event.target.value };
                  setField("stepsChecklist", next);
                }}
              />
              <button
                className="btn btn-small"
                type="button"
                onClick={() => setField("stepsChecklist", form.stepsChecklist.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setField("stepsChecklist", [...form.stepsChecklist, { text: "", done: false }])}
          >
            Add Checklist Item
          </button>
        </div>

        <UploadInput
          label="Task Images"
          accept="image/png,image/jpeg,image/webp"
          urls={form.imageUrls}
          onChange={(urls) => setField("imageUrls", urls)}
        />

        <UploadInput
          label="Task Attachments"
          accept="application/pdf,application/zip,application/x-zip-compressed"
          urls={form.attachmentUrls}
          onChange={(urls) => setField("attachmentUrls", urls)}
        />

        <div className="field-group">
          <label className="field-label">Notes</label>
          <textarea value={form.notes} onChange={(event) => setField("notes", event.target.value)} rows={5} />
        </div>

        <div className="inline-row">
          <button className="btn btn-secondary" type="button" onClick={() => navigate(`/library/task/${id}`)}>
            Cancel
          </button>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Task"}
          </button>
        </div>
      </form>
    </section>
  );
}
