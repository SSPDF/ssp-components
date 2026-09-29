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
# Usa as versões do package.json do smoke-app, que são a stack atual das peers (Next 16,
# React 19, MUI 9, x-date-pickers 9, react-toastify 11). Desde a 1.0.0-rc.2 cada peer tem um
# major só, então não há mais piso e topo para testar. As variáveis abaixo servem para
# experimentar o próximo major de uma peer antes de adotá-lo:
#
#   SMOKE_NEXT=17 npm run smoke
#   SMOKE_MUI=10 SMOKE_PICKERS=10 npm run smoke                   # o MUI e os pickers andam juntos
#   SMOKE_TOASTIFY=12 npm run smoke
#
# SMOKE_E2E_KEYCLOAK=1 (usado por scripts/e2e-keycloak.sh) serve o app buildado em :3100 e
# roda o e2e do KeycloakAuthProvider contra o Keycloak que aquele script sobe.
# SMOKE_KEYCLOAK_JS=25.0.6 troca o keycloak-js instalado pela lib (para comparar versões).
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f dist/index.d.mts ]; then
    echo "dist/ não existe ou está incompleto. Rode \`npm run build\` antes."
    exit 1
fi

tmp="$(mktemp -d)"
# O `next build` pode reescrever o tsconfig.json e os SMOKE_* alteram o package.json: guarda os originais e os devolve no fim, para
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
if [ -n "${SMOKE_MUI:-}" ]; then
    npm pkg set "dependencies.@mui/material=^$SMOKE_MUI" "dependencies.@mui/icons-material=^$SMOKE_MUI"
fi
if [ -n "${SMOKE_PICKERS:-}" ]; then
    npm pkg set "dependencies.@mui/x-date-pickers=^$SMOKE_PICKERS"
fi
if [ -n "${SMOKE_TOASTIFY:-}" ]; then
    npm pkg set "dependencies.react-toastify=^$SMOKE_TOASTIFY"
fi
versoes="next $(npm pkg get dependencies.next), mui $(npm pkg get dependencies.@mui/material), x-date-pickers $(npm pkg get dependencies.@mui/x-date-pickers), react-toastify $(npm pkg get dependencies.react-toastify)"
echo "── instalando $tarball no smoke-app ($versoes) ──"
# Uma cópia da lib de um run anterior (outra versão, outras peers) faria o npm tentar respeitar as
# peers antigas e falhar com ERESOLVE. O CI roda vários smokes seguidos no mesmo workspace.
rm -rf node_modules/@ssplib
npm install --no-save --no-audit --no-fund "$tmp/$tarball"

if [ -n "${SMOKE_KEYCLOAK_JS:-}" ]; then
    npm install --no-save --no-audit --no-fund "$tmp/$tarball" "keycloak-js@$SMOKE_KEYCLOAK_JS"
fi
echo "keycloak-js instalado: $(npm ls keycloak-js --all 2>/dev/null | grep -o 'keycloak-js@[0-9.]*' | sort -u | tr '\n' ' ')"

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

if [ -n "${SMOKE_E2E_KEYCLOAK:-}" ]; then
    echo
    echo "── e2e do KeycloakAuthProvider ──────────────────────"
    npx next start -p 3100 > "$tmp/next-start.log" 2>&1 &
    servidor=$!
    trap 'kill $servidor 2>/dev/null || true; cp "$tmp/tsconfig.json" "$tmp/package.json" "$app/"; rm -rf "$tmp"; rm -f "$app/package-lock.json"' EXIT
    for _ in $(seq 1 60); do curl -sf -o /dev/null "http://localhost:3100${SMOKE_BASE_PATH:-}/auth-keycloak" && break; sleep 1; done
    node ../../scripts/e2e-keycloak.mjs
fi
