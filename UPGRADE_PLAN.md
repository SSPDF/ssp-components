# Plano de atualização de dependências

> **Status:** Etapas 0, 1 e 2 concluídas e commitadas (23/09/2026) no branch único `atualizacao-dependencias` (ainda não mergeado na `main`, nada publicado). **Etapa 2.1** (peer `next` aberta para 15/16 → `0.2.1`) testada e documentada em 23/09/2026. **Etapa 3** (`microbundle` → `tsdown` → `0.3.0`) executada em 24/09/2026, não commitada — ver o registro dela (dois bugs de interop achados e corrigidos; o 🚭 node16-ESM do attw fica para a Etapa 7). **Próxima: Etapa 4.** Documento de trabalho — marque os checkboxes conforme as etapas forem concluídas.
> **Análise feita em:** 21/09/2026, sobre a versão `0.0.349` (branch `main`, commit `7e017da`). **Revalidada em 22/09/2026** e **de novo em 23/09/2026, após a Etapa 1** — contra o código, o registry do npm e o que a execução das Etapas 0 e 1 mostrou. O resultado dessa revalidação está na **seção 10**; as seções abaixo já foram corrigidas conforme ela.
> **Decisões tomadas em:** 21/09/2026 e 22/09/2026 — ver seção 9. **Alvo aprovado: as versões mais recentes de tudo**, incluindo MUI 9, Storybook 10, React 19 e Next 16, com ESLint e branch `v0-legacy`.
> **Decisões de 23/09/2026:** **D1 decidida** — `tsdown` em modo `unbundle`, saída ESM + CJS (ESM-only reavaliado na Etapa 7). **D2 em aberto** — como a linha `1.x` atende React 18 *e* 19 (nenhuma versão do `react-leaflet` aceita os dois); não bloqueia nada até a Etapa 7. Detalhes na seção 9.
> **Regra de ouro:** nenhuma etapa avança sem a validação da etapa anterior estar verde. As Etapas 0–6 podem ir para produção **sem tocar em nenhum app consumidor**; só as Etapas 7 e 8 exigem mutirão.

---

## 1. Por que este documento existe

41 dependências estão atrasadas, várias com majors acumulados (MUI 5→9, Storybook 9→10, react-query v3 sem manutenção desde jan/2023, `microbundle` abandonado desde 2022). A lib é consumida por vários sistemas internos e **não tinha testes nem lint** — as 34 stories eram a única superfície de verificação, e ninguém as executava automaticamente. *(Desde a Etapa 0: typecheck, lint, 14 testes de auth, snapshots visuais de 83 stories e verificação do pacote, tudo no CI.)*

O objetivo é chegar nas versões atuais **sem quebrar os apps**, em etapas pequenas e verificáveis.

---

## 2. Achados críticos da análise

### 2.1 O baseline atual está quebrado — ✅ resolvido na Etapa 0

- `npm run build` **falha** em máquina com `node_modules` do último `npm install` antigo: `write-excel-file` fica UNMET (é importado em `src/components/form/table/utils.tsx:5` como `write-excel-file/browser`) e o `axios` instalado é 1.6.7 contra `^1.17.0` declarado.
- `package-lock.json` está defasado: diz versão `0.0.347` e é `lockfileVersion: 2`.
- CI (`.github/workflows/publish.yaml`) usa **Node 16** (EOL) com `npm install` (ignora o lock). `write-excel-file@4` declara `engines: node >=18`; Storybook 10 exige Node 20.16+/22.19+.
- `tsconfig.json` tem `strict: false` + `noEmit: true` → o compilador praticamente não protege nada. **Quebra de layout do MUI não gera erro de TS.** *(Continua verdade: o `strict` segue desligado. É por isso que os snapshots visuais existem.)*

### 2.2 O risco nº 1 é o packaging, não a versão das libs — ✅ declarado na Etapa 1 (`0.1.0`)

O `lib-package.json` (o package.json que é realmente publicado) **não declara `peerDependencies` e não lista `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-date-pickers` nem `@emotion/*`** — confirmado no pacote publicado `0.0.349` no npm. Mas o bundle importa todos eles como externos (veja `dist/index.esm.js`: `from"@mui/material"`, `from"@mui/x-date-pickers"`, `from"@mui/lab"`…).

**Consequência: a versão do MUI que roda em produção é a do app consumidor.**

- Subir MUI 5→9 dentro da lib **não tem efeito** num app que tem MUI 5 instalado — e o código novo (Grid `size`, `slotProps`) quebra em runtime contra o MUI 5 do app, **sem erro de compilação**.
- Não existe "atualizar o MUI sem tocar nos apps". É migração coordenada, obrigatoriamente.
- `react-hook-form`, `react-query`, `dayjs` e `react-toastify` estão como `dependencies` (não peers) → risco real de duas instâncias na árvore, com contexto de RHF/react-query duplicado e `toast()` de singletons diferentes. *(RHF, `dayjs` e `react-toastify` viraram peers na `0.1.0`; o `react-query` sai na Etapa 2.)*
- Agravante de processo: **tudo sai como patch `0.0.x`**, inclusive mudanças breaking. É o que mais machuca os consumidores hoje. *(Semver a partir da `0.1.0`, com `CHANGELOG.md`.)*

O `README.md` já instrui o consumidor a instalar o MUI manualmente — ou seja, o contrato de peer existe na documentação, mas não no `package.json`.

#### 2.2.1 `@mui/lab` não é só peer faltando — é dependência não declarada (bug ativo) — ✅ corrigido na `0.1.0`

Comparando os dois manifestos, estes estão em `package.json` mas **não** em `lib-package.json` (o que é publicado):

```
@emotion/react   @emotion/styled   @mui/material
@mui/icons-material   @mui/lab   @mui/x-date-pickers
```

Para MUI/Emotion isso "funciona por acidente": o app consumidor instala essas libs de qualquer forma, então o import externalizado resolve. **`@mui/lab` é o caso diferente** — nenhum app instala `@mui/lab` por conta própria, e `src/components/form/stepper/Stepper.tsx:4` importa `LoadingButton` dele em runtime. Como o microbundle externaliza tudo que está no `package.json` da raiz, o `dist` publicado carrega um `import '@mui/lab'` que **ninguém declara e ninguém instala** → o `Stepper` provavelmente já está quebrado em produção em qualquer app sem `@mui/lab` na árvore por outro motivo.

> **Corrigido na `0.1.0` (Etapa 1)**, e não num hotfix `0.0.350` separado: `@mui/lab` entrou em `dependencies`, fixado em `5.0.0-alpha.127`. Não dá para usar `^5.0.0-alpha.127` — o range resolve para o `alpha.177`, cuja peer é `@mui/material >=5.15.0`, e o `npm install` de um app em MUI 5.12 falharia com `ERESOLVE`. O `alpha.127` tem peer `^5.0.0`. Quem estiver fixado em `^0.0.349` não recebe a correção (em `0.0.x` o `^` fixa a versão); se algum app precisar dela sem subir para `0.1.0`, publicar `0.0.350` a partir de `v0-legacy` só com esta linha.

**Consequência no plano:** enquanto a lib estiver em MUI 5, `<Button loading>` não existe (é nativo só a partir do 6.4), então a correção imediata foi **declarar `@mui/lab`**; a remoção do `LoadingButton` acontece na **Etapa 7**, junto com o salto de MUI — **não na Etapa 2**, onde o item 5.4 estava listado originalmente (ver Etapa 2).

**Mesmo mecanismo, outro pacote:** a Etapa 1 achou o `@mui/system` sendo importado sem declaração — só que, por não estar em nenhum manifesto, ele nem virou import externo: foi **copiado para dentro do bundle** (5.12).

**Achado menor:** `dayjs` diverge entre os manifestos — `^1.11.11` na raiz, `^1.11.7` no `lib-package.json`. ~~Alinhar na Etapa 1.~~ Resolvido na Etapa 1: virou peer `^1.11.0` nos dois manifestos.

### 2.3 A cobertura de stories é menor do que parece: 16 dos 46 exports não têm nenhuma — ✅ resolvido na Etapa 0

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

### 2.4 Qualquer push na `main` publica no npm — ✅ resolvido na Etapa 0 (publica só por tag `v*`/`workflow_dispatch`)

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

**Estado atual (`0.2.1`, Etapa 2.1)** — só o que é verdade hoje:

```json
"peerDependencies": {
    "@emotion/react": "^11.9.0",
    "@emotion/styled": "^11.8.1",
    "@mui/icons-material": "^5.0.0",
    "@mui/material": "^5.8.6",
    "@mui/x-date-pickers": "^6.0.0",
    "dayjs": "^1.11.0",
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-hook-form": "^7.43.0",
    "react-toastify": "^10.0.0"
}
```

**Estado final (após a Etapa 7)** — corrigido na revalidação de 23/09/2026:

```json
"peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0",
    "@mui/material": "^7.3.0 || ^9.0.0",
    "@mui/icons-material": "^7.0.0 || ^9.0.0",
    "@mui/x-date-pickers": "^8.0.0 || ^9.0.0",
    "@emotion/react": "^11.9.0",
    "@emotion/styled": "^11.8.1",
    "react-hook-form": "^7.43.0",
    "dayjs": "^1.11.0",
    "react-toastify": "^11.0.0"
}
```

O que mudou em relação à versão original desta seção, e por quê (tudo conferido no registry):

