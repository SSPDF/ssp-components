import { KeycloakLoginOptions, KeycloakLogoutOptions, KeycloakTokenParsed } from 'keycloak-js'

// Re-exporta tipos nativos do Keycloak para uso direto
export type { KeycloakLoginOptions, KeycloakLogoutOptions, KeycloakTokenParsed }

export interface User extends KeycloakTokenParsed {
    token: string | undefined
    roles: string[]
    image?: string
}

/**
 * Opções customizadas para o login do Keycloak
 * Extende KeycloakLoginOptions com callbacks adicionais
 *
 * Opções nativas do Keycloak incluídas:
 * - `redirectUri`: URI para redirecionar após login
 * - `prompt`: Controla comportamento de prompt ('none' | 'login' | 'consent')
 * - `maxAge`: Tempo máximo desde última autenticação
 * - `loginHint`: Preenche campo de login automaticamente
 * - `idpHint`: Pula para um IdP específico (ex: 'google', 'facebook')
 * - `action`: Ação a executar ('register' para registro)
 * - `locale`: Localidade preferida para o login
 * - `acr`: Authentication Context Class Reference
 * - `scope`: Escopos adicionais a solicitar
 * - `cordovaOptions`: Opções específicas para Cordova
 */
export interface LoginOptions extends KeycloakLoginOptions {
    /** Callback executado após login bem-sucedido */
    onSuccess?: () => void
    /** Callback executado em caso de erro no login */
    onError?: (error: Error) => void
}

/**
 * Opções customizadas para o logout do Keycloak
 * Extende KeycloakLogoutOptions com callbacks adicionais
 *
 * Opções nativas do Keycloak incluídas:
 * - `redirectUri`: URI para redirecionar após logout
 * - `logoutMethod`: Método de logout ('GET' | 'POST') - POST para RP-Initiated Logout
 */
export interface LogoutOptions extends KeycloakLogoutOptions {
    /** Callback executado antes do logout (pode ser async para cleanup) */
    onBeforeLogout?: () => void | Promise<void>
    /** Callback executado após logout bem-sucedido */
    onSuccess?: () => void
}

export interface AuthData {
    isAuth: boolean
    user: User | null | undefined
    userLoaded: boolean
    login: (options?: LoginOptions) => void
    logout: (options?: LogoutOptions) => void
}

export interface AuthClaims {
    sub: string
    email_verified: string
    amr: string[]
    profile: string
    kid: string
    iss: string
    phone_number_verified: string
    preferred_username: string
    picture: string
    aud: string
    auth_time: number
    scope: string[]
    name: string
    given_name: string
    phone_number: string
    exp: number
    iat: number
    roles: { code: number; name: string }[]
    jti: string
    email: string
}

export interface AuthReturn {
    access_token: string
    token_type: string
    expires_in: number
    scope: string
    id_token: string
    claims: AuthClaims
    ssp_token: string
}

export interface AuthSspToken {
    id: number
    name: string
    email: string
    phone_number: string
    preferred_username: string
    roles: {
        code: number
        name: string
    }[]
    iat: number
    exp: number
    aud: string
    iss: string
    sub: string
}

export interface AuthReturnData {
    /** Indica se o usuário está autenticado */
    isAuth: boolean
    /** Tipo de autenticação */
    type: 'govbr' | 'ad'
    /** Dados do usuário autenticado */
    user: User | null
    /** Indica se os dados do usuário já foram carregados (loading completo) */
    userLoaded: boolean
    /** Inicia o fluxo de login com opções customizáveis */
    login: (options?: LoginOptions) => void
    /** Salva dados do usuário vindos de token externo */
    saveUserData: (token: AuthReturn) => void
    /** Inicia o fluxo de logout com opções customizáveis */
    logout: (options?: LogoutOptions) => void
    /** Atualiza o token manualmente */
    refreshToken: () => Promise<boolean>
    /** Verifica se o usuário possui uma role específica */
    hasRole: (role: string) => boolean
    /** Verifica se o usuário possui todas as roles especificadas */
    hasAllRoles: (roles: string[]) => boolean
    /** Verifica se o usuário possui pelo menos uma das roles especificadas */
    hasAnyRole: (roles: string[]) => boolean
    /** Token de acesso atual */
    accessToken: string | undefined
}
