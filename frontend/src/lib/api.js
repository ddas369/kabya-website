const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, { method = "GET", body, token, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  base: API_BASE,

  getContent: () => request("/content"),

  grammar: (text, tone) => request("/grammar", { method: "POST", body: { text, tone } }),

  translate: (text, sourceLang, targetLang, formality) =>
    request("/translate", { method: "POST", body: { text, sourceLang, targetLang, formality } }),

  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password } }),
  me: (token) => request("/auth/me", { token }),
  adminGetContent: (token) => request("/admin/content", { token }),

  updateSection: (token, section, patch) =>
    request(`/admin/section/${section}`, { method: "PUT", body: patch, token }),

  updateDeveloperLinks: (token, patch) =>
    request("/admin/developer/links", { method: "PUT", body: patch, token }),

  addListItem: (token, listName, item) =>
    request(`/admin/list/${listName}`, { method: "POST", body: item, token }),
  updateListItem: (token, listName, id, patch) =>
    request(`/admin/list/${listName}/${id}`, { method: "PUT", body: patch, token }),
  deleteListItem: (token, listName, id) =>
    request(`/admin/list/${listName}/${id}`, { method: "DELETE", token }),
  reorderList: (token, listName, orderedIds) =>
    request(`/admin/list/${listName}/reorder`, { method: "PUT", body: { orderedIds }, token }),

  uploadImage: (token, file) => {
    const form = new FormData();
    form.append("image", file);
    return request("/admin/upload/image", { method: "POST", body: form, token, isFormData: true });
  },
  uploadApk: (token, file) => {
    const form = new FormData();
    form.append("apk", file);
    return request("/admin/upload/apk", { method: "POST", body: form, token, isFormData: true });
  },

  changePassword: (token, currentPassword, newPassword) =>
    request("/admin/password", { method: "PUT", body: { currentPassword, newPassword }, token }),
};

/**
 * Turns a backend-relative URL like "/uploads/x.png" into a full URL.
 * Paths that aren't backend uploads (a full http(s) URL, or a path to an
 * image bundled with the frontend itself, e.g. "/seed-images/x.jpg") are
 * left as-is.
 */
export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/") || path.startsWith("/downloads/")) {
    return `${API_BASE}${path}`;
  }
  return path;
}
