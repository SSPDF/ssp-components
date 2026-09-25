# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@ssplib/react-components` is a published React component library (MUI v5-based) for SSP-DF internal projects. It ships form controls, auth providers, a Leaflet map, tables, modals and navbars. There is **no host application** here — components are developed and previewed exclusively through **Storybook**, and consumed by downstream Next.js apps. The library declares `react ^18`, `next ^14 || ^15 || ^16`, MUI 5 / x-date-pickers 6 or 7, Emotion, `react-hook-form`, `dayjs` and `react-toastify` 10 or 11 as `peerDependencies` (see `lib-package.json`). UI copy and code comments are in Portuguese (pt-BR).

## Commands

```bash
npm run storybook        # dev environment — Storybook on :6006 (primary way to run/preview components)
npm run build            # production build via tsdown -> dist/ (one file per module: ESM .js + CJS .cjs + .d.ts/.d.cts). Needs Node ≥ 22.18 (the full dev suite needs ≥ 22.22.2 or ≥ 24.15, jsdom 30's floor — see `engines`). Runs prebuild (sync-version) first.
npm run dev              # tsc --watch (type-check only; noEmit is on in tsconfig)
npm run api              # json-server mock API on :7171, serving api-test.json (for Fetch* components in stories)
npm run build-storybook  # static Storybook -> storybook-static/
npm run pack:local       # build + pack dist/ into pack/*.tgz exactly as publish would — install that tarball in a consumer app to test (CI also uploads it as a run artifact, `ssplib-react-components-<version>-<head sha>`, on every PR)
```

Storybook stories are the main verification surface — when you change a component, update/add its `*.stories.tsx` and check it renders; the full check suite (typecheck, lint, vitest, visual snapshots, package checks, smoke app) is under **Verification** below. Formatting is Prettier (`.prettierrc`): 4-space tabs, single quotes, **no semicolons**, `printWidth: 200`, JSX single quotes. Match this exactly.

## Architecture

### Two parallel form systems — this is the most important thing to understand

The library has **two incompatible form-context mechanisms**, and components are split between them. Pick the right provider/decorator for the component you touch:

1. **Custom `FormContext`** (`src/context/form.ts`) — provided by `FormProvider` (`src/components/providers/FormProvider.tsx`). It wraps `react-hook-form` but **re-exposes methods under renamed keys**: `formRegister`, `formWatch`, `formSetValue`, `formReset`, `formControl`, `formHandleSubmit`, etc., plus `setFilesUid`/`submiting`. Components consume it via `useContext(FormContext)`. Used by the non-prefixed components: `Input`, `Table`, `CheckBox`, file uploads, etc. `FormProvider` also renders the `<form>` and shows a toast on invalid submit. Its `onSubmit` receives `(data, filesUid)`.

2. **Native react-hook-form context** — provided by `GenericFormProvider` (`src/components/providers/GenericFormProvider.tsx`), which is just RHF's `FormProvider` + `useForm`. Components consume it via the standard `useFormContext()` from `react-hook-form`. Used by the **`Generic*`-prefixed** components: `GenericInput`, `GenericTable`, `GenericFetchAutoComplete`, `GenericMaskInput`, `GenericMultInput`, `GenericDatePicker`. Its `onSubmit` receives `(data)` only.

When adding a story, mirror this split with the matching decorator: `src/decorators/FormBaseDecorator.tsx` (custom context) vs `src/decorators/GenericFormBaseDecorator.tsx` (RHF context). Both wrap the story in `SspComponentsProvider` + a submit button that dumps form data.

### Masked inputs and validation

Field types (`cpf`, `cnpj`, `cpf_cnpj`, `phone`, `cep`, `sei`, `rg`, `email`, `number`) drive both an IMask mask and a length/format validator, declared as lookup tables (`MASK_CONFIGS`, `VALIDATIONS`) inside the Input components and rendered through `MaskInput`/`GenericMaskInput` (`react-imask`). The newer `src/components/form/input/Input.tsx` is the more complete implementation (dynamic phone/cpf_cnpj masks via IMask `dispatch`, full `TextFieldProps` passthrough); follow its patterns over the older sibling components.

### Auth providers

Two providers both feed the shared `AuthContext` (`src/context/auth.ts`) with the `AuthReturnData` shape (`src/types/auth.ts`): `user`, `isAuth`, `userLoaded`, `login`, `logout`, `hasRole`/`hasAnyRole`/`hasAllRoles`, `accessToken`, etc.

