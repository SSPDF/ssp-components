/**
 * Captura um PNG por story a partir do Storybook estático e compara com o baseline.
 *
 * NÃO rode direto na sua máquina: os PNGs precisam nascer sempre no mesmo ambiente,
 * senão a diferença de fontes/antialiasing entre macOS e o CI gera diff em todas as
 * imagens. Use `npm run snapshots` (ou `npm run snapshots:update`), que executam
 * este script dentro do container Linux fixo — ver scripts/snapshots-in-docker.sh.
 *
 * Uso: node scripts/visual-snapshots.mjs [--update]
 */
import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const staticDir = path.join(root, 'storybook-static')
const baselineDir = path.join(root, 'snapshots', 'baseline')
const diffDir = path.join(root, 'snapshots', '__diff__')
const update = process.argv.includes('--update')

const VIEWPORT = { width: 1280, height: 800 }
const MAX_DIFF_RATIO = 0.001 // 0,1% dos pixels

/**
 * Relógio congelado.
 *
 * Várias stories renderizam `new Date()` (GenericTable/PaginacaoServerSide mostra
 * o horário de cada chamada; TableWithStaticData monta as linhas com a data atual).
 * Sem congelar, o snapshot difere a cada minuto e o baseline nunca fecha.
 *
 * `setFixedTime` fixa `Date.now()`/`new Date()` mas **não** pausa os timers — os
 * `setTimeout` do Storybook e dos componentes continuam rodando normalmente.
 */
const HORA_FIXA = new Date('2026-01-15T12:00:00.000Z')

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json',
}

function serve(dir) {
    const server = http.createServer(async (req, res) => {
        try {
            const url = decodeURIComponent(req.url.split('?')[0])
            let file = path.join(dir, url === '/' ? 'index.html' : url)
            if (!file.startsWith(dir)) return res.writeHead(403).end()
            const stat = await fs.stat(file).catch(() => null)
            if (stat?.isDirectory()) file = path.join(file, 'index.html')
            const body = await fs.readFile(file)
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' }).end(body)
        } catch {
            res.writeHead(404).end('not found')
        }
    })
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })))
}

async function main() {
    if (!existsSync(staticDir)) {
        console.error('storybook-static/ não existe. Rode `npm run build-storybook` antes.')
        process.exit(1)
    }

    const { server, port } = await serve(staticDir)
    const base = `http://127.0.0.1:${port}`
    const index = JSON.parse(await fs.readFile(path.join(staticDir, 'index.json'), 'utf8'))
    const ids = Object.values(index.entries)
        .filter((e) => e.type === 'story')
        .map((e) => e.id)
        .sort()

    await fs.mkdir(baselineDir, { recursive: true })
    await fs.rm(diffDir, { recursive: true, force: true })

    const browser = await chromium.launch()

    const failures = []
    const renderErrors = []
    let written = 0

    for (const id of ids) {
        // Um contexto novo por story (localStorage, cookies e cache zerados). Com uma página só
        // para todas, o render de algumas stories dependia do que as anteriores deixaram: com
        // MUI 5.12, 8 stories saíam diferentes do render isolado (UPGRADE_PLAN.md 5.18).
        const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' })
        const page = await context.newPage()
        await page.clock.setFixedTime(HORA_FIXA)
        const errors = []
        page.on('pageerror', (e) => errors.push(String(e)))
        await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle' })
        await page.addStyleTag({
            content: `*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }`,
        })
        await page.waitForTimeout(150)

        const shot = await page.screenshot({ fullPage: false })
        const file = path.join(baselineDir, `${id}.png`)

        if (errors.length) renderErrors.push({ id, errors })
        await context.close()

        if (update || !existsSync(file)) {
            await fs.writeFile(file, shot)
            written++
            continue
        }

        const expected = PNG.sync.read(await fs.readFile(file))
        const actual = PNG.sync.read(shot)
        if (expected.width !== actual.width || expected.height !== actual.height) {
            failures.push({ id, reason: `tamanho mudou: ${expected.width}x${expected.height} -> ${actual.width}x${actual.height}` })
            continue
        }
        const diff = new PNG({ width: expected.width, height: expected.height })
        const changed = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, { threshold: 0.1 })
        const ratio = changed / (expected.width * expected.height)
        if (ratio > MAX_DIFF_RATIO) {
            await fs.mkdir(diffDir, { recursive: true })
            await fs.writeFile(path.join(diffDir, `${id}.diff.png`), PNG.sync.write(diff))
            await fs.writeFile(path.join(diffDir, `${id}.atual.png`), shot)
            failures.push({ id, reason: `${changed} px diferentes (${(ratio * 100).toFixed(3)}%)` })
        }
    }

    await browser.close()
    server.close()

    console.log(`\n${ids.length} stories capturadas.`)
    if (written) console.log(`${written} PNG(s) gravados em snapshots/baseline/.`)

    if (renderErrors.length) {
        console.error(`\n${renderErrors.length} story(ies) com erro de runtime:`)
        for (const { id, errors } of renderErrors) console.error(`  ✗ ${id}\n      ${errors.join('\n      ')}`)
    }

    if (failures.length) {
        console.error(`\n${failures.length} story(ies) com diferença visual (diffs em snapshots/__diff__/):`)
        for (const { id, reason } of failures) console.error(`  ✗ ${id} — ${reason}`)
    }

    if (renderErrors.length || failures.length) process.exit(1)
    console.log('Nenhuma diferença visual e nenhum erro de runtime.')
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
