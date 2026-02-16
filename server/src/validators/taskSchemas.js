import { z } from "zod";
import { checklistItemSchema } from "./common.js";

export const taskCreateSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  stepsChecklist: z.array(checklistItemSchema).optional().default([]),
  owner: z.string().min(1),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]).optional().default("TODO"),
  categoryId: z.number().int().positive(),
  tags: z.array(z.string()).optional().default([]),
  imageUrls: z.array(z.string()).optional().default([]),
  attachmentUrls: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
  relatedEntryIds: z.array(z.number().int().positive()).optional().default([]),
  createdBy: z.string().min(1).optional().default("system"),
  updatedBy: z.string().min(1).optional().default("system")
});

export const taskUpdateSchema = taskCreateSchema
  .omit({ createdBy: true })
  .partial()
  .extend({
    updatedBy: z.string().min(1).optional().default("system")
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required for update.");
