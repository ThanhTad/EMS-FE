// components/admin/ProtectedAdminRoute.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login?redirect=/admin/dashboard");
      } else if (!hasRole(UserRole.ADMIN)) {
        router.replace("/unauthorized");
      }
    }
  }, [isLoading, user, hasRole, router]);

  if (isLoading || !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <Loader2
          className="h-12 w-12 animate-spin text-primary"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (user && hasRole(UserRole.ADMIN)) {
    return <>{children}</>;
  }

  return null;
};

export default ProtectedAdminRoute;
