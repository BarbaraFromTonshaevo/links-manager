# CLAUDE.md

Guidance for Claude Code sessions in this repo. For features, stack and architecture, see [README.md](README.md).

## Testing (Vitest)

- Tests sit next to the source file as `*.test.js`.
- `npm run test` — watch mode, for local development. `npm run test:ci` — single run, what CI uses (`npm run test` would hang in CI, it never exits on its own).
- **`vi.mock` hoisting gotcha.** `vi.mock('@/supabase', factory)` is hoisted above imports, and the factory runs immediately when the mocked module is imported — *before* any other top-level code in the test file executes. Referencing an outer variable directly inside the factory's returned object (`from: mockQuery.from`) throws `ReferenceError: Cannot access '...' before initialization`, even if the variable is declared earlier in the file and even with a `mock`-prefixed name. Fix: wrap the reference in a lazy function that only runs later, when the mocked method is actually called (`from: vi.fn(() => mockQuery)`), not one evaluated at factory-execution time.
- **Reusable chainable mock for the Supabase query builder** (`.from().select().eq()...`, used by `linksStore`): one object where every method returns itself, plus a `then` so the whole thing is awaitable:
  ```js
  let mockResult = { error: null }
  const mockQuery = {
    select: vi.fn(() => mockQuery),
    eq: vi.fn(() => mockQuery),
    // ...every chain method the real code calls
    then: (resolve) => resolve(mockResult),
  }
  vi.mock('@/supabase', () => ({
    supabase: { from: vi.fn(() => mockQuery) },
  }))
  ```
  Reassign `mockResult` per test instead of reconfiguring the mock itself.
- `// @vitest-environment jsdom` as the very first line of a test file only where the code under test touches `window` (e.g. `resetPassword`'s `window.location.origin`) — not globally, so the rest of the suite stays fast in Node's default environment.
- Pinia stores used outside a component (including in tests) need an active Pinia: `setActivePinia(createPinia())`, a fresh instance per test in `beforeEach`.
- Mock the *real* shape of each Supabase method's response — not a generic `{data, error}` by habit. `signOut` resolves `{error}` only (no `data`); `onAuthStateChange`'s `session` is `null` on `SIGNED_OUT`, not `{user: null}`.
- `linksStore.fetchLinks` swallows errors internally (`catch` + `console.error`, no rethrow) — test it by checking state/`isLoading` after a plain `await`, not with `.rejects.toThrow()`. `useAuth`'s functions do rethrow (via `useRequest`'s `handleRequest`), so `.rejects.toThrow()` is correct there.

## Git workflow

- `main` is protected: PR required, status checks (`lint`, `test`, `build`) must pass before merging. No required approvals (solo project — the author can't approve their own PR).
- One branch per task: `test/<scope>`, `fix/<scope>`, `feat/<scope>`, `docs/<scope>`.
- Commit messages: `type [scope]: description` (e.g. `test [useAuth]: add signOut test`).
- Merge via "Squash and merge"; branches auto-delete after merge.

## Known limitations

Tracked in README.md and README.ru.md under "Known limitations" — keep both in sync, and remove an item from both when it's fixed.
