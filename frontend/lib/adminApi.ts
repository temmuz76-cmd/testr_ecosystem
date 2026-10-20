"use client";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    credentials: "same-origin",
    headers: isForm ? init.headers : { "content-type": "application/json", ...init.headers },
  });
  if (res.status === 401 && path !== "/login") {
    // Outside React here, so a hard navigation is the only option.
    window.location.replace(new URL("/admin/login", window.location.origin));
    throw new ApiError(401, "Oturum süresi doldu");
  }
  if (!res.ok) {
    let message = `Hata (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((d: { msg: string }) => d.msg).join(", ");
    } catch {}
    throw new ApiError(res.status, message);
  }
  return res.json();
}

export const adminApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export interface MediaItem {
  id: number;
  filename: string;
  url: string;
  content_type: string;
  size: number;
  created_at: string;
}
