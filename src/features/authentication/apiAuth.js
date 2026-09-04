import { apiRequest } from "../../lib/api";

export async function signup({ username, display_name, password, bio }) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: { username, display_name, password, bio: bio || undefined },
  });
}

export async function signin({ username, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export async function signout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser() {
  try {
    return await apiRequest("/api/auth/me");
  } catch (error) {
    if (error.status === 401) {
      return { user: null };
    }
    throw error;
  }
}
