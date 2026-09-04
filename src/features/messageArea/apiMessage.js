import { apiRequest } from "../../lib/api";

export async function getMessages({ conversation_id, pageParam }) {
  if (!conversation_id) return [];

  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  const query = params.toString();
  const data = await apiRequest(
    `/api/conversations/${conversation_id}/messages${query ? `?${query}` : ""}`,
  );

  const messages = data.messages || [];
  messages.nextCursor = data.nextCursor || null;
  return messages;
}

export async function sendMessage({ conversation_id, content }) {
  const data = await apiRequest(
    `/api/conversations/${conversation_id}/messages`,
    {
      method: "POST",
      body: { content },
    },
  );
  return data.message;
}
