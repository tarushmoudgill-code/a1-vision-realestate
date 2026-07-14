"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Star,
  Quote,
  Loader2,
  Send,
  CheckCircle2,
  Users,
  TrendingUp,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { useRouter } from "@/store/router";
import type { Testimonial } from "@/lib/types";

const FILTERS = [
  "All",
  "Sale",
  "Purchase",
  "Property Management",
  "Auction",
  "Investment",
];

const SERVICE_TYPES = [
  "Sale",
  "Purchase",
  "Property Management",
  "Auction",
  "Investment",
];

function serviceTypeMatches(t: string, filter: string): boolean {
  if (filter === "All") return true;
  const normalize = (s: string) => s.toLowerCase().replace(/[\s-]/g, "");
  const n = normalize(t);
  const f = normalize(filter);
  // Loose match: "sale" matches "residential sale", "purchase" matches "buyer/first home", etc.
  if (f === "sale") return n.includes("sale");
  if (f === "purchase") return n.includes("purchase") || n.includes("buyer");
  if (f === "propertymanagement") return n.includes("propertymanagement") || n.includes("rental") || n.includes("rent");
  if (f === "auction") return n.includes("auction");
  if (f === "investment") return n.includes("investment");
  return n.includes(f);
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = (hover || value) >= i;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="grid h-11 w-11 place-items-center rounded-md transition hover:scale-110"
          >
            <Star
              size={26}
              className={active ? "fill-gold text-gold" : "fill-muted text-muted"}
            />
          </button>
        );
      })}
    </div>
  );
}

function TestimonialCardSkeleton() {
  return (
    <Card className="p-6">
      <CardContent className="space-y-4 p-0">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialsPage() {
  const navigate = useRouter((s) => s.navigate);
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [filter, setFilter] = useState<string>("All");

  // Review form state
  const [rName, setRName] = useState("");
  const [rLocation, setRLocation] = useState("");
  const [rRating, setRRating] = useState(5);
  const [rServiceType, setRServiceType] = useState<string>("Sale");
  const [rMessage, setRMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((d: { testimonials: Testimonial[] }) => {
        if (active) setTestimonials(d.testimonials ?? []);
      })
      .catch(() => {
        if (active) setTestimonials([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!testimonials) return [];
    return testimonials.filter((t) => serviceTypeMatches(t.serviceType, filter));
  }, [testimonials, filter]);

  const avgRating = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return 0;
    const sum = testimonials.reduce((acc, t) => acc + (t.rating || 0), 0);
    return sum / testimonials.length;
  }, [testimonials]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!rName.trim() || !rMessage.trim()) {
      toast.error("Please add your name and a short message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rName,
          location: rLocation,
          rating: rRating,
          serviceType: rServiceType,
          message: rMessage,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Thanks! Your review is pending approval.");
      setRName(""); setRLocation(""); setRRating(5); setRServiceType("Sale"); setRMessage("");
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
            alt="Happy clients celebrating"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative z-10 py-16 text-center sm:py-24">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> Client Reviews
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Client Reviews
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80">
            Don&apos;t just take our word for it — hear what our clients have to
            say about working with A1 Vision Real Estate.
          </p>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-b border-border bg-cream">
        <div className="container-tight grid grid-cols-2 gap-6 py-10 sm:py-12 lg:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 font-serif text-4xl font-semibold text-primary sm:text-5xl">
              <Users size={26} className="text-gold" />
              {testimonials ? testimonials.length : "—"}
            </div>
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
              Client reviews
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 font-serif text-4xl font-semibold text-primary sm:text-5xl">
              <Heart size={26} className="fill-gold text-gold" />
              Local
            </div>
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
              Melbourne owned
            </div>
          </div>
          <div className="col-span-2 text-center lg:col-span-1">
            <div className="flex items-center justify-center gap-2 font-serif text-4xl font-semibold text-primary sm:text-5xl">
              <TrendingUp size={26} className="text-gold" />
              Free
            </div>
            <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
              Property appraisals
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="container-tight pt-12">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`min-h-[44px] rounded-full px-5 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS GRID */}
      <section className="container-tight py-12 sm:py-16">
        {!testimonials ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TestimonialCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center py-16 text-center">
            <div className="max-w-sm space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/5 text-primary">
                <Quote size={24} />
              </div>
              <h3 className="font-serif text-xl font-semibold">No reviews here yet</h3>
              <p className="text-sm text-muted-foreground">
                We don&apos;t have any reviews in this category yet — be the first!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Card key={t.id} className="flex flex-col p-6 transition-all duration-300 hover:shadow-luxe">
                <CardContent className="flex flex-1 flex-col gap-4 p-0">
                  <div className="flex items-center justify-between">
                    <StarRating rating={t.rating} size={16} />
                    <Badge variant="secondary" className="rounded-full bg-gold/10 text-gold">
                      {t.serviceType}
                    </Badge>
                  </div>
                  <Quote size={24} className="text-gold/40" />
                  <p className="flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.message}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center gap-3 border-t border-border pt-4">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/5 font-serif text-sm font-semibold text-primary">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{t.name}</div>
                      {t.location && (
                        <div className="text-xs text-muted-foreground">{t.location}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* LEAVE A REVIEW */}
      <section className="bg-cream">
        <div className="container-tight py-16 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Share Your Experience"
                title="Leave a Review"
                description="We'd love to hear about your experience with A1 Vision Real Estate. Your review helps other Melbourne families make confident decisions — and keeps us on our toes."
              />
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-gold/30 bg-background p-4">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-gold" />
                <p className="text-sm text-muted-foreground">
                  All reviews are moderated before they appear publicly. Your
                  honesty matters — share the good and the bad so we can keep
                  improving.
                </p>
              </div>
            </div>
            <Card className="shadow-luxe">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={submitReview} className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="r-name">Your name *</Label>
                    <Input id="r-name" value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="r-location">Location</Label>
                    <Input id="r-location" value={rLocation} onChange={(e) => setRLocation(e.target.value)} placeholder="Brighton, VIC" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Rating</Label>
                      <StarPicker value={rRating} onChange={setRRating} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="r-service">Service type</Label>
                      <Select value={rServiceType} onValueChange={setRServiceType}>
                        <SelectTrigger id="r-service" className="w-full">
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="r-message">Your review *</Label>
                    <Textarea
                      id="r-message"
                      rows={5}
                      value={rMessage}
                      onChange={(e) => setRMessage(e.target.value)}
                      placeholder="Tell us about your experience…"
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="bg-gold text-gold-foreground hover:bg-gold/90">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Submit review
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-tight py-16 sm:py-24">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 p-0 text-white shadow-luxe">
          <CardContent className="grid gap-6 p-8 text-center sm:p-12">
            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
              Ready to write your own success story?
            </h2>
            <p className="mx-auto max-w-xl text-white/80">
              Ready to start your property journey with A1 Vision Real Estate?
              Get in touch today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate("contact")} className="bg-gold text-gold-foreground hover:bg-gold/90">
                Get in touch
              </Button>
              <Button variant="outline" onClick={() => navigate("services")} className="border-white/30 bg-transparent text-white hover:bg-white/10">
                Explore services
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
