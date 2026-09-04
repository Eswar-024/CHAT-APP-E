import { RiSendPlaneFill } from "react-icons/ri";
import { useUser } from "../authentication/useUser";
import { useRef, useState } from "react";
import { useSendNewMessage } from "./useSendNewMessage";
import { v4 as uuid } from "uuid";
import useConvInfo from "./useConvInfo";
import { MAX_MESSAGE_LENGTH } from "../../config";

function MessageInputBar() {
  const {
    convInfo,
    isPending: isPendingConvInfo,
    isError: isConvInfoError,
  } = useConvInfo();

  const [newMessage, setNewMessage] = useState("");
  const { isSending, sendNewMessage } = useSendNewMessage();
  const { user } = useUser();
  const conversationId = convInfo?.id;
  const myUserId = user?.id;
  const inputRef = useRef(null);

  function handleSendNewMessage(e) {
    e.preventDefault();
    inputRef.current?.focus();

    const content = newMessage.replace(/\0/g, "").trim();
    if (!content || !conversationId || [...content].length > MAX_MESSAGE_LENGTH) {
      return;
    }

    sendNewMessage(
      {
        id: `temp-${uuid()}`,
        conversation_id: conversationId,
        content,
        sender_id: myUserId,
        created_at: new Date().toISOString(),
        optimistic: true,
      },
      {
        onError: (_, message) => {
          setNewMessage(message.content);
        },
      },
    );

    setNewMessage("");
  }

  if (isConvInfoError) return null;

  return (
    <div className="composer min-w-0 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4">
      <form
        className={`composer__form mx-auto grid w-full min-w-0 max-w-3xl grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-full border border-transparent bg-bgPrimary shadow-lg dark:border-LightShade/20 dark:bg-LightShade/20 xl:max-w-4xl ${
          isSending ? "composer__form--sending" : ""
        }`}
        onSubmit={handleSendNewMessage}
      >
        <label htmlFor="inputMessage" className="sr-only">
          Message
        </label>
        <input
          disabled={isPendingConvInfo}
          className="composer__input h-12 min-w-0 w-full bg-transparent pl-4 pr-2 text-base outline-none focus-visible:ring-0"
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          type="text"
          placeholder="Message"
          id="inputMessage"
          name="message"
          autoComplete="off"
          enterKeyHint="send"
          maxLength={MAX_MESSAGE_LENGTH}
        />

        <button
          className="composer__send m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bgAccent text-2xl text-textPrimary-dark disabled:opacity-70 dark:bg-bgAccent-dark"
          disabled={isPendingConvInfo || !conversationId}
          type="submit"
          aria-label="Send message"
          aria-busy={isSending}
        >
          <RiSendPlaneFill
            aria-hidden="true"
            className={isSending ? "composer__send-icon--busy" : ""}
          />
        </button>
      </form>
    </div>
  );
}

export default MessageInputBar;
