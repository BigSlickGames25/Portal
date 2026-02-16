import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./components/PortalLayout";
import { RequireAuth } from "./components/RequireAuth";
import { RequireRole } from "./components/RequireRole";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { LibraryPage } from "./pages/LibraryPage";
import { EntryDetailPage } from "./pages/EntryDetailPage";
import { TaskDetailPage } from "./pages/TaskDetailPage";
import { EntryCreatePage } from "./pages/EntryCreatePage";
import { TaskCreatePage } from "./pages/TaskCreatePage";
import { EntryEditPage } from "./pages/EntryEditPage";
import { TaskEditPage } from "./pages/TaskEditPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ToastProvider } from "./components/ToastProvider";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<PortalLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/library/entry/:id" element={<EntryDetailPage />} />
              <Route path="/library/task/:id" element={<TaskDetailPage />} />

              <Route element={<RequireRole allowedRoles={["Admin", "Editor"]} />}>
                <Route path="/library/entry/new" element={<EntryCreatePage />} />
                <Route path="/library/task/new" element={<TaskCreatePage />} />
                <Route path="/library/entry/:id/edit" element={<EntryEditPage />} />
                <Route path="/library/task/:id/edit" element={<TaskEditPage />} />
              </Route>

              <Route element={<RequireRole allowedRoles={["Admin"]} />}>
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/portal" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
