import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearStoredRole, getStoredRole } from "../lib/auth";

export function PortalLayout() {
  const navigate = useNavigate();
  const role = getStoredRole() ?? "Viewer";

  const handleLogout = () => {
    clearStoredRole();
    navigate("/login");
  };

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="brand-block">
          <p className="eyebrow">Portal</p>
          <h1>Library Hub</h1>
          <p className="muted">Role: {role}</p>
        </div>

        <nav className="menu-list">
          <NavLink to="/" end className="menu-link">
            Dashboard
          </NavLink>
          <NavLink to="/library" className="menu-link">
            Library
          </NavLink>
          {role === "Admin" && (
            <>
              <NavLink to="/categories" className="menu-link">
                Categories
              </NavLink>
              <NavLink to="/templates" className="menu-link">
                Templates
              </NavLink>
            </>
          )}
        </nav>

        <button className="btn btn-secondary full-width" onClick={handleLogout} type="button">
          Logout
        </button>
      </aside>

      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
}
