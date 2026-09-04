import UserList from "./UserList";

function UsersView() {
  return (
    <div className="w-full">
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Your conversations
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
          Keep the conversation going.
        </p>
      </div>
      <UserList />
    </div>
  );
}

export default UsersView;
