"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * SECURITY: This component guarantees that unauthenticated users never see
 * protected content. It:
 * 1. Shows a loading spinner while auth state is being determined
 * 2. Immediately redirects to /login if no user is confirmed
 * 3. Redirects admin accounts to /users — Shaqal staff use the operations
 *    console only, never the platform dashboard
 * 4. Returns null (renders nothing) until user is confirmed
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Admin accounts are operations-only — keep them out of the platform shell.
    if (user.role === "admin") {
      router.replace("/users");
    }
  }, [loading, user, router]);

  // Still loading auth state — show spinner, render nothing else
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-muted text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // No user confirmed — render nothing while redirect happens
  if (!user) return null;

  // Admin is being redirected to the operations console — render nothing here
  if (user.role === "admin") return null;

  // User confirmed — safe to render children
  return <>{children}</>;
}
