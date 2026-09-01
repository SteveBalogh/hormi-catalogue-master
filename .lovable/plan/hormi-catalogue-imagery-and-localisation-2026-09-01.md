# HORMI catalogue imagery and localisation

## Scope
- Preserve the existing design and routes.
- Add six coherent generated category images to category cards with restrained interactions.
- Add a centralized SK/HU/EN translation system, defaulting to Slovak and persisting across navigation.
- Translate public UI, auth/admin UI, validation and route metadata; localize available catalogue data at presentation boundaries.

## Implementation approach
- Introduce a typed locale provider and translation dictionaries, persisted in local storage and synced safely after hydration.
- Add a compact SK | HU | EN selector in the shared header and admin shell.
- Keep existing URLs unchanged to avoid catalogue regressions.
- Generate one cohesive set of product-focused technical category compositions, store them as app assets, and map them by stable category slug.
- Update shared catalogue components and each route to consume translations rather than inline UI copy.
- Preserve database values; map known seeded category/product copy and availability labels through centralized localized catalogue dictionaries, falling back to stored content.

## Validation
- Check every route in each language, desktop and mobile.
- Exercise category links, search, filters, pagination, auth/admin rendering, and image loading.
- Confirm localized metadata and no browser console errors.
