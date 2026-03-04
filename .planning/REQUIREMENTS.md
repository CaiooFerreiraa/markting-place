# Requirements: Marketplace VDC

**Defined:** 2026-03-03
**Core Value:** Conectar lojas físicas a clientes locais através de uma plataforma digital que oferece gestão completa de produtos, múltiplas opções de entrega (delivery ou retirada na loja), e integração com mapas para finder de lojas.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can log out from any page

### User Profiles

- [x] **PROF-01**: User can register as Buyer
- [x] **PROF-02**: User can register as Seller (with store info)
- [x] **PROF-03**: Admin can access admin dashboard
- [x] **PROF-04**: Seller can manage own store profile
- [x] **PROF-05**: Buyer can view and edit own profile

### Store Management

- [x] **STOR-01**: Seller can create store with name, description, address
- [ ] **STOR-02**: Seller can add store contact information (phone, email)
- [ ] **STOR-03**: Seller can set store operating hours
- [x] **STOR-04**: Store address is geocoded for map display
- [x] **STOR-05**: Store can be found via map locator

### Product Catalog

- [x] **PROD-01**: Seller can create products with name, description, price
- [x] **PROD-02**: Seller can upload product images
- [x] **PROD-03**: Seller can set product category
- [x] **PROD-04**: Seller can set product stock quantity
- [x] **PROD-05**: Product can have wholesale (atacado) price tier
- [x] **PROD-06**: Product can have retail (varejo) price
- [x] **PROD-07**: Seller can edit own products
- [x] **PROD-08**: Seller can delete own products
- [x] **PROD-09**: Products display on store page

### Categories & Filters

- [x] **FILT-01**: Products can be filtered by category
- [x] **FILT-02**: Products can be filtered by price range
- [x] **FILT-03**: Products can be filtered by product type
- [x] **FILT-04**: Products can be sorted by price
- [x] **FILT-05**: Products can be sorted by popularity
- [ ] **FILT-06**: Home page displays trending/popular items

### Search & SEO

- [x] **SEAR-01**: Users can search products by name
- [x] **SEAR-02**: Search results are SEO-friendly URLs
- [x] **SEAR-03**: Each product page has unique meta tags
- [x] **SEAR-04**: Sitemap is auto-generated
- [x] **SEAR-05**: Structured data (JSON-LD) for products

### Promotions

- [ ] **PROM-01**: Seller can create discount promotions
- [ ] **PROM-02**: Promotions have start and end dates
- [ ] **PROM-03**: Promotions display on product pages
- [ ] **PROM-04**: Promotions tab shows active deals

### Checkout & Delivery

- [x] **CHEC-01**: Buyer can add products to cart
- [ ] **CHEC-02**: Buyer can view cart
- [ ] **CHEC-03**: Buyer can select delivery or pickup at store
- [ ] **CHEC-04**: If pickup selected, store map is displayed
- [ ] **CHEC-05**: Buyer can generate route to store (Waze/Google Maps)
- [ ] **CHEC-06**: Buyer can initiate navigation to store
- [ ] **CHEC-07**: Delivery address can be entered
- [x] **CHEC-08**: Order is created with delivery or pickup status

### Payments

- [x] **PAYM-01**: Platform supports transaction fee model
- [x] **PAYM-02**: Platform supports monthly subscription model
- [x] **PAYM-03**: Seller can choose payment model
- [ ] **PAYM-04**: Checkout integrates payment processor
- [ ] **PAYM-05**: Order payment status is tracked

### Plugin System (Generic Supply)

- [ ] **PLUG-01**: System has plugin registry
- [ ] **PLUG-02**: Plugins can be dynamically loaded
- [ ] **PLUG-03**: Payment gateway integrations are pluggable
- [ ] **PLUG-04**: Shipping carrier integrations are pluggable
- [ ] **PLUG-05**: System emits events for plugin hooks

## v2 Requirements

### Notifications

- **NOTF-01**: User receives in-app notifications
- **NOTF-02**: User receives email for order updates
- **NOTF-03**: Seller receives email for new orders

### Reviews

- **REVI-01**: Buyer can rate completed orders
- **REVI-02**: Buyer can write review for seller
- **REVI-03**: Reviews display on store page

### Analytics

- **ANLY-01**: Seller can view sales dashboard
- **ANLY-02**: Seller can view product performance
- **ANLY-03**: Admin can view platform metrics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | Complexidade alta, não core |
| Sistema de mensagens entre usuários | Pode ser adicionado em versão futura |
| App mobile nativo | Web PWA 우선 |
| Leilões/auctions | Modelo de negócio diferente |
| Marketplace multi-país | Foco local inicialmente |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| PROF-01 | Phase 1 | Complete |
| PROF-02 | Phase 1 | Complete |
| PROF-03 | Phase 1 | Complete |
| PROF-04 | Phase 1 | Complete |
| PROF-05 | Phase 1 | Complete |
| STOR-01 | Phase 2 | Complete |
| STOR-02 | Phase 2 | Pending |
| STOR-03 | Phase 2 | Pending |
| STOR-04 | Phase 2 | Complete |
| STOR-05 | Phase 2 | Complete |
| PROD-01 | Phase 2 | Complete |
| PROD-02 | Phase 2 | Complete |
| PROD-03 | Phase 2 | Complete |
| PROD-04 | Phase 2 | Complete |
| PROD-05 | Phase 2 | Complete |
| PROD-06 | Phase 2 | Complete |
| PROD-07 | Phase 2 | Complete |
| PROD-08 | Phase 2 | Complete |
| PROD-09 | Phase 2 | Complete |
| FILT-01 | Phase 3 | Complete |
| FILT-02 | Phase 3 | Complete |
| FILT-03 | Phase 3 | Complete |
| FILT-04 | Phase 3 | Complete |
| FILT-05 | Phase 3 | Complete |
| FILT-06 | Phase 3 | Pending |
| SEAR-01 | Phase 3 | Complete |
| SEAR-02 | Phase 3 | Complete |
| SEAR-03 | Phase 3 | Complete |
| SEAR-04 | Phase 3 | Complete |
| SEAR-05 | Phase 3 | Complete |
| CHEC-01 | Phase 4 | Complete |
| CHEC-02 | Phase 4 | Pending |
| CHEC-03 | Phase 4 | Pending |
| CHEC-04 | Phase 4 | Pending |
| CHEC-05 | Phase 4 | Pending |
| CHEC-06 | Phase 4 | Pending |
| CHEC-07 | Phase 4 | Pending |
| CHEC-08 | Phase 4 | Complete |
| PAYM-01 | Phase 5 | Complete |
| PAYM-02 | Phase 5 | Complete |
| PAYM-03 | Phase 5 | Complete |
| PAYM-04 | Phase 5 | Pending |
| PAYM-05 | Phase 5 | Pending |
| PROM-01 | Phase 6 | Pending |
| PROM-02 | Phase 6 | Pending |
| PROM-03 | Phase 6 | Pending |
| PROM-04 | Phase 6 | Pending |
| PLUG-01 | Phase 6 | Pending |
| PLUG-02 | Phase 6 | Pending |
| PLUG-03 | Phase 6 | Pending |
| PLUG-04 | Phase 6 | Pending |
| PLUG-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0 ✓

---

*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after initial definition*
