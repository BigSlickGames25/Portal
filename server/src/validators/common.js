import { z } from "zod";

export const templateFieldTypes = [
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

export const templateFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(templateFieldTypes),
  required: z.boolean().optional().default(false),
  helpText: z.string().optional().nullable(),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional().default([])
});

export const templateStepSchema = z.object({
  stepTitle: z.string().min(1),
  stepDescription: z.string().optional().nullable(),
  fieldKeys: z.array(z.string()).min(1)
});

export const checklistItemSchema = z.object({
  text: z.string().min(1),
  done: z.boolean().optional().default(false)
});
