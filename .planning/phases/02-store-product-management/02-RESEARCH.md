# Phase 2: Store & Product Management - Research

**Researched:** 2026-03-04
**Domain:** E-commerce Store Management, Product Catalog, Geocoding, Image Processing
**Confidence:** HIGH

## Summary

This phase focuses on the core seller experience: creating a store and managing a product catalog. Key technical challenges include implementing a smooth multi-step onboarding for stores, handling geocoding for physical addresses in Brazil with manual map adjustments, and processing product images for consistent display.

**Primary recommendation:** Use **Leaflet** with **OpenStreetMap** (via OpenFreeMap or similar) for a cost-effective map solution in Brazil, and leverage **Next.js 15 Server Actions** with a "Step-by-Step" validation pattern for the store wizard.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Manual address fields + Pin adjustment**: System must allow manual entry and fine-tuning on a map.
- **8 images max**: Product limit, 1st is primary.
- **Auto-crop**: Images must be automatically cropped to 1:1.
- **Store Status**: Purchases allowed even when closed (with warning).
- **Wholesale logic**: Triggered by quantity (min_qty).
- **Fixed categories**: Admin-defined.

### OpenCode's Discretion
- Library selection for Wizard, Maps, and Image processing.
- Schema implementation for price tiers.

### Deferred Ideas (OUT OF SCOPE)
- Real-time chat.
- User messaging.
- Native mobile app (PWA focus).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STOR-01 | Create store (Name, Desc, Addr) | Multi-step form patterns for Next.js 15. |
| STOR-04 | Geocoding for map display | Leaflet + OpenStreetMap integration research. |
| PROD-02 | Upload product images | Sharp 1:1 auto-crop implementation. |
| PROD-05 | Wholesale price tier | Prisma schema patterns for tiered pricing. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Leaflet** | 1.9+ | Interactive Maps | Open-source, lightweight, no API key required for basic OSM. |
| **Sharp** | 0.33+ | Image Processing | High-performance, native support for 1:1 cropping and WebP. |
| **Zod** | 3.x | Validation | Integrated with Next.js 15 Server Actions for type-safe forms. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| **react-leaflet** | 5.x | React Wrapper | Simplifies Leaflet integration in Next.js (Client Components). |
| **nuqs** | 2.x | Query State | Recommended for persisting Wizard step in URL. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── domain/
│   ├── store/          # Store entities and wholesale logic
│   └── product/        # Product and Image entities
├── application/
│   ├── store/          # CreateStoreUseCase, GeocodeService
│   └── product/        # UploadProductUseCase, ProcessImageService
└── infrastructure/
    ├── maps/           # Leaflet implementation
    └── storage/        # Sharp image processing implementation
```

### Pattern 1: URL-State Wizard (Next.js 15)
**What:** Use search parameters (`?step=1`) to track wizard progress.
**When to use:** Multi-step forms like Store Creation. Allows users to go back/forward using browser buttons.
**Example:**
```typescript
// use nuqs for clean search param management
const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(1));
```

### Pattern 2: Server Action "Partial Validation"
**What:** Validate only the current step's fields using Zod `pick` or `omit` in the Server Action.
**Why:** Keeps logic on the server while providing fast feedback.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map Tiles | Custom tile server | **OpenFreeMap** or **Stadia Maps** | Brazil coverage is good on OSM; hand-rolling tiles is complex. |
| Image Cropping | Manual canvas logic | **Sharp (Server-side)** | Consistency, performance, and better compression (WebP). |
| Address Autocomplete | Custom search | **Nominatim (OSM)** | Free and effective for Brazil address lookup. |

## Common Pitfalls

### Pitfall 1: Leaflet Window Reference
**What goes wrong:** `ReferenceError: window is not defined` when importing Leaflet in Next.js.
**How to avoid:** Always use dynamic imports with `ssr: false` for Map components.

### Pitfall 2: Prisma Decimal Precision
**What goes wrong:** `Float` types in DB leading to cent rounding errors for prices.
**How to avoid:** Use `Decimal` type in Prisma for all price fields.

## Code Examples

### Image 1:1 Auto-Crop with Sharp
```typescript
// Source: https://sharp.pixelplumbing.com/api-resize
import sharp from 'sharp';

async function processProductImage(buffer: Buffer) {
  return await sharp(buffer)
    .resize(1000, 1000, {
      fit: 'cover',
      position: 'centre' // or 'entropy' for smart cropping
    })
    .webp({ quality: 80 })
    .toBuffer();
}
```

### Prisma Wholesale Schema
```prisma
model Product {
  id          String   @id @default(cuid())
  priceRetail Decimal
  priceWholesale Decimal?
  minWholesaleQty Int?
  // Logic: if (qty >= minWholesaleQty) use priceWholesale
}
```

## Open Questions

1. **Geocoding usage limits**: OSM Nominatim has strict rate limits.
   - Recommendation: For production, use a proxy or a low-cost provider like Stadia Maps if volume is high.
2. **Back-in-stock notifications**:
   - Simple architecture: `ProductSubscription` table (email, productId).
   - Cron job / Trigger: When stock changes from 0 to N, send emails.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Well-documented libraries.
- Architecture: HIGH - Follows Next.js 15 best practices.
- Pitfalls: HIGH - Common Next.js/Leaflet issues documented.

**Research date:** 2026-03-04
**Valid until:** 2026-04-03
