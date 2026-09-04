import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup as apiSignup } from "./apiAuth";
import toast from "react-hot-toast";

export function useSignup() {
  const queryClient = useQueryClient();

  const { mutate: signup, isPending } = useMutation({
    mutationFn: apiSignup,
    onMutate: () => {
      toast.loading("Creating account...");
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

  return { signup, isPending };
}
