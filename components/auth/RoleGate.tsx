"use client";

import type { UserRole } from "@/lib/stores/auth-store";
import { useAuthStore } from "@/lib/stores/auth-store";

type RoleGateProps = {
  roles: UserRole[];
  fallback: React.ReactNode;
  children: React.ReactNode;
};

export function RoleGate({ roles, fallback, children }: RoleGateProps) {
  const role = useAuthStore((state) => state.role);
  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
