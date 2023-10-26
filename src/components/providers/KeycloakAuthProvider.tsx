import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import jwt_decode from 'jwt-decode'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { AuthContext } from '../../context/auth'

import Keycloak, { KeycloakTokenParsed } from 'keycloak-js'
import { User } from '../../types/auth'

export const cookieName = 'nextauth.token'
const userImgName = 'user-data.img'

export function KeycloakAuthProvider({ url, realm, clientId, children }: { url: string; realm: string; clientId: string; children: JSX.Element | JSX.Element[] }) {
    const [user, setUser] = useState<User | null | undefined>()
    const [userLoaded, setUserLoaded] = useState(false)

    const [kc, setKc] = useState<Keycloak | null>(null)

    const [token, setToken] = useState<string | undefined>(undefined)

    const router = useRouter()
    const isAuth = !!user

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

                        const userData: User = {
                            ...tokenParsed,
                            token: keycloak.token,
                            roles: ((tokenParsed?.resource_access ?? {})['eventos-front'] ?? []).roles,
                        }

                        setUser(userData)
                        console.info('Authenticated!!!')

                        keycloak.onTokenExpired = () => {
                            console.log('token expired')
                        }
                    }
                },
                () => {
                    console.error('Authenticated Failed')
                }
            )

        const s = router.query['status']
        if (!s) return

        if (s === 'success') {
            window.history.replaceState(null, '', '/')
        }
    }, [])

    function login() {
        kc?.login()
    }

    function logout() {
        setUserLoaded(false)

        console.log('TENTANDO DESLOGAR')
        console.log(kc)

        kc?.logout()

        setUser(null)
        localStorage.removeItem(userImgName)
    }

    return <AuthContext.Provider value={{ user, isAuth, userLoaded, login, logout, saveUserData: () => {}, type: 'ad' }}>{children}</AuthContext.Provider>
}
