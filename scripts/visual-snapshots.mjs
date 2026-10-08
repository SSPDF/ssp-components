/**
 * Captura um PNG por story a partir do Storybook estático e compara com o baseline, e roda as
 * `play` functions: as stories com a tag `interacao` usam o componente (clicam, digitam, enviam o
 * formulário) e verificam o resultado. Elas não geram PNG (o estado final tem toasts com tempo de
 * vida e animações); o que conta é a `play` passar. Ver src/stories/interacao.ts.
 *
 * NÃO rode direto na sua máquina: os PNGs precisam nascer sempre no mesmo ambiente,
 * senão a diferença de fontes/antialiasing entre macOS e o CI gera diff em todas as
 * imagens. Use `npm run snapshots` (ou `npm run snapshots:update`), que executam
 * este script dentro do container Linux fixo — ver scripts/snapshots-in-docker.sh.
 *
 * Cada story roda duas vezes: no tema claro (o padrão do MUI, baseline em `snapshots/baseline/`) e no
 * escuro do app (`&globals=tema:escuro`, ver src/decorators/TemaDecorator.tsx; baseline em
 * `snapshots/baseline/escuro/`). As stories de tema próprio (tag `tema-proprio`) também seguem o
 * global, cada uma com o seu mecanismo de tema.
 * No escuro, depois do render (e da `play`), `scripts/lib/contraste.mjs` confere se todo texto e
 * ícone visível é legível sobre o fundo e se sobrou superfície clara fixa. O que já é igual no claro
 * da mesma story não conta: é design fixo, guardado pelo baseline (o placeholder dos pickers do MUI
 * e os botões verdes de texto branco ficam abaixo de 3:1 nos dois temas). O que se quer pegar é a
 * cor que não acompanha o tema do app. Com a tag `cor-do-app`, a story tem cores fixas que o app
 * escolheu (a `TabNavBar` com `customBgColor`): o contraste vale, a superfície clara não.
 *
 * Uso: node scripts/visual-snapshots.mjs [--update] [--filtro <trecho do id>]
 *      (SNAPSHOTS_DETALHE=1 lista diferenças abaixo da tolerância)
 */
import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { instalarEscuta, esperarStory, resumirErro } from './lib/storybook-play.mjs'
import { verificarLegibilidade, chaveDoProblema } from './lib/contraste.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const staticDir = path.join(root, 'storybook-static')
const baselineDir = path.join(root, 'snapshots', 'baseline')
const diffDir = path.join(root, 'snapshots', '__diff__')
const update = process.argv.includes('--update')
const iFiltro = process.argv.indexOf('--filtro')
const filtro = iFiltro >= 0 ? process.argv[iFiltro + 1] : ''

