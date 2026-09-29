# smoke-app

App Next mínimo que consome a lib como um sistema de verdade consome. O `package.json`
fica na stack atual das peers: **Next 16, React 19, MUI 9, `x-date-pickers` 9 e
`react-toastify` 11**. Desde a `1.0.0-rc.2` a lib declara só o major atual de cada peer,
então há um cenário só (ver abaixo).

## Para que serve

A lib **não embute o MUI** — ela o importa como externo, então a versão do MUI que
roda em produção é a do app consumidor (UPGRADE_PLAN.md, seção 2.2). Storybook não
testa isso: lá o MUI é o mesmo da lib. Este app é o único lugar onde o cenário real
é exercido — com o `ThemeProvider` do app, uma cópia só do Emotion e os tipos da lib
atravessando a fronteira.

É o que valida a Etapa 1 (peers declaradas), a Etapa 3 (troca do bundler) e,
principalmente, a Etapa 7 (MUI 5 → 9) e a `1.0.0-rc.2` (React 19, Next 16, ESM em `.mjs`).

## Como rodar

```bash
# na raiz do repo
npm run build            # gera dist/, que é o que o app instala

cd examples/smoke-app
npm install
npm run dev              # http://localhost:3100
```

`@ssplib/react-components` é instalado via `file:../../dist`, então **é preciso
rodar `npm run build` na raiz antes** e de novo a cada alteração na lib.

### Validando o contrato de dependências (peers)

O link `file:../../dist` é bom para iterar, mas **não reproduz a instalação real**:
o npm (`install-links=false`) cria só um symlink, não instala as `dependencies` da
lib, e a partir do caminho real do `dist/` o Node resolve pacotes — inclusive o
`@mui/material` — no `node_modules` da raiz do repo. Para validar o que vai ser
publicado, instale o tarball:

```bash
# na raiz do repo
npm run build && cp lib-package.json dist/package.json
(cd dist && npm pack --pack-destination /tmp)

cd examples/smoke-app
npm install --no-save /tmp/ssplib-react-components-<versão>.tgz
npm ls @mui/material @emotion/react react-hook-form   # uma cópia de cada, todas "deduped"
npm run build && npm start
```

O `npm install` cria um `package-lock.json` com o caminho do tarball — não
versione.

O `npm run smoke` (na raiz) faz tudo isso sozinho — e é o que roda no CI.

### Outras versões das peers

Até a `1.0.0-rc.1` o CI rodava o smoke três vezes, no piso e no topo das faixas das peers.
Desde a `rc.2` cada peer tem um major só (UPGRADE_PLAN.md, decisão de 27/09/2026) e o CI
roda uma vez, com o `package.json` do smoke-app. As variáveis servem para experimentar o
próximo major de uma peer antes de adotá-lo:

```bash
# na raiz do repo, depois de `npm run build`
SMOKE_NEXT=17 npm run smoke
SMOKE_MUI=10 SMOKE_PICKERS=10 npm run smoke    # o MUI e os pickers andam juntos
SMOKE_TOASTIFY=12 npm run smoke
```

`SMOKE_NEXT`, `SMOKE_MUI`, `SMOKE_PICKERS` e `SMOKE_TOASTIFY` trocam a faixa no `package.json` só durante a execução; o
script devolve o `package.json` e o `tsconfig.json` ao estado original no fim. O
`node_modules` fica com a versão testada: se o próximo `npm run smoke` der `ERESOLVE`,
apague o `examples/smoke-app/node_modules`.

## O que a página exercita

- `SspComponentsProvider` (portal de modal + toasts)
- `FormProvider` + `Input` (contexto customizado) — incluindo tipos mascarados
- `GenericFormProvider` (exportado desde a 0.1.0) + `GenericInput` (contexto nativo do react-hook-form)
- `Table` com dados estáticos, importada direto (renderiza no SSR desde a 0.2.0 —
  até a 0.1.x lia o `localStorage` no render e exigia `next/dynamic` + `ssr: false`)
- `DatePicker`
- `MODAL`
- em `/next-apis`: `NavBar` (`next/image`, `next/link`, `next/router`) e `Map`
  (`next/dynamic` com `ssr: false`) — a superfície que um major do Next pode quebrar
- um `ThemeProvider` com paleta própria, para confirmar que o tema do app
  chega nos componentes da lib (é o que quebra se o MUI duplicar na árvore)

## Fora do build da lib

Esta pasta está no `ignores` do ESLint, no `.prettierignore`, no `exclude` do
`tsconfig.json` e não entra no pacote publicado.
