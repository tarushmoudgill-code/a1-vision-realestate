"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon,
  X,
  Save,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PropertyCard } from "@/components/shared/property-card";
import { useRouter } from "@/store/router";
import { useSavedSearches } from "@/store/favorites";
import { PROPERTY_TYPES, LISTING_TYPE_LABEL } from "@/lib/constants";
import { toast } from "sonner";
import type { Property, Suburb } from "@/lib/types";

type ListingTab = "ALL" | "SALE" | "RENT" | "SOLD" | "NEW" | "AUCTION";

const LISTING_TABS: { key: ListingTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "SALE", label: "For Sale" },
  { key: "RENT", label: "For Rent" },
  { key: "SOLD", label: "Sold" },
  { key: "NEW", label: "New" },
  { key: "AUCTION", label: "Auction" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const PRICE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "500000", label: "$500K" },
  { value: "750000", label: "$750K" },
  { value: "1000000", label: "$1M" },
  { value: "1500000", label: "$1.5M" },
  { value: "2000000", label: "$2M" },
  { value: "3000000", label: "$3M" },
  { value: "5000000", label: "$5M" },
  { value: "10000000", label: "$10M+" },
];

const BED_OPTIONS = [
  { value: "", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

interface Filters {
  listingType: ListingTab;
  propertyType: string;
  suburbId: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  baths: string;
  cars: string;
  q: string;
  sort: string;
}

const DEFAULT_FILTERS: Filters = {
  listingType: "ALL",
  propertyType: "",
  suburbId: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
  cars: "",
  q: "",
  sort: "newest",
};

interface FilterControlsProps {
  filters: Filters;
  suburbs: Suburb[];
  compact?: boolean;
  onUpdate: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
  onSave: () => void;
}

function FilterControls({
  filters,
  suburbs,
  compact = false,
  onUpdate,
  onReset,
  onSave,
}: FilterControlsProps) {
  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {/* Listing type segmented control */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Listing Type
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {LISTING_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onUpdate("listingType", t.key)}
              className={`min-h-9 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                filters.listingType === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Property Type
          </Label>
          <Select
            value={filters.propertyType || "any"}
            onValueChange={(v) => onUpdate("propertyType", v === "any" ? "" : v)}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              {PROPERTY_TYPES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suburb
          </Label>
          <Select
            value={filters.suburbId || "any"}
            onValueChange={(v) => onUpdate("suburbId", v === "any" ? "" : v)}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Any suburb" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any suburb</SelectItem>
              {suburbs.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.postcode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Min Price
          </Label>
          <Select
            value={filters.minPrice || "any"}
            onValueChange={(v) => onUpdate("minPrice", v === "any" ? "" : v)}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="No min" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_OPTIONS.map((o) => (
                <SelectItem key={o.value || "any-min"} value={o.value || "any"}>
                  {o.value ? `From ${o.label}` : "No min"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Max Price
          </Label>
          <Select
            value={filters.maxPrice || "any"}
            onValueChange={(v) => onUpdate("maxPrice", v === "any" ? "" : v)}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="No max" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_OPTIONS.map((o) => (
                <SelectItem key={o.value || "any-max"} value={o.value || "any"}>
                  {o.value ? `Up to ${o.label}` : "No max"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "beds" as const, label: "Beds" },
          { key: "baths" as const, label: "Baths" },
          { key: "cars" as const, label: "Cars" },
        ].map((row) => (
          <div key={row.key}>
            <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {row.label}
            </Label>
            <Select
              value={filters[row.key] || "any"}
              onValueChange={(v) => onUpdate(row.key, v === "any" ? "" : v)}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {BED_OPTIONS.map((o) => (
                  <SelectItem
                    key={row.key + (o.value || "any")}
                    value={o.value || "any"}
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sort By
        </Label>
        <Select value={filters.sort} onValueChange={(v) => onUpdate("sort", v)}>
          <SelectTrigger className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={onReset} variant="outline" className="h-11 flex-1">
          <X size={16} className="mr-1" /> Reset
        </Button>
        <Button
          onClick={onSave}
          variant="outline"
          className="h-11 flex-1 border-gold text-gold hover:bg-gold hover:text-gold-foreground"
        >
          <Save size={16} className="mr-1" /> Save Search
        </Button>
      </div>
    </div>
  );
}

export function PropertiesPage() {
  const navigate = useRouter((s) => s.navigate);
  const initialQuery = useRouter((s) => s.query);
  const addSearch = useSavedSearches((s) => s.add);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [properties, setProperties] = useState<Property[]>([]);
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Seed filters from any query params passed via navigation (e.g. home quick links)
  useEffect(() => {
    if (!initialQuery || Object.keys(initialQuery).length === 0) return;
    setFilters((prev) => ({
      ...prev,
      listingType: (initialQuery.listingType as ListingTab) || prev.listingType,
      propertyType: initialQuery.propertyType || prev.propertyType,
      q: initialQuery.q || prev.q,
    }));
    if (initialQuery.q) setSearchInput(initialQuery.q);
  }, []);

  // Debounced search keyword
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => (f.q === searchInput ? f : { ...f, q: searchInput }));
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  // Load suburbs for filter options
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/suburbs", { signal: controller.signal });
        const d = (await r.json()) as { suburbs: Suburb[] };
        if (active) setSuburbs(d.suburbs || []);
      } catch {
        /* noop */
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const buildQuery = useCallback((f: Filters) => {
    const params = new URLSearchParams();
    if (f.listingType !== "ALL") params.set("listingType", f.listingType);
    if (f.propertyType) params.set("propertyType", f.propertyType);
    if (f.suburbId) params.set("suburbId", f.suburbId);
    if (f.minPrice) params.set("minPrice", f.minPrice);
    if (f.maxPrice) params.set("maxPrice", f.maxPrice);
    if (f.beds) params.set("beds", f.beds);
    if (f.baths) params.set("baths", f.baths);
    if (f.cars) params.set("cars", f.cars);
    if (f.q.trim()) params.set("q", f.q.trim());
    if (f.sort) params.set("sort", f.sort);
    return params.toString();
  }, []);

  // Fetch properties when filters change (debounced via q already)
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const qs = buildQuery(filters);
        const r = await fetch(`/api/properties?${qs}`, {
          signal: controller.signal,
        });
        const d = (await r.json()) as { properties: Property[]; total: number };
        if (active) setProperties(d.properties || []);
      } catch {
        if (active) toast.error("Could not load properties.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [filters, buildQuery]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.propertyType) n++;
    if (filters.suburbId) n++;
    if (filters.minPrice) n++;
    if (filters.maxPrice) n++;
    if (filters.beds) n++;
    if (filters.baths) n++;
    if (filters.cars) n++;
    return n;
  }, [filters]);

  const update = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((f) => ({ ...f, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
  }, []);

  const handleSaveSearch = useCallback(() => {
    const qs = buildQuery(filters);
    const name =
      filters.listingType === "ALL"
        ? "All properties"
        : LISTING_TYPE_LABEL[filters.listingType] || "Saved search";
    addSearch(name, qs);
    toast.success("Search saved to your favourites.");
  }, [filters, buildQuery, addSearch]);

  return (
    <div className="bg-background">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&h=900&q=80"
            alt="Melbourne harbourfront homes"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
        </div>
        <div className="container-tight relative py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-6 bg-gold" /> Property Search
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Find Your Next Home
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/80">
              Browse our curated collection of premium Melbourne residences,
              apartments and investment opportunities.
            </p>

            {/* Compact search bar */}
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by suburb, address or keyword…"
                  className="h-12 bg-background pl-10 text-foreground"
                  aria-label="Search properties"
                />
              </div>
              <Button
                size="lg"
                onClick={() =>
                  setFilters((f) => ({ ...f, q: searchInput }))
                }
                className="h-12 bg-gold text-gold-foreground hover:bg-gold/90"
              >
                <Search size={18} className="mr-2" /> Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="container-tight py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-5">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" />
                <h2 className="font-serif text-lg font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <Badge className="ml-auto bg-gold text-gold-foreground">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <Separator className="mb-4" />
              <FilterControls
                filters={filters}
                suburbs={suburbs}
                onUpdate={update}
                onReset={resetFilters}
                onSave={handleSaveSearch}
              />
            </Card>
          </aside>

          {/* Results */}
          <div>
            {/* Mobile filter bar + view toggle */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-11 lg:hidden">
                      <SlidersHorizontal size={16} className="mr-1" /> Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-gold text-gold-foreground">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full overflow-y-auto sm:max-w-md"
                  >
                    <SheetHeader>
                      <SheetTitle className="font-serif text-2xl">
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 pr-2">
                      <FilterControls
                        filters={filters}
                        suburbs={suburbs}
                        compact
                        onUpdate={update}
                        onReset={resetFilters}
                        onSave={handleSaveSearch}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    <Skeleton className="h-4 w-28" />
                  ) : (
                    <span>
                      <strong className="text-foreground">
                        {properties.length}
                      </strong>{" "}
                      {properties.length === 1 ? "property" : "properties"} found
                    </span>
                  )}
                </p>
                <div className="flex overflow-hidden rounded-md border border-border">
                  <button
                    type="button"
                    aria-label="List view"
                    onClick={() => setView("list")}
                    className={`grid h-10 w-10 place-items-center transition ${
                      view === "list"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ListIcon size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Map view"
                    onClick={() => setView("map")}
                    className={`grid h-10 w-10 place-items-center transition ${
                      view === "map"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <MapIcon size={16} />
                  </button>
                </div>
              </div>
            </div>

            {view === "map" ? (
              <MapPlaceholder
                properties={properties}
                loading={loading}
                onPinClick={(slug) => navigate(`property/${slug}`)}
              />
            ) : loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
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
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
        <Search size={22} className="text-muted-foreground" />
      </div>
      <h3 className="font-serif text-xl font-semibold">No properties match</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Try widening your price range, removing filters or searching a different
        suburb. Our collection updates daily.
      </p>
      <Button
        onClick={onReset}
        className="mt-2 h-11 bg-gold text-gold-foreground hover:bg-gold/90"
      >
        Reset filters
      </Button>
    </Card>
  );
}

function MapPlaceholder({
  properties,
  loading,
  onPinClick,
}: {
  properties: Property[];
  loading: boolean;
  onPinClick: (slug: string) => void;
}) {
  // Stylized static map — decorative gradient card with suburb pins.
  // No real map API key is used here; this is a visual placeholder.
  const pins = properties.slice(0, 12);

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-[520px] w-full bg-gradient-to-br from-emerald-50 via-cream to-emerald-100/60">
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.7 0.05 163 / 0.15) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.7 0.05 163 / 0.15) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Decorative coastline blob */}
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gold/20 blur-2xl" />

        {/* "Map" label */}
        <div className="absolute left-4 top-4 rounded-md bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
          Melbourne Metro · Map preview
        </div>

        {loading ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            <Skeleton className="h-8 w-32" />
          </div>
        ) : pins.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            No properties to display on map.
          </div>
        ) : (
          pins.map((p, i) => {
            // Deterministic pin positions across the map area
            const cols = 4;
            const rows = Math.ceil(pins.length / cols);
            const col = i % cols;
            const row = Math.floor(i / cols);
            const left = 15 + col * 22 + ((i % 3) - 1) * 4;
            const top = 22 + row * (60 / rows) + (i % 2) * 4;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPinClick(p.slug)}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
                aria-label={`View ${p.title}`}
              >
                <div className="relative flex flex-col items-center">
                  <div className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-luxe transition group-hover:scale-105 group-hover:bg-gold group-hover:text-gold-foreground">
                    <MapPin size={12} />
                    {p.priceDisplay}
                  </div>
                  <div className="h-2 w-2 -translate-y-1 rotate-45 bg-primary group-hover:bg-gold" />
                </div>
                <span className="sr-only">{p.title}</span>
              </button>
            );
          })
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-md bg-background/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-gold" />
            {pins.length} properties shown
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <TrendingUp size={12} className="text-primary" />
            Click a pin to view the listing
          </span>
        </div>
      </div>
    </Card>
  );
}
