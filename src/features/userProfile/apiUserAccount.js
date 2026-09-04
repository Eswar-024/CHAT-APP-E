import { apiRequest } from "../../lib/api";

export async function updateCurrentUser(payload) {
  if (payload?.avatar) {
    throw new Error("Avatar upload is not available.");
  }

  const body = {};
  if (payload.display_name !== undefined) body.display_name = payload.display_name;
  if (payload.username !== undefined) body.username = payload.username;
  if (payload.bio !== undefined) body.bio = payload.bio;
  if (payload.password !== undefined) body.password = payload.password;
  if (payload.current_password !== undefined) {
    body.current_password = payload.current_password;
  }

  const data = await apiRequest("/api/auth/me", {
    method: "PATCH",
    body,
  });

  return data;
}
