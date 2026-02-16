export type Role = "Admin" | "Editor" | "Viewer";

export interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type TemplateType = "ENTRY" | "TASK";
export type EntryStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";

export type TemplateFieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "select"
  | "multiselect"
  | "tags"
  | "date"
  | "number"
  | "checkbox"
  | "checklist"
  | "imageUpload"
  | "fileUpload"
  | "links";

export interface TemplateFieldDefinition {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  helpText?: string | null;
  defaultValue?: unknown;
  options?: string[];
}

export interface TemplateStepDefinition {
  stepTitle: string;
  stepDescription?: string | null;
  fieldKeys: string[];
}

export interface Template {
  id: number;
  name: string;
  type: TemplateType;
  description: string;
  steps: TemplateStepDefinition[];
  fields: TemplateFieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryEntry {
  id: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: number;
  category?: Category;
  tags: string[];
  status: EntryStatus;
  coverImageUrl?: string | null;
  galleryImageUrls: string[];
  attachmentUrls: string[];
  linkUrls: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskChecklistItem {
  text: string;
  done: boolean;
}

export interface TaskCard {
  id: number;
  title: string;
  objective: string;
  stepsChecklist: TaskChecklistItem[];
  owner: string;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  categoryId: number;
  category?: Category;
  tags: string[];
  imageUrls: string[];
  attachmentUrls: string[];
  notes?: string | null;
  relatedEntryIds: number[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface DashboardStats {
  categories: number;
  templates: number;
  entries: number;
  tasks: number;
}
