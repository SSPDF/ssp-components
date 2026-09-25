# Changelog

Mudanças relevantes para quem consome `@ssplib/react-components`. A lib segue [semver](https://semver.org/lang/pt-BR/) a partir da `0.1.0`: enquanto estiver em `0.x`, **mudança breaking sobe o minor** (`0.1` → `0.2`) e correção sobe o patch.

## 0.3.1

**Atualização de patches e minors (Etapa 4 do `UPGRADE_PLAN.md`).** Nenhum componente muda de comportamento nem de visual (os 84 snapshots são idênticos), e as peers e a API pública são as mesmas.

### O que o app precisa fazer

Nada. As `dependencies` da lib sobem dentro do mesmo major: `axios` ^1.20.0, `jszip` ^3.10.2, `react-dropzone` ^14.4.1, `react-imask` ^6.6.3 e `write-excel-file` ^4.1.1. Nenhuma delas exige Node acima do 20.

### Mudanças

- **`DatePicker`, `GenericDatePicker` e `TimePicker` preparados para o React 19.** A validação deles (obrigatório, data mínima e máxima) era registrada numa ref de callback que retornava um `TextField` que nunca aparecia. No React 19, o retorno de uma ref é tratado como função de limpeza. A ref agora só registra a validação, que continua igual e passou a ter teste.

## 0.3.0

**Troca do bundler (`microbundle` → `tsdown`) e novo layout do `dist/`.** Nenhum componente muda de comportamento nem de visual (os 84 snapshots das stories são idênticos), a API pública é a mesma (78 exports, 49 valores de runtime) e nenhuma peer mudou.

**Sobe o minor porque os arquivos publicados mudaram de nome e de forma:** em vez de um `index.esm.js` e um `index.cjs` com tudo dentro, o pacote passa a ter **um arquivo por módulo** (como o MUI publica): `index.js` + `components/**/*.js` em ESM, `index.cjs` + `components/**/*.cjs` em CommonJS, e tipos separados para cada um (`.d.ts` e `.d.cts`).

### O que o app precisa fazer

Nada, se importa pela raiz (`@ssplib/react-components`) ou por `@ssplib/react-components/types/auth` / `types/form` — que é tudo o que o `exports` do pacote permite. Só quebraria quem importasse arquivos internos do `dist/` (ex.: `@ssplib/react-components/components/...`), o que o `exports` já bloqueava.

### Mudanças

- **`'use client'` preservado no `Map`.** O microbundle juntava tudo num arquivo e descartava a diretiva; agora `components/map/Map` e `DraggableMarker` saem com ela, nas duas saídas. Melhora o uso da lib no App Router.
- **`@ssplib/react-components/types/form` agora funciona em runtime.** Antes só tinha o `.d.ts`: `import { FieldType } from '@ssplib/react-components/types/form'` passava no TypeScript e quebrava no build do app, porque `FieldType` e `ColumnDirection` são `enum` (valores, não só tipos). Pela raiz sempre funcionou.
- **Código publicado não é mais minificado** — fica legível no stack trace e no debugger. O bundler do app minifica no build de produção; no app de fumaça (Next 14), o JS compartilhado pelas páginas foi de 355 para 357 kB.

### Problema conhecido (inalterado desde a `0.1.0`)

- O ESM da lib continua em arquivos `.js` num pacote sem `"type"`, então **`import` nativo do Node** (sem bundler) não o carrega — o `are-the-types-wrong` segue marcando `node16 (from ESM)`. Não afeta Next, webpack, Turbopack nem Vite. Não dá para resolver antes da `1.0.0`: os deep imports do MUI 5 (`@mui/material/Grid`…) também não carregam no ESM nativo do Node, e publicar o ESM como `.mjs` quebra o SSR do Next 14 (detalhes no `UPGRADE_PLAN.md`, Etapa 3).

## 0.2.1

**A peer `next` passa a aceitar o Next 15 e 16** (`^14.0.0 || ^15.0.0 || ^16.0.0`). Nenhum código mudou.

Até a `0.2.0` a faixa era `^14.0.0`, e **nenhum app em Next 16 conseguia instalar a lib** sem `--legacy-peer-deps` (`ERESOLVE`). A `0.0.x` instalava porque não declarava peer nenhuma — então esses apps já rodavam a lib no Next 16, só que sem garantia. Agora roda com garantia: o app de fumaça é buildado e testado no navegador com Next 16, incluindo os componentes que importam `next/*` (`NavBar`: `next/image`, `next/link`, `next/router`; `Map`: `next/dynamic`), e o CI passa a rodá-lo no 14 e no 16.

### O que o app precisa fazer

Nada, além de trocar a versão. As demais peers **não mudaram**: MUI 5, `@mui/x-date-pickers` 6, React 18 e `react-toastify` 10. Um app em MUI 7, x-date-pickers 7/8, React 19 ou toastify 11 continua fora da faixa — ver "Problema conhecido".

### Problema conhecido

- **Apps em MUI 7, React 19, `@mui/x-date-pickers` 7+ ou `react-toastify` 11 recebem `ERESOLVE`.** Essas faixas abrem nas próximas etapas do `UPGRADE_PLAN.md` (MUI na `1.0.0`, React 19 na `2.0.0`). Até lá, para testar num app assim, instale com `npm install --legacy-peer-deps` — é o mesmo que a `0.0.x` já fazia sem avisar.

## 0.2.0

Limpeza de dependências e correção de três bugs. **Sobe o minor porque duas correções mudam comportamento** (`GenericInput` mascarado e `AutoComplete`). Visual idêntico: os 83 snapshots da `0.1.0` continuam iguais.

### O que o app pode fazer

- **Remover o `react-query` e o `QueryClientProvider`**, se eles só existiam por causa do `AutoComplete` da lib. Ele não usa mais react-query.
- **Remover o `next/dynamic` + `ssr: false` da `Table`**, se foi colocado por causa do `localStorage is not defined` no SSR.
- Nada é obrigatório: nenhuma API pública mudou e nenhum peer mudou.

### Mudanças

- **Corrigido: `GenericInput` com tipo mascarado (`cpf`, `cnpj`, `cep`, `phone`, `sei`, `number`…) quebrava ao digitar** sob o `GenericFormProvider`, com `Cannot read properties of undefined (reading 'formSetValue')` a cada tecla. O `GenericMaskInput` lia o contexto do `FormProvider` clássico em vez do react-hook-form. Quem montava os dois providers juntos para contornar pode tirar o `FormProvider`.
- **Corrigido: `Table` e `GenericTable` quebravam no SSR** (`ReferenceError: localStorage is not defined`). Agora renderizam no servidor; os filtros e a ordenação salvos no `localStorage` entram logo depois da montagem, sem mismatch de hidratação.
- **`AutoComplete` não depende mais de react-query.** Busca as opções ao montar e quando `url` ou o token do usuário mudam, e cancela a requisição ao desmontar. Diferenças em relação ao `useQuery` do react-query v3: **não tenta de novo** em caso de erro (antes eram 3 tentativas), **não busca de novo** quando a janela volta ao foco, e dois `AutoComplete` com o mesmo `name` não compartilham mais cache. Se o `dataPath` não existir na resposta, a lista fica vazia (antes ficava `undefined` e o componente quebrava ao abrir).
- **`cookies-next` removido.** O `OAuthProvider` usa um helper interno que grava e lê o cookie `nextauth.token` exatamente como o `cookies-next@4` (conferido byte a byte) — sessões abertas com versões anteriores continuam válidas. Era o que impedia abrir a peer `next` para 15/16.
- **`react-google-recaptcha` removido** (declarado, nunca usado).
- **`GenericTable` não polui mais o console**: imprimia `null` a cada render e a lista inteira a cada tecla na busca (restos de depuração).
- **`Menu`: `btProps` aceita `customColor` e `customFontColor`** (antes o TypeScript recusava, embora funcionasse).
- O pacote publicado não inclui mais `stories/`, `decorators/` e helpers de teste.

### Dependências que saíram da árvore do app

`react-query`, `cookies-next` e `react-google-recaptcha` — 18 pacotes a menos no `npm install`.

## 0.1.0

Primeira versão com packaging correto. Nenhum componente muda de comportamento ou de visual — os 83 snapshots das stories são idênticos aos da `0.0.349`.

> Um app com `"@ssplib/react-components": "^0.0.349"` **não** recebe esta versão automaticamente (em `0.0.x` o `^` fixa a versão exata). Para atualizar, troque para `"^0.1.0"`.

### O que o app precisa fazer

Instalar as peer dependencies, se ainda não tiver (a maioria dos apps já tem todas):

```bash
npm install @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled react-hook-form dayjs react-toastify
```

Se o `npm install` acusar peer fora da faixa, as faixas estão no `README.md` ("Contrato de peer dependencies").

### Mudanças

- **`peerDependencies` declaradas.** O MUI (`@mui/material ^5.8.6`, `@mui/icons-material ^5`, `@mui/x-date-pickers ^6`), o Emotion, `react-hook-form`, `dayjs` e `react-toastify` agora são peers — sempre vieram do app em runtime, mas o pacote não declarava isso. `react-hook-form`, `dayjs` e `react-toastify` deixam de ser dependências próprias, o que elimina o risco de duas cópias na árvore (contexto de formulário e `toast()` de instâncias diferentes).
- **Corrigido: `Stepper` quebrava em apps sem `@mui/lab`.** O bundle importava `@mui/lab` sem declará-lo. Agora ele é dependência da lib (fixado em `5.0.0-alpha.127`, que aceita qualquer `@mui/material` 5) e é instalado junto.
- **Corrigido: `require('@ssplib/react-components')` falhava.** `main` e `exports.require` apontavam para `index.cjs.js`, que nunca existiu; agora apontam para `index.cjs`. Afeta Jest, scripts Node e qualquer resolução CommonJS.
- **Corrigido: ordem das condições em `exports`.** `types` passa a ser a primeira, como o TypeScript exige.
- **O bundle não embute mais uma cópia do `@mui/system`.** `FileUpload` e `DropFileUpload` importavam `Stack` de `@mui/system`, que não era externo, e o build copiava o pacote para dentro do `dist/` (~40 kB). Agora usam o `Stack` do `@mui/material` do app.
- **Novo export: `GenericFormProvider`.** O provider dos componentes `Generic*` existia mas não era exportado; antes era preciso montar `useForm()` + o `FormProvider` do react-hook-form na mão.

### Problema conhecido

- `Table` lê o `localStorage` durante o render e quebra no SSR do Next. Carregue-a com `next/dynamic` e `ssr: false`. Já acontecia nas versões anteriores. **Corrigido na `0.2.0`.**
