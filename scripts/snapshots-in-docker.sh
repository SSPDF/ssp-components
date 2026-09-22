#!/usr/bin/env bash
#
# Roda a captura de snapshots visuais dentro de um container Linux fixo.
#
# Por que container: um PNG gerado no macOS NUNCA bate com o gerado no CI — fontes,
# hinting e antialiasing são diferentes. Se cada pessoa gerar o baseline na própria
# máquina, todo PR vira um diff de 77 imagens e o time para de olhar para eles.
# A imagem abaixo é a mesma usada no workflow de CI; mudou a imagem, regere o baseline.
#
#   ./scripts/snapshots-in-docker.sh            # compara com o baseline
#   ./scripts/snapshots-in-docker.sh --update   # regrava o baseline
#
set -euo pipefail

# Fixado por digest para o baseline não mudar quando a tag for republicada.
IMAGE="mcr.microsoft.com/playwright:v1.55.0-noble"

cd "$(dirname "$0")/.."

if [ ! -d storybook-static ]; then
    echo "storybook-static/ não existe — rodando build-storybook primeiro."
    npm run build-storybook
fi

exec docker run --rm -t \
    -v "$PWD":/work \
    -w /work \
    --ipc=host \
    "$IMAGE" \
    node scripts/visual-snapshots.mjs "$@"