- **`@mui/material` `^7.3.0`, não `^7.0.0`:** o `@mui/x-date-pickers@9` declara peer `@mui/material ^7.3.0 || ^9.0.0`. Um app em MUI 7.0–7.2 não instala.
- **Emotion `^11.9.0`/`^11.8.1`:** é o piso do `x-date-pickers` (6 e 9). O `^11.5`/`^11.3` original era o piso do `@mui/material`, mais frouxo que o real.
- **`@mui/x-date-pickers` `^8 || ^9`, não `^7 || ^9`:** a API que a Etapa 7 vai escrever (estrutura acessível, `PickerDay`) é a da v8+; a v7 não foi considerada em lugar nenhum do plano. Atenção: o `x-date-pickers@8` aceita `@mui/material ^5.15.14 || ^6 || ^7` — **não aceita MUI 9**. Então app em MUI 9 usa pickers 9; app em MUI 7 pode usar 8 ou 9. O range é coerente, mas o README precisa dizer isso.
- **`@mui/icons-material@9` exige `@mui/material ^9.4.0`** (e o 7 exige o 7). O range `^7 || ^9` continua certo — cada app instala o par que casa com o seu MUI —, mas as `devDependencies` da lib precisam ser um par coerente.
- **`react ^18 || ^19` só é possível se a decisão D2 for resolvida** — hoje o `react-leaflet` (dependência direta) não tem versão que aceite os dois. Ver 4.3 e seção 9.
- **`next ^15 || ^16` pode abrir antes do React 19:** o `next@16` declara peer `react ^18.2.0 || ^19.0.0`. O bloqueio para abrir o `next` é o `cookies-next@4` (Etapa 2) e testar o smoke-app no 15/16, não o React. — ✅ **aberto na `0.2.1` (Etapa 2.1)**.

> O range de MUI só pode abrir **depois** da Etapa 7. Até lá, a linha `0.x`/`v0-legacy` declara `"@mui/material": "^5.8.6"`.
>
> **Decisão:** todos os apps estão liberados para ir ao **MUI 9**. Mesmo assim mantemos o range em `^7 || ^9` como janela de segurança — o código escrito para Grid v2 + `slotProps` roda nas duas versões, e isso permite que um app suba para 7 primeiro se precisar, sem travar o release da lib.

As mesmas versões devem ir para `devDependencies` (é o que o Storybook usa localmente) **e continuar em `peerDependencies` do `package.json` da raiz** — o microbundle só externaliza o que está em `dependencies`/`peerDependencies`; o que estiver só em `devDependencies` é embutido no `dist/` sem aviso (foi o que aconteceu com o `@mui/system`, 5.12). Também vale adicionar `peerDependenciesMeta` marcando `next` e `react-leaflet`/`leaflet` como opcionais se quisermos permitir uso fora do Next — hoje `NavBar`, `TabNavBar`, `KeycloakAuthProvider`, `OAuthProvider` e `map/index.tsx` importam `next/router`, `next/image`, `next/link` e `next/dynamic`, então **Next é obrigatório de fato** (Pages Router).

### Continuam como `dependencies` normais (auto-contidas, sem estado compartilhado)

`lodash.get`, `lodash.clonedeep`, `lodash.hasin`, `tinycolor2`, `jszip`, `write-excel-file`, `axios`, `jwt-decode`, `keycloak-js`, `leaflet`, `leaflet-defaulticon-compatibility`, `react-leaflet` (*este último depende da decisão D2 — pode virar peer opcional*). Enquanto a Etapa 7 não acontece, também `@mui/lab`, fixado em `5.0.0-alpha.127` (2.2.1).

### O detalhe que evita o "upgrade em lockstep"

Peer **não** obriga todos os apps a subirem no mesmo dia, se o range for amplo — e aqui dá:

- **MUI 7 e 9 compartilham a API que nos interessa**: `Grid` já é o Grid v2 (`size={{ xs, sm, md }}`) e `slotProps` já é o caminho oficial. Código escrito para a v7 **roda nas duas**.
- MUI 5 e 6 ficam fora porque lá o Grid v2 só existe como `Unstable_Grid2`/`Grid2`.

**Desenho do release da Etapa 7:** migrar o código para Grid v2 + `slotProps`, declarar `"@mui/material": "^7.3.0 || ^9.0.0"` e publicar `1.0.0`. Cada app sobe de MUI 5 → 7 (ou direto para 9) no seu próprio ritmo. Quem ficar em MUI 5 permanece na linha `v0-legacy`.

E: **manter `xs`/`sm`/`md` como props públicas dos componentes**, mapeando para `size` internamente, para que a migração do Grid não apareça na API que os apps consomem.

---

## 4. Inventário de versões

Levantado com `npm outdated` + consulta de `peerDependencies` no registry em 21/09/2026; **atualizado em 23/09/2026** (mudanças marcadas com *23/09*).

### 4.1 Risco baixo — interno, sem impacto no consumidor

| Pacote | Atual | Alvo |
|---|---|---|
| `@babel/preset-env` / `-react` / `-typescript` | 7.27–7.28 | 7.29.7 |
| `@tsconfig/recommended` | 1.0.2 | 1.0.13 |
| `@types/node` | 20.17 | 20.19 (Node 22: avaliar `^22`) |
| `@types/react` / `@types/react-dom` | 18.0.37 / 18.3.0 | 18.3.31 / 18.3.7 |
| `@types/leaflet`, `@types/lodash.*`, `@types/tinycolor2` | várias | latest |
| `@types/keycloak-js` | 3.4.1 | ***23/09*: remover** — é um stub obsoleto (o `latest` do npm é 2.5.4, *menor* que o instalado); o próprio npm o descreve como *"stub types definition… keycloak-js provides its own type definitions"* (o `keycloak-js` 25 já traz `dist/keycloak.d.ts`) |
| `typescript` | 5.8.3 | **5.9.3** (não 7.x — ver Etapa 9) |
| `dayjs` | 1.11.11 | 1.11.23 |
| `jszip` | 3.10.1 | 3.10.2 |
| `axios` | ^1.17.0 (1.6.7 instalado) | 1.20.0 |
| `@emotion/react` / `styled` | 11.10.6 | 11.14.x |
| `react-hook-form` | 7.43.9 | 7.88.0 (peer desde a `0.1.0` — sobe só na `devDependency`) |
| `react` / `react-dom` | 18.2.0 | 18.3.1 |
| `next` | 14.2.35 | 14.2.35 (já é o último do 14) |
| `storybook` (pacotes 9.x) | core 9.1.20; `addon-docs`/`addon-links`/`react-webpack5` fixados em 9.0.17; `@storybook/nextjs` 9.0.17 | alinhar todos em 9.1.20 (*23/09*: o core já estava em 9.1.20 — versões desalinhadas entre os pacotes do Storybook) |
| `react-toastify` | 10.0.4 | 10.0.6 (peer desde a `0.1.0`) |
| `write-excel-file` | 4.0.7 | 4.1.1 |
| `react-imask`, `react-dropzone` | 6.6.0, 14.3.8 | 6.6.3, 14.4.1 (patch dentro do major; o salto é na Etapa 6) |

### 4.2 Risco médio — breaking contido, 1 PR por item

| Pacote | Salto | O que muda / onde |
|---|---|---|
| `jwt-decode` | 3 → 4 | export default → named `jwtDecode`. Afeta `src/components/providers/OAuthProvider.tsx:2,62,115,117` (linhas atualizadas em 23/09) |
| `react-imask` | 6 → 7 | imask 7. Afeta `MaskInput.tsx`, `GenericMaskInput.tsx` (já usam `as any`, risco baixo) |
| `react-toastify` | 10 → 11 | API do `ToastContainer` e **CSS reescrito**. Temos fork vendorizado em `src/css/ReactToastify.css` (704 linhas, com `sourceMappingURL`) — decidir entre importar do pacote ou refazer o fork |
| `react-dropzone` | 14 → 20 | `DropFileUpload.tsx:70` (`inputRef`, tipos de `DropzoneOptions`). *23/09:* a v20 declara **`engines: node >= 22`** — app que builda em Node 20 recebe `EBADENGINE` (aviso; erro se usar `engine-strict`). Conferir o Node dos apps antes |
| `keycloak-js` | 25 → 26 (26.2.4) | init/refresh/SSO em `KeycloakAuthProvider.tsx` (519 linhas, sem story — **coberto pelos testes da Etapa 0**) |
| Storybook | 9 → 10 | **configs ESM-only** + Node 20.16+/22.19+. `@storybook/nextjs` e `@storybook/react-webpack5` continuam existindo em 10.x |
| `microbundle` | → **`tsdown`** (D1, decidida em 23/09) | Abandonado desde ago/2022 (último release 0.15.1, 12/08/2022) e **descarta o `'use client'`** (o build imprime `Module level directives cause errors when bundled, 'use client' was ignored`) — afeta `Map.tsx` e `DraggableMarker.tsx` no App Router |

### 4.3 Risco alto — exige coordenação com os apps

| Pacote | Salto | Bloqueio / impacto |
|---|---|---|
| `@mui/material` + `@mui/icons-material` | 5.12 → **9.4** | **Não existe v8** (5 → 6 → 7 → 9). `GridLegacy` foi **removido na v9** → `<Grid item xs>` morre em **28 arquivos de `src/` + 3 stories** |
| `@mui/x-date-pickers` | 6 → 9 (9.14) | Exige `@mui/material ^7.3 \|\| ^9` — acoplado ao passo do MUI. **Também é um dos três pacotes que hoje prendem o React em 18** (peer da v6: `react ^17 \|\| ^18`) |
| `@mui/lab` | 5 → 9 | **Sem release estável desde a v5** (latest = `9.0.0-beta.9`, confirmado em 23/09). Uso único: `LoadingButton` em `Stepper.tsx:141` → **remover a dependência** (Etapa 7). Até lá, fixado em `5.0.0-alpha.127` |
| `react-query` v3 | → `@tanstack/react-query` v5 | v3 sem manutenção desde 25/01/2023, e peer `react ^16.8 \|\| ^17 \|\| ^18` — **prende o React em 18**. Muda o contexto para os apps → **melhor remover da lib** (ver 5.2) |
| `cookies-next` | 4 → 6 | peer **`next >= 15`** → **remover a dependência** (ver 5.3) |
| `react-leaflet` | 4 → 5 | *23/09:* **não existe versão que aceite React 18 e 19 ao mesmo tempo** — o `4.2.1` (último da v4) tem peer `react ^18.0.0` e o `5.0.0` (único da v5) tem `react ^19.0.0`. Enquanto ele for `dependency` direta, a lib não consegue declarar `react ^18 \|\| ^19`. **Decisão D2** |
| `react` / `next` | 18 / 14 → 19 / 16 | Next 16 exige Node ≥ 20.9; `JSX.Element` global sai dos tipos do React 19 (21 usos em 10 arquivos) |

**Boa notícia:** MUI 9 tem peer `react: ^17 || ^18 || ^19` — **MUI 9 não obriga React 19**. Os dois saltos são independentes. Idem **Next 16** (peer `react ^18.2.0 || ^19.0.0`).

