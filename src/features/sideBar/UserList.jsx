import { useConversations } from "./useConversations";
import { useUi } from "../../contexts/UiContext";
import ConversationCard from "../inbox/ConversationCard";
import { partitionConversations } from "../inbox/partitionConversations";
import { formatCardTime } from "../../utils/common";
import { useState, useEffect } from "react";
import { RiVolumeMuteFill } from "react-icons/ri";

function previewFromConversation(conv, myUserId) {
  if (!conv?.last_message) {
    return { text: "", isOwn: false, time: "" };
  }

  const deleted = Boolean(conv.last_message.deleted_at);
  const text = deleted ? "Message deleted" : conv.last_message.content || "";
  const isOwn = conv.last_message.sender_id === myUserId;
  const time = formatCardTime(conv.last_message.created_at);

  return { text, isOwn, time };
}

function ConversationSection({
  title,
  conversations,
  empty,
  myUserId,
  onOpen,
  onTogglePin,
  mutedIds,
  onToggleMute,
  onMoveCard,
  onDragStart,
  onDragOver,
  onDrop,
  draggedId,
}) {
  const alignJustifyMap = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <section className="mb-8 text-left w-full">
      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-200">
        {title} ({conversations.length})
      </h3>
      {conversations.length === 0 ? (
        <p className="text-xs font-bold italic text-slate-500 dark:text-slate-400">{empty}</p>
      ) : (
        <div className="flex flex-col gap-5 w-full">
          {conversations.map((conv, index) => {
            const preview = previewFromConversation(conv, myUserId);
            const isMuted = mutedIds.includes(conv.id);
            const convAlign =
              localStorage.getItem(`chat_align_${conv.peer.id}`) ||
              localStorage.getItem(`chat_align_${conv.id}`) ||
              "left";
            const justifyClass = alignJustifyMap[convAlign] || "justify-start";

            return (
              <div
                key={conv.id}
                className={`flex w-full ${justifyClass} py-1 transition-all duration-200`}
              >
                <ConversationCard
                  id={conv.peer.id}
                  convId={conv.id}
                  displayName={conv.peer.display_name}
                  username={conv.peer.username}
                  avatarUrl={conv.peer.avatar_url}
                  lastMessage={preview.text}
                  timestamp={preview.time}
                  unreadCount={conv.unread_count || 0}
                  isOwnLastMessage={preview.isOwn}
                  isPinned={Boolean(conv.is_pinned)}
                  isMuted={isMuted}
                  isOnline={conv.peer?.is_online === true}
                  isDragging={draggedId === conv.id}
                  onOpen={onOpen}
                  onTogglePin={() => onTogglePin(conv.id)}
                  onToggleMute={() => onToggleMute(conv.id)}
                  onMoveLeft={index > 0 ? () => onMoveCard(conv.id, "left", conversations) : null}
                  onMoveRight={index < conversations.length - 1 ? () => onMoveCard(conv.id, "right", conversations) : null}
                  onDragStart={(e) => onDragStart(e, conv.id)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, conv.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InboxSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" aria-hidden="true">
      <div className="h-40 rounded-[1.4rem] border-2 border-slate-900 bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-40 rounded-[1.4rem] border-2 border-slate-900 bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-40 rounded-[1.4rem] border-2 border-slate-900 bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-40 rounded-[1.4rem] border-2 border-slate-900 bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

function UserList() {
  const { conversations, isPending, error, togglePin, myUserId } = useConversations();
  const { closeSidebar, openSearchView } = useUi();

  const [draggedId, setDraggedId] = useState(null);
  const [, setStorageTick] = useState(0);

  useEffect(() => {
    function handleStorageChange() {
      setStorageTick((t) => t + 1);
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [customOrder, setCustomOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_conv_order");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mutedIds, setMutedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("muted_conversations");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isMuteAll, setIsMuteAll] = useState(() => {
    try {
      return localStorage.getItem("mute_all_chats") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("muted_conversations", JSON.stringify(mutedIds));
    } catch {
      // ignore
    }
  }, [mutedIds]);

  useEffect(() => {
    try {
      localStorage.setItem("mute_all_chats", String(isMuteAll));
    } catch {
      // ignore
    }
  }, [isMuteAll]);

  useEffect(() => {
    try {
      localStorage.setItem("custom_conv_order", JSON.stringify(customOrder));
    } catch {
      // ignore
    }
  }, [customOrder]);

  function handleToggleMute(convId) {
    setMutedIds((prev) =>
      prev.includes(convId) ? prev.filter((id) => id !== convId) : [...prev, convId]
    );
  }

  function handleToggleMuteAll() {
    if (isMuteAll) {
      setIsMuteAll(false);
      setMutedIds([]);
    } else {
      setIsMuteAll(true);
      if (conversations) {
        setMutedIds(conversations.map((c) => c.id));
      }
    }
  }

  function handleMoveCard(convId, direction, list) {
    const listIds = list.map((c) => c.id);
    const currentIndex = listIds.indexOf(convId);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    if (direction === "left") targetIndex = currentIndex - 1;
    if (direction === "right") targetIndex = currentIndex + 1;
    if (direction === "top") targetIndex = 0;
    if (direction === "bottom") targetIndex = listIds.length - 1;

    if (targetIndex < 0 || targetIndex >= listIds.length) return;

    const newOrderList = [...listIds];
    const [item] = newOrderList.splice(currentIndex, 1);
    newOrderList.splice(targetIndex, 0, item);

    setCustomOrder((prev) => {
      const combined = [...newOrderList, ...prev.filter((id) => !newOrderList.includes(id))];
      return combined;
    });
  }

  function handleDragStart(e, convId) {
    setDraggedId(convId);
    e.dataTransfer.setData("text/plain", convId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e, targetConvId) {
    e.preventDefault();
    if (!draggedId || draggedId === targetConvId) {
      setDraggedId(null);
      return;
    }

    const allConvIds = (conversations || []).map((c) => c.id);
    const currentOrder = customOrder.length > 0 ? [...customOrder] : [...allConvIds];

    allConvIds.forEach((id) => {
      if (!currentOrder.includes(id)) currentOrder.push(id);
    });

    const fromIndex = currentOrder.indexOf(draggedId);
    const toIndex = currentOrder.indexOf(targetConvId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const updatedOrder = [...currentOrder];
      const [movedItem] = updatedOrder.splice(fromIndex, 1);
      updatedOrder.splice(toIndex, 0, movedItem);
      setCustomOrder(updatedOrder);
    }
    setDraggedId(null);
  }

  if (isPending) {
    return <InboxSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-slate-900 bg-rose-100 p-4 text-center font-bold text-rose-800">
        {error.message}
      </div>
    );
  }

  let sortedConversations = [...(conversations || [])];
  if (customOrder.length > 0) {
    const orderMap = new Map(customOrder.map((id, index) => [id, index]));
    sortedConversations.sort((a, b) => {
      const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
      const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
      return orderA - orderB;
    });
  }

  const { pinned, rest, hasAny } = partitionConversations(sortedConversations);

  if (!hasAny) {
    return (
      <div className="flex flex-col items-start text-left gap-3 rounded-[1.8rem] border-2 border-slate-900 bg-[#fef08a] p-6 sm:p-8 shadow-[4px_5px_0px_rgba(15,23,42,1)]">
        <h3 className="text-xl font-black text-slate-900">Start your first conversation.</h3>
        <p className="text-xs font-bold text-slate-800 sm:text-sm">
          Find someone by name or username and begin writing.
        </p>
        <button
          type="button"
          className="mt-2 rounded-full border-2 border-slate-900 bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-[2px_3px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          onClick={() => {
            openSearchView();
            document.getElementById("searchPeople")?.focus();
          }}
        >
          Search for people
        </button>
      </div>
    );
  }

  const activeMutedIds = isMuteAll
    ? (conversations || []).map((c) => c.id)
    : mutedIds;

  return (
    <div>
      {/* Top Header Bar for Mute Controls & Placement Hint */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 dark:border-slate-800 pb-3">
        <div className="text-xs font-extrabold text-slate-600 dark:text-slate-400">
          💡 Click ⚙ on any chat to customize its placement (Left, Center, Right), shape, color & size
        </div>

        <button
          type="button"
          onClick={handleToggleMuteAll}
          className={`flex items-center gap-1.5 rounded-full border-2 border-slate-900 ${
            isMuteAll ? "bg-rose-500 text-white" : "bg-amber-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
          } px-3 py-1 text-xs font-black shadow-[1.5px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5`}
        >
          <RiVolumeMuteFill className="h-3.5 w-3.5" />
          <span>{isMuteAll ? "Unmute All" : "Mute All"}</span>
        </button>
      </div>

      <ConversationSection
        title="Pinned"
        conversations={pinned}
        empty="Nothing pinned yet. Open ⚙ menu on any chat card to pin it here!"
        myUserId={myUserId}
        onOpen={closeSidebar}
        onTogglePin={togglePin}
        mutedIds={activeMutedIds}
        onToggleMute={handleToggleMute}
        onMoveCard={handleMoveCard}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        draggedId={draggedId}
      />
      <ConversationSection
        title="All Conversations"
        conversations={rest}
        empty="No other conversations."
        myUserId={myUserId}
        onOpen={closeSidebar}
        onTogglePin={togglePin}
        mutedIds={activeMutedIds}
        onToggleMute={handleToggleMute}
        onMoveCard={handleMoveCard}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        draggedId={draggedId}
      />
    </div>
  );
}

export default UserList;
