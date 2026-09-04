import { useLocation } from "react-router-dom";

function motionKind(pathname) {
  if (pathname.startsWith("/chat/") && pathname !== "/chat/") {
    return "conversation";
  }
  if (pathname === "/chat") return "inbox";
  if (pathname === "/profile") return "profile";
  if (
    pathname === "/login" ||
    pathname === "/signin" ||
    pathname === "/signup"
  ) {
    return "auth";
  }
  return "page";
}

function PageTransition({ children, className = "" }) {
  const { pathname } = useLocation();

  return (
    <div
      className={`view-enter ${className}`.trim()}
      data-motion={motionKind(pathname)}
    >
      {children}
    </div>
  );
}

export default PageTransition;
