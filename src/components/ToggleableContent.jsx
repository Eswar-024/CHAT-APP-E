import { useEffect } from "react";

export default function ToggleableContent({
  children,
  isOpen,
  toggle,
  withOverlay = true,
  overlay = withOverlay ? "dim" : "invisible",
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        toggle();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle]);

  const overlayClass =
    overlay === "dim"
      ? "bg-black/10 md:bg-black/20"
      : overlay === "invisible"
        ? "bg-transparent"
        : "";

  return (
    <>
      {isOpen && overlay !== "none" && (
        <div
          tabIndex={-1}
          onClick={() => toggle()}
          className={`fixed inset-0 z-20 ${overlayClass}`}
          aria-hidden="true"
        />
      )}
      {children}
    </>
  );
}
