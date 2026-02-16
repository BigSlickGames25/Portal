import type { Category, LibraryEntry, Role, TaskCard } from "../types";

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function wizardValuesToEntry(values: Record<string, unknown>, categories: Category[], role: Role): Omit<LibraryEntry, "id" | "createdAt" | "updatedAt" | "category"> {
  const fallbackCategory = categories[0]?.id || 1;
  const coverImageUrlValue = Array.isArray(values.coverImageUrl)
    ? String(values.coverImageUrl[0] ?? "")
    : values.coverImageUrl
      ? String(values.coverImageUrl)
      : "";
  return {
    title: String(values.title || "Untitled Entry"),
    shortDescription: String(values.shortDescription || ""),
    fullDescription: String(values.fullDescription || ""),
    categoryId: toNumber(values.categoryId, fallbackCategory),
    tags: toArray(values.tags),
    status: (String(values.status || "DRAFT") as LibraryEntry["status"]),
    coverImageUrl: coverImageUrlValue || null,
    galleryImageUrls: toArray(values.galleryImageUrls),
    attachmentUrls: toArray(values.attachmentUrls),
    linkUrls: toArray(values.linkUrls),
    createdBy: String(values.createdBy || role),
    updatedBy: String(values.updatedBy || role)
  };
}

export function wizardValuesToTask(values: Record<string, unknown>, categories: Category[], role: Role): Omit<TaskCard, "id" | "createdAt" | "updatedAt" | "category"> {
  const fallbackCategory = categories[0]?.id || 1;
  const checklist = Array.isArray(values.stepsChecklist)
    ? values.stepsChecklist.map((item) => {
        const record = item as { text?: unknown; done?: unknown };
        return {
          text: String(record.text || ""),
          done: Boolean(record.done)
        };
      })
    : [];

  const relatedEntryIds = Array.isArray(values.relatedEntryIds)
    ? values.relatedEntryIds.map((item) => Number(item)).filter((item) => Number.isFinite(item))
    : [];

  return {
    title: String(values.title || "Untitled Task"),
    objective: String(values.objective || ""),
    stepsChecklist: checklist,
    owner: String(values.owner || role),
    dueDate: values.dueDate ? new Date(String(values.dueDate)).toISOString() : null,
    priority: String(values.priority || "MEDIUM") as TaskCard["priority"],
    status: String(values.status || "TODO") as TaskCard["status"],
    categoryId: toNumber(values.categoryId, fallbackCategory),
    tags: toArray(values.tags),
    imageUrls: toArray(values.imageUrls),
    attachmentUrls: toArray(values.attachmentUrls),
    notes: values.notes ? String(values.notes) : null,
    relatedEntryIds,
    createdBy: String(values.createdBy || role),
    updatedBy: String(values.updatedBy || role)
  };
}
