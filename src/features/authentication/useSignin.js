import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signin as apiSignin } from "./apiAuth";
import toast from "react-hot-toast";

export function useSignin() {
  const queryClient = useQueryClient();

  const { mutate: signin, isPending } = useMutation({
    mutationFn: ({ username, password }) =>
      apiSignin({ username, password }),
    onMutate: () => {
      toast.loading("Signing in...");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      toast.dismiss();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.message);
    },
  });

  return { signin, isPending };
}
