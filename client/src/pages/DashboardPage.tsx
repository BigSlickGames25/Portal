import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DashboardStats } from "../types";
import { useToast } from "../components/ToastProvider";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .get<DashboardStats>("/dashboard")
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch((error) => pushToast(error instanceof Error ? error.message : "Failed to load dashboard", "error"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [pushToast]);

  return (
    <section className="page-shell">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p className="muted">Portal overview and content volume snapshot.</p>
      </header>

      {loading ? <p className="muted">Loading dashboard...</p> : null}

      {stats ? (
        <div className="card-grid four">
          <article className="panel stat-panel">
            <p className="muted">Categories</p>
            <strong>{stats.categories}</strong>
          </article>
          <article className="panel stat-panel">
            <p className="muted">Templates</p>
            <strong>{stats.templates}</strong>
          </article>
          <article className="panel stat-panel">
            <p className="muted">Active Entries</p>
            <strong>{stats.entries}</strong>
          </article>
          <article className="panel stat-panel">
            <p className="muted">Active Tasks</p>
            <strong>{stats.tasks}</strong>
          </article>
        </div>
      ) : null}
    </section>
  );
}
