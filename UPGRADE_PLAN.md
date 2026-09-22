# Plano de atualização de dependências

> **Status:** planejado, nada implementado. Documento de trabalho — marque os checkboxes conforme as etapas forem concluídas.
> **Análise feita em:** 21/09/2026, sobre a versão `0.0.349` (branch `main`, commit `7e017da`). **Revalidada em 22/09/2026** — todos os achados desta seção continuam verdadeiros, nada no repo mudou.
> **Decisões tomadas em:** 21/09/2026 e 22/09/2026 — ver seção 9. **Nenhuma decisão em aberto: a Etapa 0 está pronta para começar.** **Alvo aprovado: as versões mais recentes de tudo**, incluindo MUI 9, Storybook 10, React 19 e Next 16, com ESLint e branch `v0-legacy`.
> **Regra de ouro:** nenhuma etapa avança sem a validação da etapa anterior estar verde. As Etapas 0–6 podem ir para produção **sem tocar em nenhum app consumidor**; só as Etapas 7 e 8 exigem mutirão.

---

## 1. Por que este documento existe

41 dependências estão atrasadas, várias com majors acumulados (MUI 5→9, Storybook 9→10, react-query v3 sem manutenção desde jan/2023, `microbundle` abandonado desde 2022). A lib é consumida por vários sistemas internos e **não tem testes nem lint** — as 34 stories são a única superfície de verificação, e ninguém as executa automaticamente.

O objetivo é chegar nas versões atuais **sem quebrar os apps**, em etapas pequenas e verificáveis.

---

## 2. Achados críticos da análise

### 2.1 O baseline atual está quebrado

- `npm run build` **falha** em máquina com `node_modules` do último `npm install` antigo: `write-excel-file` fica UNMET (é importado em `src/components/form/table/utils.tsx:5` como `write-excel-file/browser`) e o `axios` instalado é 1.6.7 contra `^1.17.0` declarado.
- `package-lock.json` está defasado: diz versão `0.0.347` e é `lockfileVersion: 2`.
- CI (`.github/workflows/publish.yaml`) usa **Node 16** (EOL) com `npm install` (ignora o lock). `write-excel-file@4` declara `engines: node >=18`; Storybook 10 exige Node 20.16+/22.19+.
- `tsconfig.json` tem `strict: false` + `noEmit: true` → o compilador praticamente não protege nada. **Quebra de layout do MUI não gera erro de TS.**

### 2.2 O risco nº 1 é o packaging, não a versão das libs

O `lib-package.json` (o package.json que é realmente publicado) **não declara `peerDependencies` e não lista `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-date-pickers` nem `@emotion/*`** — confirmado no pacote publicado `0.0.349` no npm. Mas o bundle importa todos eles como externos (veja `dist/index.esm.js`: `from"@mui/material"`, `from"@mui/x-date-pickers"`, `from"@mui/lab"`…).

**Consequência: a versão do MUI que roda em produção é a do app consumidor.**

- Subir MUI 5→9 dentro da lib **não tem efeito** num app que tem MUI 5 instalado — e o código novo (Grid `size`, `slotProps`) quebra em runtime contra o MUI 5 do app, **sem erro de compilação**.
- Não existe "atualizar o MUI sem tocar nos apps". É migração coordenada, obrigatoriamente.
- `react-hook-form`, `react-query`, `dayjs` e `react-toastify` estão como `dependencies` (não peers) → risco real de duas instâncias na árvore, com contexto de RHF/react-query duplicado e `toast()` de singletons diferentes.
- Agravante de processo: **tudo sai como patch `0.0.x`**, inclusive mudanças breaking. É o que mais machuca os consumidores hoje.

O `README.md` já instrui o consumidor a instalar o MUI manualmente — ou seja, o contrato de peer existe na documentação, mas não no `package.json`.

#### 2.2.1 `@mui/lab` não é só peer faltando — é dependência não declarada (bug ativo)

Comparando os dois manifestos, estes estão em `package.json` mas **não** em `lib-package.json` (o que é publicado):

```
@emotion/react   @emotion/styled   @mui/material
@mui/icons-material   @mui/lab   @mui/x-date-pickers
```

Para MUI/Emotion isso "funciona por acidente": o app consumidor instala essas libs de qualquer forma, então o import externalizado resolve. **`@mui/lab` é o caso diferente** — nenhum app instala `@mui/lab` por conta própria, e `src/components/form/stepper/Stepper.tsx:4` importa `LoadingButton` dele em runtime. Como o microbundle externaliza tudo que está no `package.json` da raiz, o `dist` publicado carrega um `import '@mui/lab'` que **ninguém declara e ninguém instala** → o `Stepper` provavelmente já está quebrado em produção em qualquer app sem `@mui/lab` na árvore por outro motivo.

**Consequência no plano:** o item 5.4 deixa de ser limpeza e vira **correção de bug**, com prioridade acima da Etapa 2. Enquanto a lib estiver em MUI 5, `<Button loading>` ainda não existe (é nativo só a partir do 6.4), então a correção imediata é **declarar `@mui/lab` em `lib-package.json`**; a remoção do `LoadingButton` acontece na Etapa 7, junto com o salto de MUI.

**Achado menor:** `dayjs` diverge entre os manifestos — `^1.11.11` na raiz, `^1.11.7` no `lib-package.json`. Alinhar na Etapa 1.

### 2.3 A cobertura de stories é menor do que parece: 16 dos 46 exports não têm nenhuma

Levantamento feito sobre o bloco `export { ... }` de `src/index.ts` cruzado com todas as `src/stories/*.stories.tsx`:

| Export sem story | Tipo | Impacto na migração |
|---|---|---|
| `GenericDatePicker` | picker | **alto** — afetado por `x-date-pickers` 6→9 *e* por Grid v2 |
| `GenericMaskInput`, `MaskInput` | input mascarado | **alto** — afetados por `slotProps` (`InputProps`) *e* por `react-imask` 6→7 |
| `GenericMultInput` | input | alto — Grid v2 |
| `ActiveInput` | input | Grid v2 |
| `CheckBoxAdditional`, `RequiredCheckBoxGroup` | checkbox | Grid v2 |
| `TabNavBar` | layout | `useTheme`/`useMediaQuery` + Grid v2 |
| `MODAL` | portal de modal | `useTheme` |
| `Menu` | menu | deep imports do MUI |
| `ToggleVisibility`, `SwitchWatch` | wrapper de form | baixo |
| `KeycloakAuthProvider`, `OAuthProvider` | auth | já tratado em 6 / Etapa 0 |
| `AUTH_COOKIE_NAME`, `AuthContext` | não visuais | nenhum (não precisam de story) |

