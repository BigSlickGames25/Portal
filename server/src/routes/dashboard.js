import { Router } from "express";
import { prisma } from "../prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_req, res) => {
  const [categories, templates, entries, tasks] = await Promise.all([
    prisma.category.count(),
    prisma.template.count(),
    prisma.libraryEntry.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.taskCard.count({ where: { status: { not: "ARCHIVED" } } })
  ]);

  res.json({
    categories,
    templates,
    entries,
    tasks
  });
});
