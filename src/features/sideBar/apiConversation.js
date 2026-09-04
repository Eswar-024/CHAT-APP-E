import { apiRequest } from "../../lib/api";

export async function getConversations() {
  const data = await apiRequest("/api/conversations");
  return data.conversations;
}

export async function getOrCreateConversation(peerUserId) {
  const data = await apiRequest("/api/conversations", {
    method: "POST",
    body: { peerUserId },
  });
  return data.conversation;
}

export async function markConversationRead(conversationId) {
  const data = await apiRequest(`/api/conversations/${conversationId}/read`, {
    method: "PUT",
  });
  return data.conversation;
}

export async function togglePinConversation(conversationId) {
  const data = await apiRequest(`/api/conversations/${conversationId}/pin`, {
    method: "PUT",
  });
  return data.conversation;
}

