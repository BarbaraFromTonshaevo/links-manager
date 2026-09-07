# 🔗 Link Manager

A small SPA for saving, organizing and revisiting your favorite links — with categories, favorites and click-popularity tracking. Built while studying a Stepik course on Vue 3 + Supabase, then extended as a portfolio piece.

**Live demo:** https://links-manager-mauve.vercel.app/

> Sign up with any email or use the "GitHub" button to sign in with OAuth.

## Features

- **Authentication** — email/password sign up & sign in, GitHub OAuth, "forgot password" flow with email reset, all backed by Supabase Auth
- **Protected routes** — Vue Router navigation guards redirect unauthenticated users to `/auth` and keep authenticated users out of it
- **Link CRUD** — add, edit and delete links with a name, URL, description and category; a favicon preview is fetched automatically from the link's domain
- **Categories** — create and delete custom categories to group links
- **Favorites & popularity** — mark links as favorite, and every click through a link is counted so you can sort by "most opened"
- **Filtering & pagination** — filter by favorites only / sort by popularity, with "load more" pagination on top of Supabase's range queries
- **Form validation** — schema-based validation with Zod through `@primevue/forms`
- **Toast feedback** — success/error notifications for every action

## Tech stack

| Layer       | Choice                                                            |
| ----------- | ------------------------------------------------------------------ |
| Framework   | [Vue 3](https://vuejs.org/) (`<script setup>`, Composition API)    |
| Build tool  | [Vite](https://vite.dev/)                                          |
| State       | [Pinia](https://pinia.vuejs.org/)                                  |
| Routing     | [Vue Router 4](https://router.vuejs.org/)                          |
| UI kit      | [PrimeVue 4](https://primevue.org/) + [Tailwind CSS 4](https://tailwindcss.com/) (`tailwindcss-primeui`) |
| Validation  | [Zod](https://zod.dev/) via `@primevue/forms`                      |
| Backend     | [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security) |
| Deployment  | [Vercel](https://vercel.com/)                                      |

## Project structure

```
src/
├── components/
│   ├── AuthForm/        # login / registration / password reset forms
│   ├── Modals/          # create/edit link & category dialogs
│   ├── CardLink.vue     # single link card (favorite, copy, edit, delete)
│   ├── TheFilters.vue   # favorites / popularity filters
│   └── TheHeader.vue    # top navbar
├── composables/
│   ├── useAuth.js             # sign up / in / out, password reset, GitHub OAuth
│   ├── useRequest.js          # shared loading/error state for async calls
│   └── useToastNotifications.js
├── stores/
│   ├── linksStore.js    # links list, pagination, filters
│   └── userStore.js     # current authenticated user
├── router/               # route definitions + auth guard
└── supabase.js           # Supabase client instance
```

## Getting started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- A [Supabase](https://supabase.com/) project

### 1. Clone & install

```sh
git clone https://github.com/<your-username>/links-manager.git
cd links-manager
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key (**Project Settings → API**):

```sh
cp .env.example .env
```

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_KEY=your-supabase-anon-key
```

### 3. Set up the database

Create the following tables in your Supabase project (SQL editor or table editor), and enable **Row Level Security** on each one so users can only read/write their own data:

- **`users`** — `id` (uuid, references `auth.users`), `firstname`, `email`
- **`categories`** — `id`, `name`
- **`links`** — `id`, `name`, `url`, `description`, `category` (references `categories.id`), `is_favorite`, `click_count`, `preview_image`, `user_id` (references `auth.users`), `created_at`

For GitHub OAuth and password-reset emails to work, configure the provider and redirect URLs under **Authentication → URL Configuration** in the Supabase dashboard.

### 4. Run the app

```sh
npm run dev       # start the dev server
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint       # lint & auto-fix
npm run format     # format with Prettier
```

## Possible improvements

Ideas for taking this further:

- [ ] Search links by name, and filter by category (not just favorites)
- [ ] Cover `useAuth` and the Pinia stores with unit tests (Vitest)
- [ ] Dark mode toggle (PrimeVue + Tailwind already support it)
- [ ] Migrate to TypeScript

## License

This is a personal learning/portfolio project, based on a Stepik course, without a specified license.
