"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Bed,
  Bath,
  Car,
  Maximize,
  MapPin,
  Heart,
  Share2,
  Phone,
  Mail,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
  Building2,
  Eye,
  PlayCircle,
  LayoutGrid,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PropertyCard } from "@/components/shared/property-card";
import { AgentPhoto } from "@/components/shared/agent-photo";
import { useRouter } from "@/store/router";
import { useFavorites } from "@/store/favorites";
import { listingBadge } from "@/lib/format";
import { toast } from "sonner";
import type { Property } from "@/lib/types";

interface PropertyDetailResponse {
  property: Property;
  similar: Property[];
}

interface PropertyImage {
  url: string;
  caption?: string;
}

function asImageUrl(img: PropertyImage | string | undefined): string {
  if (!img) return "/logo.svg";
  if (typeof img === "string") return img;
  return img.url || "/logo.svg";
}

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

export function PropertyDetailPage({ slug }: { slug: string }) {
  const navigate = useRouter((s) => s.navigate);
  const toggleFav = useFavorites((s) => s.toggle);
  const hasFav = useFavorites((s) => s.has);

  const [data, setData] = useState<PropertyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    let active = true;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const r = await fetch(`/api/properties/${slug}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error("not found");
        const d = (await r.json()) as PropertyDetailResponse;
        if (active) {
          setData(d);
          setActiveImage(0);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [slug]);

  if (loading) return <PropertyDetailSkeleton />;

  if (notFound || !data) {
    return (
      <div className="container-tight py-24">
        <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
            <Building2 size={26} className="text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-semibold">
            Property not available
          </h1>
          <p className="max-w-md text-muted-foreground">
            This listing may have been withdrawn, sold, or the link is no longer
            active. Browse our current collection instead.
          </p>
          <Button
            onClick={() => navigate("properties")}
            className="mt-2 h-11 bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Browse all properties
          </Button>
        </Card>
      </div>
    );
  }

  const p = data.property;
  const badge = listingBadge(p.listingType);
  const fav = hasFav(p.id);
  const images: PropertyImage[] = (p.images || []).map((im) =>
    typeof im === "string" ? { url: im } : (im as PropertyImage)
  );

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-cream/40">
        <div className="container-tight py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer"
                >
                  <span onClick={() => navigate("home")}>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="cursor-pointer">
                  <span onClick={() => navigate("properties")}>
                    Properties
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {p.suburb && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild className="cursor-pointer">
                      <span onClick={() => navigate(`suburb/${p.suburb!.id}`)}>
                        {p.suburb.name}
                      </span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[220px]">
                  {p.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Gallery */}
      <section className="container-tight py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px]">
          {/* Main image */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted lg:aspect-[16/9]">
            {images[activeImage] ? (
              <Image
                src={asImageUrl(images[activeImage])}
                alt={images[activeImage]?.caption || p.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <Building2 size={36} />
              </div>
            )}
            <div className="absolute left-4 top-4 flex gap-2">
              <span
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${badge.tone}`}
              >
                {badge.label}
              </span>
              {p.featured && (
                <span className="flex items-center gap-1 rounded-md bg-black/70 px-3 py-1.5 text-xs font-semibold text-gold backdrop-blur">
                  <Sparkles size={12} /> Featured
                </span>
              )}
            </div>
            <div className="absolute right-4 top-4 flex gap-2">
              <button
                type="button"
                aria-label={fav ? "Remove from favourites" : "Save to favourites"}
                onClick={() => {
                  toggleFav(p.id);
                  toast.success(fav ? "Removed from favourites" : "Saved to favourites");
                }}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white"
              >
                <Heart
                  size={18}
                  className={fav ? "fill-rose-600 text-rose-600" : "text-neutral-700"}
                />
              </button>
              <button
                type="button"
                aria-label="Share property"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => toast.success("Link copied to clipboard"));
                  }
                }}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white"
              >
                <Share2 size={18} className="text-neutral-700" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 lg:flex-col">
            {images.slice(0, 5).map((im, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-16 flex-1 overflow-hidden rounded-lg border-2 transition lg:h-20 lg:flex-none ${
                  i === activeImage
                    ? "border-gold"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={asImageUrl(im)}
                  alt={im.caption || `Image ${i + 1}`}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="container-tight pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-serif text-3xl font-semibold text-primary sm:text-4xl">
              {p.priceDisplay}
            </p>
            <h1 className="mt-2 font-serif text-2xl font-semibold leading-tight sm:text-3xl">
              {p.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={16} className="text-gold" />
              <span>
                {p.address}
                {p.suburb ? `, ${p.suburb.name} ${p.suburb.state} ${p.suburb.postcode}` : ""}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye size={14} />
            <span>{p.views} views</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon={<Bed size={18} />} label="Bedrooms" value={p.bedrooms} />
          <StatBox icon={<Bath size={18} />} label="Bathrooms" value={p.bathrooms} />
          <StatBox icon={<Car size={18} />} label="Car Spaces" value={p.carSpaces} />
          <StatBox
            icon={<Maximize size={18} />}
            label={p.landSize > 0 ? "Land Size" : "Building"}
            value={p.landSize > 0 ? `${p.landSize}m²` : `${p.buildingSize}m²`}
          />
        </div>
      </section>

      {/* Two-column body */}
      <section className="container-tight pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT: tabbed content */}
          <div className="min-w-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="h-11 w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview" className="min-h-9">
                  <LayoutGrid size={14} className="mr-1.5" /> Overview
                </TabsTrigger>
                <TabsTrigger value="features" className="min-h-9">
                  <CheckCircle2 size={14} className="mr-1.5" /> Features
                </TabsTrigger>
                <TabsTrigger value="floorplan" className="min-h-9">
                  <FileText size={14} className="mr-1.5" /> Floor Plan
                </TabsTrigger>
                <TabsTrigger value="tour" className="min-h-9">
                  <PlayCircle size={14} className="mr-1.5" /> Virtual Tour
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="p-6">
                  <h2 className="font-serif text-xl font-semibold">
                    About this property
                  </h2>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                  <Separator className="my-6" />
                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <DetailRow label="Property type" value={p.propertyType} />
                    <DetailRow label="Listing" value={badge.label} />
                    {p.suburb && (
                      <DetailRow
                        label="Suburb"
                        value={`${p.suburb.name} ${p.suburb.postcode}`}
                      />
                    )}
                    {p.landSize > 0 && (
                      <DetailRow label="Land size" value={`${p.landSize}m²`} />
                    )}
                    {p.buildingSize > 0 && (
                      <DetailRow
                        label="Building"
                        value={`${p.buildingSize}m²`}
                      />
                    )}
                    <DetailRow label="Status" value={p.status} />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card className="p-6">
                  <h2 className="font-serif text-xl font-semibold">
                    Property features
                  </h2>
                  {p.features.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No features listed.
                    </p>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                      {p.features.map((f) => (
                        <div key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-gold"
                          />
                          <span className="text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="floorplan" className="mt-6">
                <Card className="p-6">
                  <h2 className="font-serif text-xl font-semibold">
                    Floor plan
                  </h2>
                  {p.floorPlan ? (
                    <div className="relative mt-4 aspect-[3/2] overflow-hidden rounded-lg border border-border">
                      <Image
                        src={p.floorPlan}
                        alt={`${p.title} floor plan`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
                      <FileText size={28} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        A detailed floor plan is available on request from the
                        listing agent.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="tour" className="mt-6">
                <Card className="overflow-hidden p-0">
                  {p.virtualTourUrl ? (
                    <div className="relative aspect-video w-full">
                      <iframe
                        src={p.virtualTourUrl}
                        title={`${p.title} virtual tour`}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                      <PlayCircle size={32} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No virtual tour available for this property.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT: agent sidebar (sticky) */}
          <aside>
            <div className="lg:sticky lg:top-24">
              {p.agent && <AgentCard property={p} />}
              <Card className="mt-4 p-5">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setBookOpen(true)}
                    className="h-12 w-full bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    <CalendarDays size={18} className="mr-2" /> Book Inspection
                  </Button>
                  <Button
                    onClick={() => setEnquireOpen(true)}
                    variant="outline"
                    className="h-12 w-full"
                  >
                    <Mail size={18} className="mr-2" /> Enquire
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate("services/property-appraisal")}
                    className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary"
                  >
                    Request an appraisal of my home{" "}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </Card>

              {/* Quick facts */}
              <Card className="mt-4 p-5">
                <h3 className="font-serif text-base font-semibold">
                  Property summary
                </h3>
                <Separator className="my-3" />
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{p.propertyType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Listing</dt>
                    <dd className="font-medium">{badge.label}</dd>
                  </div>
                  {p.landSize > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Land</dt>
                      <dd className="font-medium">{p.landSize}m²</dd>
                    </div>
                  )}
                  {p.buildingSize > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Building</dt>
                      <dd className="font-medium">{p.buildingSize}m²</dd>
                    </div>
                  )}
                </dl>
              </Card>
            </div>
          </aside>
        </div>
      </section>

      {/* Similar properties */}
      {data.similar.length > 0 && (
        <section className="bg-cream/40 py-16 sm:py-24">
          <div className="container-tight">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <span className="h-px w-6 bg-gold" /> You may also like
                </div>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                  Similar properties
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("properties")}
                className="hidden h-11 sm:inline-flex"
              >
                View all
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.similar.map((s) => (
                <PropertyCard key={s.id} property={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dialogs */}
      <BookInspectionDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        property={p}
      />
      <EnquireDialog
        open={enquireOpen}
        onOpenChange={setEnquireOpen}
        property={p}
      />
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-serif text-lg font-semibold leading-tight">
          {value}
        </p>
      </div>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function AgentCard({ property }: { property: Property }) {
  const agent = property.agent;
  if (!agent) return null;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border">
          <AgentPhoto
            src={agent.photo}
            name={agent.name}
            sizes="64px"
          />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-lg font-semibold leading-tight">
            {agent.name}
          </p>
          <p className="text-sm text-muted-foreground">{agent.title}</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-2 text-sm">
        <a
          href={`tel:${agent.phone}`}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <Phone size={15} className="text-gold" /> {agent.phone}
        </a>
        <a
          href={`mailto:${agent.email}`}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <Mail size={15} className="text-gold" /> {agent.email}
        </a>
      </div>
      <p className="mt-4 line-clamp-3 text-xs text-muted-foreground">
        {agent.bio}
      </p>
    </Card>
  );
}

function BookInspectionDialog({
  open,
  onOpenChange,
  property,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  property: Property;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPreferredDate("");
    setPreferredTime("");
    setMessage("");
  };

  const submit = async () => {
    if (!name || !email || !preferredDate) {
      toast.error("Please complete your name, email and preferred date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          name,
          email,
          phone,
          preferredDate,
          preferredTime,
          message,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to book inspection");
      }
      toast.success("Inspection request sent. The agent will be in touch shortly.");
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Book an inspection
          </DialogTitle>
          <DialogDescription>
            Request a private viewing of {property.title}. The listing agent will
            confirm within one business day.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bk-date" className="mb-1.5 block text-sm">
                Preferred date
              </Label>
              <Input
                id="bk-date"
                type="date"
                min={today}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="bk-time" className="mb-1.5 block text-sm">
                Preferred time
              </Label>
              <Select
                value={preferredTime || "any"}
                onValueChange={(v) =>
                  setPreferredTime(v === "any" ? "" : v)
                }
              >
                <SelectTrigger id="bk-time" className="h-11 w-full">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="bk-name" className="mb-1.5 block text-sm">
              Full name
            </Label>
            <Input
              id="bk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              placeholder="Jane Smith"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="bk-email" className="mb-1.5 block text-sm">
                Email
              </Label>
              <Input
                id="bk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <Label htmlFor="bk-phone" className="mb-1.5 block text-sm">
                Phone
              </Label>
              <Input
                id="bk-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11"
                placeholder="0400 000 000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bk-msg" className="mb-1.5 block text-sm">
              Message (optional)
            </Label>
            <Textarea
              id="bk-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Anything you'd like the agent to know?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className="h-11 bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {submitting ? "Sending…" : "Request inspection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EnquireDialog({
  open,
  onOpenChange,
  property,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  property: Property;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  const submit = async () => {
    if (!name || !email || !message) {
      toast.error("Please complete name, email and message.");
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
          message,
          propertyId: property.id,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send enquiry");
      }
      toast.success("Enquiry sent. We'll be in touch soon.");
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Enquire about this property
          </DialogTitle>
          <DialogDescription>
            Send a message to the listing agent about {property.title}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <Label htmlFor="en-name" className="mb-1.5 block text-sm">
              Full name
            </Label>
            <Input
              id="en-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              placeholder="Jane Smith"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="en-email" className="mb-1.5 block text-sm">
                Email
              </Label>
              <Input
                id="en-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <Label htmlFor="en-phone" className="mb-1.5 block text-sm">
                Phone
              </Label>
              <Input
                id="en-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11"
                placeholder="0400 000 000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="en-msg" className="mb-1.5 block text-sm">
              Message
            </Label>
            <Textarea
              id="en-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="I'm interested in this property and would like more information."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? "Sending…" : "Send enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PropertyDetailSkeleton() {
  return (
    <div className="container-tight py-6">
      <Skeleton className="mb-4 h-5 w-72" />
      <Skeleton className="aspect-[16/9] w-full rounded-xl" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
