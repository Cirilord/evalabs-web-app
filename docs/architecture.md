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
│   │       │   └── useUser.ts
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
│   │   └── useDashboard.ts
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
│   └── useOverviewCard.ts
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
- `src/helpers`: helper functions containing presentation or domain rules.
- `src/utils`: small, pure, generic utility functions.

Create these directories only when they contain code. Do not add empty directories.

## File placement

Before creating or moving a file, choose the narrowest scope that needs it:

1. One component: place it in that component directory.
2. One route: place it in that route directory.
3. More than one route: place it in the matching global `src` directory.
