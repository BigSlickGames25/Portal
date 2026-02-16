import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-shell">
      <article className="panel">
        <h2>Page Not Found</h2>
        <p className="muted">The page you requested does not exist.</p>
        <Link className="btn" to="/">
          Return to Dashboard
        </Link>
      </article>
    </section>
  );
}
