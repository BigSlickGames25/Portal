import type { Role } from "../types";

const ROLE_KEY = "portal.dev.role";

export function getStoredRole(): Role | null {
  const role = localStorage.getItem(ROLE_KEY);
  if (role === "Admin" || role === "Editor" || role === "Viewer") {
    return role;
  }
  return null;
}

export function setStoredRole(role: Role): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearStoredRole(): void {
  localStorage.removeItem(ROLE_KEY);
}
