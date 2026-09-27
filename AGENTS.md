# AGENTS.md — @ssplib/react-components

Guia para agentes de IA que consomem esta lib em um projeto. **Não cave no código bundlado de `node_modules` para entender a API — está tudo aqui e no `README.md`.** Todos os componentes e tipos são exportados pela raiz `@ssplib/react-components`. Índice de toda a documentação, incluindo a do MUI nas versões suportadas: `llms.txt` (na raiz do pacote).

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

React 18, Next.js 14, 15 ou 16 (Pages Router — auth usa `next/router`). Peers (declaradas em `lib-package.json` desde a 0.1.0): `react`, `react-dom`, `next`, `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`, `@emotion/react`, `@emotion/styled`, `react-hook-form`, `dayjs`, `react-toastify`. MUI `^7.3 || ^9` e `x-date-pickers` `^8 || ^9` desde a `1.0.0` (a lib não usa mais `@mui/lab`). Faixas no `README.md`.

**Layout (desde a 1.0.0):** `xs`/`sm`/`md` dos campos viram o `size` do Grid v2 e só têm efeito dentro de um `<Grid container>` do `@mui/material` (não `GridLegacy`). Os pickers (`DatePicker`, `GenericDatePicker`, `TimePicker`) usam a estrutura acessível do x-date-pickers 8+: o campo é um grupo de seções (`role="spinbutton"`), não um `<input>` de texto — ajuste seletores de teste do app. O `Switch` tem `role="switch"`.

Desde a `0.4.0`: **Node ≥ 22** (o `react-dropzone` 20 exige) e o `KeycloakAuthProvider` só funciona em **HTTPS ou `localhost`** (o `keycloak-js` 26 usa a Web Crypto). O app precisa servir `public/silent-check-sso.html` (conteúdo no `README.md`), e o `basePath` do provider tem que ser o do `next.config.js`.

## Documentação do MUI

A lib é construída sobre o MUI e reexpõe tipos dele (`InputProps` estende `TextFieldProps`). Para qualquer dúvida de API do MUI, consulte a documentação **da versão instalada no app**, não a memória do modelo: entre o MUI 5 e o 9 muita coisa mudou sem erro de compilação (`Typography color='text.primary'` vira preto, `Grid item xs` é ignorado, as system props do `Box` somem).

- O `llms.txt` deste pacote (`node_modules/@ssplib/react-components/llms.txt`) lista os índices da documentação do Material UI e do x-date-pickers **nas versões que a lib suporta**, e os guias de migração.
- Se o app tiver o MCP oficial do MUI configurado (`npx -y @mui/mcp@0.1.6`), prefira ele: `useMuiDocs` com o pacote e a versão do app, e depois `fetchDocs` nos links que ele devolver.
- Migrando um app para a `1.x`: o CHANGELOG da `1.0.0-rc.1` lista o que os codemods do MUI não resolvem. O mais grave é que o `v9.0.0/system-props` apaga os `{...props}` dos elementos que converte.
