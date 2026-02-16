# USER GUIDE

## 1. Login and Roles

1. Open the app in browser.
2. Choose a role:
   - `Admin`: full access (categories, templates, hard delete)
   - `Editor`: create/edit/archive entries and tasks
   - `Viewer`: read-only
3. Click **Enter Portal**.

---

## 2. Library Overview

Go to **Library** from the left menu.

You can:
- Switch between **Entries** and **Tasks**
- Search with debounced input
- Filter by category, status, tags
- Filter tasks by priority and owner
- Toggle **Grid** or **List**

Quick actions:
- **View**
- **Edit** (Admin/Editor)
- **Duplicate** (Admin/Editor)
- **Archive** (Admin/Editor)

---

## 3. Create Entry with Template Wizard

1. Go to **Library**.
2. Click **Create Entry**.
3. Select an ENTRY template.
4. Complete each wizard step:
   - Basics
   - Content
   - Media/attachments
5. Required fields must be completed to continue.
6. Review final summary.
7. Click **Create Entry**.

Tips:
- Use tags as comma-separated values in tags fields.
- Add links for references.
- Upload files/images using upload controls.

---

## 4. Create Task with Template Wizard

1. Go to **Library**.
2. Click **Create Task**.
3. Select a TASK template.
4. Complete wizard steps:
   - Setup (title/objective/owner/category)
   - Planning (priority/status/date)
   - Execution (checklist/uploads/notes)
5. Review and click **Create Task**.

Checklist usage:
- Add checklist items.
- Mark items done/undone.

---

## 5. Edit Entries and Tasks

### Edit Entry

1. Open entry detail.
2. Click **Edit**.
3. Update fields:
   - content, category, status
   - tags
   - gallery images
   - attachments
   - links
4. Click **Save Entry**.

### Edit Task

1. Open task detail.
2. Click **Edit**.
3. Update:
   - owner, due date, priority, status
   - checklist
   - images/attachments
   - notes and related entry IDs
4. Click **Save Task**.

---

## 6. Upload Images and Attachments

Uploads are available in wizard and edit forms.

1. Click file input in image/file upload section.
2. Select one or more files.
3. Wait for upload completion toast.
4. Uploaded URLs are attached to the record.
5. Remove any attached URL with **Remove** button.

Allowed types:
- Images: png, jpg/jpeg, webp
- Files: pdf, zip

---

## 7. Categories and Tags

### Categories (Admin)

1. Go to **Categories**.
2. Create category with name/description.
3. Optional: icon, color, sort order.
4. Save.

Delete behavior:
- Category cannot be deleted if entries/tasks still reference it.

### Tags

- Tags help filter records in Library.
- Add tags as comma-separated values.
- Use consistent naming (e.g. `backend`, `release`, `ops`).

---

## 8. Templates (Admin)

Go to **Templates** to build/edit flow templates.

You can define:
- Template type (`ENTRY` or `TASK`)
- Field definitions:
  - key, label, type, required, helpText, defaultValue, options
- Step definitions:
  - stepTitle, stepDescription, fieldKeys

Field types supported:
- text, textarea, richtext, select, multiselect, tags, date, number, checkbox, checklist, imageUpload, fileUpload, links

Best practices:
- Keep field keys stable (avoid renaming keys after heavy usage).
- Ensure each step includes only relevant fields.
- Keep required fields minimal for user speed.

---

## 9. Archive vs Delete

Default removal behavior is **Archive**.

- Archive:
  - keeps data for history
  - hides item in active workflows unless filtered
- Hard delete:
  - only available to Admin on detail page
  - permanently removes the record

---

## 10. Screenshot Placeholders

### Screenshot: Library Home (Entries tab)

### Screenshot: Library Home (Tasks tab)

### Screenshot: Entry Wizard Step

### Screenshot: Task Wizard Review

### Screenshot: Entry Detail

### Screenshot: Task Detail

### Screenshot: Categories Admin

### Screenshot: Templates Admin Builder
