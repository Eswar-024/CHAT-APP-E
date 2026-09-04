import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "./apiUserAccount";
import toast from "react-hot-toast";

export function useUpdateUser() {
  const quryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onMutate: () => {
      toast.loading("Updating...");
    },
    onSuccess: (data) => {
      toast.dismiss();
      if (data?.user) {
        quryClient.setQueryData(["user"], data);
      } else {
        quryClient.invalidateQueries({ queryKey: ["user"] });
      }
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.message);
    },
  });

  return { updateUser, isUpdating };
}
