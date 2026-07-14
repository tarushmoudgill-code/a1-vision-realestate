# A1 Vision Real Estate — Premium Real Estate Platform

A full-featured real estate website with a public-facing site and a protected admin panel. Built with Next.js 16 (App Router), TypeScript, Prisma (PostgreSQL), and Tailwind CSS + shadcn/ui.

Branded with a **dark navy + metallic gold** colour scheme matching the A1 Vision Real Estate logo, based in **Melbourne, Victoria**.

---

## Quick Start (Local)

```bash
# 1. Install dependencies
bun install

# 2. Set up your database
#    Either SQLite for local dev, or PostgreSQL for production.
#    Create a .env file with DATABASE_URL (see .env.example)

# 3. Create the database schema & generate the Prisma client
bun run db:push

# 4. Seed the database with sample data
bun run prisma/seed.ts

# 5. Start the dev server
bun run dev
```

Then open **http://localhost:3000**.

### Admin Panel Access

Navigate to the **lock icon** in the navbar (top-right) or the "Staff Login" link in the footer — this opens the admin login at `#/admin`.

| Field | Value |
|---|---|
| **Email** | `admin@a1vision.com.au` |
| **Password** | `admin123` |

---

## Deploy to Vercel (Production)

This project is configured for one-click Vercel deployment with automatic database provisioning.

### Step 1 — Create a PostgreSQL database

Easiest option: **Vercel Postgres** (built into Vercel, no separate account needed).

1. Go to your Vercel dashboard → **Storage** tab → **Create Database** → **Postgres (Neon)**
2. Name it `a1-vision-db` → **Create**
3. Vercel generates a `DATABASE_URL` environment variable
4. Click **"Connect to Project"** → select your A1 Vision project

**Alternatives:** [Neon](https://neon.tech) or [Supabase](https://supabase.com) — both have free Postgres tiers. Copy the connection string and add it as a `DATABASE_URL` env var in Vercel.

### Step 2 — Set environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value | Environments |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` (from your Postgres provider) | Production, Preview, Development |
| `SESSION_SECRET` | A long random string (e.g. 32+ characters) | Production, Preview, Development |

### Step 3 — Deploy

Push to your GitHub repo (or import it into Vercel). On every deploy, Vercel automatically:

1. Runs `prisma generate` (via `postinstall`)
2. Runs `prisma db push` (creates/migrates the schema — via `vercel-build`)
3. Runs the seed script (populates sample data — via `vercel-build`)
4. Runs `next build`

Your live site appears at `https://your-project.vercel.app`.

> **Note:** The seed runs on every build and re-seeds the database (wiping + repopulating). For production, you may want to remove the seed step from `vercel-build` in `package.json` after the first deploy.

---

## Project Structure

```
a1-vision-real-estate/
├── prisma/
│   ├── schema.prisma          # Database schema (13 models, PostgreSQL)
│   └── seed.ts                # Seed script
├── public/                    # logo.png, logo.svg, robots.txt
├── src/
│   ├── app/                   # layout, page, globals.css, api/ (REST routes)
│   ├── components/
│   │   ├── shared/            # Navbar, Footer, AppShell, PropertyCard
│   │   ├── public/pages/      # 18 public page components
│   │   ├── admin/             # Admin panel (13 sections)
│   │   └── ui/                # shadcn/ui component library
│   ├── hooks/
│   ├── lib/                   # auth, api, db, constants, seed, types
│   └── store/                 # Zustand stores (router, auth, favorites)
├── .env                       # DATABASE_URL (PostgreSQL)
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## Architecture

- **Single-route SPA** — hash-based client router (`src/store/router.ts`), `AppShell` switches public/admin views
- **Auth** — JWT sessions (httpOnly cookies), bcrypt, RBAC (4 roles), rate limiting, audit logging
- **Database** — Prisma ORM + PostgreSQL (13 models)
- **API** — 40+ REST routes under `src/app/api/` (public reads + protected admin CRUD)

---

## Features

### Public Website
Home, Properties (search/filter/sort), Property Detail (gallery, virtual tour, agent card, Book Inspection + Enquire dialogs), Services (7 categories), Suburb Guides (8 Melbourne suburbs), Agents, Gallery, Blog, Mortgage Calculator, Contact, Testimonials, Pricing, FAQ, 404.

### Admin Panel (protected)
Dashboard, Properties (CRUD), Inspections, Leads (CRM), Customers, Blog (CMS), Testimonials (moderation), Contacts, Team, Suburbs, Reports (charts + CSV), Settings, Audit Log.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York style) |
| Database | Prisma ORM + PostgreSQL |
| Auth | Custom JWT + bcrypt (httpOnly cookies) |
| State | Zustand (client state + persisted favorites) |
| Icons | lucide-react |
| Charts | recharts (admin reports) |
| Fonts | Playfair Display (serif headings) + Geist (sans body) |

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server (port 3000) |
| `bun run build` | Production build |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run seed` | Seed database with sample data |
| `vercel-build` | Vercel build hook (schema + seed + build) |

---

## Offices

| Office | Address |
|---|---|
| **Hoppers Crossing (Head Office)** | Top Floor, 2/18 Elm Park Drive, Hoppers Crossing VIC 3029 |
| **Truganina** | Top Floor, 54 Efficient Drive, Truganina VIC 3029 |

---

© A1 Vision Real Estate. All rights reserved.
