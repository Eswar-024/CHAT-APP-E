import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signout as signoutApi } from "./apiAuth";
import { useNavigate } from "react-router-dom";
import { useUi } from "../../contexts/UiContext";
import toast from "react-hot-toast";
import { disconnectSocket } from "../../lib/socket";

export function useSignout() {
  const { resetUi } = useUi();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function clearSession() {
    disconnectSocket();
    queryClient.clear();
    queryClient.setQueryData(["user"], { user: null });
    resetUi();
    navigate("/login", { replace: true });
  }

  const { mutate: signout, isPending } = useMutation({
    mutationFn: signoutApi,
    onSuccess: () => {
      clearSession();
    },
    onError: (error) => {
      if (error.status === 401) {
        clearSession();
        return;
      }
      toast.error(error.message);
    },
  });

  return { signout, isPending };
}
