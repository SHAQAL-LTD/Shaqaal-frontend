"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api, setTokens, clearTokens, getAccessToken } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string; role: string; country: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * SECURITY: Nuclear logout — clears ALL localStorage keys, not just our tokens.
 * Uses hard redirect to guarantee no stale React state leaks to the next session.
 */
function nuclearLogout() {
  // Clear everything — not just our keys
  try { localStorage.clear(); } catch { /* ignore */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (!getAccessToken()) {
        if (mountedRef.current) setUser(null);
        return;
      }
      const profile = await api.me.get();
      if (mountedRef.current) setUser(profile);
    } catch {
      if (mountedRef.current) setUser(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => {
      if (mountedRef.current) setLoading(false);
    });
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    // SECURITY: Clear any leftover state from previous session before setting new tokens
    nuclearLogout();
    const tokens = await api.auth.login({ email, password });
    setTokens(tokens.accessToken, tokens.refreshToken);
    const profile = await api.me.get();
    setUser(profile);
  }, []);

  const register = useCallback(async (data: { fullName: string; email: string; phone: string; password: string; role: string; country: string }) => {
    nuclearLogout();
    const tokens = await api.auth.register(data);
    setTokens(tokens.accessToken, tokens.refreshToken);
    const profile = await api.me.get();
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    // 1. Immediately null the user in React state so no component can use stale data
    setUser(null);
    // 2. Clear ALL browser storage
    nuclearLogout();
    // 3. Hard redirect — guarantees a full page reload, no stale state survives
    window.location.replace("/login");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
