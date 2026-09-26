#!/usr/bin/env bash
#
# Confere o pacote que vai realmente ser publicado (dist/ + lib-package.json).
#
# externos: o que o bundle importa bate com o que o lib-package.json declara.
# use client: os módulos do mapa mantêm a diretiva no ESM e no CJS.
# interop CJS: nenhum `__toESM(x, 1)` no CJS (ver abaixo).
# publint: aponta entrypoints quebrados, ordem errada das condições de `exports`, etc.
# attw:    aponta se os tipos resolvem em cada modo (node10/node16/bundler).
#
# Roda depois de `npm run build`.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f dist/index.d.ts ]; then
    echo "dist/ não existe ou está incompleto. Rode \`npm run build\` antes."
    exit 1
fi

cp lib-package.json dist/package.json

echo "── externos ─────────────────────────────────────────"
node scripts/check-externals.mjs

echo
echo "── 'use client' ─────────────────────────────────────"
node scripts/check-use-client.mjs

echo
echo "── interop do CJS ───────────────────────────────────"
# `__toESM(x, 1)` é o interop em "modo Node", que o rolldown usa quando o package.json
# raiz tem "type": "module": ignora o `__esModule` e faz `import Grid from
# '@mui/material/Grid'` virar o objeto do módulo no CJS. Nenhum outro check pega — o
# smoke-app consome o ESM (UPGRADE_PLAN.md, registro da Etapa 3).
if grep -rlE '__toESM\([^()]*, 1\)' dist --include='*.cjs'; then
    echo "✗ CJS com interop em modo Node (arquivos acima). O package.json raiz ganhou \"type\": \"module\"?"
    exit 1
fi
echo "CJS sem interop em modo Node."

echo
echo "── publint ──────────────────────────────────────────"
npx --yes publint@latest ./dist

echo
echo "── are-the-types-wrong ──────────────────────────────"
# `unexpected-module-syntax` é o 🚭 node16-ESM conhecido: o ESM sai em `.js` sem "type"
# de propósito, porque `.mjs` quebra o SSR do Next 14 com MUI 5 (UPGRADE_PLAN.md, registro
# da Etapa 3; volta na Etapa 7). Sem ignorá-lo o attw sai com erro em todo build — já
# saía na 0.2.1 — e o CI parava aqui, antes do smoke e dos snapshots. As outras regras
# continuam bloqueando.
npx --yes @arethetypeswrong/cli@latest --pack ./dist --ignore-rules unexpected-module-syntax
