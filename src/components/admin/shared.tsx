"use client";

import { type ReactNode } from "react";
import { Loader2, Inbox, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// === Loading State ===
export function AdminLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-md" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-md" />
      ))}
    </div>
  );
}

// === Error State ===
export function AdminError({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle size={24} />
      </span>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// === Empty State ===
export function AdminEmpty({
  title = "Nothing here yet",
  description = "Items will appear here once they're created.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Inbox size={24} />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

// === Status Badge (color-coded) ===
const STATUS_COLORS: Record<string, string> = {
  // Generic
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  READ: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CONTACTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  QUALIFIED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  // Warning
  NO_SHOW: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  WITHDRAWN: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  // Success
  WON: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  SOLD: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  LEASED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  // Neutral
  REPLIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  UNDER_OFFER: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  ACTIVE_LEAD: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || "bg-muted text-muted-foreground";
  return (
    <Badge
      className={cn(
        "border-0 text-xs font-medium capitalize",
        colorClass
      )}
    >
      {status?.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}

// === Inline Loader (for buttons) ===
export function ButtonLoader({ label }: { label: string }) {
  return (
    <>
      <Loader2 className="size-4 animate-spin" />
      {label}
    </>
  );
}

// === Page Header ===
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
