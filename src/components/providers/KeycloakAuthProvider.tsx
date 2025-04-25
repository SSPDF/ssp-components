import Keycloak, { KeycloakTokenParsed } from 'keycloak-js'
import { useRouter } from 'next/router'
import React, { createContext, useEffect, useState } from 'react'
import { User } from '../../types/auth'

interface AuthContextData {
    user: User | null | undefined
    isAuth: boolean
    userLoaded: boolean
    login: () => void
    logout: () => void
    saveUserData: () => void
    refreshTokens: () => Promise<boolean>
    type: 'govbr' | 'ad'
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const cookieName = 'nextauth.token'
const userImgName = 'user-data.img'

export function KeycloakAuthProvider({
    url,
    realm,
    clientId,
    children,
    type = 'ad',
    resource_name = 'eventos-front',
    redirectUri = '',
}: {
    url: string
    realm: string
    clientId: string
    children: JSX.Element | JSX.Element[]
    type?: 'govbr' | 'ad'
    resource_name?: string
    redirectUri?: string
}) {
    const [user, setUser] = useState<User | null | undefined>()
    const [userLoaded, setUserLoaded] = useState(false)
    const [kc, setKc] = useState<Keycloak | null>(null)

    const router = useRouter()
    const isAuth = !!user

    const updateUserData = (token: string) => {
        if (!kc) return
        const tokenParsed = kc.tokenParsed as KeycloakTokenParsed
        const roles = ((tokenParsed?.resource_access ?? {})[resource_name] as any)?.roles || []

        setUser({
            ...tokenParsed,
            token,
            roles,
        })
    }

    const refreshTokens = async (): Promise<boolean> => {
        if (!kc) return false
        try {
            const refreshed = await kc.updateToken(5)
            if (refreshed) {
                updateUserData(kc.token!)
            }
            return refreshed
        } catch (err) {
            console.error('Falha ao atualizar token:', err)
            logout()
            return false
        }
    }

    useEffect(() => {
        const keycloak = new Keycloak({ url, realm, clientId })
        setKc(keycloak)

        keycloak
            .init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
            })
            .then((auth) => {
                setUserLoaded(true)

                if (!auth) {
                    console.log('NAO AUTENTICADO')
                } else {
                    updateUserData(keycloak.token!)

                    console.info('Authenticated!!!')

                    keycloak.onTokenExpired = () => {
                        console.log('token expired, tentando refresh')
                        refreshTokens()
                    }
                }
            })
            .catch((err) => {
                console.error('Authenticated Failed', err)
            })

        const s = router.query['status']
        if (s === 'success') {
            window.history.replaceState(null, '', '/')
        }
    }, [])

    function login() {
        console.log('Tentando logar...')
        console.log('KC: ', {
            instancia: kc,
            logado: kc?.authenticated,
            client_id: kc?.clientId,
        })

        kc?.login({ redirectUri })
    }

    function logout() {
        setUserLoaded(false)

        kc?.logout()

        setUser(null)
        localStorage.removeItem(userImgName)
    }

    return <AuthContext.Provider value={{ user, isAuth, userLoaded, login, logout, saveUserData: () => {}, refreshTokens, type }}>{children}</AuthContext.Provider>
}
