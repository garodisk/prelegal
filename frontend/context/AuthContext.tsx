'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, clearStoredAuth, getStoredAuth, setStoredAuth } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signup(email: string, password: string): Promise<void>;
  signin(email: string, password: string): Promise<void>;
  signout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredAuth());
    setIsLoading(false);
  }, []);

  async function signup(email: string, password: string) {
    const res = await fetch(`${API}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail ?? 'Signup failed');
    }
    const data = await res.json();
    const authUser: AuthUser = { id: data.id, email: data.email, token: data.token };
    setStoredAuth(authUser);
    setUser(authUser);
  }

  async function signin(email: string, password: string) {
    const res = await fetch(`${API}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail ?? 'Invalid email or password');
    }
    const data = await res.json();
    const authUser: AuthUser = { id: data.id, email: data.email, token: data.token };
    setStoredAuth(authUser);
    setUser(authUser);
  }

  function signout() {
    clearStoredAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
