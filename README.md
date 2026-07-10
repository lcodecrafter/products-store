# Products Catalog

A responsive catalog with product detail and a persistent shopping cart,
built for a technical challenge.

## Quick start

### Requirements

- [Node.js](https://nodejs.org/) 20 or later
- [pnpm](https://pnpm.io/) 10 or later (`npm install -g pnpm`)

### Run locally

```bash
pnpm install
pnpm dev
```

Vite starts the application at `http://localhost:5173`.

## Production build

```bash
pnpm build
pnpm preview
```

`pnpm build` type-checks the project and generates an optimized production bundle in
`dist/`. `pnpm preview` serves that bundle locally. Vite provides separate development
and production modes without custom bundler configuration.

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the development server                 |
| `pnpm build`        | Type-check and create a production build     |
| `pnpm preview`      | Serve the production build locally            |
| `pnpm lint`         | Run ESLint with zero allowed warnings         |
| `pnpm lint:fix`     | Run ESLint and apply available fixes          |
| `pnpm format`       | Format files with Prettier                    |
| `pnpm format:check` | Check formatting without writing files        |
| `pnpm test`         | Run the Vitest test suite                     |
| `pnpm test:watch`   | Run Vitest in watch mode                      |

## Environment

The repository includes a ready-to-use `.env` for reviewer convenience.

In a production project, only `.env.example` should be committed and real `.env` files should remain
outside version control.

## Architecture

The application is organized by feature, with one explicit boundary for the external
API. This keeps the codebase direct to navigate without introducing layers that the
scope does not need.

```text
src/
├── api/                 Typed HTTP client and product resource functions
├── features/
│   ├── catalog/         Product grid, search, and product list fetching
│   ├── detail/          Product selection and detail fetching
│   └── cart/            Cart context, reducer, and cart page
├── shared/
│   ├── components/      Layout and reusable UI primitives
│   └── hooks/           Reusable UI hooks
└── styles/              Global reset and CSS design tokens
```

### Key implementation choices

- **External API boundary**: `src/api/` owns request handling, typed responses, and
  API errors. Feature code consumes resource functions instead of calling `fetch`
  directly, which keeps API behavior easy to mock in tests.
- **State ownership**: the cart is the only global, persistent state, so it uses the
  Context API. Its `cartReducer` is pure and independently tested. Catalog and detail
  state stay local to their respective feature hooks.
- **Routing**: React Router maps the catalog (`/`), product detail (`/product/:id`),
  and cart (`/cart`) views.
- **Styling**: CSS Modules keep component styles scoped, while CSS custom properties
  provide shared color, spacing, and typography tokens.
- **Testing**: Vitest and Testing Library cover API behavior, reducers, interaction
  rules, and view-level cart behavior.

## Deliberate trade-offs

The project favors proportionality and readability over dependencies or abstractions
that do not add value for three views and two API endpoints.

| Decision not taken | Reason |
| ------------------ | ------ |
| Redux or Zustand | Context is sufficient for the only global state: the cart. |
| React Query | Caching, invalidation, and background refetching add little value for two simple fetch flows. Feature hooks with `fetch` and `AbortController` keep the behavior visible. |
| Next.js and SSR | SSR is optional for the challenge. The main interactions rely on client state, and Vite keeps the architecture smaller and easier to review. |

## Stack

- Vite 8, React 19, and TypeScript 6
- React Router v6
- Context API and a pure `cartReducer`
- CSS Modules and CSS custom properties
- Vitest and Testing Library
- ESLint, Prettier, Husky, and lint-staged

