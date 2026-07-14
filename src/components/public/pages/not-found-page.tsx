"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import {
  Search,
  Home as HomeIcon,
  Building,
  Wrench,
  MapPin,
  Mail,
  Newspaper,
  ArrowRight,
  Compass,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const HERO_IMG =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

interface QuickLink {
  label: string;
  description: string;
  route: string;
  icon: React.ReactNode;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Home",
    description: "Back to the start",
    route: "home",
    icon: <HomeIcon size={20} />,
  },
  {
    label: "Properties",
    description: "Browse all listings",
    route: "properties",
    icon: <Building size={20} />,
  },
  {
    label: "Services",
    description: "How we can help",
    route: "services",
    icon: <Wrench size={20} />,
  },
  {
    label: "Suburb Guides",
    description: "Explore Melbourne areas",
    route: "suburbs",
    icon: <MapPin size={20} />,
  },
  {
    label: "Contact",
    description: "Get in touch with us",
    route: "contact",
    icon: <Mail size={20} />,
  },
  {
    label: "Blog",
    description: "Property insights",
    route: "blog",
    icon: <Newspaper size={20} />,
  },
];

export function NotFoundPage() {
  const navigate = useRouter((s) => s.navigate);
  const [query, setQuery] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate("properties");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 bg-cream/40" />
      <div className="container-tight py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Illustrative house image */}
          <div className="relative mx-auto mb-8 aspect-[3/2] w-full max-w-md overflow-hidden rounded-2xl shadow-luxe">
            <Image
              src={HERO_IMG}
              alt="A premium Melbourne home"
              fill
              priority
              sizes="(max-width: 768px) 80vw, 400px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Compass size={12} /> Page not found
          </div>
          <h1 className="font-serif text-7xl font-bold text-gold sm:text-9xl">404</h1>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            This page has moved or no longer exists.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            The page you were looking for may have been renamed, sold or never
            existed. Try a search, or jump to one of our popular pages below.
          </p>

          {/* Search bar */}
          <form
            onSubmit={onSearch}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search properties, suburbs or services…"
                className="h-12 pl-9"
                aria-label="Search the site"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              Search <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        {/* Quick links grid */}
        <div className="mx-auto mt-16 max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Popular pages
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Card
                key={link.route}
                className="group flex cursor-pointer items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-luxe"
                onClick={() => navigate(link.route)}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gold group-hover:text-gold-foreground">
                  {link.icon}
                </span>
                <div className="flex-1">
                  <p className="font-serif text-base font-semibold text-foreground">
                    {link.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
                />
              </Card>
            ))}
          </div>
        </div>

        {/* Help line */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-background p-6 text-center sm:p-8">
          <p className="font-serif text-lg text-foreground">
            Still can&apos;t find what you&apos;re looking for?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Our team is here to help — call us on{" "}
            <a
              href="tel:+61290000000"
              className="font-medium text-primary hover:underline"
            >
              +61 2 9000 0000
            </a>{" "}
            or send us a message.
          </p>
          <Button className="mt-4 h-11" onClick={() => navigate("contact")}>
            Contact us <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
