"use client";

import React from "react";

import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import { phoneLogin, users } from "@/mock/users";

export type Session = {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  loggedInAt: string; // ISO
};

type AuthContextValue = {
  session: Session | null;
  loginWithIdPw: (id: string, password: string) => { ok: true } | { ok: false; error: string };
  sendPhoneCode: (phone: string) => { ok: true } | { ok: false; error: string };
  loginWithPhoneOtp: (phone: string, otp: string) => { ok: true } | { ok: false; error: string };
  loginWithSocial: (provider: "google" | "facebook" | "apple") => { ok: true };
  signupAndLogin: (input: {
    name: string;
    email: string;
    phone: string;
    id: string;
    password: string;
  }) => { ok: true } | { ok: false; error: string };
  updateProfile: (input: { name: string; email?: string; phone?: string }) => { ok: true } | { ok: false; error: string };
  deleteAccount: () => void;
  logout: () => void;
};

const STORAGE_SESSION_KEY = "session";
const STORAGE_LOCAL_USERS_KEY = "localUsers";

type LocalUser = {
  id: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(() =>
    readLocalStorage<Session | null>(STORAGE_SESSION_KEY, null),
  );

  const persistSession = React.useCallback((next: Session | null) => {
    writeLocalStorage(STORAGE_SESSION_KEY, next);
    setSession(next);
  }, []);

  const loginWithIdPw = React.useCallback(
    (id: string, password: string) => {
      const safeId = id.trim();
      const safePw = password;
      if (!safeId || !safePw) return { ok: false as const, error: "Please enter ID and password." };

      const localUsers = readLocalStorage<LocalUser[]>(STORAGE_LOCAL_USERS_KEY, []);
      const foundLocal = localUsers.find((u) => u.id === safeId && u.password === safePw);
      if (foundLocal) {
        persistSession({
          userId: foundLocal.id,
          name: foundLocal.name,
          email: foundLocal.email,
          phone: foundLocal.phone,
          loggedInAt: new Date().toISOString(),
        });
        return { ok: true as const };
      }

      const found = users.find((u) => u.id === safeId && u.password === safePw);
      if (!found) return { ok: false as const, error: "Invalid credentials." };

      persistSession({
        userId: found.id,
        name: found.name,
        email: `${found.id}@autozone.mn`,
        loggedInAt: new Date().toISOString(),
      });
      return { ok: true as const };
    },
    [persistSession],
  );

  const sendPhoneCode = React.useCallback((phone: string) => {
    const safe = phone.trim();
    if (!safe) return { ok: false as const, error: "Please enter phone number." };
    // Prototype: no real SMS, just pretend it was sent.
    return { ok: true as const };
  }, []);

  const loginWithPhoneOtp = React.useCallback(
    (phone: string, otp: string) => {
      const safePhone = phone.trim();
      const safeOtp = otp.trim();
      if (!safePhone) return { ok: false as const, error: "Please enter phone number." };
      if (safeOtp !== phoneLogin.otp) return { ok: false as const, error: "Invalid OTP code." };

      persistSession({
        userId: `phone:${safePhone}`,
        name: "Phone User",
        phone: safePhone,
        loggedInAt: new Date().toISOString(),
      });
      return { ok: true as const };
    },
    [persistSession],
  );

  const loginWithSocial = React.useCallback(
    (provider: "google" | "facebook" | "apple") => {
      const name =
        provider === "google" ? "Google User" : provider === "facebook" ? "Facebook User" : "Apple User";
      persistSession({
        userId: `${provider}:demo`,
        name,
        email: `${provider}.user@autozone.mn`,
        loggedInAt: new Date().toISOString(),
      });
      return { ok: true as const };
    },
    [persistSession],
  );

  const signupAndLogin = React.useCallback(
    (input: { name: string; email: string; phone: string; id: string; password: string }) => {
      const name = input.name.trim();
      const email = input.email.trim();
      const phone = input.phone.trim();
      const id = input.id.trim();
      const password = input.password;

      if (!name || !email || !phone || !id || !password) {
        return { ok: false as const, error: "Please fill all fields." };
      }

      const localUsers = readLocalStorage<LocalUser[]>(STORAGE_LOCAL_USERS_KEY, []);
      const exists = localUsers.some((u) => u.id === id) || users.some((u) => u.id === id);
      if (exists) return { ok: false as const, error: "ID already exists." };

      const nextUser: LocalUser = {
        id,
        password,
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      };
      writeLocalStorage(STORAGE_LOCAL_USERS_KEY, [nextUser, ...localUsers]);

      persistSession({
        userId: nextUser.id,
        name: nextUser.name,
        email: nextUser.email,
        phone: nextUser.phone,
        loggedInAt: new Date().toISOString(),
      });
      return { ok: true as const };
    },
    [persistSession],
  );

  const updateProfile = React.useCallback(
    (input: { name: string; email?: string; phone?: string }) => {
      if (!session) return { ok: false as const, error: "Not signed in." };
      const name = input.name.trim();
      const email = input.email?.trim();
      const phone = input.phone?.trim();
      if (!name) return { ok: false as const, error: "Name is required." };

      // Update local user record if it exists (prototype)
      const localUsers = readLocalStorage<LocalUser[]>(STORAGE_LOCAL_USERS_KEY, []);
      const idx = localUsers.findIndex((u) => u.id === session.userId);
      if (idx >= 0) {
        const copy = localUsers.slice();
        copy[idx] = {
          ...copy[idx]!,
          name,
          email: email ?? copy[idx]!.email,
          phone: phone ?? copy[idx]!.phone,
        };
        writeLocalStorage(STORAGE_LOCAL_USERS_KEY, copy);
      }

      persistSession({
        ...session,
        name,
        email: email ?? session.email,
        phone: phone ?? session.phone,
      });

      return { ok: true as const };
    },
    [persistSession, session],
  );

  const deleteAccount = React.useCallback(() => {
    const current = readLocalStorage<Session | null>(STORAGE_SESSION_KEY, null);
    if (current?.userId) {
      const localUsers = readLocalStorage<LocalUser[]>(STORAGE_LOCAL_USERS_KEY, []);
      const next = localUsers.filter((u) => u.id !== current.userId);
      writeLocalStorage(STORAGE_LOCAL_USERS_KEY, next);
    }
    persistSession(null);
  }, [persistSession]);

  const logout = React.useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const value = React.useMemo(
    () => ({
      session,
      loginWithIdPw,
      sendPhoneCode,
      loginWithPhoneOtp,
      loginWithSocial,
      signupAndLogin,
      updateProfile,
      deleteAccount,
      logout,
    }),
    [
      session,
      loginWithIdPw,
      sendPhoneCode,
      loginWithPhoneOtp,
      loginWithSocial,
      signupAndLogin,
      updateProfile,
      deleteAccount,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


