# Architecture Patterns for Next.js Marketplace Application

**Domain:** Marketplace for Physical Stores with Pickup/Delivery
**Researched:** March 2026
**Overall Confidence:** HIGH

## Executive Summary

This architecture document outlines a production-proven structure for a Next.js marketplace application with Clean Architecture principles. The system is designed around three primary architectural layers: **Application Layer** (UI/Routing), **Feature Layer** (Business Logic), and **Bootstrap Layer** (Configuration/DI). For marketplace functionality with physical stores, maps integration, and delivery routes, this architecture supports modularity, testability, and independent scaling of features.

---

## Recommended Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   App Router   │  │   API Routes   │  │    Server Components        │  │
│  │  (Next.js 14+) │  │  (Route Handlers)│ │    (SSR/SSG/ISR)           │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┬──────────────┘  │
└───────────┼────────────────────┼──────────────────────────┼──────────────────┘
            │                    │                          │
            ▼                    ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER (MVVM)                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Controllers (Page Logic)  │  ViewModels (State/UI Logic)  │  Views   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FEATURE LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Domain    │  │  UseCases   │  │  Interfaces │  │       Data          │ │
│  │  Entities   │  │ (Business   │  │ (IRepo)     │  │   Repositories     │ │
│  │             │  │   Logic)     │  │             │  │   + Mappers        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BOOTSTRAP LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ DI (Tsyringe)│  │   Config    │  │  Boundary   │  │   i18n/Utilities   │ │
│  │  Container   │  │  (Env/Zod)   │  │  Adapters   │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### 1. Presentation Layer (Next.js App Router)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `app/` routes | HTTP request handling, SSR/SSG/ISR | Application Layer via Controllers |
| Server Components | Data fetching, SEO rendering | Feature Layer (UseCases) directly |
| Client Components | Interactive UI, state management | Application Layer ViewModels |
| API Routes | External API integrations, webhooks | Feature Layer UseCases |
| Route Handlers | RESTful endpoints for mobile/3rd party | Application Layer |

### 2. Application Layer (MVVM)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Controllers | Page-level logic orchestration | Feature Layer UseCases |
| ViewModels | UI state management, form handling | Domain Entities, Server Actions |
| Views | React components, UI rendering | ViewModels via hooks |

### 3. Feature Layer (Clean Architecture)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Domain Entities | Business objects with rules | UseCases only |
| Use Cases | Business logic orchestration | Domain Entities, Repository Interfaces |
| IRepository Interfaces | Contracts for data access | UseCases (dependency inversion) |
| Repository Implementations | Data access (DB/API/Cache) | External services, Mappers |
| Mappers | Data transformation (DTO ↔ Entity) | Repository → External |

### 4. Bootstrap Layer

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| DI Container | Dependency injection configuration | All layers |
| Config | Environment validation, schema | All layers |
| Boundary Adapters | External lib wrappers (Maps, Payment) | Feature Layer via Interfaces |
| i18n | Localization | Views only |

---

## Data Flow

### Request-Response Flow (Read Operations)

```
User Request
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  Next.js Route Handler (app/...)                   │
│  └── Server Component / Page.tsx                   │
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│  Application Layer - Controller                     │
│  └── Extracts params, calls UseCase                │
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│  Feature Layer - UseCase                           │
│  └── Orchestrates business logic                   │
│  └── Calls IRepository interface                  │
└──────────────────────┬──────────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────────┐
│  Feature Layer - Repository Implementation         │
│  └── Fetches from DB/API/Cache                     │
│  └── Maps external data to Domain Entity           │
└──────────────────────┬──────────────────────────────┘
                       │ returns
                       ▼
         Domain Entity ← Return Path →
```

### Write Operations (with Server Actions)

```
User Action (Form Submit)
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  Server Action (app/actions/*.ts)                  │
│  └── Validates input (Zod)                         │
│  └── Calls UseCase                                 │
└──────────────────────┬──────────────────────────────┘
                       │ (same flow as above)
                       ▼
         UseCase → Repository → Returns Result
                       │
                       ▼
              Revalidate Path (optional)
                       │
                       ▼
              Redirect / Refresh UI
```

