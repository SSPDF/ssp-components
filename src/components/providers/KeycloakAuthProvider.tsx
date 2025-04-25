import Keycloak, { KeycloakTokenParsed } from 'keycloak-js'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { AuthContext } from '../../context/auth'
import { User } from '../../types/auth'

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
        const keycloak = new Keycloak({
            url: url,
            realm: realm,
            clientId: clientId,
        })

        setKc(keycloak)

        keycloak
            .init({
                onLoad: 'check-sso', // check-sso | login-required
                pkceMethod: 'S256',
            })
            .then(
                (auth) => {
                    setUserLoaded(true)

                    if (!auth) {
                        console.log('NAO AUTENTICADO')
                        //window.location.reload();
                    } else {
                        const tokenParsed = keycloak.tokenParsed

                        console.log('TOKEN-> ', tokenParsed)

                        updateUserData(keycloak.token!)

                        console.info('Authenticated!!!')

                        keycloak.onTokenExpired = () => {
                            console.log('token expired')
                            refreshTokens()
                        }
                    }
                },
                () => {
                    console.error('Authenticated Failed')
                }
            )
            .catch((err) => console.log(err))

        const s = router.query['status']
        if (!s) return

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

    return <AuthContext.Provider value={{ user, isAuth, userLoaded, login, logout, saveUserData: () => {}, type, refreshTokens }}>{children}</AuthContext.Provider>
}
