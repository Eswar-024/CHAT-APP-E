import { useState } from "react";
import toast from "react-hot-toast";
import { useUpdateUser } from "./useUpdateUser";
import Loader from "../../components/Loader";
import { MIN_PASSWORD_LENGTH } from "../../config";

function ProfilePasswordForm() {
  const { updateUser, isUpdating } = useUpdateUser();
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function reset() {
    setPassword("");
    setCurrentPassword("");
    setConfirm("");
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    updateUser(
      { password, current_password: currentPassword },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success("Password updated.");
          reset();
          setOpen(false);
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="rounded-full border-2 border-slate-900 bg-amber-200 dark:bg-amber-400 px-4 py-2 text-xs font-black text-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:translate-y-0.5"
        onClick={() => setOpen(true)}
      >
        🔒 Change password
      </button>
    );
  }

  return (
    <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-xs font-black uppercase text-slate-700 dark:text-slate-300" htmlFor="currentPassword">
          Current password
        </label>
        <input
          id="currentPassword"
          className="w-full rounded-xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[2px_2px_0px_rgba(15,23,42,1)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          type="password"
          autoComplete="current-password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            setError("");
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-black uppercase text-slate-700 dark:text-slate-300" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          className="w-full rounded-xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[2px_2px_0px_rgba(15,23,42,1)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-black uppercase text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          className="w-full rounded-xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[2px_2px_0px_rgba(15,23,42,1)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(event) => {
            setConfirm(event.target.value);
            setError("");
          }}
        />
      </div>

      {error ? <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p> : null}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          className="rounded-full border-2 border-slate-900 bg-slate-200 dark:bg-slate-700 px-4 py-2 text-xs font-black text-slate-900 dark:text-slate-100 shadow-[1.5px_2px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          disabled={isUpdating}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full border-2 border-slate-900 bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow-[1.5px_2px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          disabled={isUpdating}
        >
          {isUpdating ? <Loader size="small" /> : "Update password"}
        </button>
      </div>
    </form>
  );
}

export default ProfilePasswordForm;
