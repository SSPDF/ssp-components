# @ssplib/react-components

Biblioteca de componentes React (baseada em MUI v5) para projetos internos da SSP-DF. Inclui campos de formulário com máscara/validação, providers de autenticação (Keycloak/AD e gov.br), tabela com filtros e exportação, mapa (Leaflet), modal e navbars.

> Projeto interno em desenvolvimento contínuo. Textos e validações em pt-BR.

## Instalação

```bash
npm install @ssplib/react-components \
  @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled \
  react-hook-form dayjs react-toastify
```

### Contrato de peer dependencies

A lib **não embute** o MUI, o Emotion nem as libs de formulário/toast: ela as importa do app. Por isso elas são `peerDependencies` e o app precisa tê-las instaladas — uma cópia só na árvore, a do app.

| Pacote | Versão |
|---|---|
| `react`, `react-dom` | `^18.0.0` |
| `next` | `^14.0.0` (Pages Router — os componentes de auth e navbar usam `next/router`) |
| `@mui/material` | `^5.8.6` |
| `@mui/icons-material` | `^5.0.0` |
| `@mui/x-date-pickers` | `^6.0.0` |
| `@emotion/react` / `@emotion/styled` | `^11.9.0` / `^11.8.1` |
| `react-hook-form` | `^7.43.0` |
| `dayjs` | `^1.11.0` |
| `react-toastify` | `^10.0.0` |

Por que peer e não dependência própria: com duas cópias de `@mui/material` o `ThemeProvider` do app não alcança os componentes da lib (eles caem no tema default), duas cópias do Emotion geram briga de estilos e mismatch de hidratação no SSR, e os tipos do MUI na API pública (`InputProps`, `SxProps<Theme>`) deixam de ser compatíveis. Com duas cópias de `react-hook-form` ou `react-toastify`, o contexto do formulário e o `toast()` do app deixam de enxergar os da lib.

O `@mui/lab` **não** precisa ser instalado pelo app: ele é dependência da lib (usado só pelo `Stepper`) e vem junto.

> O `npm install` avisa quando uma peer está faltando ou fora da faixa. Não ignore o aviso — é exatamente o cenário em que os componentes quebram em runtime sem erro de compilação.

### `Table` e SSR

`Table` lê o `localStorage` durante o render e quebra no SSR do Next (`localStorage is not defined`). Até isso ser corrigido, carregue-a sem SSR:

```tsx
import dynamic from 'next/dynamic'

const Table = dynamic(() => import('@ssplib/react-components').then((m) => m.Table), { ssr: false })
```

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

Props úteis: `name` (obrigatório), `title` (label acima do campo), `required`, `customValidate`, `watchValue` (sincroniza o campo com um valor externo), `inputMinLength`/`inputMaxLength`, layout via `xs`/`sm`/`md`. O tipo público `InputProps` estende `TextFieldProps` do MUI.

## Tabela e exportação

`Table` (clássico) e `GenericTable` renderizam dados com filtros, ordenação e paginação (inclusive **server-side** no `GenericTable`, via `serverSidePagination` + `page`/`onPageChange`). A exportação para `.xlsx` é configurada por `csvConfig` (tipo `CsvConfigProp`) e gerada com **`write-excel-file`** (writer mantido, sem as CVEs do antigo SheetJS).

## Autenticação

Dois providers alimentam o mesmo `AuthContext` (formato `AuthReturnData`): `user`, `isAuth`, `userLoaded`, `login`, `logout`, `hasRole`/`hasAnyRole`/`hasAllRoles`, `accessToken`.

- **`KeycloakAuthProvider`** — Keycloak/Active Directory (`type: 'ad'`), com refresh automático de token e init de SSO.
- **`OAuthProvider`** — OIDC gov.br (`type: 'govbr'`). Em `localhost` (ou um `testIP`), faz bypass do fluxo real e loga com um `testToken`.

Ambos guardam o JWT no cookie `nextauth.token` (exportado como `AUTH_COOKIE_NAME`).

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
npm run build          # build de produção (microbundle) -> dist/

npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run format:check   # prettier
npm run test           # vitest (providers de auth)
npm run snapshots      # snapshots visuais de todas as stories, dentro de container Linux
npm run check:package  # publint + are-the-types-wrong sobre o dist/
```

As **stories** (`src/**/*.stories.tsx`) são a principal superfície de verificação, e os snapshots visuais comparam cada uma com o baseline em `snapshots/baseline/`. Formatação: Prettier (4 espaços, sem ponto-e-vírgula, aspas simples, `printWidth` 200).

### Publicação / versão

A lib segue **semver** a partir da `0.1.0` (as versões `0.0.x` saíam todas como patch, inclusive as breaking). As mudanças de cada versão ficam no [`CHANGELOG.md`](./CHANGELOG.md).

A versão fica em **`lib-package.json`** (o package.json que é efetivamente publicado). O hook `prebuild` (`sync-version.cjs`) copia essa versão para o `package.json` raiz. Para lançar: bumpe a versão em `lib-package.json`, registre no `CHANGELOG.md`, faça o merge e empurre a tag correspondente (`git tag v0.1.0 && git push origin v0.1.0`). O workflow `.github/workflows/publish.yaml` só publica por tag `v*` (ou `workflow_dispatch`); push na `main` não publica. Versões de pré-release (`1.0.0-rc.1`) vão para a dist-tag `next`, nunca para `latest`.

Para detalhes de arquitetura voltados a agentes/IA, veja [`AGENTS.md`](./AGENTS.md).
