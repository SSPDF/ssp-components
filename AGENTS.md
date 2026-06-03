# AGENTS.md — @ssplib/react-components

Guia para agentes de IA que consomem esta lib em um projeto. **Não cave no código bundlado de `node_modules` para entender a API — está tudo aqui e no `README.md`.** Todos os componentes e tipos são exportados pela raiz `@ssplib/react-components`.

## Regra nº 1: existem DOIS sistemas de formulário incompatíveis

Antes de usar qualquer campo, identifique a qual sistema ele pertence e use o provider correspondente. Eles **não** compartilham estado.

- **Clássico** → provider `FormProvider`, contexto `FormContext` (custom, métodos com prefixo `form*`: `formWatch`, `formSetValue`, `formRegister`…). `onSubmit(data, filesUid)`.
  Componentes: `Input`, `Table`, `CheckBox`, `Radio`, `Switch`, `DatePicker`, `TimePicker`, `FileUpload`, `DropFileUpload`, `AutoComplete`, `FetchAutoComplete`, `MultInput`, `Stepper`, etc.
- **Generic** → provider `GenericFormProvider`, usa `useFormContext()` do `react-hook-form` nativo. `onSubmit(data)`.
  Componentes: tudo com prefixo `Generic` (`GenericInput`, `GenericTable`, `GenericFetchAutoComplete`, `GenericMaskInput`, `GenericMultInput`, `GenericDatePicker`).

Erro comum: colocar `Input` dentro de `GenericFormProvider` (ou vice-versa). Não funciona — o campo não registra valor.

## Setup mínimo

```tsx
import { SspComponentsProvider, FormProvider, Input } from '@ssplib/react-components'

<SspComponentsProvider>                         {/* 1x na raiz: provê MODAL + toasts */}
  <FormProvider onSubmit={(data, filesUid) => {}}>
    <Input name='cpf' title='CPF' type='cpf' required />   {/* já renderiza <form> */}
    <button type='submit'>Enviar</button>
  </FormProvider>
</SspComponentsProvider>
```

`SspComponentsProvider` deve envolver a aplicação uma vez (provê o portal de `MODAL` e o `ToastContainer`). Sem ele, modais/toasts não funcionam.

## Inputs

`Input`/`GenericInput`: a prop `type` define máscara **e** validação. Valores: `cpf`, `cnpj`, `cpf_cnpj`, `phone`, `cep`, `sei`, `rg`, `email`, `number`, `input`, + tipos HTML nativos. Props: `name` (obrigatório), `title` (label), `required`, `customValidate`, `watchValue` (espelha valor externo), `xs`/`sm`/`md`. Tipo: `InputProps` (estende `TextFieldProps`).

## Autenticação

`AuthContext` (tipo `AuthReturnData`) expõe `user`, `isAuth`, `userLoaded`, `login`, `logout`, `hasRole`, `hasAnyRole`, `hasAllRoles`, `accessToken`. Providers: `KeycloakAuthProvider` (AD, `type:'ad'`) e `OAuthProvider` (gov.br, `type:'govbr'`; bypass em localhost via `testToken`). JWT no cookie `AUTH_COOKIE_NAME` (`nextauth.token`).

## Tabela / exportação

`Table` e `GenericTable`: filtros, ordenação, paginação (server-side no `GenericTable` via `serverSidePagination` + `page`/`onPageChange`). Exportação `.xlsx` via prop `csvConfig` (tipo `CsvConfigProp`). Internamente usa `write-excel-file` — **não** o pacote `xlsx`/SheetJS (removido por segurança).

## Imports de tipos

Todos pela raiz: `import type { InputProps, InputType, CsvConfigProp, FilterValue, TableProps, TableProps2, MapProps, FormContextType, AuthReturnData, User } from '@ssplib/react-components'`. Enums `FieldType` e `ColumnDirection` são valores (import normal, não `import type`).

## Requisitos de ambiente

React 18, Next.js 14 (Pages Router — auth usa `next/router`). Peers MUI: `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `@mui/x-date-pickers`, `@mui/lab`.
