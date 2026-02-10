function buildDevSession(role) {
  return {
    userId: "dev-local-001",
    name: "Local Admin",
    email: "admin@bigslickgames.local",
    roles: [role],
    provider: "local-dev-bypass",
    accessToken: `dev-token-${Date.now()}`
  };
}

export class AuthService {
  constructor(config, env) {
    this.config = config;
    this.env = env;
    this.session = null;
  }

  async initialize() {
    const stored = this._readSession();
    if (stored) {
      this.session = stored;
      return this.session;
    }

    if (!this.config.enabled) {
      this.session = buildDevSession(this.config.defaultRole);
      this._writeSession(this.session);
      return this.session;
    }

    this.session = null;
    return this.session;
  }

  isEnabled() {
    return Boolean(this.config.enabled);
  }

  getSession() {
    return this.session;
  }

  getStatus() {
    return {
      enabled: this.isEnabled(),
      provider: this.config.provider,
      region: this.config.region,
      apiBaseUrl: this.env.apiBaseUrl,
      authenticated: Boolean(this.session),
      role: this.session?.roles?.[0] ?? "none"
    };
  }

  hasRole(role) {
    if (!this.session?.roles) {
      return false;
    }
    return this.session.roles.includes(role);
  }

  assertRole(role) {
    if (!this.hasRole(role)) {
      throw new Error(`Forbidden: missing role ${role}`);
    }
  }

  async loginAs(role = "analyst") {
    if (this.config.enabled) {
      throw new Error("AWS auth is enabled. Wire this method to Cognito hosted UI.");
    }
    this.session = buildDevSession(role);
    this._writeSession(this.session);
    return this.session;
  }

  async logout() {
    if (this.config.enabled) {
      throw new Error("Logout should be delegated to Cognito hosted UI.");
    }
    this.session = null;
    this._clearSession();
    return null;
  }

  getAccessToken() {
    return this.session?.accessToken ?? null;
  }

  _readSession() {
    try {
      const raw = window.sessionStorage.getItem(this.config.sessionStorageKey);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  _writeSession(session) {
    try {
      window.sessionStorage.setItem(this.config.sessionStorageKey, JSON.stringify(session));
    } catch {
      // Ignore storage failures in restrictive browser contexts.
    }
  }

  _clearSession() {
    try {
      window.sessionStorage.removeItem(this.config.sessionStorageKey);
    } catch {
      // Ignore storage failures in restrictive browser contexts.
    }
  }
}
