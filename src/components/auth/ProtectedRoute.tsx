import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const location = useLocation();

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !location.pathname.includes("/login")
    ) {
      toast("Please sign in to access this page");
    }
  }, [isLoading]);

  if (isLoading) {
    // Return a loading state or null
    return null;
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
