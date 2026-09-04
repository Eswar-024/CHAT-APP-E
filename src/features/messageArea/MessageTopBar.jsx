import { useUi } from "../../contexts/UiContext";
import { useNavigate } from "react-router-dom";
import ProfileSideBar from "../sideBar/ProfileSideBar";
import useConvInfo from "./useConvInfo";
import Profile from "../../components/Profile";
import IconButton from "../../components/IconButton";
import { useUser } from "../authentication/useUser";
import { useEffect } from "react";
import { APP_NAME } from "../../config";
import { FiSun, FiMoon } from "react-icons/fi";

function MessageTopBar() {
  const { convInfo, isPending } = useConvInfo();
  const { openFriendSidebar, isDarkMode, toggleDarkMode } = useUi();
  const { user } = useUser();

  const friend = convInfo?.friendInfo;
  const navigate = useNavigate();

  const myAvatarUrl = user?.avatar_url;
  const myDisplayName = user?.display_name || user?.username || "Me";
  const myInitial = (myDisplayName || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    document.title = friend?.display_name || friend?.fullname || APP_NAME;
  }, [friend]);

  function handleGoBack() {
    navigate("/chat", { replace: true });
    document.title = APP_NAME;
  }

  return (
    <>
      <div className="z-10 flex min-h-16 min-w-0 items-center justify-between gap-3 rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] shadow-[3px_3px_0px_rgba(15,23,42,1)] sm:min-h-20">
        {/* Left Side: Back button & Peer Profile */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <IconButton onClick={handleGoBack} label="Back to chats">
            <IconButton.Back />
          </IconButton>

          {isPending ? (
            <span className="skel-line skel-line--header" aria-hidden="true" />
          ) : (
            <Profile onClick={openFriendSidebar} userData={friend} />
          )}
        </div>

        {/* Right Side: Logged-in User Profile & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-100 dark:bg-slate-800 text-slate-900 dark:text-amber-300 font-black shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <FiSun className="h-5 w-5 text-amber-400" /> : <FiMoon className="h-5 w-5 text-slate-900" />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-amber-300 dark:bg-amber-400 font-black text-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            title={`My Profile (${myDisplayName})`}
            aria-label="Open my profile"
          >
            {myAvatarUrl ? (
              <img src={myAvatarUrl} alt={myDisplayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-black text-slate-900">{myInitial}</span>
            )}
          </button>
        </div>
      </div>

      {/* Hidden right side bar which will reveal if clicked on friend's profile info */}
      <ProfileSideBar friend={friend} />
    </>
  );
}

export default MessageTopBar;
