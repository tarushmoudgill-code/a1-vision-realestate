"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Home,
  Search,
  Building2,
  ClipboardCheck,
  TrendingUp,
  Gavel,
  KeyRound,
  ArrowRight,
  HelpCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";
import { SERVICES } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  Home,
  Search,
  Building2,
  ClipboardCheck,
  TrendingUp,
  Gavel,
  KeyRound,
};

const CATEGORIES = ["All", "Selling", "Buying", "Renting", "Investing", "Valuation"];

export function ServicesPage() {
  const navigate = useRouter((s) => s.navigate);
  const [category, setCategory] = useState<string>("All");

  const services = useMemo(() => {
    return SERVICES.map((s, i) => ({ ...s, order: i }));
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return services;
    return services.filter((s) => s.category === category);
  }, [services, category]);

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80"
            alt="Melbourne property handover with keys"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative z-10 py-16 text-center sm:py-24">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> What We Do
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Our Services
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80">
            From the first appraisal to settlement day, and everything in between —
            A1 Vision Real Estate offers end-to-end premium real estate services tailored to
            buyers, sellers, renters and investors across Melbourne.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="container-tight pt-12">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`min-h-[44px] rounded-full px-5 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="container-tight py-12 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const Icon = ICONS[s.icon] ?? Home;
            return (
              <Card
                key={s.slug}
                className="group flex flex-col p-6 transition-all duration-300 hover:shadow-luxe"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={22} />
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-gold/10 text-gold">
                    {s.category}
                  </Badge>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.tagline}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`service/${s.slug}`)}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                >
                  Learn more <ArrowRight size={15} />
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* NOT SURE CTA */}
      <section className="bg-cream">
        <div className="container-tight py-16 sm:py-20">
          <Card className="border-0 bg-background shadow-luxe">
            <CardContent className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-gold/15 text-gold">
                <HelpCircle size={28} />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold">Not sure which service you need?</h3>
                <p className="mt-1 text-muted-foreground">
                  Tell us your situation and we&apos;ll point you in the right direction — no obligation.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("contact")} className="bg-gold text-gold-foreground hover:bg-gold/90">
                  Talk to us <ArrowRight size={16} />
                </Button>
                <Button variant="outline" onClick={() => navigate("faq")}>
                  Read the FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="container-tight py-16 sm:py-24">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 p-0 text-white shadow-luxe">
          <CardContent className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                Let&apos;s get started on your next move.
              </h2>
              <p className="mt-2 max-w-xl text-white/80">
                Whether you&apos;re buying, selling, renting or investing — our team
                is ready to help you make confident, informed decisions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("contact")} className="bg-gold text-gold-foreground hover:bg-gold/90">
                Contact us <ArrowRight size={16} />
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "tel:+61290000000")} className="border-white/30 bg-transparent text-white hover:bg-white/10">
                <Phone size={16} /> Call now
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
