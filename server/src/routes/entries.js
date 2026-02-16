import { Router } from "express";
import { prisma } from "../prisma.js";
import { validateBody } from "../middleware/validate.js";
import { requireRoles, getRole } from "../middleware/role.js";
import { entryCreateSchema, entryUpdateSchema } from "../validators/entrySchemas.js";
import { asStringArray } from "../lib/normalize.js";

export const entriesRouter = Router();

function getEntryWhere(query) {
  const where = {};
  const validStatuses = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);
  if (query.search) {
    where.OR = [
      { title: { contains: String(query.search) } },
      { shortDescription: { contains: String(query.search) } },
      { fullDescription: { contains: String(query.search) } }
    ];
  }

  if (query.categoryId && Number.isFinite(Number(query.categoryId))) {
    where.categoryId = Number(query.categoryId);
  }

  if (query.status && validStatuses.has(String(query.status))) {
    where.status = String(query.status);
  }

  return where;
}

entriesRouter.get("/", async (req, res) => {
  const where = getEntryWhere(req.query);
  const tagFilters = asStringArray(req.query.tags ?? req.query.tag).map((item) => item.toLowerCase());

  let entries = await prisma.libraryEntry.findMany({
    where,
    include: { category: true },
    orderBy: { updatedAt: "desc" }
  });

  if (tagFilters.length > 0) {
    entries = entries.filter((entry) => {
      const tags = Array.isArray(entry.tags) ? entry.tags.map((tag) => String(tag).toLowerCase()) : [];
      return tagFilters.every((tag) => tags.includes(tag));
    });
  }

  res.json(entries);
});

entriesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const entry = await prisma.libraryEntry.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!entry) {
    return res.status(404).json({ error: "NotFound" });
  }
  return res.json(entry);
});

entriesRouter.post("/", requireRoles(["Admin", "Editor"]), validateBody(entryCreateSchema), async (req, res) => {
  const role = getRole(req);
  const createdBy = req.validatedBody.createdBy || role;
  const updatedBy = req.validatedBody.updatedBy || role;

  const entry = await prisma.libraryEntry.create({
    data: {
      ...req.validatedBody,
      createdBy,
      updatedBy
    },
    include: { category: true }
  });

  return res.status(201).json(entry);
});

entriesRouter.put("/:id", requireRoles(["Admin", "Editor"]), validateBody(entryUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const role = getRole(req);
  const entry = await prisma.libraryEntry.update({
    where: { id },
    data: {
      ...req.validatedBody,
      updatedBy: req.validatedBody.updatedBy || role
    },
    include: { category: true }
  });
  return res.json(entry);
});

entriesRouter.post("/:id/duplicate", requireRoles(["Admin", "Editor"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const existing = await prisma.libraryEntry.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "NotFound" });
  }

  const role = getRole(req);
  const duplicated = await prisma.libraryEntry.create({
    data: {
      title: `${existing.title} (Copy)`,
      shortDescription: existing.shortDescription,
      fullDescription: existing.fullDescription,
      categoryId: existing.categoryId,
      tags: existing.tags,
      status: "DRAFT",
      coverImageUrl: existing.coverImageUrl,
      galleryImageUrls: existing.galleryImageUrls,
      attachmentUrls: existing.attachmentUrls,
      linkUrls: existing.linkUrls,
      createdBy: role,
      updatedBy: role
    },
    include: { category: true }
  });
  return res.status(201).json(duplicated);
});

entriesRouter.post("/:id/archive", requireRoles(["Admin", "Editor"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const role = getRole(req);
  const archived = await prisma.libraryEntry.update({
    where: { id },
    data: { status: "ARCHIVED", updatedBy: role },
    include: { category: true }
  });
  return res.json(archived);
});

entriesRouter.delete("/:id", requireRoles(["Admin"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  await prisma.libraryEntry.delete({ where: { id } });
  return res.status(204).send();
});
