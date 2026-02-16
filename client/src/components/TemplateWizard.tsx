import { useEffect, useMemo, useState } from "react";
import type { Category, Template, TemplateFieldDefinition, TemplateStepDefinition } from "../types";
import { UploadInput } from "./UploadInput";

interface TemplateWizardProps {
  template: Template;
  categories: Category[];
  initialValues?: Record<string, unknown>;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

function getDefaultValue(field: TemplateFieldDefinition) {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "checkbox") return false;
  if (field.type === "multiselect" || field.type === "tags" || field.type === "imageUpload" || field.type === "fileUpload" || field.type === "links") return [];
  if (field.type === "checklist") return [];
  return "";
}

function valueAsArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item));
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isMissingValue(value: unknown) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function TemplateWizard({ template, categories, initialValues, submitLabel = "Save", onCancel, onSubmit }: TemplateWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const initialMap = useMemo(() => {
    const map: Record<string, unknown> = {};
    for (const field of template.fields) {
      map[field.key] = initialValues?.[field.key] ?? getDefaultValue(field);
    }
    return map;
  }, [template, initialValues]);

  const [values, setValues] = useState<Record<string, unknown>>(initialMap);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialMap);
    setStepIndex(0);
    setError(null);
  }, [template.id, initialMap]);

  const steps = template.steps.length > 0 ? template.steps : [{ stepTitle: "Details", stepDescription: "", fieldKeys: template.fields.map((field) => field.key) }];
  const isReviewStep = stepIndex === steps.length;

  const fieldsByKey = useMemo(() => {
    const map = new Map<string, TemplateFieldDefinition>();
    template.fields.forEach((field) => map.set(field.key, field));
    return map;
  }, [template.fields]);

  const currentStep: TemplateStepDefinition | null = isReviewStep ? null : steps[stepIndex];
  const stepFields = currentStep?.fieldKeys.map((key) => fieldsByKey.get(key)).filter((field): field is TemplateFieldDefinition => Boolean(field)) ?? [];

  const updateValue = (key: string, value: unknown) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const validateCurrentStep = () => {
    if (isReviewStep || !currentStep) return true;
    for (const key of currentStep.fieldKeys) {
      const field = fieldsByKey.get(key);
      if (!field) continue;
      if (field.required && isMissingValue(values[field.key])) {
        setError(`"${field.label}" is required before continuing.`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStepIndex((current) => Math.min(current + 1, steps.length));
  };

  const handleBack = () => {
    setError(null);
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: TemplateFieldDefinition) => {
    const fieldValue = values[field.key];

    const categoryOptions = categories.map((category) => ({
      label: category.name,
      value: String(category.id)
    }));
    const rawOptions = (field.options ?? []).map((option) => {
      if (option.includes(":")) {
        const [value, ...labelParts] = option.split(":");
        return { value, label: labelParts.join(":") || value };
      }
      return { value: option, label: option };
    });
    const options = field.key === "categoryId" && categoryOptions.length > 0 ? categoryOptions : rawOptions;

    if (field.type === "textarea" || field.type === "richtext") {
      return (
        <textarea
          value={String(fieldValue ?? "")}
          onChange={(event) => updateValue(field.key, event.target.value)}
          rows={field.type === "richtext" ? 8 : 4}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select value={String(fieldValue ?? "")} onChange={(event) => updateValue(field.key, event.target.value)}>
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "multiselect") {
      const selected = valueAsArray(fieldValue);
      return (
        <div className="checkbox-list">
          {options.map((option) => (
            <label key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={(event) => {
                  if (event.target.checked) {
                    updateValue(field.key, [...selected, option.value]);
                  } else {
                    updateValue(
                      field.key,
                      selected.filter((item) => item !== option.value)
                    );
                  }
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "tags") {
      return (
        <input
          type="text"
          value={valueAsArray(fieldValue).join(", ")}
          onChange={(event) => updateValue(field.key, valueAsArray(event.target.value))}
          placeholder="tag1, tag2, tag3"
        />
      );
    }

    if (field.type === "date") {
      const dateValue = fieldValue ? String(fieldValue).slice(0, 10) : "";
      return <input type="date" value={dateValue} onChange={(event) => updateValue(field.key, event.target.value)} />;
    }

    if (field.type === "number") {
      return <input type="number" value={String(fieldValue ?? "")} onChange={(event) => updateValue(field.key, Number(event.target.value))} />;
    }

    if (field.type === "checkbox") {
      return (
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={Boolean(fieldValue)}
            onChange={(event) => updateValue(field.key, event.target.checked)}
          />
          Enabled
        </label>
      );
    }

    if (field.type === "checklist") {
      const checklist = Array.isArray(fieldValue) ? (fieldValue as { text: string; done: boolean }[]) : [];
      return (
        <div className="stack">
          {checklist.map((item, index) => (
            <div key={`${item.text}-${index}`} className="checklist-row">
              <input
                type="checkbox"
                checked={Boolean(item.done)}
                onChange={(event) => {
                  const updated = checklist.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, done: event.target.checked } : entry
                  );
                  updateValue(field.key, updated);
                }}
              />
              <input
                type="text"
                value={item.text}
                onChange={(event) => {
                  const updated = checklist.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, text: event.target.value } : entry
                  );
                  updateValue(field.key, updated);
                }}
              />
              <button
                type="button"
                className="btn btn-small"
                onClick={() => updateValue(field.key, checklist.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => updateValue(field.key, [...checklist, { text: "", done: false }])}
          >
            Add Checklist Item
          </button>
        </div>
      );
    }

    if (field.type === "links") {
      const links = valueAsArray(fieldValue);
      return (
        <div className="stack">
          {links.map((link, index) => (
            <div className="inline-row" key={`${link}-${index}`}>
              <input
                type="url"
                value={link}
                onChange={(event) => {
                  const next = [...links];
                  next[index] = event.target.value;
                  updateValue(field.key, next);
                }}
              />
              <button type="button" className="btn btn-small" onClick={() => updateValue(field.key, links.filter((_, i) => i !== index))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => updateValue(field.key, [...links, ""])}>
            Add Link
          </button>
        </div>
      );
    }

    if (field.type === "imageUpload") {
      return (
        <UploadInput
          label="Images"
          accept="image/png,image/jpeg,image/webp"
          urls={valueAsArray(fieldValue)}
          onChange={(urls) => updateValue(field.key, urls)}
        />
      );
    }

    if (field.type === "fileUpload") {
      return (
        <UploadInput
          label="Files"
          accept="application/pdf,application/zip,application/x-zip-compressed"
          urls={valueAsArray(fieldValue)}
          onChange={(urls) => updateValue(field.key, urls)}
        />
      );
    }

    return (
      <input type="text" value={String(fieldValue ?? "")} onChange={(event) => updateValue(field.key, event.target.value)} />
    );
  };

  return (
    <div className="wizard-shell">
      <div className="wizard-head">
        <h3>{template.name}</h3>
        <p className="muted">{template.description}</p>
      </div>

      <div className="wizard-progress">
        {steps.map((step, index) => (
          <button
            key={`${step.stepTitle}-${index}`}
            className={`wizard-step ${index === stepIndex ? "is-active" : ""} ${index < stepIndex ? "is-complete" : ""}`}
            type="button"
            onClick={() => setStepIndex(index)}
          >
            {index + 1}. {step.stepTitle}
          </button>
        ))}
        <button className={`wizard-step ${isReviewStep ? "is-active" : ""}`} type="button" onClick={() => setStepIndex(steps.length)}>
          {steps.length + 1}. Review
        </button>
      </div>

      {!isReviewStep && currentStep ? (
        <section className="panel">
          <h4>{currentStep.stepTitle}</h4>
          <p className="muted">{currentStep.stepDescription || "Complete required fields to continue."}</p>
          <div className="field-grid">
            {stepFields.map((field) => (
              <div className="field-group" key={field.key}>
                <label className="field-label">
                  {field.label} {field.required ? <span className="required">*</span> : null}
                </label>
                {renderField(field)}
                {field.helpText ? <p className="help-text">{field.helpText}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel">
          <h4>Review Summary</h4>
          <div className="summary-list">
            {template.fields.map((field) => (
              <div className="summary-item" key={field.key}>
                <strong>{field.label}</strong>
                <pre>{JSON.stringify(values[field.key] ?? null, null, 2)}</pre>
              </div>
            ))}
          </div>
        </section>
      )}

      {error ? <p className="error-text">{error}</p> : null}

      <div className="wizard-actions">
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-secondary" type="button" disabled={stepIndex === 0 || saving} onClick={handleBack}>
          Back
        </button>
        {!isReviewStep ? (
          <button className="btn" type="button" onClick={handleNext} disabled={saving}>
            Next
          </button>
        ) : (
          <button className="btn" type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
