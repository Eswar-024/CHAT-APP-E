export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers, signal } = options;
  const fullPath = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const response = await fetch(fullPath, {
    method,
    credentials: "include",
    signal,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error || "Request failed",
      response.status,
      payload?.details,
    );
  }

  return payload;
}