**Quem prende o React em 18 hoje** (*23/09*): `react-leaflet@4`, `react-query@3` e `@mui/x-date-pickers@6`. Os dois últimos saem nas Etapas 2 e 7; o primeiro é a decisão D2.

### 4.4 Ferramental de desenvolvimento (*23/09*) — adicionado na Etapa 0 já um major atrás

A Etapa 0 instalou as ferramentas nas versões compatíveis com o resto da árvore daquele momento, e várias já têm major novo. Nada disso chega ao consumidor.

| Pacote | Instalado | Latest | Observação |
|---|---|---|---|
| `eslint` | 9.39.5 | 10.11.0 | junto com `eslint-config-prettier` 9 → 10, `eslint-plugin-react-hooks` 5 → 7 (a v6+ traz as regras do React Compiler — esperar mais warnings), `globals` 15 → 17, `eslint-plugin-storybook` 9 → 10 (vai junto com a Etapa 5) |
| `vitest` / `@vitest/coverage-v8` | 3.2.7 | 5.0.1 | dois majors |
| `jsdom` | 26.1.0 | 29.1.1 | |
| `@testing-library/jest-dom` | 6.9.1 | 7.0.1 | |
| `playwright` | 1.55.0 | 1.63.0 | **a versão do pacote tem que casar com a imagem do container** (`mcr.microsoft.com/playwright:v1.55.0-noble` em `scripts/snapshots-in-docker.sh`); subir os dois juntos e **regerar o baseline**, porque o Chromium novo muda antialiasing |
| `pixelmatch` | 6.0.0 | 7.2.0 | |
| `@types/node` | 20.17 | 26.x | alinhar com o Node do CI (22) → `^22` |

Sugestão: um PR de ferramental dentro da **Etapa 4** (é o lote de "minors/patches seguros" — estes são majors, mas só de dev), com o baseline de snapshots regerado **num PR separado** do bump do Playwright para o diff ficar legível.

---

## 5. Dívidas a eliminar antes de mexer no MUI

Cada item aqui **reduz** a superfície de atualização.

### 5.1 `react-google-recaptcha` — dependência morta — ✅ removida na `0.2.0`
Declarada em `package.json` e `lib-package.json` (+ `@types/react-google-recaptcha`), **nunca importada** em `src/` (reconferido em 23/09). Remover. Mesmo destino para **`@types/keycloak-js`** (stub obsoleto, ver 4.1).

### 5.2 `react-query` — sai da lib — ✅ removido na `0.2.0`
Um único uso real: `src/components/form/input/AutoComplete.tsx:39` (reconferido em 23/09), e num padrão errado (`setState` dentro do `queryFn`). Os 3 decorators (`src/decorators/*.tsx`) só instanciam `QueryClientProvider`. Trocar por um hook de fetch interno **remove a dependência da lib inteira** e mata o problema de versão de query com os apps.

### 5.3 `cookies-next` — sai da lib — ✅ removido na `0.2.0`
Usa apenas `getCookie`/`setCookie`/`deleteCookie` em `OAuthProvider.tsx:1,45,85,114,185` (linhas atualizadas em 23/09). Um helper interno de ~15 linhas **remove o bloqueio do `next >= 15`**.

### 5.4 `@mui/lab` — sai da lib (**na Etapa 7**, não na 2)
`LoadingButton` (`Stepper.tsx:4,141,151`) → `<Button loading loadingPosition='start' startIcon={<SaveIcon />}>`, nativo desde MUI 6.4. Evita depender de beta em produção e tira um item da coordenação.

> **Atenção (ver 2.2.1):** hoje `@mui/lab` é uma dependência **não declarada** no pacote publicado — isso é bug ativo, não dívida. A remoção do `LoadingButton` só é possível no MUI ≥ 6.4, ou seja, na Etapa 7. Até lá, **declarar `@mui/lab` em `lib-package.json`** como correção imediata (hotfix `0.0.350`, antes da Etapa 1).

### 5.5 `decorators/` duplicado — ✅ apagado na Etapa 2
Existe na raiz **e** em `src/decorators/`, com 3 arquivos cada e conteúdo divergente (continua assim em 23/09). As stories importam de `src/decorators/`. Apagar a pasta da raiz.

### 5.6 `dist/` publica `stories/`, `decorators/` e `test/` — ✅ excluídos na Etapa 2 (`tsconfig.microbundle.json`)
Por causa de `rootDir: src`, o build emite `dist/stories/` e `dist/decorators/`. Excluir do build (bloat no pacote publicado). **Desde a Etapa 0 também sai `dist/test/`** (os helpers do vitest em `src/test/`) — o `publint` aponta. Mesmo tratamento.

### 5.7 `src/components/teste/Teste.tsx` — ✅ decidido na Etapa 2: **fica, fora do build**
950 linhas, importa `../../css/globals.css`, **não é exportado** no barrel `src/index.ts`. Candidato a remoção (existe `src/stories/Teste.stories.tsx` referenciando).

### 5.8 Achados da Etapa 0 (22/09/2026) — bugs encontrados ao escrever as stories

Três defeitos que só apareceram quando os 12 componentes sem story ganharam uma. **Status em 23/09:** (a) corrigido na Etapa 0; (b) e (c) corrigidos na Etapa 2 (`0.2.0`). Na época, nenhum foi corrigido: a Etapa 0 existe para **congelar** o comportamento atual, não para mudá-lo. Cada um precisa de decisão própria.

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

### 5.9 **`main` e `exports.require` do pacote publicado apontam para um arquivo que não existe** — ✅ corrigido na `0.1.0`

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

**Feito na Etapa 1:** `main` e `exports.require` → `./index.cjs`, `types` como primeira condição. `publint` foi de 3 erros para 0. **Não resolvido:** o aviso de ESM interpretado como CJS (`attw` 🚭 em `node16 (from ESM)`). Adicionar `"type": "module"` não serve — o chunk CJS do `Map` (`Map-<hash>.js`) também tem extensão `.js` e passaria a ser lido como ESM. Fica para o `tsup` na Etapa 3. Bundlers (o caso de todos os apps) não são afetados.

**Correção original proposta:** ajustar os campos no `lib-package.json` (apontar para `index.cjs`, reordenar `exports`, avaliar `.mjs`). É mudança no pacote publicado, então entra na **Etapa 1**, não aqui. A Etapa 3 (`microbundle` → `tsup`) resolve a raiz, porque o tsup nomeia as saídas de forma consistente.

Verificação adicionada: `npm run check:package` (publint + attw), já ligada ao workflow de PR. **Atenção:** o `check-package.sh` roda com `set -e` e o `publint` sai com código ≠ 0 quando há erro — até a Etapa 1, o `attw` **nunca chegava a rodar** no CI.

### 5.10 `GenericFormProvider` não é exportado — a família `Generic*` não tem provider acessível — ✅ corrigido na `0.1.0`

Encontrado ao montar o `examples/smoke-app`. Os seis componentes `Generic*` (`GenericInput`, `GenericTable`, `GenericFetchAutoComplete`, `GenericMaskInput`, `GenericMultInput`, `GenericDatePicker`) consomem o contexto nativo do react-hook-form, e a lib tem um `GenericFormProvider` pronto para fornecê-lo — mas:

- ele **não está no barrel** `src/index.ts`;
- o `exports` do `lib-package.json` declara apenas `.`, `./types/auth` e `./types/form`, então **deep import não resolve** em nenhum resolver moderno.

O arquivo é emitido (`dist/components/providers/GenericFormProvider.d.ts` existe), mas é inalcançável. Na prática o consumidor tem que montar `useForm()` + o `FormProvider` do próprio react-hook-form na mão — é o que o smoke-app faz, de propósito, para documentar a experiência real.

**Correção:** adicionar `GenericFormProvider` ao barrel. Uma linha, não é breaking (só adiciona). Entra na **Etapa 1**, junto com o restante do packaging.

### 5.11 `Table` quebra no SSR (achado na Etapa 1, 23/09/2026) — ✅ corrigido na `0.2.0`

O primeiro `next build` do `examples/smoke-app` falhou no prerender com `ReferenceError: localStorage is not defined`. Origem: `src/components/form/table/Table.tsx:75` — `useRef(localStorage.getItem(...))` roda **durante o render** (e `:82-86` também leem/gravam `localStorage` fora de `useEffect`). O `GenericTable` tem o mesmo padrão em `:622` e `:688-707` (dentro do JSX).

Não é regressão — o código não mudou; o smoke-app só não tinha sido buildado na Etapa 0. Os apps que usam `Table` com SSR hoje só funcionam se já a carregam com `next/dynamic` + `ssr: false`, que é o que o smoke-app passou a fazer (documentado no `README.md` e no `CHANGELOG.md`).

**Correção:** mover as leituras para `useEffect`/inicializador lazy protegido por `typeof window !== 'undefined'`. É mudança de comportamento da lib (primeiro render sem o estado salvo), então fica para a Etapa 2, com story/snapshot conferindo.

### 5.12 O bundle embutia uma cópia do `@mui/system` (achado e corrigido na Etapa 1)

`FileUpload.tsx` e `DropFileUpload.tsx` importavam `Stack` de `@mui/system`, pacote que **não estava em nenhum manifesto**. O microbundle só externaliza o que está em `dependencies` + `peerDependencies`, então copiou o `@mui/system` 5.12 (com `@mui/utils` etc.) para dentro do `dist/` — **sem aviso**. Troca para `import { Stack } from '@mui/material'` (mesmo componente, já externo): o bundle caiu de 150 kB para 110 kB (ESM) e 161 kB para 120 kB (CJS), com snapshots idênticos.

**Regra que sai daqui:** depois de todo build, a lista de externos do `dist/index.esm.js` tem que ser igual ao conjunto declarado no `lib-package.json`. Hoje é conferência manual (comando no `CLAUDE.md`); vale virar script em `check:package` na Etapa 3, junto com o `tsup` e os externals explícitos.


### 5.13 Achados da Etapa 2 (23/09/2026) — **não corrigidos**, candidatos à Etapa 4 ou a um patch

