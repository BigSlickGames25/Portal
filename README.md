# Portal Web App (Library Module)

Full-stack portal app with a left-side menu and a functional Library module.

## Stack

- Frontend: React + TypeScript + Vite + React Router
- Backend: Node.js + Express + Zod
- Database: SQLite + Prisma ORM
- Uploads: Local files in `server/uploads` and static hosting via `/uploads`
- Auth: Dev-role login (Admin / Editor / Viewer) with localStorage

## Repository Structure

```text
/
├─ client/   # Vite React app
├─ server/   # Express API + Prisma + uploads
└─ package.json
```

## Features Implemented

- Role-based login (Admin / Editor / Viewer)
- Left-side portal navigation:
  - Dashboard
  - Library
  - Categories (Admin only)
  - Templates (Admin only)
- Library module:
  - Entries and Tasks tabs
  - Debounced search
  - Filters (category, tags, status, owner, priority)
  - Grid/list toggle
  - Quick actions: View, Edit, Duplicate, Archive
  - Archive as default delete behavior
  - Hard delete on detail page for Admin only
- Template builder (Admin only):
  - Template CRUD for ENTRY and TASK
  - JSON-backed steps + flow field definitions
- Wizard create flows:
  - `/library/entry/new` -> select template -> step-by-step wizard
  - `/library/task/new` -> select template -> step-by-step wizard
  - Step validation + review summary page
- Category and template management with route guards
- Image/file uploads to server and URL attachment to records
- Seed data for categories, entries, tasks, templates

## Environment Setup

### 1. Install dependencies

Run from repo root:

```bash
npm install
```

### 2. Server environment

Create `server/.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=4000
```

You can copy from `server/.env.example`.

### 3. Client environment (optional)

Create `client/.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_ORIGIN=http://localhost:4000
```

Defaults already point to localhost if this file is missing.

## Scripts

Run all from repo root:

```bash
npm run dev
npm run seed
npm run reset
```

### What each script does

- `npm run dev`: runs server and client concurrently
- `npm run seed`: pushes Prisma schema and seeds categories/templates/entries/tasks
- `npm run reset`: resets DB from schema and seeds again

## API Routes

Base URL: `http://localhost:4000/api`

### Health / Dashboard

- `GET /health`
- `GET /dashboard`

### Categories

- `GET /categories`
- `POST /categories` (Admin)
- `PUT /categories/:id` (Admin)
- `DELETE /categories/:id` (Admin)

### Templates

- `GET /templates`
- `POST /templates` (Admin)
- `PUT /templates/:id` (Admin)
- `DELETE /templates/:id` (Admin)

### Entries

- `GET /entries`
- `GET /entries/:id`
- `POST /entries` (Admin, Editor)
- `PUT /entries/:id` (Admin, Editor)
- `POST /entries/:id/duplicate` (Admin, Editor)
- `POST /entries/:id/archive` (Admin, Editor)
- `DELETE /entries/:id` (Admin)

### Tasks

- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks` (Admin, Editor)
- `PUT /tasks/:id` (Admin, Editor)
- `POST /tasks/:id/duplicate` (Admin, Editor)
- `POST /tasks/:id/archive` (Admin, Editor)
- `DELETE /tasks/:id` (Admin)

### Uploads

- `POST /upload` (Admin, Editor)
  - form-data field: `file`
  - allowed: png/jpg/webp/pdf/zip
  - max size: 10MB
- static files served at:
  - `GET /uploads/<filename>`

## Frontend Routes

- `/login`
- `/`
- `/library`
- `/library/entry/new`
- `/library/task/new`
- `/library/entry/:id`
- `/library/task/:id`
- `/library/entry/:id/edit`
- `/library/task/:id/edit`
- `/categories` (Admin)
- `/templates` (Admin)

## Screenshot Placeholders

### Screenshot: Login (Role Selector)

### Screenshot: Dashboard

### Screenshot: Library Entries Grid

### Screenshot: Library Tasks List

### Screenshot: Entry Wizard Step Flow

### Screenshot: Task Wizard Review Step

### Screenshot: Template Builder

### Screenshot: Categories Management

## Notes

- Dev auth is intentionally simple and not secure for production.
- Uploaded files are local-only; use object storage in production.
- SQLite is intended for local/dev use.
