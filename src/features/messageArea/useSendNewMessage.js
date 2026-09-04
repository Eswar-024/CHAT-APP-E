import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "./apiMessage";
import useConvInfo from "./useConvInfo";
import toast from "react-hot-toast";
import { upsertMessage } from "./upsertMessage";

export function useSendNewMessage() {
  const queryClient = useQueryClient();
  const { convInfo } = useConvInfo();
  const friendUserId = convInfo?.friendInfo?.id;

  const { mutate: sendNewMessage, isPending: isSending } = useMutation({
    mutationFn: ({ conversation_id, content }) =>
      sendMessage({ conversation_id, content }),

    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: ["friend", friendUserId],
      });

      queryClient.setQueryData(["friend", friendUserId], (oldMessages) =>
        upsertMessage(oldMessages, newMessage),
      );
    },

    onSuccess: (savedMessage) => {
      queryClient.setQueryData(["friend", friendUserId], (oldMessages) =>
        upsertMessage(oldMessages, savedMessage),
      );

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },

    onError: (error, failedMessage) => {
      toast.error(error.message);
      queryClient.setQueryData(["friend", friendUserId], (current) => {
        if (!current?.pages) return current;
        return {
          ...current,
          pages: current.pages.map((page, index) => {
            if (index !== 0) return page;
            const next = page.filter((message) => message.id !== failedMessage.id);
            next.nextCursor = page.nextCursor;
            return next;
          }),
        };
      });
    },
  });

  return { isSending, sendNewMessage };
}
