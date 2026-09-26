/**
 * Build da lib (Etapa 3 do UPGRADE_PLAN.md, decisão D1).
 *
 * `tsdown` é pré-1.0 e a 0.23 ignora em silêncio opção desconhecida ou removida — confira
 * cada opção em `.claude/skills/tsdown/references/option-*.md` antes de mexer aqui.
 */
import { defineConfig } from 'tsdown'
import lib from './lib-package.json' with { type: 'json' }

// O contrato de dependências é o do pacote publicado (lib-package.json), não o da raiz.
const pacotes = [...Object.keys(lib.dependencies), ...Object.keys(lib.peerDependencies)]
const pacoteOuSubcaminho = (p: string) => new RegExp(`^${p.replace(/[/.]/g, '\\$&')}(/.*)?$`)

export default defineConfig({
    // Só o que é alcançável a partir das entradas vai para o dist/ — stories, decorators,
    // testes e components/teste ficam de fora sem precisar de exclude.
    entry: { index: 'src/index.ts', 'types/auth': 'src/types/auth.ts', 'types/form': 'src/types/form.ts' },
    // Um arquivo por módulo (como o MUI publica). Preserva o 'use client' de Map/DraggableMarker,
    // que o modo bundle (e o microbundle) descartavam.
    unbundle: true,
    format: ['esm', 'cjs'],
    // O package.json da raiz tem "type": "module", e o tsdown escolhe a extensão por ele. O publicado
    // (lib-package.json) não tem "type", então as extensões são fixadas: .mjs/.d.mts para ESM,
    // .js/.d.ts para CJS.
    outExtensions: ({ format }) => (format === 'es' ? { js: '.js', dts: '.d.ts' } : { js: '.cjs', dts: '.d.cts' }),
    dts: true,
    platform: 'neutral',
    // Sem isto o tsdown usaria o engines.node da raiz (requisito de build, não de runtime).
    target: 'es2020',
    deps: {
        neverBundle: pacotes.map(pacoteOuSubcaminho),
        // Nada de node_modules pode ser embutido (o @mui/system embutido pelo microbundle, 5.12)…
        onlyBundle: [],
        // …e o dist/ (JS e .d.ts) só pode importar o que o lib-package.json declara (2.2.1).
        onlyImport: pacotes.map(pacoteOuSubcaminho),
    },
    sourcemap: true,
    clean: true,
    // Falso positivo no modo unbundle: a diretiva 'use client' é preservada (conferido por
    // scripts/check-use-client.mjs no check:package).
    suppressWarnings: [/MODULE_LEVEL_DIRECTIVE/, /Module level directives cause errors when bundled/],
})
