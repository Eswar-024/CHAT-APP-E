import { useRef } from "react";
import { useUser } from "../authentication/useUser";
import { formatTime } from "../../utils/common";

function MessageItem({ message, animateEntrance = false }) {
  const { user } = useUser();
  const enterRef = useRef(animateEntrance);
  const isMine = message?.sender_id === user.id;
  const isSending = Boolean(message?.optimistic);

  return (
    <div
      className={`message-bubble relative ${
        isMine
          ? "message-bubble--mine self-end rounded-br-none bg-gradient-to-br from-bgAccent to-bgAccentDim text-textPrimary-dark before:absolute before:bottom-0 before:right-0 before:h-0 before:w-0 before:translate-x-full before:border-l-8 before:border-t-8 before:border-l-bgAccentDim before:border-t-transparent before:content-[''] dark:from-bgAccent-dark dark:to-bgAccentDim-dark before:dark:border-l-bgAccentDim-dark"
          : "message-bubble--peer rounded-bl-none bg-bgPrimary before:absolute before:bottom-0 before:left-0 before:h-0 before:w-0 before:-translate-x-full before:border-r-8 before:border-t-8 before:border-r-bgPrimary before:border-t-transparent before:content-[''] dark:bg-LightShade/20 before:dark:border-r-LightShade/20"
      } my-1 min-w-0 max-w-[min(80%,24rem)] w-fit rounded-2xl px-3 py-2 shadow-md before:shadow-md sm:max-w-[80%] sm:px-4 ${
        enterRef.current ? "message-bubble--enter" : ""
      } ${isSending ? "message-bubble--sending" : ""}`}
    >
      <p className="whitespace-pre-wrap break-words">
        {message?.deleted_at ? (
          <span className="italic opacity-70">Message deleted</span>
        ) : (
          message?.content
        )}
        <span className="float-right ml-2 mt-2 select-none text-xs opacity-70">
          {isSending ? "Sending" : formatTime(message?.created_at)}
        </span>
      </p>
    </div>
  );
}

export default MessageItem;
