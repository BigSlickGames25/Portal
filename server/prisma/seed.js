import { prisma } from "../src/prisma.js";

const categorySeed = [
  { name: "Dev", description: "Engineering guides and implementation notes.", icon: "code", color: "#2563eb", sortOrder: 1 },
  { name: "Design", description: "UI/UX specs and design system materials.", icon: "palette", color: "#ec4899", sortOrder: 2 },
  { name: "Ops", description: "Deployment, monitoring, and operations runbooks.", icon: "server", color: "#10b981", sortOrder: 3 },
  { name: "Marketing", description: "Campaign plans, launch messaging, and assets.", icon: "megaphone", color: "#f59e0b", sortOrder: 4 },
  { name: "Docs", description: "Internal product documentation and manuals.", icon: "book-open", color: "#6b7280", sortOrder: 5 }
];

function buildEntryTemplates() {
  return [
    {
      name: "How-To Guide",
      type: "ENTRY",
      description: "Step-by-step instructional guide template.",
      fields: [
        { key: "title", label: "Title", type: "text", required: true, helpText: "Name of the guide." },
        { key: "shortDescription", label: "Short Description", type: "textarea", required: true },
        { key: "fullDescription", label: "Full Description", type: "richtext", required: true },
        { key: "categoryId", label: "Category", type: "select", required: true, options: [] },
        { key: "tags", label: "Tags", type: "tags", required: false },
        { key: "coverImageUrl", label: "Cover Image", type: "imageUpload", required: false },
        { key: "galleryImageUrls", label: "Gallery Images", type: "imageUpload", required: false },
        { key: "attachmentUrls", label: "Attachments", type: "fileUpload", required: false },
        { key: "linkUrls", label: "Reference Links", type: "links", required: false },
        { key: "status", label: "Status", type: "select", required: true, options: ["DRAFT", "PUBLISHED", "ARCHIVED"], defaultValue: "DRAFT" }
      ],
      steps: [
        { stepTitle: "Basics", stepDescription: "Add title and summary.", fieldKeys: ["title", "shortDescription", "categoryId"] },
        { stepTitle: "Content", stepDescription: "Write full details.", fieldKeys: ["fullDescription", "tags", "status"] },
        { stepTitle: "Media & Files", stepDescription: "Upload optional assets.", fieldKeys: ["coverImageUrl", "galleryImageUrls", "attachmentUrls", "linkUrls"] }
      ]
    },
    {
      name: "Reference Doc",
      type: "ENTRY",
      description: "Structured reference page with links and assets.",
      fields: [
        { key: "title", label: "Document Title", type: "text", required: true },
        { key: "shortDescription", label: "Summary", type: "textarea", required: true },
        { key: "fullDescription", label: "Reference Body", type: "richtext", required: true },
        { key: "categoryId", label: "Category", type: "select", required: true, options: [] },
        { key: "tags", label: "Tags", type: "multiselect", required: false, options: ["backend", "frontend", "release", "ops", "qa"] },
        { key: "attachmentUrls", label: "Supporting Files", type: "fileUpload", required: false },
        { key: "linkUrls", label: "External Links", type: "links", required: false },
        { key: "status", label: "Status", type: "select", required: true, options: ["DRAFT", "PUBLISHED", "ARCHIVED"], defaultValue: "PUBLISHED" }
      ],
      steps: [
        { stepTitle: "Document Info", stepDescription: "Provide top-level metadata.", fieldKeys: ["title", "shortDescription", "categoryId"] },
        { stepTitle: "Reference Content", stepDescription: "Describe complete details.", fieldKeys: ["fullDescription", "tags", "status"] },
        { stepTitle: "Sources", stepDescription: "Attach links and files.", fieldKeys: ["attachmentUrls", "linkUrls"] }
      ]
    }
  ];
}

