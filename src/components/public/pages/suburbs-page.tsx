"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  TrendingUp,
  Users,
  Search,
  ArrowRight,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";
import { formatPrice } from "@/lib/format";
import type { Suburb } from "@/lib/types";

export function SuburbsPage() {
  const navigate = useRouter((s) => s.navigate);
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/suburbs")
      .then((r) => r.json())
      .then((d: { suburbs: Suburb[] }) => {
        if (active) setSuburbs(d.suburbs || []);
      })
      .catch(() => {
        /* noop */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suburbs;
    return suburbs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.postcode.includes(q) ||
        s.state.toLowerCase().includes(q)
    );
  }, [suburbs, query]);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1920&h=900&q=80"
            alt="Melbourne suburbs aerial"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
        </div>
        <div className="container-tight relative py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-6 bg-gold" /> Suburb Guides
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Melbourne Suburb Guides
            </h1>
            <p className="mt-4 max-w-2xl text-base text-primary-foreground/80">
              Discover Melbourne's most sought-after neighbourhoods. Explore median
              prices, growth trends, lifestyle and amenities to find the right
              address for your next move.
            </p>
            <div className="mt-8 max-w-md">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search suburbs or postcodes…"
                  className="h-12 bg-background pl-10 text-foreground"
                  aria-label="Search suburbs"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Suburb grid */}
      <section className="container-tight py-16 sm:py-24">
        <SectionHeading
          eyebrow="Explore"
          title="Find your perfect neighbourhood"
          description="Each guide blends market data, lifestyle insights and current listings to help you decide."
        />

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SuburbCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 border-dashed p-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
                <MapPin size={22} className="text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold">
                No suburbs match
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try a different suburb name or postcode.
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
              {filtered.map((s) => (
                <SuburbCard
                  key={s.id}
                  suburb={s}
                  onClick={() => navigate(`suburb/${s.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream/40 py-16 sm:py-20">
        <div className="container-tight">
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 sm:p-12">
                <h3 className="font-serif text-2xl font-semibold sm:text-3xl">
                  Not sure where to start?
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Our buyer advocates specialise in matching clients to the
                  right suburb based on budget, lifestyle and growth potential.
                  Book a complimentary consultation today.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate("services/buyer-advocacy")}
                    className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Buyer Advocacy
                  </Button>
                  <Button
                    onClick={() => navigate("contact")}
                    variant="outline"
                    className="h-12 border-gold text-gold hover:bg-gold hover:text-gold-foreground"
                  >
                    Talk to an agent
                  </Button>
                </div>
              </div>
              <div className="relative min-h-48 bg-primary">
                <Image
                  src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&h=600&q=80"
                  alt="Melbourne neighbourhood"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function SuburbCard({
  suburb,
  onClick,
}: {
  suburb: Suburb;
  onClick: () => void;
}) {
  return (
    <Card
      className="group overflow-hidden p-0 transition-all duration-300 hover:shadow-luxe cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={suburb.image}
          alt={`${suburb.name} suburb`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {suburb.featured && (
          <Badge className="absolute left-3 top-3 bg-gold text-gold-foreground">
            Featured
          </Badge>
        )}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <h3 className="font-serif text-2xl font-semibold leading-tight">
              {suburb.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-white/85">
              <MapPin size={14} className="text-gold" />
              {suburb.state} {suburb.postcode}
            </p>
          </div>
          <ArrowRight
            size={20}
            className="opacity-0 transition group-hover:opacity-100"
          />
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat
            label="Median"
            value={formatPrice(suburb.medianPrice)}
            icon={<Building2 size={14} />}
          />
          <Stat
            label="Growth"
            value={`+${suburb.growthRate}%`}
            icon={<TrendingUp size={14} />}
            accent
          />
          <Stat
            label="Population"
            value={suburb.population.toLocaleString("en-AU")}
            icon={<Users size={14} />}
          />
        </div>
        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
          {suburb.lifestyle}
        </p>
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p
        className={`mt-0.5 text-sm font-semibold ${
          accent ? "text-gold" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SuburbCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-1/2" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  );
}
