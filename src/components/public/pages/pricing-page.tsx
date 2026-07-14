"use client";

import Image from "next/image";
import { Check, ArrowRight, Info, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";

interface PricingTier {
  name: string;
  fee: string;
  feeNote: string;
  included: string[];
  featured?: boolean;
  badge?: string;
}

const TIERS: PricingTier[] = [
  {
    name: "Residential Sales",
    fee: "1.8% – 2.5%",
    feeNote: "+ GST · Marketing from $2,500",
    included: [
      "Commission only payable on sale",
      "Full marketing campaign",
      "Professional photography & drone video",
      "Inspection management",
      "Offer negotiation",
      "Settlement coordination",
    ],
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Buyer Advocacy",
    fee: "from $4,950",
    feeNote: "or 1.0% – 1.5% above $1M",
    included: [
      "Dedicated buyer advocate",
      "Off-market property sourcing",
      "Due diligence & inspections",
      "Auction bidding representation",
      "Price & terms negotiation",
      "Settlement coordination",
    ],
  },
  {
    name: "Property Management",
    fee: "7% – 9%",
    feeNote: "+ GST of collected rent · Letting fee 1 week",
    included: [
      "Tenant sourcing & screening",
      "Lease preparation & renewals",
      "Rent collection & arrears",
      "24/7 maintenance coordination",
      "Routine & exit inspections",
      "Monthly financial reporting",
    ],
  },
  {
    name: "Property Appraisal",
    fee: "Free",
    feeNote: "No cost · No obligation",
    included: [
      "Comparative market analysis",
      "Recommended price range",
      "Days-on-market estimate",
      "Value-maximising suggestions",
      "Campaign timing advice",
      "Strategy consultation",
    ],
  },
  {
    name: "Investment Advisory",
    fee: "from $1,950",
    feeNote: "Initial strategy session free",
    included: [
      "Rental yield analysis",
      "Capital growth projections",
      "Portfolio strategy & structuring",
      "Suburb & asset recommendations",
      "Cash-flow modelling",
      "Ongoing portfolio reviews",
    ],
  },
  {
    name: "Auction Services",
    fee: "from $1,200",
    feeNote: "Auctioneer · Marketing from $4,000",
    included: [
      "Auction campaign management",
      "Professional auctioneer",
      "Bidder registration & qualification",
      "Reserve price strategy",
      "Auction-day coordination",
      "Post-auction negotiation",
    ],
  },
  {
    name: "First Home Buyer",
    fee: "Free",
    feeNote: "For eligible first-home buyers",
    included: [
      "Government grants guidance",
      "Pre-approval assistance",
      "Suburb recommendations",
      "Deposit & borrowing education",
      "Buyer advocacy on first purchase",
      "Settlement & handover support",
    ],
    badge: "Eligibility applies",
  },
];

export function PricingPage() {
  const navigate = useRouter((s) => s.navigate);

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80"
            alt="Real estate contract and calculator"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative z-10 py-16 text-center sm:py-24">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> Pricing &amp; Fees
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Transparent Pricing &amp; Fees
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80">
            We believe in straightforward, upfront pricing. No hidden surprises, no
            fine print — just clear fee structures so you know exactly what you&apos;re
            paying for.
          </p>
        </div>
      </section>

      {/* NOTE BANNER */}
      <section className="container-tight pt-12">
        <Card className="border-gold/30 bg-cream">
          <CardContent className="flex items-start gap-3 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-gold" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Final fees may vary</span> and require a
              consultation. All fees are confirmed in writing before any work begins,
              so you&apos;re never caught off guard.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* PRICING CARDS */}
      <section className="container-tight py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => (
            <Card
              key={t.name}
              className={`relative flex flex-col p-6 transition-all duration-300 hover:shadow-luxe ${
                t.featured ? "border-gold shadow-luxe ring-1 ring-gold/30" : ""
              }`}
            >
              {t.badge && (
                <div className="absolute -top-3 left-6">
                  <Badge className="rounded-full bg-gold text-gold-foreground">{t.badge}</Badge>
                </div>
              )}
              <h3 className="font-serif text-xl font-semibold text-foreground">{t.name}</h3>
              <div className="mt-4">
                <div className="font-serif text-4xl font-semibold text-primary">{t.fee}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t.feeNote}</p>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {t.included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate("contact")}
                className={`mt-6 w-full ${t.featured ? "bg-gold text-gold-foreground hover:bg-gold/90" : ""}`}
              >
                Request a quote <ArrowRight size={16} />
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* WHAT'S INCLUDED / TRUST */}
      <section className="bg-cream">
        <div className="container-tight py-16 sm:py-20">
          <SectionHeading
            eyebrow="Why A1 Vision Real Estate"
            title="Premium service, fair pricing"
            description="Our fees reflect the experience, marketing and negotiation expertise we bring to every transaction. Here's what sets our pricing apart."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card className="bg-background">
              <CardContent className="space-y-3 p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-serif text-lg font-semibold">No hidden costs</h3>
                <p className="text-sm text-muted-foreground">
                  Every fee is itemised in writing before you commit. Marketing,
                  commission, letting fees — all on the table from day one.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardContent className="space-y-3 p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-serif text-lg font-semibold">Performance-based</h3>
                <p className="text-sm text-muted-foreground">
                  Sales commission is only payable on a successful sale. We win when
                  you win — our incentives are aligned with yours.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardContent className="space-y-3 p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
                  <Check size={22} />
                </div>
                <h3 className="font-serif text-lg font-semibold">Free consultations</h3>
                <p className="text-sm text-muted-foreground">
                  Every service starts with a complimentary consultation and, where
                  applicable, a free appraisal. No cost, no obligation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ SNIPPET + CTA */}
      <section className="container-tight py-16 sm:py-24">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 p-0 text-white shadow-luxe">
          <CardContent className="grid gap-6 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                Still have questions about fees?
              </h2>
              <p className="mt-2 max-w-xl text-white/80">
                Our FAQ covers common questions about pricing, or get in touch for a
                tailored quote specific to your property and situation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("faq")} variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                Read the FAQ <ArrowRight size={16} />
              </Button>
              <Button onClick={() => navigate("contact")} className="bg-gold text-gold-foreground hover:bg-gold/90">
                Request a tailored quote <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
