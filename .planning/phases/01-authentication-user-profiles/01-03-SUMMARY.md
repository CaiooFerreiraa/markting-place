---
phase: 01-authentication-user-profiles
plan: "03"
subsystem: Authentication & Profiles
tags: [profile, roles, buyer, seller, admin]
requires: ["01-02"]
provides: ["PROF-01", "PROF-02", "PROF-03", "PROF-04", "PROF-05"]
affects: ["middleware", "auth", "navigation"]
tech-stack: ["Next.js", "NextAuth v5", "Prisma", "React Hook Form", "Zod", "lucide-react", "shadcn/ui"]
key-files:
  - src/app/api/profile/route.ts
  - src/app/api/profile/upgrade-to-seller/route.ts
  - src/app/(dashboard)/buyer/profile/page.tsx
  - src/app/(dashboard)/seller/dashboard/page.tsx
  - src/app/(dashboard)/seller/profile/page.tsx
  - src/app/(dashboard)/admin/dashboard/page.tsx
decisions:
  - Reused same profile update API for both Buyers and Sellers (conditional storeName update)
  - Simplified role upgrade by only updating role in DB (full store setup deferred to Phase 2)
metrics:
  duration: 45 min
  completed_date: 2026-03-04
---

# Phase 01 Plan 03: User Profiles and Roles Summary

Implementação completa dos perfis de usuário e dashboards baseados em função (Buyer, Seller, Admin).

## Summary

- **Profile Management**: Criado endpoint `/api/profile` para GET/PATCH de dados do usuário (nome para todos, storeName para vendedores).
- **Buyer Experience**: Implementada página de perfil em `/buyer/profile` permitindo edição de nome e botão para upgrade de conta.
- **Seller Experience**: Criado dashboard em `/seller/dashboard` com cards de estatísticas (placeholders) e página de perfil específica em `/seller/profile` para gerenciar o nome da loja.
- **Admin Dashboard**: Criada página `/admin/dashboard` acessível apenas para usuários com role ADMIN, exibindo contagem total de usuários e lojistas.
- **Role Upgrade**: Implementada funcionalidade de upgrade imediato de BUYER para SELLER via `/api/profile/upgrade-to-seller`.

## Deviations from Plan

- **None**: O plano foi seguido exatamente, implementando todos os caminhos de roteamento e proteção de páginas.

## Decisions Made

- **Unified Profile API**: Optou-se por um único endpoint de perfil que verifica a role do usuário no servidor para permitir ou não a atualização do campo `storeName`.
- **Deferred Store Details**: Conforme decidido no CONTEXT.md, campos detalhados da loja (endereço, horário, etc) foram deixados para a Fase 2, focando agora apenas no nome da loja para validar a funcionalidade de Seller.

## Self-Check: PASSED

1. **Created files exist:**
   - [x] src/app/api/profile/route.ts
   - [x] src/app/api/profile/upgrade-to-seller/route.ts
   - [x] src/app/(dashboard)/buyer/profile/page.tsx
   - [x] src/app/(dashboard)/seller/dashboard/page.tsx
   - [x] src/app/(dashboard)/seller/profile/page.tsx
   - [x] src/app/(dashboard)/admin/dashboard/page.tsx

2. **Commits exist:**
   - [x] 49358da: feat(01-03): create profile update API
   - [x] 9842d15: feat(01-03): create Buyer profile page and form
   - [x] db9bddf: feat(01-03): create Seller upgrade API
   - [x] b3d39c2: feat(01-03): create Seller dashboard and profile
   - [x] 3c8ad85: feat(01-03): create Admin dashboard
