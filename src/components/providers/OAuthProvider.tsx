import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import jwt_decode from 'jwt-decode'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../context/auth'
import { AuthClaims, AuthReturn, AuthSspToken, LoginOptions, LogoutOptions, User } from '../../types/auth'

interface OiDcConfig {
    client_id: string
    scope: string
    redirect_uri: string
    authority: string
}

export const cookieName = 'nextauth.token'
const userImgName = 'user-data.img'

export function OAuthProvider({
    children,
    AUTH_URL,
    oidcConfig,
    redirectURL,
    validateTokenRoute,
    testToken,
    testIP,
    logoutURL = redirectURL,
}: {
    children: React.ReactNode
    AUTH_URL: string
    oidcConfig: OiDcConfig
    redirectURL: string
    validateTokenRoute: string
    testToken: string
    testIP?: string
    logoutURL?: string
}) {
    const govBrURL =
        oidcConfig.authority +
        '/authorize?response_type=code&client_id=' +
        oidcConfig.client_id +
        '&scope=' +
        oidcConfig.scope +
        '&redirect_uri=' +
        oidcConfig.redirect_uri

    const [user, setUser] = useState<User | null>(null)
    const [userLoaded, setUserLoaded] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const token = getCookie(cookieName) as string

        if (!token) {
            setUserLoaded(true)
            return
        }

        fetch(`${AUTH_URL}${validateTokenRoute}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            if (!res.ok) {
                logout()
                return
            } else {
                const userData: AuthClaims = jwt_decode(token)
                const img = localStorage.getItem(userImgName) as string

                setUser({
                    name: userData.given_name,
                    image: img ?? '',
                    roles: userData.roles.map((x) => String(x.code)),
                    token,
                    preferred_username: userData.preferred_username,
                    email: userData.email,
                    email_verified: userData.email_verified === 'true',
                    sub: userData.sub,
                })
                setUserLoaded(true)
            }
        })
    }, [])

    const login = useCallback(
        (options?: LoginOptions) => {
            // Teste em localhost
            if (location && (location.hostname === 'localhost' || location.hostname === testIP)) {
                const token = testToken
                setCookie(cookieName, token)
                setUser({
                    name: 'Teste',
                    image: '',
                    roles: ['1'],
                    token: token,
                })
                router
                    .replace(options?.redirectUri?.toString() || redirectURL)
                    .then(() => {
                        setUserLoaded(true)
                        options?.onSuccess?.()
                    })
                    .catch((error) => {
                        options?.onError?.(error instanceof Error ? error : new Error('Erro no redirecionamento'))
                    })
            } else {
                setUserLoaded(false)
                router.replace(govBrURL)
            }
        },
        [testIP, testToken, redirectURL, govBrURL, router]
    )

    // chamado no callback de login
    const saveUserData = useCallback(
        async (authData: AuthReturn) => {
            const token = authData.ssp_token

            setCookie(cookieName, token)
            const userData: AuthSspToken = jwt_decode(token)

            const idToken: AuthClaims = jwt_decode(authData.id_token)

            // pegando foto de usuario
            await fetch(idToken.picture, {
                headers: {
                    Authorization: `Bearer ${authData.access_token}`,
                },
            }).then((res) => {
                if (res.status === 200) {
                    res.blob().then((b) => {
                        const reader = new FileReader()
                        reader.readAsDataURL(b)
                        reader.onload = () => {
                            const base64 = reader.result

                            localStorage.setItem(userImgName, base64 as string)
                            setUser({
                                name: userData.name,
                                image: base64 as string,
                                roles: userData.roles.map((x) => String(x.code)),
                                token,
                                preferred_username: userData.preferred_username,
                                email: userData.email,
                                sub: userData.sub,
                            })
                            router.replace(redirectURL).finally(() => setUserLoaded(true))
                        }
                    })
                }

                setUser({
                    name: userData.name,
                    image: '',
                    roles: userData.roles.map((x) => String(x.code)),
                    token,
                    preferred_username: userData.preferred_username,
                    email: userData.email,
                    sub: userData.sub,
                })
                router.replace(redirectURL).finally(() => setUserLoaded(true))
                return
            })

            router.replace(redirectURL).finally(() => setUserLoaded(true))
        },
        [redirectURL, router]
    )

    const logout = useCallback(
        async (options?: LogoutOptions) => {
            // Executa callback antes do logout (pode ser async)
            if (options?.onBeforeLogout) {
                try {
                    await options.onBeforeLogout()
                } catch (error) {
                    console.error('[OAuthProvider] Erro no callback onBeforeLogout', error)
                }
            }

            setUserLoaded(false)

            router
                .replace(options?.redirectUri || logoutURL)
                .then(() => {
                    options?.onSuccess?.()
                })
                .finally(() => {
                    setUser(null)
                    deleteCookie(cookieName)
                    localStorage.removeItem(userImgName)

                    setUserLoaded(true)
                })
        },
        [logoutURL, router]
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

    /**
     * Refresh token não é suportado diretamente no OAuth provider
     * Retorna false indicando que o refresh não foi possível
     */
    const refreshToken = useCallback(async (): Promise<boolean> => {
        console.warn('[OAuthProvider] refreshToken não é suportado neste provider')
        return false
    }, [])

    const contextValue = useMemo(
        () => ({
            user,
            isAuth: !!user,
            userLoaded,
            login,
            logout,
            saveUserData,
            type: 'govbr' as const,
            refreshToken,
            hasRole,
            hasAllRoles,
            hasAnyRole,
            accessToken: user?.token,
        }),
        [user, userLoaded, login, logout, saveUserData, refreshToken, hasRole, hasAllRoles, hasAnyRole]
    )

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
