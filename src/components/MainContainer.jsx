export default function MainContainer({ children, className = "" }) {
  if (className.includes("inbox-canvas")) {
    return (
      <main
        className={`relative flex min-h-screen-safe w-full min-w-0 flex-col items-stretch justify-start overflow-x-clip bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 ${className}`}
      >
        {children}
      </main>
    );
  }

  return (
    <main
      className={`relative flex min-h-screen-safe w-full min-w-0 flex-col items-center justify-center overflow-x-clip bg-slate-50 dark:bg-slate-950 px-4 py-8 text-slate-900 dark:text-slate-100 selection:bg-purple-200 transition-colors duration-200 ${className}`}
    >
      {children}
    </main>
  );
}
