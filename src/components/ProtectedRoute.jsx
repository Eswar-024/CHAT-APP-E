import { useEffect } from "react";
import { useUser } from "../features/authentication/useUser";
import { useNavigate } from "react-router-dom";
import MainContainer from "./MainContainer";

function AuthBootSkeleton() {
  return (
    <div className="auth-boot" aria-busy="true" aria-label="Loading">
      <span className="skel-line skel-line--wide" />
      <span className="skel-line" />
      <span className="skel-line skel-line--short" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  //1. Load the authenticated user
  const { isLoading, isAuthenticated } = useUser();

  //2. if there isno authenticated user, redirect to the signin page
  useEffect(
    function () {
      if (!isAuthenticated && !isLoading)
        navigate("/login", { replace: true });
    },
    [isAuthenticated, isLoading, navigate],
  );

  //3. While loading, show spinner
  if (isLoading)
    return (
      <MainContainer>
        <AuthBootSkeleton />
      </MainContainer>
    );

  //4. if there is a user, render the app
  if (isAuthenticated) return children;
}

export default ProtectedRoute;
