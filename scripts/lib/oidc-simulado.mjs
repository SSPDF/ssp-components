/**
 * Servidor OIDC simulado, com os endpoints do Keycloak que o `keycloak-js` usa, para testar o
 * `KeycloakAuthProvider` no browser sem subir um Keycloak (que pesa ~1 GB de memória).
 *
 * Não é um Keycloak: não assina tokens (o `keycloak-js` só decodifica, não verifica assinatura)
 * e só tem um realm, um client e um usuário. Mas segue o protocolo onde o `keycloak-js` depende
 * dele, e é estrito onde um upgrade poderia quebrar em silêncio:
 *   - `auth`: `redirect_uri` precisa ser do app; `prompt=none` sem sessão devolve `login_required`
 *     (é o check-sso silencioso); com sessão devolve o `code` no fragment, como o Keycloak;
 *   - `token`: **confere o PKCE** (`code_verifier` × `code_challenge` S256), o `redirect_uri` e o
 *     `client_id`; código de uso único; `refresh_token` renova e pode ser invalidado;
 *   - `nonce` do pedido volta no access e no id token (o `keycloak-js` rejeita se não bater);
 *   - `login-status-iframe.html` responde `unchanged`/`changed` pelo cookie de sessão, e
 *     `3p-cookies/step1.html` responde `supported`;
 *   - `logout` encerra a sessão no servidor e volta para o `post_logout_redirect_uri`.
 *
 * Endpoints de controle para o teste (fora do protocolo): `GET /__estado` (contadores) e
 * `POST /__encerrar-sessoes`, `POST /__invalidar-refresh`.
 *
 * Uso: node scripts/lib/oidc-simulado.mjs  (porta 8180; ver as constantes abaixo)
 */
import http from 'node:http'
import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'

export const CONFIG = {
    porta: Number(process.env.OIDC_SIMULADO_PORTA ?? 8180),
    realm: 'ssp-teste',
    clientId: 'smoke-app',
    origemApp: process.env.OIDC_SIMULADO_ORIGEM_APP ?? 'http://localhost:3100',
    usuario: { username: 'fulano', senha: 'senha-de-teste', nome: 'Fulano', sobrenome: 'de Teste', email: 'fulano@teste.local', roles: ['ADMIN'] },
    // Curto de propósito: o e2e espera o keycloak-js renovar o token sozinho.
    duracaoAccessToken: Number(process.env.OIDC_SIMULADO_DURACAO_TOKEN ?? 20),
}

const COOKIE = 'SSP_SIM_SESSAO'

