export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function listingBadge(listingType: string): { label: string; tone: string } {
  const map: Record<string, { label: string; tone: string }> = {
    SALE: { label: "For Sale", tone: "bg-primary text-primary-foreground" },
    RENT: { label: "For Rent", tone: "bg-gold text-gold-foreground" },
    SOLD: { label: "Sold", tone: "bg-emerald-700 text-white" },
    LEASED: { label: "Leased", tone: "bg-emerald-700 text-white" },
    AUCTION: { label: "Auction", tone: "bg-rose-700 text-white" },
    NEW: { label: "New", tone: "bg-emerald-600 text-white" },
    OFFMARKET: { label: "Off Market", tone: "bg-neutral-800 text-white" },
    PROJECT: { label: "New Project", tone: "bg-amber-700 text-white" },
  };
  return map[listingType] || { label: listingType, tone: "bg-neutral-700 text-white" };
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Property images may be stored as "{url,caption}[]" or "string[]".
// This safely extracts a usable URL for <img>/<Image src>.
export function imageUrl(img: unknown): string {
  if (!img) return "/logo.svg";
  if (typeof img === "string") return img;
  if (typeof img === "object" && img !== null && "url" in img) {
    return String((img as { url: string }).url);
  }
  return "/logo.svg";
}
