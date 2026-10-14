import { PaginaAuth } from '../lib/pagina-auth'

/** e2e do `KeycloakAuthProvider` com `type='ad'` (o padrão, que todos os apps usam). Ver lib/pagina-auth.tsx. */
export default function AuthKeycloak() {
    return <PaginaAuth type='ad' />
}
