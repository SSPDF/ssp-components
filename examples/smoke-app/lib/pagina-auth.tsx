import { Button, Container, Stack, Typography } from '@mui/material'
import { AuthContext, KeycloakAuthProvider } from '@ssplib/react-components'
import { useContext } from 'react'

/**
 * Páginas do e2e do `KeycloakAuthProvider` (pages/auth-keycloak*.tsx) (`npm run e2e:keycloak`). Por padrão aponta para o
 * servidor OIDC simulado (scripts/lib/oidc-simulado.mjs); com as variáveis `E2E_KC_*` o
 * scripts/e2e-keycloak.sh a builda contra outro Keycloak (o de HMG). O
 * scripts/e2e-keycloak.mjs faz o login pela tela do servidor e confere o que aparece aqui.
 *
 * No `next build` comum a página só é pré-renderizada: o provider inicializa no `useEffect`,
 * então o SSR não fala com o servidor.
 */
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_E2E_KEYCLOAK_URL ?? 'http://localhost:8180'
const REALM = process.env.NEXT_PUBLIC_E2E_KEYCLOAK_REALM ?? 'ssp-teste'
const CLIENT_ID = process.env.NEXT_PUBLIC_E2E_KEYCLOAK_CLIENT_ID ?? 'smoke-app'
const RESOURCE = process.env.NEXT_PUBLIC_E2E_KEYCLOAK_RESOURCE ?? CLIENT_ID
// Todos os apps usam basePath (/specto, /spp, /hefesto, /conat): o e2e roda com um também.
const BASE_PATH = process.env.NEXT_PUBLIC_E2E_BASE_PATH ?? ''

function Estado() {
    const auth = useContext(AuthContext)
    const token = auth.user?.token
    return (
        <Stack spacing={1}>
            <Typography data-testid='carregado'>{auth.userLoaded ? 'carregado' : 'carregando'}</Typography>
            <Typography data-testid='autenticado'>{auth.isAuth ? 'autenticado' : 'anonimo'}</Typography>
            <Typography data-testid='usuario'>{String(auth.user?.preferred_username ?? '')}</Typography>
            <Typography data-testid='nome'>{String(auth.user?.name ?? '')}</Typography>
            <Typography data-testid='roles'>{(auth.user?.roles ?? []).join(',')}</Typography>
            <Typography data-testid='has-admin'>{auth.isAuth && auth.hasRole('ADMIN') ? 'sim' : 'nao'}</Typography>
            <Typography data-testid='has-leitor'>{auth.isAuth && auth.hasRole('LEITOR') ? 'sim' : 'nao'}</Typography>
            <Typography data-testid='has-any'>{auth.isAuth && auth.hasAnyRole(['LEITOR', 'ADMIN']) ? 'sim' : 'nao'}</Typography>
            <Typography data-testid='has-all'>{auth.isAuth && auth.hasAllRoles(['LEITOR', 'ADMIN']) ? 'sim' : 'nao'}</Typography>
            <Typography data-testid='token-iat'>{auth.user?.iat ?? ''}</Typography>
            <Typography data-testid='token-fim'>{token ? token.slice(-12) : ''}</Typography>
            <Stack direction='row' spacing={2}>
                <Button variant='contained' onClick={() => auth.login()}>
                    Entrar
                </Button>
                <Button variant='outlined' onClick={() => auth.logout()}>
                    Sair
                </Button>
            </Stack>
        </Stack>
    )
}

export function PaginaAuth({ type }: { type: 'ad' | 'govbr' }) {
    return (
        <KeycloakAuthProvider url={KEYCLOAK_URL} realm={REALM} clientId={CLIENT_ID} resource_name={RESOURCE} type={type} basePath={BASE_PATH}>
            <Container maxWidth='sm' sx={{ py: 5 }}>
                <Typography variant='h5' gutterBottom>
                    KeycloakAuthProvider (type {type})
                </Typography>
                <Estado />
            </Container>
        </KeycloakAuthProvider>
    )
}
