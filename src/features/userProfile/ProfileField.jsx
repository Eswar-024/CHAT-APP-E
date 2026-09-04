import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useUpdateUser } from "./useUpdateUser";
import Loader from "../../components/Loader";

function ProfileField({
  label,
  value = "",
  updateKey,
  maxLength,
  minLength = 0,
  regex,
  patternMessage,
  multiline = false,
  required = true,
}) {
  const { updateUser, isUpdating } = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value || "");
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  function validate(next) {
    const trimmed = next.trim();

    if (required && !trimmed) {
      return `Enter your ${label.toLowerCase()}.`;
    }

    if (trimmed && minLength && trimmed.length < minLength) {
      return `Minimum ${minLength} characters required.`;
    }

    if (maxLength && trimmed.length > maxLength) {
      return `Maximum ${maxLength} characters allowed.`;
    }

    if (trimmed && regex && !regex.test(trimmed)) {
      return patternMessage || "Invalid input.";
    }

    return "";
  }

  function handleSave() {
    const trimmed = draft.trim();
    const message = validate(draft);

    if (message) {
      setError(message);
      return;
    }

    if (trimmed === (value || "").trim()) {
      setIsEditing(false);
      setError("");
      return;
    }

    updateUser(
      { [updateKey]: trimmed },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success(`${label} updated.`);
          setIsEditing(false);
          setError("");
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  }

  function handleCancel() {
    setDraft(value || "");
    setError("");
    setIsEditing(false);
  }

  const remaining = maxLength ? maxLength - draft.length : null;
  const FieldTag = multiline ? "textarea" : "input";

  return (
    <div className="py-3 border-b border-slate-900/10 dark:border-slate-800 last:border-0">
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border-2 border-slate-900 bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs font-black text-slate-900 dark:text-slate-100 shadow-[1px_1.5px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:translate-y-0.5"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full border-2 border-slate-900 bg-emerald-400 px-3 py-1 text-xs font-black text-slate-900 shadow-[1px_1.5px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:translate-y-0.5"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader size="small" /> : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-full border-2 border-slate-900 bg-amber-200 dark:bg-amber-400 px-3 py-1 text-xs font-black text-slate-900 shadow-[1px_1.5px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:translate-y-0.5"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-2">
          <FieldTag
            ref={inputRef}
            id={updateKey}
            className="w-full rounded-xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[2px_2px_0px_rgba(15,23,42,1)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            value={draft}
            maxLength={maxLength}
            rows={multiline ? 3 : undefined}
            aria-label={label}
            onChange={(event) => {
              setDraft(event.target.value);
              setError("");
            }}
          />
          <div className="mt-1 flex items-center justify-between">
            {error ? <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p> : <span />}
            {remaining !== null ? (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{remaining} left</span>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {value?.trim() ? value : <span className="italic text-slate-600 dark:text-slate-400">Not set</span>}
        </p>
      )}
    </div>
  );
}

export default ProfileField;
