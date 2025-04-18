import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const location = useLocation();

  // Check if current path is the overlay route and if it has an auth parameter
  const isOverlayWithAuth =
    location.pathname === "/overlay" && location.search.includes("auth=");

  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !location.pathname.includes("/login") &&
      !isOverlayWithAuth // Don't show toast for overlay with auth
    ) {
      toast("Please sign in to access this page");
    }
  }, [isLoading, isAuthenticated, location, isOverlayWithAuth]);

  if (isLoading) {
    return null;
  }

  // Allow access to overlay path if it has auth parameter
  if (!isAuthenticated && !isOverlayWithAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
