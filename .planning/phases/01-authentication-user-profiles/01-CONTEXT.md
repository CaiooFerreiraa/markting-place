# Phase 1: Authentication & User Profiles - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can register, authenticate, and manage their roles as Buyer, Seller, or Admin. Includes login/logout, email verification, password reset, and role-based dashboard access. This phase does NOT include store creation (Phase 2) or product management.
</domain>

<decisions>
## Implementation Decisions

### Login/Register Flow
- Separate pages for login and registration (not combined form)
- Google login + Email/Password from the start
- Role selection happens AFTER registration (in profile settings)
- Users redirected to home page after login

### Error Responses
- Generic error messages (e.g., "Invalid credentials" not "Wrong password") - more secure
- Toast notifications for error display (not inline field errors)
- Validation feedback via toast

### Session Handling
- Short sessions: 24 hours
- No "Remember me" option - sessions only
- Use NextAuth's default token management
- Header button for logout on all authenticated pages

### Dashboard Access
- Separate URLs per role: /admin, /seller, /buyer
- Admin accounts created manually in database only (not self-registration)
- Simple upgrade path: user clicks to become seller, then completes store details later

</decisions>

<specifics>
## Specific Ideas

- "Quero que o login seja simples, como Mercado Livre"
- "Erros genéricos são mais seguros"
- "Dashboard separado por role faz sentido"

</specifics>

<deferred>
## Deferred Ideas

- Full seller onboarding with store details - Phase 2
- Profile editing (name, avatar) - Phase 1 PROF-05 (implicit)
- Password reset flow details - covered by AUTH-03 but not discussed in depth

</deferred>

---

*Phase: 01-authentication-user-profiles*
*Context gathered: 2026-03-03*
