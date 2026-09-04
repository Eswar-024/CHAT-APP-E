import { useMessages } from "./useMessages";
import MessageItem from "./MessageItem";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import useIntersectionObserver from "./useIntersectionObserver";
import useScrollBehavior from "./useScrollBehavior";
import ShortTextMessage from "../../components/ShortTextMessage";

function MessageListSkeleton() {
  return (
    <div className="message-skel" aria-hidden="true">
      <span className="skel-line skel-line--peer" />
      <span className="skel-line skel-line--mine" />
      <span className="skel-line skel-line--peer skel-line--short" />
    </div>
  );
}

function Messages() {
  const {
    pages,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    hasNextPage,
    error,
  } = useMessages();

  const topRef = useRef(null);
  const bottomRef = useRef();
  const lastPageBtm = useRef(null);
  const listReadyRef = useRef(false);
  const [topElement, setTopElement] = useState(null);
  const [showNewMessages, setShowNewMessages] = useState(false);

  const isIntersectingTop = useIntersectionObserver(topElement);
  const isIntersectingBtm = useIntersectionObserver(bottomRef.current);

  const onAlignedBottom = useCallback(() => {
    setShowNewMessages(false);
  }, []);

  const onNewWhileAway = useCallback(() => {
    setShowNewMessages(true);
  }, []);

  useEffect(() => {
    if (topRef.current) {
      const timeoutId = setTimeout(() => {
        setTopElement(topRef.current);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [hasNextPage]);

  useEffect(() => {
    if (isIntersectingTop && hasNextPage) {
      fetchNextPage();
    }
  }, [isIntersectingTop, hasNextPage, fetchNextPage]);

  useScrollBehavior({
    pages,
    bottomRef,
    lastPageBtm,
    isIntersectingTop,
    isIntersectingBtm,
    onAlignedBottom,
    onNewWhileAway,
  });

  useLayoutEffect(() => {
    if (pages?.[0]) {
      listReadyRef.current = true;
    }
  }, [pages]);

  if (error) {
    return (
      <ShortTextMessage>
        <span className="status-enter">⚠️ {error.message}</span>
      </ShortTextMessage>
    );
  }

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  function jumpToLatest() {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    setShowNewMessages(false);
  }

  return (
    <div className="messages-frame">
      <div className="messages-scroller">
        <div
          tabIndex={-1}
          className="mx-auto flex w-full min-w-0 max-w-3xl flex-col px-3 sm:px-4 xl:max-w-4xl"
        >
          {pages && !pages[0]?.length && (
            <ShortTextMessage>No messages yet</ShortTextMessage>
          )}

          {pages && pages[0]?.length > 0 && (
            <>
              {hasNextPage && (
                <span ref={topRef} className="messages-history-hint">
                  {isFetchingNextPage ? (
                    <span className="skel-line skel-line--history" />
                  ) : null}
                </span>
              )}

              {pages.map((page, index) =>
                page.length ? (
                  <span
                    key={page[0]?.id || index}
                    className="flex w-full flex-col"
                  >
                    {page.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        animateEntrance={listReadyRef.current}
                      />
                    ))}

                    {index === 0 && <span ref={lastPageBtm}></span>}
                  </span>
                ) : (
                  <span
                    key={index}
                    className="mx-auto my-4 h-2 w-2 select-none rounded bg-LightShade/50 opacity-50"
                  ></span>
                ),
              )}
            </>
          )}

          <span ref={bottomRef}></span>
        </div>
      </div>

      {showNewMessages ? (
        <button
          type="button"
          className="new-messages-chip"
          onClick={jumpToLatest}
        >
          New messages
        </button>
      ) : null}
    </div>
  );
}

export default Messages;
