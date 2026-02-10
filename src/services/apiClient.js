function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export class ApiClient {
  constructor(env, authService, seedData) {
    this.env = env;
    this.authService = authService;
    this.seedData = seedData;
  }

  async getDashboardSnapshot() {
    return deepClone(this.seedData);
  }

  async healthCheck() {
    return {
      target: this.env.apiBaseUrl,
      authEnabled: this.authService.isEnabled(),
      status: "mock",
      note: "Staging AWS API not connected yet."
    };
  }

  async postAuditEvent(eventName, payload = {}) {
    return {
      ok: true,
      eventName,
      payload,
      timestamp: new Date().toISOString()
    };
  }

  buildHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = this.authService.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }
}
