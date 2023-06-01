export interface User {
    name: string
    token: string
    roles?: number[]
    image?: string
}

export interface AuthData {
    isAuth: boolean
    user: User | null | undefined
    userLoaded: boolean
    login: () => void
    logout: () => void
}

export interface AuthClaims {
    sub: string,
    email_verified: string,
    amr: string[],
    profile: string,
    kid: string,
    iss: string,
    phone_number_verified: string,
    preferred_username: string,
    picture: string,
    aud: string,
    auth_time: number,
    scope: string[],
    name: string,
    phone_number: string,
    exp: number,
    iat: number,
    roles: { code: number, name: string }[]
    jti: string,
    email: string
}

export interface AuthReturn {
    access_token: string
    token_type: string,
    expires_in: number,
    scope: string,
    id_token: string,
    claims: AuthClaims
    ssp_token: string
}

export interface AuthSspToken {
    id: number,
    name: string
    email: string
    phone_number: string
    preferred_username: string
    roles: {
        code: number,
        name: string
    }[],
    iat: number,
    exp: number,
    aud: string
    iss: string
    sub: string
}

export interface AuthReturnData {
    isAuth: boolean
    type: 'govbr' | 'ad'
    user: User | null | undefined
    userLoaded: boolean
    login: () => void
    adLogin: (loginURL: string, data: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<boolean>>, captchaToken: string) => void
    saveUserData: (token: AuthReturn) => void
    logout: () => void
}