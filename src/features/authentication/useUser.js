import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "./apiAuth";

export function useUser() {
  const queryClient = useQueryClient();

  const { isLoading, data } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const user = data?.user ?? null;

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  return {
    isLoading,
    user,
    isAuthenticated: Boolean(user),
    invalidateUser,
  };
}