### Marketplace-Specific Data Flows

#### Store Discovery + Map Integration
```
User visits /stores
     │
     ▼
StoreListController.getStores()
     │
     ▼
GetNearbyStoresUseCase
     │
     ├─► StoreRepository.getAll() → DB
     │
     └─► LocationService.getCoordinates() → Maps API
          │
          └─► Returns enriched Store[] with distance
              
     │
     ▼
Returns StoreEntity[] with GeoLocation
     │
     ▼
MapView Component renders stores on map
```

#### Delivery Route Optimization
```
User creates delivery order
     │
     ▼
CreateDeliveryUseCase
     │
     ├─► OrderRepository.create()
     │
     └─► RouteOptimizationService.optimize()
          │
          ├─► Google Routes API / Route Optimization API
          │    Input: pickup + delivery locations
          │    Output: optimized route
          │
          └─► Returns RouteEntity
              
     │
     ▼
Returns DeliveryEntity with route
```

---

## Clean Architecture Layer Structure

### Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── stores/
│   │   ├── orders/
│   │   └── deliveries/
│   ├── stores/
│   │   ├── [storeId]/
│   │   │   ├── page.tsx         # Store detail (SSR + SEO)
│   │   │   └── loading.tsx
│   │   ├── page.tsx             # Store listing
│   │   └── layout.tsx
│   ├── api/                     # Route handlers
│   │   ├── stores/
│   │   ├── orders/
│   │   └── webhooks/
│   ├── layout.tsx              # Root layout
│   └── page.tsx                 # Home page
│
├── features/                     # Feature Layer (Business Logic)
│   ├── core/                    # Primary domain features
│   │   ├── stores/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── store.entity.ts
│   │   │   │   │   └── location.entity.ts
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── get-store.usecase.ts
│   │   │   │   │   ├── search-stores.usecase.ts
│   │   │   │   │   └── create-store.usecase.ts
│   │   │   │   └── i-repository/
│   │   │   │       └── store.repository.interface.ts
│   │   │   └── data/
│   │   │       ├── repositories/
│   │   │       │   └── prisma-store.repository.ts
│   │   │       └── mappers/
│   │   │           └── store.mapper.ts
│   │   ├── orders/
│   │   ├── deliveries/
│   │   ├── users/
│   │   └── payments/
│   ├── support/                 # Cross-cutting features
│   │   ├── maps/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── route.entity.ts
│   │   │   │   └── i-services/
│   │   │   │       └── maps.service.interface.ts
│   │   │   └── data/
│   │   │       └── google-maps.service.ts
│   │   ├── notifications/
│   │   ├── search/
│   │   └── seo/
│   └── shared/                  # Reusable code
│       ├── types/
│       └── utils/
│
├── application/                 # Application Layer (MVVM)
│   ├── controllers/            # Page logic
│   │   ├── stores/
│   │   │   └── store-list.controller.ts
│   │   └── orders/
│   ├── viewmodels/             # UI state
│   │   ├── stores/
│   │   │   └── store-map.vm.ts
│   │   └── orders/
│   └── hooks/                  # React hooks
│       ├── use-stores.ts
│       └── use-delivery.ts
│
├── bootstrap/                   # Bootstrap Layer
│   ├── di/                     # Dependency Injection
│   │   ├── container.ts
│   │   └── registrations/
│   │       ├── store.repository.ts
│   │       ├── maps.service.ts
│   │       └── delivery.service.ts
│   ├── config/
│   │   ├── server/
│   │   │   └── env.schema.ts   # Zod schema
│   │   └── client/
│   ├── boundary/               # External adapters
│   │   ├── prisma/
│   │   ├── google-maps/
│   │   └── stripe/
│   └── i18n/
│
└── test/                        # Testing
    ├── unit/
    ├── integration/
    └── e2e/
