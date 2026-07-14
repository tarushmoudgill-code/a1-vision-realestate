"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  MapPin,
  ArrowRight,
  Target,
  Heart,
  Award,
  ShieldCheck,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";
import { BUSINESS, STATS } from "@/lib/constants";
import type { Agent } from "@/lib/types";

const CERTIFICATIONS = [
  "Licensed Real Estate Agent — Consumer Affairs Victoria",
  "REIV Member (Real Estate Institute of Victoria)",
  "AMP Accredited Auctioneer",
  "CGS Certified Practising Valuer",
  "Trained in Auctioneering",
  "Victorian Trust Account Accredited",
];

const SERVICE_AREAS = [
  "Brighton", "Toorak", "Brighton", "South Yarra",
  "Port Melbourne", "Fitzroy", "Southbank", "Kew",
];

const COMMUNITY = [
  {
    icon: Heart,
    title: "Surf Lifesaving Sponsorship",
    text: "Proud sponsors of Brighton and Brighton Lifesaving Clubs, supporting volunteer water safety along Melbourne's coast.",
  },
  {
    icon: Users,
    title: "Local Food Drives",
    text: "Annual winter food drive supporting Foodbank Victoria, with our team and clients donating hundreds of hampers each year.",
  },
  {
    icon: ShieldCheck,
    title: "Red Cross Housing Partnership",
    text: "Working with the Australian Red Cross to provide transitional housing support for families rebuilding after crisis.",
  },
];

function AppraisalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useRouter((s) => s.navigate);
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
        body: JSON.stringify({
          type: "APPRAISAL",
          name,
          email,
          phone,
          message,
        }),
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
            <Label htmlFor="ap-name">Full name *</Label>
            <Input id="ap-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ap-email">Email *</Label>
              <Input id="ap-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ap-phone">Phone</Label>
              <Input id="ap-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04xx xxx xxx" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ap-msg">Property details *</Label>
            <Textarea id="ap-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Address, property type, beds/baths, anything we should know…" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Request appraisal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AgentCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}

export function AboutPage() {
  const navigate = useRouter((s) => s.navigate);
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [appraisalOpen, setAppraisalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d: { agents: Agent[] }) => {
        if (active) setAgents(d.agents ?? []);
      })
      .catch(() => {
        if (active) setAgents([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"
            alt="Luxury Melbourne home at dusk"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative z-10 grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-6 bg-gold" /> About A1 Vision Real Estate
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              A modern Melbourne agency built on trust and tailored service.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
              A1 Vision Real Estate is a locally owned Melbourne agency built on
              a fresh, modern approach to property. We pair sharp local market
              intelligence with genuinely personal service — crafting tailored
              strategies for every sale, purchase and investment. No templates,
              no pressure — just dedicated specialists committed to helping you
              make confident, well-informed decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setAppraisalOpen(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
                Book a free appraisal <ArrowRight size={16} />
              </Button>
              <Button variant="outline" onClick={() => navigate("contact")} className="border-white/30 bg-transparent text-white hover:bg-white/10">
                Get in touch
              </Button>
            </div>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl shadow-luxe lg:block">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Modern Melbourne residence"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="container-tight py-16 sm:py-24">
        <Card className="border-gold/40 bg-cream shadow-luxe">
          <CardContent className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gold text-gold-foreground">
              <Target size={28} />
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Our Mission
              </div>
              <p className="font-serif text-2xl leading-relaxed text-foreground sm:text-3xl">
                &ldquo;To deliver exceptional, data-driven property outcomes with
                genuine care — treating every client like our only client, every
                transaction like our most important.&rdquo;
              </p>
              <p className="mt-4 text-muted-foreground">
                We believe exceptional service shouldn&apos;t be reserved for the
                few. Whether you&apos;re buying your first apartment or selling a
                long-held family home, you receive the same dedicated
                specialists, the same sharp market intelligence, and the same
                careful, thorough approach — every step of the way.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* STATS BAND */}
      <section className="bg-primary text-white">
        <div className="container-tight grid grid-cols-2 gap-6 py-12 sm:py-16 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-4xl font-semibold text-gold sm:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm uppercase tracking-wider text-white/70">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="container-tight py-16 sm:py-24">
        <SectionHeading
          eyebrow="Our People"
          title="Meet the agents behind every result"
          description="A close-knit team of accredited, highly experienced agents — each with deep local knowledge and a relentless commitment to their clients."
          align="center"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!agents
            ? Array.from({ length: 6 }).map((_, i) => <AgentCardSkeleton key={i} />)
            : agents.length === 0
              ? <p className="col-span-full text-center text-muted-foreground">No agents to display right now.</p>
              : agents.map((a) => (
                <Card key={a.id} className="group overflow-hidden p-0 transition-all duration-300 hover:shadow-luxe">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={a.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"}
                      alt={a.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                      {a.specialisations.slice(0, 2).map((sp) => (
                        <span key={sp} className="rounded-md bg-gold/90 px-2 py-0.5 text-[11px] font-medium text-gold-foreground">
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 p-6">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-foreground">{a.name}</h3>
                      <p className="text-sm text-gold">{a.title}</p>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{a.bio}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={14} className="text-primary" />
                      <span className="line-clamp-1">{a.suburbs.slice(0, 3).join(", ")}</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate(`agent/${a.id}`)}>
                      View profile <ArrowRight size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="bg-cream">
        <div className="container-tight grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Credentials"
              title="Qualified, accredited & accountable"
              description="Every agent on our team holds the certifications required to represent you with confidence — and we hold ourselves to standards above and beyond the industry baseline."
            />
          </div>
          <Card className="bg-background">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
              {CERTIFICATIONS.map((c) => (
                <div key={c} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-gold" />
                  <span className="text-sm text-foreground">{c}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section className="container-tight py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-luxe">
            <Image
              src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80"
              alt="Melbourne harbour skyline"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="Where We Work"
              title="Deep local knowledge across Melbourne"
              description="From the inner-east to the western growth corridors, our team knows Melbourne property intimately — the streets, the schools, the buyer demand and the right strategy for each pocket of the city."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {SERVICE_AREAS.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full bg-primary/5 text-primary">
                  <MapPin size={12} className="mr-1" /> {s}
                </Badge>
              ))}
              <Badge variant="outline" className="rounded-full border-gold/40 text-gold">
                + across Melbourne metro
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="bg-primary text-white">
        <div className="container-tight py-16 sm:py-24">
          <SectionHeading
            eyebrow="Giving Back"
            title="Proudly part of our community"
            description="Melbourne has given us a lot. These are a few of the ways we try to give back."
            align="center"
            light
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {COMMUNITY.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="bg-white/5 text-white border-white/10">
                  <CardContent className="space-y-4 p-6">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-gold text-gold-foreground">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-serif text-xl font-semibold">{c.title}</h3>
                    <p className="text-sm text-white/70">{c.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="container-tight py-16 sm:py-24">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 p-0 text-white shadow-luxe">
          <CardContent className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground sm:grid">
                <Sparkles size={26} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                  Ready to move? Book a free appraisal.
                </h2>
                <p className="mt-2 max-w-xl text-white/80">
                  Find out what your home is worth today. Our accredited agents will
                  prepare a complimentary, no-obligation comparative market analysis —
                  typically within 48 hours.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setAppraisalOpen(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Award size={16} /> Book free appraisal
              </Button>
              <Button variant="outline" onClick={() => navigate("contact")} className="border-white/30 bg-transparent text-white hover:bg-white/10">
                Contact us
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <AppraisalDialog open={appraisalOpen} onOpenChange={setAppraisalOpen} />
    </div>
  );
}
