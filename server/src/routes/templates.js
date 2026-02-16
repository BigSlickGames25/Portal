import { Router } from "express";
import { prisma } from "../prisma.js";
import { validateBody } from "../middleware/validate.js";
import { requireRoles } from "../middleware/role.js";
import { templateCreateSchema, templateUpdateSchema } from "../validators/templateSchemas.js";

export const templatesRouter = Router();

templatesRouter.get("/", async (req, res) => {
  const type = req.query.type ? String(req.query.type) : undefined;
  const where = type && (type === "ENTRY" || type === "TASK") ? { type } : undefined;
  const templates = await prisma.template.findMany({
    where,
    orderBy: [{ type: "asc" }, { updatedAt: "desc" }]
  });
  res.json(templates);
});

templatesRouter.post("/", requireRoles(["Admin"]), validateBody(templateCreateSchema), async (req, res) => {
  const template = await prisma.template.create({
    data: req.validatedBody
  });
  res.status(201).json(template);
});

templatesRouter.put("/:id", requireRoles(["Admin"]), validateBody(templateUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const template = await prisma.template.update({
    where: { id },
    data: req.validatedBody
  });
  return res.json(template);
});

templatesRouter.delete("/:id", requireRoles(["Admin"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  await prisma.template.delete({ where: { id } });
  return res.status(204).send();
});