- **a) `Table` guarda o nome da tabela em variáveis de módulo.** `Table.tsx:23-27` declara `let localTableName`, `localTableNameCache` e `filtersFuncData` no topo do arquivo e as reatribui a cada render. Com **duas `Table` na mesma página**, as duas passam a ler e gravar os filtros da última que renderizou. O `GenericTable` já faz certo (`const` dentro do componente). Correção de uma linha por variável, mas muda comportamento (conserta o compartilhamento) — precisa de teste com duas tabelas.
- **b) `GenericTable` tinha um `console.log` de depuração em produção:** `useEffect(() => console.log(filterContainer.current), [filterContainer.current])`. — ✅ **removido na Etapa 2**, junto com o `filterContainer`, um `useRef` que nunca era ligado a elemento nenhum (o log sempre imprimia `null`). Saiu também o `console.log(listClone)` do `onInputChange`, que imprimia a lista inteira a cada tecla na busca.
- **e) Outros `console.log` de depuração na lib** (não removidos): `GenericFetchAutoComplete.tsx:58` (`'llll'`), `TabNavBar.tsx:153` (`pathname`), `table/utils.tsx:220` (`dates`). Os `console.log(err)` em `catch` de `FileUpload`, `DropFileUpload` e `Table` deveriam ser `console.error`. Ficam de fora os intencionais: `Stepper` (atrás da prop `debugLog`) e o logger do `KeycloakAuthProvider`. Candidatos a uma regra `no-console` (`warn`, permitindo `error`/`warn`) no ESLint.
- **f) `npm run link` não funciona.** O script roda `npx tsc`, mas o `tsconfig.json` tem `noEmit: true` — não gera nada, e o `npm link` publica o `dist/` que estiver lá (de um build anterior, ou nenhum). Além disso, o link é um symlink: o app passa a resolver React/MUI pelo `node_modules` da lib (duas cópias). **Substituído na prática pelo `npm run pack:local`** (Etapa 2), que gera o `.tgz` idêntico ao do publish; o `link` fica para ser removido ou refeito na Etapa 3.
- **g) `.babelrc.json` é lido pelo Storybook, não só pelo microbundle.** A presença do arquivo faz o `@storybook/nextjs` compilar com Babel em vez de SWC. Remover o microbundle (Etapa 3) **não** libera a remoção dos `@babel/preset-*` — isso fica para a Etapa 5.
- **h) MUI 5 não tem campo `exports`**, então os deep imports da lib falham no ESM nativo do Node e só resolvem via CJS (detalhes em D1). É o que segura o ESM-only até a Etapa 7.
- **c) A documentação dizia que os dois providers de auth gravam o cookie `nextauth.token`.** Só o `OAuthProvider` grava; o `KeycloakAuthProvider` declara `cookieName` e nunca o usa. README e `CLAUDE.md` corrigidos para refletir o código — **se algum app lê esse cookie esperando o token do Keycloak, ele nunca existiu**.
- **d) `scripts/snapshots-in-docker.sh` só buildava o Storybook se `storybook-static/` não existisse.** Com um build antigo na máquina, os snapshots comparavam o código de outra etapa e passavam. **Foi o que aconteceu no registro da Etapa 1**: o "83 stories, 0 diffs" comparou o Storybook da Etapa 0 e não verificou a troca do `Stack` (5.12). Na Etapa 2 o Storybook foi rebuildado e **o resultado cobre as duas etapas contra o baseline original: 0 diffs** — a troca do `Stack` está verificada, só que depois. O script agora sempre rebuilda (`SKIP_STORYBOOK_BUILD=1` pula). O CI nunca foi afetado: ele builda o Storybook antes.

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
- [~] **`@storybook/addon-vitest` + Playwright:** cada story vira teste de render em browser real (falha em erro de console/render). É a única verificação automatizada viável sem app host. *(Parcial: o script de snapshots já falha em `pageerror`. Reavaliar na Etapa 5 — o addon é da linha Storybook 10.)*
- [x] **Escrever as 12 stories que faltam** (lista em 2.3), priorizando `GenericDatePicker`, `GenericMaskInput`, `MaskInput` e `GenericMultInput` — são os que a Etapa 7 mexe mais. As 34 stories atuais cobrem 30 dos 46 exports; o alvo é **todo export visual com pelo menos uma story**.
- [x] **Snapshots visuais** das stories via **Playwright, com os PNGs versionados no repo** (decisão 7). É o que pega a quebra silenciosa de Grid e de `slotProps`. Os snapshots são gerados e comparados **dentro de um container Linux fixo** (mesma imagem no CI e localmente, via `docker run`), senão o diff vira ruído de fonte/antialiasing do macOS.
- [x] **App de fumaça em `examples/smoke-app`** (decisão 8) — *ressalva de 23/09: o `file:../../dist` não valida o contrato de dependências e o app **não roda no CI**; ver seção 10*. Um Next 14 mínimo consumindo a lib via `npm run link`, com uma página usando `FormProvider` + `Input` + `Table`/`GenericTable` + `DatePicker` + `Map` + auth. Único jeito de validar o cenário real "MUI vem do app". Precisa ficar fora do `include` do `tsconfig` da lib, fora do `build-storybook` e fora do pacote publicado.
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

Commitado em 4 commits (`8a68879` → `72ec9af`), **ainda não mergeado na `main`**. Todas as etapas vivem num único branch, `atualizacao-dependencias` (os branches por etapa foram consolidados em 23/09/2026 — eram lineares, sem merge).

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

**Achados que NÃO foram corrigidos** (mudam comportamento da lib, então saem da Etapa 0): seções **5.8**, **5.9** e **5.10**. O 5.9 (`main`/`exports.require` apontando para arquivo inexistente) é o mais urgente. *(5.9 e 5.10 corrigidos na Etapa 1.)*

---

### Etapa 1 — Packaging correto → `0.1.0`
- [x] Declarar `peerDependencies` no `lib-package.json` conforme seção 3 (com MUI ainda em 5 — ver desvios no registro abaixo).
- [x] Mover `react-hook-form`, `dayjs`, `react-toastify` de `dependencies` para `peerDependencies`.
- [x] Espelhar em `devDependencies`.
- [x] **Abandonar `0.0.x`** e passar a usar semver de verdade a partir de `0.1.0`. Atualizar a convenção de commit (`vNNN - ...`) para refletir isso.
- [x] Documentar no `README.md` o contrato de peers.
- [x] *(entrou junto)* Corrigir `main`/`exports` (5.9), exportar `GenericFormProvider` (5.10), declarar `@mui/lab` (2.2.1), parar de embutir o `@mui/system` (5.12), criar `CHANGELOG.md`.

**Impacto no consumidor:** nenhum funcional — apenas warnings de peer corretos no `npm install`.
**Validação:** `publint` + `attw` no `dist/`, app de fumaça.

#### Registro de execução — 23/09/2026

Branch `atualizacao-dependencias`, commits `6d8bb08` e `21e36ae` (a Etapa 0 ainda não foi mergeada na `main`).

| Verificação | Comando | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | verde |
| Lint | `npm run lint` | 0 erros, 331 warnings (igual à Etapa 0) |
| Formatação | `npm run format:check` | verde |
| Testes | `npm run test` | 14 testes, verde |
| Build | `npm run build` | verde |
| API pública | `node scripts/check-public-api.mjs` | **78 exports** (77 + `GenericFormProvider`), íntegra |
| publint | `npm run check:package` | **0 erros** (eram 3); restam 2 warnings de ESM/CJS → Etapa 3 |
| attw | `npm run check:package` | 🟢 node10, node16-CJS, bundler; 🚭 node16-ESM → Etapa 3 |
| Snapshots | `npm run snapshots` | 83 stories, **0 diffs**, 0 erros de runtime — *correção: comparou um `storybook-static/` antigo (5.13d); a verificação real da troca do `Stack` saiu na Etapa 2, também com 0 diffs* |
| Árvore de dependências | `npm ls --all` antes/depois | **idêntica** — o lockfile só mudou flags `dev`/`peer` |
| App de fumaça | tarball do `npm pack` instalado no `examples/smoke-app` | sem `ERESOLVE`; uma cópia de MUI/Emotion/RHF/dayjs/toastify; `@mui/lab` instalado e deduplicado; `next build` verde; no browser: tema roxo do app chega no `Input` da lib, `GenericFormProvider` submete, máscara de CPF funciona, zero erro de console |

**Desvios em relação à seção 3** (todos para declarar só o que é verdade *hoje*; a seção 3 descreve o estado final):

- **`react`/`react-dom` ficam em `^18.0.0`, não `^18 || ^19`.** `react-leaflet@4`, `react-query@3` e `@mui/x-date-pickers@6` — dependências/peers atuais — declaram peer `react ^18` estrito ou `^17 || ^18`. Declarar `^19` agora seria prometer algo que o `npm install` recusaria. Abre quando essas três saírem (Etapas 2, 7 e 8).
- **`next` fica em `^14.0.0`.** Next 15/16 não foram testados; abrir quando o smoke-app rodar neles. *(Aberto na `0.2.1` — ver Etapa 2.1.)*
- **`@mui/material` com piso `^5.8.6`, não `^5.0.0`** — é o piso real imposto pelo `@mui/x-date-pickers@6`. Pelo mesmo motivo, Emotion ficou em `^11.9.0`/`^11.8.1`.
- **`react-toastify` em `^10.0.0`**, não `^11` — o CSS vendorizado é da v10; a v11 é a Etapa 6.
- **`@mui/lab` fixado em `5.0.0-alpha.127`** como `dependency` (motivo em 2.2.1).
- Na raiz, os peers ficam em `peerDependencies` **e** `devDependencies`. Não podem ir só para `devDependencies`: o microbundle deixaria de tratá-los como externos e os embutiria no `dist/` (o mesmo mecanismo do 5.12).

**Achados novos:** 5.11 (`Table` quebra no SSR — não corrigido, vai para a Etapa 2) e 5.12 (cópia do `@mui/system` no bundle — corrigido). Também: o `file:../../dist` do smoke-app **não** valida o contrato de dependências (o npm não instala as deps de um link e o Node resolve o MUI da raiz do repo); a validação real é com o tarball — documentado no `examples/smoke-app/README.md`. Vale ligar isso no CI (hoje o smoke-app não roda no `ci.yaml`). *(Ligado na Etapa 2: `npm run smoke`.)*

