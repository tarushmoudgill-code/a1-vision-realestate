"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Play, Instagram, ArrowUpRight } from "lucide-react";
import { useRouter } from "@/store/router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SectionHeading } from "@/components/shared/section-heading";
import { SOCIAL } from "@/lib/constants";

type GalleryCategory =
  | "Property Photography"
  | "Before & After Styling"
  | "Marketing Campaigns"
  | "Video Tours"
  | "Social";

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  category: GalleryCategory;
  span?: boolean; // tall/wide
}

const U = (id: string, w = 1200, h = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const GALLERY: GalleryImage[] = [
  { id: "1600210492486-724fe5c67fb0", src: U("1600210492486-724fe5c67fb0", 1200, 1500), caption: "Prestige Toorak living room", category: "Property Photography", span: true },
  { id: "1600585154340-be6161a56a0c", src: U("1600585154340-be6161a56a0c"), caption: "Designer kitchen with island bench", category: "Property Photography" },
  { id: "1600566753086-00f18fb6b3ea", src: U("1600566753086-00f18fb6b3ea"), caption: "Sun-drenched dining space", category: "Property Photography" },
  { id: "1600607687939-ce8a6c25118c", src: U("1600607687939-ce8a6c25118c", 1200, 1500), caption: "Harbourfront master bedroom", category: "Property Photography", span: true },
  { id: "1613490493576-7fde63acd811", src: U("1613490493576-7fde63acd811"), caption: "Architectural exterior, twilight shoot", category: "Property Photography" },
  { id: "1502672260266-1c1ef2d93688", src: U("1502672260266-1c1ef2d93688"), caption: "Coastal apartment, ocean panorama", category: "Property Photography" },

  { id: "1583608205776-bfd35f0d9f83", src: U("1583608205776-bfd35f0d9f83"), caption: "Styled lounge — marketing ready", category: "Marketing Campaigns" },
  { id: "1600047509807-ba8f99d2cdde", src: U("1600047509807-ba8f99d2cdde"), caption: "Drone shot of suburban estate", category: "Marketing Campaigns" },
  { id: "1600573472550-8090b5e0745e", src: U("1600573472550-8090b5e0745e"), caption: "Curb appeal at golden hour", category: "Marketing Campaigns" },
  { id: "1493809842364-78817add7ffb", src: U("1493809842364-78817add7ffb"), caption: "Open-plan family zone", category: "Marketing Campaigns" },

  { id: "1484154218962-a197022b58a8", src: U("1484154218962-a197022b58a8"), caption: "Luxe bathroom, freestanding tub", category: "Property Photography" },
  { id: "1564540583246-934409427776", src: U("1564540583246-934409427776"), caption: "Harbourside terrace", category: "Property Photography" },

  // Video tours
  { id: "1512917774080-9991f1c4c750", src: U("1512917774080-9991f1c4c750"), caption: "Brighton walk-through tour", category: "Video Tours", span: true },
  { id: "1600596542815-ffad4c1539a9", src: U("1600596542815-ffad4c1539a9"), caption: "Toorak estate cinematic tour", category: "Video Tours" },
];

// Before & After pairs (each pair uses 2 unsplash IDs)
const BEFORE_AFTER = [
  { before: "1505691938895-1758d7feb511", after: "1600566753086-00f18fb6b3ea", title: "Living room refresh" },
  { before: "1493809842364-78817add7ffb", after: "1600210492486-724fe5c67fb0", title: "Styling transformation" },
  { before: "1484154218962-a197022b58a8", after: "1600607687939-ce8a6c25118c", title: "Bedroom makeover" },
];

// Social grid
const SOCIAL_SQUARES = [
  "1564013799919-ab600027ffc6",
  "1512917774080-9991f1c4c750",
  "1600596542815-ffad4c1539a9",
  "1613490493576-7fde63acd811",
  "1505691938895-1758d7feb511",
  "1564540583246-934409427776",
  "1600210492486-724fe5c67fb0",
  "1600585154340-be6161a56a0c",
  "1600047509807-ba8f99d2cdde",
];

const VIDEO_TOUR_EMBED = "https://www.youtube.com/embed/dQw4w9WgXcQ";

const HERO_IMG = U("1600585154340-be6161a56a0c", 1920, 1080);

export function GalleryPage() {
  const navigate = useRouter((s) => s.navigate);
  const [active, setActive] = useState<GalleryCategory | "All">("All");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  const filtered = useMemo(() => {
    if (active === "All") return GALLERY;
    return GALLERY.filter((g) => g.category === active);
  }, [active]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMG}
            alt="A1 Vision Real Estate gallery"
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
              <span className="h-px w-6 bg-gold" /> Portfolio
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Gallery &amp; Our Work
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              A curated showcase of our property photography, styling
              transformations, marketing campaigns and video tours — every image
              tells the story of a home we&apos;ve helped to sell.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-tight py-16 sm:py-24">
        <Tabs
          value={active}
          onValueChange={(v) => setActive(v as GalleryCategory | "All")}
          className="w-full"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="h-11 w-full min-w-max justify-start sm:w-auto">
              <TabsTrigger value="All" className="px-4 py-2 text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="Property Photography" className="px-4 py-2 text-sm">
                Property Photography
              </TabsTrigger>
              <TabsTrigger value="Before & After Styling" className="px-4 py-2 text-sm">
                Before &amp; After Styling
              </TabsTrigger>
              <TabsTrigger value="Marketing Campaigns" className="px-4 py-2 text-sm">
                Marketing Campaigns
              </TabsTrigger>
              <TabsTrigger value="Video Tours" className="px-4 py-2 text-sm">
                Video Tours
              </TabsTrigger>
              <TabsTrigger value="Social" className="px-4 py-2 text-sm">
                Social
              </TabsTrigger>
            </TabsList>
          </div>

          {/* All / Property Photography / Marketing Campaigns */}
          <TabsContent value="All" className="mt-8">
            <MasonryGrid items={GALLERY} onOpen={setLightbox} />
            <BeforeAfterSection />
            <VideoSection onOpen={() => setVideoOpen(true)} />
          </TabsContent>
          <TabsContent value="Property Photography" className="mt-8">
            <MasonryGrid
              items={GALLERY.filter((g) => g.category === "Property Photography")}
              onOpen={setLightbox}
            />
          </TabsContent>
          <TabsContent value="Marketing Campaigns" className="mt-8">
            <MasonryGrid
              items={GALLERY.filter((g) => g.category === "Marketing Campaigns")}
              onOpen={setLightbox}
            />
          </TabsContent>
          <TabsContent value="Before & After Styling" className="mt-8">
            <BeforeAfterSection />
          </TabsContent>
          <TabsContent value="Video Tours" className="mt-8">
            <VideoSection onOpen={() => setVideoOpen(true)} />
          </TabsContent>
          <TabsContent value="Social" className="mt-8">
            <SocialSection />
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <SectionHeading
            eyebrow="List with us"
            title="Your home, beautifully presented"
            description="Every A1 Vision Real Estate campaign includes professional photography, videography and styling consultation. Let's make your property the next one in this gallery."
            align="center"
            light
          />
          <Button
            size="lg"
            className="mt-6 h-12 bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={() => navigate("contact")}
          >
            Book a free appraisal
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2 sm:p-4">
          <DialogTitle className="sr-only">
            {lightbox?.caption || "Gallery image"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {lightbox?.caption}
          </DialogDescription>
          {lightbox && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
              <Image
                src={lightbox.src}
                alt={lightbox.caption}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
          )}
          <div className="px-2 pb-2 pt-1">
            <Badge variant="secondary">{lightbox?.category}</Badge>
            <p className="mt-2 font-serif text-lg text-foreground">
              {lightbox?.caption}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-2 sm:p-4">
          <DialogTitle className="sr-only">Property video tour</DialogTitle>
          <DialogDescription className="sr-only">
            Watch the cinematic video tour of this property.
          </DialogDescription>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={VIDEO_TOUR_EMBED}
              title="Property video tour"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MasonryGrid({
  items,
  onOpen,
}: {
  items: GalleryImage[];
  onOpen: (img: GalleryImage) => void;
}) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {items.map((img) => (
        <button
          key={img.id + img.caption}
          onClick={() => onOpen(img)}
          className="group relative block w-full overflow-hidden rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-gold"
          style={{ breakInside: "avoid" }}
        >
          <div
            className={`relative w-full overflow-hidden ${
              img.span ? "aspect-[3/4]" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={img.src}
              alt={img.caption}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Badge variant="secondary" className="mb-1.5">
                {img.category}
              </Badge>
              <p className="font-serif text-base text-white">{img.caption}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function BeforeAfterSection() {
  return (
    <div className="mt-12">
      <SectionHeading
        eyebrow="Transformations"
        title="Before & After Styling"
        description="Professional styling can transform how buyers feel the moment they walk in. Here are a few of our recent transformations."
        align="left"
      />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BEFORE_AFTER.map((pair, i) => (
          <Card key={i} className="overflow-hidden p-0">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="relative aspect-square">
                <Image
                  src={U(pair.before, 600, 600)}
                  alt={`Before — ${pair.title}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover grayscale"
                />
                <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                  Before
                </span>
              </div>
              <div className="relative aspect-square">
                <Image
                  src={U(pair.after, 600, 600)}
                  alt={`After — ${pair.title}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover"
                />
                <span className="absolute left-2 top-2 rounded-md bg-gold px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-foreground">
                  After
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="font-serif text-base font-medium text-foreground">
                {pair.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Styled by the A1 Vision Real Estate interiors team
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function VideoSection({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mt-12">
      <SectionHeading
        eyebrow="Cinematic Tours"
        title="Video Tours"
        description="Cinematic walk-throughs that bring properties to life for online buyers."
        align="left"
      />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {GALLERY.filter((g) => g.category === "Video Tours").map((v) => (
          <Card key={v.id} className="group overflow-hidden p-0">
            <button
              onClick={onOpen}
              className="relative block aspect-video w-full"
              aria-label={`Play video: ${v.caption}`}
            >
              <Image
                src={v.src}
                alt={v.caption}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/45" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/95 text-gold-foreground shadow-luxe transition group-hover:scale-110">
                  <Play size={26} className="ml-1 fill-gold-foreground" />
                </span>
              </div>
              <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                Video Tour
              </span>
            </button>
            <div className="p-4">
              <p className="font-serif text-base font-medium text-foreground">
                {v.caption}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                2 min cinematic walkthrough · 4K
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SocialSection() {
  return (
    <div className="mt-4">
      <SectionHeading
        eyebrow="@a1visionrealestate"
        title="Social Media"
        description="Follow our latest listings, styling tips and market updates on Instagram."
        align="left"
      />
      <Card className="mt-8 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gold to-amber-700 text-white">
              <Instagram size={20} />
            </span>
            <div>
              <p className="font-semibold text-foreground">@a1visionrealestate</p>
              <p className="text-xs text-muted-foreground">Premium Real Estate · Melbourne</p>
            </div>
          </div>
          <Button asChild variant="outline" className="h-10">
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer">
              <Instagram size={15} /> Follow
            </a>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          {SOCIAL_SQUARES.map((id, i) => (
            <a
              key={i}
              href={SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden"
            >
              <Image
                src={U(id, 600, 600)}
                alt={`A1 Vision Real Estate Instagram post ${i + 1}`}
                fill
                sizes="(max-width: 768px) 33vw, 300px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <Instagram size={22} className="text-white" />
              </div>
            </a>
          ))}
        </div>
      </Card>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        A styled preview — tap any tile to view on Instagram.
      </p>
    </div>
  );
}
