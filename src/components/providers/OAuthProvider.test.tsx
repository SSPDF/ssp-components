import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../context/auth'
import { claimsGovBr, fakeJwt } from '../../test/jwt'
import { cookieName, OAuthProvider } from './OAuthProvider'

/**
 * Testes do OAuthProvider (gov.br).
 *
 * Usam o **bypass de localhost** que já existe no componente (`testIP`/`testToken`):
 * em `localhost` o `login()` pula o fluxo OIDC real e entra direto com o token de
 * teste. Isso deixa cobrir login, roles, cookie, avatar e logout sem rede e sem
 * depender do Keycloak de homologação.
 */

const replace = vi.fn(() => Promise.resolve(true))
vi.mock('next/router', () => ({
    useRouter: () => ({ replace, push: vi.fn(() => Promise.resolve(true)) }),
}))

const TOKEN_TESTE = fakeJwt(claimsGovBr())

function Sonda() {
    const { user, isAuth, userLoaded, login, logout, hasRole, hasAnyRole, hasAllRoles } = useContext(AuthContext)
    return (
        <div>
            <span data-testid='userLoaded'>{String(userLoaded)}</span>
            <span data-testid='isAuth'>{String(isAuth)}</span>
            <span data-testid='nome'>{user?.name ?? ''}</span>
            <span data-testid='roles'>{(user?.roles ?? []).join(',')}</span>
            <span data-testid='hasRole1'>{String(hasRole?.('1'))}</span>
            <span data-testid='hasAny'>{String(hasAnyRole?.(['99', '42']))}</span>
            <span data-testid='hasAll'>{String(hasAllRoles?.(['1', '42']))}</span>
            <button onClick={() => login?.()}>entrar</button>
            <button onClick={() => logout?.()}>sair</button>
        </div>
    )
}

function montar() {
    return render(
        <OAuthProvider
            AUTH_URL='https://api.invalid'
            validateTokenRoute='/validar'
            redirectURL='/inicio'
            testToken={TOKEN_TESTE}
            oidcConfig={{ client_id: 'cli', scope: 'openid', redirect_uri: 'https://app.invalid/cb', authority: 'https://sso.invalid' }}
        >
            <Sonda />
        </OAuthProvider>,
    )
}

describe('OAuthProvider', () => {
    beforeEach(() => {
        replace.mockClear()
        vi.unstubAllGlobals()
    })

    it('sem cookie, termina o carregamento sem usuário', async () => {
        montar()
        await waitFor(() => expect(screen.getByTestId('userLoaded')).toHaveTextContent('true'))
        expect(screen.getByTestId('nome')).toHaveTextContent('')
    })

    it('login em localhost usa o bypass de teste e grava o cookie', async () => {
        montar()
        await waitFor(() => expect(screen.getByTestId('userLoaded')).toHaveTextContent('true'))

        await userEvent.click(screen.getByRole('button', { name: 'entrar' }))

        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('Teste'))
        expect(document.cookie).toContain(cookieName)
        expect(replace).toHaveBeenCalledWith('/inicio')
    })

    it('hasRole/hasAnyRole/hasAllRoles respondem pelas roles do usuário', async () => {
        montar()
        await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('Teste'))

        // o bypass entra com roles: ['1']
        expect(screen.getByTestId('hasRole1')).toHaveTextContent('true')
        expect(screen.getByTestId('hasAny')).toHaveTextContent('false')
        expect(screen.getByTestId('hasAll')).toHaveTextContent('false')
    })

    it('com cookie válido, monta o usuário a partir das claims do token', async () => {
        document.cookie = `${cookieName}=${TOKEN_TESTE}; path=/`
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve(new Response('{}', { status: 200 }))),
        )

        montar()

        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('Maria Souza'))
        expect(screen.getByTestId('roles')).toHaveTextContent('1,42')
        expect(screen.getByTestId('hasAll')).toHaveTextContent('true')
        expect(screen.getByTestId('userLoaded')).toHaveTextContent('true')
    })

    it('com cookie recusado pela API, faz logout e limpa o cookie', async () => {
        document.cookie = `${cookieName}=${TOKEN_TESTE}; path=/`
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve(new Response('nao autorizado', { status: 401 }))),
        )

        montar()

        await waitFor(() => expect(document.cookie).not.toContain(cookieName))
        expect(screen.getByTestId('nome')).toHaveTextContent('')
    })

    it('logout limpa usuário, cookie e o avatar do localStorage', async () => {
        localStorage.setItem('user-data.img', 'data:image/png;base64,abc')
        montar()
        await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('Teste'))

        await userEvent.click(screen.getByRole('button', { name: 'sair' }))

        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent(''))
        expect(document.cookie).not.toContain(cookieName)
        expect(localStorage.getItem('user-data.img')).toBeNull()
    })
})
