import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../context/auth'
import { KeycloakAuthProvider } from './KeycloakAuthProvider'

/**
 * Testes do KeycloakAuthProvider (AD).
 *
 * O componente conversa com o Keycloak só através da classe do `keycloak-js`,
 * então o módulo inteiro é mockado — isso cobre init/check-sso, extração de roles
 * do `resource_access`, refresh automático, `onAuthLogout` e o logout pendente,
 * sem depender do Keycloak de homologação.
 *
 * O e2e contra o HMG continua previsto para a Etapa 6 (`keycloak-js` 25 → 26),
 * que é o único ponto em que o protocolo real importa.
 */

const replace = vi.fn(() => Promise.resolve(true))
vi.mock('next/router', () => ({
    useRouter: () => ({ replace, push: vi.fn(() => Promise.resolve(true)), query: {}, pathname: '/' }),
}))

/** Instância falsa devolvida por `new Keycloak(...)`, controlável por teste. */
const kc = {
    authenticated: false,
    token: 'token-de-acesso',
    tokenParsed: undefined as Record<string, unknown> | undefined,
    init: vi.fn(),
    login: vi.fn(() => Promise.resolve()),
    logout: vi.fn(() => Promise.resolve()),
    updateToken: vi.fn(() => Promise.resolve(true)),
    clearToken: vi.fn(),
    onTokenExpired: undefined as (() => void) | undefined,
    onAuthRefreshError: undefined as (() => void) | undefined,
    onAuthLogout: undefined as (() => void) | undefined,
}

vi.mock('keycloak-js', () => ({
    default: vi.fn(() => kc),
}))

const TOKEN_PARSED = {
    preferred_username: 'joao.lima',
    name: 'João Lima',
    email: 'joao.lima@ssp.df.gov.br',
    sub: 'a1b2c3d4-0000-4000-8000-000000000002',
    resource_access: {
        'eventos-front': { roles: ['admin', 'leitura'] },
        'outro-client': { roles: ['nao-deve-aparecer'] },
    },
}

function Sonda() {
    const { user, userLoaded, hasRole, hasAnyRole, hasAllRoles, login, logout } = useContext(AuthContext)
    return (
        <div>
            <span data-testid='userLoaded'>{String(userLoaded)}</span>
            <span data-testid='nome'>{user?.name ?? ''}</span>
            <span data-testid='roles'>{(user?.roles ?? []).join(',')}</span>
            <span data-testid='hasAdmin'>{String(hasRole?.('admin'))}</span>
            <span data-testid='hasAny'>{String(hasAnyRole?.(['x', 'leitura']))}</span>
            <span data-testid='hasAll'>{String(hasAllRoles?.(['admin', 'leitura']))}</span>
            <button onClick={() => login?.()}>entrar</button>
            <button onClick={() => logout?.()}>sair</button>
        </div>
    )
}

function montar(props: Partial<React.ComponentProps<typeof KeycloakAuthProvider>> = {}) {
    return render(
        <KeycloakAuthProvider url='https://kc.invalid' realm='ssp' clientId='eventos-front' {...props}>
            <Sonda />
        </KeycloakAuthProvider>,
    )
}

describe('KeycloakAuthProvider', () => {
    beforeEach(() => {
        replace.mockClear()
        kc.authenticated = false
        kc.tokenParsed = undefined
        kc.init.mockReset()
        kc.login.mockClear()
        kc.logout.mockClear()
        kc.updateToken.mockReset().mockResolvedValue(true)
        kc.clearToken.mockClear()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('sem sessão SSO, termina o carregamento sem usuário', async () => {
        kc.init.mockResolvedValue(false)
        montar()

        await waitFor(() => expect(screen.getByTestId('userLoaded')).toHaveTextContent('true'))
        expect(screen.getByTestId('nome')).toHaveTextContent('')
    })

    it('com sessão SSO, extrai o usuário e só as roles do resource_name', async () => {
        kc.authenticated = true
        kc.tokenParsed = TOKEN_PARSED
        kc.init.mockResolvedValue(true)

        const onAuthSuccess = vi.fn()
        montar({ onAuthSuccess })

        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('João Lima'))
        // roles do 'outro-client' não podem vazar
        expect(screen.getByTestId('roles')).toHaveTextContent('admin,leitura')
        expect(screen.getByTestId('hasAdmin')).toHaveTextContent('true')
        expect(screen.getByTestId('hasAny')).toHaveTextContent('true')
        expect(screen.getByTestId('hasAll')).toHaveTextContent('true')
        expect(onAuthSuccess).toHaveBeenCalledOnce()
    })

    it('usa o resource_name informado para escolher as roles', async () => {
        kc.authenticated = true
        kc.tokenParsed = TOKEN_PARSED
        kc.init.mockResolvedValue(true)

        montar({ resource_name: 'outro-client' })

        await waitFor(() => expect(screen.getByTestId('roles')).toHaveTextContent('nao-deve-aparecer'))
    })

    it('falha na inicialização chama onAuthError e libera o carregamento', async () => {
        kc.init.mockRejectedValue(new Error('keycloak fora do ar'))
        const onAuthError = vi.fn()

        montar({ onAuthError })

        await waitFor(() => expect(onAuthError).toHaveBeenCalled())
        expect(screen.getByTestId('userLoaded')).toHaveTextContent('true')
        expect(screen.getByTestId('nome')).toHaveTextContent('')
    })

    it('logout pendente no localStorage limpa o estado e chama onLogoutSuccess', async () => {
        localStorage.setItem('keycloak-logout-pending', '1')
        localStorage.setItem('user-data.img', 'data:image/png;base64,abc')
        kc.authenticated = true
        kc.tokenParsed = TOKEN_PARSED
        kc.init.mockResolvedValue(true)

        const onLogoutSuccess = vi.fn()
        montar({ onLogoutSuccess })

        await waitFor(() => expect(onLogoutSuccess).toHaveBeenCalledOnce())
        expect(screen.getByTestId('nome')).toHaveTextContent('')
        expect(localStorage.getItem('keycloak-logout-pending')).toBeNull()
        expect(localStorage.getItem('user-data.img')).toBeNull()
        // ainda autenticado depois do logout -> força limpeza local
        expect(kc.clearToken).toHaveBeenCalled()
    })

    it('onAuthLogout (logout em outra aba) zera o usuário', async () => {
        kc.authenticated = true
        kc.tokenParsed = TOKEN_PARSED
        kc.init.mockResolvedValue(true)

        montar()
        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('João Lima'))

        await act(async () => {
            kc.onAuthLogout?.()
        })

        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent(''))
    })

    it('onTokenExpired dispara a renovação do token', async () => {
        kc.authenticated = true
        kc.tokenParsed = TOKEN_PARSED
        kc.init.mockResolvedValue(true)

        montar()
        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('João Lima'))

        await act(async () => {
            await kc.onTokenExpired?.()
        })

        await waitFor(() => expect(kc.updateToken).toHaveBeenCalled())
    })

    it('login e logout delegam para o keycloak-js', async () => {
        kc.authenticated = true
        kc.tokenParsed = TOKEN_PARSED
        kc.init.mockResolvedValue(true)

        montar()
        await waitFor(() => expect(screen.getByTestId('nome')).toHaveTextContent('João Lima'))

        await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
        await waitFor(() => expect(kc.login).toHaveBeenCalled())

        await userEvent.click(screen.getByRole('button', { name: 'sair' }))
        await waitFor(() => expect(kc.logout).toHaveBeenCalled())
        // o logout precisa ficar marcado, porque o redirect corta a execução
        expect(localStorage.getItem('keycloak-logout-pending')).toBe('true')
    })
})
