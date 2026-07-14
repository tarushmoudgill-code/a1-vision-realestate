"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  // Hide the rating entirely when it's 0 (no rating given).
  if (!rating || rating <= 0) return null;

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(rating)
              ? "fill-gold text-gold"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}
