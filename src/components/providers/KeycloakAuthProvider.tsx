import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../../context/auth'

import Keycloak from 'keycloak-js'
import { AuthReturn, LoginOptions, LogoutOptions, User } from '../../types/auth'

export const cookieName = 'nextauth.token'
const userImgName = 'user-data.img'
const LOGOUT_PENDING_KEY = 'keycloak-logout-pending'

/** Intervalo para verificar e renovar token (em ms) - 1 minuto */
const TOKEN_REFRESH_INTERVAL = 60 * 1000

/** Tempo mínimo de validade do token antes de renovar (em segundos) */
const MIN_TOKEN_VALIDITY = 30

interface KeycloakAuthProviderProps {
    /** URL do servidor Keycloak */
    url: string
    /** Realm do Keycloak */
    realm: string
    /** Client ID registrado no Keycloak */
    clientId: string
    /** Componentes filhos */
    children: React.ReactNode
    /** Tipo de autenticação */
    type?: 'govbr' | 'ad'
    /** Nome do recurso para extrair roles */
    resource_name?: string
    /** URL de redirecionamento após login */
    redirectUri?: string
    /** Callback executado quando autenticação é bem-sucedida */
    onAuthSuccess?: (user: User) => void
    /** Callback executado quando autenticação falha */
    onAuthError?: (error: Error) => void
    /** Callback executado quando logout é concluído com sucesso (após o redirect de volta) */
    onLogoutSuccess?: () => void
    /** Habilita logs de debug (apenas em desenvolvimento) */
    enableDebugLogs?: boolean
}

/**
 * Provider de autenticação Keycloak
 *
 * Gerencia todo o fluxo de autenticação incluindo:
 * - Inicialização e verificação de SSO
 * - Renovação automática de tokens
 * - Login e logout com callbacks personalizáveis
 * - Verificação de roles
 */
