#!/usr/bin/env bash
#
# Builda o examples/smoke-app contra o pacote **como ele seria publicado**.
#
# Não usa o `file:../../dist` do package.json do smoke-app: com ele o npm só cria um
# symlink, não instala as `dependencies` da lib, e o Node resolve o MUI a partir do
# node_modules da raiz do repo — ou seja, não testa o contrato de peers
# (UPGRADE_PLAN.md, registro da Etapa 1). Aqui o dist/ vira tarball (`npm pack`) e
# é instalado como um app instalaria.
#
# O `next build` faz o prerender da página, então também é o teste de SSR dos
# componentes que ela usa.
#
# Roda depois de `npm run build`.
#
# Por padrão usa o Next do package.json do smoke-app (14, o piso da peer). Para
# testar outro major da faixa declarada (`^14 || ^15 || ^16`):
#
#   SMOKE_NEXT=16 npm run smoke
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f dist/index.d.ts ]; then
    echo "dist/ não existe ou está incompleto. Rode \`npm run build\` antes."
    exit 1
fi

tmp="$(mktemp -d)"
# O `next build` reescreve o tsconfig.json (o 16 troca `jsx` para `react-jsx`) e o
# SMOKE_NEXT altera o package.json: guarda os originais e os devolve no fim, para
# não sujar o working tree.
# Caminho absoluto: o trap roda depois do `cd examples/smoke-app`.
app="$PWD/examples/smoke-app"
cp "$app/tsconfig.json" "$app/package.json" "$tmp/"
trap 'cp "$tmp/tsconfig.json" "$tmp/package.json" "$app/"; rm -rf "$tmp"; rm -f "$app/package-lock.json"' EXIT

cp lib-package.json dist/package.json
tarball="$(cd dist && npm pack --silent --pack-destination "$tmp")"

cd "$app"
if [ -n "${SMOKE_NEXT:-}" ]; then
    # No package.json, e não como `npm install next@X`: senão o `npm ls` abaixo
    # acusa o next instalado como fora da faixa do package.json.
    npm pkg set "dependencies.next=^$SMOKE_NEXT"
fi
echo "── instalando $tarball no smoke-app (next $(npm pkg get dependencies.next)) ──"
npm install --no-save --no-audit --no-fund "$tmp/$tarball"

echo
echo "── uma cópia de cada peer? ──────────────────────────"
# `npm ls` sai com erro se houver peer inválida ou duplicata não deduplicada
npm ls next @mui/material @emotion/react react-hook-form react-toastify dayjs

echo
echo "── next build ───────────────────────────────────────"
npm run build