**Para publicar:** merge da Etapa 0 e desta etapa na `main`, depois `git tag v0.1.0 && git push origin v0.1.0`.

### Etapa 2 — Limpeza e desacoplamento
- [x] Remover `react-google-recaptcha` + `@types` e `@types/keycloak-js` (5.1).
- [x] Remover `react-query`: hook de fetch interno no `AutoComplete` + limpar os 3 decorators (5.2).
- [x] Remover `cookies-next`: helper interno de cookies (5.3).
- ~~Remover `@mui/lab`: `LoadingButton` → `<Button loading>` (5.4).~~ **Movido para a Etapa 7**: `<Button loading>` só existe no MUI ≥ 6.4 (ver 2.2.1). Enquanto isso, `@mui/lab` fica declarado e fixado.
- [x] Apagar `decorators/` da raiz (5.5).
- [x] Excluir `stories/`, `decorators/` e `test/` do build (5.6).
- [x] Decidir sobre `src/components/teste/Teste.tsx` (5.7).
- [x] `Table`/`GenericTable` sem acesso a `localStorage` no render (5.11).
- [x] Rodar o smoke-app (tarball + `next build`) no `ci.yaml`.
- [x] `GenericMaskInput` lendo o contexto do RHF (5.8b) e `CustomMenu` com `btProps` alargado (5.8c). O 5.8b muda comportamento — ~~story nova~~ **teste** digitando nos tipos mascarados do `GenericInput` (snapshot não digita).
- [x] Script que compara os externos do `dist/` com o que o `lib-package.json` declara (5.12), no `check:package`.

**Impacto:** nenhuma mudança visual; os apps podem remover `react-query` da árvore. Release **`0.2.0`** se o 5.8b entrar (muda comportamento), senão `0.1.x`.
**Validação:** snapshots **idênticos** ao baseline; diff de exports vazio.

#### Registro de execução — 23/09/2026

Branch `atualizacao-dependencias`. **Não commitado** (a pedido). Versão **`0.2.0`** — o 5.8b entrou e o `AutoComplete` mudou de comportamento.

| Verificação | Comando | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | verde |
| Lint | `npm run lint` | 0 erros, 330 warnings (eram 331) |
| Formatação | `npm run format:check` | verde |
| Testes | `npm run test` | **41 testes em 7 arquivos** (eram 14 em 2) |
| Build | `npm run build` | verde; `dist/` sem `stories/`, `decorators/`, `test/`, `teste/` |
| API pública | `node scripts/check-public-api.mjs` | 78 exports, íntegra (diff vazio) |
| Externos | `node scripts/check-externals.mjs` (novo, dentro do `check:package`) | 23 importados, 26 declarados, batem |
| publint / attw | `npm run check:package` | 0 erros; só o 🚭 node16-ESM conhecido (Etapa 3) |
| Snapshots | `npm run snapshots` (Storybook rebuildado) | **84 stories** (83 + `Menu/ComCorCustomizada`), **0 diffs** contra o baseline da Etapa 0 |
| App de fumaça | `npm run smoke` (novo, no CI) | sem `ERESOLVE`, uma cópia de cada peer, **`next build` com a `Table` importada direto** (SSR); no browser: zero erro/aviso/mismatch de hidratação, inclusive recarregando com o `localStorage` já gravado |
| Árvore | `npm ls --all` antes/depois | **só remoções**: 18 pacotes (`react-query` + 8 transitivas, `cookies-next` + `cookie` + `@types/cookie`, `react-google-recaptcha` + `react-async-script`, os 2 `@types`) |

**Como cada mudança de comportamento foi verificada** — todo teste novo foi rodado também contra o código antigo:

| Mudança | Teste | Código antigo | Código novo |
|---|---|---|---|
| 5.8b `GenericMaskInput` | `GenericInput.test.tsx` digita `cpf`/`cep` sob `GenericFormProvider` | ✗ `Cannot read properties of null (reading 'formSetValue')` | ✓ |
| 5.11 SSR | `Table.ssr.test.tsx` (`@vitest-environment node`, `renderToString`) | ✗ `localStorage is not defined` (as duas tabelas) | ✓ |
| 5.11 sem regressão no browser | `Table.test.tsx`: filtro salvo aparece após montar; é descartado se a definição dos filtros mudou | ✓ | ✓ (mesmo resultado → comportamento preservado) |
| 5.3 cookies | `cookies.test.ts`: strings **capturadas do `cookies-next@4.3.0`** antes de removê-lo (gravação com `Path=/`, `encodeURIComponent`, `Max-Age=-1`) | — | ✓ byte a byte |
| 5.2 `AutoComplete` | `AutoComplete.test.tsx`: sem `QueryClientProvider`; token no header, `dataPath`, `dataPath` inexistente, erro de rede, abort ao desmontar | — | ✓ |

**Decisões tomadas nesta etapa:**

- **`AutoComplete`:** `useEffect` + `fetch` + `AbortController`, não `@tanstack/react-query` — o objetivo do 5.2 era a lib não impor biblioteca de query aos apps. Diferenças documentadas no `CHANGELOG.md`: sem retry (eram 3), sem refetch ao focar a janela, sem cache compartilhado por `name`; `dataPath` inexistente vira lista vazia em vez de `undefined`.
- **`cookies-next` saiu também das `devDependencies`**: o teste de equivalência rodou contra ele uma vez e as strings esperadas foram congeladas no teste.
- **SSR das tabelas com `useIsClient()`, não com um wrapper que devolve `null` no servidor.** O wrapper trocaria o crash por mismatch de hidratação sempre que houvesse filtro salvo. Com o hook, servidor e primeiro render do cliente são iguais e o estado salvo entra um render depois. As escritas que o `Table` fazia **durante o render** (`:82-86`) viraram efeito, declarado antes dos demais para manter a ordem.
- **`Teste.tsx` (5.7) fica** como fixture de story, fora do build: é a única story que compõe quase todos os componentes num `Stepper` — útil na Etapa 7 — e era mantida até a v348. Reversível.
- **`src/test/setup.ts`** passou a tolerar `@vitest-environment node` (pulava direto para `localStorage.clear()`).

**Achados novos:** 5.13 (variáveis de módulo compartilhadas entre `Table`s, `console.log` no `GenericTable`, doc errada sobre o cookie do Keycloak, e o script de snapshots que comparava build velho — este último corrigido).

**Tamanho do bundle:** `index.esm.js` 109 971 → 110 379 bytes (+0,4 kB: helper de cookie e o efeito de fetch no lugar do import do react-query). No smoke-app, o JS compartilhado da página caiu de **432 kB para 350 kB** — o react-query deixou de entrar no bundle do app.

### Etapa 2.1 — Peer `next` aberta para 15 e 16 → `0.2.1`

**Por que existe (achado de 23/09/2026):** ao instalar o tarball da `0.2.0` no `conoc-frontend` para testá-lo num app real, o `npm install` falhou com `ERESOLVE`. Levantando os apps consumidores, **todos estão em Next 16** — a `0.2.0` não instalava em nenhum deles. A `0.0.x` instalava porque não declarava peer nenhuma: esses apps já rodam a lib no Next 16 há tempo, só que sem ninguém ter verificado. O bloqueio técnico (`cookies-next@4`) já tinha saído na Etapa 2; faltava só o teste.

- [x] Smoke-app com Next 16.3.6 (e 15.5.26) contra o tarball com a peer ampliada.
- [x] Página `/next-apis` no smoke-app: `NavBar` (`next/image`, `next/link`, `next/router`) e `Map` (`next/dynamic`, `ssr: false`) — os 5 arquivos da lib que importam `next/*` passam por ela ou pelo mesmo import.
- [x] `SMOKE_NEXT=<major> npm run smoke`; o CI roda o smoke no 14 (piso) e no 16 (topo).
- [x] Peer `next` → `^14.0.0 || ^15.0.0 || ^16.0.0` no `lib-package.json` e no `package.json` raiz; versão **`0.2.1`** (amplia a faixa, não quebra ninguém).

#### Registro de execução — 23/09/2026

| Verificação | Next 14.2.35 | Next 15.5.26 | Next 16.3.6 |
|---|---|---|---|
| `npm install` do tarball (peer ampliada) | sem `ERESOLVE` | sem `ERESOLVE` | sem `ERESOLVE` |
| `npm ls` (uma cópia de `next`, MUI, Emotion, RHF, toastify, dayjs) | ✓ | ✓ | ✓ |
| `next build` (prerender de `/` e `/next-apis` = SSR) | ✓ | ✓ | ✓ Turbopack **e** `--webpack` |
| Browser, build de produção | (Etapa 2) | não rodado | ✓ tema roxo do app nos componentes da lib; `Input` com máscara de CPF + submit do `FormProvider`; `GenericInput` + submit do `GenericFormProvider`; `Table`; `MODAL`; logo pelo otimizador do `next/image`; `href` do `next/link`; `router.push` da `NavBar` navega; `Map` monta com os 12 tiles; console limpo |
| Browser, `next dev` | — | — | ✓ sem erro nem mismatch de hidratação, inclusive recarregando com `order-<id>` da `Table` no `localStorage`. Único aviso é interno do Next (`[HMR] Invalid message … isrManifest`, do indicador de página estática), sem relação com a lib |

O Next 15 só teve install + build, não browser: fica coberto por estar entre dois majors testados e por não haver API do 15 que a lib use. Se algum app ficar no 15, vale um `SMOKE_NEXT=15` no browser.

**Consumidores da lib levantados (23/09/2026)** — resolve a "informação pendente" da seção 9. Versões do `package.json` de cada app nos repos locais:

| App | Lib | Next | React | `@mui/material` | `x-date-pickers` | `react-toastify` | Instala a `0.2.1`? |
|---|---|---|---|---|---|---|---|
| `specto-frontend` | `^0.0.348` | 16.2.6 | 18 | ^5.15.5 | ^6.19.0 | ^10.0.4 | **sim** |
| `viva-flor-frontend` | `^0.0.349` | 16.3.1 | 18 | ^5.15.5 | ^6.19.0 | ^10.0.4 | **sim** |
| `copom` | `^0.0.348` | 16.2.7 | 18 | ^5.18.0 | **^7.27.0** | **^11.0.5** | não — pickers 7, toastify 11 |
| `conoc-frontend` | `^0.0.347` | ^16.1.6 | **^19.2.4** | **^7.3.8** | **^8.27.2** | **^11.0.5** | não — MUI 7, React 19, pickers 8, toastify 11 |

