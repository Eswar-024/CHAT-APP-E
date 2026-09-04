const MAX_PINNED = 3;

export function partitionConversations(conversations) {
  const list = (conversations || []).filter((conv) => conv?.peer?.id);
  const pinned = list.filter((conv) => conv.is_pinned).slice(0, MAX_PINNED);
  const pinnedIds = new Set(pinned.map((conv) => conv.id));
  const rest = list.filter((conv) => !pinnedIds.has(conv.id));

  return { pinned, rest, hasAny: list.length > 0 };
}
