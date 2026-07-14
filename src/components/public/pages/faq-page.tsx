"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, ArrowRight, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";
import { FAQS } from "@/lib/constants";

export function FaqPage() {
  const navigate = useRouter((s) => s.navigate);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  // Split into two columns for desktop
  const mid = Math.ceil(filtered.length / 2);
  const leftCol = filtered.slice(0, mid);
  const rightCol = filtered.slice(mid);

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
            alt="Open notebook with questions"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative z-10 py-16 text-center sm:py-24">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> Help Centre
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80">
            Answers to the most common questions about buying, selling, renting and
            investing with A1 Vision Real Estate. Can&apos;t find what you&apos;re looking for?
            We&apos;re only a phone call away.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="container-tight pt-12">
        <div className="mx-auto max-w-xl">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="h-12 pl-11 text-base"
              aria-label="Search frequently asked questions"
            />
          </div>
        </div>
      </section>

      {/* ACCORDIONS */}
      <section className="container-tight py-12 sm:py-16">
        {filtered.length === 0 ? (
          <div className="grid place-items-center py-16 text-center">
            <div className="max-w-sm space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/5 text-primary">
                <HelpCircle size={24} />
              </div>
              <h3 className="font-serif text-xl font-semibold">No matches found</h3>
              <p className="text-sm text-muted-foreground">
                Try a different search term, or get in touch — our team is happy to help.
              </p>
              <Button onClick={() => navigate("contact")} className="bg-gold text-gold-foreground hover:bg-gold/90">
                Contact us <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <Accordion type="single" collapsible className="w-full">
              {leftCol.map((f, i) => (
                <AccordionItem key={f.q} value={`l-${i}`}>
                  <AccordionTrigger className="text-left font-serif text-base font-semibold text-foreground hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Accordion type="single" collapsible className="w-full">
              {rightCol.map((f, i) => (
                <AccordionItem key={f.q} value={`r-${i}`}>
                  <AccordionTrigger className="text-left font-serif text-base font-semibold text-foreground hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-tight pb-16 sm:pb-24">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 p-0 text-white shadow-luxe">
          <CardContent className="grid gap-6 p-8 sm:p-12 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-gold text-gold-foreground">
              <MessageCircle size={26} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                Still have questions?
              </h2>
              <p className="mt-2 max-w-xl text-white/80">
                Our friendly team is just a message away. Get in touch and we&apos;ll
                get back to you within one business day.
              </p>
            </div>
            <Button onClick={() => navigate("contact")} className="bg-gold text-gold-foreground hover:bg-gold/90">
              Contact us <ArrowRight size={16} />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
