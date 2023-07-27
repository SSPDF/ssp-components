import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import jwt_decode from 'jwt-decode'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { AuthContext } from '../../context/auth'
import { AuthClaims, AuthReturn } from '../../types/auth'

interface User {
    name: string
    token: string
    roles?: number[]
    image?: string
}

export const cookieName = 'nextauth.token'
const userImgName = 'user-data.img'

export function LoginProvider({
    children,
    AUTH_URL,
    redirectURL = '/',
    validateTokenRoute,
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

    function adLogin(loginURL: string, data: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<boolean>>, captchaToken: string) {
        setLoading(true)

        fetch(loginURL, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                cpf: (data.cpf as any).replaceAll(/[.-]/g, ''),
                captchaToken: captchaToken ? captchaToken : 'hmg',
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => {
            if (res.ok) {
                res.json().then((j) => {
                    setError(false)
                    const token = j.accessToken

                    const user: AuthClaims = jwt_decode(token)

                    setUser({
                        name: user.name,
                        image: '',
                        roles: user.roles.map((x) => x.code),
                        token: token,
                    })

                    setCookie(cookieName, token)
                    router.replace(redirectURL).finally(() => setUserLoaded(true))
                })
            } else {
                setLoading(false)
                setUserLoaded(true)
                setError(true)
            }
        })
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

    return <AuthContext.Provider value={{ user, isAuth, userLoaded, login: () => {}, adLogin, logout, saveUserData, type: 'ad' }}>{children}</AuthContext.Provider>
}
