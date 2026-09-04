function messageTime(value) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

export function compareMessages(a, b) {
  const timeDiff = messageTime(a?.created_at) - messageTime(b?.created_at);
  if (timeDiff !== 0) return timeDiff;
  return String(a?.id || "").localeCompare(String(b?.id || ""));
}

function withCursor(page, nextCursor) {
  page.nextCursor = nextCursor ?? null;
  return page;
}

function clonePages(prevData, mapFirstPage) {
  return {
    ...prevData,
    pages: prevData.pages.map((page, index) => {
      if (index !== 0) return page;
      const nextCursor = page.nextCursor ?? null;
      return withCursor(mapFirstPage(page), nextCursor);
    }),
  };
}

export function upsertMessage(prevData, newData) {
  if (!newData?.id) return prevData;

  if (!prevData?.pages?.length) {
    return {
      pages: [withCursor([newData], null)],
      pageParams: [undefined],
    };
  }

  const alreadyHasId = prevData.pages.some((page) =>
    Array.isArray(page)
      ? page.some((message) => message.id === newData.id)
      : false,
  );
  if (alreadyHasId) {
    return prevData;
  }

  const firstPage = prevData.pages[0] || [];
  const optimisticIndex = firstPage.findIndex(
    (message) =>
      message.optimistic &&
      message.content === newData.content &&
      message.sender_id === newData.sender_id,
  );

  if (optimisticIndex >= 0) {
    return clonePages(prevData, (page) =>
      page
        .map((message, i) => (i === optimisticIndex ? newData : message))
        .sort(compareMessages),
    );
  }

  return clonePages(prevData, (page) =>
    [...page, newData].sort(compareMessages),
  );
}
