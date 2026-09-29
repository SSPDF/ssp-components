# @ssplib/react-components

Biblioteca de componentes React (baseada em MUI 9 e React 19) para projetos internos da SSP-DF. Inclui campos de formulário com máscara/validação, providers de autenticação (Keycloak/AD e gov.br), tabela com filtros e exportação, mapa (Leaflet), modal e navbars.

> Projeto interno em desenvolvimento contínuo. Textos e validações em pt-BR.

## Instalação

```bash
npm install @ssplib/react-components \
  @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled \
  react-hook-form dayjs react-toastify
```

**Para agentes de IA no app:** o pacote traz um `AGENTS.md` (como usar a lib) e um `llms.txt` (índice da documentação da lib e do MUI nas versões suportadas), na raiz de `node_modules/@ssplib/react-components/`.

### Contrato de peer dependencies

A lib **não embute** o MUI, o Emotion nem as libs de formulário/toast: ela as importa do app. Por isso elas são `peerDependencies` e o app precisa tê-las instaladas — uma cópia só na árvore, a do app.

Desde a `1.0.0-rc.2` a lib declara **só o major atual** de cada peer: atualizar a lib é atualizar a stack do app inteira de uma vez (React 19, Next 16, MUI 9, pickers 9, toastify 11). Quem ainda está no MUI 5 + React 18 fica na linha `0.x` (`0.4.0`).

| Pacote | Versão |
|---|---|
| `react`, `react-dom` | `^19.0.0` |
| `next` | `^16.0.0` (Pages Router — os componentes de auth e navbar usam `next/router`) |
| `@mui/material` | `^9.0.0` |
| `@mui/icons-material` | `^9.0.0` (o mesmo major do `@mui/material`) |
| `@mui/x-date-pickers` | `^9.0.0` |
| `@emotion/react` / `@emotion/styled` | `^11.9.0` / `^11.8.1` |
| `react-hook-form` | `^7.43.0` |
| `dayjs` | `^1.11.0` |
| `react-toastify` | `^11.0.0` |

Por que peer e não dependência própria: com duas cópias de `@mui/material` o `ThemeProvider` do app não alcança os componentes da lib (eles caem no tema default), duas cópias do Emotion geram briga de estilos e mismatch de hidratação no SSR, e os tipos do MUI na API pública (`InputProps`, `SxProps<Theme>`) deixam de ser compatíveis. Com duas cópias de `react-hook-form` ou `react-toastify`, o contexto do formulário e o `toast()` do app deixam de enxergar os da lib.

Desde a `1.0.0` a lib não usa mais o `@mui/lab` (o `Stepper` usa o `Button` com `loading`).

### Layout: os campos dimensionam dentro de um `<Grid container>`

As props `xs`/`sm`/`md` dos campos (`<Input md={6} />`) viram o `size` do Grid v2 do MUI. No Grid v2 a largura de um item é calculada pelo **container pai**: envolva os campos num `<Grid container>` do `@mui/material` (MUI 7+), como os apps já fazem. Fora de um container, ou dentro de um `GridLegacy`, o campo ocupa a largura toda. `xs={true}` vira `'grow'`.

### Browsers

O MUI 9 exige Chrome 117+, Firefox 121+ e Safari 17+.

> O `npm install` avisa quando uma peer está faltando ou fora da faixa. Não ignore o aviso — é exatamente o cenário em que os componentes quebram em runtime sem erro de compilação.

### Requisitos do app (desde a `0.4.0`)

- **Node ≥ 22** para instalar e buildar. O `react-dropzone` 20 declara `engines: node >= 22` (com Node 20 o npm avisa `EBADENGINE`, e falha com `engine-strict`). Quem carrega a lib via CommonJS (`require`), como o Jest, precisa de Node ≥ 22.12, porque o `keycloak-js` 26 só é publicado em ESM.
- **Contexto seguro (HTTPS ou `localhost`)** para o `KeycloakAuthProvider`. O `keycloak-js` 26 usa a Web Crypto do browser (`crypto.randomUUID`, `crypto.subtle`), que não existe numa página servida em HTTP puro fora do `localhost`: o login falha com `Web Crypto API is not available`. Acessar o app por IP ou por `http://` na rede interna deixa de funcionar.

### SSR

Os componentes renderizam no servidor (Next.js Pages Router). `Table` e `GenericTable` restauram os filtros e a ordenação salvos no `localStorage` logo depois da montagem — até a `0.1.x` elas liam o `localStorage` durante o render e precisavam de `next/dynamic` com `ssr: false`, o que pode ser removido.

`AutoComplete` não precisa mais de `QueryClientProvider` (a lib deixou de usar react-query na `0.2.0`).

## Conceito central: os dois sistemas de formulário

Esta é a coisa **mais importante** de entender. A lib tem **dois mecanismos de formulário incompatíveis entre si**. Cada componente pertence a um deles — escolha o provider certo conforme o componente que for usar.

