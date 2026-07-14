"use client";

import { useSyncExternalStore } from "react";

// SSR-safe "is this running on the client?" hook.
// Returns false during SSR and the first server render, true on the client.
// Uses useSyncExternalStore to avoid setState-in-effect lint violations.
const emptySubscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
