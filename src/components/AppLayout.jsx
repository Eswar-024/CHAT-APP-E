import { getSocket } from "../lib/socket";
import { useUser } from "../features/authentication/useUser";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainContainer from "./MainContainer";
import PageTransition from "./PageTransition";

function AppLayout() {
  const { isAuthenticated } = useUser();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    return undefined;
  }, [isAuthenticated]);

  return (
    <MainContainer className="inbox-canvas overflow-y-auto">
      <div className="relative min-h-screen-safe w-full min-w-0 flex flex-col">
        <PageTransition key={pathname} className="min-h-full flex-1 flex flex-col">
          <Outlet />
        </PageTransition>
      </div>
    </MainContainer>
  );
}

export default AppLayout;