export function KeycloakAuthProvider({
    url,
    realm,
    clientId,
    children,
    type = 'ad',
    resource_name = 'eventos-front',
    redirectUri = '',
    onAuthSuccess,
    onAuthError,
    onLogoutSuccess,
    enableDebugLogs = process.env.NODE_ENV === 'development',
}: KeycloakAuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [userLoaded, setUserLoaded] = useState(false)

    const keycloakRef = useRef<Keycloak | null>(null)
    const isInitializedRef = useRef(false)
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const router = useRouter()

    // Log condicional apenas em ambiente de desenvolvimento
    const log = useCallback(
        (message: string, ...args: unknown[]) => {
            if (enableDebugLogs) {
                console.log(`[KeycloakAuth] ${message}`, ...args)
            }
        },
        [enableDebugLogs]
    )

    const logError = useCallback(
        (message: string, ...args: unknown[]) => {
            if (enableDebugLogs) {
                console.error(`[KeycloakAuth] ${message}`, ...args)
            }
        },
        [enableDebugLogs]
    )

    /**
     * Extrai os dados do usuário do token parseado
     */
    const extractUserData = useCallback(
        (keycloak: Keycloak): User | null => {
            const tokenParsed = keycloak.tokenParsed

            if (!tokenParsed) {
                return null
            }

            // Extrai roles do resource_access de forma segura
            const resourceAccess = tokenParsed.resource_access ?? {}
            const resourceRoles = resourceAccess[resource_name]
            const roles: string[] = Array.isArray(resourceRoles?.roles) ? resourceRoles.roles : []

            return {
                ...tokenParsed,
                token: keycloak.token,
                roles,
            }
        },
        [resource_name]
    )

    /**
     * Atualiza o token de acesso
     */
    const refreshToken = useCallback(async (): Promise<boolean> => {
        const keycloak = keycloakRef.current

        if (!keycloak || !keycloak.authenticated) {
            log('Não é possível renovar token: usuário não autenticado')
            return false
        }

        try {
            const refreshed = await keycloak.updateToken(MIN_TOKEN_VALIDITY)

            if (refreshed) {
                const updatedUser = extractUserData(keycloak)
                if (updatedUser) {
                    setUser(updatedUser)
                    log('Token renovado com sucesso')
                }
            } else {
                log('Token ainda válido, renovação não necessária')
            }

            return true
        } catch (error) {
            logError('Falha ao renovar token', error)

            // Se falhar ao renovar, o token expirou e precisa de novo login
            setUser(null)
            return false
        }
    }, [extractUserData, log, logError])

    /**
     * Configura a renovação automática de tokens
     */
    const setupTokenRefresh = useCallback(() => {
        // Limpa intervalo anterior se existir
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current)
        }

        // Configura novo intervalo
        refreshIntervalRef.current = setInterval(async () => {
            await refreshToken()
        }, TOKEN_REFRESH_INTERVAL)

        log('Renovação automática de token configurada')
    }, [refreshToken, log])

    /**
     * Limpa a renovação automática de tokens
     */
    const clearTokenRefresh = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current)
            refreshIntervalRef.current = null
            log('Renovação automática de token removida')
        }
    }, [log])

    // Inicialização do Keycloak
    useEffect(() => {
        // Previne dupla inicialização (React Strict Mode)
        if (isInitializedRef.current) {
            return
        }
        isInitializedRef.current = true

        const keycloak = new Keycloak({
            url,
            realm,
            clientId,
        })

        keycloakRef.current = keycloak

        // Handler para quando o token expira
        keycloak.onTokenExpired = async () => {
            log('Token expirado, tentando renovar...')
            await refreshToken()
        }

        // Handler para quando o refresh token expira
        keycloak.onAuthRefreshError = () => {
            logError('Erro ao renovar autenticação - refresh token inválido')
            setUser(null)
            clearTokenRefresh()
        }

        // Handler para logout por timeout ou outra aba
        keycloak.onAuthLogout = () => {
            log('Usuário deslogado em outra sessão')
            setUser(null)
            clearTokenRefresh()
        }

        // Inicializa o Keycloak
        keycloak
            .init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                silentCheckSsoRedirectUri:
                    typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : undefined,
                checkLoginIframe: true,
                checkLoginIframeInterval: 30,
            })
            .then((authenticated) => {
                // Verifica se há um logout pendente (usuário voltou após logout com IdP externo)
                const logoutPending = sessionStorage.getItem(LOGOUT_PENDING_KEY)
                if (logoutPending) {
                    sessionStorage.removeItem(LOGOUT_PENDING_KEY)
                    localStorage.removeItem(userImgName)
                    log('Logout pendente detectado, limpando estado e chamando onLogoutSuccess...')
                    setUser(null)
                    setUserLoaded(true)
                    clearTokenRefresh()

                    // Chama o callback de logout success do provider
                    onLogoutSuccess?.()
                    return
                }

                setUserLoaded(true)

                if (!authenticated) {
                    log('Usuário não autenticado')
                    setUser(null)
                    return
                }

                const userData = extractUserData(keycloak)

                if (userData) {
                    setUser(userData)
                    setupTokenRefresh()
                    log('Autenticação bem-sucedida', { user: userData.preferred_username })
                    onAuthSuccess?.(userData)
                }
            })
            .catch((error) => {
                logError('Falha na inicialização do Keycloak', error)
                setUserLoaded(true)
                setUser(null)

                const authError = error instanceof Error ? error : new Error('Falha na autenticação')
                onAuthError?.(authError)
            })

        // Tratamento do query param 'status' do redirect
        const status = router.query['status']
        if (status === 'success') {
            window.history.replaceState(null, '', router.pathname)
        }

        // Cleanup
        return () => {
            clearTokenRefresh()
        }
    }, [
        url,
        realm,
        clientId,
        resource_name,
        router.query,
        router.pathname,
        extractUserData,
        setupTokenRefresh,
        clearTokenRefresh,
        refreshToken,
        log,
        logError,
        onAuthSuccess,
        onAuthError,
        onLogoutSuccess,
    ])

    /**
     * Inicia o fluxo de login
     */
    const login = useCallback(
        (options?: LoginOptions) => {
            const keycloak = keycloakRef.current

            if (!keycloak) {
                const error = new Error('Keycloak não inicializado')
                logError('Tentativa de login com Keycloak não inicializado')
                options?.onError?.(error)
                return
            }

            log('Iniciando fluxo de login...', {
                authenticated: keycloak.authenticated,
                clientId: keycloak.clientId,
            })

            // Mescla as opções passadas com as configurações padrão
            const loginOptions: LoginOptions = {
                redirectUri: options?.redirectUri || redirectUri || window.location.href,
                idpHint: options?.idpHint,
                loginHint: options?.loginHint,
                prompt: options?.prompt,
                action: options?.action,
                locale: options?.locale,
                acr: options?.acr,
                scope: options?.scope,
                maxAge: options?.maxAge,
            }

            keycloak
                .login(loginOptions)
                .then(() => {
                    options?.onSuccess?.()
                })
                .catch((error) => {
                    const loginError = error instanceof Error ? error : new Error('Falha no login')
                    logError('Erro no login', loginError)
                    options?.onError?.(loginError)
                })
        },
        [redirectUri, log, logError]
    )

    /**
     * Inicia o fluxo de logout
     * 
     * IMPORTANTE: Com IdP externos (como Gov.BR), o logout é um processo multi-hop:
     * App → Keycloak → IdP → Keycloak → App
     * 
     * O `keycloak.logout()` redireciona o navegador, então o código após ele
     * NÃO é executado. Por isso marcamos o logout como pendente e limpamos
     * o estado quando o usuário volta à aplicação.
     */
    const logout = useCallback(
        async (options?: LogoutOptions) => {
            const keycloak = keycloakRef.current

            if (!keycloak) {
                logError('Tentativa de logout com Keycloak não inicializado')
                return
            }

            log('Iniciando fluxo de logout...')

            // Executa callback antes do logout (pode ser async)
            // Isso é executado ANTES do redirect para o Keycloak
            if (options?.onBeforeLogout) {
                try {
                    await options.onBeforeLogout()
                } catch (error) {
                    logError('Erro no callback onBeforeLogout', error)
                }
            }

            // Marca o logout como pendente no sessionStorage
            // Isso é necessário porque o keycloak.logout() redireciona o navegador
            // e quando o usuário volta, precisamos saber que ele acabou de fazer logout
            sessionStorage.setItem(LOGOUT_PENDING_KEY, 'true')

            // Limpa o refresh token interval antes do redirect
            clearTokenRefresh()

            // Define a URL de redirecionamento após logout
            const logoutRedirectUri = options?.redirectUri || window.location.origin

            log('Redirecionando para logout...', { redirectUri: logoutRedirectUri })

            // Executa o logout no Keycloak
            // NOTA: Esta função redireciona o navegador, então o código abaixo NÃO será executado
            try {
                await keycloak.logout({
                    redirectUri: logoutRedirectUri,
                    logoutMethod: options?.logoutMethod,
                })

                // Este código NÃO é executado porque o navegador é redirecionado
                // O callback onSuccess deve ser chamado quando o usuário volta à aplicação
                // (isso é tratado na inicialização detectando o logout pendente)
            } catch (error) {
                // Em caso de erro, remove o flag de logout pendente
                sessionStorage.removeItem(LOGOUT_PENDING_KEY)
                logError('Erro no logout', error)
            }
        },
        [log, logError, clearTokenRefresh]
    )

    /**
     * Salva dados do usuário vindos de uma fonte externa (ex: token SSP)
     */
    const saveUserData = useCallback(
        (authReturn: AuthReturn) => {
            const externalUser: User = {
                token: authReturn.access_token,
                roles: authReturn.claims.roles.map((r) => r.name),
                sub: authReturn.claims.sub,
                exp: authReturn.claims.exp,
                iat: authReturn.claims.iat,
                email_verified: authReturn.claims.email_verified === 'true',
                preferred_username: authReturn.claims.preferred_username,
                email: authReturn.claims.email,
                name: authReturn.claims.name,
                given_name: authReturn.claims.given_name,
            }

            setUser(externalUser)
            log('Dados de usuário externo salvos', { username: externalUser.preferred_username })
        },
        [log]
    )

    /**
     * Verifica se o usuário possui uma role específica
     */
    const hasRole = useCallback(
        (role: string): boolean => {
            return user?.roles?.includes(role) ?? false
        },
        [user?.roles]
    )

    /**
     * Verifica se o usuário possui todas as roles especificadas
     */
    const hasAllRoles = useCallback(
        (roles: string[]): boolean => {
            if (!user?.roles || roles.length === 0) return false
            return roles.every((role) => user.roles.includes(role))
        },
        [user?.roles]
    )

    /**
     * Verifica se o usuário possui pelo menos uma das roles especificadas
     */
    const hasAnyRole = useCallback(
        (roles: string[]): boolean => {
            if (!user?.roles || roles.length === 0) return false
            return roles.some((role) => user.roles.includes(role))
        },
        [user?.roles]
    )

    // Valor memoizado do contexto para evitar re-renders desnecessários
    const contextValue = useMemo(
        () => ({
            user,
            isAuth: !!user,
            userLoaded,
            login,
            logout,
            saveUserData,
            type,
            refreshToken,
            hasRole,
            hasAllRoles,
            hasAnyRole,
            accessToken: user?.token,
        }),
        [user, userLoaded, login, logout, saveUserData, type, refreshToken, hasRole, hasAllRoles, hasAnyRole]
    )

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
