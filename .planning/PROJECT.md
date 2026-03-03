# Marketplace VDC

## What This Is

Plataforma de marketplace para lojas físicas, permitindo que comerciantes cadastrem produtos e vendam tanto no atacado quanto no varejo. Similar ao Mercado Livre, mas focado em lojas físicas da região, com suporte a plugin-play para integrações com outros sistemas.

## Core Value

Conectar lojas físicas a clientes locais através de uma plataforma digital que oferece gestão completa de produtos, múltiplas opções de entrega (delivery ou retirada na loja), e integração com mapas para finder de lojas.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Sistema de autenticação (NextAuth.js)
- [ ] Perfis: Administrador, Vendedor, Comprador
- [ ] Cadastro de lojas com dados completos (endereço, contato, horários)
- [ ] Cadastro ilimitado de produtos por loja
- [ ] Sistema de categorias e filtros
- [ ] Busca com otimização SEO
- [ ] Sistema de promoções
- [ ] Checkout com opção de entrega ou retirada na loja
- [ ] Integração com mapas para encontrar lojas
- [ ] Rotas de entrega/waze/google maps
- [ ] Modelo de cobrança: mensalidade ou taxa por transação
- [ ] Modo atacado e varejo por produto

### Out of Scope

- [Chat em tempo real] — Complexidade alta, não的核心
- [Sistema de mensagens entre usuários] — Pode ser adicionado em versão futura
- [App mobile nativo] — Web PWA 우선

## Context

- **Público-alvo**: Lojas físicas regionais e consumidores locais
- **Diferencial**: Plugin-play para integrações, foco em retirada na loja com mapa
- **Modelo de negócio**: Taxa mensal ou por transação

## Constraints

- **Framework**: Next.js (Astro opcional se necessário)
- **Estilização**: Tailwind.css + shadcn/ui
- **Arquitetura**: Clean Architecture para backend
- **Linguagem**: TypeScript
- **Autenticação**: NextAuth.js

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js como framework | Suporte SSR para SEO, integração nativa com NextAuth | — Pending |
| shadcn/ui para componentes | Design system consistente, customizável | — Pending |
| Tailwind.css | Flexibilidade, performance | — Pending |
| Clean Architecture | Manutenibilidade, testabilidade | — Pending |
| Modo YOLO de desenvolvimento | Execução rápida com auto-aprovação | — Pending |

---

*Last updated: 2026-03-03 after initialization*
