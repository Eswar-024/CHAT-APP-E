import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { subscribeRealtimeConversation } from "./apiRealtimeConversation";

const useConversationSubscription = (myUserId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!myUserId) return undefined;

    const subscription = subscribeRealtimeConversation({
      callback: (payload) => {
        queryClient.setQueryData(["conversations", myUserId], (prevData) => {
          if (!prevData) {
            queryClient.invalidateQueries({
              queryKey: ["conversations", myUserId],
            });
            return prevData;
          }

          const index = prevData.findIndex(
            (conversation) => conversation.id === payload.conversationId,
          );

          if (index === -1) {
            queryClient.invalidateQueries({
              queryKey: ["conversations", myUserId],
            });
            return prevData;
          }

          const current = prevData[index];
          if (
            payload.last_message?.id &&
            current.last_message?.id === payload.last_message.id
          ) {
            return prevData;
          }

          const updated = {
            ...current,
            last_message: payload.last_message,
            last_message_at: payload.last_message?.created_at,
          };
          const rest = prevData.filter((_, i) => i !== index);
          return [updated, ...rest];
        });
      },
      onReconnect: () => {
        queryClient.invalidateQueries({
          queryKey: ["conversations", myUserId],
        });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [myUserId, queryClient]);
};

export default useConversationSubscription;
