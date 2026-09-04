import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations, markConversationRead, togglePinConversation } from "./apiConversation";
import { getMessages } from "../messageArea/apiMessage";
import { useUser } from "../authentication/useUser";
import { useEffect, useRef } from "react";
import { MAX_PREFETCHED_CONVERSATIONS } from "../../config";
import { getConvInfoById } from "../messageArea/apiConvInfo";
import useConversationSubscription from "./useConversationSubscription";

export function useConversations() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const myUserId = user?.id;

  const { data, isPending, error } = useQuery({
    queryKey: ["conversations", myUserId],
    queryFn: getConversations,
    enabled: Boolean(myUserId),
  });

  useConversationSubscription(myUserId);

  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (!data || hasPrefetched.current) return;

    data?.slice(0, MAX_PREFETCHED_CONVERSATIONS).forEach((conv) => {
      const conversation_id = conv?.id;
      const friendUserId = conv?.peer?.id;

      if (!conversation_id || !friendUserId) return;

      queryClient.prefetchInfiniteQuery({
        queryKey: ["friend", friendUserId],
        queryFn: ({ pageParam }) => getMessages({ conversation_id, pageParam }),
        initialPageParam: undefined,
      });

      queryClient.prefetchQuery({
        queryKey: ["convInfo", friendUserId],
        queryFn: () => getConvInfoById({ friendUserId }),
      });
    });

    hasPrefetched.current = true;
  }, [data, queryClient]);

  useEffect(() => {
    hasPrefetched.current = false;
  }, [myUserId]);

  async function markRead(conversationId) {
    if (!conversationId) return;
    const updated = await markConversationRead(conversationId);
    queryClient.setQueryData(["conversations", myUserId], (prev) => {
      if (!prev) return prev;
      return prev.map((conv) => (conv.id === updated.id ? updated : conv));
    });
  }

  async function togglePin(conversationId) {
    if (!conversationId) return;
    const updated = await togglePinConversation(conversationId);
    queryClient.setQueryData(["conversations", myUserId], (prev) => {
      if (!prev) return prev;
      return prev.map((conv) => (conv.id === updated.id ? updated : conv));
    });
    queryClient.invalidateQueries({ queryKey: ["conversations", myUserId] });
  }

  return { conversations: data, isPending, error, markRead, togglePin, myUserId };
}
