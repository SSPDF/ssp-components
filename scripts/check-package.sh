#!/usr/bin/env bash
#
# Confere o pacote que vai realmente ser publicado (dist/ + lib-package.json).
#
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

echo "── publint ──────────────────────────────────────────"
npx --yes publint@latest ./dist

echo
echo "── are-the-types-wrong ──────────────────────────────"
npx --yes @arethetypeswrong/cli@latest --pack ./dist
