/**
 * Compara os exports de `src/index.ts` com os de `dist/index.d.ts` (tipos do ESM) e
 * `dist/index.d.cts` (tipos do CJS, desde a Etapa 3).
 *
 * Existe porque o build não protege nada: `tsconfig.json` tem `strict: false` e
 * `noEmit: true`, então um export que some do bundle não gera erro nenhum — só
 * quebra no app consumidor, depois do publish.
 *
 * Uso: node scripts/check-public-api.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcFile = path.join(root, 'src', 'index.ts')
const distFiles = ['index.d.ts', 'index.d.cts']

for (const f of distFiles) {
    if (!fs.existsSync(path.join(root, 'dist', f))) {
        console.error(`dist/${f} não existe. Rode \`npm run build\` antes.`)
        process.exit(1)
    }
}

/** Nomes dentro de cada bloco `export { ... }`, já sem comentários e sem `as`. */
function exportedNames(code) {
    const semComentarios = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    const nomes = new Set()
    for (const bloco of semComentarios.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
        for (const parte of bloco[1].split(',')) {
            const limpo = parte.trim().replace(/^type\s+/, '')
            if (!limpo) continue
            const alias = limpo.split(/\s+as\s+/)
            nomes.add((alias[1] ?? alias[0]).trim())
        }
    }
    // `export declare const X` / `function` / `enum` … no .d.ts (o `enum` apareceu com o tsdown)
    for (const m of semComentarios.matchAll(/export\s+declare\s+(?:const\s+enum|const|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) {
        nomes.add(m[1])
    }
    return nomes
}

const esperados = exportedNames(fs.readFileSync(srcFile, 'utf8'))

let falhou = false
for (const f of distFiles) {
    const publicados = exportedNames(fs.readFileSync(path.join(root, 'dist', f), 'utf8'))

    const faltando = [...esperados].filter((n) => !publicados.has(n)).sort()
    const sobrando = [...publicados].filter((n) => !esperados.has(n)).sort()

    console.log(`src/index.ts: ${esperados.size} exports | dist/${f}: ${publicados.size} exports`)

    if (faltando.length) {
        falhou = true
        console.error(`\nFALTANDO no dist/${f} (regressão de API pública — quebra o app consumidor):`)
        for (const n of faltando) console.error(`  ✗ ${n}`)
    }
    if (sobrando.length) {
        console.warn(`\nSó no dist/${f} (provavelmente reexport interno, confira):`)
        for (const n of sobrando) console.warn(`  ? ${n}`)
    }
}

if (falhou) process.exit(1)
console.log('\nAPI pública íntegra.')
