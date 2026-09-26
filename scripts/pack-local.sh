#!/usr/bin/env bash
#
# Gera o pacote exatamente como o `npm publish` o enviaria (mesmos passos do
# .github/workflows/publish.yaml), mas como um .tgz local, para instalar num app
# real sem publicar nada no npm.
#
#   npm run pack:local
#   # no app:  npm install /caminho/para/pack/ssplib-react-components-<versão>.tgz
#
# Prefira isto a `npm link`: o link cria um symlink e o app passa a resolver
# React/MUI/Emotion a partir do node_modules DESTE repo — duas cópias na árvore,
# exatamente o problema que as peerDependencies existem para evitar.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

cp lib-package.json dist/package.json
cp README.md dist/README.md
cp CHANGELOG.md dist/CHANGELOG.md
cp AGENTS.md dist/AGENTS.md

mkdir -p pack
tarball="$(cd dist && npm pack --silent --pack-destination ../pack)"

echo
echo "Pacote gerado: $PWD/pack/$tarball"
echo
echo "No app consumidor (num branch de teste):"
echo "  npm install $PWD/pack/$tarball"
echo
echo "Para voltar à versão publicada:"
echo "  npm install @ssplib/react-components@<versão-anterior>"
