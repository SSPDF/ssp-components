/**
 * Espera uma story terminar de renderizar, incluindo a `play` function, e devolve o resultado.
 *
 * As `play` functions rodam sozinhas quando a story abre no iframe. O Storybook 10 marca o fim
 * do ciclo com a fase `finished` (`__STORYBOOK_PREVIEW__.currentRender.phase`) e emite
 * `playFunctionThrewException` quando uma verificação falha. O listener entra por `addInitScript`,
 * antes do código do Storybook, para não perder o evento de uma `play` rápida.
 *
 * Uso: `await instalarEscuta(page)` antes do `goto`, e `await esperarStory(page)` depois.
 */

const FASES_FINAIS = ['finished', 'aborted']
const CORES_ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')

export async function instalarEscuta(page) {
    await page.addInitScript(() => {
        window.__resultadoStory = { erros: [] }
        const ligar = () => {
            const canal = window.__STORYBOOK_ADDONS_CHANNEL__
            if (!canal) return setTimeout(ligar, 5)
            canal.on('playFunctionThrewException', (e) => window.__resultadoStory.erros.push(e?.message ?? String(e)))
            canal.on('storyThrewException', (e) => window.__resultadoStory.erros.push(e?.message ?? String(e)))
            canal.on('storyErrored', (e) => window.__resultadoStory.erros.push(e?.description ?? e?.title ?? String(e)))
            canal.on('storyFinished', (e) => (window.__resultadoStory.status = e?.status))
        }
        ligar()
    })
}

/**
 * Mensagem de erro sem o que só atrapalha no terminal: as cores ANSI e o dump do DOM que o
 * Testing Library anexa quando não acha um elemento (centenas de linhas por falha).
 */
export function resumirErro(mensagem) {
    const limpa = String(mensagem).replace(CORES_ANSI, '')
    const semDom = limpa.split(/\n\s*(Ignored nodes:|<\w)/)[0]
    return semDom
        .split('\n')
        .map((l) => l.trimEnd())
        .filter(Boolean)
        .slice(0, 8)
        .join('\n')
}

/** Devolve `{ status, erros }`. `status` é `success`, `error` ou `timeout`. */
export async function esperarStory(page, timeout = 30_000) {
    try {
        await page.waitForFunction((finais) => finais.includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), FASES_FINAIS, { timeout, polling: 50 })
    } catch {
        const erros = await page.evaluate(() => window.__resultadoStory?.erros ?? []).catch(() => [])
        return { status: 'timeout', erros: [`a story não terminou em ${timeout / 1000}s`, ...erros.map(resumirErro)] }
    }
    const r = await page.evaluate(() => ({ status: window.__resultadoStory?.status ?? 'error', erros: window.__resultadoStory?.erros ?? [] }))
    return { status: r.status, erros: [...new Set(r.erros.map(resumirErro))] }
}
