import { Router } from "express";
import { prisma } from "../prisma.js";
import { validateBody } from "../middleware/validate.js";
import { requireRoles } from "../middleware/role.js";
import { categoryCreateSchema, categoryUpdateSchema } from "../validators/categorySchemas.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });
  res.json(categories);
});

categoriesRouter.post("/", requireRoles(["Admin"]), validateBody(categoryCreateSchema), async (req, res) => {
  const category = await prisma.category.create({ data: req.validatedBody });
  res.status(201).json(category);
});

categoriesRouter.put("/:id", requireRoles(["Admin"]), validateBody(categoryUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const category = await prisma.category.update({
    where: { id },
    data: req.validatedBody
  });
  return res.json(category);
});

categoriesRouter.delete("/:id", requireRoles(["Admin"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const entryCount = await prisma.libraryEntry.count({ where: { categoryId: id } });
  const taskCount = await prisma.taskCard.count({ where: { categoryId: id } });
  if (entryCount > 0 || taskCount > 0) {
    return res.status(400).json({
      error: "CategoryInUse",
      detail: "Cannot delete category while entries or tasks reference it."
    });
  }

  await prisma.category.delete({ where: { id } });
  return res.status(204).send();
});