| | Sistema "clássico" | Sistema "Generic" |
|---|---|---|
| **Provider** | `FormProvider` | `GenericFormProvider` (exportado a partir da `0.1.0`) |
| **Contexto** | `FormContext` (custom) — métodos renomeados: `formRegister`, `formWatch`, `formSetValue`, `formReset`, `formControl`, `formHandleSubmit`, `formGetValues`… | `react-hook-form` nativo — consome via `useFormContext()` |
| **Componentes** | `Input`, `Table`, `CheckBox`, `Radio`, `DatePicker`, uploads de arquivo, etc. | Os prefixados com **`Generic`**: `GenericInput`, `GenericTable`, `GenericFetchAutoComplete`, `GenericMaskInput`, `GenericMultInput`, `GenericDatePicker` |
| **`onSubmit`** | `(data, filesUid) => void` | `(data) => void` |

Os dois **não** compartilham estado. Não misture `Input` (clássico) dentro de um `GenericFormProvider`, nem `GenericInput` dentro de um `FormProvider`.

### Exemplo — sistema clássico

```tsx
import { SspComponentsProvider, FormProvider, Input } from '@ssplib/react-components'

export default function MinhaPagina() {
    return (
        <SspComponentsProvider>
            <FormProvider onSubmit={(data, filesUid) => console.log(data, filesUid)}>
                <Input name='nome' title='Nome' type='input' required />
                <Input name='cpf' title='CPF' type='cpf' required />
                <button type='submit'>Enviar</button>
            </FormProvider>
        </SspComponentsProvider>
    )
}
```

> `FormProvider` já renderiza o elemento `<form>` e exibe um toast de aviso quando o submit é inválido.

## `SspComponentsProvider`

Wrapper de nível de aplicação. Monte **uma vez** na raiz. Ele provê o portal de modais (`MODAL`) e o `ToastContainer` (react-toastify). Sem ele, modais e toasts não funcionam.

```tsx
<SspComponentsProvider>{children}</SspComponentsProvider>
```

## Inputs com máscara e validação

`Input` (e `GenericInput`) derivam máscara **e** validação a partir da prop `type`:

`cpf` · `cnpj` · `cpf_cnpj` (alterna dinamicamente) · `phone` (fixo/celular dinâmico) · `cep` · `sei` · `rg` · `email` · `number` (máscara via `numberMask`) · `input` (texto) · além dos tipos nativos de HTML (`password`, `tel`, `url`…).

Props úteis: `name` (obrigatório), `title` (label acima do campo), `required`, `customValidate`, `watchValue` (sincroniza o campo com um valor externo), `inputMinLength`/`inputMaxLength`, layout via `xs`/`sm`/`md`. O tipo público `InputProps` estende `TextFieldProps` do MUI 9: para configurar partes do campo, use `slotProps` (`input`, `htmlInput`, `inputLabel`, `formHelperText`, `select`). As props antigas (`InputProps`, `inputProps`, `InputLabelProps`, `FormHelperTextProps`, `SelectProps`) deixaram de ser aceitas na `1.0.0-rc.3`.

O `title` é o nome acessível do campo (o rótulo é ligado ao campo). Nos testes do app, ache os campos da lib com `getByRole('textbox' | 'combobox', { name: title })`, `getByRole('group', { name: title })` nos pickers e `getByRole('radiogroup' | 'radio', { name })` no `Radio`. O `type='email'` renderiza um campo de texto com `inputMode='email'`, para a validação e a mensagem serem as da lib, não as do browser.

## Tabela e exportação

`Table` (clássico) e `GenericTable` renderizam dados com filtros, ordenação e paginação (inclusive **server-side** no `GenericTable`, via `serverSidePagination` + `page`/`onPageChange`). A exportação para `.xlsx` é configurada por `csvConfig` (tipo `CsvConfigProp`) e gerada com **`write-excel-file`** (writer mantido, sem as CVEs do antigo SheetJS).

## Autenticação

Dois providers alimentam o mesmo `AuthContext` (formato `AuthReturnData`): `user`, `isAuth`, `userLoaded`, `login`, `logout`, `hasRole`/`hasAnyRole`/`hasAllRoles`, `accessToken`.

- **`KeycloakAuthProvider`** — Keycloak/Active Directory (`type: 'ad'`), com refresh automático de token e init de SSO.
- **`OAuthProvider`** — OIDC gov.br (`type: 'govbr'`). Em `localhost` (ou um `testIP`), faz bypass do fluxo real e loga com um `testToken`.

O `KeycloakAuthProvider` faz o check-sso silencioso num iframe que carrega `${basePath}/silent-check-sso.html`. O app precisa servir esse arquivo (em `public/`, que o Next serve embaixo do `basePath`), com este conteúdo:

```html
<!doctype html>
<html>
    <body>
        <script>
            parent.postMessage(location.href, location.origin)
        </script>
    </body>
</html>
```

Passe o mesmo `basePath` do `next.config.js` ao provider: ele monta o endereço desse arquivo e o redirect do logout.

O `OAuthProvider` guarda o JWT no cookie `nextauth.token` (exportado como `AUTH_COOKIE_NAME`). O `KeycloakAuthProvider` **não** grava esse cookie — o token fica com o `keycloak-js` e é exposto por `accessToken`.

