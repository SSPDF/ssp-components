#!/usr/bin/env bash
#
# E2E do KeycloakAuthProvider: builda o smoke-app com o pacote empacotado (como `npm run smoke`),
# serve em :3100 e roda scripts/e2e-keycloak.mjs no browser, com o keycloak-js de verdade.
#
# Sem variáveis, usa o servidor OIDC simulado (scripts/lib/oidc-simulado.mjs), que sobe aqui mesmo,
# sem Docker: é o modo do CI. Com E2E_KC_URL, roda contra um Keycloak real (o de HMG):
#
#   npm run e2e:keycloak                              # simulado
#   SMOKE_NEXT=16 npm run e2e:keycloak                # as mesmas variáveis do smoke
#   SMOKE_KEYCLOAK_JS=25.0.6 npm run e2e:keycloak     # outra versão do keycloak-js, para comparar
#   E2E_KC_URL=<url do Keycloak> E2E_KC_REALM=<realm> \
#     E2E_KC_CLIENT_ID=<client com redirect http://localhost:3100/*> E2E_KC_USUARIO=... E2E_KC_SENHA=... \
#     [E2E_KC_ROLE=...] [E2E_KC_RESOURCE=...] [E2E_KC_ESPERAR_REFRESH=1] npm run e2e:keycloak
#
# Roda depois de `npm run build`.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -n "${E2E_KC_URL:-}" ]; then
    : "${E2E_KC_REALM:?defina E2E_KC_REALM}" "${E2E_KC_CLIENT_ID:?defina E2E_KC_CLIENT_ID}"
    export NEXT_PUBLIC_E2E_KEYCLOAK_URL="$E2E_KC_URL"
    export NEXT_PUBLIC_E2E_KEYCLOAK_REALM="$E2E_KC_REALM"
    export NEXT_PUBLIC_E2E_KEYCLOAK_CLIENT_ID="$E2E_KC_CLIENT_ID"
    export NEXT_PUBLIC_E2E_KEYCLOAK_RESOURCE="${E2E_KC_RESOURCE:-$E2E_KC_CLIENT_ID}"
    echo "── alvo: Keycloak em $E2E_KC_URL (realm $E2E_KC_REALM, client $E2E_KC_CLIENT_ID) ──"
else
    node scripts/lib/oidc-simulado.mjs > /tmp/ssp-oidc-simulado.log 2>&1 &
    simulador=$!
    trap 'kill $simulador 2>/dev/null || true' EXIT
    for _ in $(seq 1 30); do curl -sf -o /dev/null http://localhost:8180/__estado && break; sleep 0.5; done
    curl -sf -o /dev/null http://localhost:8180/__estado || { echo "o OIDC simulado não subiu:"; cat /tmp/ssp-oidc-simulado.log; exit 1; }
    echo "── alvo: OIDC simulado em http://localhost:8180 ──"
fi

# basePath, como em todos os apps: o silent-check-sso.html e o redirect de logout ficam embaixo dele.
export SMOKE_BASE_PATH="${SMOKE_BASE_PATH:-/e2e}"
export NEXT_PUBLIC_E2E_BASE_PATH="$SMOKE_BASE_PATH"

SMOKE_E2E_KEYCLOAK=1 ./scripts/smoke-app.sh
