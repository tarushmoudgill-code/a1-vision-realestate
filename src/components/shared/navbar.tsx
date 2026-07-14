"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Menu,
  Phone,
  Lock,
  Heart,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useRouter } from "@/store/router";
import { useFavorites } from "@/store/favorites";
import { NAV_ITEMS, BUSINESS } from "@/lib/constants";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/use-is-client";

export function Navbar() {
  const navigate = useRouter((s) => s.navigate);
  const path = useRouter((s) => s.path);
  const favCount = useFavorites((s) => s.ids.length);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (route: string) => {
    navigate(route);
    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 shadow-sm backdrop-blur-md"
          : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container-tight flex h-16 items-center justify-between gap-3 lg:h-20">
        {/* Logo */}
        <button
          onClick={() => go("home")}
          className="flex shrink-0 items-center rounded-md bg-white px-2.5 py-1 shadow-sm transition hover:shadow-md"
          aria-label="A1 Vision Real Estate home"
        >
          <Image
            src="/logo.png"
            alt="A1 Vision Real Estate"
            width={140}
            height={48}
            className="h-9 w-auto object-contain sm:h-10 lg:h-12"
            priority
          />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = path === item.route || (item.route !== "home" && path.startsWith(item.route));
            return (
              <button
                key={item.route}
                onClick={() => go(item.route)}
                className={`rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Favourites — visible on all sizes */}
          <button
            onClick={() => go("favorites")}
            className="relative grid h-9 w-9 place-items-center rounded-md text-foreground/70 transition hover:bg-accent hover:text-primary"
            aria-label="Saved properties"
          >
            <Heart size={18} />
            {favCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
                {favCount}
              </span>
            )}
          </button>

          {/* Theme toggle — visible on all sizes */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-md text-foreground/70 transition hover:bg-accent hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Admin login — desktop only */}
          <button
            onClick={() => go("admin")}
            className="hidden h-9 w-9 place-items-center rounded-md text-foreground/50 transition hover:bg-accent hover:text-primary md:grid"
            aria-label="Admin login"
            title="Staff login"
          >
            <Lock size={16} />
          </button>

          {/* Call us — desktop only */}
          <a
            href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:flex"
          >
            <Phone size={15} />
            Call us
          </a>

          {/* Mobile menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-border p-0 sm:w-[340px]">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <SheetTitle className="font-serif text-base text-primary">
                  Menu
                </SheetTitle>
                <SheetClose asChild>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </SheetClose>
              </div>

              {/* Mobile nav items */}
              <nav className="flex flex-col gap-0.5 px-3 py-4">
                {NAV_ITEMS.map((item) => {
                  const active = path === item.route || (item.route !== "home" && path.startsWith(item.route));
                  return (
                    <SheetClose asChild key={item.route}>
                      <button
                        onClick={() => go(item.route)}
                        className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-accent hover:text-primary"
                        }`}
                      >
                        {item.label}
                      </button>
                    </SheetClose>
                  );
                })}

                <div className="my-3 h-px bg-border" />

                <SheetClose asChild>
                  <button
                    onClick={() => go("favorites")}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <Heart size={16} /> Saved Properties
                    </span>
                    {favCount > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-xs font-bold text-gold-foreground">
                        {favCount}
                      </span>
                    )}
                  </button>
                </SheetClose>

                <SheetClose asChild>
                  <button
                    onClick={() => go("mortgage-calculator")}
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary"
                  >
                    Mortgage Calculator
                  </button>
                </SheetClose>

                <SheetClose asChild>
                  <button
                    onClick={() => go("admin")}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary"
                  >
                    <Lock size={16} /> Staff Login
                  </button>
                </SheetClose>
              </nav>

              {/* Mobile footer — call button */}
              <div className="mt-auto border-t border-border p-4">
                <a
                  href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Phone size={15} /> {BUSINESS.phone}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
