"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (!getAccessToken()) {
        setUser(null);
        return;
      }
      const profile = await api.me.get();
      setUser(profile);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.auth.login({ email, password });
    setTokens(tokens.accessToken, tokens.refreshToken);
    const profile = await api.me.get();
    setUser(profile);
  }, []);

  const register = useCallback(async (data: { fullName: string; email: string; phone: string; password: string; role: string; country: string }) => {
    const tokens = await api.auth.register(data);
    setTokens(tokens.accessToken, tokens.refreshToken);
    const profile = await api.me.get();
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
    window.location.href = "/login";
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
