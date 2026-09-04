import { getSocket } from "../../lib/socket";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function subscribeRealtimeMessage({
  conversation_id,
  callback,
  onReconnect,
}) {
  if (!conversation_id || !UUID_RE.test(conversation_id)) {
    return { unsubscribe() {} };
  }

  const socket = getSocket();
  let joined = false;
  let sawDisconnect = false;

  function onCreated(payload) {
    if (payload?.conversationId !== conversation_id) return;
    if (payload?.message?.id) callback(payload.message);
  }

  function join() {
    socket.emit("join:conversation", conversation_id, (ack) => {
      joined = Boolean(ack?.ok);
    });
  }

  function leave() {
    if (joined || socket.connected) {
      socket.emit("leave:conversation", conversation_id);
    }
    joined = false;
  }

  function onConnect() {
    join();
    if (sawDisconnect) {
      onReconnect?.();
    }
  }

  function onDisconnect() {
    sawDisconnect = true;
    joined = false;
  }

  socket.on("message:created", onCreated);
  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);

  if (socket.connected) {
    join();
  } else {
    socket.connect();
  }

  return {
    unsubscribe() {
      leave();
      socket.off("message:created", onCreated);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    },
  };
}