```

### Domain Entity Example (Store)

```typescript
// features/core/stores/domain/entities/store.entity.ts
export class StoreEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,           // For SEO URLs
    public readonly description: string,
    public readonly location: LocationValueObject,
    public readonly address: AddressValueObject,
    public readonly businessHours: BusinessHours[],
    public readonly pickupEnabled: boolean,
    public readonly deliveryEnabled: boolean,
    public readonly status: StoreStatus,
  ) {}

  isOpenAt(date: Date): boolean {
    // Business logic here
  }

  calculateDistance(userLocation: Coordinates): number {
    return this.location.distanceTo(userLocation);
  }
}

// Value Objects
export class LocationValueObject {
  constructor(
    public readonly lat: number,
    public readonly lng: number,
  ) {}

  distanceTo(other: LocationValueObject): number {
    // Haversine formula
  }
}
```

### UseCase Example

```typescript
// features/core/stores/domain/usecases/search-nearby-stores.usecase.ts
export class SearchNearbyStoresUseCase {
  constructor(
    private readonly storeRepository: IStoreRepository,
    private readonly mapsService: IMapsService,
  ) {}

  async execute(input: SearchNearbyStoresInput): Promise<StoreEntity[]> {
    // 1. Validate input
    const coords = new LocationValueObject(input.lat, input.lng);
    
    // 2. Get stores within radius
    const stores = await this.storeRepository.findWithinRadius(
      coords,
      input.radiusKm,
    );
    
    // 3. Enrich with distance info
    return stores.map(store => ({
      ...store,
      distance: store.location.distanceTo(coords),
    }));
  }
}
```

### Repository Interface (Dependency Inversion)

```typescript
// features/core/stores/domain/i-repository/store.repository.interface.ts
export interface IStoreRepository {
  findById(id: string): Promise<StoreEntity | null>;
  findBySlug(slug: string): Promise<StoreEntity | null>;
  findWithinRadius(location: LocationValueObject, radiusKm: number): Promise<StoreEntity[]>;
  create(store: CreateStoreEntity): Promise<StoreEntity>;
  update(id: string, data: UpdateStoreEntity): Promise<StoreEntity>;
  delete(id: string): Promise<void>;
}
```

---

## Plugin/Play System Architecture

For the plugin-play system, implement a modular architecture using Next.js dynamic imports and a registry pattern.

### Plugin System Design

```typescript
// bootstrap/di/registrations/plugin.registry.ts
export interface MarketplacePlugin {
  name: string;
  version: string;
  enabled: boolean;
  
  // Lifecycle hooks
  onInit?(container: DIContainer): Promise<void>;
  onStoreCreated?(store: StoreEntity): Promise<void>;
  onOrderPlaced?(order: OrderEntity): Promise<void>;
  
  // API routes to register
  routes?: PluginRoute[];
}

// Plugin Registry
export class PluginRegistry {
  private plugins: Map<string, MarketplacePlugin> = new Map();
  
  register(plugin: MarketplacePlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }
  
  getPlugin(name: string): MarketplacePlugin | undefined {
    return this.plugins.get(name);
  }
  
  getEnabledPlugins(): MarketplacePlugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }
}
```

### Plugin Loading Strategy

```typescript
// plugins/ directory structure
plugins/
├── manifest.json               # Plugin registry config
├── delivery-connector/        # Plugin package
│   ├── index.ts               # Plugin entry point
│   ├── routes/                # API routes
│   └── services/
├── loyalty-program/
├── custom-checkout/
└── inventory-sync/
```

### Dynamic Feature Loading

```typescript
// application/components/dynamic-feature.tsx
'use client';

import dynamic from 'next/dynamic';

const DynamicPlugin = dynamic(
  () => import(`@/plugins/${pluginName}/component`),
  { 
    loading: () => <PluginSkeleton />,
    ssr: false  // Client-side only for plugins
  }
);

