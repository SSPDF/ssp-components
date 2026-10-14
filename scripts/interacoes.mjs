/**
 * Roda as stories de interação (tag `interacao`) contra um Storybook já aberto e falha se
 * alguma `play` function não passar. É o atalho local: no CI as mesmas `play` rodam dentro
 * de `npm run snapshots`, no container, junto com a comparação visual.
 *
 * Uso: npm run storybook   (em outro terminal)
 *      npm run interacoes [-- --url http://localhost:6006] [-- --filtro autocomplete]
 *
 * Usa o Chromium do Playwright; se ele não estiver baixado (`npx playwright install chromium`),
 * cai para o Chrome instalado na máquina.
 */
import { chromium } from 'playwright'
import { instalarEscuta, esperarStory, resumirErro } from './lib/storybook-play.mjs'

const arg = (nome, padrao) => {
    const i = process.argv.indexOf(`--${nome}`)
    return i >= 0 ? process.argv[i + 1] : padrao
}
const base = arg('url', 'http://localhost:6006').replace(/\/$/, '')
const filtro = arg('filtro', '')

async function abrirBrowser() {
    try {
        return await chromium.launch()
    } catch {
        return chromium.launch({ channel: 'chrome' })
    }
}

async function main() {
    const res = await fetch(`${base}/index.json`).catch(() => null)
    if (!res?.ok) {
        console.error(`Storybook não respondeu em ${base}. Rode \`npm run storybook\` antes.`)
        process.exit(1)
    }
    const index = await res.json()
    const ids = Object.values(index.entries)
        .filter((e) => e.type === 'story' && e.tags?.includes('interacao') && e.id.includes(filtro))
        .map((e) => e.id)
        .sort()

    const browser = await abrirBrowser()
    const falhas = []
    for (const id of ids) {
        const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' })
        const page = await context.newPage()
        const errosPagina = []
        page.on('pageerror', (e) => errosPagina.push(resumirErro(e)))
        await instalarEscuta(page)
        await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`)
        const { status, erros } = await esperarStory(page)
        const todos = [...erros, ...errosPagina]
        if (status !== 'success' || todos.length) falhas.push({ id, erros: todos.length ? todos : [`status ${status}`] })
        console.log(`${status === 'success' && !todos.length ? '✓' : '✗'} ${id}`)
        await context.close()
    }
    await browser.close()

    console.log(`\n${ids.length} stories de interação, ${falhas.length} com falha.`)
    for (const { id, erros } of falhas) console.error(`\n✗ ${id}\n    ${[...new Set(erros)].join('\n    ').replace(/\n/g, '\n    ')}`)
    if (falhas.length || !ids.length) process.exit(1)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
