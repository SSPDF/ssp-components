/**
 * Helper mínimo de cookies no browser — substitui o `cookies-next` (UPGRADE_PLAN.md 5.3).
 *
 * Reproduz o comportamento client-side do `cookies-next@4`, que era o único usado
 * pela lib: grava com `Path=/` e valor passado por `encodeURIComponent`, lê
 * decodificando e apaga com `Max-Age=-1`. O `cookies-next@5+` exige `next >= 15`,
 * e por isso a dependência saiu.
 *
 * Só funciona no browser: no servidor `getCookie` devolve `undefined` e as
 * escritas são ignoradas, como no `cookies-next` sem `req`/`res`.
 */

const isClient = () => typeof document !== 'undefined'

export function getCookie(name: string): string | undefined {
    if (!isClient() || !document.cookie) return undefined
    for (const parte of document.cookie.split('; ')) {
        const [chave, ...resto] = parte.split('=')
        if (chave === name) return resto.join('=').replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent)
    }
    return undefined
}

export function setCookie(name: string, value: string) {
    if (!isClient()) return
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/`
}

export function deleteCookie(name: string) {
    if (!isClient()) return
    document.cookie = `${name}=; Max-Age=-1; Path=/`
}
