"use client";

import dynamic from "next/dynamic";
import { Building2 } from "lucide-react";
import { useRoute, useRouter } from "@/store/router";
import { useIsClient } from "@/hooks/use-is-client";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

// Lazy-load each view to keep the initial bundle small.
const HomePage = dynamic(() => import("@/components/public/pages/home-page").then((m) => m.HomePage), { ssr: false });
const AboutPage = dynamic(() => import("@/components/public/pages/about-page").then((m) => m.AboutPage), { ssr: false });
const PropertiesPage = dynamic(() => import("@/components/public/pages/properties-page").then((m) => m.PropertiesPage), { ssr: false });
const PropertyDetailPage = dynamic(() => import("@/components/public/pages/property-detail-page").then((m) => m.PropertyDetailPage), { ssr: false });
const ServicesPage = dynamic(() => import("@/components/public/pages/services-page").then((m) => m.ServicesPage), { ssr: false });
const ServiceDetailPage = dynamic(() => import("@/components/public/pages/service-detail-page").then((m) => m.ServiceDetailPage), { ssr: false });
const SuburbsPage = dynamic(() => import("@/components/public/pages/suburbs-page").then((m) => m.SuburbsPage), { ssr: false });
const SuburbDetailPage = dynamic(() => import("@/components/public/pages/suburb-detail-page").then((m) => m.SuburbDetailPage), { ssr: false });
const AgentsPage = dynamic(() => import("@/components/public/pages/agents-page").then((m) => m.AgentsPage), { ssr: false });
const AgentDetailPage = dynamic(() => import("@/components/public/pages/agent-detail-page").then((m) => m.AgentDetailPage), { ssr: false });
const GalleryPage = dynamic(() => import("@/components/public/pages/gallery-page").then((m) => m.GalleryPage), { ssr: false });
const TestimonialsPage = dynamic(() => import("@/components/public/pages/testimonials-page").then((m) => m.TestimonialsPage), { ssr: false });
const PricingPage = dynamic(() => import("@/components/public/pages/pricing-page").then((m) => m.PricingPage), { ssr: false });
const FaqPage = dynamic(() => import("@/components/public/pages/faq-page").then((m) => m.FaqPage), { ssr: false });
const ContactPage = dynamic(() => import("@/components/public/pages/contact-page").then((m) => m.ContactPage), { ssr: false });
const BlogPage = dynamic(() => import("@/components/public/pages/blog-page").then((m) => m.BlogPage), { ssr: false });
const BlogDetailPage = dynamic(() => import("@/components/public/pages/blog-detail-page").then((m) => m.BlogDetailPage), { ssr: false });
const MortgageCalculatorPage = dynamic(() => import("@/components/public/pages/mortgage-calculator-page").then((m) => m.MortgageCalculatorPage), { ssr: false });
const NotFoundPage = dynamic(() => import("@/components/public/pages/not-found-page").then((m) => m.NotFoundPage), { ssr: false });
const FavoritesPage = dynamic(() => import("@/components/public/pages/favorites-page").then((m) => m.FavoritesPage), { ssr: false });
const AdminApp = dynamic(() => import("@/components/admin/admin-app").then((m) => m.AdminApp), { ssr: false });

function Splash() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="grid h-12 w-12 animate-pulse place-items-center rounded-lg bg-primary text-primary-foreground">
          <Building2 size={22} />
        </span>
        <p className="text-sm">Loading A1 Vision Real Estate…</p>
      </div>
    </div>
  );
}

export function AppShell() {
  const { view, segments } = useRoute();
  const mounted = useIsClient();

  // Admin runs full-viewport, no public chrome.
  if (mounted && view === "admin") {
    return <AdminApp />;
  }

  let page: React.ReactNode;
  if (!mounted) {
    page = <Splash />;
  } else {
    switch (view) {
      case "home": page = <HomePage />; break;
      case "about": page = <AboutPage />; break;
      case "properties": page = <PropertiesPage />; break;
      case "property": page = <PropertyDetailPage slug={segments[1]} />; break;
      case "services": page = <ServicesPage />; break;
      case "service": page = <ServiceDetailPage slug={segments[1]} />; break;
      case "suburbs": page = <SuburbsPage />; break;
      case "suburb": page = <SuburbDetailPage id={segments[1]} />; break;
      case "agents": page = <AgentsPage />; break;
      case "agent": page = <AgentDetailPage id={segments[1]} />; break;
      case "gallery": page = <GalleryPage />; break;
      case "testimonials": page = <TestimonialsPage />; break;
      case "pricing": page = <PricingPage />; break;
      case "faq": page = <FaqPage />; break;
      case "contact": page = <ContactPage />; break;
      case "blog": page = <BlogPage />; break;
      case "blog-detail": page = <BlogDetailPage slug={segments[1]} />; break;
      case "mortgage-calculator": page = <MortgageCalculatorPage />; break;
      case "favorites": page = <FavoritesPage />; break;
      default: page = <NotFoundPage />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{page}</main>
      <Footer />
      {/* Live chat disabled in static export (no backend to receive messages) */}
    </div>
  );
}
