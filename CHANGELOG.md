# Changelog

Mudanças relevantes para quem consome `@ssplib/react-components`. A lib segue [semver](https://semver.org/lang/pt-BR/) a partir da `0.1.0`: enquanto estiver em `0.x`, **mudança breaking sobe o minor** (`0.1` → `0.2`) e correção sobe o patch.

## 1.0.0-rc.1

**MUI 7.3+/9 (Etapa 7 do `UPGRADE_PLAN.md`).** Primeiro major da lib, e breaking coordenado: o app precisa estar no MUI 7.3 ou 9. Candidato a release: publicar na dist-tag `next`, validar num app piloto e só então promover a `1.0.0` para `latest`.

| Peer | Antes (`0.x`) | Agora |
|---|---|---|
| `@mui/material` | `^5.8.6` | `^7.3.0 \|\| ^9.0.0` |
| `@mui/icons-material` | `^5.0.0` | `^7.3.0 \|\| ^9.0.0` (mesmo major do `@mui/material`) |
| `@mui/x-date-pickers` | `^6.0.0 \|\| ^7.0.0` | `^8.0.0 \|\| ^9.0.0` (o MUI 9 exige o 9) |

React (`^18`), Next (`^14 || ^15 || ^16`), Emotion, `react-hook-form`, `dayjs` e `react-toastify` não mudaram. A lib não depende mais do `@mui/lab`.

### O que o app precisa fazer

- **Subir o MUI para 7.3+ ou 9 e o `x-date-pickers` para 8 ou 9**, com os codemods do MUI no código do app (`npx @mui/codemod@latest v6.0.0/all`, `v7.0.0/grid-props`, `deprecations/all`, `v9.0.0/system-props`; `npx @mui/x-codemod@latest v9.0.0/pickers/preset-safe`).
- **Manter os campos da lib dentro de um `<Grid container>` do `@mui/material`.** O `xs`/`sm`/`md` dos campos (`<Input md={6} />`) vira o `size` do Grid v2, que só tem efeito dentro de um container v2. Os apps já envolvem os campos assim (ex.: o `SectionWrapper` do viva-flor). **Não troque esses containers por `GridLegacy`**, como o codemod do MUI 7 às vezes sugere para preservar layout: dentro de um `GridLegacy`, os campos da lib ocupam a largura toda.
- **Testes do app que procuram o `<input>` dos pickers:** no x-date-pickers 8+, o campo de `DatePicker`, `GenericDatePicker` e `TimePicker` é um grupo de seções (`role="spinbutton"`: dia, mês, ano) com um input escondido que guarda o valor. O visual e o valor enviado são os mesmos.
- **Testes que procuram o `Switch` como `checkbox`:** no MUI 7+ ele tem `role="switch"`.
- Browsers mínimos do MUI 7+: Chrome 117, Firefox 121, Safari 17.

### O que a migração do specto e do viva-flor ensinou (27/09)

Os dois apps foram migrados para o MUI 9 com esta rc, e buildam e abrem sem erro. Pontos que os codemods não resolvem sozinhos:

- **O codemod `v9.0.0/system-props` descarta os spreads JSX do mesmo elemento.** `<Grid item bgcolor="white" {...props}>` vira `<Grid sx={{ bgcolor: 'white' }}>`, sem o `{...props}` e sem erro. No viva-flor, os componentes `Field` e `File` da tela de detalhes perderam o `md` que vinha pelo spread: todos os campos ficariam com largura total. Depois de rodar os codemods, procure componentes que espalhavam props num `Grid`/`Box`/`Stack` e confira se o spread continua lá.
- **Componentes do app com `interface Props extends GridProps` que usam `xs`/`md`**: o `GridProps` do MUI 7+ não tem mais essas props (viraram `size`). Declare-as nas props do componente e converta para `size={{ xs, sm, md, lg }}`.
- **Ícones `*Outline` removidos no `@mui/icons-material` 9**: use `*OutlineOutlined` (`ErrorOutline` → `ErrorOutlineOutlined`, `DeleteOutline` → `DeleteOutlineOutlined`, com desenho idêntico). A sugestão do TypeScript (`ErrorOutlined`) é outro ícone (preenchido).
- **`<Grid direction="column">`** não existe mais no MUI 9: use `<Stack>`.
- **`Typography color='text.primary'`** (caminho no tema) vira preto em silêncio no MUI 9. Use nomes da paleta (`'textPrimary'`, `'primary'`) ou o `sx`.
- **`@mui/x-charts` 6 → 9**: `highlightScope: { faded, highlighted }` → `{ fade, highlight }`, e na legenda `itemMarkWidth`/`itemMarkHeight`/`labelStyle`/`padding` saíram (vão para o `sx` da legenda, com a classe `.MuiChartsLegend-mark`).
- **`LoadingButton` do `@mui/lab`** → `Button` do `@mui/material` com `loading`/`loadingPosition` (o codemod `lab-removed-components` não converteu).
- `PaperProps`/`inputProps` que o codemod `deprecations/all` deixou passar: `slotProps.paper` / `slotProps.htmlInput`.

### Mudanças que não exigem nada do app

- `Input`: `InputProps`, `inputProps`, `InputLabelProps`, `FormHelperTextProps` e `SelectProps`, que o MUI 9 tirou do `TextField`, continuam aceitas (agora `@deprecated`) e vão para o `slotProps` equivalente. Se o app passar as duas formas, vale a de `slotProps`.
- `Table`/`GenericTable`: `customTableStyle` com estilos soltos (`border`, `borderRadius`…, as system props que o MUI 9 removeu do `Box`) continua funcionando, com a mesma precedência de antes.
- `Map`: a prop `style` agora é tipada como `sx` (`SxProps`). Medidas como `{ minWidth, height }` continuam iguais.
- `Stepper`: o botão de enviar usa o `Button` do MUI com `loading` (era o `LoadingButton` do `@mui/lab`). Mesmo visual.

### Documentação

- **O pacote traz um `llms.txt`**: índice para agentes de IA com o `AGENTS.md`, o README, o CHANGELOG e a documentação do MUI **nas versões que a lib suporta** (Material UI 7.3 e 9, x-date-pickers 8 e 9, e os guias de migração). O `AGENTS.md` passa a orientar o agente do app a consultar essa documentação, ou o MCP oficial do MUI, em vez da memória.

### Correções

- **Duas `Table` na mesma página compartilhavam os filtros.** Os nomes das chaves no `localStorage` e o estado de "expandir tudo" eram variáveis de módulo: a tabela que renderizava por último mandava nas duas. Agora cada tabela usa o próprio `id`, como o `GenericTable` já fazia.
- O conteúdo do `StepperBlock` fica centralizado de verdade: o Grid antigo transbordava 8 px e deslocava o conteúdo 4 px para a direita.

## 0.4.0

**Majors das dependências de runtime (Etapa 6 do `UPGRADE_PLAN.md`).** A API pública e as peers não mudaram, e os componentes se comportam igual (conferido pelos snapshots, pelas stories de interação e por um e2e de login com o `keycloak-js` de verdade). Sobe o minor porque dois requisitos do app mudam.

| Dependência | Antes | Agora |
|---|---|---|
| `keycloak-js` | `^25.0.1` | `^26.2.4` (a versão casada com o servidor Keycloak 26 da SSP) |
| `react-dropzone` | `^14.4.1` | `^20.1.2` |
| `react-imask` | `^6.6.3` | `^7.6.1` |
| `jwt-decode` | `^3.1.2` | `^4.0.0` |

### O que o app precisa fazer

- **Node ≥ 22** para instalar e buildar. O `react-dropzone` 20 exige (`EBADENGINE` no Node 20). Os apps em `node:24` (specto, viva-flor, copom) já atendem. O `conoc-frontend` builda em `node:20`, mas ele ainda não usa a linha `0.x`.
- **Servir o app em HTTPS (ou `localhost`).** O `keycloak-js` 26 usa a Web Crypto do browser, que não existe em HTTP puro fora do `localhost`: lá o login falha com `Web Crypto API is not available`. Produção e HMG já são HTTPS. O que quebra é acessar por IP ou `http://` na rede interna.
- **Quem carrega a lib via `require`** (Jest, scripts Node) precisa de Node ≥ 22.12: o `keycloak-js` 26 só é publicado em ESM. Next.js não é afetado.
- Quem passa `dropZoneOptions` ao `DropFileUpload`: com `maxFiles`, o `react-dropzone` 19+ aceita os arquivos até o limite em vez de rejeitar o lote inteiro, e o `isDragReject` só vale durante o arrasto.

### Documentação

- O README passa a dizer o que o `KeycloakAuthProvider` sempre exigiu e não estava escrito: o app precisa servir `public/silent-check-sso.html` (conteúdo no README), e o `basePath` do provider tem que ser o mesmo do `next.config.js`.

## 0.3.3

Só uma correção, sem mudança de peers, de `dependencies` nem de API pública.

### O que o app precisa fazer

Nada, além de trocar a versão. Quem contornava o bug lendo a data por fora do formulário pode tirar o contorno.

### Correção

- **`GenericDatePicker` não enviava a data escolhida.** O campo mostrava a data digitada ou escolhida no calendário, mas o formulário nunca a recebia: com `required`, o envio ficava barrado em "Este campo é obrigatório"; sem `required`, ia sem a data. Só o `defaultValue` funcionava. Agora a data chega ao formulário no formato `DD/MM/AAAA`, como no `DatePicker`.

## 0.3.2

**As peers passam a aceitar `@mui/x-date-pickers` 7 e `react-toastify` 11:** `^6.0.0 || ^7.0.0` e `^10.0.0 || ^11.0.0`. Com isso, um app em MUI 5 com pickers 7 e toastify 11 (como o `copom`) instala a linha `0.x` sem `--legacy-peer-deps`. As outras peers não mudaram: MUI 5, React 18 e Next 14–16.

### O que o app precisa fazer

Nada, além de trocar a versão. Para quem sobe o próprio app para essas versões:

- **`x-date-pickers` 7 exige `@mui/material ^5.15.14`**, piso mais alto que o da lib (`^5.8.6`). O npm avisa se o MUI do app for mais antigo.
- **`react-toastify` 11 injeta o próprio CSS.** O `import 'react-toastify/dist/ReactToastify.css'` do app pode ficar (as regras são as mesmas e não brigam) ou sair. O que **quebra** é importar `react-toastify/ReactToastify.min.css`, caminho que a v11 não exporta mais.

### Correção

- **`DatePicker`, `GenericDatePicker` e `TimePicker` perdiam o valor padrão com `x-date-pickers` 7.** O primeiro picker da página aparecia vazio e marcado com erro. A lib dependia de um plugin do `dayjs` (`customParseFormat`) que o `x-date-pickers` 6 registrava ao ser importado e o 7 só registra mais tarde. Agora a lib registra o plugin ela mesma. Com o pickers 6 nada muda. O mesmo plugin é usado pelos filtros de data da `Table`, que também passam a funcionar independentemente da versão dos pickers.

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