São **12 componentes visuais sem nenhuma verificação** — e quatro deles estão exatamente no caminho das mudanças mais arriscadas da Etapa 7. Escrever essas stories é pré-requisito do baseline visual, não item opcional.

### 2.4 Qualquer push na `main` publica no npm

`.github/workflows/publish.yaml` dispara em `on: push` com `if: github.ref == 'refs/heads/main'` — e **não existe workflow de PR** (`.github/workflows/` só tem esse arquivo). Num plano de ~10 PRs isso significa publicação involuntária a cada merge. Hoje o `npm publish` só falha se a versão não mudou (CI vermelho, sem dano), mas é proteção por acidente, não por desenho. Precisa de portão de release explícito antes da Etapa 1.

---

## 3. Decisão arquitetural: MUI vem do app (peer dependency declarada)

**Decisão: manter o MUI como dependência do app consumidor, mas declarado em `peerDependencies`.** A arquitetura atual está certa; o que falta é declará-la.

### Por quê

1. **Tema.** 12 arquivos usam `useTheme`/`useMediaQuery` (`GenericTable`, `Table`, `Stepper`, `Modal`, `FilterSection`, `DropFileUpload`, `CheckBox`, `CheckBoxWarning`, `Radio`, `FileUpload`, `OtherCheckBox`, `TabNavBar`). Com duas cópias de `@mui/material`, o `ThemeProvider` do app vive no contexto da cópia dele e os componentes da lib leem o **tema default** — paleta, `breakpoints` e `spacing` do app não se aplicam, e `sx: { borderColor: 'primary.main' }` (usado no `DatePicker`) resolve para o azul padrão do MUI.
2. **Emotion.** Duas instâncias de `@emotion/react` = dois caches de estilo, duas ordens de injeção de `<style>`, class names duplicados → briga de especificidade imprevisível entre o `sx` do app e o da lib, e **mismatch de hidratação no SSR do Next**.
3. **Tipos atravessam a API pública.** `src/components/form/input/Input.tsx:58` exporta `InputProps = InputOwnProps & GridLayoutProps & Omit<TextFieldProps, ...>`; usa `GridProps['xs']` e `SxProps<Theme>`; `src/components/form/table/types.ts` exporta `customTableStyle?: BoxProps`. Com duas cópias, o TS do app gera `Type 'Theme' is not assignable to type 'Theme'. Two different types with this name exist.` — insolúvel sem deduplicar.
4. **Bundle.** MUI + icons + Emotion duplicados passam fácil de +300 kB gzip, sem benefício algum.

### Comparação

| | peer declarada ✅ | `dependencies` (cópia própria) | bundled no `dist` |
|---|---|---|---|
| Tema/contexto do app | funciona | **quebra em silêncio** | quebra |
| Hidratação SSR (Next) | ok | risco alto | risco alto |
| Tipos na API pública | ok | conflito de tipos | conflito |
| Bundle | 1 cópia | 2 cópias | 2 cópias, sem tree-shaking |
| Versão sob controle da lib | não | sim | sim |
| Padrão do ecossistema | sim (recomendação do MUI) | não | não |

A única vantagem da cópia própria ("eu controlo a versão") é ilusória: troca uma incompatibilidade **visível no `npm install`** (warning de peer) por uma **invisível em runtime**.

### Como declarar (`lib-package.json`)

```json
"peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0",
    "@mui/material": "^7.0.0 || ^9.0.0",
    "@mui/icons-material": "^7.0.0 || ^9.0.0",
    "@mui/x-date-pickers": "^7.0.0 || ^9.0.0",
    "@emotion/react": "^11.5.0",
    "@emotion/styled": "^11.3.0",
    "react-hook-form": "^7.43.0",
    "dayjs": "^1.11.0",
    "react-toastify": "^11.0.0"
}
```

> O range de MUI só pode abrir para `^7 || ^9` **depois** da Etapa 7. Até lá, a linha `0.0.x`/`v0-legacy` declara `"@mui/material": "^5.0.0"`.
>
> **Decisão:** todos os apps estão liberados para ir ao **MUI 9**. Mesmo assim mantemos o range em `^7 || ^9` como janela de segurança — o código escrito para Grid v2 + `slotProps` roda nas duas versões, e isso permite que um app suba para 7 primeiro se precisar, sem travar o release da lib.

As mesmas versões devem ir para `devDependencies` (é o que o Storybook usa localmente). Também vale adicionar `peerDependenciesMeta` marcando `next` e `react-leaflet`/`leaflet` como opcionais se quisermos permitir uso fora do Next — hoje `NavBar`, `TabNavBar`, `KeycloakAuthProvider`, `OAuthProvider` e `map/index.tsx` importam `next/router`, `next/image`, `next/link` e `next/dynamic`, então **Next é obrigatório de fato** (Pages Router).

### Continuam como `dependencies` normais (auto-contidas, sem estado compartilhado)

`lodash.get`, `lodash.clonedeep`, `lodash.hasin`, `tinycolor2`, `jszip`, `write-excel-file`, `axios`, `jwt-decode`, `keycloak-js`, `leaflet`, `leaflet-defaulticon-compatibility`, `react-leaflet`.

### O detalhe que evita o "upgrade em lockstep"

Peer **não** obriga todos os apps a subirem no mesmo dia, se o range for amplo — e aqui dá:

- **MUI 7 e 9 compartilham a API que nos interessa**: `Grid` já é o Grid v2 (`size={{ xs, sm, md }}`) e `slotProps` já é o caminho oficial. Código escrito para a v7 **roda nas duas**.
- MUI 5 e 6 ficam fora porque lá o Grid v2 só existe como `Unstable_Grid2`/`Grid2`.

**Desenho do release da Etapa 7:** migrar o código para Grid v2 + `slotProps`, declarar `"@mui/material": "^7.0.0 || ^9.0.0"` e publicar `1.0.0`. Cada app sobe de MUI 5 → 7 (ou direto para 9) no seu próprio ritmo. Quem ficar em MUI 5 permanece na linha `v0-legacy`.

E: **manter `xs`/`sm`/`md` como props públicas dos componentes**, mapeando para `size` internamente, para que a migração do Grid não apareça na API que os apps consomem.

---

## 4. Inventário de versões

Levantado com `npm outdated` + consulta de `peerDependencies` no registry em 21/09/2026.

