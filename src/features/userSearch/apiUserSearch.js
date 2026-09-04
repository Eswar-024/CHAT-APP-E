import { apiRequest } from "../../lib/api";

export async function searchPeople(query) {
  const data = await apiRequest(
    `/api/users?q=${encodeURIComponent(query)}`,
  );
  return data.users;
}
