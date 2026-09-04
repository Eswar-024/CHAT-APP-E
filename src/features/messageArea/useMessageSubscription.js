import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { subscribeRealtimeMessage } from "./apiRealtimeMessage";
import { upsertMessage } from "./upsertMessage";

function useMessageSubscription({ conversation_id, friendUserId }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversation_id || !friendUserId) return undefined;

    const subscription = subscribeRealtimeMessage({
      conversation_id,
      callback: (newData) => {
        queryClient.setQueryData(["friend", friendUserId], (prevData) =>
          upsertMessage(prevData, newData),
        );
      },
      onReconnect: () => {
        queryClient.invalidateQueries({
          queryKey: ["friend", friendUserId],
        });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversation_id, friendUserId, queryClient]);
}

export default useMessageSubscription;
