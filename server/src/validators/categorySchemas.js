import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0)
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required for update."
);