export function iniciarOidcSimulado(config = CONFIG) {
    const base = `http://localhost:${config.porta}`
    const issuer = `${base}/realms/${config.realm}`
    const prefixo = `/realms/${config.realm}/protocol/openid-connect`

    const sessoes = new Map() // sid -> { criadaEm }
    const codigos = new Map() // code -> { sid, redirectUri, nonce, challenge, clientId }
    const refreshes = new Map() // refresh token -> { sid, nonce }
    const pendentes = new Map() // id do formulário de login -> parâmetros do auth
    const estado = { logins: 0, pkceConferidos: 0, trocasDeCodigo: 0, renovacoes: 0, logouts: 0, logoutsFederados: 0, checksSilenciosos: 0, recusas: [] }

    const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
    const jwt = (claims) => `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url(claims)}.assinatura-simulada`
    const id = () => crypto.randomUUID()
    const agora = () => Math.floor(Date.now() / 1000)
    const recusar = (res, status, motivo) => {
        estado.recusas.push(motivo)
        res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(motivo)
    }
    const cors = (req) => ({ 'Access-Control-Allow-Origin': req.headers.origin ?? config.origemApp, 'Access-Control-Allow-Credentials': 'true', Vary: 'Origin' })
    const sessaoDoCookie = (req) => {
        const m = (req.headers.cookie ?? '').match(new RegExp(`${COOKIE}=([^;]+)`))
        return m && sessoes.has(m[1]) ? m[1] : null
    }
    // Como o `http://localhost:3100/*` de um client do Keycloak: aceita a origem e qualquer caminho nela.
    const redirectValido = (uri) => typeof uri === 'string' && (uri === config.origemApp || uri.startsWith(`${config.origemApp}/`))

    function tokens(sid, nonce) {
        const u = config.usuario
        const comum = { iss: issuer, sub: 'id-do-fulano', azp: config.clientId, sid, session_state: sid, nonce, iat: agora() }
        const access = jwt({
            ...comum,
            exp: agora() + config.duracaoAccessToken,
            typ: 'Bearer',
            aud: 'account',
            preferred_username: u.username,
            name: `${u.nome} ${u.sobrenome}`,
            given_name: u.nome,
            family_name: u.sobrenome,
            email: u.email,
            realm_access: { roles: ['default-roles-ssp-teste'] },
            resource_access: { [config.clientId]: { roles: u.roles } },
            jti: id(),
        })
        const refresh = id()
        refreshes.set(refresh, { sid, nonce })
        return {
            access_token: access,
            expires_in: config.duracaoAccessToken,
            refresh_token: jwt({ ...comum, exp: agora() + 1800, typ: 'Refresh', jti: refresh }),
            refresh_expires_in: 1800,
            id_token: jwt({ ...comum, exp: agora() + config.duracaoAccessToken, typ: 'ID', aud: config.clientId, preferred_username: u.username }),
            token_type: 'Bearer',
            session_state: sid,
            scope: 'openid profile email',
        }
    }

    function redirecionarComCodigo(res, p, sid) {
        const code = id()
        codigos.set(code, { sid, redirectUri: p.redirect_uri, nonce: p.nonce, challenge: p.code_challenge, clientId: p.client_id })
        const params = new URLSearchParams({ state: p.state, session_state: sid, iss: issuer, code })
        const sep = p.response_mode === 'query' ? (p.redirect_uri.includes('?') ? '&' : '?') : '#'
        res.writeHead(302, { Location: `${p.redirect_uri}${sep}${params}` }).end()
    }

    function paginaDeLogin(res, pendente, erro = '') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(`<!doctype html><html lang="pt-BR"><body>
<h1>Keycloak simulado — ${config.realm}</h1>${erro ? `<p id="input-error">${erro}</p>` : ''}
<form method="post" action="/realms/${config.realm}/login-actions/authenticate?pendente=${pendente}">
<label>Usuário <input id="username" name="username"></label>
<label>Senha <input id="password" name="password" type="password"></label>
<button id="kc-login" type="submit">Entrar</button></form></body></html>`)
    }

    async function corpo(req) {
        let s = ''
        for await (const parte of req) s += parte
        return Object.fromEntries(new URLSearchParams(s))
    }

    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, base)
        const p = Object.fromEntries(url.searchParams)
        try {
            if (url.pathname === '/__estado') return res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ...estado, sessoesAtivas: sessoes.size }))
            if (url.pathname === '/__encerrar-sessoes' && req.method === 'POST') {
                sessoes.clear()
                return res.writeHead(204).end()
            }
            if (url.pathname === '/__invalidar-refresh' && req.method === 'POST') {
                refreshes.clear()
                return res.writeHead(204).end()
            }

            if (url.pathname === `${prefixo}/auth`) {
                if (p.client_id !== config.clientId) return recusar(res, 400, `auth: client_id desconhecido (${p.client_id})`)
                if (!redirectValido(p.redirect_uri)) return recusar(res, 400, `auth: Invalid parameter: redirect_uri (${p.redirect_uri})`)
                if (p.response_type !== 'code') return recusar(res, 400, `auth: response_type ${p.response_type} (esperado code)`)
                if (p.code_challenge_method !== 'S256' || !p.code_challenge) return recusar(res, 400, 'auth: sem PKCE S256')
                const sid = sessaoDoCookie(req)
                if (p.prompt === 'none') estado.checksSilenciosos++
                if (sid) return redirecionarComCodigo(res, p, sid)
                if (p.prompt === 'none') {
                    const params = new URLSearchParams({ error: 'login_required', state: p.state, iss: issuer })
                    return res.writeHead(302, { Location: `${p.redirect_uri}${p.response_mode === 'query' ? '?' : '#'}${params}` }).end()
                }
                const pendente = id()
                pendentes.set(pendente, p)
                return paginaDeLogin(res, pendente)
            }

            if (url.pathname === `/realms/${config.realm}/login-actions/authenticate` && req.method === 'POST') {
                const pedido = pendentes.get(p.pendente)
                if (!pedido) return recusar(res, 400, 'login: formulário expirado')
                const { username, password } = await corpo(req)
                if (username !== config.usuario.username || password !== config.usuario.senha) return paginaDeLogin(res, p.pendente, 'Usuário ou senha inválidos.')
                pendentes.delete(p.pendente)
                const sid = id()
                sessoes.set(sid, { criadaEm: Date.now() })
                estado.logins++
                res.setHeader('Set-Cookie', `${COOKIE}=${sid}; Path=/; SameSite=Lax`)
                return redirecionarComCodigo(res, pedido, sid)
            }

            if (url.pathname === `${prefixo}/token` && req.method === 'OPTIONS') {
                return res.writeHead(204, { ...cors(req), 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'content-type, accept' }).end()
            }
            if (url.pathname === `${prefixo}/token` && req.method === 'POST') {
                const f = await corpo(req)
                const h = { ...cors(req), 'Content-Type': 'application/json' }
                const erro = (motivo, error = 'invalid_grant') => {
                    estado.recusas.push(`token: ${motivo}`)
                    res.writeHead(400, h).end(JSON.stringify({ error, error_description: motivo }))
                }
                if (f.client_id !== config.clientId) return erro(`client_id ${f.client_id}`, 'unauthorized_client')
                if (f.grant_type === 'authorization_code') {
                    const c = codigos.get(f.code)
                    codigos.delete(f.code) // uso único
                    if (!c) return erro('código inválido ou já usado')
                    if (c.redirectUri !== f.redirect_uri) return erro('redirect_uri diferente do usado no auth')
                    const desafio = crypto
                        .createHash('sha256')
                        .update(f.code_verifier ?? '')
                        .digest('base64url')
                    if (desafio !== c.challenge) return erro('PKCE: code_verifier não confere com o code_challenge')
                    if (!sessoes.has(c.sid)) return erro('sessão encerrada')
                    estado.pkceConferidos++
                    estado.trocasDeCodigo++
                    return res.writeHead(200, h).end(JSON.stringify(tokens(c.sid, c.nonce)))
                }
                if (f.grant_type === 'refresh_token') {
                    const jti = JSON.parse(Buffer.from((f.refresh_token ?? '').split('.')[1] ?? '', 'base64url').toString() || '{}').jti
                    const r = refreshes.get(jti)
                    if (!r) return erro('Token is not active')
                    if (!sessoes.has(r.sid)) return erro('Session not active')
                    refreshes.delete(jti)
                    estado.renovacoes++
                    return res.writeHead(200, h).end(JSON.stringify(tokens(r.sid, r.nonce)))
                }
                return erro(`grant_type ${f.grant_type}`, 'unsupported_grant_type')
            }

            if (url.pathname === `${prefixo}/logout`) {
                const destino = p.post_logout_redirect_uri
                if (!redirectValido(destino)) return recusar(res, 400, `logout: post_logout_redirect_uri inválido (${destino})`)
                // Sem id_token_hint o Keycloak mostra uma tela de confirmação em vez de voltar ao app.
                if (!p.id_token_hint) return recusar(res, 400, 'logout: sem id_token_hint (o Keycloak pediria confirmação)')
                if (p.client_id && p.client_id !== config.clientId) return recusar(res, 400, `logout: client_id desconhecido (${p.client_id})`)
                const sid = sessaoDoCookie(req)
                if (sid) sessoes.delete(sid)
                estado.logouts++
                if (p.initiating_idp) estado.logoutsFederados++
                return res.writeHead(302, { Location: destino, 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax` }).end()
            }

            if (url.pathname === `${prefixo}/login-status-iframe.html`) {
                // Mesmo protocolo do Keycloak: o app manda "clientId sid"; a resposta compara com a sessão
                // do cookie. Os sids válidos vêm do servidor em cada carga do iframe.
                const ativos = JSON.stringify([...sessoes.keys()])
                return res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(`<!doctype html><script>
window.addEventListener('message', async (e) => {
  const [clientId, sid] = String(e.data).split(' ')
  let ativos = ${ativos}
  try { ativos = (await (await fetch('/__estado-sessoes', { cache: 'no-store' })).json()) } catch {}
  const m = document.cookie.match(/${COOKIE}=([^;]+)/)
  const doCookie = m && ativos.includes(m[1]) ? m[1] : ''
  e.source.postMessage((sid || '') === doCookie ? 'unchanged' : 'changed', e.origin)
})
</script>`)
            }
            if (url.pathname === '/__estado-sessoes') return res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify([...sessoes.keys()]))

            if (url.pathname === `${prefixo}/3p-cookies/step1.html`) {
                return res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(`<!doctype html><script>parent.postMessage('supported', '*')</script>`)
            }

            res.writeHead(404, { 'Content-Type': 'text/plain' }).end(`não simulado: ${req.method} ${url.pathname}`)
        } catch (e) {
            recusar(res, 500, `erro no simulador: ${e.message}`)
        }
    })

    return new Promise((resolve) => server.listen(config.porta, () => resolve({ server, base, estado })))
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { base } = await iniciarOidcSimulado()
    console.log(`OIDC simulado em ${base}/realms/${CONFIG.realm} (client ${CONFIG.clientId}, usuário ${CONFIG.usuario.username})`)
}
