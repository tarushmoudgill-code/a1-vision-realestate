"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Award,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  Quote,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Home as HomeIcon,
  Building2,
  KeyRound,
  Search as SearchIcon,
  Gavel,
  ClipboardCheck,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter } from "@/store/router";
import { useFavorites } from "@/store/favorites";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { SERVICES, STATS, SOCIAL } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Property, Testimonial, Suburb } from "@/lib/types";

const SERVICE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home: HomeIcon,
  Search: SearchIcon,
  Building2,
  ClipboardCheck,
  TrendingUp,
  Gavel,
  KeyRound,
};

export function HomePage() {
  const navigate = useRouter((s) => s.navigate);
  const [featured, setFeatured] = useState<Property[]>([]);
  const [recent, setRecent] = useState<Property[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [f, r, t, s] = await Promise.all([
          fetch("/api/properties?featured=true&limit=8").then((x) => x.json()),
          fetch("/api/properties?limit=6&sort=newest").then((x) => x.json()),
          fetch("/api/testimonials").then((x) => x.json()),
          fetch("/api/suburbs").then((x) => x.json()),
        ]);
        if (!active) return;
        setFeatured(f.properties || []);
        setRecent(r.properties || []);
        setTestimonials(t.testimonials || []);
        setSuburbs(s.suburbs || []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const trustBadges = [
    { icon: ShieldCheck, title: "Licensed & Insured", text: "Fully licensed Victorian agents" },
    { icon: Users, title: "Local Specialists", text: "Deep Melbourne market knowledge" },
    { icon: TrendingUp, title: "Tailored Strategy", text: "Data-driven, bespoke campaigns" },
    { icon: Award, title: "Personal Service", text: "Dedicated care on every transaction" },
  ];

  const socials = [
    { icon: Facebook, href: SOCIAL.facebook, label: "Facebook" },
    { icon: Instagram, href: SOCIAL.instagram, label: "Instagram" },
    { icon: Linkedin, href: SOCIAL.linkedin, label: "LinkedIn" },
    { icon: Youtube, href: SOCIAL.youtube, label: "YouTube" },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury Melbourne home"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="container-tight relative z-10 py-20">
          <div className="max-w-2xl">
            <Badge className="mb-5 border-gold/40 bg-white/10 text-gold backdrop-blur">
              <Sparkles size={13} className="mr-1" /> Melbourne's Modern Real Estate Agency
            </Badge>
            <h1 className="font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Find a place you'll love to call home
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Buy, sell, rent and invest with a dedicated Melbourne team that
              brings sharp local knowledge, tailored strategy and genuine care
              to every transaction.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`properties${q ? `?q=${encodeURIComponent(q)}` : ""}`)}
                  placeholder="Search by suburb, address or keyword…"
                  className="h-14 border-0 bg-white pl-12 pr-4 text-foreground shadow-luxe"
                />
              </div>
              <Button
                size="lg"
                onClick={() => navigate("properties")}
                className="h-14 bg-gold px-8 text-base font-semibold text-gold-foreground hover:bg-gold/90"
              >
                Browse Properties
              </Button>
            </div>

            {/* quick links */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { label: "For Sale", route: "properties?listingType=SALE" },
                { label: "For Rent", route: "properties?listingType=RENT" },
                { label: "New Projects", route: "properties?listingType=PROJECT" },
                { label: "Free Appraisal", route: "contact" },
              ].map((l) => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.route)}
                  className="rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:border-gold hover:bg-white/10 hover:text-gold"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/40 backdrop-blur">
          <div className="container-tight grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-2xl font-bold text-gold sm:text-3xl">
                  {s.value}
                </p>
                <p className="text-xs text-white/70 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-b border-border bg-cream">
        <div className="container-tight grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <b.icon size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="py-16 sm:py-24">
        <div className="container-tight">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Handpicked for you"
              title="Featured Properties"
              description="A handpicked selection of our current Melbourne listings."
            />
            <Button
              variant="outline"
              onClick={() => navigate("properties")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              View all properties <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : featured.length > 0 ? (
              <Carousel
                opts={{ align: "start", loop: featured.length > 3 }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {featured.map((p) => (
                    <CarouselItem
                      key={p.id}
                      className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
                    >
                      <PropertyCard property={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <p className="text-muted-foreground">No featured properties yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="bg-cream py-16 sm:py-24">
        <div className="container-tight">
          <SectionHeading
            align="center"
            eyebrow="What we do"
            title="Comprehensive Real Estate Services"
            description="From appraisal to settlement, our specialists cover every stage of your property journey."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => {
              const Icon = SERVICE_ICONS[s.icon] || HomeIcon;
              return (
                <Card
                  key={s.slug}
                  className="group cursor-pointer p-6 transition-all hover:-translate-y-1 hover:shadow-luxe"
                  onClick={() => navigate(`service/${s.slug}`)}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground transition group-hover:bg-gold group-hover:text-gold-foreground">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.tagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-gold">
                    Learn more <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUBURB MAP / GUIDES */}
      <section className="py-16 sm:py-24">
        <div className="container-tight">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Explore Melbourne"
                title="Suburb Guides"
                description="Discover median prices, growth rates, amenities and lifestyle insights for Melbourne's top suburbs."
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {suburbs.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`suburb/${s.id}`)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition hover:border-gold hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gold" />
                      <div>
                        <p className="font-semibold text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Median {formatPrice(s.medianPrice)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("suburbs")}
                className="mt-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Browse all suburb guides <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>

            {/* Stylised interactive map */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[oklch(0.93_0.012_255)] shadow-luxe sm:aspect-[4/3]">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(oklch(0.45 0.06 258 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.45 0.06 258 / 0.15) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute inset-0">
                {/* faux water */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[oklch(0.7_0.04_200)] opacity-50" />
                <div className="absolute right-0 top-1/4 h-1/4 w-1/3 rounded-full bg-[oklch(0.7_0.04_200)] opacity-50" />
              </div>
              {suburbs.slice(0, 6).map((s, i) => {
                const positions = [
                  { top: "18%", left: "62%" },
                  { top: "40%", left: "48%" },
                  { top: "22%", left: "30%" },
                  { top: "55%", left: "70%" },
                  { top: "48%", left: "24%" },
                  { top: "66%", left: "40%" },
                ];
                const pos = positions[i] || positions[0];
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`suburb/${s.id}`)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={pos}
                  >
                    <span className="relative flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-gold ring-2 ring-white" />
                    </span>
                    <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground opacity-0 transition group-hover:opacity-100">
                      {s.name}
                    </span>
                  </button>
                );
              })}
              <div className="absolute bottom-3 left-3 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur">
                Melbourne Metro · {suburbs.length} suburbs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT LISTINGS */}
      <section className="bg-[oklch(0.16_0.04_258)] py-16 text-white sm:py-24">
        <div className="container-tight">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="h-px w-6 bg-gold" /> Just Listed
              </div>
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
                New to the market
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("properties")}
              className="border-white/30 text-white hover:bg-white hover:text-primary"
            >
              See all <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-white/10" />
                ))
              : recent.slice(0, 3).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
          </div>
        </div>
      </section>

      {/* SCROLLING TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="overflow-hidden py-16 sm:py-24">
          <div className="container-tight">
            <SectionHeading
              align="center"
              eyebrow="Client stories"
              title="What our clients say"
              description="Reviews from people we've helped with their property journey."
            />
          </div>
          <div className="relative mt-12">
            <div className="flex gap-6 overflow-x-auto px-4 pb-4 no-scrollbar sm:px-8">
              {testimonials.map((t) => (
                <Card
                  key={t.id}
                  className="w-[320px] shrink-0 p-6 sm:w-[380px]"
                >
                  <Quote size={28} className="text-gold" />
                  <StarRating rating={t.rating} className="mt-3" />
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                    "{t.message}"
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.location} · {t.serviceType}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="container-tight mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("testimonials")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Read more reviews <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </section>
      )}

      {/* CTA BAND */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-tight">
          <Card className="overflow-hidden border-0 bg-primary p-0">
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
                  Ready to find out what your home is worth?
                </h2>
                <p className="mt-4 text-white/80">
                  Receive a complimentary, no-obligation property appraisal from
                  our dedicated specialists. We'll prepare a comparative market
                  analysis and a tailored strategy for your property.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate("contact")}
                    className="bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    Book a free appraisal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("mortgage-calculator")}
                    className="border-white/40 text-white hover:bg-white hover:text-primary"
                  >
                    Mortgage calculator
                  </Button>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src="https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=900&q=80"
                  alt="Beautiful living room"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="border-t border-border py-14">
        <div className="container-tight flex flex-col items-center gap-6 text-center">
          <SectionHeading
            align="center"
            eyebrow="Stay connected"
            title="Follow A1 Vision Real Estate"
            description="Market insights, new listings and behind-the-scenes — join our community."
          />
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground transition hover:bg-gold hover:text-gold-foreground"
              >
                <s.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