### 4.1 Risco baixo — interno, sem impacto no consumidor

| Pacote | Atual | Alvo |
|---|---|---|
| `@babel/preset-env` / `-react` / `-typescript` | 7.27–7.28 | 7.29.7 |
| `@tsconfig/recommended` | 1.0.2 | 1.0.13 |
| `@types/node` | 20.17 | 20.19 (Node 22: avaliar `^22`) |
| `@types/react` / `@types/react-dom` | 18.0.37 / 18.3.0 | 18.3.31 / 18.3.7 |
| `@types/leaflet`, `@types/lodash.*`, `@types/tinycolor2` | várias | latest |
| `typescript` | 5.8.3 | **5.9.3** (não 7.x — ver Etapa 9) |
| `dayjs` | 1.11.11 | 1.11.23 |
| `jszip` | 3.10.1 | 3.10.2 |
| `axios` | ^1.17.0 (1.6.7 instalado) | 1.20.0 |
| `@emotion/react` / `styled` | 11.10.6 | 11.14.x |
| `react-hook-form` | 7.43.9 | 7.88.0 |
| `react` / `react-dom` | 18.2.0 | 18.3.1 |
| `next` | 14.2.35 | 14.2.35 (já é o último do 14) |
| `storybook` (pacotes 9.x) | 9.0.17 | 9.1.20 |

### 4.2 Risco médio — breaking contido, 1 PR por item

| Pacote | Salto | O que muda / onde |
|---|---|---|
| `jwt-decode` | 3 → 4 | export default → named `jwtDecode`. Afeta `src/components/providers/OAuthProvider.tsx:2,69,122,124` |
| `react-imask` | 6 → 7 | imask 7. Afeta `MaskInput.tsx`, `GenericMaskInput.tsx` (já usam `as any`, risco baixo) |
| `react-toastify` | 10 → 11 | API do `ToastContainer` e **CSS reescrito**. Temos fork vendorizado em `src/css/ReactToastify.css` (704 linhas, com `sourceMappingURL`) — decidir entre importar do pacote ou refazer o fork |
| `react-dropzone` | 14 → 20 | `DropFileUpload.tsx:73` (`inputRef`, tipos de `DropzoneOptions`) |
| `keycloak-js` | 25 → 26 | init/refresh/SSO em `KeycloakAuthProvider.tsx` (519 linhas, **sem story**) |
| Storybook | 9 → 10 | **configs ESM-only** + Node 20.16+/22.19+. `@storybook/nextjs` e `@storybook/react-webpack5` continuam existindo em 10.x |
| `microbundle` | → `tsup` | Abandonado desde ago/2022 e **descarta o `'use client'`** (o build imprime `Module level directives cause errors when bundled, 'use client' was ignored`) — afeta `Map.tsx` e `DraggableMarker.tsx` no App Router |

### 4.3 Risco alto — exige coordenação com os apps

| Pacote | Salto | Bloqueio / impacto |
|---|---|---|
| `@mui/material` + `@mui/icons-material` | 5.12 → **9.4** | **Não existe v8** (5 → 6 → 7 → 9). `GridLegacy` foi **removido na v9** → `<Grid item xs>` morre em **28 arquivos de `src/` + 3 stories** |
| `@mui/x-date-pickers` | 6 → 9 | Exige `@mui/material ^7.3 \|\| ^9` — acoplado ao passo do MUI |
| `@mui/lab` | 5 → 9 | **Sem release estável desde a v5** (latest = `9.0.0-beta.9`). Uso único: `LoadingButton` em `Stepper.tsx:141` → **remover a dependência** |
| `react-query` v3 | → `@tanstack/react-query` v5 | v3 sem manutenção desde 25/01/2023. Muda o contexto para os apps → **melhor remover da lib** (ver 5.2) |
| `cookies-next` | 4 → 6 | peer **`next >= 15`** → **remover a dependência** (ver 5.3) |
| `react-leaflet` | 4 → 5 | peer **`react ^19.0.0` estrito** → só com React 19 |
| `react` / `next` | 18 / 14 → 19 / 16 | Next 16 exige Node ≥ 20.9; `JSX.Element` global sai dos tipos do React 19 (21 usos em 10 arquivos) |

**Boa notícia:** MUI 9 tem peer `react: ^17 || ^18 || ^19` — **MUI 9 não obriga React 19**. Os dois saltos são independentes.

---

## 5. Dívidas a eliminar antes de mexer no MUI

Cada item aqui **reduz** a superfície de atualização.

### 5.1 `react-google-recaptcha` — dependência morta
Declarada em `package.json` e `lib-package.json` (+ `@types/react-google-recaptcha`), **nunca importada** em `src/`. Remover.

### 5.2 `react-query` — sai da lib
Um único uso real: `src/components/form/input/AutoComplete.tsx:39`, e num padrão errado (`setState` dentro do `queryFn`). Os 3 decorators (`src/decorators/*.tsx`) só instanciam `QueryClientProvider`. Trocar por um hook de fetch interno **remove a dependência da lib inteira** e mata o problema de versão de query com os apps.

### 5.3 `cookies-next` — sai da lib
Usa apenas `getCookie`/`setCookie`/`deleteCookie` em `OAuthProvider.tsx:1,52,92,121,192`. Um helper interno de ~15 linhas **remove o bloqueio do `next >= 15`**.

### 5.4 `@mui/lab` — sai da lib
`LoadingButton` (`Stepper.tsx:4,141,151`) → `<Button loading loadingPosition='start' startIcon={<SaveIcon />}>`, nativo desde MUI 6.4. Evita depender de beta em produção e tira um item da coordenação.

> **Atenção (ver 2.2.1):** hoje `@mui/lab` é uma dependência **não declarada** no pacote publicado — isso é bug ativo, não dívida. A remoção do `LoadingButton` só é possível no MUI ≥ 6.4, ou seja, na Etapa 7. Até lá, **declarar `@mui/lab` em `lib-package.json`** como correção imediata (hotfix `0.0.350`, antes da Etapa 1).

### 5.5 `decorators/` duplicado
Existe na raiz **e** em `src/decorators/`, com 3 arquivos cada e conteúdo divergente. As stories importam de `src/decorators/`. Apagar a pasta da raiz.

### 5.6 `dist/` publica `stories/` e `decorators/`
Por causa de `rootDir: src`, o build emite `dist/stories/` e `dist/decorators/`. Excluir do build (bloat no pacote publicado).

