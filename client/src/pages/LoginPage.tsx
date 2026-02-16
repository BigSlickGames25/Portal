import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setStoredRole } from "../lib/auth";
import type { Role } from "../types";

const roles: Role[] = ["Admin", "Editor", "Viewer"];

export function LoginPage() {
  const [role, setRole] = useState<Role>("Editor");
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from || "/";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setStoredRole(role);
    navigate(from, { replace: true });
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow">Portal Access</p>
        <h1>Dev Login</h1>
        <p className="muted">Select a role for development mode.</p>
        <label className="field-label">Role</label>
        <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
          {roles.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="submit" className="btn full-width">
          Enter Portal
        </button>
      </form>
    </div>
  );
}
