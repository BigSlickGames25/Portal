import { z } from "zod";

export const entryCreateSchema = z.object({
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  categoryId: z.number().int().positive(),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
  coverImageUrl: z.string().url().optional().nullable(),
  galleryImageUrls: z.array(z.string()).optional().default([]),
  attachmentUrls: z.array(z.string()).optional().default([]),
  linkUrls: z.array(z.string()).optional().default([]),
  createdBy: z.string().min(1).optional().default("system"),
  updatedBy: z.string().min(1).optional().default("system")
});

export const entryUpdateSchema = entryCreateSchema
  .omit({ createdBy: true })
  .partial()
  .extend({
    updatedBy: z.string().min(1).optional().default("system")
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required for update.");
