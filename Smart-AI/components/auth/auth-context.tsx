"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type MembershipTier = "Platinum" | "Gold" | "Silver";

export interface UserProfile {
  name: string;
  email: string;
  gymName?: string;
  membershipTier: MembershipTier;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (payload: { email: string; name?: string }) => Promise<void>;
  signup: (payload: {
    email: string;
    name: string;
    gymName?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "smart-ai-fitness:user";

function deriveTierFromEmail(email: string): MembershipTier {
  if (email.toLowerCase().includes("vip")) return "Platinum";
  if (email.toLowerCase().includes("pro")) return "Gold";
  return "Silver";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  async function login({ email, name }: { email: string; name?: string }) {
    const profile: UserProfile = {
      email,
      name: name || email.split("@")[0],
      membershipTier: deriveTierFromEmail(email),
    };
    setUser(profile);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }

  async function signup({
    email,
    name,
    gymName,
  }: {
    email: string;
    name: string;
    gymName?: string;
  }) {
    const profile: UserProfile = {
      email,
      name,
      gymName,
      membershipTier: deriveTierFromEmail(email),
    };
    setUser(profile);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }

  function logout() {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}