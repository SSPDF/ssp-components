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

export const cookieName = 'nextauth.token'
const userImgName = 'user-data.img'

export function OAuthProvider({
    children,
    AUTH_URL,
    redirectURL = '/',
    validateTokenRoute,
    testToken,
}: {
    children: JSX.Element | JSX.Element[]
    AUTH_URL: string
    validateTokenRoute: string
    testToken: string
    redirectURL?: string
}) {
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
        // if (location && location.hostname === 'localhost') {
        //     const token = testToken
        //     setCookie(cookieName, token, { maxAge: 60 * 60 * 24 * 500 })
        //     setUser({
        //         name: 'Teste',
        //         image: '',
        //         roles: [1],
        //         token: token,
        //     })
        //     router.replace(redirectURL).finally(() => setUserLoaded(true))
        // }
        // //
        // else {
        //     setUserLoaded(false)
        //     router.replace(govBrURL)
        // }
    }

    // chamado no callback de login
    async function saveUserData(authData: AuthReturn) {
        const token = authData.ssp_token

        setCookie(cookieName, token)

        router.replace(redirectURL).finally(() => setUserLoaded(true))
    }

    function logout() {
        setUserLoaded(false)

        setUser(null)
        deleteCookie(cookieName)
        localStorage.removeItem(userImgName)

        router.replace(redirectURL).finally(() => setUserLoaded(true))
    }

    return <AuthContext.Provider value={{ user, isAuth, userLoaded, login, logout, saveUserData, type: 'ad' }}>{children}</AuthContext.Provider>
}