```tsx
import { useContext } from 'react'
import { AuthContext } from '@ssplib/react-components'

const { user, isAuth, hasRole, logout } = useContext(AuthContext)
```

## Componentes exportados

Formulário: `Input`, `MaskInput`, `MultInput`, `ActiveInput`, `OtherCheckBox`, `AutoComplete`, `FetchAutoComplete`, `FixedAutoComplete`, `CheckBox`, `CheckBoxAdditional`, `CheckBoxWarning`, `RequiredCheckBoxGroup`, `Radio`, `Switch`, `ToggleVisibility`/`SwitchWatch`, `DatePicker`, `TimePicker`, `FileUpload`, `DropFileUpload`, `Stepper`, `StepperBlock`, `Table`.
Versões `Generic*`: `GenericInput`, `GenericMaskInput`, `GenericMultInput`, `GenericDatePicker`, `GenericFetchAutoComplete`, `GenericTable`.
Outros: `Map`, `MODAL`, `NavBar`, `TabNavBar`, `Menu`, `Button`, `Category`/`Field`/`FieldLabel`/`File` (módulo "detalhes").
Providers/contexto: `SspComponentsProvider`, `FormProvider`, `GenericFormProvider`, `KeycloakAuthProvider`, `OAuthProvider`, `FormContext`, `AuthContext`.

Os tipos de props (`InputProps`, `InputType`, `CsvConfigProp`, `FilterValue`, `TableProps`, `TableProps2`, `MapProps`, `FieldType`, `FormContextType`, etc.) e os tipos de auth são exportados pela raiz do pacote — basta `import type { … } from '@ssplib/react-components'`.

## Desenvolvimento

```bash
npm run storybook      # ambiente de dev/preview (Storybook em :6006) — não há app host
npm run api            # mock API (json-server em :7171) para componentes Fetch*
npm run build          # build de produção (tsdown; exige Node ≥ 22.18; os testes, ≥ 22.22.2 ou ≥ 24.15) -> dist/

npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run format:check   # prettier
npm run test           # vitest (providers de auth, cookie, campos com máscara, validação dos pickers, tabelas com SSR)
npm run snapshots      # snapshots visuais de todas as stories + as stories de interação (play functions), dentro de container Linux
npm run interacoes     # só as stories de interação, contra o `npm run storybook` aberto (rápido)
npm run e2e:keycloak   # login de verdade com o keycloak-js no browser, contra um servidor OIDC simulado (ou o HMG, com E2E_KC_*)
npm run check:package  # externos do bundle x lib-package.json, 'use client', llms.txt, publint e are-the-types-wrong sobre o dist/
npm run smoke          # instala o dist/ empacotado no examples/smoke-app e roda o next build (SSR)
npm run pack:local     # gera pack/*.tgz idêntico ao que seria publicado, para testar num app real
```

As **stories** (`src/**/*.stories.tsx`) são a principal superfície de verificação, e os snapshots visuais comparam cada uma com o baseline em `snapshots/baseline/`. Formatação: Prettier (4 espaços, sem ponto-e-vírgula, aspas simples, `printWidth` 200).

### Testar uma versão local num app

```bash
npm run pack:local                                   # aqui: gera pack/ssplib-react-components-<versão>.tgz
npm install /caminho/ate/pack/ssplib-react-components-<versão>.tgz   # no app, num branch de teste
```

Sem clonar nem buildar: cada run do CI (em todo PR) sobe o mesmo `.tgz` como artefato, chamado `ssplib-react-components-<versão>-<sha>` (o SHA é o do último commit do branch). Baixe-o na página do run (seção *Artifacts*) ou com `gh run download <id-do-run>`, e instale no app com `npm install ./ssplib-react-components-<versão>.tgz`. Fica disponível por 30 dias e não passa pelo npm.

Não use `npm link`: o symlink faz o app resolver React/MUI/Emotion a partir do `node_modules` deste repo, e aparecem duas cópias na árvore — o tema do app para de chegar nos componentes e os erros não são os que aconteceriam em produção.

### Publicação / versão

A lib segue **semver** a partir da `0.1.0` (as versões `0.0.x` saíam todas como patch, inclusive as breaking). As mudanças de cada versão ficam no [`CHANGELOG.md`](./CHANGELOG.md).

A versão fica em **`lib-package.json`** (o package.json que é efetivamente publicado). O hook `prebuild` (`sync-version.cjs`) copia essa versão para o `package.json` raiz. Para lançar: bumpe a versão em `lib-package.json`, registre no `CHANGELOG.md`, faça o merge e empurre a tag correspondente (`git tag v0.1.0 && git push origin v0.1.0`). O workflow `.github/workflows/publish.yaml` só publica por tag `v*` (ou `workflow_dispatch`); push na `main` não publica. Versões de pré-release (`1.0.0-rc.1`) vão para a dist-tag `next`, nunca para `latest`.

Para detalhes de arquitetura voltados a agentes/IA, veja [`AGENTS.md`](./AGENTS.md).
