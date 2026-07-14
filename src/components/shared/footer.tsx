"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Youtube, ArrowRight } from "lucide-react";
import { useRouter } from "@/store/router";
import { BUSINESS, SOCIAL, NAV_ITEMS } from "@/lib/constants";

export function Footer() {
  const navigate = useRouter((s) => s.navigate);

  const socials = [
    { icon: Facebook, href: SOCIAL.facebook, label: "Facebook" },
    { icon: Instagram, href: SOCIAL.instagram, label: "Instagram" },
    { icon: Linkedin, href: SOCIAL.linkedin, label: "LinkedIn" },
    { icon: Youtube, href: SOCIAL.youtube, label: "YouTube" },
  ];

  const quickLinks = [
    { label: "Properties", route: "properties" },
    { label: "Services", route: "services" },
    { label: "Suburb Guides", route: "suburbs" },
    { label: "Our Agents", route: "agents" },
    { label: "Property Insights", route: "blog" },
    { label: "Pricing & Fees", route: "pricing" },
    { label: "FAQ", route: "faq" },
    { label: "Mortgage Calculator", route: "mortgage-calculator" },
  ];

  return (
    <footer className="mt-auto bg-[oklch(0.16_0.04_258)] text-white/80">
      <div className="container-tight py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="inline-block rounded-lg bg-white px-4 py-2.5 shadow-sm">
              <Image
                src="/logo.png"
                alt="A1 Vision Real Estate"
                width={200}
                height={68}
                className="h-14 w-auto shrink-0 object-contain sm:h-16"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              A modern Melbourne real estate agency. Buying, selling, renting
              and investing — with dedicated specialists and tailored service
              on every transaction.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-white/80 transition hover:bg-gold hover:text-gold-foreground"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {quickLinks.map((l) => (
                <li key={l.route}>
                  <button
                    onClick={() => navigate(l.route)}
                    className="text-left text-white/60 transition hover:text-gold"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                {BUSINESS.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-gold" />
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-gold" />
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-gold">
                  {BUSINESS.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-gold" />
                {BUSINESS.hours}
              </li>
            </ul>
          </div>

          {/* Offices */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Our Offices
            </h3>
            <ul className="space-y-4 text-sm text-white/60">
              {BUSINESS.offices.map((o) => (
                <li key={o.name}>
                  <p className="font-medium text-white/90">{o.name}</p>
                  <p className="mt-0.5 text-white/55">{o.address}</p>
                  <p className="text-white/55">{o.phone}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("contact")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition hover:gap-2.5"
            >
              Get directions <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name} · ABN {BUSINESS.abn} ·
            All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("faq")} className="hover:text-gold">
              FAQ
            </button>
            <button onClick={() => navigate("contact")} className="hover:text-gold">
              Contact
            </button>
            <button onClick={() => navigate("admin")} className="hover:text-gold">
              Staff Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
