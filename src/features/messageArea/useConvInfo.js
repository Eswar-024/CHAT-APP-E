import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getConvInfoById } from "./apiConvInfo";
import { useUser } from "../authentication/useUser";

function useConvInfo() {
  const { userId: friendUserId } = useParams();
  const { user } = useUser();

  const {
    data: convInfo,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["convInfo", friendUserId],
    queryFn: () => getConvInfoById({ friendUserId }),
    enabled: Boolean(user?.id && friendUserId),
    staleTime: Infinity,
  });

  return { convInfo, isPending, isError, error };
}

export default useConvInfo;