Consequências para o plano:
- **`specto-frontend` e `viva-flor-frontend`** são os candidatos naturais a app piloto da linha `0.x` (e depois da Etapa 7).
- **`conoc-frontend` já roda a lib (`0.0.347`) em cima de MUI 7 + React 19**, sem peer que avise. É evidência (não garantia) de que o código atual funciona no MUI 7 — e é o app que mais ganha com a Etapa 7. Até lá, só instala uma `0.x` com `--legacy-peer-deps`.
- **`react-toastify` 11 já está em dois apps.** A faixa final da seção 3 prevê `^11.0.0`; vale avaliar abrir `^10 || ^11` antes da Etapa 7, do mesmo jeito que o `next` aqui (smoke com toastify 11 + `SspComponentsProvider`), para destravar o `copom` junto com o x-date-pickers.

### Etapa 3 — Build: `microbundle` → `tsdown` (D1) → `0.3.0`

**Decidido (23/09/2026):** `tsdown` em modo **`unbundle`** (um arquivo de saída por módulo, como o MUI publica), formatos **ESM + CJS**. Motivos, números e o teste comparativo com Rslib e Vite em "D1 — teste empírico" (seção 9). ESM-only não entra aqui: com MUI 5 os deep imports da lib quebram no ESM nativo do Node — volta a ser avaliado na Etapa 7.

**Por que sobe o minor:** muda o layout do `dist/` (nomes e extensões dos arquivos). Quem importa só pela raiz (`@ssplib/react-components`) não percebe; quem fizesse deep import em `dist/components/...` quebra — e o `exports` nunca permitiu isso, mas vale o registro no `CHANGELOG.md`.

**Pré-requisitos:**
- [x] Node **≥ 22.18** em quem builda (exigência do `tsdown`: `^22.18.0 || ^24.11.0 || >=26.0.0`). Recomendado: **24 LTS**. *Em 24/09 o shell da sessão já estava em 24.21.0 (default do nvm).*
- [x] CI: `node-version: 22` → **`24`** no `ci.yaml` e no `publish.yaml`; `engines.node` do `package.json` raiz → `^22.18.0 || >=24.11.0`. É requisito de **build**, não de runtime: os apps continuam com o Node que o Next deles pede (Next 14: ≥ 18.17; Next 16: ≥ 20.9).

**Checklist:**
- [x] **Trabalhar com a skill oficial do tsdown** (`.claude/skills/tsdown/`): cada opção do config foi conferida em `references/option-*.md` e nos tipos do `tsdown@0.23.0` instalado (`outExtensions` aceita `{ js, dts }`; `deps.onlyBundle`/`onlyImport` existem na 0.23).
- [x] `npm i -D tsdown unrun` e remover `microbundle` e `tsconfig.microbundle.json`. *O `npm i` dá `ERESOLVE` com o microbundle ainda instalado (`postcss-modules@4` dele × peer opcional do `@tsdown/css`) — desinstalar o microbundle primeiro.* **Não** foram removidos os `@babel/preset-*` nem o `.babelrc.json` (Storybook; Etapa 5).
- [x] `tsdown.config.mts` — o ponto de partida de D1, com quatro mudanças (motivos no registro abaixo): extensões fixadas por `outExtensions`, `target: 'es2020'`, `deps.onlyBundle: []` + `deps.onlyImport` como trava de externos no próprio build, e `suppressWarnings` para o `MODULE_LEVEL_DIRECTIVE`. `.mts` e não `.ts` porque a raiz deixou de ter `"type": "module"`.
- [x] `lib-package.json`: ~~`main` → `./index.js` (CJS), `module` → `./index.mjs`~~ **ESM em `.js`, CJS em `.cjs`** (o `.mjs` quebra o SSR no Next 14 — ver registro): `main` → `./index.cjs`, `module` → `./index.js`, `types` → `./index.d.cts`, e `exports` com condições separadas `import: { types: './index.d.ts', default: './index.js' }`, `require: { types: './index.d.cts', default: './index.cjs' }`. Idem para `./types/auth` e `./types/form`, que ganharam JS (antes só `.d.ts`). **Sem `"type"`** — ver registro.
- [x] **Não** declarar `"sideEffects": false` (`Map.tsx` importa CSS e `leaflet-defaulticon-compatibility` pelo efeito colateral). Não declarado nada.
- [x] Scripts: `build` → `tsdown`; **`link` removido** em favor do `pack:local` (5.13f).
- [x] Scripts de verificação: `check-public-api.mjs` confere `index.d.ts` **e** `index.d.cts`; `check-externals.mjs` ficou **recursivo** e passou a ler também os `.d.ts`/`.d.cts` (import de pacote não declarado num tipo quebra o typecheck do app).
- [x] Aviso `MODULE_LEVEL_DIRECTIVE` suprimido no config, e **`scripts/check-use-client.mjs`** (novo, no `check:package`) garante que todo módulo de `src/` com `'use client'` sai com a diretiva no `.js` e no `.cjs`. Testado contra um `dist/` adulterado (falha como deveria).
- [~] Rodar `publint` + `attw`: o objetivo era **zerar o 🚭 do node16-ESM** (5.9). **Alcançado com `.mjs`, mas revertido** — o `.mjs` quebra o SSR do Next 14. Com `.js`/`.cjs` o 🚭 continua (igual à `0.2.1`). Ver registro e "Decisão pendente".

**Impacto:** nenhum para quem importa pela raiz — melhora o suporte a App Router (`'use client'` preservado).
**Validação:** `check:package` (externos + publint + attw) sem erros ~~**e sem o 🚭**~~; diff de exports vazio; `npm run smoke` verde; snapshots idênticos (o Storybook não usa o `dist/`, então aqui é só sanidade); comparar tamanho/forma do `dist/` com o da `0.2.0`; `'use client'` presente nos arquivos do mapa.

#### Registro de execução — 24/09/2026

Branch `atualizacao-dependencias`. **Não commitado** (a pedido). Versão **`0.3.0`**. `tsdown` 0.23.0 + `rolldown` 1.2.10, Node 24.21.0.

| Verificação | Comando | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | verde |
| Lint | `npm run lint` | 0 erros, 329 warnings (eram 330) |
| Formatação | `npm run format:check` | verde |
| Testes | `npm run test` | 41 testes em 7 arquivos, verde |
| Build | `npm run build` | verde, **~1 s** (ESM e CJS em paralelo) |
| API pública | `node scripts/check-public-api.mjs` | 78 exports em `index.d.ts` **e** em `index.d.cts` |
| Exports de runtime | `require` do `index.cjs` da 0.2.1 × da 0.3.0 | **49 = 49**, mesmos nomes |
| Externos | `check-externals.mjs` (agora recursivo, com os tipos) | 23 importados, 26 declarados, batem — igual à Etapa 2 |
| `'use client'` | `check-use-client.mjs` (novo) | `Map` e `DraggableMarker`, no `.js` e no `.cjs` |
| publint | `npm run check:package` | 0 erros, 3 warnings (eram 2) — todos o mesmo caso: ESM em `.js` sem `"type"` |
| attw | `npm run check:package` | 🟢 node10, node16-CJS, bundler nas 3 entradas; 🚭 node16-ESM em `.` e `./types/form` (como na 0.2.1) |
| Interop do CJS | `check:package` (trava nova) | nenhum `__toESM(x, 1)` em `dist/**/*.cjs`; testado contra um `.cjs` adulterado (falha como deveria) |
| App de fumaça | `npm run smoke` / `SMOKE_NEXT=16 npm run smoke` / Next 16 `--webpack` | **verde nos três** (prerender de `/`, `/next-apis`, `/404`, `/500`) |
| Snapshots | `npm run snapshots` (Storybook rebuildado) | 84 stories, **0 diffs**, 0 erros de runtime |
| Árvore de dependências | `npm ls --all` antes/depois | −153 pacotes (cadeia babel/rollup/postcss do microbundle), +68 (`tsdown`, `rolldown`, `oxc`…) |

**Forma do `dist/`:** 74 → 329 arquivos (um por módulo, ×2 formatos, + tipos e sourcemaps), 1,4 → 2,3 MB em disco. JS de runtime: ESM 110 kB → 231 kB, CJS 120 kB → 275 kB — **não é regressão**: o microbundle minificava, o `tsdown` não (é o padrão de lib; o bundler do app minifica). No smoke-app (Next 14), o JS compartilhado pelas páginas foi de **355 kB (0.2.1) para 357 kB (0.3.0)**, medido com o mesmo app e o `dist/` antigo empacotado.

**Achados — dois bugs que o build gerava sem nenhum erro** (os dois passariam por publint, attw, testes, snapshots e diff de API), e um problema antigo do `check:package`:

1. **O `"type": "module"` do `package.json` raiz quebrava o CJS.** O rolldown lê o `type` do `package.json` mais próximo *do fonte*; com `"module"`, trata os `.tsx` como ESM do Node e gera `__toESM(require(x), 1)` — interop em "modo Node", que ignora o `__esModule`. Resultado: `import Grid from '@mui/material/Grid'` virava, no CJS, `Grid.default = { default: Grid, gridClasses, … }` (um objeto, não o componente) — conferido carregando o `.cjs` no Node. O pacote publicado nunca teve `"type"`, então a raiz divergia dele. **Correção: tirar o `"type": "module"` da raiz** (nada dependia dele — os scripts são `.mjs`/`.cjs` explícitos; Storybook, vitest e ESLint conferidos) e renomear o config para `tsdown.config.mts`. Depois disso, zero `__toESM(…, 1)` no `dist/`.
2. **ESM em `.mjs` quebra o SSR no Next 14.** Com o layout do plano (`.mjs`/`.js`), o `next build` do smoke-app no Next 14 falhou no prerender de todas as páginas: `TypeError: useMediaQuery is not a function` no `CustomModalProvider` (via `SspComponentsProvider`, no `_app`). Causa: o Next reescreve `import { useMediaQuery } from '@mui/material'` para `import useMediaQuery from '@mui/material/useMediaQuery'` (otimização de barrel — o MUI está na lista padrão), que no servidor resolve para o build **CJS** do MUI 5; e, **dentro de um `.mjs`**, o webpack aplica interop estrito (default de CJS = `module.exports`). O `index.esm.js` da 0.2.1 funcionava por ser `.js` sem `"type"`, que o webpack trata como `javascript/auto` e respeita o `__esModule`. No **Next 16** o `.mjs` funcionou (Turbopack **e** `--webpack`), mas o 14 é o piso da peer e roda no CI. **Correção: ESM em `.js`, CJS em `.cjs`** — o mesmo contrato de interop da 0.2.1, só que um arquivo por módulo. Com isso o 🚭 node16-ESM do attw volta: o Node nativo leria o `.js` como CJS. Na prática não muda nada — `import` nativo do Node já não funciona com MUI 5 (`ERR_UNSUPPORTED_DIR_IMPORT`, D1) — e publint sugere `"type": "commonjs"`, que **não pode** ser aplicado: faria os `.js` ESM serem lidos como CJS.