function buildTaskTemplates() {
  return [
    {
      name: "Bug Fix",
      type: "TASK",
      description: "Template for bug investigation and resolution.",
      fields: [
        { key: "title", label: "Task Title", type: "text", required: true },
        { key: "objective", label: "Objective", type: "textarea", required: true },
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "categoryId", label: "Category", type: "select", required: true, options: [] },
        { key: "priority", label: "Priority", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"], defaultValue: "MEDIUM" },
        { key: "status", label: "Status", type: "select", required: true, options: ["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"], defaultValue: "TODO" },
        { key: "dueDate", label: "Due Date", type: "date", required: false },
        { key: "stepsChecklist", label: "Checklist", type: "checklist", required: false },
        { key: "tags", label: "Tags", type: "tags", required: false },
        { key: "imageUrls", label: "Images", type: "imageUpload", required: false },
        { key: "attachmentUrls", label: "Attachments", type: "fileUpload", required: false },
        { key: "notes", label: "Notes", type: "textarea", required: false }
      ],
      steps: [
        { stepTitle: "Task Setup", stepDescription: "Capture issue context.", fieldKeys: ["title", "objective", "owner", "categoryId"] },
        { stepTitle: "Planning", stepDescription: "Define priority and due date.", fieldKeys: ["priority", "status", "dueDate", "tags"] },
        { stepTitle: "Execution", stepDescription: "Track checklist, files, and notes.", fieldKeys: ["stepsChecklist", "imageUrls", "attachmentUrls", "notes"] }
      ]
    },
    {
      name: "Release Checklist",
      type: "TASK",
      description: "Template for release coordination tasks.",
      fields: [
        { key: "title", label: "Release Task", type: "text", required: true },
        { key: "objective", label: "Release Objective", type: "textarea", required: true },
        { key: "owner", label: "Release Owner", type: "text", required: true },
        { key: "categoryId", label: "Category", type: "select", required: true, options: [] },
        { key: "priority", label: "Priority", type: "select", required: true, options: ["LOW", "MEDIUM", "HIGH"], defaultValue: "HIGH" },
        { key: "status", label: "Status", type: "select", required: true, options: ["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"], defaultValue: "IN_PROGRESS" },
        { key: "stepsChecklist", label: "Release Steps", type: "checklist", required: true },
        { key: "relatedEntryIds", label: "Related Entries", type: "multiselect", required: false, options: [] },
        { key: "attachmentUrls", label: "Artifacts", type: "fileUpload", required: false },
        { key: "notes", label: "Notes", type: "textarea", required: false }
      ],
      steps: [
        { stepTitle: "Scope", stepDescription: "Define release target and owner.", fieldKeys: ["title", "objective", "owner", "categoryId"] },
        { stepTitle: "Checklist", stepDescription: "Track release execution.", fieldKeys: ["priority", "status", "stepsChecklist"] },
        { stepTitle: "Dependencies", stepDescription: "Link references and artifacts.", fieldKeys: ["relatedEntryIds", "attachmentUrls", "notes"] }
      ]
    }
  ];
}

function createEntries(categoryIds) {
  const categories = Object.fromEntries(categoryIds.map((item) => [item.name, item.id]));
  const nowUser = "Admin";
  return [
    {
      title: "Vite Frontend Setup",
      shortDescription: "Reference for spinning up the client workspace with Vite.",
      fullDescription: "Install dependencies, configure routes, and verify local dev server.",
      categoryId: categories.Dev,
      tags: ["frontend", "vite", "setup"],
      status: "PUBLISHED",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: ["https://vitejs.dev/guide/"],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Express API Conventions",
      shortDescription: "Team conventions for API route design and validation.",
      fullDescription: "Use RESTful routes, Zod validation, and explicit response shapes.",
      categoryId: categories.Dev,
      tags: ["backend", "express", "zod"],
      status: "PUBLISHED",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Portal Color Palette",
      shortDescription: "Design tokens and color usage for cards and panels.",
      fullDescription: "Defines color system for dashboard panels, chips, and status badges.",
      categoryId: categories.Design,
      tags: ["design", "ui", "tokens"],
      status: "DRAFT",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Design Review Checklist",
      shortDescription: "Checklist for reviewing user interface updates.",
      fullDescription: "Covers responsiveness, accessibility, spacing, and readability.",
      categoryId: categories.Design,
      tags: ["design", "review"],
      status: "PUBLISHED",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Staging Deployment Runbook",
      shortDescription: "Operations runbook for staging deployments.",
      fullDescription: "How to deploy, verify health checks, and roll back safely.",
      categoryId: categories.Ops,
      tags: ["ops", "deploy", "staging"],
      status: "PUBLISHED",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Production Incident SOP",
      shortDescription: "Standard operating procedure for live incidents.",
      fullDescription: "Triage, communication, mitigation, and postmortem steps.",
      categoryId: categories.Ops,
      tags: ["ops", "incident"],
      status: "PUBLISHED",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Campaign Launch Brief",
      shortDescription: "Template for new campaign launch planning.",
      fullDescription: "Audience, channels, timeline, and success metrics.",
      categoryId: categories.Marketing,
      tags: ["marketing", "launch"],
      status: "DRAFT",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Monthly KPI Narrative",
      shortDescription: "Narrative framework for monthly business KPIs.",
      fullDescription: "Summarize trends, wins, risks, and next actions.",
      categoryId: categories.Marketing,
      tags: ["kpi", "marketing", "reporting"],
      status: "PUBLISHED",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "Portal User Guide",
      shortDescription: "End-user documentation for portal workflows.",
      fullDescription: "How to use library, templates, and card actions.",
      categoryId: categories.Docs,
      tags: ["docs", "portal"],
      status: "PUBLISHED",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    },
    {
      title: "API Integration Notes",
      shortDescription: "Integration notes between frontend and backend modules.",
      fullDescription: "Route contracts, validation rules, and sample payloads.",
      categoryId: categories.Docs,
      tags: ["docs", "api", "integration"],
      status: "DRAFT",
      coverImageUrl: null,
      galleryImageUrls: [],
      attachmentUrls: [],
      linkUrls: [],
      createdBy: nowUser,
      updatedBy: nowUser
    }
  ];
}

