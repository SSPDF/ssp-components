/**
 * Confere que todo módulo de `src/` que começa com a diretiva `'use client'` continua
 * começando com ela no `dist/`, nas duas saídas (`.js` = ESM, `.cjs` = CJS).
 *
 * Existe porque o microbundle a descartava (tudo virava um arquivo só) e o rolldown avisa
 * `MODULE_LEVEL_DIRECTIVE` mesmo no modo `unbundle`, em que ela é preservada — o aviso é
 * suprimido no `tsdown.config.mts`, então a garantia fica aqui (UPGRADE_PLAN.md, Etapa 3).
 * Sem a diretiva, o App Router do Next trata o `Map` como Server Component e quebra.
 *
 * Uso: node scripts/check-use-client.mjs   (depois de `npm run build`)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src')
const dist = path.join(root, 'dist')

const diretiva = /^\s*(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*['"]use client['"]/

function listar(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) return ['stories', 'decorators', 'test', 'teste'].includes(e.name) ? [] : listar(p)
        return /\.tsx?$/.test(e.name) && !/\.(test|stories)\.tsx?$|\.d\.ts$/.test(e.name) ? [p] : []
    })
}

const clientes = listar(src).filter((f) => diretiva.test(fs.readFileSync(f, 'utf8')))
if (!clientes.length) {
    console.error("Nenhum módulo com 'use client' em src/ — o script está procurando no lugar errado?")
    process.exit(1)
}

const erros = []
for (const f of clientes) {
    const base = path.relative(src, f).replace(/\.tsx?$/, '')
    for (const ext of ['.js', '.cjs']) {
        const saida = path.join(dist, base + ext)
        if (!fs.existsSync(saida)) erros.push(`dist/${base}${ext} não existe`)
        else if (!diretiva.test(fs.readFileSync(saida, 'utf8'))) erros.push(`dist/${base}${ext} perdeu o 'use client'`)
    }
}

console.log(`${clientes.length} módulos com 'use client' em src/: ${clientes.map((f) => path.relative(src, f)).join(', ')}`)
if (erros.length) {
    for (const e of erros) console.error(`  ✗ ${e}`)
    process.exit(1)
}
console.log("'use client' preservado no ESM e no CJS.")
