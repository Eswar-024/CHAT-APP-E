function SubmitBtn({ children, type = "submit", disabled = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-slate-900 bg-indigo-600 py-3.5 px-6 text-base font-bold text-white shadow-[3px_4px_0px_rgba(15,23,42,1)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[4px_6px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(15,23,42,1)] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none"
    >
      {children}
    </button>
  );
}

export default SubmitBtn;
