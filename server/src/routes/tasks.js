import { Router } from "express";
import { prisma } from "../prisma.js";
import { validateBody } from "../middleware/validate.js";
import { requireRoles, getRole } from "../middleware/role.js";
import { taskCreateSchema, taskUpdateSchema } from "../validators/taskSchemas.js";
import { asStringArray } from "../lib/normalize.js";

export const tasksRouter = Router();

function getTaskWhere(query) {
  const where = {};
  const validStatuses = new Set(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]);
  const validPriorities = new Set(["LOW", "MEDIUM", "HIGH"]);
  if (query.search) {
    where.OR = [
      { title: { contains: String(query.search) } },
      { objective: { contains: String(query.search) } },
      { owner: { contains: String(query.search) } },
      { notes: { contains: String(query.search) } }
    ];
  }
  if (query.categoryId && Number.isFinite(Number(query.categoryId))) {
    where.categoryId = Number(query.categoryId);
  }
  if (query.status && validStatuses.has(String(query.status))) {
    where.status = String(query.status);
  }
  if (query.priority && validPriorities.has(String(query.priority))) {
    where.priority = String(query.priority);
  }
  if (query.owner) {
    where.owner = { contains: String(query.owner) };
  }
  return where;
}

tasksRouter.get("/", async (req, res) => {
  const where = getTaskWhere(req.query);
  const tagFilters = asStringArray(req.query.tags ?? req.query.tag).map((item) => item.toLowerCase());

  let tasks = await prisma.taskCard.findMany({
    where,
    include: { category: true },
    orderBy: { updatedAt: "desc" }
  });

  if (tagFilters.length > 0) {
    tasks = tasks.filter((task) => {
      const tags = Array.isArray(task.tags) ? task.tags.map((tag) => String(tag).toLowerCase()) : [];
      return tagFilters.every((tag) => tags.includes(tag));
    });
  }

  res.json(tasks);
});

tasksRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const task = await prisma.taskCard.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!task) {
    return res.status(404).json({ error: "NotFound" });
  }
  return res.json(task);
});

tasksRouter.post("/", requireRoles(["Admin", "Editor"]), validateBody(taskCreateSchema), async (req, res) => {
  const role = getRole(req);
  const task = await prisma.taskCard.create({
    data: {
      ...req.validatedBody,
      dueDate: req.validatedBody.dueDate ? new Date(req.validatedBody.dueDate) : null,
      createdBy: req.validatedBody.createdBy || role,
      updatedBy: req.validatedBody.updatedBy || role
    },
    include: { category: true }
  });
  return res.status(201).json(task);
});

tasksRouter.put("/:id", requireRoles(["Admin", "Editor"]), validateBody(taskUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const role = getRole(req);

  const task = await prisma.taskCard.update({
    where: { id },
    data: {
      ...req.validatedBody,
      dueDate:
        req.validatedBody.dueDate === undefined
          ? undefined
          : req.validatedBody.dueDate
            ? new Date(req.validatedBody.dueDate)
            : null,
      updatedBy: req.validatedBody.updatedBy || role
    },
    include: { category: true }
  });
  return res.json(task);
});

tasksRouter.post("/:id/duplicate", requireRoles(["Admin", "Editor"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const existing = await prisma.taskCard.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "NotFound" });
  }
  const role = getRole(req);
  const task = await prisma.taskCard.create({
    data: {
      title: `${existing.title} (Copy)`,
      objective: existing.objective,
      stepsChecklist: existing.stepsChecklist,
      owner: existing.owner,
      dueDate: existing.dueDate,
      priority: existing.priority,
      status: "TODO",
      categoryId: existing.categoryId,
      tags: existing.tags,
      imageUrls: existing.imageUrls,
      attachmentUrls: existing.attachmentUrls,
      notes: existing.notes,
      relatedEntryIds: existing.relatedEntryIds,
      createdBy: role,
      updatedBy: role
    },
    include: { category: true }
  });
  return res.status(201).json(task);
});

tasksRouter.post("/:id/archive", requireRoles(["Admin", "Editor"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const role = getRole(req);
  const task = await prisma.taskCard.update({
    where: { id },
    data: { status: "ARCHIVED", updatedBy: role },
    include: { category: true }
  });
  return res.json(task);
});

tasksRouter.delete("/:id", requireRoles(["Admin"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  await prisma.taskCard.delete({ where: { id } });
  return res.status(204).send();
});
