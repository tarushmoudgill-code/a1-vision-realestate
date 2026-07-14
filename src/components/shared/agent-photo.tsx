"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AgentPhotoProps {
  src?: string | null;
  name: string;
  className?: string;
  sizes?: string;
}

// Renders an agent's photo, or an initials placeholder when the photo is blank.
export function AgentPhoto({
  src,
  name,
  className,
  sizes = "100vw",
}: AgentPhotoProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 text-primary-foreground",
          className
        )}
        aria-label={name}
      >
        <span className="font-serif text-2xl font-bold opacity-90">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}
