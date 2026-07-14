"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Home,
  Search,
  Building2,
  ClipboardCheck,
  TrendingUp,
  Gavel,
  KeyRound,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Info,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "@/store/router";
import { SERVICES } from "@/lib/constants";

interface ServiceData {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  process: { step: string; title: string; text: string }[];
  included: string[];
  feeInfo: string;
  icon: string;
  id?: string;
  order?: number;
}

const ICONS: Record<string, LucideIcon> = {
  Home,
  Search,
  Building2,
  ClipboardCheck,
  TrendingUp,
  Gavel,
  KeyRound,
};

function AppraisalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email and a short message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "APPRAISAL", name, email, phone, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Thanks! Our team will be in touch within one business day.");
      setName(""); setEmail(""); setPhone(""); setMessage("");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Book a Free Appraisal</DialogTitle>
          <DialogDescription>
            Tell us a little about your property and we&apos;ll prepare a complimentary,
            no-obligation market appraisal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sd-name">Full name *</Label>
            <Input id="sd-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sd-email">Email *</Label>
              <Input id="sd-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sd-phone">Phone</Label>
              <Input id="sd-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04xx xxx xxx" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sd-msg">Property details *</Label>
            <Textarea id="sd-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Address, property type, beds/baths…" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={16} className="animate-spin" />} Request appraisal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DetailSkeleton() {
  return (
    <div className="bg-background">
      <section className="bg-primary py-16 text-white sm:py-24">
        <div className="container-tight space-y-4">
          <Skeleton className="h-4 w-24 bg-white/20" />
          <Skeleton className="h-12 w-2/3 bg-white/20" />
          <Skeleton className="h-5 w-full max-w-xl bg-white/20" />
        </div>
      </section>
      <section className="container-tight py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </section>
    </div>
  );
}

export function ServiceDetailPage({ slug }: { slug: string }) {
  const navigate = useRouter((s) => s.navigate);
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [appraisalOpen, setAppraisalOpen] = useState(false);
  const [prevSlug, setPrevSlug] = useState(slug);

  // Reset state when the slug prop changes (React-recommended pattern
  // instead of calling setState synchronously inside an effect).
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setLoading(true);
    setNotFound(false);
    setService(null);
  }

  useEffect(() => {
    let active = true;

    fetch(`/api/services/${slug}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        const d = (await r.json()) as { service?: ServiceData };
        if (!d.service) throw new Error("not found");
        if (active) setService(d.service);
      })
      .catch(() => {
        // Fallback to static constant
        const fallback = (SERVICES as ServiceData[]).find((s) => s.slug === slug);
        if (active) {
          if (fallback) setService(fallback);
          else setNotFound(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !service) {
    return (
      <div className="container-tight grid place-items-center py-24 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/5 text-primary">
            <Info size={26} />
          </div>
          <h1 className="font-serif text-3xl font-semibold">Service not found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find the service you&apos;re looking for. Browse all our
            services to see what A1 Vision Real Estate can do for you.
          </p>
          <Button onClick={() => navigate("services")} className="bg-gold text-gold-foreground hover:bg-gold/90">
            <ArrowLeft size={16} /> All services
          </Button>
        </div>
      </div>
    );
  }

  const Icon = ICONS[service.icon] ?? Home;
  const related = (SERVICES as ServiceData[]).filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80"
            alt={service.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative z-10 py-16 sm:py-24">
          <button
            type="button"
            onClick={() => navigate("services")}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={15} /> All services
          </button>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> {service.category}
          </div>
          <div className="flex items-start gap-5">
            <div className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground sm:grid">
              <Icon size={30} />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                {service.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
                {service.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="container-tight py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div className="space-y-16">
            {/* DESCRIPTION */}
            <div>
              <h2 className="font-serif text-2xl font-semibold">Overview</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>

            {/* PROCESS */}
            <div>
              <h2 className="font-serif text-2xl font-semibold">Our Process</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A clear, proven path from start to finish.
              </p>
              <div className="mt-8 space-y-0">
                {service.process.map((p, i) => (
                  <div key={p.step} className="relative flex gap-5 pb-8 last:pb-0">
                    {/* connector */}
                    {i < service.process.length - 1 && (
                      <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-gold/40" />
                    )}
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-gold bg-background font-serif text-sm font-semibold text-gold">
                      {p.step}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-serif text-lg font-semibold text-foreground">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* INCLUDED */}
            <div>
              <h2 className="font-serif text-2xl font-semibold">What&apos;s Included</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.included.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-border bg-background p-4">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                      <Check size={14} />
                    </span>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FEES */}
            <Card className="border-gold/30 bg-cream">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  <Info size={14} /> Fees &amp; Pricing
                </div>
                <p className="mt-4 text-base leading-relaxed text-foreground">{service.feeInfo}</p>
                <Separator className="my-5 bg-border" />
                <p className="text-sm text-muted-foreground">
                  Final fees may vary and are confirmed in a written agreement following
                  a free consultation. Get in touch for a tailored quote.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="shadow-luxe">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h3 className="font-serif text-xl font-semibold">Get started</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ready to take the next step? Our team is here to help.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <Button onClick={() => navigate("contact")} className="w-full">
                    Get started <ArrowRight size={16} />
                  </Button>
                  <Button
                    onClick={() => setAppraisalOpen(true)}
                    variant="outline"
                    className="w-full border-gold/40 text-gold hover:bg-gold/10"
                  >
                    Book a free appraisal
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary" className="bg-primary/5 text-primary">{service.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Obligation</span>
                    <span className="font-medium">No obligation</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Consultation</span>
                    <span className="font-medium">Free</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      {/* RELATED */}
      <section className="bg-cream">
        <div className="container-tight py-16 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Related services</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {related.map((r) => {
              const RIcon = ICONS[r.icon] ?? Home;
              return (
                <Card
                  key={r.slug}
                  className="group cursor-pointer p-6 transition-all duration-300 hover:shadow-luxe"
                  onClick={() => navigate(`service/${r.slug}`)}
                >
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <RIcon size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold">{r.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5">
                    Learn more <ArrowRight size={14} />
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <AppraisalDialog open={appraisalOpen} onOpenChange={setAppraisalOpen} />
    </div>
  );
}
