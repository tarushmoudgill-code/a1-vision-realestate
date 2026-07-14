"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Clock, ArrowRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { useRouter } from "@/store/router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

const HERO_IMG =
  "https://images.unsplash.com/photo-1504788363733-507549153474?auto=format&fit=crop&w=1600&q=80";

const CATEGORIES = [
  "All",
  "Market Insights",
  "Selling Tips",
  "First Home Buyers",
  "Investing",
  "Auctions",
  "Property Management",
];

// Rough word-count → reading time
function readTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

export function BlogPage() {
  const navigate = useRouter((s) => s.navigate);
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/blog")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load posts");
        const data = (await r.json()) as { posts: BlogPost[] };
        if (alive) setPosts(data.posts);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      alive = false;
    };
  }, []);

  const featured = posts?.[0] ?? null;

  const filtered = useMemo(() => {
    if (!posts) return [];
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [posts, category, query]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts?.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const recent = useMemo(() => posts?.slice(0, 4) ?? [], [posts]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMG}
            alt="A1 Vision Real Estate blog"
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
              <span className="h-px w-6 bg-gold" /> Insights
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Property Insights
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              Expert market commentary, selling tips and buyer guides from the AI
              Homes team. Make informed decisions about your next move.
            </p>
          </div>
        </div>
      </section>

      {/* Featured + Body */}
      <section className="container-tight py-16 sm:py-20">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : !posts ? (
          <BlogSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            {/* Main column */}
            <div>
              {/* Featured post */}
              {featured && (
                <Card
                  className="group mb-10 cursor-pointer overflow-hidden p-0 transition hover:shadow-luxe"
                  onClick={() => navigate(`blog-detail/${featured.slug}`)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative aspect-[4/3] md:aspect-auto">
                      <Image
                        src={featured.featuredImage}
                        alt={featured.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-md bg-gold px-2.5 py-1 text-xs font-semibold text-gold-foreground">
                        Featured
                      </span>
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-8">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">
                          {featured.category}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {readTime(featured.content)} min read
                        </span>
                      </div>
                      <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                        {featured.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {featured.excerpt}
                      </p>
                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {featured.author?.name || "A1 Vision Real Estate"}
                          </span>
                          <span>·</span>
                          <span>{formatDate(featured.publishedAt)}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                          Read more <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Search + Categories */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search articles…"
                    className="h-11 pl-9"
                    aria-label="Search articles"
                  />
                </div>
              </div>

              <Tabs
                value={category}
                onValueChange={setCategory}
                className="w-full"
              >
                <div className="overflow-x-auto pb-2">
                  <TabsList className="h-10 w-full min-w-max justify-start">
                    {CATEGORIES.map((c) => (
                      <TabsTrigger key={c} value={c} className="px-3 py-1.5 text-xs sm:text-sm">
                        {c}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>

              {/* Results count */}
              <p className="mt-6 text-sm text-muted-foreground">
                {filtered.length} article{filtered.length === 1 ? "" : "s"}
                {category !== "All" ? ` in ${category}` : ""}
              </p>

              {/* Posts grid */}
              {filtered.length === 0 ? (
                <div className="mt-8 rounded-lg border border-dashed p-12 text-center">
                  <p className="font-serif text-xl text-foreground">
                    No articles found.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different search or category.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {filtered.map((p) => (
                    <PostCard key={p.id} post={p} onOpen={() => navigate(`blog-detail/${p.slug}`)} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Categories list */}
              <Card className="p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Categories
                </h3>
                <Separator className="my-3" />
                <ul className="space-y-1">
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <li key={c}>
                      <button
                        onClick={() => setCategory(c)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                          category === c
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <span>{c}</span>
                        <span className="text-xs">{categoryCounts[c] || 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Recent posts */}
              <Card className="p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Recent Posts
                </h3>
                <Separator className="my-3" />
                <ul className="space-y-4">
                  {recent.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => navigate(`blog-detail/${p.slug}`)}
                        className="group flex w-full gap-3 text-left"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={p.featuredImage}
                            alt={p.title}
                            fill
                            sizes="56px"
                            className="object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                            {p.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(p.publishedAt)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* CTA card */}
              <Card className="overflow-hidden bg-primary p-6 text-primary-foreground">
                <TrendingUp className="text-gold" size={24} />
                <h3 className="mt-3 font-serif text-xl font-semibold">
                  Thinking of selling?
                </h3>
                <p className="mt-1 text-sm text-white/75">
                  Get a free, no-obligation appraisal from a local A1 Vision Real Estate
                  expert. Know exactly what your home is worth.
                </p>
                <Button
                  className="mt-4 h-11 w-full bg-gold text-gold-foreground hover:bg-gold/90"
                  onClick={() => navigate("contact")}
                >
                  Get an appraisal <ArrowUpRight size={15} />
                </Button>
              </Card>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}

function PostCard({ post, onOpen }: { post: BlogPost; onOpen: () => void }) {
  return (
    <Card
      className="group flex cursor-pointer flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-luxe"
      onClick={onOpen}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} /> {readTime(post.content)} min read
        </div>
        <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-foreground">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">
            {post.author?.name || "A1 Vision Real Estate"}
          </span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </Card>
  );
}

function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        <Skeleton className="mb-10 h-64 w-full rounded-xl" />
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-11 w-full max-w-xs" />
        </div>
        <Skeleton className="h-10 w-full max-w-2xl" />
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
      <aside className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </aside>
    </div>
  );
}
