export default function FormContainer({ children, onSubmit }) {
  return (
    <div className="flex w-full items-center justify-center p-2 sm:p-4">
      <form
        onSubmit={onSubmit}
        className="relative flex w-full max-w-md flex-col items-stretch rounded-[2.2rem] border-2 border-slate-900 bg-[#cbbcf6] p-6 sm:p-9 shadow-[6px_8px_0px_rgba(15,23,42,0.12)] transition-all"
      >
        {children}
      </form>
    </div>
  );
}
