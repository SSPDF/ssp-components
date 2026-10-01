import { PaginaAuth } from '../lib/pagina-auth'

/** e2e do `KeycloakAuthProvider` com `type='govbr'`: o logout monta a URL federada (`initiating_idp`). */
export default function AuthKeycloakGovbr() {
    return <PaginaAuth type='govbr' />
}
