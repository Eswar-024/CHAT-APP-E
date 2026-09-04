import { useSearchedUsers } from "./useSearchedUsers";
import { useUi } from "../../contexts/UiContext";
import ConversationCard from "../inbox/ConversationCard";

function SearchView() {
  const { users, isShortQuery, isLoading, error } = useSearchedUsers();
  const { closeSearchView } = useUi();

  if (isShortQuery) {
    return (
      <div className="py-4 text-left">
        <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-900">
          People
        </h3>
        <p className="text-xs font-semibold text-slate-600">
          Search by name or username.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-4 text-left" aria-busy="true">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-900">
          Searching...
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          <div className="h-32 rounded-[1.4rem] border-2 border-slate-900 bg-slate-100 animate-pulse" />
          <div className="h-32 rounded-[1.4rem] border-2 border-slate-900 bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-slate-900 bg-rose-100 p-4 text-center font-bold text-rose-800">
        Search failed. Try again.
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="py-4 text-left">
        <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-900">
          People
        </h3>
        <p className="text-xs font-semibold text-slate-600">
          No people found.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 text-left">
      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-900">
        People
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {users.map(({ id, avatar_url, display_name, username }) => (
          <ConversationCard
            key={id}
            id={id}
            displayName={display_name}
            username={username}
            avatarUrl={avatar_url}
            lastMessage=""
            timestamp=""
            showLatestMessage={false}
            onOpen={() => closeSearchView({ back: false })}
          />
        ))}
      </div>
    </div>
  );
}

export default SearchView;
