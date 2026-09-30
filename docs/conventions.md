# Conventions

## Language and internationalization

- Write all source code, identifiers, comments, documentation, commit messages, and agent instructions in English.
- Do not hard-code user-facing labels, messages, validation feedback, or other translatable text in components.
- User-facing text must be provided through the project's internationalization layer, using the locales configured for the application.
- Locale-specific content is the only exception to the English-only source-code rule.

## Exports

- Use named exports for components, helpers, utilities, hooks, schemas, types, and all other application modules.
- Do not use `export default` unless a framework, library, or tool explicitly requires it.
- Next.js pages and layouts use `export default` because the App Router requires a default export.
- Configuration files may use `export default` when required by their consuming tool.

## React components

These rules apply to every user-authored React component, whether it is global, route-specific, or nested inside another component.

- Use a PascalCase directory name for every component.
- Use `index.tsx` as the component's entry file.
- Add a `types.ts` file next to every component's `index.tsx`.
- Shared components belong in `src/components/<ComponentName>/`.
- Route-specific components belong in `src/app/<route>/components/<ComponentName>/`.
- Components used only by another component belong in `components/` inside the parent component directory.
- Define a props type for every component, including components that do not receive props.
- Name every component props type using the `<ComponentName>Props` pattern. For example, `OverviewCard` uses `OverviewCardProps`.
- Wrap every props type with `Readonly` to prevent direct reassignment of top-level props.
- Do not use `DeepReadonly` as a general props convention.
- Accept props through a single `props` function parameter. Do not destructure props in the function signature.
- Destructure only the props used by the component inside the function body.
- When a component does not use props, add `void props;` inside its function body.

```tsx
type OverviewCardProps = Readonly<{
  title: string;
}>;

export function OverviewCard(props: OverviewCardProps) {
  const { title } = props;

  return <section>{title}</section>;
}

type AppLogoProps = Readonly<Record<string, never>>;

export function AppLogo(props: AppLogoProps) {
  void props;

  return <svg aria-hidden="true" />;
}
```

Example shared component:

```text
src/components/Button/
├── index.tsx
└── types.ts
```

The `page.tsx` filename is the only exception to the `index.tsx` entry-file rule because Next.js requires it. Every page must still have a sibling `types.ts` and may have local `components/`, `hooks/`, `schema/`, and `action.ts` files.

## Next.js pages

- Name every exported page component with the `Page` suffix.
- For example, the page component for `Home` must be named `HomePage` even though its required Next.js file is `page.tsx`.
- Name every page props type using the `<PageComponentName>Props` pattern. For example, `HomePage` uses `HomePageProps`.
- Pages follow the same props parameter and internal-destructuring rules as React components.

## Next.js layouts

- Name every exported layout component with the `Layout` suffix.
- For example, the root layout component must be named `RootLayout` even though its required Next.js file is `layout.tsx`.
- Name every layout props type using the `<LayoutComponentName>Props` pattern. For example, `RootLayout` uses `RootLayoutProps`.
- Layouts follow the same props parameter and internal-destructuring rules as React components.

## Hooks and schemas

- Component-specific hooks belong in `hooks/` inside the component directory.
- Route-specific hooks belong in `hooks/` inside the route directory.
- Shared hooks belong in `src/hooks/`.
- Name hook files using the `useHookName.ts` convention.
- Component-specific Zod schemas belong in `schema/` inside the component directory.
- Route-specific Zod schemas belong in `schema/` inside the route directory.
- Name schema files with the `.schema.ts` suffix.

## React Context

- Implement every React Context provider as a PascalCase React component with `index.tsx` and `types.ts`.
- Name provider directories after the provider, such as `AuthProvider/`.
- Export the provider and its consumer hook from the provider's `index.tsx` file.
- Use Context for shared client-side interface state, session state, or application settings.
- Keep server-fetched data in Server Components and Server Actions instead of using Context as a global data cache.

## Server Actions

- Define React Server Actions in `action.ts`.
- Add `'use server';` at the top of every `action.ts` file.
- An action used exclusively by a page belongs in `action.ts` next to that page's `page.tsx`.
- An action used exclusively by a component belongs in `action.ts` next to that component's `index.tsx`.
- Place a shared action in the narrowest shared scope that needs it, following the file placement rules in [Architecture](architecture.md#file-placement).
