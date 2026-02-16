import { z } from "zod";
import { templateFieldSchema, templateStepSchema } from "./common.js";

export const templateCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ENTRY", "TASK"]),
  description: z.string().min(1),
  steps: z.array(templateStepSchema).min(1),
  fields: z.array(templateFieldSchema).min(1)
});

export const templateUpdateSchema = templateCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required for update."
);
