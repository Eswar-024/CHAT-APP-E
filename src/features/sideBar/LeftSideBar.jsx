import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUi } from "../../contexts/UiContext";
import ToggleableContent from "../../components/ToggleableContent";
import MyAccountView from "../userProfile/MyAccountView";
import DefaultView from "./DefaultView";

function LeftSideBar() {
  const { isSidebarOpen, isAccountViewOpen, closeSidebar, openSidebar } =
    useUi();
  const { userId } = useParams();

  useEffect(() => {
    userId ? closeSidebar() : openSidebar();
  }, [userId, closeSidebar, openSidebar]);

  function handleToggleSidebar() {
    userId && closeSidebar();
  }

  return (
    <div className="col-start-1 row-start-1 h-full min-h-0 w-full min-w-0">
      <ToggleableContent
        isOpen={isSidebarOpen}
        toggle={handleToggleSidebar}
        overlay={userId ? "dim" : "none"}
      >
        <aside
          className={`${
            isSidebarOpen
              ? "visible left-0 opacity-100"
              : "invisible -left-full opacity-0"
          } absolute top-0 z-30 min-h-screen-safe w-full overflow-y-auto bg-white pt-[env(safe-area-inset-top)] transition-all duration-300 ease-out md:visible md:relative md:left-0 md:h-full md:w-full md:opacity-100`}
        >
          {isAccountViewOpen ? <MyAccountView /> : <DefaultView />}
        </aside>
      </ToggleableContent>
    </div>
  );
}

export default LeftSideBar;
