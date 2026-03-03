# Technology Stack

**Project:** Marketplace VDC (Physical Store Marketplace)
**Researched:** March 2026
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 15.x (latest) | Full-stack framework with App Router | Built-in SSR for SEO, Server Actions for backend logic, native NextAuth integration |
| **TypeScript** | 5.x | Type safety | Required by project constraints, excellent DX with shadcn/ui |
| **Node.js** | 20.x LTS | Runtime | Next.js requirement, LTS stability |

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **NextAuth.js** | v5 (beta) | Authentication | Required by project constraints. v5 has better TypeScript support and simplified configuration |
| **@auth/core** | ^5.0 | Core auth | NextAuth v5 dependency |

**Alternative considered:**
- **Better-Auth** — Newer, simpler API, but NextAuth.js has more community support and adapters. Stick with NextAuth.js per project requirements.

### Database & ORM

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **PostgreSQL** | 16.x | Primary database | Best for relational marketplace data (products, orders, stores, users) |
| **Prisma** | 6.x | ORM | Batteries-included DX, excellent migration system, auto-generated types |
| **@prisma/client** | 6.x | Database client | Type-safe queries |

**Alternative considered:**
- **Drizzle ORM** — Lighter (~57KB vs 2MB+), faster, SQL-first. Better for serverless/edge. However, Prisma has better migration DX for teams and more mature ecosystem. Choose **Prisma** for this marketplace due to complex schemas and team efficiency.

**Database Hosting:**
- **Neon** (serverless PostgreSQL) — Best for Vercel/Next.js deployment, scales to zero
- **Supabase** — Includes auth, storage, real-time — good for full-stack
- **Railway/Render** — Traditional hosting for more control

### UI & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 3.x | Utility-first CSS | Required by project constraints, excellent for responsive design |
| **shadcn/ui** | Latest | Component library | Required by project constraints. Copy-paste components (not npm dependency), fully customizable, built on Radix UI primitives |
| **Radix UI** | Latest | Headless primitives | shadcn/ui foundation, accessible, unstyled |
| **Lucide React** | Latest | Icons | Used by shadcn/ui, consistent icon set |
| **Class Variance Authority (CVA)** | 0.4.x | Variant management | Manage component variants (colors, sizes) |
| **clsx** / **tailwind-merge** | Latest | Class utilities | Combine classes conditionally |

**NOT to use:**
- **MUI / Material UI** — Too heavy, conflicts with Tailwind design philosophy
- **Chakra UI** — Less flexible than shadcn/ui, fewer updates in 2025
- **Bootstrap** — Outdated for modern React apps

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | 5.x | Client-side state | Lightweight, hook-based, no boilerplate. Perfect for user preferences, cart, UI state |
| **TanStack Query** | 5.x | Server state / API caching | Replaces useEffect fetching. Caching, background refetch, optimistic updates built-in |

**NOT to use:**
- **Redux Toolkit** — Too heavy for most cases. Zustand + TanStack Query covers 95% of use cases with far less complexity
- **Jotai** — Zustand has better TypeScript inference and less experimental feel

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Hook Form** | 7.x | Form management | Performance (uncontrolled inputs), integrates with UI libraries |
| **Zod** | 3.x | Schema validation | TypeScript-first, integrates with React Hook Form |

### Maps Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Leaflet** | 5.x | Open-source maps | Free, no API key required, OpenStreetMap tiles. Sufficient for store locator |
| **Leaflet** | 1.9.x | Map library | Core Leaflet |
| **@types/leaflet** | Latest | TypeScript types | Required for TypeScript |

**Alternative considered:**
- **Mapbox GL JS / react-map-gl** — Better visuals, but requires API token and has usage costs. Use Mapbox only if you need advanced features or better aesthetics
- **@react-google-maps/api** — Expensive at scale, requires Google Cloud billing

**Recommendation:** Start with **React Leaflet** (free), upgrade to Mapbox if needed for better UX.

### SEO

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js Metadata API** | Built-in | Page metadata | Native in App Router, handles title, description, Open Graph |
| **next-sitemap** | Latest | Sitemap generation | Automatic sitemap.xml for search engines |
| **next-seo** | 7.x | SEO component library | Declarative meta tags, Open Graph, Twitter Cards |
| **schema-dts** | Latest | JSON-LD types | TypeScript types for structured data |

**NOT to use:**
- **react-helmet** — Deprecated, replaced by Next.js Metadata API in App Router

### Plugin/Integration System

| Technology | Purpose | Why |
|------------|---------|-----|
| **Dynamic Imports** | Runtime module loading | Next.js native support for lazy loading |
| **React Context** | Plugin communication | Share state between host app and plugins |
| **Event Bus Pattern** | Loose coupling | Allow plugins to communicate without direct dependencies |

**Architecture pattern:**
- Plugin contract: Each plugin exports a standard interface (name, component, config)
- Isolated scopes: Plugins loaded in sandboxed contexts
- Event-driven: Plugins communicate via events, not direct imports

### File Storage

