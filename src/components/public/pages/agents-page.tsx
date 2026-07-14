"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Phone, Mail, Award, TrendingUp, ChevronRight } from "lucide-react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { AgentPhoto } from "@/components/shared/agent-photo";
import { StarRating } from "@/components/shared/star-rating";
import type { Agent } from "@/lib/types";

const HERO_IMG =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80";

export function AgentsPage() {
  const navigate = useRouter((s) => s.navigate);
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<string>("ALL");
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    let alive = true;
    fetch("/api/agents")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load agents");
        const data = (await r.json()) as { agents: Agent[] };
        if (alive) setAgents(data.agents);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      alive = false;
    };
  }, []);

  const allSpecs = useMemo(() => {
    const set = new Set<string>();
    agents?.forEach((a) => a.specialisations?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [agents]);

  const filtered = useMemo(() => {
    if (!agents) return [];
    return agents.filter((a) => {
      const matchSpec = spec === "ALL" || a.specialisations?.includes(spec);
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.suburbs?.some((s) => s.toLowerCase().includes(q));
      return matchSpec && matchQuery;
    });
  }, [agents, spec, query]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMG}
            alt="A1 Vision Real Estate agents"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-6 bg-gold" /> Our People
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Meet Our Agents
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              Behind every successful move is a team who knows the market
              inside out. Our dedicated specialists bring local expertise,
              modern strategy and a genuine commitment to your outcome.
            </p>
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="container-tight py-16 sm:py-24">
        <SectionHeading
          eyebrow="The Team"
          title="Specialists in every corner of Melbourne"
          description="Filter by specialisation or search by name, role or suburb to find the right agent for your move."
          align="left"
        />

        {/* Filter bar */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role or suburb…"
              className="h-11 sm:max-w-xs"
              aria-label="Search agents"
            />
            <Select value={spec} onValueChange={setSpec}>
              <SelectTrigger className="h-11 w-full sm:w-64" aria-label="Filter by specialisation">
                <SelectValue placeholder="All specialisations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All specialisations</SelectItem>
                {allSpecs.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {agents ? `${filtered.length} agent${filtered.length === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>

        {/* Grid */}
        {error ? (
          <div className="mt-12 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : !agents ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden p-0">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed p-12 text-center">
            <p className="font-serif text-xl text-foreground">No agents match your search.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing the filters or browsing all specialisations.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSpec("ALL");
                setQuery("");
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AgentCard key={a.id} agent={a} onOpen={() => navigate(`agent/${a.id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AgentCard({ agent, onOpen }: { agent: Agent; onOpen: () => void }) {
  return (
    <Card
      className="group flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-luxe"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <AgentPhoto
          src={agent.photo}
          name={agent.name}
          className="transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {agent.specialisations?.slice(0, 2).map((s) => (
            <span
              key={s}
              className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">{agent.title}</p>
          </div>
          <StarRating rating={agent.rating} size={14} />
        </div>

        {agent.suburbs && agent.suburbs.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/70">Areas:</span>{" "}
            {agent.suburbs.slice(0, 3).join(", ")}
            {agent.suburbs.length > 3 ? " & more" : ""}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold" />
            <span className="font-semibold text-foreground">{agent.activeListings}</span>
            <span className="text-muted-foreground">active</span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={16} className="text-gold" />
            <span className="font-semibold text-foreground">Experienced</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {agent.specialisations?.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="font-normal">
              {s}
            </Badge>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Button onClick={onOpen} className="flex-1">
            View Profile
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            aria-label={`Call ${agent.name}`}
            asChild
          >
            <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>
              <Phone size={16} />
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            aria-label={`Email ${agent.name}`}
            asChild
          >
            <a href={`mailto:${agent.email}`}>
              <Mail size={16} />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
