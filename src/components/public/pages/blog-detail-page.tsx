"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Facebook,
  Linkedin,
  Link2,
  Twitter,
  ArrowUpRight,
  Quote,
} from "lucide-react";
import { useRouter } from "@/store/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

interface BlogDetailResponse {
  post: BlogPost;
  related: BlogPost[];
}

function readTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const navigate = useRouter((s) => s.navigate);
  const [data, setData] = useState<BlogDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [fetchedSlug, setFetchedSlug] = useState<string | null>(null);
  // Derived loading state — true until the fetch for `slug` resolves.
  const loading = fetchedSlug !== slug;

  useEffect(() => {
    let alive = true;
    fetch(`/api/blog/${slug}`)
      .then(async (r) => {
        if (!alive) return;
        if (r.status === 404) {
          setNotFound(true);
          setData(null);
          setFetchedSlug(slug);
          return;
        }
        if (!r.ok) throw new Error("Failed to load article");
        const d = (await r.json()) as BlogDetailResponse;
        if (!alive) return;
        setData(d);
        setNotFound(false);
        setFetchedSlug(slug);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        toast.error(e instanceof Error ? e.message : "Failed to load article");
        setFetchedSlug(slug);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) return <BlogDetailSkeleton />;
  if (notFound || !data)
    return (
      <div className="container-tight py-24 text-center">
        <h1 className="font-serif text-3xl text-foreground">Article not found</h1>
        <p className="mt-2 text-muted-foreground">
          This article may have been removed or the link is incorrect.
        </p>
        <Button className="mt-6" onClick={() => navigate("blog")}>
          <ArrowLeft size={16} /> Back to blog
        </Button>
      </div>
    );

  const { post, related } = data;
  const mins = readTime(post.content);
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `https://a1vision.com.au/blog/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);
  const shareLink = encodeURIComponent(shareUrl);

  const copyLink = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      }
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-cream/40">
        <div className="container-tight py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                >
                  <span onClick={() => navigate("home")}>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                >
                  <span onClick={() => navigate("blog")}>Blog</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[260px] text-foreground">
                  {post.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Article header */}
      <article className="container-tight py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate("blog")}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft size={15} /> All articles
          </button>

          <Badge variant="secondary" className="font-normal">
            {post.category}
          </Badge>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border border-gold/30">
                <AvatarImage src={undefined} alt={post.author?.name || "A1 Vision Real Estate"} />
                <AvatarFallback className="bg-primary/10 font-serif text-xs text-primary">
                  {(post.author?.name || "AI").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {post.author?.name || "A1 Vision Real Estate Editorial"}
                </p>
                <p className="text-xs text-muted-foreground">Real Estate Writer</p>
              </div>
            </div>
            <Separator orientation="vertical" className="hidden h-8 sm:block" />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar size={14} className="text-gold" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock size={14} className="text-gold" />
              {mins} min read
            </div>
          </div>

          {/* Share row */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Share
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Share on Facebook"
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-foreground/70 transition hover:bg-primary hover:text-primary-foreground"
            >
              <Facebook size={16} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Share on LinkedIn"
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-foreground/70 transition hover:bg-primary hover:text-primary-foreground"
            >
              <Linkedin size={16} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareLink}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Share on Twitter"
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-foreground/70 transition hover:bg-primary hover:text-primary-foreground"
            >
              <Twitter size={16} />
            </a>
            <button
              onClick={copyLink}
              aria-label="Copy link"
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-foreground/70 transition hover:bg-primary hover:text-primary-foreground"
            >
              <Link2 size={16} />
            </button>
          </div>
        </div>

        {/* Featured image */}
        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-2xl shadow-luxe">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>

        {/* Article body */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: (props) => (
                  <h1 className="mb-4 mt-8 font-serif text-3xl font-semibold text-foreground" {...props} />
                ),
                h2: (props) => (
                  <h2 className="mb-3 mt-8 font-serif text-2xl font-semibold text-foreground" {...props} />
                ),
                h3: (props) => (
                  <h3 className="mb-2 mt-6 font-serif text-xl font-semibold text-foreground" {...props} />
                ),
                p: (props) => (
                  <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />
                ),
                ul: (props) => (
                  <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground" {...props} />
                ),
                ol: (props) => (
                  <ol className="mb-4 list-decimal space-y-1 pl-6 text-muted-foreground" {...props} />
                ),
                li: (props) => <li className="leading-relaxed" {...props} />,
                blockquote: (props) => (
                  <blockquote className="my-6 border-l-4 border-gold bg-cream/40 py-2 pl-4 italic text-foreground/80" {...props} />
                ),
                a: (props) => (
                  <a className="font-medium text-primary underline underline-offset-2 hover:text-gold" {...props} />
                ),
                strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
                hr: () => <hr className="my-8 border-border" />,
                code: (props) => (
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t) => (
                  <Badge key={t} variant="outline" className="font-normal">
                    #{t}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </article>

      {/* Author bio */}
      <section className="bg-cream/40 border-y border-border">
        <div className="container-tight py-12">
          <Card className="mx-auto flex max-w-3xl flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
            <Avatar className="h-16 w-16 border border-gold/30">
              <AvatarImage src={undefined} alt={post.author?.name || "A1 Vision Real Estate"} />
              <AvatarFallback className="bg-primary/10 font-serif text-xl text-primary">
                {(post.author?.name || "AI").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Written by
              </p>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {post.author?.name || "A1 Vision Real Estate Editorial"}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {post.author?.name || "The A1 Vision Real Estate team"} writes practical,
                data-backed property insights for buyers, sellers and investors
                across Melbourne. Talk to us for tailored advice on your next move.
              </p>
            </div>
            <Button
              variant="outline"
              className="self-start sm:self-center"
              onClick={() => navigate("contact")}
            >
              Get in touch <ArrowUpRight size={15} />
            </Button>
          </Card>
        </div>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container-tight py-16 sm:py-20">
          <SectionHeading
            eyebrow="Keep reading"
            title="Related Articles"
            align="left"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Card
                key={p.id}
                className="group flex cursor-pointer flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-luxe"
                onClick={() => navigate(`blog-detail/${p.slug}`)}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.featuredImage}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {p.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-lg font-semibold leading-snug text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {p.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>{formatDate(p.publishedAt)}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:gap-2 transition-all">
                      Read <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-tight pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <Quote className="absolute right-6 top-6 text-gold/30" size={48} />
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            Thinking of buying or selling?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/75 sm:text-base">
            Talk to us. Our experienced team blends local expertise with
            data-driven strategy to deliver record-setting results.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="h-12 bg-gold text-gold-foreground hover:bg-gold/90"
              onClick={() => navigate("contact")}
            >
              Talk to us <ArrowUpRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate("properties")}
            >
              Browse properties
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="container-tight py-12">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="mb-6 h-4 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="mt-3 h-12 w-full" />
        <Skeleton className="mt-2 h-12 w-2/3" />
        <Skeleton className="mt-4 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-5/6" />
        <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="mx-auto mt-10 aspect-[16/9] w-full max-w-5xl rounded-2xl" />
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
