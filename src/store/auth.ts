"use client";

import { create } from "zustand";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "AGENT" | "PROPERTY_MANAGER" | "MARKETING" | "DEVELOPER";
  agentId?: string | null;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  lastActivity: number;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetSession: () => void;
  touchActivity: () => void;
}

function startSessionTimer(logout: () => Promise<void>) {
  if (timeoutHandle) clearTimeout(timeoutHandle);
  timeoutHandle = setTimeout(() => {
    logout();
  }, SESSION_TIMEOUT_MS);
}

function resetSessionTimer() {
  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
    timeoutHandle = null;
  }
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  hydrated: false,
  error: null,
  lastActivity: Date.now(),

  touchActivity: () => {
    set({ lastActivity: Date.now() });
    if (get().user) {
      startSessionTimer(() => get().logout());
    }
  },

  fetchMe: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        set({ user: null, hydrated: true, error: null });
        return;
      }
      const data = await res.json();
      const user = data.user ?? null;
      set({ user, hydrated: true, error: null });
      if (user) {
        startSessionTimer(() => get().logout());
      }
    } catch {
      set({ user: null, hydrated: true, error: null });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Login failed. Please check your credentials.";
        set({ loading: false, error: errorMsg });
        return { ok: false, error: errorMsg };
      }
      set({ user: data.user, loading: false, hydrated: true, error: null, lastActivity: Date.now() });
      startSessionTimer(() => get().logout());
      return { ok: true };
    } catch {
      const errorMsg = "Network error. Please check your connection and try again.";
      set({ loading: false, error: errorMsg });
      return { ok: false, error: errorMsg };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // non-fatal — proceed with client-side clear
    }
    resetSessionTimer();
    set({ user: null, hydrated: false, loading: false, error: null });
  },

  resetSession: () => {
    resetSessionTimer();
    set({ user: null, hydrated: false, loading: false, error: null, lastActivity: Date.now() });
  },
}));

// Set up activity listeners (mouse, keyboard, scroll) to keep session alive
if (typeof window !== "undefined") {
  ["mousedown", "keydown", "scroll", "touchstart"].forEach((event) => {
    window.addEventListener(event, () => {
      const { user, touchActivity } = useAuth.getState();
      if (user) touchActivity();
    }, { passive: true });
  });
}
