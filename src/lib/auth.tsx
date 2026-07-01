"use client";
/**
 * auth.tsx — real auth via Supabase (email + password), JWT sessions.
 *
 * Supabase issues a signed JWT per session (`session.access_token`).
 * `getAccessToken()` below is what `api.ts` calls to attach that token as
 * an `Authorization: Bearer <jwt>` header on backend requests, so your
 * Flask API can verify the caller (see `backend/app/auth.py`).
 *
 * Configuration lives entirely in `src/lib/supabase.ts` / `.env.local` —
 * nothing else in this file should need to change for a new deployment.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean; // true once we've checked for an existing session
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Current Supabase JWT, or null if signed out. Used by api.ts. */
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(session: Session | null): AuthUser | null {
  const u = session?.user;
  if (!u) return null;
  return {
    id: u.id,
    name: (u.user_metadata?.name as string | undefined) || u.email?.split("@")[0] || "there",
    email: u.email ?? "",
    createdAt: u.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut();
  }, []);

  const getAccessToken = useCallback(() => session?.access_token ?? null, [session]);

  return (
    <AuthContext.Provider
      value={{ user: toAuthUser(session), ready, login, signup, logout, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
