const VALID_ROLES = new Set(["Admin", "Editor", "Viewer"]);

export function getRole(req) {
  const headerRole = req.header("x-role");
  if (headerRole && VALID_ROLES.has(headerRole)) {
    return headerRole;
  }
  return "Viewer";
}

export function requireRoles(allowedRoles) {
  return (req, res, next) => {
    const role = getRole(req);
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Forbidden", detail: "Insufficient role permissions." });
    }
    req.role = role;
    return next();
  };
}
