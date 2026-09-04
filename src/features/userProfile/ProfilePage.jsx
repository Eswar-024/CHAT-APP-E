import { useNavigate } from "react-router-dom";
import { useUser } from "../authentication/useUser";
import { useUi } from "../../contexts/UiContext";
import { useSignout } from "../authentication/useSignout";
import ProfileField from "./ProfileField";
import ProfilePasswordForm from "./ProfilePasswordForm";
import Loader from "../../components/Loader";
import {
  MAX_NAME_LENGTH,
  MAX_BIO_LENGTH,
  NAME_REGEX,
} from "../../config";
import { FiSun, FiMoon, FiArrowLeft, FiLogOut, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { RiAlignLeft, RiAlignCenter, RiAlignRight, RiGridLine } from "react-icons/ri";

function getInitial(name) {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function formatJoined(raw) {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], { month: "long", year: "numeric" });
}

function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const {
    isDarkMode,
    toggleDarkMode,
    cardSize,
    setCardSize,
    cardTheme,
    setCardTheme,
    cardZoom = 100,
    setCardZoom,
    cardAlignment = "full",
    setCardAlignment,
    cardShape = "rounded",
    setCardShape,
  } = useUi();
  const { signout, isPending } = useSignout();

  if (!user) return null;

  const { display_name, username, bio, avatar_url, created_at } = user;
  const joined = formatJoined(created_at);

  const cardSizes = [
    { id: "compact", label: "📱 Compact" },
    { id: "standard", label: "📐 Standard" },
    { id: "spacious", label: "🔳 Spacious" },
  ];

  const cardShapes = [
    { id: "rounded", label: "Rounded", class: "rounded-[1.4rem]" },
    { id: "pill", label: "Pill", class: "rounded-[2.5rem]" },
    { id: "circle", label: "Circle", class: "rounded-full" },
    { id: "oval", label: "Oval Capsule", class: "rounded-[50%/35%]" },
    { id: "square", label: "Square", class: "rounded-sm" },
    { id: "leaf", label: "Asymmetric", class: "rounded-tl-[2.2rem] rounded-br-[2.2rem] rounded-tr-md rounded-bl-md" },
    { id: "star", label: "Comic Star", class: "rounded-tr-[2.8rem] rounded-bl-[2.8rem] rounded-tl-sm rounded-br-sm" },
    { id: "cloud", label: "Cloud Bubble", class: "rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-[1.2rem] rounded-br-[1.2rem]" },
  ];

  const cardThemes = [
    { id: "rainbow", label: "🌈 Multi-Color (Unique per Chat)", bg: "bg-gradient-to-r from-sky-200 via-amber-200 to-pink-200 text-slate-900" },
    { id: "blue", label: "🩵 Sky Blue", bg: "bg-[#bae6fd] text-slate-900" },
    { id: "orange", label: "🟧 Warm Peach", bg: "bg-[#ffedd5] text-slate-900" },
    { id: "yellow", label: "🨨 Sun Yellow", bg: "bg-[#fef08a] text-slate-900" },
    { id: "green", label: "🟩 Mint Green", bg: "bg-[#bbf7d0] text-slate-900" },
    { id: "purple", label: "🟪 Lavender", bg: "bg-[#dcd0ff] text-slate-900" },
  ];

  const alignmentOptions = [
    { id: "full", label: "Full Grid", icon: RiGridLine },
    { id: "left", label: "Left Aligned", icon: RiAlignLeft },
    { id: "center", label: "Center Aligned", icon: RiAlignCenter },
    { id: "right", label: "Right Aligned", icon: RiAlignRight },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 text-left">
      {/* Back Navigation Button */}
      <header className="mb-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-amber-300 dark:bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-900 shadow-[2px_3px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          onClick={() => navigate("/chat")}
        >
          <FiArrowLeft className="h-4 w-4 stroke-[2.5]" />
          <span>Back to conversations</span>
        </button>
      </header>

      <div className="space-y-6">
        {/* Profile Identity Hero Card */}
        <section className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-[4px_5px_0px_rgba(15,23,42,1)]">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-3 border-slate-900 bg-[#facc15] font-black text-slate-900 shadow-[2px_3px_0px_rgba(15,23,42,1)]">
            {avatar_url ? (
              <img src={avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-black">{getInitial(display_name)}</span>
            )}
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <span className="inline-block rounded-md border border-slate-900 bg-amber-200 px-2 py-0.5 text-[10px] font-black uppercase text-slate-900 mb-1">
              PROFILE
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {display_name}
            </h1>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">@{username}</p>
            {bio ? (
              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {bio}
              </p>
            ) : null}
          </div>
        </section>

        {/* Account Details Section */}
        <section className="rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-[4px_5px_0px_rgba(15,23,42,1)]">
          <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Account Info
          </h2>
          <div className="py-2 border-b border-slate-900/10 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Username
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">@{username}</p>
            <p className="mt-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Your unique handle (cannot be changed).
            </p>
          </div>
          <ProfileField
            label="Display name"
            value={display_name}
            updateKey="display_name"
            maxLength={MAX_NAME_LENGTH}
            minLength={1}
            regex={NAME_REGEX}
            patternMessage="Only letters, numbers, and single spaces are allowed."
          />
          <ProfileField
            label="Bio"
            value={bio || ""}
            updateKey="bio"
            maxLength={MAX_BIO_LENGTH}
            minLength={0}
            required={false}
            multiline
          />
          {joined ? (
            <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              Member since {joined}
            </p>
          ) : null}
        </section>

        {/* Appearance & Card Customization Section */}
        <section className="rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-[4px_5px_0px_rgba(15,23,42,1)]">
          <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Appearance & Customization
          </h2>

          {/* Theme Mode Toggle */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-900/10 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Theme Mode ({isDarkMode ? "Dark" : "Light"})
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Toggle between light and dark theme mode.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-amber-100 dark:bg-slate-800 px-4 py-2 text-xs font-black text-slate-900 dark:text-amber-300 shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              {isDarkMode ? <FiSun className="h-4 w-4 text-amber-400" /> : <FiMoon className="h-4 w-4 text-slate-900" />}
              <span>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
            </button>
          </div>

          {/* Dynamic Box Zoom Scale Slider */}
          <div className="mb-6 pb-5 border-b border-slate-900/10 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3 mb-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Box Zoom & Magnification
              </p>
              <span className="rounded-full border border-slate-900 bg-amber-300 px-2.5 py-0.5 text-xs font-black text-slate-900">
                {cardZoom}%
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Zoom in or zoom out to dynamically scale the box size like an image (70% - 140%).
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCardZoom(cardZoom - 5)}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-200 text-slate-900 shadow-[1px_2px_0px_rgba(15,23,42,1)] active:scale-95"
                title="Zoom Out"
              >
                <FiZoomOut className="h-5 w-5" />
              </button>
              <input
                type="range"
                min="70"
                max="140"
                step="5"
                value={cardZoom}
                onChange={(e) => setCardZoom(e.target.value)}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setCardZoom(cardZoom + 5)}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-200 text-slate-900 shadow-[1px_2px_0px_rgba(15,23,42,1)] active:scale-95"
                title="Zoom In"
              >
                <FiZoomIn className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Box Home Page Alignment */}
          <div className="mb-6 pb-5 border-b border-slate-900/10 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Chat Placement & Alignment
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Choose where chat boxes sit on the home page (Left, Center, Right, or Full Grid).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {alignmentOptions.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCardAlignment(opt.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 border-slate-900 p-3 text-xs font-black transition-all ${
                      cardAlignment === opt.id
                        ? "bg-amber-300 text-slate-900 shadow-[2px_3px_0px_rgba(15,23,42,1)] ring-2 ring-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-[1px_2px_0px_rgba(15,23,42,1)] hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Box Preset Size Selector */}
          <div className="mb-6 pb-5 border-b border-slate-900/10 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Preset Box Density
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Select padding preset for chat cards.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {cardSizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setCardSize(size.id)}
                  className={`rounded-xl border-2 border-slate-900 p-3 text-xs font-black transition-all ${
                    cardSize === size.id
                      ? "bg-amber-300 text-slate-900 shadow-[2px_3px_0px_rgba(15,23,42,1)] ring-2 ring-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-[1px_2px_0px_rgba(15,23,42,1)] hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Color Palette Selector */}
          <div className="mb-6 pb-5 border-b border-slate-900/10 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Chat Box Color Scheme
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Set multi-color rainbow or your preferred color for all chat cards.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cardThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setCardTheme(theme.id)}
                  className={`flex items-center gap-2 rounded-xl border-2 border-slate-900 ${theme.bg} p-3 text-xs font-black transition-all ${
                    cardTheme === theme.id
                      ? "shadow-[3px_4px_0px_rgba(15,23,42,1)] ring-4 ring-slate-900/40 scale-[1.02]"
                      : "shadow-[1.5px_2px_0px_rgba(15,23,42,1)] opacity-90 hover:opacity-100"
                  }`}
                >
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Shape Selector */}
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Chat Card Shape
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              Choose default geometry shape for chat cards (Rounded, Pill, Circle, Oval, Square, Asymmetric, Comic Star, Cloud).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cardShapes.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => setCardShape(shape.id)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 border-slate-900 p-3 text-xs font-black transition-all ${
                    cardShape === shape.id
                      ? "bg-amber-300 text-slate-900 shadow-[2px_3px_0px_rgba(15,23,42,1)] ring-2 ring-slate-900 scale-[1.02]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-[1px_2px_0px_rgba(15,23,42,1)] hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className={`h-4 w-4 border-2 border-slate-900 bg-amber-400 flex-shrink-0 ${shape.class}`} />
                  <span className="truncate">{shape.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Log Out Section */}
        <section className="rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-[4px_5px_0px_rgba(15,23,42,1)]">
          <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Security & Session
          </h2>
          <ProfilePasswordForm />
          <div className="mt-6 pt-4 border-t border-slate-900/10 dark:border-slate-800">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-rose-500 px-5 py-2.5 text-xs font-black text-white shadow-[2px_3px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              onClick={() => signout()}
              disabled={isPending}
            >
              {isPending ? (
                <Loader size="small" />
              ) : (
                <>
                  <FiLogOut className="h-4 w-4 stroke-[2.5]" />
                  <span>Log out of account</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
