import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import jwt_decode from 'jwt-decode'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { AuthContext } from '../../context/auth'
import { AuthClaims, AuthReturn, AuthSspToken } from '../../types/auth'

interface User {
    name: string
    token: string
    roles?: number[]
    image?: string
}

interface OiDcConfig {
    response_type: string
    client_id: string
    scope: string
    redirect_uri: string
    nonce: number
    state: number
    code_challenge: string
    code_challenge_method: string
    authority: string
    post_logout_redirect_uri: string
    CODE_VERIFIER: string
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
}: {
    children: JSX.Element | JSX.Element[]
    AUTH_URL: string
    oidcConfig: OiDcConfig
    redirectURL: string
    validateTokenRoute: string
    testToken: string
}) {
    const govBrURL = oidcConfig.authority + '/authorize?response_type=code&client_id=' + oidcConfig.client_id + '&scope=' + oidcConfig.scope + '&redirect_uri=' + oidcConfig.redirect_uri

    const [user, setUser] = useState<User | null>()
    const [userLoaded, setUserLoaded] = useState(false)

    const router = useRouter()
    const isAuth = !!user

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
                const user: AuthClaims = jwt_decode(token)
                const img = localStorage.getItem(userImgName) as string

                setUser({ name: user.name, image: img ?? '', roles: user.roles.map((x) => x.code), token })
                setUserLoaded(true)
            }
        })
    }, [])

    function login() {
        // Teste em localhost
        if (location && location.hostname === 'localhost') {
            const token = testToken
            setCookie(cookieName, token)
            setUser({
                name: 'Teste',
                image: '',
                roles: [1],
                token: token,
            })
            router.replace(redirectURL).finally(() => setUserLoaded(true))
        }
        //
        else {
            setUserLoaded(false)
            router.replace(govBrURL)
        }
    }

    // chamado no callback de login
    async function saveUserData(authData: AuthReturn) {
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
                        setUser({ name: userData.name, image: base64 as string, roles: userData.roles.map((x) => x.code), token })
                        router.replace(redirectURL).finally(() => setUserLoaded(true))
                    }
                })
            }

            setUser({ name: userData.name, image: '', roles: userData.roles.map((x) => x.code), token })
            router.replace(redirectURL).finally(() => setUserLoaded(true))
            return
        })

        router.replace(redirectURL).finally(() => setUserLoaded(true))
    }

    function logout() {
        setUserLoaded(false)

        setUser(null)
        deleteCookie(cookieName)
        localStorage.removeItem(userImgName)

        router.replace(redirectURL).finally(() => setUserLoaded(true))
    }

    return <AuthContext.Provider value={{ user, isAuth, userLoaded, login, adLogin: () => {}, logout, saveUserData, type: 'govbr' }}>{children}</AuthContext.Provider>
}
