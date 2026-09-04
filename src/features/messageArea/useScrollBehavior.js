import { useEffect, useRef } from "react";

function newestMessage(pages) {
  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const page = pages[index];
    if (page?.length) {
      return page[page.length - 1];
    }
  }
  return null;
}

function useScrollBehavior({
  pages,
  bottomRef,
  lastPageBtm,
  isIntersectingTop,
  isIntersectingBtm,
  onAlignedBottom,
  onNewWhileAway,
}) {
  const nearBottomRef = useRef(true);
  const intersectingTopRef = useRef(false);
  const didInitRef = useRef(false);
  const prevRef = useRef({ newestId: undefined, pageCount: 0 });

  useEffect(() => {
    nearBottomRef.current = Boolean(isIntersectingBtm);
    if (isIntersectingBtm) {
      onAlignedBottom?.();
    }
  }, [isIntersectingBtm, onAlignedBottom]);

  useEffect(() => {
    intersectingTopRef.current = Boolean(isIntersectingTop);
  }, [isIntersectingTop]);

  useEffect(() => {
    if (!pages?.length) return;

    const newest = newestMessage(pages);
    const newestId = newest?.id;
    const pageCount = pages.length;
    const prev = prevRef.current;
    prevRef.current = { newestId, pageCount };

    const scrollTo = (ref, behavior = "auto") => {
      ref?.current?.scrollIntoView({ behavior, block: "end" });
    };

    if (!didInitRef.current) {
      didInitRef.current = true;
      scrollTo(bottomRef, "auto");
      onAlignedBottom?.();
      return;
    }

    const loadedOlder =
      pageCount > prev.pageCount && newestId === prev.newestId;

    if (loadedOlder) {
      if (intersectingTopRef.current) {
        scrollTo(lastPageBtm, "auto");
      }
      return;
    }

    if (newestId && newestId !== prev.newestId) {
      if (newest?.optimistic || nearBottomRef.current) {
        scrollTo(bottomRef, "auto");
        onAlignedBottom?.();
      } else {
        onNewWhileAway?.();
      }
    }
  }, [pages, bottomRef, lastPageBtm, onAlignedBottom, onNewWhileAway]);
}

export default useScrollBehavior;
