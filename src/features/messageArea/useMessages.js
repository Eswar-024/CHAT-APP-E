import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages } from "./apiMessage";
import { useEffect } from "react";
import useConvInfo from "./useConvInfo";
import useMessageSubscription from "./useMessageSubscription";
import { markConversationRead } from "../sideBar/apiConversation";

export function useMessages() {
  const {
    convInfo,
    isPending: isPendingConvInfo,
    error: convError,
  } = useConvInfo();

  const conversation_id = convInfo?.id;
  const friendUserId = convInfo?.friendInfo?.id;
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(["friend", friendUserId], (prev) => {
      if (!prev || !prev.pages[1]?.length) return prev;
      return {
        pages: prev.pages.slice(0, 1),
        pageParams: prev.pageParams.slice(0, 1),
      };
    });
  }, [friendUserId, queryClient, conversation_id]);

  useEffect(() => {
    if (!conversation_id) return;
    markConversationRead(conversation_id).then((updated) => {
      queryClient.setQueriesData(
        { queryKey: ["conversations"] },
        (prev) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((conv) =>
            conv.id === updated.id ? { ...conv, unread_count: 0 } : conv,
          );
        },
      );
    }).catch(() => {});
  }, [conversation_id, queryClient]);

  const {
    data: { pages } = {},
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isPending,
    isLoading: isLoadingMessages,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["friend", friendUserId],
    queryFn: ({ pageParam }) => getMessages({ conversation_id, pageParam }),
    select: (data) => {
      if (!data || data.pages.length < 2) return data;
      return {
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    initialPageParam: undefined,
    enabled: Boolean(conversation_id && friendUserId),
  });

  useMessageSubscription({ conversation_id, friendUserId });

  const isLoading = isPendingConvInfo || isLoadingMessages;

  return {
    pages,
    isFetching,
    isPending,
    isLoading,
    error: convError || messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
