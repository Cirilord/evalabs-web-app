# Architecture

This project uses Next.js with the App Router.

## Page structure

- `src/app` contains routes, layouts, pages, loading states, error boundaries, and other App Router files.
- Reserve the `(index)` route group for the application's index page. It keeps the index page separate from the other top-level routes.
- Place all other top-level routes directly inside `src/app`, such as `dashboard`, `configurations`, and `settings`.
- When a page has nested pages, place them in a `(pages)` route group inside the parent page directory.
- Route groups do not affect the URL. For example, `src/app/dashboard/(pages)/user/page.tsx` resolves to `/dashboard/user`.
- Keeping nested pages in `(pages)` prevents them from being mixed with the parent page's local `components`, `hooks`, `schema`, and `action.ts` files.

Example page hierarchy:

```text
src/app/
├── (index)/
│   ├── components/
│   ├── hooks/
│   ├── schema/
│   ├── action.ts
│   ├── page.tsx
│   └── types.ts
├── dashboard/
│   ├── (pages)/
│   │   └── user/
│   │       ├── components/
│   │       │   └── UserProfile/
│   │       │       ├── index.tsx
│   │       │       └── types.ts
│   │       ├── hooks/
│   │       │   └── use-user.ts
│   │       ├── schema/
│   │       │   └── user.schema.ts
│   │       ├── action.ts
│   │       ├── page.tsx
│   │       └── types.ts
│   ├── components/
│   │   └── DashboardHeader/
│   │       ├── index.tsx
│   │       └── types.ts
│   ├── hooks/
│   │   └── use-dashboard.ts
│   ├── schema/
│   │   └── dashboard.schema.ts
│   ├── action.ts
│   ├── page.tsx
│   └── types.ts
├── configurations/
└── settings/
```

Treat every Next.js page as a component. A page keeps the required `page.tsx` filename, but otherwise follows the same co-location rules as React components.

## Component structure

The `components/` directory can exist at three scopes:

- `src/components/`: global components shared by multiple routes or domains.
- `<page>/components/`: components used only by that page.
- `<component>/components/`: components used only by that parent component.

Every user-authored component uses the same internal structure, regardless of whether it is global, page-local, or nested inside another component:

```text
OverviewCard/
├── components/
│   └── Metric/
│       ├── index.tsx
│       └── types.ts
├── hooks/
│   └── use-overview-card.ts
├── schema/
│   └── overview-card.schema.ts
├── action.ts
├── index.tsx
└── types.ts
```

## Context structure

The `contexts/` directory follows the same scope rules as `components/`:

- `src/contexts/`: providers shared by multiple routes or domains.
- `<page>/contexts/`: providers used only by that page and its descendants.
- `<component>/contexts/`: providers used only by that component and its descendants.

Example context provider:

```text
AuthProvider/
├── index.tsx
└── types.ts
```

## Global `src` directories

Treat `src` as the application's global scope.

- `src/components`: components shared by more than one route or domain.
- `src/contexts`: React Context providers shared by more than one route or domain.
- `src/hooks`: hooks shared by the application.
- `src/lib`: integrations, clients, configuration, and reusable infrastructure code.
- `src/services`: application services organized by domain. When a service must run in both environments, place its client and server implementations in separate directories inside that domain.
- `src/helpers`: helper functions containing presentation or domain rules.
- `src/ui`: shadcn UI components shared by the application.
- `src/utils`: small, pure, generic utility functions.

Create these directories only when they contain code. Do not add empty directories.

Example service structure:

```text
src/services/
└── automations/
    ├── client/
    │   └── create-automation.ts
    ├── server/
    │   └── create-automation.ts
    ├── types.ts
    └── utils.ts
```

Every `client/` service module must declare `import 'client-only';` and may import `prisma.client`. Every `server/` service module must declare `import 'server-only';` and may import `prisma.server`. Create the matching server service whenever adding a client service, even when it is not used yet. Keep types directly in the domain directory. Create `shared/` only when the domain has multiple runtime-independent modules, such as mappers or business rules.

Every service function must declare explicit input and return types. Assign the result of a persistence operation to a local variable before returning it.

Place pure utility functions shared by a service domain's client and server implementations in that domain's `utils.ts`. Do not put domain-specific utilities in `src/utils`.

## File placement

Before creating or moving a file, choose the narrowest scope that needs it:

1. One component: place it in that component directory.
2. One route: place it in that route directory.
3. More than one route: place it in the matching global `src` directory.
