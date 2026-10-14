/**
 * E2E do `KeycloakAuthProvider` com o `keycloak-js` de verdade, no browser. Não rode direto: use
 * `npm run e2e:keycloak` (scripts/e2e-keycloak.sh), que sobe o servidor, builda o smoke-app com
 * o pacote empacotado e o serve em :3100. Página: examples/smoke-app/pages/auth-keycloak.tsx.
 *
 * Dois alvos:
 *   - **simulado** (padrão, roda no CI): o servidor OIDC de scripts/lib/oidc-simulado.mjs. Além do
 *     fluxo, confere o que só o servidor vê (PKCE, check-sso silencioso) e força os casos de
 *     borda: refresh token recusado e sessão encerrada fora do app;
 *   - **Keycloak real** (com `E2E_KC_URL`, ex.: o de HMG): o mesmo fluxo principal, com o usuário
 *     de `E2E_KC_USUARIO`/`E2E_KC_SENHA` e, se houver, a role de `E2E_KC_ROLE`.
 */
import { chromium } from 'playwright'

const APP_ORIGEM = 'http://localhost:3100'
const BASE_PATH = process.env.NEXT_PUBLIC_E2E_BASE_PATH ?? ''
const APP = `${APP_ORIGEM}${BASE_PATH}/auth-keycloak`
const APP_GOVBR = `${APP_ORIGEM}${BASE_PATH}/auth-keycloak-govbr`
const REAL = !!process.env.E2E_KC_URL
const KEYCLOAK = (process.env.E2E_KC_URL ?? 'http://localhost:8180').replace(/\/$/, '')
const USUARIO = REAL ? process.env.E2E_KC_USUARIO : 'fulano'
const SENHA = REAL ? process.env.E2E_KC_SENHA : 'senha-de-teste'
const ROLE = REAL ? process.env.E2E_KC_ROLE : 'ADMIN'

if (REAL && (!USUARIO || !SENHA)) {
    console.error('E2E_KC_URL definido sem E2E_KC_USUARIO/E2E_KC_SENHA.')
    process.exit(1)
}

async function abrirBrowser() {
    try {
        return await chromium.launch()
    } catch {
        return chromium.launch({ channel: 'chrome' })
    }
}

let passos = 0
function ok(descricao) {
    passos++
    console.log(`✓ ${descricao}`)
}

async function simulador(caminho, metodo = 'GET') {
    const res = await fetch(`${KEYCLOAK}${caminho}`, { method: metodo })
    return metodo === 'GET' ? res.json() : null
}

async function texto(page, id) {
    return (await page.getByTestId(id).textContent())?.trim() ?? ''
}

async function esperarTexto(page, id, esperado, timeout = 20_000) {
    try {
        await page.waitForFunction(([i, e]) => document.querySelector(`[data-testid="${i}"]`)?.textContent?.trim() === e, [id, esperado], { timeout })
    } catch {
        throw new Error(`"${id}" não chegou a "${esperado}" em ${timeout / 1000}s (está "${await texto(page, id).catch(() => '?')}")`)
    }
}

async function abrirPagina(page, url = APP) {
    await page.goto(url)
    await esperarTexto(page, 'carregado', 'carregado')
}

/** Clica em "Entrar"; se o servidor pedir credenciais, preenche. Volta autenticado. */
async function entrar(page, app = APP) {
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL((u) => u.href.startsWith(KEYCLOAK) || u.href.startsWith(app), { timeout: 20_000 })
    if (page.url().startsWith(KEYCLOAK)) {
        await page.fill('#username', USUARIO)
        await page.fill('#password', SENHA)
        await page.click('#kc-login')
    }
    await page.waitForURL(`${app}**`, { timeout: 20_000 })
    await esperarTexto(page, 'autenticado', 'autenticado')
}

async function confereIgual(page, esperado) {
    for (const [id, valor] of Object.entries(esperado)) {
        const atual = await texto(page, id)
        if (atual !== valor) throw new Error(`${id}: esperado "${valor}", veio "${atual}"`)
    }
}

