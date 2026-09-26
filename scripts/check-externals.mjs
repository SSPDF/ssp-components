/**
 * Compara os pacotes importados pelo bundle (todo `.js`/`.mjs`/`.d.ts`/`.d.mts` em `dist/`) com o que o
 * `lib-package.json` declara em `dependencies` + `peerDependencies`.
 *
 * Existe por causa de dois achados (UPGRADE_PLAN.md 2.2.1 e 5.12):
 * - import de pacote **não declarado** → no app consumidor ele só resolve se, por
 *   acaso, estiver na árvore (o `@mui/lab` do `Stepper`);
 * - pacote que não está em manifesto nenhum nem vira import externo: o microbundle o
 *   **embute** no `dist/` sem avisar (o `@mui/system`). Esse caso não aparece como
 *   import — é pego conferindo que nada em `src/` importa pacote fora da lista. (Desde a
 *   Etapa 3 o `tsdown.config.mts` também barra isso no build, com `deps.onlyBundle: []`.)
 * E o inverso: dependência declarada que o bundle não usa é peso morto no `npm
 * install` de todo app (o `react-google-recaptcha`).
 *
 * Uso: node scripts/check-externals.mjs   (depois de `npm run build`)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const lib = JSON.parse(fs.readFileSync(path.join(root, 'lib-package.json'), 'utf8'))

if (!fs.existsSync(path.join(dist, 'index.d.ts'))) {
    console.error('dist/ não existe. Rode `npm run build` antes.')
    process.exit(1)
}

/** `@escopo/pacote/sub/caminho` → `@escopo/pacote`; `pacote/sub` → `pacote`. */
const pacoteDe = (spec) => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])
const relativo = (spec) => spec.startsWith('.') || spec.startsWith('/')

function importsDe(codigo) {
    const specs = new Set()
    const padroes = [/\bfrom\s*["']([^"']+)["']/g, /\bimport\s*["']([^"']+)["']/g, /\bimport\(\s*["']([^"']+)["']\s*\)/g, /\brequire\(\s*["']([^"']+)["']\s*\)/g]
    for (const re of padroes) for (const m of codigo.matchAll(re)) if (!relativo(m[1])) specs.add(m[1])
    return specs
}

// 1. O que o bundle importa — com o `unbundle` do tsdown (Etapa 3) é um arquivo por módulo,
// espalhados em dist/**. Os tipos entram também: import de pacote não declarado num .d.ts
// quebra o typecheck do app.
const arquivosDoDist = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) return arquivosDoDist(p)
        return /\.(c|m)?js$|\.d\.(c|m)?ts$/.test(e.name) ? [p] : []
    })
const usados = new Set()
for (const f of arquivosDoDist(dist)) for (const spec of importsDe(fs.readFileSync(f, 'utf8'))) usados.add(pacoteDe(spec))

// 2. O que o src/ importa (pega o pacote embutido, que some dos imports do dist/)
function listar(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) return ['stories', 'decorators', 'test', 'teste'].includes(e.name) ? [] : listar(p)
        return /\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : []
    })
}
const usadosNoSrc = new Map()
for (const f of listar(path.join(root, 'src'))) {
    const codigo = fs.readFileSync(f, 'utf8').replace(/^\s*import\s+type\s[^\n]*$/gm, '')
    for (const spec of importsDe(codigo)) {
        const pkg = pacoteDe(spec)
        if (!usadosNoSrc.has(pkg)) usadosNoSrc.set(pkg, path.relative(root, f))
    }
}

const declarados = new Set([...Object.keys(lib.dependencies ?? {}), ...Object.keys(lib.peerDependencies ?? {})])
// Peers que a lib não importa direto, mas que precisam estar no app para as outras
// funcionarem: o Emotion é o motor de estilo do `@mui/material`, e o `react-dom`
// acompanha o `react`.
const implicitos = new Set(['@emotion/react', '@emotion/styled', 'react-dom'])

const naoDeclaradosNoBundle = [...usados].filter((p) => !declarados.has(p))
const naoDeclaradosNoSrc = [...usadosNoSrc.keys()].filter((p) => !declarados.has(p))
const semUso = [...declarados].filter((p) => !usados.has(p) && !implicitos.has(p) && !usadosNoSrc.has(p))

console.log(`dist/ importa ${usados.size} pacotes; lib-package.json declara ${declarados.size}.`)

let falhou = false
if (naoDeclaradosNoBundle.length) {
    falhou = true
    console.error('\n✗ Importados pelo bundle, mas não declarados (o app pode não ter):')
    for (const p of naoDeclaradosNoBundle) console.error(`    ${p}`)
}
if (naoDeclaradosNoSrc.length) {
    falhou = true
    console.error('\n✗ Importados em src/, mas não declarados (sem estar declarado, o build embutiria uma cópia no dist/):')
    for (const p of naoDeclaradosNoSrc) console.error(`    ${p}  ← ${usadosNoSrc.get(p)}`)
}
if (semUso.length) {
    falhou = true
    console.error('\n✗ Declarados, mas nada no bundle nem no src/ importa (peso morto no install dos apps):')
    for (const p of semUso) console.error(`    ${p}`)
}

if (falhou) process.exit(1)
console.log('Externos do bundle batem com o lib-package.json.')
