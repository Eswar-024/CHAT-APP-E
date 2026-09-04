import { useEnterKeyPress } from "../utils/useEnterKeyPress";

function Profile({ onClick, userData }) {
  const displayName = userData?.display_name || userData?.fullname;
  const username = userData?.username;
  const avatar_url = userData?.avatar_url;
  const isOnline = userData?.is_online === true;
  const initial = (displayName || username || "?").trim().charAt(0).toUpperCase();

  const handleKeyDown = useEnterKeyPress(onClick);

  if (!userData) return <span className="font-bold text-slate-900 dark:text-slate-100">⚠️</span>;

  return (
    <div
      className="mr-auto flex min-w-0 max-w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-900 bg-amber-50 dark:bg-slate-800 p-2 px-3 shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${displayName}, @${username}`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-amber-300 font-black text-slate-900 shadow-[1px_1px_0px_rgba(15,23,42,1)]">
        {avatar_url ? (
          <img
            src={avatar_url}
            alt=""
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          <span className="text-base font-black">{initial}</span>
        )}
      </div>

      <div className="min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-black text-base leading-tight text-slate-900 dark:text-slate-100">
            {displayName}
          </p>
          {isOnline && (
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full border border-slate-900 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] cursor-pointer transition-transform hover:scale-125"
              title="Online"
              aria-label="Online"
            />
          )}
        </div>
        <p className="truncate text-xs font-extrabold text-slate-700 dark:text-slate-300">
          @{username}
        </p>
      </div>
    </div>
  );
}

export default Profile;
