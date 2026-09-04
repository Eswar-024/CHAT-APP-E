import { RiArrowLeftLine, RiCloseFill, RiMenuLine } from "react-icons/ri";

function IconButton({ children, onClick, addClass = "", label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${addClass} relative z-50 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-300 dark:bg-amber-400 font-extrabold text-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5`}
    >
      {children}
    </button>
  );
}

function BackIcon() {
  return <RiArrowLeftLine className="h-6 w-6 text-slate-900 stroke-[1.5]" aria-hidden="true" />;
}

function MenuIcon() {
  return <RiMenuLine className="h-6 w-6 text-slate-900 stroke-[1.5]" aria-hidden="true" />;
}

function CloseIcon() {
  return <RiCloseFill className="h-6 w-6 text-slate-900 stroke-[1.5]" aria-hidden="true" />;
}

IconButton.Back = BackIcon;
IconButton.Menu = MenuIcon;
IconButton.Close = CloseIcon;

export default IconButton;
