"use client";

import { create } from "zustand";

// Hash-based client router for the single-route SPA.
// Hash format: #/segment/segment?query=string  e.g. #/property/123-sea?tab=features

function parseHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#\/?/, "");
}

function splitQuery(p: string): { pathOnly: string; query: Record<string, string> } {
  const qIdx = p.indexOf("?");
  const pathOnly = qIdx === -1 ? p : p.slice(0, qIdx);
  const query: Record<string, string> = {};
  if (qIdx !== -1) {
    const sp = new URLSearchParams(p.slice(qIdx + 1));
    sp.forEach((v, k) => {
      query[k] = v;
    });
  }
  return { pathOnly, query };
}

interface RouterState {
  path: string; // full hash path incl. query, e.g. "properties?listingType=SALE"
  segments: string[]; // path segments without query, e.g. ["properties"]
  query: Record<string, string>; // parsed query params
  navigate: (to: string) => void;
  back: () => void;
  setFromHash: () => void;
}

function derive(p: string) {
  const { pathOnly, query } = splitQuery(p);
  return {
    path: p,
    segments: pathOnly ? pathOnly.split("/").filter(Boolean) : [],
    query,
  };
}

export const useRouter = create<RouterState>((set) => ({
  ...derive(parseHash()),
  navigate: (to: string) => {
    const clean = to.replace(/^\/+/, "");
    if (typeof window !== "undefined") {
      window.location.hash = "#/" + clean;
    }
    set(derive(clean));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  },
  back: () => {
    if (typeof window !== "undefined") window.history.back();
  },
  setFromHash: () => {
    set(derive(parseHash()));
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => useRouter.getState().setFromHash());
}

// Convenience hook to get the active view + params
export function useRoute() {
  const segments = useRouter((s) => s.segments);
  const navigate = useRouter((s) => s.navigate);
  const query = useRouter((s) => s.query);
  const view = segments[0] || "home";
  return { view, segments, navigate, query };
}
