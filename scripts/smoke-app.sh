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
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f dist/index.d.ts ]; then
    echo "dist/ não existe ou está incompleto. Rode \`npm run build\` antes."
    exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"; rm -f examples/smoke-app/package-lock.json' EXIT

cp lib-package.json dist/package.json
tarball="$(cd dist && npm pack --silent --pack-destination "$tmp")"

cd examples/smoke-app
echo "── instalando $tarball no smoke-app ──────────────────"
npm install --no-save --no-audit --no-fund "$tmp/$tarball"

echo
echo "── uma cópia de cada peer? ──────────────────────────"
# `npm ls` sai com erro se houver peer inválida ou duplicata não deduplicada
npm ls @mui/material @emotion/react react-hook-form react-toastify dayjs

echo
echo "── next build ───────────────────────────────────────"
npm run build
