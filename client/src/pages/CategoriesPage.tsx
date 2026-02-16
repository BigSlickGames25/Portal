import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { Category } from "../types";
import { useToast } from "../components/ToastProvider";

interface CategoryForm {
  id?: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
}

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  icon: "",
  color: "",
  sortOrder: 0
};

export function CategoriesPage() {
  const { pushToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await api.get<Category[]>("/categories");
    setCategories(data);
  };

  useEffect(() => {
    load().catch((error) => pushToast(error instanceof Error ? error.message : "Failed to load categories", "error"));
  }, [pushToast]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        icon: form.icon || null,
        color: form.color || null,
        sortOrder: Number(form.sortOrder) || 0
      };
      if (form.id) {
        await api.put(`/categories/${form.id}`, payload);
        pushToast("Category updated", "success");
      } else {
        await api.post("/categories", payload);
        pushToast("Category created", "success");
      }
      setForm(emptyForm);
      await load();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Category save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category: Category) => {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon || "",
      color: category.color || "",
      sortOrder: category.sortOrder
    });
  };

  const removeCategory = async (id: number) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      pushToast("Category deleted", "success");
      await load();
      if (form.id === id) setForm(emptyForm);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Category delete failed", "error");
    }
  };

  return (
    <section className="page-shell">
      <header className="page-header">
        <h2>Categories</h2>
        <p className="muted">Admin-only category management.</p>
      </header>

      <form className="panel field-grid" onSubmit={submit}>
        <div className="field-group">
          <label className="field-label">Name</label>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
        </div>
        <div className="field-group">
          <label className="field-label">Description</label>
          <input
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            required
          />
        </div>
        <div className="field-group">
          <label className="field-label">Icon (optional)</label>
          <input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} />
        </div>
        <div className="field-group">
          <label className="field-label">Color (optional)</label>
          <input value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} />
        </div>
        <div className="field-group">
          <label className="field-label">Sort Order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
          />
        </div>
        <div className="inline-row">
          <button type="button" className="btn btn-secondary" onClick={() => setForm(emptyForm)}>
            Clear
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : form.id ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>

      <article className="panel">
        <h3>Existing Categories</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Sort</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>{category.sortOrder}</td>
                  <td>
                    <div className="inline-row">
                      <button className="btn btn-small btn-secondary" type="button" onClick={() => editCategory(category)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-secondary" type="button" onClick={() => removeCategory(category.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
