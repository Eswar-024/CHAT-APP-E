import { getSocket } from "../../lib/socket";

export function subscribeRealtimeConversation({ callback, onReconnect }) {
  const socket = getSocket();
  let sawDisconnect = false;

  function onUpdated(payload) {
    if (!payload?.conversationId) return;
    callback({
      conversationId: payload.conversationId,
      last_message: payload.last_message,
    });
  }

  function onConnect() {
    if (sawDisconnect) {
      onReconnect?.();
    }
  }

  function onDisconnect() {
    sawDisconnect = true;
  }

  socket.on("conversation:updated", onUpdated);
  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);

  if (!socket.connected) {
    socket.connect();
  }

  return {
    unsubscribe() {
      socket.off("conversation:updated", onUpdated);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    },
  };
}
