# Link Manager

**English** | [Русский](README.ru.md)

A single-page app for saving, organizing and revisiting links, built with Vue 3, Pinia, PrimeVue and Supabase. The UI is in Russian.

> 🎓 **Training project** · Stepik course on Vue 3 + Pinia + Supabase · November 2025. I started it while studying the course and then extended it as a portfolio piece; the unit tests and CI were added in September 2026.

**Live demo:** https://links-manager-mauve.vercel.app/

[![CI](https://github.com/BarbaraFromTonshaevo/links-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/BarbaraFromTonshaevo/links-manager/actions/workflows/ci.yml) ![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vuedotjs&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white) ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)

<p>
  <img src="./screenshots/auth-desktop.webp" alt="Sign-in form on desktop, 1440 px" width="68%">
  <img src="./screenshots/auth-mobile.webp" alt="Sign-in form on mobile, 390 px" width="24%">
</p>

Sign up with any email or use the GitHub button to sign in with OAuth.

## Highlights

- **The route guard waits for the real session.** [stores/userStore.js](src/stores/userStore.js) exposes an `authReady` promise that resolves on the first `onAuthStateChange` event, and the router awaits it, so a reload on a protected page doesn't bounce to `/auth` while Supabase restores the session.
- **One wrapper for request state.** [composables/useRequest.js](src/composables/useRequest.js) handles `loading` and the error message for any async call; every method in `useAuth` goes through it.
- **Pagination and sorting on the database side.** The links store uses Supabase range queries with `count: 'exact'` and orders by `click_count` or `created_at`, so only one page of 6 links is loaded at a time.
- **Access control through Row Level Security.** The anon key lives in the frontend, and every table is protected by RLS policies so users only see their own data.
- **Tests and CI.** Vitest covers `useRequest`, `useAuth`, `userStore` and `linksStore` with a mocked Supabase client; GitHub Actions runs lint, tests and build on every push and pull request to `main`.

## Features

- Sign up and sign in with email and password, GitHub OAuth, password reset by email.
- Protected routes: unauthenticated users are redirected to `/auth`, authenticated users are kept out of it.
- Add, edit and delete links with a name, URL, description and category; the site's favicon is shown as a preview.
- Create and delete custom categories.
- Mark links as favorites, copy a link to the clipboard; every click through a link is counted.
- Filter by favorites, sort by popularity, "Show more" pagination.
- Form validation with Zod through `@primevue/forms`.
- Toast notifications for every action.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Vue 3 (`<script setup>`, Composition API), Vite |
| State | Pinia (setup stores) |
| Routing | Vue Router 4 |
| UI | PrimeVue 4, Tailwind CSS 4 (`tailwindcss-primeui`) |
| Validation | Zod via `@primevue/forms` |
| Backend | Supabase (Postgres, Auth, Row Level Security) |
| Testing | Vitest, jsdom |
| Code quality | ESLint, Prettier, GitHub Actions |
| Hosting | Vercel |

## Architecture

```
Supabase Auth ──► stores/userStore.js ──► router guard ──► views/AuthView, views/HomeView
                  (user, authReady)

Supabase DB ────► stores/linksStore.js ──► views/HomeView ──► components/CardLink.vue
                  (links, filters, page)
            ◄──── components/Modals/  (categories, create / edit link)
```

1. [supabase.js](src/supabase.js) creates a single Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`.
2. [stores/userStore.js](src/stores/userStore.js) subscribes to `onAuthStateChange` and keeps the current user.
3. [router/index.js](src/router/index.js) awaits `authReady` in `beforeEach` and redirects by `meta.requiresAuth`.
4. [composables/useAuth.js](src/composables/useAuth.js) wraps all Supabase Auth calls in `handleRequest` from `useRequest`.
5. [stores/linksStore.js](src/stores/linksStore.js) loads links page by page with the current filters and updates favorites, clicks and deletions.
6. The modals in [components/Modals/](src/components/Modals/) read and write categories and links directly through the Supabase client.

### Key decisions

- **A deferred promise for auth readiness.** `onAuthStateChange` is a subscription, not a request, so the store saves the promise's `resolve` and calls it from the callback. `isReady` separates "not known yet" from "no session".
- **Favicons instead of stored images.** The preview is a Google favicon service URL built from the link's hostname, so nothing has to be uploaded.

## Project structure

```
src/
├── components/
│   ├── AuthForm/        # login, registration, password reset and new password forms
│   ├── Modals/          # create/edit link and categories dialogs
│   ├── CardLink.vue     # link card: favorite, copy, edit, delete
│   ├── TheFilters.vue   # favorites / popularity filters
│   └── TheHeader.vue    # top navbar
├── composables/
│   ├── useAuth.js             # sign up / in / out, password reset, GitHub OAuth
│   ├── useRequest.js          # shared loading and error state for async calls
│   └── useToastNotifications.js
├── stores/
│   ├── linksStore.js    # links list, pagination, filters
│   └── userStore.js     # current user, authReady
├── router/              # routes and the auth guard
├── views/               # AuthView, HomeView, ResetPassword
└── supabase.js          # Supabase client
```

Tests sit next to the code as `*.test.js`.

## Getting started

Requires Node.js `^20.19.0` or `>=22.12.0` and a [Supabase](https://supabase.com/) project.

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # production build
npm run preview      # preview the production build
npm run lint         # ESLint with auto-fix
npm run format       # Prettier
npm run test         # Vitest in watch mode
npm run test:ci      # Vitest, single run
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | — | Supabase project URL (Project Settings → API) |
| `VITE_SUPABASE_KEY` | — | Supabase anon key; safe in the frontend only with RLS enabled |

The database needs three tables, each with Row Level Security enabled:

- `users` — `id` (uuid, references `auth.users`), `firstname`, `email`
- `categories` — `id`, `name`
- `links` — `id`, `name`, `url`, `description`, `category` (references `categories.id`), `is_favorite`, `click_count`, `preview_image`, `user_id` (references `auth.users`), `created_at`

For GitHub OAuth and password reset emails, configure the provider and the redirect URLs under Authentication → URL Configuration in the Supabase dashboard.

## Deployment

Deployed on Vercel as a static Vite build; the Supabase variables are set in the Vercel project.

## Known limitations

- **No SPA fallback on Vercel.** Opening `/auth` or `/reset-password` directly returns 404, and that includes the link from the password reset email.
- **The click counter is not atomic.** The client reads `click_count` and writes back `+1`, so clicks from two tabs at once can be lost.
- **Loading errors are silent.** `fetchLinks` only logs errors to the console, and it reads `data.length` before checking `error`.
- **The auth subscription is never unsubscribed** (a TODO in `userStore`); during HMR this can leave duplicate subscriptions.
- **The `users` insert on sign-up is not checked for errors.**

## What I'd improve

- **Search by name and a category filter**, not only favorites.
- **An atomic click counter** through a Postgres function called with `rpc`.
- **Tests for the components**; `useAuth`, `useRequest`, `userStore` and `linksStore` are already covered.
- **Dark mode**: PrimeVue and Tailwind already support it.
- **TypeScript.**
