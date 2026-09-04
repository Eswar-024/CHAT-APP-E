import Messages from "./Messages";
import MessageTopBar from "./MessageTopBar";
import MessageInputBar from "./MessageInputBar";

function MessageView() {
  return (
    <div className="relative flex h-[calc(100vh-1rem)] max-h-screen-safe w-full min-w-0 flex-col gap-2.5 overflow-hidden p-2 sm:p-4">
      <MessageTopBar />

      <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-2xl border-2 border-slate-900 bg-slate-100/50 dark:bg-slate-900/40 shadow-[3px_3px_0px_rgba(15,23,42,1)]">
        <Messages />
      </div>

      <MessageInputBar />
    </div>
  );
}

export default MessageView;