/** `claro` = como a story sempre rodou; `escuro` = tema escuro do app com variáveis CSS. */
const TEMAS = [
    { nome: 'claro', query: '', pasta: baselineDir },
    { nome: 'escuro', query: '&globals=tema:escuro', pasta: path.join(baselineDir, 'escuro') },
]

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
    const stories = Object.values(index.entries).filter((e) => e.type === 'story')
    const ids = stories
        .map((e) => e.id)
        .filter((id) => id.includes(filtro))
        .sort()
    const temaProprio = new Set(stories.filter((e) => e.tags?.includes('tema-proprio')).map((e) => e.id))
    const corDoApp = new Set(stories.filter((e) => e.tags?.includes('cor-do-app')).map((e) => e.id))
    const interacao = new Set(stories.filter((e) => e.tags?.includes('interacao')).map((e) => e.id))

    await fs.mkdir(baselineDir, { recursive: true })
    await fs.rm(diffDir, { recursive: true, force: true })

    const browser = await chromium.launch()

    const failures = []
    const renderErrors = []
    const playFailures = []
    const legibilidade = []
    const problemasNoClaro = new Map()
    let written = 0

    const execucoes = ids.flatMap((id) => TEMAS.map((tema) => ({ id, tema })))
    for (const { id, tema } of execucoes) {
        const rotulo = tema.nome === 'claro' ? id : `${id} [escuro]`
        // Um contexto novo por story (localStorage, cookies e cache zerados). Com uma página só
        // para todas, o render de algumas stories dependia do que as anteriores deixaram: com
        // MUI 5.12, 8 stories saíam diferentes do render isolado (UPGRADE_PLAN.md 5.18).
        const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' })
        const page = await context.newPage()
        await page.clock.setFixedTime(HORA_FIXA)
        const errors = []
        page.on('pageerror', (e) => errors.push(resumirErro(e)))
        await instalarEscuta(page)
        await page.goto(`${base}/iframe.html?id=${id}&viewMode=story${tema.query}`, { waitUntil: 'networkidle' })
        const resultado = await esperarStory(page)
        // O ThemeProvider põe a classe `dark` no <html> num efeito, depois do primeiro render.
        if (tema.nome === 'escuro' && !temaProprio.has(id)) await page.waitForFunction(() => document.documentElement.classList.contains('dark'), null, { timeout: 5_000 }).catch(() => {})
        if (resultado.status !== 'success') playFailures.push({ id: rotulo, errors: resultado.erros.length ? resultado.erros : [`status ${resultado.status}`] })

        // Sem animação e sem transição: a legibilidade é medida no estado final, e o PNG também.
        await page.addStyleTag({
            // O toast tem tempo de vida (some em 5 s): nas stories que enviam o formulário no `play`
            // (ex.: "Estados de erro"), a captura sairia com ou sem ele conforme o tempo.
            content: `*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; } .Toastify { display: none !important; }`,
        })
        await page.waitForTimeout(150)
        // Legibilidade: o claro só serve de referência (o design de sempre, guardado pelo baseline);
        // no escuro, falha o que não é igual no claro.
        if (tema.nome === 'claro') {
            problemasNoClaro.set(id, new Set((await page.evaluate(verificarLegibilidade, {})).map(chaveDoProblema)))
        } else {
            const noClaro = problemasNoClaro.get(id) ?? new Set()
            const ilegiveis = (await page.evaluate(verificarLegibilidade, { superficies: !corDoApp.has(id) })).filter((p) => !noClaro.has(chaveDoProblema(p)))
            if (ilegiveis.length) legibilidade.push({ id: rotulo, ilegiveis })
        }

        if (interacao.has(id)) {
            if (errors.length) renderErrors.push({ id: rotulo, errors })
            await context.close()
            continue
        }

        const shot = await page.screenshot({ fullPage: false })
        const file = path.join(tema.pasta, `${id}.png`)
        const nomeDiff = tema.nome === 'claro' ? id : `${id}--escuro`

        if (errors.length) renderErrors.push({ id: rotulo, errors })
        await context.close()

        if (update || !existsSync(file)) {
            await fs.mkdir(tema.pasta, { recursive: true })
            await fs.writeFile(file, shot)
            written++
            continue
        }

        const expected = PNG.sync.read(await fs.readFile(file))
        const actual = PNG.sync.read(shot)
        if (expected.width !== actual.width || expected.height !== actual.height) {
            failures.push({ id: rotulo, reason: `tamanho mudou: ${expected.width}x${expected.height} -> ${actual.width}x${actual.height}` })
            continue
        }
        const diff = new PNG({ width: expected.width, height: expected.height })
        const changed = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, { threshold: 0.1 })
        const ratio = changed / (expected.width * expected.height)
        // SNAPSHOTS_DETALHE=1: lista também o que ficou abaixo da tolerância (útil ao revisar uma migração).
        if (process.env.SNAPSHOTS_DETALHE && changed > 0) {
            console.log(`  ${rotulo}: ${changed} px (${(ratio * 100).toFixed(4)}%)`)
            await fs.mkdir(diffDir, { recursive: true })
            await fs.writeFile(path.join(diffDir, `${nomeDiff}.diff.png`), PNG.sync.write(diff))
            await fs.writeFile(path.join(diffDir, `${nomeDiff}.atual.png`), shot)
        }
        if (ratio > MAX_DIFF_RATIO) {
            await fs.mkdir(diffDir, { recursive: true })
            await fs.writeFile(path.join(diffDir, `${nomeDiff}.diff.png`), PNG.sync.write(diff))
            await fs.writeFile(path.join(diffDir, `${nomeDiff}.atual.png`), shot)
            failures.push({ id: rotulo, reason: `${changed} px diferentes (${(ratio * 100).toFixed(3)}%)` })
        }
    }

    await browser.close()
    server.close()

    const nInteracao = ids.filter((id) => interacao.has(id)).length
    console.log(`\n${ids.length - nInteracao} stories capturadas, ${nInteracao} de interação; todas nos temas claro e escuro.`)
    if (written) console.log(`${written} PNG(s) gravados em snapshots/baseline/.`)

    if (renderErrors.length) {
        console.error(`\n${renderErrors.length} story(ies) com erro de runtime:`)
        for (const { id, errors } of renderErrors) console.error(`  ✗ ${id}\n      ${errors.join('\n      ')}`)
    }

    if (playFailures.length) {
        console.error(`\n${playFailures.length} story(ies) com falha na play function:`)
        for (const { id, errors } of playFailures) console.error(`  ✗ ${id}\n      ${errors.join('\n').replace(/\n/g, '\n      ')}`)
    }

    if (legibilidade.length) {
        console.error(`\n${legibilidade.length} story(ies) com texto ilegível ou superfície clara no escuro (scripts/lib/contraste.mjs):`)
        for (const { id, ilegiveis } of legibilidade) {
            console.error(`  ✗ ${id}`)
            for (const p of ilegiveis) console.error(`      ${p.tipo}: ${p.elemento} "${p.texto}" — ${p.detalhe}`)
        }
    }

    if (failures.length) {
        console.error(`\n${failures.length} story(ies) com diferença visual (diffs em snapshots/__diff__/):`)
        for (const { id, reason } of failures) console.error(`  ✗ ${id} — ${reason}`)
    }

    if (renderErrors.length || playFailures.length || legibilidade.length || failures.length) process.exit(1)
    console.log('Nenhuma diferença visual, nenhum erro de runtime, tudo legível nos dois temas e todas as interações passaram.')
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
