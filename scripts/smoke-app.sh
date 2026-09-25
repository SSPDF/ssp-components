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
# Por padrão usa as versões do package.json do smoke-app, que são o piso das peers
# (Next 14, x-date-pickers 6, react-toastify 10). Para testar outro major da faixa
# declarada:
#
#   SMOKE_NEXT=16 npm run smoke                                   # next ^14 || ^15 || ^16
#   SMOKE_PICKERS=7 npm run smoke                                 # x-date-pickers ^6 || ^7
#   SMOKE_TOASTIFY=11 npm run smoke                               # react-toastify ^10 || ^11
#   SMOKE_NEXT=16 SMOKE_PICKERS=7 SMOKE_TOASTIFY=11 npm run smoke # combinação do copom
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
# No package.json, e não como `npm install pacote@X`: senão o `npm ls` abaixo
# acusa o pacote instalado como fora da faixa do package.json.
if [ -n "${SMOKE_NEXT:-}" ]; then
    npm pkg set "dependencies.next=^$SMOKE_NEXT"
fi
if [ -n "${SMOKE_PICKERS:-}" ]; then
    npm pkg set "dependencies.@mui/x-date-pickers=^$SMOKE_PICKERS"
fi
if [ -n "${SMOKE_TOASTIFY:-}" ]; then
    npm pkg set "dependencies.react-toastify=^$SMOKE_TOASTIFY"
fi
versoes="next $(npm pkg get dependencies.next), x-date-pickers $(npm pkg get dependencies.@mui/x-date-pickers), react-toastify $(npm pkg get dependencies.react-toastify)"
echo "── instalando $tarball no smoke-app ($versoes) ──"
npm install --no-save --no-audit --no-fund "$tmp/$tarball"

echo
echo "── uma cópia de cada peer? ──────────────────────────"
# `npm ls` sai com erro se houver peer inválida ou duplicata não deduplicada
npm ls next @mui/material @mui/x-date-pickers @emotion/react react-hook-form react-toastify dayjs

echo
echo "── next build ───────────────────────────────────────"
npm run build

echo
echo "── valor padrão do DatePicker na primeira montagem ──"
# UPGRADE_PLAN.md 5.17 — detalhes no próprio script.
node verificar-datepicker.cjs