export function MarketplacePlugin({ name }: { name: string }) {
  return <DynamicPlugin />;
}
```

---

## Maps Integration Architecture

### Maps Service Interface (Boundary)

```typescript
// features/support/maps/domain/i-services/maps.service.interface.ts
export interface IMapsService {
  // Geocoding
  geocode(address: string): Promise<GeocodingResult>;
  reverseGeocode(lat: lng: number): Promise<AddressResult>;
  
  // Distance & Routes
  calculateDistance(from: Coordinates, to: Coordinates): Promise<number>;
  getRoute(origin: Coordinates, destination: Coordinates): Promise<Route>;
  optimizeRoute(stops: Coordinates[]): Promise<OptimizedRoute>;
  
  // Static Maps (for SEO/social)
  getStaticMapUrl( markers: MapMarker[]): string;
}
```

### Implementation Options

| Provider | Use Case | Complexity | Cost |
|----------|----------|------------|------|
| Google Maps Platform | Full-featured (Maps, Routes, Places) | Medium | Pay-per-use |
| Mapbox | Custom styling, developer-friendly | Medium | Free tier + pay |
| React-Leaflet + OSM | Free, no API key | Low | Free |
| TomTom | European coverage, real-time traffic | Medium | Pay-per-use |

**Recommendation:** Use Google Maps for production (Routes API + Places API) with React-Leaflet fallback for development.

---

## SEO Architecture

### SEO Requirements by Page Type

| Page | Rendering Strategy | SEO Features |
|------|-------------------|--------------|
| Home | SSG + ISR | Meta tags, sitemap, JSON-LD |
| Store Listing | SSR | Dynamic meta, pagination canonicals |
| Store Detail | SSG + ISR | Product schema, reviews schema |
| Category Pages | SSG + ISR | Breadcrumb schema, category pages |
| Blog/Content | SSG | Article schema, OG images |

### Metadata & Structured Data

```typescript
// app/stores/[slug]/page.tsx
import { Metadata } from 'next';
import { jsonLd } from '@/bootstrap/seo';

export async function generateMetadata({ params }): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  
  return {
    title: `${store.name} - Local Pickup & Delivery`,
    description: store.description,
    alternates: {
      canonical: `https://yoursite.com/stores/${store.slug}`,
    },
    openGraph: {
      images: [store.imageUrl],
    },
  };
}

export default async function StorePage({ params }) {
  const store = await getStoreBySlug(params.slug);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: store.name,
            address: store.address,
            geo: store.location,
            openingHours: store.businessHours,
            servesCuisine: store.cuisineType,
          }),
        }}
      />
      <StoreDetailView store={store} />
    </>
  );
}
```

---

## Suggested Build Order (Dependencies)

### Phase 1: Foundation (Week 1-2)

```
Bootstrap Layer
├── DI Container setup
├── Config validation (Zod)
└── Database connection (Prisma)
    │
    ▼
Core Infrastructure
├── User authentication flow
└── Basic store CRUD
```

**Why:** Establishes the dependency injection foundation that all other code depends on.

### Phase 2: Core Marketplace (Week 3-4)

```
Feature Layer - Core
├── Store Entity + Repository
├── Product Entity + Repository
├── Order Entity + Workflow
└── Basic Search
    │
    ▼
Application Layer
├── Store listing controller
├── Store detail controller
└── Order creation flow
```

**Why:** These are the table-stakes features. No marketplace without stores and products.

### Phase 3: Maps Integration (Week 5-6)

```
Support Layer - Maps
├── Maps service interface
├── Google Maps implementation
├── Store geocoding workflow
└── Distance calculation
    │
    ▼
Frontend Integration
├── Store map view
├── Location picker
└── Store locator (nearby search)
```

**Why:** Maps enable the pickup/delivery value proposition.

### Phase 4: Delivery & Routes (Week 7-8)

```
Support Layer - Delivery
├── Route optimization service
├── Delivery zone management
├── Driver assignment logic
└── Real-time tracking
    │
    ▼