### 5.9 **`main` e `exports.require` do pacote publicado apontam para um arquivo que não existe**

Encontrado ao rodar `publint` sobre o `dist/` (Etapa 0). É o achado mais grave até agora e **já está em produção**.

`lib-package.json` declara:

```json
"main": "index.cjs.js",
"exports": { ".": { "require": "./index.cjs.js", ... } }
```

O microbundle emite **`index.cjs`** — sem o `.js`. Confirmado no `dist/` recém-buildado:

```
dist/index.cjs       ← existe
dist/index.esm.js    ← existe
dist/index.cjs.js    ← NÃO EXISTE
```

Ou seja, qualquer consumidor que resolva pela condição `require` (CommonJS, Jest, parte do SSR do Next, scripts Node) recebe *module not found*. Só funciona hoje porque os apps resolvem por `import`/`module`, que apontam para o `index.esm.js` — esse sim existe.

`publint` reporta ainda:
- `types` precisa ser a **primeira** chave de `exports["."]` (as condições são sensíveis à ordem, senão o TS não resolve);
- `index.esm.js` é ESM mas a extensão `.js` sem `"type": "module"` faz o Node interpretar como CJS (`attw`: 🚭 *Unexpected module syntax*, e `🐛 Used fallback condition` em node16 CJS/ESM e bundler).

**Correção:** ajustar os campos no `lib-package.json` (apontar para `index.cjs`, reordenar `exports`, avaliar `.mjs`). É mudança no pacote publicado, então entra na **Etapa 1**, não aqui. A Etapa 3 (`microbundle` → `tsup`) resolve a raiz, porque o tsup nomeia as saídas de forma consistente.

Verificação adicionada: `npm run check:package` (publint + attw), já ligada ao workflow de PR.

### 5.10 `GenericFormProvider` não é exportado — a família `Generic*` não tem provider acessível

Encontrado ao montar o `examples/smoke-app`. Os seis componentes `Generic*` (`GenericInput`, `GenericTable`, `GenericFetchAutoComplete`, `GenericMaskInput`, `GenericMultInput`, `GenericDatePicker`) consomem o contexto nativo do react-hook-form, e a lib tem um `GenericFormProvider` pronto para fornecê-lo — mas:

- ele **não está no barrel** `src/index.ts`;
- o `exports` do `lib-package.json` declara apenas `.`, `./types/auth` e `./types/form`, então **deep import não resolve** em nenhum resolver moderno.

O arquivo é emitido (`dist/components/providers/GenericFormProvider.d.ts` existe), mas é inalcançável. Na prática o consumidor tem que montar `useForm()` + o `FormProvider` do próprio react-hook-form na mão — é o que o smoke-app faz, de propósito, para documentar a experiência real.

**Correção:** adicionar `GenericFormProvider` ao barrel. Uma linha, não é breaking (só adiciona). Entra na **Etapa 1**, junto com o restante do packaging.

### 5.8 Achados da Etapa 0 (22/09/2026) — bugs encontrados ao escrever as stories

Três defeitos que só apareceram quando os 12 componentes sem story ganharam uma. Nenhum foi corrigido ainda: a Etapa 0 existe para **congelar** o comportamento atual, não para mudá-lo. Cada um precisa de decisão própria.

**a) `GenericInput.stories.tsx` usava o decorator errado — a story era um falso positivo.**
A story declarava `FormBaseDecorator` (contexto customizado), mas `GenericInput.tsx:35` usa `useFormContext()` (RHF). Não quebrava porque a chamada é `methods?.register(...)` — com optional chaining o `register` vira `undefined`, o spread `{...undefined}` é no-op e o `TextField` renderiza **sem estar registrado em formulário nenhum**. A story parecia verde e não verificava nada. **Corrigido nesta etapa** (trocado para `GenericFormBaseDecorator`), porque gerar o baseline de snapshots sobre uma story morta contaminaria toda a Etapa 7.

> O optional chaining em `methods?.register` é o que transforma "provider ausente" em falha silenciosa. Vale revisar se ele deve mesmo existir — sem ele, o erro apareceria na hora.

**b) `GenericMaskInput` depende dos dois contextos de formulário ao mesmo tempo.**
`GenericMaskInput.tsx:58` lê o `FormContext` customizado, enquanto o `TextMaskCustom` interno (`:15`) lê o contexto nativo do RHF. Como `FormProvider` **não** expõe o contexto do RHF (confirmado em `FormProvider.tsx` — ele só popula o `FormContext` próprio), não existe configuração de provider único em que o componente funcione inteiro:
- sob `GenericFormProvider` (correto para um `Generic*`): renderiza, mas **digitar** dispara `Cannot read properties of undefined (reading 'formSetValue')` no handler `onInput`;
- sob `FormProvider`: o `TextMaskCustom` fica sem `context.setValue`.

Isso atinge o `GenericInput` em todos os tipos mascarados (`cpf`, `cnpj`, `cep`, `phone`, `sei`, `number`…), já que ele delega para o `GenericMaskInput`. A correção provável é uma linha — `:58` passar a usar `useFormContext()` — mas é **mudança de comportamento da lib**, então fica fora da Etapa 0. A story foi escrita com o decorator arquiteturalmente correto de propósito, para o defeito ficar visível em vez de escondido por um decorator duplo.

**c) `CustomMenu` tipa `btProps` de forma estreita demais.**
`CustomMenu.tsx` declara `btProps?: ButtonProps` e repassa para `Bt`, que aceita `ButtonProps & { customColor?, customFontColor? }`. Em runtime `customColor` funciona; o TS recusa. Pegou no `npm run typecheck` ao escrever a story. Correção é alargar o tipo (não é breaking), mas também é mudança de lib — fica para a Etapa 2.

### 5.7 `src/components/teste/Teste.tsx`
952 linhas, importa `../../css/globals.css`, **não é exportado** no barrel `src/index.ts`. Candidato a remoção (existe `src/stories/Teste.stories.tsx` referenciando).

---

## 6. Rede de segurança (Etapa 0) — obrigatória antes de qualquer bump

O caso mais perigoso desta migração: **Grid v2 ignora `item`/`xs` silenciosamente**. Sem erro de TS (com `strict: false`), sem erro de build, sem erro de runtime — só o layout desanda. Nenhuma checagem atual pega isso.

**Ordem obrigatória dentro da Etapa 0** (a sequência importa):

