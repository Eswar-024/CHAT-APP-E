import { useNavigate } from "react-router-dom";
import { useUser } from "../authentication/useUser";
import { useEnterKeyPress } from "../../utils/useEnterKeyPress";
import { useSocketStatus } from "../../lib/useSocketStatus";
import { useUi } from "../../contexts/UiContext";
import { FiSun, FiMoon, FiRefreshCw } from "react-icons/fi";

function getInitial(name) {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function Header() {
  const { user } = useUser();
  const navigate = useNavigate();
  const socketStatus = useSocketStatus();
  const { isDarkMode, toggleDarkMode } = useUi();
  const displayName = user?.display_name || "";
  const avatarUrl = user?.avatar_url;

  function openProfile() {
    navigate("/profile");
  }

  function handleReload() {
    window.location.reload();
  }

  const handleKeyDown = useEnterKeyPress(openProfile);

  return (
    <header className="mb-6 flex items-center justify-between gap-4 border-b-2 border-slate-900/10 dark:border-slate-700/50 pb-4">
      {/* Click Logo to Reload Page */}
      <div
        className="flex items-center gap-3 cursor-pointer group select-none"
        onClick={handleReload}
        title="Click to reload app"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleReload()}
      >
        <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-[#facc15] shadow-[1px_2px_0px_rgba(15,23,42,1)] group-hover:rotate-12 transition-transform">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          </div>
          <div className="hidden flex-col gap-1 sm:flex">
            <div className="h-0.5 w-6 rounded-full bg-slate-900 dark:bg-slate-100" />
            <div className="h-0.5 w-6 rounded-full bg-slate-900 dark:bg-slate-100" />
          </div>
        </div>

        <h1 className="text-xl font-black tracking-widest text-slate-900 dark:text-slate-100 uppercase sm:text-2xl flex items-center gap-2">
          CHAT-APP E
          <FiRefreshCw className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 animate-spin" />
        </h1>

        {socketStatus === "reconnecting" || socketStatus === "offline" ? (
          <span className="rounded-full border border-slate-900 bg-amber-300 px-2.5 py-0.5 text-xs font-bold text-slate-900">
            {socketStatus === "offline" ? "Offline" : "Reconnecting..."}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {/* Light Mode / Dark Mode Toggle Button */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-100 dark:bg-slate-800 text-slate-900 dark:text-amber-300 font-extrabold shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <FiSun className="h-5 w-5 text-amber-400" /> : <FiMoon className="h-5 w-5 text-slate-900" />}
        </button>

        {/* Profile Avatar Button */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-amber-200 font-extrabold text-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          onClick={openProfile}
          onKeyDown={handleKeyDown}
          aria-label="Open profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true">{getInitial(displayName)}</span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
