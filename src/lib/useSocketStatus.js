import { useEffect, useState } from "react";
import { getSocket } from "./socket";

export function useSocketStatus() {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const socket = getSocket();

    function onConnect() {
      setStatus("connected");
    }

    function onDisconnect() {
      setStatus("offline");
    }

    function onReconnectAttempt() {
      setStatus("reconnecting");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    if (socket.connected) {
      setStatus("connected");
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
    };
  }, []);

  return status;
}
