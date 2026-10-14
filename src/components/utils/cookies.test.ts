import { describe, expect, it, vi } from 'vitest'
import { deleteCookie, getCookie, setCookie } from './cookies'

/**
 * O helper substitui o `cookies-next@4` (UPGRADE_PLAN.md 5.3). As strings esperadas
 * abaixo foram capturadas do próprio `cookies-next@4.3.0` antes da remoção — o
 * cookie `nextauth.token` gravado pelas versões antigas da lib precisa continuar
 * sendo lido, e vice-versa.
 */

const casos: [valor: string, escrito: string][] = [
    ['eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.', 'nextauth.token=eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.; Path=/'],
    ['com espaço', 'nextauth.token=com%20espa%C3%A7o; Path=/'],
    ['a=b;c', 'nextauth.token=a%3Db%3Bc; Path=/'],
    ['acentuação', 'nextauth.token=acentua%C3%A7%C3%A3o; Path=/'],
    ['true', 'nextauth.token=true; Path=/'],
    ['', 'nextauth.token=; Path=/'],
]

/** Captura a string atribuída a `document.cookie` (com os atributos, que a leitura esconde). */
function capturarEscrita(fn: () => void): string {
    const original = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!
    let escrito = ''
    const spy = vi.spyOn(document, 'cookie', 'set').mockImplementation((v: string) => {
        escrito = v
        original.set!.call(document, v)
    })
    fn()
    spy.mockRestore()
    return escrito
}

describe('cookies', () => {
    it.each(casos)('grava como o cookies-next: %j', (valor, esperado) => {
        expect(capturarEscrita(() => setCookie('nextauth.token', valor))).toBe(esperado)
    })

    it.each(casos)('lê de volta o que foi gravado: %j', (valor, escrito) => {
        document.cookie = escrito
        expect(getCookie('nextauth.token')).toBe(valor)
    })

    it('apaga como o cookies-next', () => {
        setCookie('nextauth.token', 'x')
        setCookie('outro', 'y')
        expect(capturarEscrita(() => deleteCookie('nextauth.token'))).toBe('nextauth.token=; Max-Age=-1; Path=/')
        expect(getCookie('nextauth.token')).toBeUndefined()
        expect(getCookie('outro')).toBe('y')
    })

    it('devolve undefined para cookie inexistente', () => {
        expect(getCookie('nao-existe')).toBeUndefined()
    })
})
