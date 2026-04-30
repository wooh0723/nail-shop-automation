"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingDraft, EMPTY_DRAFT } from "./types";

const KEY = "signicho-booking-draft";

function readFromStorage(): BookingDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as BookingDraft;
    return parsed && typeof parsed === "object" ? parsed : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeToStorage(draft: BookingDraft) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch (e) {
    console.warn("[booking] sessionStorage write failed", e);
  }
}

export function useBookingDraft() {
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate-from-external-storage: intentional setState on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(readFromStorage());
    setHydrated(true);
  }, []);

  const patch = useCallback((partial: Partial<BookingDraft>) => {
    setDraft((prev) => {
      const next: BookingDraft = { ...prev, ...partial };
      writeToStorage(next);
      return next;
    });
  }, []);

  const replace = useCallback((next: BookingDraft) => {
    writeToStorage(next);
    setDraft(next);
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(KEY);
    }
    setDraft(EMPTY_DRAFT);
  }, []);

  return { draft, patch, replace, clear, hydrated };
}
