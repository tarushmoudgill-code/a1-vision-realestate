"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MapPin,
  Languages,
  Award,
  TrendingUp,
  Home as HomeIcon,
  DollarSign,
  CalendarClock,
  ChevronRight,
  ArrowLeft,
  Send,
  Quote,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { AgentPhoto } from "@/components/shared/agent-photo";
import { StarRating } from "@/components/shared/star-rating";
import { PropertyCard } from "@/components/shared/property-card";
import { formatPrice } from "@/lib/format";
import type { Agent, Property, Testimonial } from "@/lib/types";

interface AgentDetailResponse {
  agent: Agent;
  active: Property[];
  sold: Property[];
  testimonials: Testimonial[];
}

export function AgentDetailPage({ id }: { id: string }) {
  const navigate = useRouter((s) => s.navigate);
  const [data, setData] = useState<AgentDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [fetchedId, setFetchedId] = useState<string | null>(null);
  // Derived loading state — true until the fetch for `id` resolves.
  const loading = fetchedId !== id;

  useEffect(() => {
    let alive = true;
    fetch(`/api/agents/${id}`)
      .then(async (r) => {
        if (!alive) return;
        if (r.status === 404) {
          setNotFound(true);
          setData(null);
          setFetchedId(id);
          return;
        }
        if (!r.ok) throw new Error("Failed to load agent");
        const d = (await r.json()) as AgentDetailResponse;
        if (!alive) return;
        setData(d);
        setNotFound(false);
        setFetchedId(id);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        toast.error(e instanceof Error ? e.message : "Failed to load agent");
        setFetchedId(id);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <AgentDetailSkeleton />;
  if (notFound || !data)
    return (
      <div className="container-tight py-24 text-center">
        <h1 className="font-serif text-3xl text-foreground">Agent not found</h1>
        <p className="mt-2 text-muted-foreground">
          The agent you&apos;re looking for may have moved or no longer be available.
        </p>
        <Button className="mt-6" onClick={() => navigate("agents")}>
          <ArrowLeft size={16} /> Back to all agents
        </Button>
      </div>
    );

  const { agent, active, sold, testimonials } = data;

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-cream/40">
        <div className="container-tight py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                >
                  <span onClick={() => navigate("home")}>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                >
                  <span onClick={() => navigate("agents")}>Agents</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground">{agent.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <section className="container-tight py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
          <div className="mx-auto w-full max-w-xs lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-luxe">
              <AgentPhoto
                src={agent.photo}
                name={agent.name}
                sizes="(max-width: 1024px) 80vw, 320px"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              {agent.specialisations?.map((s) => (
                <Badge key={s} variant="secondary" className="font-normal">
                  {s}
                </Badge>
              ))}
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              {agent.name}
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">{agent.title}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award size={16} className="text-gold" />
                Experienced professional
              </div>
            </div>

            {/* Languages */}
            {agent.languages?.length > 0 && (
              <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <Languages size={16} className="mt-0.5 text-gold" />
                <div>
                  <span className="font-semibold text-foreground/80">Languages:</span>{" "}
                  {agent.languages.join(", ")}
                </div>
              </div>
            )}

            {/* Areas */}
            {agent.suburbs?.length > 0 && (
              <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="mt-0.5 text-gold" />
                <div>
                  <span className="font-semibold text-foreground/80">Specialising in:</span>{" "}
                  {agent.suburbs.join(", ")}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12">
                <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>
                  <Phone size={16} /> {agent.phone}
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12">
                <a href={`mailto:${agent.email}`}>
                  <Mail size={16} /> {agent.email}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-y border-border bg-cream/40">
        <div className="container-tight py-10">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <StatCard
              icon={<HomeIcon size={20} />}
              value={String(agent.activeListings)}
              label="Active Listings"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              value="Local"
              label="Melbourne based"
            />
            <StatCard
              icon={<DollarSign size={20} />}
              value="Free"
              label="Appraisals"
            />
            <StatCard
              icon={<CalendarClock size={20} />}
              value="Experienced"
              label="Professional"
            />
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="container-tight py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <SectionHeading
              eyebrow="About"
              title={`Meet ${agent.name.split(" ")[0]}`}
              align="left"
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              {agent.bio.split(/\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Active Listings */}
            {active.length > 0 && (
              <div className="mt-12">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Active Listings
                  </h2>
                  <button
                    onClick={() => navigate("properties")}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {active.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Recently Sold */}
            {sold.length > 0 && (
              <div className="mt-12">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  Recently Sold
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {sold.map((p) => {
                    const first = p.images?.[0];
                    const src =
                      typeof first === "string"
                        ? first
                        : first?.url || "/logo.svg";
                    return (
                      <Card
                        key={p.id}
                        className="flex cursor-pointer gap-4 overflow-hidden p-0 transition hover:shadow-luxe"
                        onClick={() => navigate(`property/${p.slug}`)}
                      >
                        <div className="relative aspect-square w-28 shrink-0 sm:w-36">
                          <Image
                            src={src}
                            alt={p.title}
                            fill
                            sizes="144px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-center p-4">
                          <span className="inline-flex w-fit items-center rounded-md bg-emerald-700 px-2 py-0.5 text-[11px] font-semibold text-white">
                            Sold
                          </span>
                          <p className="mt-1.5 font-serif text-lg font-semibold text-primary">
                            {p.priceDisplay}
                          </p>
                          <p className="line-clamp-1 text-sm font-medium text-foreground">
                            {p.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            <MapPin size={11} className="mr-1 inline text-gold" />
                            {p.address}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div className="mt-12">
                <SectionHeading
                  eyebrow="Client Feedback"
                  title="What clients say"
                  align="left"
                />
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {testimonials.map((t) => (
                    <Card key={t.id} className="p-6">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border border-gold/30">
                          <AvatarImage src={t.avatar || undefined} alt={t.name} />
                          <AvatarFallback className="bg-primary/10 font-serif text-primary">
                            {t.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-foreground">{t.name}</p>
                            <StarRating rating={t.rating} size={13} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t.location} · {t.serviceType}
                          </p>
                        </div>
                      </div>
                      <div className="relative mt-4">
                        <Quote size={18} className="absolute -left-1 -top-1 text-gold/40" />
                        <p className="pl-6 text-sm leading-relaxed text-foreground/80">
                          {t.message}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enquiry Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <EnquiryForm agentName={agent.name} agentId={agent.id} />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="mt-3 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
        {label}
      </p>
    </div>
  );
}

function EnquiryForm({ agentName, agentId }: { agentName: string; agentId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ENQUIRY",
          name,
          email,
          phone,
          message: `[To: ${agentName}] ${message}`,
          propertyId: null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to send");
      toast.success("Thanks! Your enquiry has been sent to " + agentName + ".");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 shadow-luxe">
      <h3 className="font-serif text-xl font-semibold text-foreground">
        Enquire with {agentName.split(" ")[0]}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Interested in buying, selling or just have a question? Send a message —
        you&apos;ll hear back within one business day.
      </p>
      <Separator className="my-4" />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="enq-name">Name *</Label>
          <Input
            id="enq-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="h-11"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enq-email">Email *</Label>
          <Input
            id="enq-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enq-phone">Phone</Label>
          <Input
            id="enq-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="04XX XXX XXX"
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="enq-message">Message *</Label>
          <Textarea
            id="enq-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I'd like to know more about…"
            rows={4}
            required
          />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Send Enquiry"}
          {!submitting && <Send size={15} />}
        </Button>
        <input type="hidden" value={agentId} readOnly />
      </form>
    </Card>
  );
}

function AgentDetailSkeleton() {
  return (
    <div className="bg-background">
      <div className="container-tight py-4">
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="container-tight py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          <Skeleton className="aspect-square w-full max-w-xs rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-56" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-y border-border bg-cream/40">
        <div className="container-tight py-10">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-11 w-11 rounded-full" />
                <Skeleton className="mt-3 h-8 w-20" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container-tight py-16">
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
