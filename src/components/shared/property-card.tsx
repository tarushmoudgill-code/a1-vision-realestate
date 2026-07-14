"use client";

import Image from "next/image";
import { Bed, Bath, Car, MapPin, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "@/store/router";
import { useFavorites } from "@/store/favorites";
import { listingBadge } from "@/lib/format";
import type { Property } from "@/lib/types";

export function PropertyCard({ property }: { property: Property }) {
  const navigate = useRouter((s) => s.navigate);
  const toggle = useFavorites((s) => s.toggle);
  const has = useFavorites((s) => s.has);
  const fav = has(property.id);
  const badge = listingBadge(property.listingType);
  const img = property.images?.[0]?.url || property.images?.[0] || "/logo.svg";

  return (
    <Card
      className="group overflow-hidden p-0 transition-all duration-300 hover:shadow-luxe cursor-pointer"
      onClick={() => navigate(`property/${property.slug}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={img}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${badge.tone}`}>
            {badge.label}
          </span>
          {property.featured && (
            <span className="rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-gold backdrop-blur">
              Featured
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={fav ? "Remove from favourites" : "Save to favourites"}
          onClick={(e) => {
            e.stopPropagation();
            toggle(property.id);
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white"
        >
          <Heart
            size={16}
            className={fav ? "fill-rose-600 text-rose-600" : "text-neutral-700"}
          />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-serif text-xl font-semibold text-primary">
            {property.priceDisplay}
          </p>
          <span className="text-xs text-muted-foreground">{property.propertyType}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-1 font-medium text-foreground">
          {property.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={14} className="shrink-0 text-gold" />
          <span className="line-clamp-1">
            {property.address}
            {property.suburb ? `, ${property.suburb.name}` : ""}
          </span>
        </p>
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-sm text-foreground">
          <span className="flex items-center gap-1.5">
            <Bed size={16} className="text-gold" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={16} className="text-gold" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Car size={16} className="text-gold" /> {property.carSpaces}
          </span>
        </div>
      </div>
    </Card>
  );
}
