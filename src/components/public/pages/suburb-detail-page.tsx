"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  TrendingUp,
  Users,
  Home,
  CalendarClock,
  Building2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PropertyCard } from "@/components/shared/property-card";
import { useRouter } from "@/store/router";
import { formatPrice } from "@/lib/format";
import type { Property, Suburb } from "@/lib/types";

interface SuburbDetailResponse {
  suburb: Suburb;
  listings: Property[];
}

export function SuburbDetailPage({ id }: { id: string }) {
  const navigate = useRouter((s) => s.navigate);
  const [data, setData] = useState<SuburbDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let active = true;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const r = await fetch(`/api/suburbs/${id}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error("not found");
        const d = (await r.json()) as SuburbDetailResponse;
        if (active) setData(d);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  if (loading) return <SuburbDetailSkeleton />;
  if (notFound || !data) {
    return (
      <div className="container-tight py-24">
        <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
            <MapPin size={26} className="text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-semibold">
            Suburb not found
          </h1>
          <p className="max-w-md text-muted-foreground">
            This suburb guide may have been removed or the link is incorrect.
            Browse all Melbourne suburb guides instead.
          </p>
          <Button
            onClick={() => navigate("suburbs")}
            className="mt-2 h-11 bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Browse suburb guides
          </Button>
        </Card>
      </div>
    );
  }

  const { suburb: s, listings } = data;
  const demographics = s.demographics || {};
  const demoStats: { label: string; value: number }[] = [];
  if (typeof demographics.medianAge === "number")
    demoStats.push({ label: "Median age", value: demographics.medianAge });
  if (typeof demographics.ownerOccupier === "number")
    demoStats.push({ label: "Owner occupiers", value: demographics.ownerOccupier });
  if (typeof demographics.renter === "number")
    demoStats.push({ label: "Renters", value: demographics.renter });
  if (typeof demographics.families === "number")
    demoStats.push({ label: "Families", value: demographics.families });
  if (typeof demographics.professionals === "number")
    demoStats.push({ label: "Professionals", value: demographics.professionals });

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-cream/40">
        <div className="container-tight py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="cursor-pointer">
                  <span onClick={() => navigate("home")}>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="cursor-pointer">
                  <span onClick={() => navigate("suburbs")}>
                    Suburb Guides
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{s.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[44vh] min-h-72 w-full">
          <Image
            src={s.image}
            alt={`${s.name} suburb`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/65 to-primary/15" />
        </div>
        <div className="container-tight relative -mt-40 pb-4">
          <div className="max-w-2xl text-primary-foreground">
            {s.featured && (
              <Badge className="mb-3 bg-gold text-gold-foreground">
                <Sparkles size={12} className="mr-1" /> Featured suburb
              </Badge>
            )}
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              {s.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-primary-foreground/85">
              <MapPin size={16} className="text-gold" />
              {s.state} {s.postcode}, Australia
            </p>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/80">
              {s.lifestyle}
            </p>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <section className="container-tight py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Home size={20} />}
            label="Median price"
            value={formatPrice(s.medianPrice)}
            sub="residential"
          />
          <StatCard
            icon={<CalendarClock size={20} />}
            label="Median rent"
            value={formatPrice(s.medianRent)}
            sub="per week"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Annual growth"
            value={`+${s.growthRate}%`}
            sub="year on year"
            accent
          />
          <StatCard
            icon={<Users size={20} />}
            label="Population"
            value={s.population.toLocaleString("en-AU")}
            sub="residents"
          />
        </div>
      </section>

      {/* Description + amenities + demographics */}
      <section className="container-tight pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Description & amenities */}
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
              About {s.name}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {s.description}
            </p>

            <h3 className="mt-8 font-serif text-xl font-semibold">
              Local amenities
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-cream/60 px-3 py-1.5 text-sm text-foreground"
                >
                  <CheckCircle2 size={14} className="text-gold" />
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <Card className="h-fit p-6">
            <h3 className="font-serif text-xl font-semibold">
              Demographics
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Snapshot of the local community.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              {demoStats.map((d) => {
                const isAge = d.label.toLowerCase().includes("age");
                const display = isAge
                  ? `${d.value} yrs`
                  : `${d.value}%`;
                const barValue = isAge
                  ? Math.min(100, (d.value / 50) * 100)
                  : d.value;
                return (
                  <div key={d.label}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-semibold text-foreground">
                        {display}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
                        style={{ width: `${barValue}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {demoStats.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Demographic data is not yet available for this suburb.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Current listings */}
      <section className="bg-cream/40 py-16 sm:py-24">
        <div className="container-tight">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="h-px w-6 bg-gold" /> On the market
              </div>
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                Current listings in {s.name}
              </h2>
            </div>
            <Button
              onClick={() => navigate("properties")}
              variant="outline"
              className="h-11"
            >
              View all properties
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>

          {listings.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 border-dashed p-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-background">
                <Building2 size={22} className="text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold">
                No current listings
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                There are no active listings in {s.name} right now. Explore
                nearby suburbs or set up a saved search to be notified.
              </p>
              <Button
                onClick={() => navigate("properties")}
                className="mt-2 h-11 bg-gold text-gold-foreground hover:bg-gold/90"
              >
                Browse all properties
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container-tight py-16 sm:py-20">
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
            <div className="relative min-h-48 bg-primary">
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 sm:p-12">
              <h3 className="font-serif text-2xl font-semibold sm:text-3xl">
                Thinking of buying or selling in {s.name}?
              </h3>
              <p className="mt-3 text-muted-foreground">
                Our local agents know {s.name} inside out. Get a complimentary
                appraisal, schedule a buyer consultation or browse current
                market activity.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate("services/property-appraisal")}
                  className="h-12 bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  Get a free appraisal
                </Button>
                <Button
                  onClick={() => navigate("contact")}
                  variant="outline"
                  className="h-12"
                >
                  Contact us
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <div
          className={`grid h-10 w-10 place-items-center rounded-md ${
            accent ? "bg-gold/15 text-gold" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p
        className={`mt-3 font-serif text-2xl font-semibold ${
          accent ? "text-gold" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

function SuburbDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-[44vh] min-h-72 w-full rounded-none" />
      <div className="container-tight -mt-40 pb-10">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="mt-3 h-5 w-48" />
        <Skeleton className="mt-4 h-20 w-full max-w-xl" />
      </div>
      <div className="container-tight space-y-6 pb-16">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
