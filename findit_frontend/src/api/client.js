export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "findit_token";

export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  },
};

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.fieldErrors = {};
    if (data && typeof data === "object" && !Array.isArray(data)) {
      for (const [k, v] of Object.entries(data)) {
        if (k === "detail" || k === "non_field_errors") continue;
        this.fieldErrors[k] = Array.isArray(v) ? v.join(" ") : String(v);
      }
    }
  }
}

function extractMessage(data, status) {
  if (!data) return `Xatolik (${status})`;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.join(" ");
  if (data.detail) return String(data.detail);
  if (data.non_field_errors) return [].concat(data.non_field_errors).join(" ");
  const first = Object.values(data)[0];
  if (first) return Array.isArray(first) ? String(first[0]) : String(first);
  return `Xatolik (${status})`;
}

function buildUrl(path, params) {
  const url = new URL(API_URL + "/api" + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

export async function request(method, path, { body, params, auth = true } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (auth && token) headers["Authorization"] = `Token ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(buildUrl(path, params), { method, headers, body: payload });
  } catch {
    throw new ApiError("Serverga ulanib bo'lmadi. Internetni tekshiring.", 0, null);
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    if (res.status === 401 && auth && onUnauthorized) onUnauthorized();
    throw new ApiError(extractMessage(data, res.status), res.status, data);
  }
  return data;
}

export const api = {
  get: (path, params, opts) => request("GET", path, { params, ...opts }),
  post: (path, body, opts) => request("POST", path, { body, ...opts }),
  patch: (path, body, opts) => request("PATCH", path, { body, ...opts }),
  put: (path, body, opts) => request("PUT", path, { body, ...opts }),
  del: (path, opts) => request("DELETE", path, opts),
};

export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return API_URL + path;
}