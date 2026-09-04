import { APP_NAME } from "../config";

function LogoLarge() {
  return (
    <div className="mb-4 flex flex-col items-center justify-center text-center">
      {/* Cartoon yellow circular avatar icon inspired by reference image */}
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-900 bg-[#facc15] shadow-[2px_3px_0px_rgba(15,23,42,1)]">
        <div className="h-4 w-4 rounded-full border-2 border-slate-900 bg-slate-900/90" />
      </div>

      {/* Decorative horizontal lines matching reference visual hierarchy */}
      <div className="mb-4 flex w-full max-w-[200px] flex-col gap-1.5">
        <div className="h-0.5 w-full rounded-full bg-slate-900/80" />
        <div className="h-0.5 w-full rounded-full bg-slate-900/80" />
      </div>

      {/* Brand title */}
      <span className="text-xl font-black tracking-widest text-slate-900 uppercase">
        {APP_NAME}
      </span>
    </div>
  );
}

export default LogoLarge;
