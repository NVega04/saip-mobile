import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { getAllowedModules, canAccessModule } from "../utils/permissions";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  moduleId?: string;
}

export default function ProtectedRoute({ children, moduleId }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const { showAlert } = useAlert();
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  useEffect(() => {
    getAllowedModules().then(setAllowedModules);
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!currentUser) {
    return null;
  }

  if (moduleId && !canAccessModule(moduleId, allowedModules)) {
    showAlert("error", "No tienes acceso a este módulo");
    return null;
  }

  return <>{children}</>;
}
