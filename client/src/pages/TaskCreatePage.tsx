import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TemplateWizard } from "../components/TemplateWizard";
import { useToast } from "../components/ToastProvider";
import { api } from "../lib/api";
import { getStoredRole } from "../lib/auth";
import { wizardValuesToTask } from "../lib/payloads";
import type { Category, Template } from "../types";

export function TaskCreatePage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const role = getStoredRole() ?? "Viewer";

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<Template[]>("/templates?type=TASK"), api.get<Category[]>("/categories")])
      .then(([templateData, categoryData]) => {
        setTemplates(templateData);
        setCategories(categoryData);
        setSelectedTemplateId(templateData[0]?.id ?? "");
      })
      .catch((error) => pushToast(error instanceof Error ? error.message : "Failed to load templates", "error"))
      .finally(() => setLoading(false));
  }, [pushToast]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

  const createTask = async (values: Record<string, unknown>) => {
    const payload = wizardValuesToTask(values, categories, role);
    const created = await api.post<{ id: number }>("/tasks", payload);
    pushToast("Task created successfully", "success");
    navigate(`/library/task/${created.id}`);
  };

  if (loading) return <p className="muted">Loading task templates...</p>;

  return (
    <section className="page-shell">
      <header className="page-header">
        <h2>Create Task from Template</h2>
      </header>

      <article className="panel">
        <label className="field-label">Select Template</label>
        <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(Number(event.target.value))}>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </article>

      {selectedTemplate ? (
        <TemplateWizard
          template={selectedTemplate}
          categories={categories}
          onCancel={() => navigate("/library")}
          onSubmit={createTask}
          submitLabel="Create Task"
        />
      ) : (
        <article className="panel">
          <p className="muted">No TASK templates found. Ask an Admin to create one.</p>
        </article>
      )}
    </section>
  );
}
