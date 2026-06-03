# @ssplib/react-components

Biblioteca de componentes React (baseada em MUI v5) para projetos internos da SSP-DF. Inclui campos de formulário com máscara/validação, providers de autenticação (Keycloak/AD e gov.br), tabela com filtros e exportação, mapa (Leaflet), modal e navbars.

> Projeto interno em desenvolvimento contínuo. Textos e validações em pt-BR.

## Instalação

```bash
npm install @ssplib/react-components \
  @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-date-pickers @mui/lab
```

**Peer dependencies:** `react ^18`, `react-dom ^18`, `next ^14`. Os componentes de autenticação usam `next/router` (Next.js Pages Router).

## Conceito central: os dois sistemas de formulário

Esta é a coisa **mais importante** de entender. A lib tem **dois mecanismos de formulário incompatíveis entre si**. Cada componente pertence a um deles — escolha o provider certo conforme o componente que for usar.

| | Sistema "clássico" | Sistema "Generic" |
|---|---|---|
| **Provider** | `FormProvider` | `GenericFormProvider` |
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
Providers/contexto: `SspComponentsProvider`, `FormProvider`, `KeycloakAuthProvider`, `OAuthProvider`, `FormContext`, `AuthContext`.

Os tipos de props (`InputProps`, `InputType`, `CsvConfigProp`, `FilterValue`, `TableProps`, `TableProps2`, `MapProps`, `FieldType`, `FormContextType`, etc.) e os tipos de auth são exportados pela raiz do pacote — basta `import type { … } from '@ssplib/react-components'`.

## Desenvolvimento

```bash
npm run storybook   # ambiente de dev/preview (Storybook em :6006) — não há app host
npm run api         # mock API (json-server em :7171) para componentes Fetch*
npm run build       # build de produção (microbundle) -> dist/
```

Não há test runner nem lint. As **stories** (`src/**/*.stories.tsx`) são a superfície de verificação. Formatação: Prettier (4 espaços, sem ponto-e-vírgula, aspas simples, `printWidth` 200).

### Publicação / versão

A versão fica em **`lib-package.json`** (o package.json que é efetivamente publicado). O hook `prebuild` (`sync-version.cjs`) copia essa versão para o `package.json` raiz. Para lançar: bumpe a versão em `lib-package.json` e faça push na `main` (o workflow `.github/workflows/publish.yaml` builda e publica).

Para detalhes de arquitetura voltados a agentes/IA, veja [`AGENTS.md`](./AGENTS.md).