3. **O `check:package` nunca passou nesta linha:** o attw sai com código 1 quando acha o 🚭 — já na 0.2.1 (conferido rodando-o sobre o `dist/` antigo). No CI, esse passo vem antes do smoke e dos snapshots, então os dois nunca teriam rodado; o branch ainda não passou por CI, por isso ninguém viu. Os registros das Etapas 1 e 2 leram a saída ("0 erros") e não o código de saída. **Correção:** `--ignore-rules unexpected-module-syntax` no attw — só a regra do 🚭 conhecido; as demais continuam bloqueando.

O (2) é pego pelo smoke no Next 14; o (1) não é pego por nada que já existia — o smoke consome o ESM — e **ganhou trava própria no `check:package`** (falha se houver `__toESM(x, 1)` em `dist/**/*.cjs`).

**Outras decisões:**
- **`target: 'es2020'`** explícito: sem ele o `tsdown` derivaria o target do `engines.node` da raiz, que agora é requisito de build (Node 22), não de runtime.
- **`deps.onlyBundle: []` e `deps.onlyImport`** (com a lista do `lib-package.json`): o próprio build falha se embutir qualquer coisa de `node_modules` (o `@mui/system` do 5.12) ou se o `dist/` — JS ou `.d.ts` — importar pacote não declarado. O `check-externals.mjs` continua (pega também dependência declarada sem uso).
- **Sem minificação** (padrão do `tsdown`), sourcemaps mantidos.
- **`./types/auth` e `./types/form` ganharam JS**: antes eram só `.d.ts`, e `FieldType`/`ColumnDirection` (enums, valores de runtime) importados por esse caminho quebravam no app.

**Decisão pendente (não bloqueia a Etapa 4):** zerar o 🚭 exige `.mjs`, e o `.mjs` exige **tirar o Next 14 da peer** (`^15 || ^16`, e testar o 15 no browser). Nenhum app consumidor está no 14 (tabela da Etapa 2.1 — todos em 16), então seria breaking só no papel; mas é mudança de contrato e não ganha nada em runtime até a Etapa 7. Recomendação: **deixar para a Etapa 7**, quando o MUI com `exports` tira a causa (deep import CJS) e o ESM-only volta à mesa.

### Etapa 4 — Lote de minors/patches seguros
- [ ] Tudo da seção 4.1, num PR só.
- [ ] Ferramental de dev da seção 4.4, em PR próprio (majors, mas só de dev). Bump do Playwright + imagem do container + **baseline regerado** em PR separado.

**Validação:** stories + snapshots idênticos.

### Etapa 5 — Storybook 9 → 10
- [ ] `npx storybook@latest upgrade` (alvo: 10.6.0 em 23/09); converter `.storybook/main.ts` e `preview.ts` para ESM-only. `@storybook/nextjs@10` aceita `next ^14.1 || ^15 || ^16` — sem bloqueio.
- [ ] Avaliar remover o `.babelrc.json` (+ `@babel/preset-*`): sem ele o `@storybook/nextjs` passa a usar SWC, mais rápido. Snapshots têm que ficar idênticos (a config atual mira `chrome: 100`).
- [ ] Remover `@storybook/testing-library` (0.2.2, deprecado desde o Storybook 8 — o npm marca como `deprecated`; não é usado em nenhuma story) — usar `storybook/test`.
- [ ] `eslint-plugin-storybook` 9 → 10 junto.
- [ ] Confirmar Node ≥ 20.16 no CI e no `engines` do `package.json`.

**Impacto:** nenhum (dev only).
**Validação:** `build-storybook` + suíte vitest verdes.

### Etapa 6 — Libs de runtime de risco médio (um PR por lib, nesta ordem)
- [ ] `jwt-decode` 3 → 4
- [ ] `react-imask` 6 → 7
- [ ] `react-toastify` 10 → 11 (decidir o destino do CSS vendorizado)
- [ ] `react-dropzone` 14 → 20 (*`engines: node >= 22` — conferir o Node dos apps*)
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
- [ ] Abrir o peer para `"@mui/material": "^7.3.0 || ^9.0.0"` (piso do `x-date-pickers@9`) e `"@mui/x-date-pickers": "^8.0.0 || ^9.0.0"`.
- [ ] Remover `@mui/lab` (`LoadingButton` → `<Button loading>`, 5.4).
- [ ] **ESM em `.mjs` / ESM-only** (pendência da Etapa 3): com o MUI tendo `exports`, repetir o teste da Etapa 3 — `tsdown.config.mts` com `.mjs`/`.d.mts` para ESM, `npm run smoke` no piso da peer `next` — e, se passar, zerar o 🚭 node16-ESM do attw. Avaliar ESM-only junto.
- [ ] **API pública:** o `Input` repassa `InputProps`/`InputLabelProps`/`FormHelperTextProps` do `TextFieldProps` (`Input.tsx:167-168,256-259`) — e o consumidor pode passá-los. O codemod migra o código da lib, **não o dos apps**. Decidir: aceitar os dois formatos e mapear para `slotProps` internamente (como com `xs`/`sm`/`md`), ou registrar como breaking no `CHANGELOG.md`.
- [ ] Tipos públicos que dependem do Grid legado: `Input.tsx:45,52-54` (`GridProps['xs']`, `Omit<GridProps, 'item' | ...>`).
- [ ] Publicar **`1.0.0-rc.1` sob a dist-tag `next`** (`npm publish --tag next`), o app piloto valida em homologação instalando `@ssplib/react-components@next`, e só depois promover para `latest` (`npm dist-tag add @ssplib/react-components@1.0.0 latest`). **Nunca** publicar o `1.0.0` direto em `latest` — é o que impede a quebra simultânea de todos os apps.
- [ ] Atualizar `README.md` (hoje diz "baseada em MUI v5") e `DESIGN_SYSTEM.md`.

**Impacto:** **breaking coordenado** — os apps precisam estar em MUI ≥ 7 (alvo: 9). **Aprovado:** todos os apps podem subir.
**Validação:** snapshots visuais componente a componente + app de fumaça com MUI 9 + **1 app piloto real** em homologação antes de liberar para os demais.

### Etapa 8 — React 19 / Next 16 (**planejada**) → `2.0.0`
- [ ] `@types/react` 19, `@types/react-dom` 19.
- [ ] `JSX.Element` → `React.JSX.Element` em 10 arquivos (Apêndice C).
- [ ] Revisar os 2 `forwardRef` (`MaskInput.tsx:15`, `GenericMaskInput.tsx:7`).
- [ ] `react-leaflet` 4 → 5. **Atenção:** a v5 tem peer `react ^19.0.0` **estrito** e a v4 tem `react ^18.0.0` estrito — não há versão que sirva aos dois (reconferido em 23/09). Como `dependency` direta, o bump torna React 19 **obrigatório** para todos os apps. Ver decisão D2 para a alternativa (peer opcional, o app escolhe a versão).
- [ ] Next 16 (16.3.6 em 23/09): exige Node ≥ 20.9 e aceita React 18.2+ — **pode subir antes do React 19**, se for útil a algum app. *A peer já aceita o 16 desde a `0.2.1` (Etapa 2.1), validado no smoke-app; o que sobra aqui é subir o `next` das `devDependencies` (Storybook) e a avaliação do App Router abaixo.* Avaliar App Router vs. os 6 arquivos que usam `next/router` (Pages Router) — `NavBar.tsx`, `TabNavBar.tsx`, `KeycloakAuthProvider.tsx`, `OAuthProvider.tsx` (+ `next/dynamic` em `map/index.tsx`). O Pages Router continua suportado no Next 16, então não é obrigatório reescrever agora.
- [ ] `cookies-next` foi removido na Etapa 2 (helper interno) — **não precisa voltar**. Só reavaliar se quisermos o helper deles de novo.

**Impacto:** breaking coordenado → publicar como **major `2.0.0`** com peer `react: ^19.0.0`.

> *Correção de 23/09:* o texto original dizia que "a lib fica em `react: ^18 || ^19` desde a Etapa 1". **Não fica** — a Etapa 1 declarou `^18.0.0`, porque `react-leaflet@4`, `react-query@3` e `x-date-pickers@6` recusam o 19. Depois das Etapas 2 e 7 sobra só o `react-leaflet`, e aí `1.x` só consegue declarar `^18 || ^19` se a decisão D2 tirar o `react-leaflet` das `dependencies`. Sem isso, `1.x` = React 18 e `2.0.0` = React 19, sem janela de convivência.

### Etapa 9 — TypeScript 7
- [ ] O `latest` do npm já é `7.0.2` (port nativo em Go). Ficar em **5.9 até a Etapa 8 concluir** e então subir, com dois critérios objetivos de entrada: (a) o bundler da Etapa 3 e o Storybook em uso geram `.d.ts` corretos com TS 7 (*o `tsdown@0.23` já declara peer `typescript ^5 || ^6 || ^7`; o `tsup@8.5.1` declara `>=4.5.0` sem garantia*); (b) `typescript-eslint` suporta TS 7 na versão que estivermos usando. Se algum falhar, permanecer em 5.9 — é a única dependência do plano em que "mais nova" ainda não é claramente melhor.