1. `npm install` + build verde + lockfile commitado;
2. **as 12 stories que faltam** (2.3) — sem elas o baseline visual nasce com furo;
3. **gerar o baseline de snapshots** — antes de qualquer reformatação;
4. só então **ESLint/Prettier**, que vai mexer em formatação de muitos arquivos;
5. workflows (PR + portão de release), testes de auth e verificação de artefato.

**Decisões desta etapa já tomadas** (22/09/2026, seção 9, itens 7–9): snapshot visual com **Playwright + PNGs versionados, gerados só em container Linux no CI**; app de fumaça em **`examples/smoke-app`** neste repo; dist-tags `latest`/`next`/`legacy-v0`.

- [x] **Baseline verde:** `npm install` limpo, lockfile v3 commitado, `npm run build` passando; commit do baseline.
- [x] **`npm run typecheck`** (`tsc --noEmit` de verdade) rodando em PR. Avaliar ligar `strict` gradualmente (hoje `strict: false`).
- [x] **ESLint + Prettier no CI** (aprovado): `eslint` 9 (flat config) + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-storybook` + `eslint-config-prettier`, e `prettier --check` respeitando o `.prettierrc` existente (4 espaços, aspas simples, **sem ponto e vírgula**, `printWidth: 200`). Scripts `lint` e `format:check`. Primeiro PR só adiciona a config e corrige o que for automático; regras que gerariam ruído entram como `warn` para não travar o resto do plano.
- [x] **CI para Node 22** (`.github/workflows/publish.yaml` está em Node 16) + `npm ci` em vez de `npm install`.
- [x] **Workflow de PR** (hoje só existe workflow de publish em push na `main`): typecheck + lint + build + `build-storybook` + testes + snapshots.
- [x] **Portão de release** (2.4): parar de publicar em todo push na `main`. Opções: publicar só em tag `v*` (`on: push: tags: ['v*']`), ou manter o push na `main` mas com um passo que compara a versão do `lib-package.json` com a do npm (`npm view ... version`) e sai sem publicar se forem iguais. Adicionar também `workflow_dispatch` para republicar manualmente.
- [~] **`@storybook/addon-vitest` + Playwright:** cada story vira teste de render em browser real (falha em erro de console/render). É a única verificação automatizada viável sem app host.
- [x] **Escrever as 12 stories que faltam** (lista em 2.3), priorizando `GenericDatePicker`, `GenericMaskInput`, `MaskInput` e `GenericMultInput` — são os que a Etapa 7 mexe mais. As 34 stories atuais cobrem 30 dos 46 exports; o alvo é **todo export visual com pelo menos uma story**.
- [x] **Snapshots visuais** das stories via **Playwright, com os PNGs versionados no repo** (decisão 7). É o que pega a quebra silenciosa de Grid e de `slotProps`. Os snapshots são gerados e comparados **dentro de um container Linux fixo** (mesma imagem no CI e localmente, via `docker run`), senão o diff vira ruído de fonte/antialiasing do macOS.
- [x] **App de fumaça em `examples/smoke-app`** (decisão 8): um Next 14 mínimo consumindo a lib via `npm run link`, com uma página usando `FormProvider` + `Input` + `Table`/`GenericTable` + `DatePicker` + `Map` + auth. Único jeito de validar o cenário real "MUI vem do app". Precisa ficar fora do `include` do `tsconfig` da lib, fora do `build-storybook` e fora do pacote publicado.
- [x] **Verificação de artefato:** script comparando exports de `dist/index.d.ts` com `src/index.ts` (pega regressão de API pública) + `publint` e `@arethetypeswrong/cli` no `dist/`.
- [x] **Cobertura automatizada dos providers de auth** (decisão: preferência por teste automatizado em vez de validação manual no HMG). `KeycloakAuthProvider` (519 linhas) e `OAuthProvider` não têm story nem teste hoje. Plano:
    - `OAuthProvider`: usar o **bypass de localhost** já existente (`testIP`/`testToken`) para testar sem rede — login, `isAuth`/`userLoaded`, `hasRole`/`hasAnyRole`/`hasAllRoles`, gravação do cookie `nextauth.token`, avatar no `localStorage` e `logout`. Tokens de teste gerados no próprio teste (JWT não assinado), sem segredo no repo.
    - `KeycloakAuthProvider`: stub dos endpoints do Keycloak com **MSW** (`.well-known/openid-configuration`, `token`, `userinfo`, `logout`) + mock do módulo `keycloak-js` para cobrir `init`, refresh automático de token e expiração. Testa a nossa lógica sem depender do HMG.
    - **E2E opcional contra o Keycloak de HMG**, em job separado e fora do caminho de PR (roda sob demanda/agendado, com credenciais em secrets). Serve de rede de segurança na Etapa 6 (`keycloak-js` 25 → 26), que é o único ponto em que o protocolo real importa.

---

## 7. Plano por etapas

Uma etapa = um PR = um release. Nada de agrupar.

### Etapa 0 — Baseline + rede de segurança
Nenhuma dependência sobe (só entram devDependencies de teste/lint). Checklist e **ordem obrigatória** na seção 6.
**Validação:** build ok, typecheck ok, lint ok, **46 stories** verdes (34 atuais + 12 novas), snapshots baseline gerados, workflow de PR rodando e publish só por tag.

#### Registro de execução — 22/09/2026

Estado ao fim desta sessão (**nada commitado ainda**).

| Verificação | Comando | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | verde |
| Lint | `npm run lint` | 0 erros, 331 warnings (dívida conhecida, por desenho) |
| Formatação | `npm run format:check` | verde |
| Testes | `npm run test` | **14 testes**, 2 arquivos, verde |
| Build | `npm run build` | verde |
| API pública | `node scripts/check-public-api.mjs` | 77 exports, íntegra |
| Storybook | `npm run build-storybook` | verde |
| Snapshots | `npm run snapshots` | **83 stories**, 0 diffs, 0 erros de runtime |

**O que entrou:**

- `npm install` limpo, lockfile migrado para **v3**, build destravado (o `write-excel-file` estava UNMET).
- **11 arquivos de story novos** cobrindo os 12 componentes que não tinham nenhuma. Cobertura: **42 dos 46 exports** — os 4 restantes são `AUTH_COOKIE_NAME` e `AuthContext` (não visuais) e os dois providers de auth (cobertos por teste). As 83 stories individuais incluem variantes por componente.
- `scripts/visual-snapshots.mjs` + `scripts/snapshots-in-docker.sh`: Playwright dentro do container `mcr.microsoft.com/playwright:v1.55.0-noble`, PNGs versionados em `snapshots/baseline/`, diffs em `snapshots/__diff__/` (ignorado pelo git). Tolerância de 0,1% dos pixels. O script também falha se qualquer story emitir `pageerror`, o que cobre boa parte do que o `@storybook/addon-vitest` faria — por isso esse item ficou como parcial.
- **Relógio congelado** (`page.clock.setFixedTime`) + `timezoneId`/`locale` fixos. Sem isso, as stories que renderizam `new Date()` (`GenericTable/PaginacaoServerSide`, `TableWithStaticData`) diferiam a cada minuto. Duas execuções seguidas foram conferidas: zero diff.
- ESLint 9 flat config + Prettier, com `lint`/`lint:fix`/`format`/`format:check`. O `--fix` tocou 21 arquivos (só `let`→`const`, `var`→`const`, `Object`→`object`, `!!x`→`x`). **Conferido contra o baseline: zero diferença visual** — era exatamente para isso que a ordem "snapshots antes do lint" existia.
- Vitest + Testing Library + jsdom, com 14 testes dos dois providers de auth. `keycloak-js` é mockado no nível do módulo; o `OAuthProvider` usa o bypass de localhost que já existia. Tokens de teste são JWT não assinados gerados em `src/test/jwt.ts` — nenhum segredo no repo.
- `.github/workflows/ci.yaml` (novo): typecheck, lint, format, testes, build, API pública, publint+attw, build-storybook e snapshots, em Node 22 com `npm ci`. Os diffs visuais sobem como artifact quando falha.
- `.github/workflows/publish.yaml` reescrito: publica só por tag `v*` ou `workflow_dispatch`, confere que a tag bate com o `lib-package.json`, recusa versão já publicada e escolhe a dist-tag (pré-release → `next`).
- `examples/smoke-app`: Next 14 consumindo `file:../../dist`, com um tema roxo proposital que denuncia MUI duplicado.
- `engines.node: >=20.19` no `package.json`.

**Correções de story/config que entraram junto** (nenhuma toca o código da lib):

- `.storybook/main.ts` tinha `addons: []` com o `@storybook/addon-docs` instalado: **as 44 páginas de docs simplesmente não existiam** e o `tags: ['autodocs']` de toda story era inerte.
- As 3 stories `Exemplo/*` estavam **quebradas** (tela de erro do Storybook): renderizavam `<Source>` do addon-docs dentro do canvas, onde não há `DocsContext`. Trocadas por um `CodeSample` local.
- `GenericInput.stories.tsx` usava o decorator errado (ver 5.8a).
- `Table.stories.tsx` estava **inteiramente comentada** — dependia do json-server na porta 7171. Reescrita com `fetchFunc` devolvendo `Response` de um JSON estático, e tipada contra a `TableProps` atual (a story `Base/Table (sem o fetchFunc)` passa props obsoletas usando `as unknown`).

**Achados que NÃO foram corrigidos** (mudam comportamento da lib, então saem da Etapa 0): seções **5.8**, **5.9** e **5.10**. O 5.9 (`main`/`exports.require` apontando para arquivo inexistente) é o mais urgente.

---

### Etapa 1 — Packaging correto → `0.1.0`
- [ ] Declarar `peerDependencies` no `lib-package.json` conforme seção 3 (com MUI ainda em `^5.0.0`).
- [ ] Mover `react-hook-form`, `dayjs`, `react-toastify` de `dependencies` para `peerDependencies`.
- [ ] Espelhar em `devDependencies`.
- [ ] **Abandonar `0.0.x`** e passar a usar semver de verdade a partir de `0.1.0`. Atualizar a convenção de commit (`vNNN - ...`) para refletir isso.
- [ ] Documentar no `README.md` o contrato de peers.

**Impacto no consumidor:** nenhum funcional — apenas warnings de peer corretos no `npm install`.
**Validação:** `publint` + `attw` no `dist/`, app de fumaça.

### Etapa 2 — Limpeza e desacoplamento
- [ ] Remover `react-google-recaptcha` + `@types` (5.1).
- [ ] Remover `react-query`: hook de fetch interno no `AutoComplete` + limpar os 3 decorators (5.2).
- [ ] Remover `cookies-next`: helper interno de cookies (5.3).
- [ ] Remover `@mui/lab`: `LoadingButton` → `<Button loading>` (5.4).
- [ ] Apagar `decorators/` da raiz (5.5).
- [ ] Excluir `stories/` e `decorators/` do build (5.6).
- [ ] Decidir sobre `src/components/teste/Teste.tsx` (5.7).

**Impacto:** nenhuma mudança visual; os apps podem remover `react-query` da árvore.
**Validação:** snapshots **idênticos** ao baseline; diff de exports vazio.

### Etapa 3 — Build: `microbundle` → `tsup`
- [ ] Migrar o build (cjs + esm + d.ts), com `'use client'` **preservado** e externals explícitos.
- [ ] Manter os subpath exports atuais (`./types/auth`, `./types/form`).
- [ ] Rodar `publint` + `attw`.

**Impacto:** nenhum — melhora o suporte a App Router.
**Validação:** diff de exports, app de fumaça, comparar tamanho/forma do `dist/`.

### Etapa 4 — Lote de minors/patches seguros
- [ ] Tudo da seção 4.1, num PR só.

**Validação:** stories + snapshots idênticos.

### Etapa 5 — Storybook 9 → 10
- [ ] `npx storybook@latest upgrade`; converter `.storybook/main.ts` e `preview.ts` para ESM-only.
- [ ] Remover `@storybook/testing-library` (0.2.2, deprecado; não é usado em nenhuma story) — usar `storybook/test`.
- [ ] Confirmar Node ≥ 20.16 no CI e no `engines` do `package.json`.

**Impacto:** nenhum (dev only).
**Validação:** `build-storybook` + suíte vitest verdes.

### Etapa 6 — Libs de runtime de risco médio (um PR por lib, nesta ordem)
- [ ] `jwt-decode` 3 → 4
- [ ] `react-imask` 6 → 7
- [ ] `react-toastify` 10 → 11 (decidir o destino do CSS vendorizado)
- [ ] `react-dropzone` 14 → 20
- [ ] `keycloak-js` 25 → 26

**Validação:** story dedicada por lib + app de fumaça. Para `keycloak-js` 25 → 26: suíte com MSW da Etapa 0 + **e2e contra o Keycloak de HMG** (job sob demanda). Teste manual só se o e2e apontar divergência.

### Etapa 7 — MUI 5 → 9 (a grande) → `1.0.0`
Sub-etapas, cada uma com snapshots revisados:

- [ ] **5 → 6** (`npx @mui/codemod@latest v6.0.0/preset-safe src`)
- [ ] **6 → 7** (`npx @mui/codemod@latest v7.0.0/grid-props src`, `v7.0.0/input-label-size-normal-medium src`, `deprecations/*`)
- [ ] **7 → 9** (`npx @mui/codemod@latest deprecations/text-field-props src`)
- [ ] **Grid v2 em 28 arquivos de `src/` + 3 stories** (lista no Apêndice A): `<Grid item {...{xs,sm,md}}>` → `<Grid size={{ xs, sm, md }}>`. **Manter `xs`/`sm`/`md` como props públicas** e mapear internamente.
- [ ] **`slotProps` em 8 arquivos** (Apêndice B): `InputProps` → `slotProps.input`, `inputProps` → `slotProps.htmlInput`, `InputLabelProps` → `slotProps.inputLabel`, `FormHelperTextProps` → `slotProps.formHelperText`, `SelectProps` → `slotProps.select`.
- [ ] **`@mui/x-date-pickers` 6 → 9** (`npx @mui/x-codemod@latest v9.0.0/pickers/preset-safe src`). `enableAccessibleFieldDOMStructure` deixa de existir (estrutura acessível passa a ser obrigatória); `PickersDay` → `PickerDay`.
- [ ] **Ajustes de comportamento:** `Stepper` agora renderiza `<ol>` e `Step` `<li>` (revisar CSS do `Stepper`/`StepperBlock`); `Grid` não aceita mais `direction="column"` (usar `Stack`); `InputLabel` `size` `normal` → `medium`; deep imports com mais de um nível deixam de funcionar (revisar `@mui/material/Grid`, `@mui/icons-material/Save` etc.).
- [ ] **Browsers mínimos sobem** para Chrome 117+, Firefox 121+, Safari 17+ — **sem impedimento** (decisão: o público dos sistemas usa browsers recentes). Registrar no `README.md`.
- [ ] Abrir o peer para `"@mui/material": "^7.0.0 || ^9.0.0"`.
- [ ] Publicar **`1.0.0-rc.1` sob a dist-tag `next`** (`npm publish --tag next`), o app piloto valida em homologação instalando `@ssplib/react-components@next`, e só depois promover para `latest` (`npm dist-tag add @ssplib/react-components@1.0.0 latest`). **Nunca** publicar o `1.0.0` direto em `latest` — é o que impede a quebra simultânea de todos os apps.
- [ ] Atualizar `README.md` (hoje diz "baseada em MUI v5") e `DESIGN_SYSTEM.md`.

**Impacto:** **breaking coordenado** — os apps precisam estar em MUI ≥ 7 (alvo: 9). **Aprovado:** todos os apps podem subir.
**Validação:** snapshots visuais componente a componente + app de fumaça com MUI 9 + **1 app piloto real** em homologação antes de liberar para os demais.

### Etapa 8 — React 19 / Next 16 (**planejada**) → `2.0.0`
- [ ] `@types/react` 19, `@types/react-dom` 19.
- [ ] `JSX.Element` → `React.JSX.Element` em 10 arquivos (Apêndice C).
- [ ] Revisar os 2 `forwardRef` (`MaskInput.tsx:15`, `GenericMaskInput.tsx:7`).
- [ ] `react-leaflet` 4 → 5. **Atenção:** a v5 tem peer `react ^19.0.0` **estrito** — publicar isso torna React 19 **obrigatório** para todos os apps. É o único pacote do plano que força a versão do React, então ele fecha a etapa, depois dos apps já estarem migrados.
- [ ] Next 16: exige Node ≥ 20.9. Avaliar App Router vs. os 6 arquivos que usam `next/router` (Pages Router) — `NavBar.tsx`, `TabNavBar.tsx`, `KeycloakAuthProvider.tsx`, `OAuthProvider.tsx` (+ `next/dynamic` em `map/index.tsx`). O Pages Router continua suportado no Next 16, então não é obrigatório reescrever agora.
- [ ] `cookies-next` foi removido na Etapa 2 (helper interno) — **não precisa voltar**. Só reavaliar se quisermos o helper deles de novo.

**Impacto:** breaking coordenado → publicar como **major `2.0.0`** com peer `react: ^19.0.0`. A lib fica em `react: ^18 || ^19` desde a Etapa 1, então até aqui os apps em React 18 continuam atendidos por `1.x`.

### Etapa 9 — TypeScript 7
- [ ] O `latest` do npm já é `7.0.2` (port nativo em Go). Ficar em **5.9 até a Etapa 8 concluir** e então subir, com dois critérios objetivos de entrada: (a) `tsup`/`rollup-plugin-dts` e o Storybook em uso geram `.d.ts` corretos com TS 7; (b) `typescript-eslint` suporta TS 7 na versão que estivermos usando. Se algum falhar, permanecer em 5.9 — é a única dependência do plano em que "mais nova" ainda não é claramente melhor.

---

## 8. Estratégia de convivência com os apps

- **Branches:** `v0-legacy` (MUI 5) recebe só correções; `main` vira `1.x` (MUI ≥ 7).
- **Ordem de rollout:** 1 app piloto em homologação → demais apps, um a um.
- **Range amplo de peer** (`^7 || ^9`) dá janela de migração: o app sobe de MUI 5 → 7 sem precisar ir direto ao 9.
- **Semver de verdade** a partir da Etapa 1. Breaking change = major. Nunca mais em patch.
- **Changelog:** criar `CHANGELOG.md` com as quebras de cada release (hoje só existe a mensagem de commit `vNNN - ...`).
- **Portão de release:** publicação deixa de ser automática em push na `main` (2.4). Release é ato explícito — tag ou `workflow_dispatch`.
- **Dist-tags:** `latest` = versão estável recomendada; `next` = pré-releases (`1.0.0-rc.x`, `2.0.0-rc.x`) para o app piloto; `legacy-v0` apontando para a última `0.0.x`, para quem ainda estiver em MUI 5 conseguir fixar sem decorar número de versão.
- **Rollback:** se um release quebrar, `npm dist-tag add <versao-anterior> latest` restaura em segundos (não usar `npm unpublish`, que quebra quem já instalou). Depois `npm deprecate` na versão ruim com a mensagem do que fazer.

---

## 9. Decisões tomadas (21–22/09/2026)

| # | Decisão | Efeito no plano |
|---|---|---|
| 1 | **Os apps podem subir o MUI.** Alvo: MUI 9 | Etapa 7 está liberada para sair como release estável `1.0.0` |
| 2 | **Atualizar tudo para as versões mais recentes**, incluindo React 19 / Next 16 | Etapa 8 deixa de ser opcional e passa a ser planejada (`2.0.0`), com `react-leaflet` 5 no fim dela |
| 3 | **Manter o branch `v0-legacy`** | Quem ficar em MUI 5 segue recebendo correções na linha `0.0.x` |
| 4 | **ESLint entra** | Adicionado à Etapa 0 (flat config + `typescript-eslint` + `prettier --check`) |
| 5 | **Existe Keycloak de HMG, mas a preferência é teste automatizado** | Etapa 0 ganha suíte de auth com bypass de localhost + MSW; o HMG fica como e2e sob demanda, usado na Etapa 6 |
| 6 | **Usuários usam browsers recentes** | Os mínimos do MUI 9 (Chrome 117+, Firefox 121+, Safari 17+) não são impedimento |
| 7 | **Snapshot visual: Playwright com PNGs versionados no repo** (decidido em 22/09/2026) | Sem Chromatic, sem custo externo. Exige **fixar um container Linux no CI** para gerar e comparar os PNGs — screenshot gerado no macOS não bate com o do CI (antialiasing/fontes). Regra: os PNGs do baseline **só são gerados dentro do container**, nunca na máquina de quem desenvolve |
| 8 | **App de fumaça em `examples/smoke-app` neste repo** (decidido em 22/09/2026) | A validação "MUI vem do app" roda no CI sem token nem checkout cruzado. Precisa ficar **fora do `tsconfig`/build da lib** e fora do pacote publicado (`.npmignore`/`files`), e ter `node_modules` próprio |
| 9 | **Dist-tags confirmadas** (decidido em 22/09/2026) | `latest` = estável, `next` = pré-releases (`1.0.0-rc.x`), `legacy-v0` = última `0.0.x`. Exatamente como na seção 8 |

**Informação pendente (não bloqueia o início):** a **lista dos sistemas que consomem a lib**. Necessária na Etapa 7 para escolher o app piloto e ordenar o rollout. Ideal levantar com `npm` ou por busca nos repos da organização e registrar aqui.

### Único ponto que ainda depende de calendário

`react-leaflet` 5 tem peer `react ^19.0.0` **estrito**: no dia em que ele entrar, React 19 passa a ser obrigatório em **todos** os apps. Por isso ele é o último item da Etapa 8, e a lib declara `react: ^18 || ^19` desde a Etapa 1 — assim `1.x` atende os apps em React 18 enquanto eles migram, e `2.0.0` só sai quando todos estiverem em React 19. Nenhum outro pacote do plano força a versão do React.

---

## Apêndice A — Arquivos com `<Grid>` a migrar (Etapa 7)

`src/` (28):
```
src/components/detalhes/Category.tsx
src/components/detalhes/Field.tsx
src/components/detalhes/FieldLabel.tsx
src/components/detalhes/File.tsx
src/components/form/checkbox/CheckBox.tsx
src/components/form/checkbox/CheckBoxAdditional.tsx
src/components/form/checkbox/CheckBoxWarning.tsx
src/components/form/checkbox/RequiredCheckBoxValidator.tsx
src/components/form/date/DatePicker.tsx
src/components/form/date/GenericDatePicker.tsx
src/components/form/date/TimePicker.tsx
src/components/form/file/DropFileUpload.tsx
src/components/form/file/FileUpload.tsx
src/components/form/input/ActiveInput.tsx
src/components/form/input/AutoComplete.tsx
src/components/form/input/FetchAutoComplete.tsx
src/components/form/input/FixedAutoComplete.tsx
src/components/form/input/GenericFetchAutoComplete.tsx
src/components/form/input/GenericInput.tsx
src/components/form/input/GenericMultInput.tsx
src/components/form/input/Input.tsx
src/components/form/input/MultInput.tsx
src/components/form/input/OptionalInput.tsx
src/components/form/input/OtherCheckBox.tsx
src/components/form/radio/Radio.tsx
src/components/form/stepper/StepperBlock.tsx
src/components/form/table/GenericTable.tsx
src/components/form/table/Table.tsx
```

Stories (3):
```
src/stories/ExemploAssitirValorInput.stories.tsx
src/stories/ExemploInputs.stories.tsx
src/stories/ExemploValoresCompartilhados.stories.tsx
```

Atenção especial: `src/components/form/input/Input.tsx:45,52-54` tipa as props públicas via `GridProps` (`Omit<GridProps, 'item' | 'xs' | 'sm' | 'md'>`, `GridProps['xs']`) — esses tipos mudam na v9.

## Apêndice B — Arquivos com props legadas → `slotProps` (Etapa 7)

```
src/components/form/input/FetchAutoComplete.tsx   (FormHelperTextProps)
src/components/form/input/FixedAutoComplete.tsx   (FormHelperTextProps)
src/components/form/input/GenericMaskInput.tsx    (InputProps)
src/components/form/input/Input.tsx               (InputLabelProps, FormHelperTextProps)
src/components/form/input/MaskInput.tsx           (InputProps)
src/components/form/input/MultInput.tsx           (FormHelperTextProps)
src/components/form/table/GenericTable.tsx        (InputProps)
src/components/form/table/Table.tsx               (InputProps)
```

## Apêndice C — Arquivos com `JSX.Element` global (Etapa 8)

```
src/components/form/checkbox/CheckBox.tsx
src/components/form/checkbox/CheckBoxAdditional.tsx
src/components/form/checkbox/RequiredCheckBoxValidator.tsx
src/components/form/stepper/StepperBlock.tsx
src/components/form/switch/ToggleVisibility.tsx
src/components/form/table/types.ts
src/components/modal/Modal.tsx
src/components/navbar/NavBar.tsx
src/components/navbar/TabNavBar.tsx
src/components/providers/SspComponentsProvider.tsx
```

## Apêndice D — Referências

- MUI v6 → v7: https://mui.com/material-ui/migration/upgrade-to-v7/
- MUI v7 → v9: https://mui.com/material-ui/migration/upgrade-to-v9/
- Grid v2: https://mui.com/material-ui/migration/upgrade-to-grid-v2/
- MUI X Pickers v8 → v9: https://mui.com/x/migration/migration-pickers-v8/
- Storybook 10: https://storybook.js.org/docs/releases/migration-guide
- Storybook Vitest addon: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