- `KeycloakAuthProvider` — AD/Keycloak (`type: 'ad'`), auto token refresh, SSO init.
- `OAuthProvider` — gov.br OIDC (`type: 'govbr'`). Includes a **localhost/test bypass**: on `localhost` (or a configurable `testIP`) it skips the real OIDC flow and logs in with a provided `testToken`.

Only `OAuthProvider` writes the JWT to the `nextauth.token` cookie (`cookieName`, also exported as `AUTH_COOKIE_NAME`), via the internal helper `src/components/utils/cookies.ts` (byte-compatible with the `cookies-next@4` it replaced — don't change the encoding, or existing sessions stop being read). `KeycloakAuthProvider` declares the same `cookieName` but never writes it; its token lives in `keycloak-js`. Both keep the user avatar in `localStorage`.

### Public API & build

`src/index.ts` is the single barrel — **every public component and type must be exported here** or it won't ship. The build is `tsdown` (`tsdown.config.mts`, `unbundle` mode — only what `src/index.ts` and `src/types/{auth,form}.ts` reach is emitted, so stories/decorators/tests stay out without an exclude list); note root `tsconfig.json` has `strict: false`, so type errors do not block the build — be careful, the compiler will not catch much for you.

`SspComponentsProvider` is the top-level app wrapper consumers mount once: it renders the modal portal (`CustomModalProvider` from `src/components/modal/Modal.tsx`, exported as `MODAL`) and the react-toastify `ToastContainer`.

### Versioning & publishing

Version lives in **`lib-package.json`** (the package.json that actually gets published — copied to `dist/package.json`), not the root `package.json`. The `prebuild` hook runs `sync-version.cjs`, which copies `lib-package.json`'s version into the root `package.json`. **To release: bump the version in `lib-package.json`, then push a matching `v*` tag** (e.g. `v0.1.1`). `.github/workflows/publish.yaml` runs on that tag (or a manual `workflow_dispatch`), verifies the tag matches `lib-package.json`, refuses a version already on npm, builds, copies `lib-package.json`→`dist/package.json` and `README.md`/`CHANGELOG.md`→`dist/`, then `npm publish`es from `dist/` under the right dist-tag (a pre-release version goes to `next`, never `latest`). **Pushing to `main` no longer publishes** — that changed in Etapa 0 of the upgrade plan. **Semver since `0.1.0`** (the `0.0.x` line shipped everything, breaking changes included, as patches): while in `0.x`, a breaking change bumps the minor. Every release gets an entry in `CHANGELOG.md`. Release commits are `vX.Y.Z - <description>` (the old `vNNN - …` convention ended at `v0.0.349`); other commits use conventional-commit style (`feat:`, `fix:`, `chore:`…).

## Dependency upgrade (Etapas 0–4 done, Etapa 5 next)

Dependencies are several majors behind (MUI 5→9, Storybook 9→10). **`UPGRADE_PLAN.md` at the repo root is the agreed plan — read it before touching `package.json` or `lib-package.json`.** Etapa 0 (baseline + safety net), Etapa 1 (packaging → `0.1.0`), Etapa 2 (cleanup → `0.2.0`), Etapa 2.1 (`next` peer opened to 15/16 → `0.2.1`) and Etapa 3 (`microbundle` → `tsdown` → `0.3.0`) are done; see their "Registro de execução". Etapa 4 (safe minors/patches) is done: the 4.1 batch shipped as `0.3.1`, Etapa 2.2 (pickers `^6 || ^7`, toastify `^10 || ^11` peers) shipped as `0.3.2`, and the 4.4 dev-tooling majors (eslint 10, vitest 5, jsdom 30, Playwright 1.63) landed without a release. Etapa 5 (Storybook 10) is next. All stages live on a **single branch, `atualizacao-dependencias`** (not merged into `main`, nothing published) — don't create one branch per stage. The build is **`tsdown` in `unbundle` mode, ESM + CJS** (decision D1); it needs Node ≥ 22.18 to build (24 LTS in CI) — a build-time requirement only. Things from these stages that affect everyday work here:

- **MUI, Emotion, `react-hook-form`, `dayjs` and `react-toastify` are peers** — the version that actually runs is the *consumer app's*. Any MUI major bump is a coordinated, breaking release. Peers live in `peerDependencies` **and** `devDependencies` of the root `package.json` (a package missing from both used to get **bundled into `dist/` silently** — how a copy of `@mui/system` ended up there before 0.1.0; `tsdown.config.mts` now fails the build on that via `deps.onlyBundle: []` / `deps.onlyImport`). The root `dependencies` must equal `lib-package.json`'s `dependencies`.
- **Import MUI only from `@mui/material` / `@mui/icons-material` / `@mui/x-date-pickers`**, never `@mui/system` or other undeclared packages. `node scripts/check-externals.mjs` (part of `check:package`) checks every import in `dist/**` against `lib-package.json`.
- **The build can silently produce broken output:** `strict: false` + `noEmit: true` means type errors don't block, and MUI Grid v2 ignores `item`/`xs` without any error. Visual verification through Storybook is mandatory for layout-affecting changes.
- **Published layout: ESM in `.js`, CJS in `.cjs`, no `"type"` field — on purpose.** ESM as `.mjs` breaks Next 14 SSR (webpack applies strict interop inside `.mjs`, and Next's barrel optimization turns `import { useMediaQuery } from '@mui/material'` into a default import of MUI 5's CJS build). So attw keeps flagging `node16 (from ESM)` until Etapa 7 (`check-package.sh` ignores exactly that rule, `unexpected-module-syntax`); don't "fix" it with `.mjs` or `"type": "commonjs"` (publint suggests it — it would make the ESM `.js` files CJS).
- **The root `package.json` must not have `"type": "module"`.** rolldown reads it for the sources and switches to Node-mode interop (`__toESM(x, 1)`), which makes every default import of a CJS module (`import Grid from '@mui/material/Grid'`) resolve to the module object in the CJS output. The smoke app consumes the ESM, so it would not catch this; `check:package` fails on any `__toESM(x, 1)` in `dist/**/*.cjs`.
- **Don't go ESM-only before Etapa 7.** MUI 5 has no `exports` field, so the lib's deep imports (`@mui/material/Grid`, `@mui/icons-material/Save`, `@mui/x-date-pickers/AdapterDayjs`) fail under native Node ESM (`ERR_UNSUPPORTED_DIR_IMPORT`) while CJS `require` resolves them. MUI 7/9 have `exports`.
- **`.babelrc.json` is read by `@storybook/nextjs`** (its presence switches Storybook from SWC to Babel) — it outlived microbundle; don't delete it or the `@babel/preset-*` devDeps before Etapa 5.
- **`DatePicker`, `GenericDatePicker` and `TimePicker` register their validation inside the picker's `inputRef` callback** (`inputRef={() => { context.register(name, { validate }) }}`). It looks odd, but it is load-bearing: that is where required and min/max dates are validated. Don't drop it when migrating the pickers (Etapa 7), and never return anything from a callback ref (React 19 treats the return value as a cleanup). `src/components/form/date/pickers.test.tsx` guards it (UPGRADE_PLAN.md 5.16).
- **Parse formatted dates only through `src/components/utils/dayjs.ts`** (`import dayjs from '../../utils/dayjs'`), never straight from `'dayjs'`. It registers `customParseFormat`; without it `dayjs('15/03/2024', 'DD/MM/YYYY')` ignores the format. x-date-pickers 6 used to register the plugin as an import side effect, which hid the missing registration; 7+ registers it only when the adapter mounts, after the component already parsed, so the first picker on a page lost its `defaultValue` (UPGRADE_PLAN.md 5.17). The devDependencies stay on pickers 6, so vitest can't catch a regression here; the smoke's `verificar-datepicker.cjs` on the pickers-7 run can.
- **Never touch browser APIs (`localStorage`, `window`, `document`) during render** — it breaks SSR in the consumer apps. Read them in `useEffect`, or gate the JSX with `useIsClient()` (`src/components/utils/useIsClient.ts`), as `Table`/`GenericTable` do. `Table.ssr.test.tsx` renders in a `node` environment to catch this.
- **The smoke app's `file:../../dist` link does not install the lib's own `dependencies`** (npm `install-links=false`) and resolves MUI from the repo root. `npm run smoke` does it right: packs `dist/`, installs the tarball in `examples/smoke-app` and runs `next build` (which also SSR-renders the pages). It runs in CI three times: at the peer floor (the smoke app's own `package.json`: Next 14, pickers 6, toastify 10), with `SMOKE_NEXT=16` (**every consumer app is on Next 16**), and with `SMOKE_NEXT=16 SMOKE_PICKERS=7 SMOKE_TOASTIFY=11` (the `copom` combination, top of the other ranges). After `next build` it runs `examples/smoke-app/verificar-datepicker.cjs`, a fresh-process SSR render of a `DatePicker` with `defaultValue`. The `/next-apis` page covers the lib's `next/*` imports (`NavBar`, `Map`).
- **`check:package` now starts with `scripts/check-externals.mjs`**: fails if the bundle (JS or `.d.ts`, recursively) imports an undeclared package, if `src/` imports a package missing from `lib-package.json`, or if a declared dependency is unused. Then `scripts/check-use-client.mjs` checks that every `'use client'` module in `src/` keeps the directive in `dist/` (`.js` and `.cjs`) — rolldown warns `MODULE_LEVEL_DIRECTIVE` falsely in unbundle mode and the warning is suppressed in the config.

### Agent tooling: the tsdown skill

`.claude/skills/tsdown/` is the **official** agent skill from the `rolldown/tsdown` repo (installed 23/09/2026 with `npx skills add rolldown/tsdown --skill tsdown -a claude-code -y`, project scope, pinned by hash in `skills-lock.json`). It is project tooling for agents, **not** a requirement for people: build correctness is guaranteed by `check:package`, the public-API diff, `npm run smoke` and the snapshots, whoever writes the config.

- **Use it whenever you touch the build** (`tsdown.config.*`, `exports`, `.d.ts`, externals). tsdown is pre-1.0 and v0.23 **silently ignores removed options** — wrong output, no error. Check every option against `references/option-*.md` instead of relying on memory (e.g. externals are `deps.neverBundle` in 0.23, not `external`).
- **Keep it in sync with the installed tsdown.** When bumping tsdown, run `npx skills update tsdown` (project scope — never `-g`) and review the diff in the PR. The skill says which tsdown version its docs were generated from; a skill older than the installed tsdown is the problem it exists to prevent.
- **Review it like code.** It is third-party instruction text that runs with the agent's permissions. The installed copy was reviewed on 23/09/2026: Markdown only, no scripts, byte-identical to `rolldown/tsdown@eb40c95`. The `skills` CLI's own scan labelled it "Critical Risk" without detail (Socket: 0 alerts, Snyk: low); the only candidates found are doc examples with `execSync('rm -rf dist')` and a release script that runs `execSync('npm publish')`.
- **Never follow that `npm publish` example here.** This repo publishes only through the `v*` tag workflow (`.github/workflows/publish.yaml`); no script or agent runs `npm publish`.
- Only the `tsdown` skill is installed. The repo's other skill, `tsdown-migrate`, is for migrating from `tsup` — we come from microbundle, so it doesn't apply.

### Verification (added in Etapa 0 — there used to be none)

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint 10 flat config (0 errors; warnings are tracked debt — incl. the React Compiler rules of react-hooks 7, downgraded to warn)
npm run format:check # prettier, per .prettierrc
npm run test         # vitest — auth providers, cookie helper, AutoComplete, masked GenericInput, picker validation, tables (incl. SSR in a node env)
npm run snapshots    # visual snapshots of every story, inside a fixed Linux container (rebuilds Storybook first; SKIP_STORYBOOK_BUILD=1 to skip)
npm run check:package # externals vs lib-package.json + 'use client' + publint + are-the-types-wrong over dist/
npm run smoke         # packed dist/ installed in examples/smoke-app + next build (SMOKE_NEXT / SMOKE_PICKERS / SMOKE_TOASTIFY pick other majors)
```

**Vitest 5: a `vi.fn` with an arrow-function implementation can't be called with `new`** — mock constructors with `vi.fn(function () { return obj })` (see `KeycloakAuthProvider.test.tsx`).

**Each story is captured in a fresh browser context** (`scripts/visual-snapshots.mjs`): with one shared page, some stories rendered differently depending on the stories before them, and the old baseline recorded that (UPGRADE_PLAN.md 5.18). Keep the isolation.

**Snapshots must be generated inside the container** (`npm run snapshots:update`), never straight from macOS — fonts and antialiasing differ from CI and every PNG would show a diff. The baseline lives in `snapshots/baseline/` and is versioned.

When you change a component, update/add its story and run `npm run snapshots`. A layout regression shows up there and nowhere else.