async function main() {
    console.log(`alvo: ${REAL ? `Keycloak real em ${KEYCLOAK}` : 'OIDC simulado'}\n`)
    const browser = await abrirBrowser()
    const page = await (await browser.newContext()).newPage()
    const erros = []
    page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`))
    page.on('console', (m) => {
        // "Failed to load resource" não diz qual; as respostas com erro entram abaixo, com a URL.
        if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) erros.push(`console: ${m.text()}`)
    })
    page.on('response', (r) => {
        if (r.status() >= 400) erros.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`)
    })

    try {
        await abrirPagina(page)
        await confereIgual(page, { autenticado: 'anonimo' })
        ok('abre anônimo (check-sso sem sessão)')

        await entrar(page)
        if ((await texto(page, 'usuario')) !== USUARIO) throw new Error(`usuario: esperado "${USUARIO}", veio "${await texto(page, 'usuario')}"`)
        ok('login pela tela do servidor volta autenticado')

        if (!REAL) {
            await confereIgual(page, { nome: 'Fulano de Teste', roles: 'ADMIN', 'has-admin': 'sim', 'has-leitor': 'nao', 'has-any': 'sim', 'has-all': 'nao' })
            ok('nome e roles do client: hasRole, hasAnyRole e hasAllRoles certos')
            const estado = await simulador('/__estado')
            if (estado.pkceConferidos < 1) throw new Error('o servidor não conferiu o PKCE na troca do código')
            ok('PKCE S256 conferido pelo servidor na troca do código')
        } else if (ROLE) {
            if (!(await texto(page, 'roles')).split(',').includes(ROLE)) throw new Error(`a role ${ROLE} não veio no token (roles: "${await texto(page, 'roles')}")`)
            ok(`role ${ROLE} presente no usuário`)
        }

        const silenciososAntes = REAL ? 0 : (await simulador('/__estado')).checksSilenciosos
        await page.reload()
        await esperarTexto(page, 'carregado', 'carregado')
        await esperarTexto(page, 'autenticado', 'autenticado')
        if (page.url().startsWith(KEYCLOAK)) throw new Error('o reload passou pela tela de login')
        if (!REAL && (await simulador('/__estado')).checksSilenciosos <= silenciososAntes) throw new Error('o reload não fez check-sso silencioso (prompt=none)')
        ok('reload continua autenticado pelo check-sso silencioso')

        if (!REAL || process.env.E2E_KC_ESPERAR_REFRESH) {
            const iat = await texto(page, 'token-iat')
            const limite = REAL ? 10 * 60_000 : 60_000
            await page.waitForFunction(
                (i) => {
                    const agora = document.querySelector('[data-testid="token-iat"]')?.textContent?.trim()
                    return !!agora && agora !== i
                },
                iat,
                { timeout: limite },
            )
            await confereIgual(page, { autenticado: 'autenticado' })
            ok(`token renovado sozinho, sem perder a sessão (iat ${iat} → ${await texto(page, 'token-iat')})`)
        }

        if (!REAL) {
            await simulador('/__invalidar-refresh', 'POST')
            await esperarTexto(page, 'autenticado', 'anonimo', 60_000)
            ok('refresh token recusado pelo servidor: o app volta a anônimo, sem travar')

            await entrar(page)
            await simulador('/__encerrar-sessoes', 'POST')
            await esperarTexto(page, 'autenticado', 'anonimo', 60_000)
            ok('sessão encerrada fora do app: o iframe de status detecta e o app volta a anônimo')

            await entrar(page)
            ok('login de novo depois da sessão encerrada')
        }

        await page.getByRole('button', { name: 'Sair' }).click()
        await page.waitForURL((u) => u.href.startsWith(APP_ORIGEM) && !u.href.startsWith(KEYCLOAK), { timeout: 20_000 })
        await abrirPagina(page)
        await esperarTexto(page, 'autenticado', 'anonimo')
        if (!REAL && (await simulador('/__estado')).sessoesAtivas !== 0) throw new Error('o logout não encerrou a sessão no servidor')
        await page.reload()
        await esperarTexto(page, 'carregado', 'carregado')
        await esperarTexto(page, 'autenticado', 'anonimo')
        ok(`logout encerra a sessão no servidor e volta ao basePath (${BASE_PATH || '/'}), anônimo também depois do reload`)

        if (!REAL) {
            await abrirPagina(page, APP_GOVBR)
            await entrar(page, APP_GOVBR)
            await page.getByRole('button', { name: 'Sair' }).click()
            await page.waitForURL((u) => u.href.startsWith(APP_ORIGEM) && !u.href.startsWith(KEYCLOAK), { timeout: 20_000 })
            await abrirPagina(page, APP_GOVBR)
            await esperarTexto(page, 'autenticado', 'anonimo')
            const estado = await simulador('/__estado')
            if (estado.logoutsFederados < 1) throw new Error('o logout do type govbr não mandou initiating_idp')
            if (estado.sessoesAtivas !== 0) throw new Error('o logout do type govbr não encerrou a sessão no servidor')
            ok('type govbr: login e logout federado (initiating_idp, id_token_hint) encerram a sessão')
        }

        if (!REAL) {
            const { recusas } = await simulador('/__estado')
            const inesperadas = recusas.filter((r) => !r.includes('Token is not active') && !r.includes('Session not active'))
            if (inesperadas.length) throw new Error(`o servidor recusou pedidos do keycloak-js:\n    ${inesperadas.join('\n    ')}`)
            ok('nenhum pedido fora do protocolo (redirect_uri, PKCE, client_id, grant)')
        }
    } catch (e) {
        console.error(`\n✗ ${e.message}`)
        console.error(`  url: ${page.url()}`)
        const tela = await page
            .locator('body')
            .innerText()
            .catch(() => '')
        console.error(`  tela: ${tela.replace(/\s+/g, ' ').slice(0, 300)}`)
        if (!REAL) console.error(`  servidor: ${JSON.stringify(await simulador('/__estado').catch(() => ({})))}`)
        if (erros.length) console.error(`  erros no browser:\n    ${[...new Set(erros)].join('\n    ')}`)
        await browser.close()
        process.exit(1)
    }

    await browser.close()
    // Os erros de console não derrubam o fluxo, mas ficam no log: são o primeiro sinal de uma quebra.
    // Esperados: o 400 do refresh recusado de propósito (simulado) e o favicon, que o smoke-app não tem.
    const relevantes = [...new Set(erros)].filter((e) => !/HTTP 400 POST .*\/token$/.test(e) && !/\/favicon\.ico$/.test(e))
    if (relevantes.length) console.warn(`\nerros no browser (o fluxo passou):\n  ${relevantes.join('\n  ')}`)
    console.log(`\nE2E do KeycloakAuthProvider: ${passos} passos ok.`)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
