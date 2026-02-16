import { getStoredRole } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const ORIGIN_BASE = import.meta.env.VITE_API_ORIGIN || "http://localhost:4000";

interface RequestOptions extends RequestInit {
  raw?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const role = getStoredRole() ?? "Viewer";
  const headers = new Headers(options.headers || {});
  headers.set("x-role", role);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }

  if (options.raw || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {})
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {})
    }),
  delete: (path: string) => request<void>(path, { method: "DELETE", raw: true })
};

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const data = await api.post<{ url: string }>("/upload", formData);
  if (!data?.url) {
    throw new Error("Upload response missing URL");
  }
  return `${ORIGIN_BASE}${data.url}`;
}
