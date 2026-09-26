import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

beforeEach(() => {
    // Testes de SSR rodam em `@vitest-environment node`, sem `localStorage`/`document`
    if (typeof document === 'undefined') return

    localStorage.clear()
    // jsdom não zera document.cookie entre testes
    for (const c of document.cookie.split(';')) {
        const nome = c.split('=')[0].trim()
        if (nome) document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
})

afterEach(() => {
    cleanup()
})
