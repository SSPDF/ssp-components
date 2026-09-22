# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@ssplib/react-components` is a published React component library (MUI v5-based) for SSP-DF internal projects. It ships form controls, auth providers, a Leaflet map, tables, modals and navbars. There is **no host application** here — components are developed and previewed exclusively through **Storybook**, and consumed by downstream Next.js apps. The library targets `next ^14`, `react ^18` as peer dependencies. UI copy and code comments are in Portuguese (pt-BR).

## Commands

```bash
npm run storybook        # dev environment — Storybook on :6006 (primary way to run/preview components)
npm run build            # production build via microbundle -> dist/ (cjs + esm + d.ts). Runs prebuild (sync-version) first.
npm run dev              # tsc --watch (type-check only; noEmit is on in tsconfig)
npm run api              # json-server mock API on :7171, serving api-test.json (for Fetch* components in stories)
npm run build-storybook  # static Storybook -> storybook-static/
npm run link             # build + copy lib-package.json to dist/package.json + npm link (for local testing in a consumer app)
```

There is **no test runner and no lint script**. Storybook stories are the de facto verification surface — when you change a component, update/add its `*.stories.tsx` and check it renders. Formatting is Prettier (`.prettierrc`): 4-space tabs, single quotes, **no semicolons**, `printWidth: 200`, JSX single quotes. Match this exactly.

## Architecture

### Two parallel form systems — this is the most important thing to understand

The library has **two incompatible form-context mechanisms**, and components are split between them. Pick the right provider/decorator for the component you touch:

1. **Custom `FormContext`** (`src/context/form.ts`) — provided by `FormProvider` (`src/components/providers/FormProvider.tsx`). It wraps `react-hook-form` but **re-exposes methods under renamed keys**: `formRegister`, `formWatch`, `formSetValue`, `formReset`, `formControl`, `formHandleSubmit`, etc., plus `setFilesUid`/`submiting`. Components consume it via `useContext(FormContext)`. Used by the non-prefixed components: `Input`, `Table`, `CheckBox`, file uploads, etc. `FormProvider` also renders the `<form>` and shows a toast on invalid submit. Its `onSubmit` receives `(data, filesUid)`.

2. **Native react-hook-form context** — provided by `GenericFormProvider` (`src/components/providers/GenericFormProvider.tsx`), which is just RHF's `FormProvider` + `useForm`. Components consume it via the standard `useFormContext()` from `react-hook-form`. Used by the **`Generic*`-prefixed** components: `GenericInput`, `GenericTable`, `GenericFetchAutoComplete`, `GenericMaskInput`, `GenericMultInput`, `GenericDatePicker`. Its `onSubmit` receives `(data)` only.

When adding a story, mirror this split with the matching decorator: `src/decorators/FormBaseDecorator.tsx` (custom context) vs `src/decorators/GenericFormBaseDecorator.tsx` (RHF context). Both wrap the story in `SspComponentsProvider` + `QueryClientProvider` + a submit button that dumps form data. **Note**: `decorators/` exists at repo root and under `src/decorators/` — stories import from `src/decorators/`.

### Masked inputs and validation

Field types (`cpf`, `cnpj`, `cpf_cnpj`, `phone`, `cep`, `sei`, `rg`, `email`, `number`) drive both an IMask mask and a length/format validator, declared as lookup tables (`MASK_CONFIGS`, `VALIDATIONS`) inside the Input components and rendered through `MaskInput`/`GenericMaskInput` (`react-imask`). The newer `src/components/form/input/Input.tsx` is the more complete implementation (dynamic phone/cpf_cnpj masks via IMask `dispatch`, full `TextFieldProps` passthrough); follow its patterns over the older sibling components.

### Auth providers

Two providers both feed the shared `AuthContext` (`src/context/auth.ts`) with the `AuthReturnData` shape (`src/types/auth.ts`): `user`, `isAuth`, `userLoaded`, `login`, `logout`, `hasRole`/`hasAnyRole`/`hasAllRoles`, `accessToken`, etc.

- `KeycloakAuthProvider` — AD/Keycloak (`type: 'ad'`), auto token refresh, SSO init.
- `OAuthProvider` — gov.br OIDC (`type: 'govbr'`). Includes a **localhost/test bypass**: on `localhost` (or a configurable `testIP`) it skips the real OIDC flow and logs in with a provided `testToken`.

Both store the JWT in the `nextauth.token` cookie (`cookieName`, also exported as `AUTH_COOKIE_NAME`) and the user avatar in `localStorage`.

### Public API & build

`src/index.ts` is the single barrel — **every public component and type must be exported here** or it won't ship. The build is `microbundle` using `tsconfig.microbundle.json`; note root `tsconfig.json` has `noEmit: true` and `strict: false`, so type errors do not block the build — be careful, the compiler will not catch much for you.

`SspComponentsProvider` is the top-level app wrapper consumers mount once: it renders the modal portal (`CustomModalProvider` from `src/components/modal/Modal.tsx`, exported as `MODAL`) and the react-toastify `ToastContainer`.

### Versioning & publishing

Version lives in **`lib-package.json`** (the package.json that actually gets published — copied to `dist/package.json`), not the root `package.json`. The `prebuild` hook runs `sync-version.cjs`, which copies `lib-package.json`'s version into the root `package.json`. **To release: bump the version in `lib-package.json`, then push a matching `v*` tag** (e.g. `v0.0.350`). `.github/workflows/publish.yaml` runs on that tag (or a manual `workflow_dispatch`), verifies the tag matches `lib-package.json`, refuses a version already on npm, builds, copies `lib-package.json`→`dist/package.json` and `README.md`→`dist/`, then `npm publish`es from `dist/` under the right dist-tag (a pre-release version goes to `next`, never `latest`). **Pushing to `main` no longer publishes** — that changed in Etapa 0 of the upgrade plan. Commit messages in this repo are conventionally `vNNN - <description>` matching the published version.

## Dependency upgrade (Etapa 0 done, Etapa 1 next)

Dependencies are several majors behind (MUI 5→9, Storybook 9→10, `react-query` v3 unmaintained, `microbundle` abandoned). **`UPGRADE_PLAN.md` at the repo root is the agreed plan — read it before touching `package.json` or `lib-package.json`.** Etapa 0 (baseline + safety net) is done; see its "Registro de execução". Things from it that affect everyday work here:

- **`lib-package.json` declares no `peerDependencies` and does not list `@mui/*` or `@emotion/*`, yet the bundle externalizes them** — so the MUI version that actually runs is the *consumer app's*. Any MUI major bump is a coordinated, breaking release, never a patch.
- **The build can silently produce broken output:** `strict: false` + `noEmit: true` means type errors don't block, and MUI Grid v2 ignores `item`/`xs` without any error. Visual verification through Storybook is mandatory for layout-affecting changes.
- **The published package's `main`/`exports.require` point at `index.cjs.js`, which the build never emits** (it emits `index.cjs`). Not fixed yet — see UPGRADE_PLAN.md 5.9.

### Verification (added in Etapa 0 — there used to be none)

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint 9 flat config (0 errors; warnings are tracked debt)
npm run format:check # prettier, per .prettierrc
npm run test         # vitest — auth providers
npm run snapshots    # visual snapshots of every story, inside a fixed Linux container
npm run check:package # publint + are-the-types-wrong over dist/
```

**Snapshots must be generated inside the container** (`npm run snapshots:update`), never straight from macOS — fonts and antialiasing differ from CI and every PNG would show a diff. The baseline lives in `snapshots/baseline/` and is versioned.

When you change a component, update/add its story and run `npm run snapshots`. A layout regression shows up there and nowhere else.
