"use client";

import React from "react";

import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

export type Session = {
  userId: string;
  name: string;
};

const STORAGE_KEY = "turbo.session";

function readSession(): Session | null {
  return readLocalStorage<Session | null>(STORAGE_KEY, null);
}

export function useSession() {
  const [session, setSession] = React.useState<Session | null>(() => readSession());

  const signInMock = React.useCallback(() => {
    const next: Session = { userId: "u_demo", name: "Demo User" };
    writeLocalStorage(STORAGE_KEY, next);
    setSession(next);
  }, []);

  const signOut = React.useCallback(() => {
    writeLocalStorage(STORAGE_KEY, null);
    setSession(null);
  }, []);

  return { session, signInMock, signOut };
}


