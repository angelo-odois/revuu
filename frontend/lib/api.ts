const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchAPI<{ accessToken: string; refreshToken: string; user: unknown }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string, userId: string) =>
    fetchAPI<{ accessToken: string; refreshToken: string }>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken, userId }),
    }),

  getMe: (token: string) =>
    fetchAPI("/api/auth/me", { token }),

  // Pages
  getPages: (status?: string) =>
    fetchAPI<unknown[]>(`/api/pages${status ? `?status=${status}` : ""}`),

  getPage: (slug: string) =>
    fetchAPI(`/api/pages/${slug}`),

  getPageById: (id: string, token: string) =>
    fetchAPI(`/api/pages/by-id/${id}`, { token }),

  createPage: (data: unknown, token: string) =>
    fetchAPI("/api/pages", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updatePage: (id: string, data: unknown, token: string) =>
    fetchAPI(`/api/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deletePage: (id: string, token: string) =>
    fetchAPI(`/api/pages/${id}`, {
      method: "DELETE",
      token,
    }),

  // Block Templates
  getBlockTemplates: () =>
    fetchAPI<unknown[]>("/api/admin/block-templates"),

  // Uploads
  uploadFile: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/api/admin/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  },

  getAssets: (token: string, page = 1, limit = 20) =>
    fetchAPI(`/api/admin/uploads?page=${page}&limit=${limit}`, { token }),
};
