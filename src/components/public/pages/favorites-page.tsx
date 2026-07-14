"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Trash2, ArrowRight, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";
import { useFavorites } from "@/store/favorites";
import type { Property } from "@/lib/types";

export function FavoritesPage() {
  const navigate = useRouter((s) => s.navigate);
  const favoriteIds = useFavorites((s) => s.ids);
  const clearFavorites = useFavorites((s) => s.clear);

  const [all, setAll] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Fetch all properties once; filter client-side by favourite ids.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/properties?limit=999", {
          signal: controller.signal,
        });
        const d = (await r.json()) as { properties: Property[] };
        if (active) setAll(d.properties || []);
      } catch {
        /* noop */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const favorites = useMemo(() => {
    const set = new Set(favoriteIds);
    return all.filter((p) => set.has(p.id));
  }, [all, favoriteIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.suburb?.name.toLowerCase().includes(q) ?? false)
    );
  }, [favorites, query]);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
        </div>
        <div className="container-tight relative py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-6 bg-gold" /> Your collection
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Saved Favourites
            </h1>
            <p className="mt-4 max-w-2xl text-base text-primary-foreground/80">
              Keep your shortlist in one place. Tap the heart on any property to
              save it here for later.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-primary-foreground">
              <Heart size={14} className="fill-gold text-gold" />
              {favorites.length} saved {favorites.length === 1 ? "property" : "properties"}
            </div>
          </div>
        </div>
      </section>

      <section className="container-tight py-12 sm:py-16">
        {loading ? (
          <FavoritesSkeleton />
        ) : favorites.length === 0 ? (
          <EmptyFavorites onBrowse={() => navigate("properties")} />
        ) : (
          <>
            {/* Toolbar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your saved properties…"
                  className="h-12 pl-10"
                  aria-label="Search favourites"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gold text-gold">
                  {filtered.length} shown
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearFavorites();
                  }}
                  className="h-12"
                >
                  <Trash2 size={16} className="mr-1.5" /> Clear all
                </Button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 border-dashed p-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
                  <Search size={22} className="text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold">
                  No matches
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  No saved properties match your search. Try a different
                  keyword.
                </p>
                <Button
                  onClick={() => setQuery("")}
                  className="mt-2 h-11 bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  Clear search
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        {!loading && favorites.length > 0 && (
          <div className="mt-12">
            <SectionHeading
              eyebrow="Keep exploring"
              title="Looking for more?"
              description="Browse the full A1 Vision Real Estate collection or talk to one of our buyer advocates about off-market opportunities."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("properties")}
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Browse all properties
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                onClick={() => navigate("services/buyer-advocacy")}
                variant="outline"
                className="h-12 border-gold text-gold hover:bg-gold hover:text-gold-foreground"
              >
                Buyer advocacy
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyFavorites({ onBrowse }: { onBrowse: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 border-dashed p-12 text-center sm:p-16">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-cream">
        <Heart size={34} className="text-gold" />
      </div>
      <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
        Your favourites list is empty
      </h2>
      <p className="max-w-md text-muted-foreground">
        Start building your shortlist by tapping the heart icon on any property.
        Saved properties will appear here so you can compare and revisit them
        anytime.
      </p>
      <Button
        onClick={onBrowse}
        className="mt-2 h-12 bg-gold text-gold-foreground hover:bg-gold/90"
      >
        <Building2 size={18} className="mr-2" /> Browse properties
      </Button>
    </Card>
  );
}

function FavoritesSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-12 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden p-0">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
