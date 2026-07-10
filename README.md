# MBST / Zara Challenge — Mobile Catalog

Smartphone catalog (list, detail, cart) built with React 19 + TypeScript + Vite.

## Requirements

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) ≥ 10 (`npm install -g pnpm`)

## Setup

```bash
pnpm install
pnpm dev
```

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm dev`           | Start dev server (localhost:5173)  |
| `pnpm build`         | Type-check + production build      |
| `pnpm preview`       | Preview production build locally   |
| `pnpm lint`          | ESLint (zero warnings)             |
| `pnpm lint:fix`      | ESLint with auto-fix               |
| `pnpm format`        | Prettier (write)                   |
| `pnpm format:check`  | Prettier (check only)              |
| `pnpm test`          | Run Vitest test suite              |
| `pnpm test:watch`    | Vitest in watch mode               |

## Environment

This repository includes a ready-to-use `.env` for reviewer convenience:

```
VITE_API_BASE_URL=https://prueba-tecnica-api-tienda-moviles.onrender.com
VITE_API_KEY=87909682e6cd74208f41a6ef39fe4191
```

The API key is sent as the `x-api-key` header on every request. Because Vite embeds
`VITE_` values in the client bundle, a normal project should commit only
`.env.example` and keep real `.env` files out of git. This challenge uses a public
API key, so the tracked `.env` avoids extra setup for reviewers.

## Stack

- **Vite 8** + **React 19** + **TypeScript 6**
- **React Router v6** for client-side routing
- **Context API + pure cartReducer** for cart state
- **CSS Modules + CSS custom properties** for styling
- **Vitest + Testing Library** for unit/integration tests
- **ESLint + Prettier + Husky** for code quality (pre-commit hook runs `lint-staged`)

## Project structure

```
src/
├── api/          # Typed API client + domain types
├── features/     # Feature slices (catalog, detail, cart)
├── shared/       # Layout, Navbar, reusable primitives
└── styles/       # Global reset + CSS design tokens
```

See `docs/PLAN.md` for architecture decisions and `docs/TASKS.md` for the task board.