| Technology | Purpose | Why |
|------------|---------|-----|
| **AWS S3** | Object storage | Industry standard, cheap at scale |
| **UploadThing** | File upload API | Simpler than raw S3, works great with Next.js. **Recommended for MVP** |
| **@uploadthing/react** | React hooks | Easy dropzone integration |

### Payments

| Technology | Purpose | Why |
|------------|---------|-----|
| **Stripe** | Payment processing | Best developer experience, supports marketplace (Connect) for splitting payments between platform and sellers |
| **@stripe/stripe-js** | Stripe frontend | Official SDK |
| **stripe** | Stripe Node SDK | Backend API |

**NOT to use:**
- **PayPal** — Declining relevance in Brazil/LatAm, worse DX than Stripe
- **Mercado Pago** — Consider adding as secondary processor for local market

### Search

| Technology | Purpose | Why |
|------------|---------|-----|
| **Algolia** | Full-text search | Best-in-class, instant results, typo tolerance |
| **Meilisearch** | Open-source alternative | Self-hostable, similar features to Algolia |
| **PostgreSQL Full-Text** | Built-in search | Good for MVP, upgrade to dedicated search for scale |

**Recommendation:** Start with **PostgreSQL Full-Text Search** for MVP, migrate to Algolia when needed.

### Email

| Technology | Purpose | Why |
|------------|---------|-----|
| **Resend** | Email sending | Modern API, excellent deliverability, React Email integration |
| **React Email** | Email templates | Build emails with React components |

### Deployment

| Technology | Purpose | Why |
|------------|---------|-----|
| **Vercel** | Platform | Native Next.js support, zero-config deployments, edge functions |
| **Neon** | Database | Serverless PostgreSQL, branches for dev/staging |

---

## Installation

### Core Dependencies

```bash
# Create Next.js project
npx create-next-app@latest marketplace-vdc \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# Install core dependencies
npm install next-auth@beta @prisma/client zustand @tanstack/react-query \
  react-hook-form @hookform/resolvers zod lucide-react clsx tailwind-merge \
  class-variance-authority

# Install dev dependencies
npm install -D prisma @types/node @types/react @types/react-dom \
  eslint eslint-config-next
```

### shadcn/ui Setup

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button card input form dialog dropdown-menu \
  select tabs avatar badge separator sheet skeleton toast
```

### Database Setup

```bash
# Initialize Prisma
npx prisma init

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Maps Setup

```bash
# Install Leaflet
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

---

## Architecture Overview

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (if needed beyond Server Actions)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── maps/              # Map components
│   └── shared/            # Shared components
├── lib/                   # Utilities and configs
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   └── utils.ts           # Utility functions
├── stores/                # Zustand stores
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
└── app.actions/           # Server Actions (Clean Architecture use cases)
```

### Clean Architecture Layers

```
src/
├── domain/                 # Enterprise business rules
│   ├── entities/         # Core business objects
│   └── repositories/     # Repository interfaces
├── application/           # Application business rules
│   ├── use-cases/       # Server Actions / use cases
│   └── services/        # Application services
├── infrastructure/        # Frameworks & drivers
│   ├── database/         # Prisma implementation
│   ├── auth/             # NextAuth implementation
│   └── external/         # Stripe, Maps, etc.
└── presentation/          # UI layer
    ├── components/       # React components
    └── hooks/            # Custom hooks
```

---

## What NOT To Use and Why

| Technology | Why Avoid |
|------------|-----------|
| **Pages Router** | App Router has better SEO (RSC), Server Actions, and is the future |
| **Redux** | Zustand + TanStack Query is simpler and covers all use cases |
| **MUI / Material UI** | Conflicts with Tailwind, too heavy, poor performance |
| **create-react-app** | Deprecated, use Next.js |
| **REST-only approach** | Use Server Actions for mutations, GraphQL if complex queries needed |
| **Client-side only auth** | Security risk, use NextAuth.js server-side sessions |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Core Stack | HIGH | Next.js + TypeScript + Tailwind is standard 2025 stack |
| Authentication | HIGH | NextAuth.js is established, well-maintained |
| Database | HIGH | Prisma + PostgreSQL is proven for marketplaces |
| UI Components | HIGH | shadcn/ui is current industry standard |
| Maps | MEDIUM | Multiple options (Leaflet/Mapbox), choice depends on budget |
| SEO | HIGH | Next.js Metadata API is built-in and excellent |
| Plugin System | MEDIUM | Requires custom implementation, patterns identified |
| Payments | HIGH | Stripe Connect is standard for marketplaces |

---

## Sources

- Next.js 15 Documentation (2026)
- shadcn/ui Official Docs (ui.shadcn.com)
- Prisma 6 Release Notes (October 2025)
- Next.js SEO Best Practices (averagedevs.com, December 2025)
- React Leaflet + Next.js Integration (dev.to, January 2025)
- Zustand + TanStack Query patterns (medium.com, July 2025)
- React Plugin Architecture (dev.to, April 2025)
- Next.js App Router SEO Guide (adeelhere.com, December 2025)
