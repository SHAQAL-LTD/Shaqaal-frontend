"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
