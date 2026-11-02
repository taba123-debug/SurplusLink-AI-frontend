# Sea Serve Frontend Architecture

This project is a React + TypeScript application. The frontend is organized by
business feature, with application bootstrapping and shared infrastructure kept
outside feature code.

## Source layout

```text
src/
├── app/                  # App bootstrap, routing, layouts and providers
├── features/             # Business domains and user-facing workflows
│   └── <feature>/
│       ├── api/          # Feature API methods
│       ├── components/   # Components used only by this feature
│       ├── hooks/        # React Query hooks and feature behavior
│       ├── pages/        # Route-level composition only
│       ├── schemas.ts    # Form and input validation
│       └── types.ts      # Feature-only types
├── shared/               # Reusable UI and utilities with no domain ownership
│   ├── components/
│   ├── hooks/
│   └── lib/
├── infrastructure/      # HTTP, API provider selection and external services
├── stores/               # Client-only state; server state belongs to Query
├── types/                # Cross-feature domain types
└── test/                 # Test setup and cross-feature tests
```

The existing `components`, `lib`, `services` and `store` folders remain as
compatibility locations while features are migrated. New code should use the
target locations above.

## Dependency direction

```text
app → features → infrastructure
app → shared
features → shared
features → infrastructure/api
infrastructure ✕ features
shared ✕ features
```

Pages must not call Axios, access localStorage, or implement API mapping.
Feature hooks own queries and mutations. API adapters own transport and DTO
mapping. React Query owns server state; Zustand owns only session/UI state.

## Page/component rules

- Use one component per file and PascalCase filenames for React components.
- A page composes layout, hooks and feature components; it should not contain
  transport code or large data transformations.
- Reusable UI belongs in `shared/components`; feature UI stays in its feature.
- Use explicit props interfaces and typed domain values. Avoid `any`.
- Use `@/` imports for cross-folder imports and relative imports only within a
  feature subtree.
- Keep loading, empty, error and success states visible in every data page.
- Forms use React Hook Form plus Zod schemas.
- Money stays in integer minor units and is formatted only at the UI edge.

## Query conventions

Every query uses a centralized key factory and includes the active organization
when the result is organization-scoped. Mutations invalidate only the affected
keys instead of invalidating the entire cache.

## Migration order

1. Shared query keys and feature hooks.
2. Marketplace, inventory, requirements, offers and deals pages.
3. Split the HTTP adapter into feature API modules.
4. Move demo identity into a session store and remove demo naming from the
   production-facing abstractions.
5. Add route guards, generated API contracts and feature-local tests.
