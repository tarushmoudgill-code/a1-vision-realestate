"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "ah-favorites" }
  )
);

interface SavedSearchState {
  searches: { id: string; name: string; query: string; createdAt: string }[];
  add: (name: string, query: string) => void;
  remove: (id: string) => void;
}

export const useSavedSearches = create<SavedSearchState>()(
  persist(
    (set) => ({
      searches: [],
      add: (name, query) =>
        set((s) => ({
          searches: [
            {
              id: Math.random().toString(36).slice(2),
              name,
              query,
              createdAt: new Date().toISOString(),
            },
            ...s.searches,
          ],
        })),
      remove: (id) =>
        set((s) => ({ searches: s.searches.filter((x) => x.id !== id) })),
    }),
    { name: "ah-saved-searches" }
  )
);
