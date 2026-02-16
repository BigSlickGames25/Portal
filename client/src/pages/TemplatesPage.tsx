import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import type { Template, TemplateFieldDefinition, TemplateFieldType, TemplateStepDefinition, TemplateType } from "../types";

const fieldTypes: TemplateFieldType[] = [
  "text",
  "textarea",
  "richtext",
  "select",
  "multiselect",
  "tags",
  "date",
  "number",
  "checkbox",
  "checklist",
  "imageUpload",
  "fileUpload",
  "links"
];

interface TemplateForm {
  id?: number;
  name: string;
  type: TemplateType;
  description: string;
  fields: TemplateFieldDefinition[];
  steps: TemplateStepDefinition[];
}

const emptyTemplateForm: TemplateForm = {
  name: "",
  type: "ENTRY",
  description: "",
  fields: [],
  steps: []
};

function defaultField(index: number): TemplateFieldDefinition {
  return {
    key: `field_${index + 1}`,
    label: `Field ${index + 1}`,
    type: "text",
    required: false,
    helpText: "",
    defaultValue: "",
    options: []
  };
}

function defaultStep(index: number): TemplateStepDefinition {
  return {
    stepTitle: `Step ${index + 1}`,
    stepDescription: "",
    fieldKeys: []
  };
}

export function TemplatesPage() {
  const { pushToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState<TemplateForm>(emptyTemplateForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await api.get<Template[]>("/templates");
    setTemplates(data);
  };

  useEffect(() => {
    load().catch((error) => pushToast(error instanceof Error ? error.message : "Failed to load templates", "error"));
  }, [pushToast]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.fields.length === 0) {
      pushToast("At least one field is required", "error");
      return;
    }
    if (form.steps.length === 0) {
      pushToast("At least one step is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        description: form.description,
        fields: form.fields.map((field) => ({
          ...field,
          options: field.options ?? []
        })),
        steps: form.steps
      };

      if (form.id) {
        await api.put(`/templates/${form.id}`, payload);
        pushToast("Template updated", "success");
      } else {
        await api.post("/templates", payload);
        pushToast("Template created", "success");
      }
      setForm(emptyTemplateForm);
      await load();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Template save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const editTemplate = (template: Template) => {
    setForm({
      id: template.id,
      name: template.name,
      type: template.type,
      description: template.description,
      fields: template.fields,
      steps: template.steps
    });
  };

  const removeTemplate = async (id: number) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await api.delete(`/templates/${id}`);
      pushToast("Template deleted", "success");
      await load();
      if (form.id === id) setForm(emptyTemplateForm);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Template delete failed", "error");
    }
  };

  return (
    <section className="page-shell">
      <header className="page-header">
        <h2>Templates</h2>
        <p className="muted">Admin-only template builder for ENTRY and TASK wizard flows.</p>
      </header>

      <form className="panel stack" onSubmit={submit}>
        <div className="field-grid">
          <div className="field-group">
            <label className="field-label">Name</label>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Type</label>
            <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as TemplateType }))}>
              <option value="ENTRY">ENTRY</option>
              <option value="TASK">TASK</option>
            </select>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Description</label>
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} required />
        </div>

        <article className="panel soft">
          <div className="inline-row spread">
            <h3>Field Definitions</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setForm((current) => ({ ...current, fields: [...current.fields, defaultField(current.fields.length)] }))}
            >
              Add Field
            </button>
          </div>

          <div className="stack">
            {form.fields.map((field, index) => (
              <div key={`${field.key}-${index}`} className="panel subtle">
                <div className="field-grid">
                  <div className="field-group">
                    <label className="field-label">Key</label>
                    <input
                      value={field.key}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fields: current.fields.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, key: event.target.value } : item
                          )
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Label</label>
                    <input
                      value={field.label}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fields: current.fields.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          )
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Type</label>
                    <select
                      value={field.type}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fields: current.fields.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, type: event.target.value as TemplateFieldType } : item
                          )
                        }))
                      }
                    >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Required</label>
                    <input
                      type="checkbox"
                      checked={Boolean(field.required)}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fields: current.fields.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, required: event.target.checked } : item
                          )
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="field-grid">
                  <div className="field-group">
                    <label className="field-label">Help Text</label>
                    <input
                      value={field.helpText || ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fields: current.fields.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, helpText: event.target.value } : item
                          )
                        }))
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Default Value</label>
                    <input
                      value={String(field.defaultValue ?? "")}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fields: current.fields.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, defaultValue: event.target.value } : item
                          )
                        }))
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Options (comma-separated)</label>
                    <input
                      value={(field.options || []).join(", ")}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fields: current.fields.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  options: event.target.value
                                    .split(",")
                                    .map((option) => option.trim())
                                    .filter(Boolean)
                                }
                              : item
                          )
                        }))
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-small btn-secondary"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      fields: current.fields.filter((_, itemIndex) => itemIndex !== index)
                    }))
                  }
                >
                  Remove Field
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel soft">
          <div className="inline-row spread">
            <h3>Steps Definition</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setForm((current) => ({ ...current, steps: [...current.steps, defaultStep(current.steps.length)] }))}
            >
              Add Step
            </button>
          </div>

          <div className="stack">
            {form.steps.map((step, index) => (
              <div className="panel subtle" key={`${step.stepTitle}-${index}`}>
                <div className="field-grid">
                  <div className="field-group">
                    <label className="field-label">Step Title</label>
                    <input
                      value={step.stepTitle}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          steps: current.steps.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, stepTitle: event.target.value } : item
                          )
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Step Description</label>
                    <input
                      value={step.stepDescription || ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          steps: current.steps.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, stepDescription: event.target.value } : item
                          )
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Field Keys (comma-separated)</label>
                  <input
                    value={step.fieldKeys.join(", ")}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        steps: current.steps.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                fieldKeys: event.target.value
                                  .split(",")
                                  .map((fieldKey) => fieldKey.trim())
                                  .filter(Boolean)
                              }
                            : item
                        )
                      }))
                    }
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-small btn-secondary"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      steps: current.steps.filter((_, itemIndex) => itemIndex !== index)
                    }))
                  }
                >
                  Remove Step
                </button>
              </div>
            ))}
          </div>
        </article>

        <div className="inline-row">
          <button className="btn btn-secondary" type="button" onClick={() => setForm(emptyTemplateForm)}>
            Clear
          </button>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : form.id ? "Update Template" : "Create Template"}
          </button>
        </div>
      </form>

      <article className="panel">
        <h3>Saved Templates</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>{template.type}</td>
                  <td>{new Date(template.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="inline-row">
                      <button className="btn btn-small btn-secondary" type="button" onClick={() => editTemplate(template)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-secondary" type="button" onClick={() => removeTemplate(template.id)}>
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
