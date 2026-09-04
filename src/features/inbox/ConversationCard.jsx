import { useNavigate, useParams } from "react-router-dom";
import { useEnterKeyPress } from "../../utils/useEnterKeyPress";
import { useUi } from "../../contexts/UiContext";
import { useState, useRef, useEffect } from "react";
import {
  RiPushpinLine,
  RiPushpinFill,
  RiVolumeMuteLine,
  RiVolumeUpLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSettings4Line,
  RiRefreshLine,
} from "react-icons/ri";

function getInitial(name) {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

const COLOR_OPTIONS = [
  { id: "blue", name: "Sky Blue", bg: "bg-[#bae6fd]" },
  { id: "green", name: "Mint Green", bg: "bg-[#bbf7d0]" },
  { id: "orange", name: "Warm Peach", bg: "bg-[#ffedd5]" },
  { id: "yellow", name: "Sun Yellow", bg: "bg-[#fef08a]" },
  { id: "purple", name: "Lavender", bg: "bg-[#dcd0ff]" },
  { id: "pink", name: "Soft Pink", bg: "bg-[#fbcfe8]" },
  { id: "coral", name: "Warm Coral", bg: "bg-[#fed7aa]" },
  { id: "rose", name: "Soft Rose", bg: "bg-[#fecdd3]" },
];

const SHAPE_OPTIONS = [
  { id: "rounded", name: "Rounded", class: "rounded-[1.4rem]" },
  { id: "pill", name: "Pill / Bubble", class: "rounded-[2.5rem]" },
  { id: "circle", name: "Circle Badge", class: "rounded-full" },
  { id: "oval", name: "Oval Capsule", class: "rounded-[50%/35%]" },
  { id: "square", name: "Square", class: "rounded-sm" },
  { id: "leaf", name: "Asymmetric", class: "rounded-tl-[2.2rem] rounded-br-[2.2rem] rounded-tr-md rounded-bl-md" },
  { id: "star", name: "Comic Star", class: "rounded-tr-[2.8rem] rounded-bl-[2.8rem] rounded-tl-sm rounded-br-sm" },
  { id: "cloud", name: "Cloud Bubble", class: "rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-[1.2rem] rounded-br-[1.2rem]" },
];

function getPastelColor(id, theme, customColor) {
  if (customColor) return customColor;

  const found = COLOR_OPTIONS.find((c) => c.id === theme);
  if (found) return found.bg;

  if (!id) return COLOR_OPTIONS[0].bg;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return COLOR_OPTIONS[Math.abs(hash) % COLOR_OPTIONS.length].bg;
}

function ConversationCard({
  id,
  convId,
  displayName,
  username,
  avatarUrl,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOwnLastMessage = false,
  isPinned = false,
  isMuted = false,
  isOnline = false,
  isDragging = false,
  showLatestMessage = true,
  onOpen,
  onTogglePin,
  onToggleMute,
  onMoveLeft,
  onMoveRight,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const targetId = convId || id;
  const { userId: currentPeerId } = useParams();
  const { cardSize = "standard", cardTheme = "rainbow", cardZoom = 100, cardShape: globalCardShape = "rounded" } = useUi();
  const isActive = currentPeerId === id;
  const navigate = useNavigate();
  const hasUnread = unreadCount > 0;
  const initial = getInitial(displayName);

  const [showMenu, setShowMenu] = useState(false);
  const [isSelfDragging, setIsSelfDragging] = useState(false);

  const cardRef = useRef(null);
  const isResizingRef = useRef(false);
  const wasResizedRef = useRef(false);
  const resizeTimeoutRef = useRef(null);
  const startSizeRef = useRef({ w: 0, h: 0, x: 0, y: 0 });
  const longPressTimerRef = useRef(null);

  // Sticky Note Custom Cursor Movement (Up, Down, Left, Right anywhere)
  const [stickyPos, setStickyPos] = useState(() => {
    try {
      const saved = localStorage.getItem(`chat_pos_${id}`);
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });
  const [isDraggingSticky, setIsDraggingSticky] = useState(false);
  const wasMovedStickyRef = useRef(false);
  const stickyDragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  const [customColor, setCustomColor] = useState(() => {
    try {
      return localStorage.getItem(`chat_color_${id}`) || "";
    } catch {
      return "";
    }
  });

  const [customShape, setCustomShape] = useState(() => {
    try {
      return localStorage.getItem(`chat_shape_${id}`) || "rounded";
    } catch {
      return "rounded";
    }
  });

  const [dimensions, setDimensions] = useState(() => {
    try {
      const saved = localStorage.getItem(`chat_size_${id}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customAlign, setCustomAlign] = useState(() => {
    try {
      return localStorage.getItem(`chat_align_${id}`) || "left";
    } catch {
      return "left";
    }
  });

  const bgColor = getPastelColor(id, cardTheme, customColor);

  // ResizeObserver to detect and persist card size changes and set anti-click flag
  useEffect(() => {
    if (!cardRef.current) return;
    const elem = cardRef.current;
    let initialCheck = true;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (initialCheck) {
          initialCheck = false;
          return;
        }
        const newW = Math.round(entry.contentRect.width);
        const newH = Math.round(entry.contentRect.height);

        if (newW > 0 && newH > 0 && !isResizingRef.current) {
          wasResizedRef.current = true;
          if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
          resizeTimeoutRef.current = setTimeout(() => {
            wasResizedRef.current = false;
          }, 500);

          const newDim = { width: `${newW}px`, height: `${newH}px` };
          try {
            localStorage.setItem(`chat_size_${id}`, JSON.stringify(newDim));
            if (targetId) localStorage.setItem(`chat_size_${targetId}`, JSON.stringify(newDim));
          } catch {
            // ignore
          }
        }
      }
    });

    observer.observe(elem);
    return () => {
      observer.disconnect();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [id, targetId]);

  function handleStartInteraction(e) {
    // Completely isolate card resizing from sticky drag & long press
    if (
      isResizingRef.current ||
      window.__isResizingCard ||
      e.target.closest("button") ||
      e.target.closest(".cursor-nwse-resize") ||
      e.target.tagName === "BUTTON"
    ) {
      return;
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (cardRef.current) {
      startSizeRef.current = {
        w: cardRef.current.offsetWidth,
        h: cardRef.current.offsetHeight,
        x: clientX,
        y: clientY,
      };
    }

    // Initialize Sticky Note Cursor Drag Movement
    stickyDragStartRef.current = {
      x: clientX,
      y: clientY,
      initialX: stickyPos.x,
      initialY: stickyPos.y,
    };
    wasMovedStickyRef.current = false;

    function handleStickyPointerMove(moveEv) {
      if (isResizingRef.current || window.__isResizingCard) return;

      const curX = moveEv.touches ? moveEv.touches[0].clientX : moveEv.clientX;
      const curY = moveEv.touches ? moveEv.touches[0].clientY : moveEv.clientY;
      const deltaX = curX - stickyDragStartRef.current.x;
      const deltaY = curY - stickyDragStartRef.current.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        if (!wasMovedStickyRef.current) {
          wasMovedStickyRef.current = true;
          setIsDraggingSticky(true);
        }
        setStickyPos({
          x: stickyDragStartRef.current.initialX + deltaX,
          y: stickyDragStartRef.current.initialY + deltaY,
        });
      }
    }

    function handleStickyPointerUp() {
      window.removeEventListener("mousemove", handleStickyPointerMove);
      window.removeEventListener("mouseup", handleStickyPointerUp);
      window.removeEventListener("touchmove", handleStickyPointerMove);
      window.removeEventListener("touchend", handleStickyPointerUp);

      if (wasMovedStickyRef.current) {
        setIsDraggingSticky(false);
        wasResizedRef.current = true;
        setTimeout(() => {
          wasResizedRef.current = false;
        }, 500);

        setStickyPos((latestPos) => {
          try {
            localStorage.setItem(`chat_pos_${id}`, JSON.stringify(latestPos));
            if (targetId) localStorage.setItem(`chat_pos_${targetId}`, JSON.stringify(latestPos));
          } catch {
            // ignore
          }
          return latestPos;
        });
      }
    }

    window.addEventListener("mousemove", handleStickyPointerMove);
    window.addEventListener("mouseup", handleStickyPointerUp);
    window.addEventListener("touchmove", handleStickyPointerMove);
    window.addEventListener("touchend", handleStickyPointerUp);

    // Long press timer for quick placement & customization menu
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      if (!wasMovedStickyRef.current && !isResizingRef.current && !window.__isResizingCard) {
        if (navigator.vibrate) {
          try { navigator.vibrate(50); } catch { /* ignore */ }
        }
        setShowMenu(true);
      }
    }, 450);
  }

  function handleMoveInteraction(e) {
    if (!longPressTimerRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffX = Math.abs(clientX - startSizeRef.current.x);
    const diffY = Math.abs(clientY - startSizeRef.current.y);

    if (diffX > 8 || diffY > 8) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleEndInteraction() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleClick(e) {
    if (
      isSelfDragging ||
      isResizingRef.current ||
      window.__isResizingCard ||
      wasResizedRef.current ||
      wasMovedStickyRef.current ||
      isDraggingSticky
    ) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      return;
    }

    if (cardRef.current) {
      const currentW = cardRef.current.offsetWidth;
      const currentH = cardRef.current.offsetHeight;
      const diffW = Math.abs(currentW - startSizeRef.current.w);
      const diffH = Math.abs(currentH - startSizeRef.current.h);

      if (diffW > 5 || diffH > 5) {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        const newDim = { width: `${currentW}px`, height: `${currentH}px` };
        setDimensions(newDim);
        try {
          localStorage.setItem(`chat_size_${id}`, JSON.stringify(newDim));
          if (targetId) localStorage.setItem(`chat_size_${targetId}`, JSON.stringify(newDim));
        } catch {
          // ignore
        }
        return;
      }
    }

    onOpen?.();
    navigate(`/chat/${id}`);
  }

  function handleResetStickyPos() {
    const zeroPos = { x: 0, y: 0 };
    setStickyPos(zeroPos);
    try {
      localStorage.removeItem(`chat_pos_${id}`);
      if (targetId) localStorage.removeItem(`chat_pos_${targetId}`);
    } catch {
      // ignore
    }
  }

  function handleSelectColor(colorBg) {
    setCustomColor(colorBg);
    try {
      localStorage.setItem(`chat_color_${id}`, colorBg);
      localStorage.setItem(`chat_color_${targetId}`, colorBg);
    } catch {
      // ignore
    }
  }

  function handleSelectShape(shapeId) {
    setCustomShape(shapeId);
    try {
      localStorage.setItem(`chat_shape_${id}`, shapeId);
      localStorage.setItem(`chat_shape_${targetId}`, shapeId);
    } catch {
      // ignore
    }
  }

  function handleSelectAlign(alignVal) {
    setCustomAlign(alignVal);
    handleResetStickyPos();
    try {
      localStorage.setItem(`chat_align_${id}`, alignVal);
      localStorage.setItem(`chat_align_${targetId}`, alignVal);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  }

  function handleResizeStart(e) {
    e.stopPropagation();
    e.preventDefault();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    isResizingRef.current = true;
    window.__isResizingCard = true;
    wasResizedRef.current = true;

    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startY = e.touches ? e.touches[0].clientY : e.clientY;
    const cardElem = cardRef.current || e.currentTarget.closest("article");
    if (!cardElem) return;
    const startWidth = cardElem.offsetWidth;
    const startHeight = cardElem.offsetHeight;

    let finalDim = null;

    function handleResizeMove(moveEv) {
      moveEv.stopPropagation();
      const currentX = moveEv.touches ? moveEv.touches[0].clientX : moveEv.clientX;
      const currentY = moveEv.touches ? moveEv.touches[0].clientY : moveEv.clientY;
      const newWidth = Math.max(220, startWidth + (currentX - startX));
      const newHeight = Math.max(130, startHeight + (currentY - startY));

      finalDim = { width: `${newWidth}px`, height: `${newHeight}px` };
      setDimensions(finalDim);
    }

    function handleResizeEnd() {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
      window.removeEventListener("touchmove", handleResizeMove);
      window.removeEventListener("touchend", handleResizeEnd);

      if (finalDim) {
        try {
          localStorage.setItem(`chat_size_${id}`, JSON.stringify(finalDim));
          if (targetId) localStorage.setItem(`chat_size_${targetId}`, JSON.stringify(finalDim));
        } catch {
          // ignore
        }
      }

      function blockResizeClick(clickEv) {
        clickEv.stopPropagation();
        clickEv.preventDefault();
        window.removeEventListener("click", blockResizeClick, true);
      }
      window.addEventListener("click", blockResizeClick, true);

      setTimeout(() => {
        isResizingRef.current = false;
        window.__isResizingCard = false;
        wasResizedRef.current = false;
      }, 500);
    }

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
    window.addEventListener("touchmove", handleResizeMove);
    window.addEventListener("touchend", handleResizeEnd);
  }

  function handleDragStartInternal(e) {
    setIsSelfDragging(true);
    onDragStart?.(e, targetId);
  }

  function handleDragEndInternal() {
    setTimeout(() => {
      setIsSelfDragging(false);
    }, 200);
  }

  const handleKeyDown = useEnterKeyPress(handleClick);
  const preview = lastMessage
    ? isOwnLastMessage
      ? `You: ${lastMessage}`
      : lastMessage
    : "Start a conversation";

  const sizePaddingMap = {
    compact: "p-4 min-h-[135px]",
    standard: "p-5 min-h-[160px]",
    spacious: "p-6 min-h-[195px]",
  };

  const avatarSizeMap = {
    compact: "h-9 w-9 text-xs",
    standard: "h-11 w-11 text-base",
    spacious: "h-13 w-13 text-lg",
  };

  const titleSizeMap = {
    compact: "text-sm",
    standard: "text-base sm:text-lg",
    spacious: "text-lg sm:text-xl",
  };

  const activeShapeId = customShape || globalCardShape;
  const shapeClass =
    SHAPE_OPTIONS.find((s) => s.id === activeShapeId)?.class || "rounded-[1.4rem]";

  const zoomFactor = cardZoom / 100;
  const isStickyMoved = stickyPos.x !== 0 || stickyPos.y !== 0;

  const customStyles = {
    zoom: zoomFactor,
    resize: "none",
    overflow: "auto",
    minWidth: "240px",
    minHeight: "140px",
    ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {}),
    transform: `translate3d(${stickyPos.x}px, ${stickyPos.y}px, 0px)`,
    zIndex: isDraggingSticky ? 999 : isStickyMoved ? 40 : "auto",
  };

  return (
    <article
      ref={cardRef}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onDragOver={(e) => onDragOver?.(e)}
      onDrop={(e) => onDrop?.(e, targetId)}
      onMouseDown={handleStartInteraction}
      onTouchStart={handleStartInteraction}
      onMouseMove={handleMoveInteraction}
      onTouchMove={handleMoveInteraction}
      onMouseUp={handleEndInteraction}
      onTouchEnd={handleEndInteraction}
      style={customStyles}
      className={`relative flex flex-col justify-between ${shapeClass} ${
        isDraggingSticky
          ? "scale-105 shadow-[8px_12px_24px_rgba(15,23,42,0.4)] rotate-1 cursor-grabbing ring-4 ring-amber-400 z-50 transition-none"
          : isDragging || isSelfDragging
          ? "opacity-50 border-4 border-dashed border-slate-900 scale-95"
          : hasUnread
          ? "border-4 border-[#facc15] dark:border-yellow-400 ring-4 ring-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.6),4px_5px_0px_rgba(15,23,42,1)]"
          : isStickyMoved
          ? "border-2 border-slate-900 shadow-[5px_7px_0px_rgba(15,23,42,1)] ring-2 ring-amber-400/60"
          : "border-2 border-slate-900 shadow-[3px_4px_0px_rgba(15,23,42,1)]"
      } ${bgColor} ${
        sizePaddingMap[cardSize] || sizePaddingMap.standard
      } transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[5px_7px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(15,23,42,1)] cursor-grab active:cursor-grabbing text-left ${
        isActive ? "ring-4 ring-slate-900/30" : ""
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${displayName}${hasUnread ? ", unread message" : ""}`}
    >
      <div>
        {/* Top Unread Yellow Highlight Banner */}
        {hasUnread && (
          <div className="mb-2.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-slate-900 bg-[#facc15] px-2.5 py-0.5 text-[11px] font-black text-slate-900 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] animate-pulse">
              ⚡ NEW MSG! {unreadCount > 1 ? `(${unreadCount})` : ""}
            </span>
          </div>
        )}

        {/* Card Header: Avatar, Name + Green Online Dot & Options Gear Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`relative flex ${
                avatarSizeMap[cardSize] || avatarSizeMap.standard
              } flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-white font-black text-slate-900 shadow-[1px_2px_0px_rgba(15,23,42,1)]`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3
                  className={`truncate font-black leading-tight text-slate-900 ${
                    titleSizeMap[cardSize] || titleSizeMap.standard
                  }`}
                >
                  {displayName}
                </h3>
                {/* Green Dot Online Status Indicator AFTER Name */}
                {isOnline && (
                  <span
                    className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full border border-slate-900 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] cursor-pointer transition-transform hover:scale-125"
                    title="Online"
                    aria-label="Online"
                  />
                )}
              </div>
              {username ? (
                <p className="truncate text-xs font-bold text-slate-700">@{username}</p>
              ) : null}
            </div>
          </div>

          {/* Options & Customize Button */}
          <div className="flex items-center gap-1.5 flex-shrink-0 relative">
            {isPinned && (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-300 text-slate-900 shadow-[1px_1px_0px_rgba(15,23,42,1)]"
                title="Pinned Conversation"
              >
                <RiPushpinFill className="h-3.5 w-3.5" />
              </span>
            )}

            {isMuted && (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-rose-200 text-rose-900 shadow-[1px_1px_0px_rgba(15,23,42,1)]"
                title="Muted"
              >
                <RiVolumeMuteLine className="h-3.5 w-3.5" />
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-white/90 text-slate-900 shadow-[1px_1px_0px_rgba(15,23,42,1)] hover:bg-amber-100 transition-transform active:scale-90"
              title="Card options & customization"
              aria-label="Card options"
            >
              <RiSettings4Line className="h-4 w-4" />
            </button>

            {/* Cartoon Popover Action Menu */}
            {showMenu && (
              <div
                className="absolute top-9 right-0 z-50 flex flex-col gap-2 rounded-2xl border-2 border-slate-900 bg-white p-3 shadow-[4px_4px_0px_rgba(15,23,42,1)] min-w-[220px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Free Sticky Drag Hint & Reset */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      📌 Sticky Move (Drag Anywhere)
                    </span>
                    {isStickyMoved && (
                      <button
                        type="button"
                        onClick={handleResetStickyPos}
                        className="flex items-center gap-0.5 text-[10px] font-black text-rose-600 hover:underline"
                        title="Reset sticky position to default alignment"
                      >
                        <RiRefreshLine className="h-3 w-3" /> Reset
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 bg-slate-100 p-1.5 rounded-lg border border-slate-900/20">
                    💡 Click & drag this card with cursor/finger to float it anywhere (up, down, left, right)!
                  </p>
                </div>

                <hr className="border-slate-900/10 my-0.5" />

                {/* Preset Placement Alignment */}
                <div>
                  <span className="block mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    📍 Align Shortcut
                  </span>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-900 bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => handleSelectAlign("left")}
                      className={`flex-1 rounded py-1 text-[11px] font-black ${
                        customAlign === "left" && !isStickyMoved
                          ? "bg-amber-300 text-slate-900"
                          : "text-slate-700 hover:bg-amber-100"
                      }`}
                      title="Align card to Left"
                    >
                      ⬅ Left
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAlign("center")}
                      className={`flex-1 rounded py-1 text-[11px] font-black ${
                        customAlign === "center" && !isStickyMoved
                          ? "bg-amber-300 text-slate-900"
                          : "text-slate-700 hover:bg-amber-100"
                      }`}
                      title="Align card to Center"
                    >
                      ↔ Center
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAlign("right")}
                      className={`flex-1 rounded py-1 text-[11px] font-black ${
                        customAlign === "right" && !isStickyMoved
                          ? "bg-amber-300 text-slate-900"
                          : "text-slate-700 hover:bg-amber-100"
                      }`}
                      title="Align card to Right"
                    >
                      ➡ Right
                    </button>
                  </div>
                </div>

                <hr className="border-slate-900/10 my-0.5" />

                {/* Color Palette Selector */}
                <div>
                  <span className="block mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    🎨 Color Palette
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectColor(opt.bg)}
                        className={`h-5 w-5 rounded-full border-2 border-slate-900 ${opt.bg} transition-transform hover:scale-110 shadow-[1px_1px_0px_rgba(15,23,42,1)]`}
                        title={opt.name}
                      />
                    ))}
                  </div>
                </div>

                <hr className="border-slate-900/10 my-0.5" />

                {/* Card Shape Selector */}
                <div>
                  <span className="block mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    🔷 Card Shape
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SHAPE_OPTIONS.map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => handleSelectShape(shape.id)}
                        className={`flex items-center gap-1.5 rounded-lg border border-slate-900 p-1.5 text-[11px] font-extrabold text-slate-900 hover:bg-amber-100 ${
                          customShape === shape.id ? "bg-amber-300" : "bg-slate-50"
                        }`}
                      >
                        <span className={`h-3.5 w-3.5 border border-slate-900 bg-amber-300 ${shape.class}`} />
                        <span className="truncate">{shape.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-900/10 my-0.5" />

                {/* Order Shift Controls */}
                {(onMoveLeft || onMoveRight) && (
                  <div>
                    <span className="block mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      ↕ Shift Order
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onMoveLeft && (
                        <button
                          type="button"
                          onClick={() => {
                            onMoveLeft();
                          }}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-900 bg-slate-50 p-1.5 text-xs font-black text-slate-900 hover:bg-amber-200"
                        >
                          <RiArrowLeftSLine className="h-4 w-4" /> Left
                        </button>
                      )}
                      {onMoveRight && (
                        <button
                          type="button"
                          onClick={() => {
                            onMoveRight();
                          }}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-900 bg-slate-50 p-1.5 text-xs font-black text-slate-900 hover:bg-amber-200"
                        >
                          Right <RiArrowRightSLine className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <hr className="border-slate-900/10 my-0.5" />

                {/* Pin & Mute Quick Actions */}
                <div className="flex items-center gap-1.5">
                  {onTogglePin && (
                    <button
                      type="button"
                      onClick={() => {
                        onTogglePin();
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-900 ${
                        isPinned ? "bg-amber-300 text-slate-900" : "bg-slate-50 text-slate-800 hover:bg-amber-100"
                      } p-1.5 text-xs font-black`}
                    >
                      {isPinned ? <RiPushpinFill className="h-3.5 w-3.5" /> : <RiPushpinLine className="h-3.5 w-3.5" />}
                      <span>{isPinned ? "Unpin" : "Pin"}</span>
                    </button>
                  )}

                  {onToggleMute && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleMute();
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-900 ${
                        isMuted ? "bg-rose-200 text-rose-900" : "bg-slate-50 text-slate-800 hover:bg-slate-200"
                      } p-1.5 text-xs font-black`}
                    >
                      {isMuted ? <RiVolumeMuteLine className="h-3.5 w-3.5" /> : <RiVolumeUpLine className="h-3.5 w-3.5" />}
                      <span>{isMuted ? "Unmute" : "Mute"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Preview */}
        {showLatestMessage ? (
          <p
            className={`mt-3.5 line-clamp-2 font-semibold leading-relaxed text-slate-900 ${
              cardSize === "compact" ? "text-xs mt-2" : "text-sm"
            }`}
          >
            {preview}
          </p>
        ) : null}
      </div>

      {/* Card Footer: Timestamp with right padding to prevent overlap with corner resize handle */}
      <div className="mt-3 flex items-center justify-between pr-6">
        <div />
        {showLatestMessage && timestamp ? (
          <time className="text-xs font-black tracking-wider text-slate-700 uppercase">
            {timestamp}
          </time>
        ) : null}
      </div>

      {/* Touch / Mouse Pull Corner Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className="absolute bottom-1 right-1 cursor-nwse-resize p-1 text-slate-900/60 hover:text-slate-900 transition-colors z-20 touch-none select-none"
        title="Pull corner to resize chat card dimensions"
        aria-label="Pull corner to resize"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
          <path d="M14 14H10V12H14V14ZM14 10H6V8H14V10ZM14 6H2V4H14V6Z" />
        </svg>
      </div>
    </article>
  );
}

export default ConversationCard;