function createTasks(categoryIds, entryIds) {
  const categories = Object.fromEntries(categoryIds.map((item) => [item.name, item.id]));
  const refs = entryIds.map((entry) => entry.id);
  const baseChecklist = (items) => items.map((item, index) => ({ text: item, done: index < 1 }));

  return [
    {
      title: "Fix Library Search Debounce Bug",
      objective: "Ensure search input debounces correctly on the Library page.",
      stepsChecklist: baseChecklist(["Reproduce issue", "Patch debounce hook", "Retest filters"]),
      owner: "Avery",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: "HIGH",
      status: "IN_PROGRESS",
      categoryId: categories.Dev,
      tags: ["bug", "frontend"],
      imageUrls: [],
      attachmentUrls: [],
      notes: "Observed duplicate requests on rapid typing.",
      relatedEntryIds: refs.slice(0, 2),
      createdBy: "Editor",
      updatedBy: "Editor"
    },
    {
      title: "Document API Validation Rules",
      objective: "Publish validation matrix for all CRUD endpoints.",
      stepsChecklist: baseChecklist(["Collect schemas", "Write docs", "Review with team"]),
      owner: "Jordan",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "MEDIUM",
      status: "TODO",
      categoryId: categories.Dev,
      tags: ["docs", "backend"],
      imageUrls: [],
      attachmentUrls: [],
      notes: null,
      relatedEntryIds: refs.slice(1, 4),
      createdBy: "Editor",
      updatedBy: "Editor"
    },
    {
      title: "Refresh Dashboard Card Spacing",
      objective: "Improve spacing rhythm for dashboard cards at tablet widths.",
      stepsChecklist: baseChecklist(["Review current spacing", "Update styles", "Screenshot QA"]),
      owner: "Kai",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "LOW",
      status: "IN_PROGRESS",
      categoryId: categories.Design,
      tags: ["design", "layout"],
      imageUrls: [],
      attachmentUrls: [],
      notes: "Need consistency with Library cards.",
      relatedEntryIds: refs.slice(2, 5),
      createdBy: "Editor",
      updatedBy: "Editor"
    },
    {
      title: "Finalize Icon Set for Categories",
      objective: "Choose standard icon names for all category types.",
      stepsChecklist: baseChecklist(["Audit icons", "Map categories", "Update docs"]),
      owner: "Morgan",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      priority: "MEDIUM",
      status: "TODO",
      categoryId: categories.Design,
      tags: ["icons", "design-system"],
      imageUrls: [],
      attachmentUrls: [],
      notes: null,
      relatedEntryIds: refs.slice(0, 1),
      createdBy: "Editor",
      updatedBy: "Editor"
    },
    {
      title: "Staging Smoke Test",
      objective: "Execute full staging smoke pass after deployment.",
      stepsChecklist: baseChecklist(["Deploy staging", "Run smoke checklist", "Publish report"]),
      owner: "Riley",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: "HIGH",
      status: "TODO",
      categoryId: categories.Ops,
      tags: ["ops", "staging", "qa"],
      imageUrls: [],
      attachmentUrls: [],
      notes: "Required before promoting to main.",
      relatedEntryIds: refs.slice(4, 6),
      createdBy: "Admin",
      updatedBy: "Admin"
    },
    {
      title: "Backup Verification Drill",
      objective: "Perform restore rehearsal for shared database backup.",
      stepsChecklist: baseChecklist(["Take snapshot", "Run restore", "Validate app health"]),
      owner: "Taylor",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: "HIGH",
      status: "IN_PROGRESS",
      categoryId: categories.Ops,
      tags: ["backup", "database"],
      imageUrls: [],
      attachmentUrls: [],
      notes: "Shared DB risk mitigation.",
      relatedEntryIds: refs.slice(5, 8),
      createdBy: "Admin",
      updatedBy: "Admin"
    },
    {
      title: "Prepare Launch Announcement Copy",
      objective: "Draft and review launch messaging for portal update.",
      stepsChecklist: baseChecklist(["Draft copy", "Review with PM", "Schedule publication"]),
      owner: "Quinn",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      priority: "MEDIUM",
      status: "TODO",
      categoryId: categories.Marketing,
      tags: ["launch", "copy"],
      imageUrls: [],
      attachmentUrls: [],
      notes: null,
      relatedEntryIds: refs.slice(6, 9),
      createdBy: "Editor",
      updatedBy: "Editor"
    },
    {
      title: "Assemble Monthly KPI Deck",
      objective: "Compile KPI narrative into stakeholder deck.",
      stepsChecklist: baseChecklist(["Pull numbers", "Draft storyline", "Final review"]),
      owner: "Casey",
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      priority: "MEDIUM",
      status: "TODO",
      categoryId: categories.Marketing,
      tags: ["kpi", "reporting"],
      imageUrls: [],
      attachmentUrls: [],
      notes: "Need alignment with finance numbers.",
      relatedEntryIds: refs.slice(7, 10),
      createdBy: "Editor",
      updatedBy: "Editor"
    },
    {
      title: "Update User Guide with Wizard Steps",
      objective: "Add screenshots and flow field explanation to guide.",
      stepsChecklist: baseChecklist(["Capture screens", "Write steps", "Proofread"]),
      owner: "Sage",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: "LOW",
      status: "IN_PROGRESS",
      categoryId: categories.Docs,
      tags: ["docs", "wizard"],
      imageUrls: [],
      attachmentUrls: [],
      notes: null,
      relatedEntryIds: refs.slice(8, 10),
      createdBy: "Editor",
      updatedBy: "Editor"
    },
    {
      title: "Cross-link API Notes to Templates",
      objective: "Link template definitions to API integration docs.",
      stepsChecklist: baseChecklist(["Identify pages", "Insert links", "Validate references"]),
      owner: "Parker",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      priority: "LOW",
      status: "DONE",
      categoryId: categories.Docs,
      tags: ["docs", "templates", "api"],
      imageUrls: [],
      attachmentUrls: [],
      notes: "Completed in docs review cycle.",
      relatedEntryIds: refs.slice(0, 3),
      createdBy: "Admin",
      updatedBy: "Admin"
    }
  ];
}

async function main() {
  await prisma.taskCard.deleteMany();
  await prisma.libraryEntry.deleteMany();
  await prisma.template.deleteMany();
  await prisma.category.deleteMany();

  const categories = [];
  for (const item of categorySeed) {
    categories.push(await prisma.category.create({ data: item }));
  }

  const templates = [...buildEntryTemplates(), ...buildTaskTemplates()];
  for (const template of templates) {
    const mappedFields = template.fields.map((field) => {
      if (field.key === "categoryId") {
        return { ...field, options: categories.map((category) => `${category.id}:${category.name}`) };
      }
      return field;
    });
    await prisma.template.create({
      data: {
        ...template,
        fields: mappedFields
      }
    });
  }

  const entries = [];
  for (const entry of createEntries(categories)) {
    entries.push(await prisma.libraryEntry.create({ data: entry }));
  }

  for (const task of createTasks(categories, entries)) {
    await prisma.taskCard.create({ data: task });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("Seed complete.");
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
