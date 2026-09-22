/**
 * Monta um JWT **não assinado** para uso nos testes.
 *
 * Os providers só fazem `jwt_decode` (decodifica, não verifica assinatura), então
 * um token com assinatura falsa é suficiente — e evita ter qualquer segredo ou
 * token real de homologação versionado no repo.
 */
function base64url(obj: unknown): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fakeJwt(claims: Record<string, unknown>): string {
    const header = base64url({ alg: 'none', typ: 'JWT' })
    const payload = base64url({ iat: 1700000000, exp: 4102444800, ...claims })
    return `${header}.${payload}.assinatura-falsa-de-teste`
}

/** Claims no formato que o OAuthProvider espera de um token gov.br. */
export function claimsGovBr(over: Record<string, unknown> = {}) {
    return {
        given_name: 'Maria Souza',
        name: 'Maria Souza',
        preferred_username: 'maria.souza',
        email: 'maria.souza@ssp.df.gov.br',
        email_verified: 'true',
        sub: 'e3f1c2a0-0000-4000-8000-000000000001',
        picture: 'https://exemplo.invalid/foto.png',
        roles: [{ code: 1 }, { code: 42 }],
        ...over,
    }
}