---

## 8. Estratégia de convivência com os apps

- **Branches:** `v0-legacy` (MUI 5) recebe só correções; `main` vira `1.x` (MUI ≥ 7).
- **Ordem de rollout:** 1 app piloto em homologação → demais apps, um a um.
- **Linha `0.x` antes do `1.0.0`:** `0.1.0` (packaging), depois `0.2.0`/`0.1.x` conforme a Etapa 2 mude comportamento ou não. Todo app sai de `^0.0.349` para `^0.1.0` **manualmente** — em `0.0.x` o `^` fixa a versão exata, então nenhum app recebe a `0.1.0` sem editar o `package.json`.
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

### Decisões surgidas na revalidação de 23/09/2026 (D1 decidida, D2 em aberto)

| # | Questão | Opções | Recomendação |
|---|---|---|---|
| **D1** ✅ *decidida: `tsdown`* | **Bundler da Etapa 3.** O `tsup` foi escolhido na análise de 21/09, mas o README dele hoje diz *"This project is not actively maintained anymore. Please consider using tsdown"* (último release 8.5.1, nov/2025) — trocar um bundler abandonado (`microbundle`) por outro abandonado não resolve o problema de fundo. | (a) **`tsdown`** (sucessor indicado pelo próprio tsup, baseado em rolldown; 0.23.0 — **ainda pré-1.0**; exige Node `^22.18 \|\| >=24.11`; integra `publint`/`attw`); (b) `tsup` 8.5.1 (funciona, congelado); (c) `rollup` + `rollup-plugin-dts` direto (maduro, mais configuração) | **(a) `tsdown`**, com (c) como plano B se algum critério da Etapa 3 falhar (`'use client'` preservado, d.ts corretos, diff de exports vazio). O pré-1.0 pesa menos porque o build é verificado por `check:package` + diff de API + smoke-app |
| **D2** | **Como `1.x` atende React 18 e 19.** O plano promete essa janela, mas o `react-leaflet` (dependência direta, só usado pelo `Map`) não tem versão que aceite os dois. | (a) **`react-leaflet`/`leaflet` viram `peerDependencies` opcionais** (`peerDependenciesMeta`), com range `^4.2.1 \|\| ^5.0.0`: app em React 18 instala o 4, app em React 19 instala o 5, app sem mapa não instala nada. Exige que o `Map.tsx`/`DraggableMarker.tsx` funcionem nas duas (a v5 é basicamente a v4 com React 19) — verificar com story nas duas versões; (b) manter como dependência: `1.x` = React 18, `2.0.0` = React 19, sem convivência | **(a)** — é o mesmo raciocínio da seção 3 (peer com range amplo evita lockstep), e ainda tira o Leaflet da árvore de quem não usa o mapa. Entraria na Etapa 7 (já é breaking) ou numa `0.x` |

> **D1 decidida em 23/09/2026: `tsdown` em modo `unbundle`**, saída ESM + CJS. **ESM-only fica para a Etapa 7** (`1.0.0`): com MUI 5 os deep imports da lib (`@mui/material/Grid`, `@mui/icons-material/Save`, `@mui/x-date-pickers/AdapterDayjs`) **falham no ESM nativo do Node** (`ERR_UNSUPPORTED_DIR_IMPORT`/`ERR_MODULE_NOT_FOUND` — o MUI 5 não tem campo `exports`), enquanto o `require` do CJS resolve. O MUI 7/9 e o x-date-pickers 9 têm `exports`, então o problema some junto com a Etapa 7 — é lá que ESM-only volta a ser avaliado, junto com o Jest dos apps.

#### D1 — teste empírico (23/09/2026)

Os três candidatos foram rodados de verdade contra o `src/` da lib (no scratchpad, sem tocar no repo), com os externos do `lib-package.json`:

| | `tsdown` 0.23 (bundle) | **`tsdown` 0.23 (`unbundle`)** | Vite 8.3 lib mode + `vite-plugin-dts` | Rslib 1.0 (bundleless) |
|---|---|---|---|---|
| `'use client'` preservado | ✗ (igual ao microbundle) | ✓ ESM e CJS | ✓ com `preserveModules` | ✓ (CJS: `"use strict"; "use client";`, válido) |
| Tipos ESM + CJS (`.d.mts` + `.d.ts`) | ✓ | ✓ | só `.d.ts` | ✓ |
| API pública (78 exports) | ✓ | ✓ | ✓ | ✓ |
| Tempo de build | 1,7 s | 1,0 s | 3,8 s | 4,6 s |
| Configuração | ~10 linhas | ~10 linhas | ~20 linhas + ajustes (copiou `public/`, nomes de arquivo, sem `.d.mts`) | ~15 linhas |

Downloads mensais (npm): `tsdown` 0,8M (set/25) → **18M** (últimos 30 dias); `tsup` 28M, mas sem release desde nov/2025 e o próprio README manda migrar para o `tsdown`; `@rslib/core` 1,2M. O `tsdown` roda sobre o `rolldown` 1.2 — **o mesmo motor do Vite 8** — e é mantido na organização do rolldown.

Observações: o `tsdown` precisa do pacote `unrun` para carregar o arquivo de config e de Node `^22.18` (a máquina local está em 22.17.1). O aviso `MODULE_LEVEL_DIRECTIVE` do rolldown aparece mesmo no modo `unbundle`, em que a diretiva **é** preservada — é falso positivo. O `check-public-api.mjs` não reconhecia `export declare enum` (formato que o `tsdown` gera); corrigido.

~~**Informação pendente (não bloqueia o início):** a **lista dos sistemas que consomem a lib**.~~ **Levantada em 23/09/2026** — tabela na Etapa 2.1 (`specto-frontend`, `viva-flor-frontend`, `copom`, `conoc-frontend`; todos em Next 16). Levantada nos repos locais; se houver consumidor fora deles, acrescentar lá.

### Único ponto que ainda depende de calendário

`react-leaflet` 5 tem peer `react ^19.0.0` **estrito**, e o 4 tem `react ^18.0.0` estrito: no dia em que o 5 entrar como dependência, React 19 passa a ser obrigatório em **todos** os apps. Por isso ele é o último item da Etapa 8. *(Corrigido em 23/09: o texto anterior dizia que a lib declarava `react: ^18 || ^19` desde a Etapa 1 e que nenhum outro pacote forçava a versão do React. Na verdade a `0.1.0` declara `^18.0.0`, e `react-query@3` e `x-date-pickers@6` também prendem em 18 até as Etapas 2 e 7. A janela React 18 + 19 em `1.x` depende da decisão D2.)*

---

## 10. Revalidação de 23/09/2026 (após a Etapa 1)

Conferência de cada afirmação do plano contra o código (`grep` no `src/`), o registry do npm (`npm view`, `npm outdated`) e o que a execução das Etapas 0 e 1 mostrou. As seções acima já estão corrigidas; esta lista registra **o que mudou e por quê**.

**Confirmado sem mudança**
- Apêndices A, B e C: 28 arquivos com `<Grid>` (25 com `item` + `File.tsx`, `Table.tsx`, `GenericTable.tsx` sem `item`), 3 stories, 8 arquivos com props legadas, 21 usos de `JSX.Element` em 10 arquivos, 2 `forwardRef` — tudo bate.
- `react-google-recaptcha` sem nenhum import; `react-query` com um único uso (`AutoComplete.tsx:39`) mais os 3 decorators; `LoadingButton` em `Stepper.tsx:4,141,151`; `decorators/` ainda duplicado; 12 arquivos com `useTheme`/`useMediaQuery`; 5 arquivos importando `next/*`.
- Registry: `@mui/lab` segue sem estável (9.0.0-beta.9); `cookies-next@6` exige `next >= 15`; `@mui/material@9` aceita React 17–19; `microbundle` sem release desde 12/08/2022; TS `latest` = 7.0.2.

**Corrigido no texto**
- Números de linha que mudaram com o `eslint --fix`/prettier da Etapa 0: `OAuthProvider.tsx` (`jwt-decode`: 62, 115, 117; `cookies-next`: 45, 85, 114, 185), `DropFileUpload.tsx:70`, `Teste.tsx` 950 linhas.
- Peer final de MUI: `^7.3.0 || ^9.0.0` (piso do `x-date-pickers@9`), Emotion `^11.9.0`/`^11.8.1`, `x-date-pickers ^8 || ^9` (seção 3).
- **A promessa de `react ^18 || ^19` desde a Etapa 1 era impossível** — três dependências recusam o 19 e o `react-leaflet` não tem versão para os dois (4.3, Etapa 8, seção 9 → D2).
- **`@mui/lab` sai na Etapa 7, não na 2** — a Etapa 2 listava a remoção, mas o substituto só existe no MUI ≥ 6.4.
- Status de cada achado da seção 2 e da seção 5 (resolvido/aberto); seção 5 reordenada numericamente; registro da Etapa 0 dizia "nada commitado".

**Novo**
- *(Etapa 2)* O registro da Etapa 1 afirmava snapshots verdes sobre um `storybook-static/` antigo — ver 5.13d.
- **`tsup` não é mais mantido** → decisão D1 (Etapa 3).
- **Ferramental da Etapa 0 já um major atrás** (eslint 10, vitest 5, jsdom 29, playwright 1.63…) → seção 4.4. O bump do Playwright exige regerar o baseline.
- **`@types/keycloak-js` é stub obsoleto** → remover na Etapa 2.
- **Pacotes do Storybook desalinhados** (core 9.1.20, addons 9.0.17).
- **`react-dropzone@20` exige Node ≥ 22** nos apps.
- **`Next 16` aceita React 18.2** — o salto de Next não depende do de React.
- **O `Input` expõe `InputProps`/`InputLabelProps` na API pública** → a migração para `slotProps` na Etapa 7 pode ser breaking para os apps, não só interna.
- **`check-package.sh` nunca rodava o `attw`** enquanto o `publint` tinha erro (`set -e`). Resolvido de tabela com a Etapa 1 (publint sem erros), mas vale saber se o publint voltar a falhar.
- Da Etapa 1: 5.11 (`Table` quebra no SSR), 5.12 (`@mui/system` embutido no bundle) e a limitação do `file:../../dist` no smoke-app, que **não roda no CI**.

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
