# smoke-app

App Next 14 mínimo que consome a lib como um sistema de verdade consome.

## Para que serve

A lib **não embute o MUI** — ela o importa como externo, então a versão do MUI que
roda em produção é a do app consumidor (UPGRADE_PLAN.md, seção 2.2). Storybook não
testa isso: lá o MUI é o mesmo da lib. Este app é o único lugar onde o cenário real
é exercido — com o `ThemeProvider` do app, uma cópia só do Emotion e os tipos da lib
atravessando a fronteira.

É o que valida a Etapa 1 (peers declaradas), a Etapa 3 (troca do bundler) e,
principalmente, a Etapa 7 (MUI 5 → 9).

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

## O que a página exercita

- `SspComponentsProvider` (portal de modal + toasts)
- `FormProvider` + `Input` (contexto customizado) — incluindo tipos mascarados
- `GenericFormProvider` (exportado desde a 0.1.0) + `GenericInput` (contexto nativo do react-hook-form)
- `Table` com dados estáticos, importada direto (renderiza no SSR desde a 0.2.0 —
  até a 0.1.x lia o `localStorage` no render e exigia `next/dynamic` + `ssr: false`)
- `DatePicker`
- `MODAL`
- um `ThemeProvider` com paleta própria, para confirmar que o tema do app
  chega nos componentes da lib (é o que quebra se o MUI duplicar na árvore)

## Fora do build da lib

Esta pasta está no `ignores` do ESLint, no `.prettierignore`, no `exclude` do
`tsconfig.json` e não entra no pacote publicado.
