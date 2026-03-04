# Phase 3: Discovery & Search - Research

**Researched:** 2026-03-04
**Domain:** Search, SEO, and Product Discovery in Next.js 15 & Prisma
**Confidence:** HIGH

## Summary

This phase focuses on enabling buyers to find products efficiently through search, filtering, and sorting, while ensuring the platform is optimized for search engines (SEO). 

**Primary recommendation:** Use Prisma's native `fullTextSearch` (PostgreSQL) for the MVP to minimize infrastructure complexity, while architecting the Infrastructure layer to allow for a future Meilisearch/Algolia transition. Leverge Next.js 15's `searchParams` with Server Components for a robust, SEO-friendly filtering system.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | ^6.19 | Database Access & Search | Native PostgreSQL full-text search support (GIN indexes). |
| Next.js | ^16.1 | Framework | App Router, Server Components, and built-in SEO/Sitemap APIs. |
| shadcn/ui | latest | UI Components | High-quality, accessible components for search bars and filters. |
| nuqs | ^2.0 | Type-safe search params | Best-in-class library for managing state in URLs in Next.js. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| lucide-react | ^0.576 | Icons | Search, filter, and sort icons. |
| zod | ^4.3 | Validation | Validating search queries and filter parameters. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma FTS | Meilisearch | Meilisearch offers better relevance and typosquatting but requires separate hosting/management. |
| Manual Sitemap | next-sitemap | `next-sitemap` is great for Page Router, but App Router's `sitemap.ts` is now the native, preferred way. |

**Installation:**
```bash
npm install nuqs
```

## Architecture Patterns

### Recommended Project Structure
Following Clean Architecture, we separate the search logic:
```
src/
├── app/
│   ├── (shop)/
│   │   ├── search/
│   │   │   └── page.tsx      # Main search results page
│   │   └── sitemap.ts        # Dynamic sitemap generation
├── components/
│   ├── discovery/            # Search bar, Filter sidebar, Sort dropdown
│   └── product/              # Product cards for results
├── lib/
│   ├── search-params.ts      # nuqs definitions
└── infrastructure/
    └── repositories/
        └── PrismaProductRepository.ts # Implements full-text search logic
```

### Pattern 1: URL-State Sync (nuqs)
**What:** Keeping all filter and search states in the URL query parameters.
**When to use:** Always for discovery pages to ensure users can share/bookmark filtered views.
**Example:**
```typescript
// src/lib/search-params.ts
import { parseAsString, parseAsInteger, createSearchParamsCache } from 'nuqs/server'

export const productSearchParams = {
  q: parseAsString.withDefault(''),
  category: parseAsString,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sort: parseAsString.withDefault('newest')
}

export const loadProductSearchParams = createSearchParamsCache(productSearchParams)
```

### Anti-Patterns to Avoid
- **Client-side Filtering:** Don't fetch all products and filter on the client. It kills performance and SEO.
- **Hardcoded Meta Tags:** Avoid static `layout.tsx` metadata for product pages. Always use `generateMetadata`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Search Param Sync | Manual `useEffect` + `useRouter` | `nuqs` | Handles race conditions, type safety, and shallow routing correctly. |
| Debouncing | Custom `setTimeout` | `use-debounce` or shadcn patterns | Battle-tested and handles edge cases. |
| Sitemap XML | Manual string concatenation | Next.js `sitemap.ts` | Native integration with `generateSitemaps` for large datasets. |

## Common Pitfalls

### Pitfall 1: Prisma Full-Text Search Config
**What goes wrong:** `fullTextSearch` is a preview feature in Prisma and must be enabled in `schema.prisma`.
**Why it happens:** It's not enabled by default for PostgreSQL.
**How to avoid:** Add `previewFeatures = ["fullTextSearchPostgres"]` to the generator block.
**Warning signs:** TypeScript errors when trying to use `search` in `where` clauses.

### Pitfall 2: Layout vs Page Metadata
**What goes wrong:** Metadata in `layout.tsx` doesn't have access to page-specific `params`.
**How to avoid:** Use `generateMetadata` in `page.tsx` for dynamic segments like `/product/[slug]`.

## Code Examples

### Dynamic Metadata & JSON-LD
```typescript
// src/app/product/[slug]/page.tsx
import { Metadata } from 'next'
import { getProductBySlug } from '@/infrastructure/repositories/ProductRepository'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  return {
    title: `${product.name} | My Marketplace`,
    description: product.description,
    openGraph: {
      images: [product.mainImage],
    },
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.mainImage,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
    },
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </section>
  )
}
```

### Dynamic Sitemap Generation
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    select: { slug: true, updatedAt: true }
  })

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
  }))

  return [
    { url: `${process.env.NEXT_PUBLIC_BASE_URL}/`, lastModified: new Date() },
    ...productEntries,
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getStaticPaths` | `generateStaticParams` | Next.js 13 | Better DX, native streaming. |
| `next-seo` | Metadata API | Next.js 13 | Built-in, no external dependency needed. |
| SQL `LIKE %query%` | Prisma `search` | Prisma 5.x | Proper ranking and indexing for better search results. |

## Open Questions

1. **Search Relevance:** Will Prisma's PostgreSQL FTS be sufficient for "fuzzy" search?
   - What we know: It supports prefix matching and some ranking.
   - What's unclear: Typo tolerance is limited compared to Meilisearch.
   - Recommendation: Start with Prisma; if users complain about "iPhone" vs "iPhon", add Meilisearch.

2. **Wholesale vs Retail Pricing in SEO:**
   - What we know: Search engines prefer a single price.
   - What's unclear: How to handle price ranges in JSON-LD.
   - Recommendation: Use `AggregateOffer` or default to the lowest Retail price for the main SEO tag.

## Sources

### Primary (HIGH confidence)
- [Prisma Documentation](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search) - Full-text search usage.
- [Next.js Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Metadata and SEO.
- [Next.js Sitemap API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Sitemap generation.

### Secondary (MEDIUM confidence)
- [nuqs GitHub](https://github.com/47ng/nuqs) - Type-safe search params patterns.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Core Next.js/Prisma features.
- Architecture: HIGH - Standard Clean Architecture with URL-first state.
- Pitfalls: MEDIUM - Depends on exact PostgreSQL version and Prisma config.

**Research date:** 2026-03-04
**Valid until:** 2026-04-03