Order Flow Extension
├── Delivery option at checkout
├── Route calculation
└── ETA display
```

**Why:** Complex integration—needs the foundation to be solid first.

### Phase 5: SEO & Performance (Week 9-10)

```
SEO Infrastructure
├── Dynamic sitemap
├── robots.txt
├── JSON-LD schemas
├── OpenGraph images
└── Canonical URLs
    │
    ▼
Performance
├── Image optimization
├── Route caching strategies
└── ISR configuration
```

**Why:** SEO must work with real data from phases 2-4.

### Phase 6: Plugin System (Week 11-12)

```
Plugin Architecture
├── Plugin registry
├── Lifecycle hooks
├── Dynamic loading
└── Plugin API
    │
    ▼
Extensibility Points
├── Payment gateway plugins
├── Notification plugins
└── Analytics plugins
```

**Why:** Plugins extend the platform—build the extension points last.

---

## Anti-Patterns to Avoid

### 1. Direct Database Access in Components
**Bad:** `const user = await prisma.user.findUnique()` in page.tsx
**Good:** Use UseCase → Repository pattern

### 2. Business Logic in Controllers
**Bad:** Validation + DB calls + response formatting in API route
**Good:** Controller only orchestrates, UseCase contains logic

### 3. Tight Coupling to External Services
**Bad:** Direct `google-maps` imports everywhere
**Good:** IMapsService interface, injected dependency

### 4. Ignoring SEO in Dynamic Content
**Bad:** All pages client-rendered
**Good:** Server Components + generateMetadata + JSON-LD

### 5. Monolithic Feature Files
**Bad:** stores.ts with 2000 lines of mixed concerns
**Good:** Feature-scoped folder structure with clear boundaries

---

## Scalability Considerations

| Concern | At Launch (100 users) | At Scale (100K users) |
|---------|---------------------|----------------------|
| **Database** | Single PostgreSQL | Read replicas + Sharding |
| **Caching** | In-memory | Redis cluster |
| **Maps API** | Basic tier | Dedicated API key + quota |
| **Images** | Next.js Image Optimization | CDN (Cloudinary/Vercel Blob) |
| **Search** | Database LIKE queries | Algolia/Elasticsearch |
| **Plugin Loading** | Static imports | Dynamic module loading |
| **SSR** | On-demand | ISR + Edge caching |

---

## Sources

- **Clean Architecture in Next.js** — DEV Community (behnamrhp, May 2025)
  - https://dev.to/behnamrhp/stop-spaghetti-code-how-clean-architecture-saves-nextjs-projects-4l18
  
- **Next.js App Router Documentation** — Official Next.js Docs
  - https://nextjs.org/docs/app

- **Google Maps Route Optimization API** — Google Developers
  - https://developers.google.com/maps/documentation/route-optimization

- **Building Modular Architecture in Next.js** — Rakesh Tembhurne (Oct 2025)
  - https://rakesh.tembhurne.com/blog/coding/building-plugin-architecture-nextjs-15

- **Next.js SEO Best Practices** — AverageDevs (Oct 2025)
  - https://www.averagedevs.com/blog/nextjs-seo-best-practices

- **Marketplace Architecture Guide** — IdeaDope (Dec 2025)
  - https://ideadope.com/roadmaps/how-to-build-marketplace-2025-deep-dive

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Clean Architecture Patterns | HIGH | Multiple production-validated sources, standard patterns |
| Component Boundaries | HIGH | Clear separation validated by multiple implementations |
| Data Flow | HIGH | Standard request/response patterns for Next.js |
| Plugin System | MEDIUM | Architecture principles established, implementation varies |
| Maps Integration | HIGH | Google Maps API well-documented, patterns clear |
| SEO Architecture | HIGH | Next.js metadata API + JSON-LD patterns well-established |
| Build Order | MEDIUM | Recommended sequence, actual may vary by team velocity |
