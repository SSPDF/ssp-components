#!/usr/bin/env node
// Diagnóstico para atualizar @ssplib/react-components num app consumidor.
// Sem dependências: roda com o Node do app (≥ 22). Só lê arquivos do app; a
// única escrita é a extração do pacote-alvo numa pasta temporária (e o arquivo
// de --salvar-spreads, quando pedido).
//
//   node diagnostico.mjs [--app <dir>] [--alvo <versão | dist-tag | caminho .tgz>] [--offline]
//   node diagnostico.mjs --alvo <…> --changelog              (só o trecho do CHANGELOG entre a instalada e a alvo)
//   node diagnostico.mjs --salvar-spreads <arquivo.json>    (antes dos codemods)
//   node diagnostico.mjs --comparar-spreads <arquivo.json>  (depois dos codemods)

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const LIB = '@ssplib/react-components'

// ---------------------------------------------------------------- argumentos

const args = process.argv.slice(2)
function opcao(nome) {
    const i = args.indexOf(nome)
    return i === -1 ? undefined : args[i + 1]
}
const APP = path.resolve(opcao('--app') ?? process.cwd())
const ALVO = opcao('--alvo') ?? 'latest'
const OFFLINE = args.includes('--offline')
const SALVAR_SPREADS = opcao('--salvar-spreads')
const COMPARAR_SPREADS = opcao('--comparar-spreads')
const SO_CHANGELOG = args.includes('--changelog')

if (!fs.existsSync(path.join(APP, 'package.json'))) {
    console.error(`Sem package.json em ${APP}. Rode na raiz do app ou passe --app <dir>.`)
    process.exit(2)
}

// ---------------------------------------------------------------- semver mínimo

function parseVersao(v) {
    const m = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([\w.-]+))?/.exec(String(v).trim())
    if (!m) return null
    return { maj: +m[1], min: +(m[2] ?? 0), pat: +(m[3] ?? 0), pre: m[4] ?? null }
}
function comparar(a, b) {
    const x = typeof a === 'string' ? parseVersao(a) : a
    const y = typeof b === 'string' ? parseVersao(b) : b
    for (const k of ['maj', 'min', 'pat']) if (x[k] !== y[k]) return x[k] - y[k]
    if (x.pre === y.pre) return 0
    if (x.pre === null) return 1
    if (y.pre === null) return -1
    const pa = x.pre.split('.')
    const pb = y.pre.split('.')
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        if (pa[i] === undefined) return -1
        if (pb[i] === undefined) return 1
        const na = /^\d+$/.test(pa[i])
        const nb = /^\d+$/.test(pb[i])
        if (na && nb && +pa[i] !== +pb[i]) return +pa[i] - +pb[i]
        if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1
    }
    return 0
}
// Cobre o que aparece em peerDependencies: ^, ~, >=, <, x, *, exato e ||.
function satisfaz(versao, faixa) {
    const v = parseVersao(versao)
    if (!v || !faixa) return false
    return faixa.split('||').some((alt) => {
        const partes = alt.trim().split(/\s+/).filter(Boolean)
        if (partes.length === 0 || partes[0] === '*' || partes[0] === 'x') return true
        return partes.every((p) => {
            const m = /^(\^|~|>=|<=|>|<|=)?v?(.+)$/.exec(p)
            if (!m) return false
            const op = m[1] ?? ''
            const bruto = m[2].replace(/\.[x*]/g, '')
            const alvo = parseVersao(bruto)
            if (!alvo) return false
            const c = comparar(v, alvo)
            const casas = bruto.split('-')[0].split('.').length
            if (op === '>=') return c >= 0
            if (op === '>') return c > 0
            if (op === '<=') return c <= 0
            if (op === '<') return c < 0
            if (op === '^') {
                if (c < 0) return false
                if (alvo.maj > 0) return v.maj === alvo.maj
                if (alvo.min > 0) return v.maj === 0 && v.min === alvo.min
                return v.maj === 0 && v.min === 0 && v.pat === alvo.pat
            }
            if (op === '~' || casas < 3) return c >= 0 && v.maj === alvo.maj && (casas < 2 || v.min === alvo.min)
            return c === 0
        })
    })
}
// Maior major aceito por uma faixa (`^7.3.0 || ^9.0.0` → 9).
function majorMaisAlto(faixa) {
    const majors = [...String(faixa).matchAll(/(?:^|\|\||\s)[\^~>=]*v?(\d+)/g)].map((m) => +m[1])
    return majors.length ? Math.max(...majors) : null
}

// ---------------------------------------------------------------- utilidades

function lerJson(arquivo) {
    try {
        return JSON.parse(fs.readFileSync(arquivo, 'utf8'))
    } catch {
        return null
    }
}
function npm(argumentos) {
    if (OFFLINE) return null
    try {
        return execFileSync('npm', argumentos, { cwd: APP, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60_000 }).trim()
    } catch {
        return null
    }
}
function npmView(spec, campos) {
    const saida = npm(['view', spec, ...campos, '--json'])
    if (!saida) return null
    try {
        return JSON.parse(saida)
    } catch {
        return null
    }
}
const cacheUltima = new Map()
// Última versão publicada dentro de um major (ou a `latest`, sem major).
function ultimaVersao(pacote, major) {
    const chave = `${pacote}@${major ?? 'latest'}`
    if (!cacheUltima.has(chave)) {
        let v = npmView(major == null ? pacote : `${pacote}@^${major}`, ['version'])
        if (Array.isArray(v)) v = v[v.length - 1]
        cacheUltima.set(chave, typeof v === 'string' ? v : null)
    }
    return cacheUltima.get(chave)
}
function versaoInstalada(pacote) {
    return lerJson(path.join(APP, 'node_modules', pacote, 'package.json'))?.version ?? null
}

const pkgApp = lerJson(path.join(APP, 'package.json'))
const declaradas = { ...(pkgApp.dependencies ?? {}), ...(pkgApp.devDependencies ?? {}) }
const ehDev = (p) => Boolean(pkgApp.devDependencies?.[p])

// ---------------------------------------------------------------- arquivos do app

const EXTENSOES = /\.(tsx?|jsx?|mjs|cjs)$/
const IGNORAR = new Set(['node_modules', '.next', 'dist', 'build', 'out', 'coverage', '.git', 'public', 'storybook-static'])
function listarFontes() {
    let lista = null
    try {
        lista = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: APP, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
            .split('\n')
            .filter(Boolean)
    } catch {
        lista = []
        const andar = (dir) => {
            for (const e of fs.readdirSync(path.join(APP, dir), { withFileTypes: true })) {
                if (IGNORAR.has(e.name)) continue
                const rel = path.join(dir, e.name)
                if (e.isDirectory()) andar(rel)
                else lista.push(rel)
            }
        }
        andar('.')
    }
    return lista.filter((f) => EXTENSOES.test(f) && !f.split(/[\\/]/).some((p) => IGNORAR.has(p)) && !f.endsWith('.d.ts') && fs.existsSync(path.join(APP, f)))
}

// `{...{ xs, sm, md }}` (objeto literal só com breakpoints): o codemod do Grid converte em `size` sem perder nada.
const SPREAD_DE_BREAKPOINTS = /^\{\s*\.\.\.\s*\{\s*(?:(?:xs|sm|md|lg|xl)\b\s*(?::\s*[\w.]+\s*)?,?\s*)+\}\s*\}/
function contarSpreads(fonte) {
    return [...fonte.matchAll(/\{\s*\.\.\./g)].filter((m) => !SPREAD_DE_BREAKPOINTS.test(fonte.slice(m.index))).length
}

// ---------------------------------------------------------------- modo spreads

if (SALVAR_SPREADS || COMPARAR_SPREADS) {
    const atual = {}
    for (const f of listarFontes()) atual[f] = contarSpreads(fs.readFileSync(path.join(APP, f), 'utf8'))
    if (SALVAR_SPREADS) {
        fs.writeFileSync(SALVAR_SPREADS, JSON.stringify(atual, null, 2))
        console.log(`Spreads de ${Object.keys(atual).length} arquivos salvos em ${SALVAR_SPREADS}. Depois dos codemods: --comparar-spreads ${SALVAR_SPREADS}`)
    } else {
        const antes = lerJson(COMPARAR_SPREADS)
        if (!antes) {
            console.error(`Não consegui ler ${COMPARAR_SPREADS}.`)
            process.exit(2)
        }
        const perdas = Object.entries(antes).filter(([f, n]) => (atual[f] ?? 0) < n)
        if (perdas.length === 0) console.log('Nenhum arquivo perdeu spread ({...x}). OK.')
        else {
            console.log('ARQUIVOS QUE PERDERAM SPREAD — confira cada um com `git diff`: o codemod pode ter apagado um {...props}:')
            for (const [f, n] of perdas) console.log(`- ${f}: ${n} → ${atual[f] ?? 0}`)
            process.exitCode = 1
        }
    }
    process.exit()
}

// ---------------------------------------------------------------- pacote-alvo

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ssplib-alvo-'))
let tgz = null
if (/\.tgz$/.test(ALVO)) {
    tgz = path.resolve(APP, ALVO)
    if (!fs.existsSync(tgz)) {
        console.error(`Tarball não encontrado: ${tgz}`)
        process.exit(2)
    }
} else {
    const saida = npm(['pack', `${LIB}@${ALVO}`, '--pack-destination', temp, '--silent'])
    if (saida) tgz = path.join(temp, saida.split('\n').pop())
}
let pkgAlvo = null
let changelogAlvo = null
if (tgz) {
    try {
        execFileSync('tar', ['-xzf', tgz, '-C', temp, 'package/package.json'], { stdio: 'ignore' })
        pkgAlvo = lerJson(path.join(temp, 'package', 'package.json'))
        try {
            execFileSync('tar', ['-xzf', tgz, '-C', temp, 'package/index.d.mts'], { stdio: 'ignore' })
        } catch {
            // versão antiga, sem .d.mts: usa a instalada
        }
        execFileSync('tar', ['-xzf', tgz, '-C', temp, 'package/CHANGELOG.md'], { stdio: 'ignore' })
        changelogAlvo = fs.readFileSync(path.join(temp, 'package', 'CHANGELOG.md'), 'utf8')
    } catch {
        // pacote antigo sem CHANGELOG: segue só com o package.json
    }
}

const atualLib = versaoInstalada(LIB) ?? lerJson(path.join(APP, 'package-lock.json'))?.packages?.[`node_modules/${LIB}`]?.version ?? null

// ---------------------------------------------------------------- relatório

const saida = []
const p = (s = '') => saida.push(s)

p(`# Diagnóstico — ${LIB} em ${pkgApp.name ?? path.basename(APP)}`)
p()
p(`- App: \`${APP}\``)
p(`- Declarada no app: \`${declaradas[LIB] ?? '(não declarada)'}\` · instalada: \`${atualLib ?? '(sem node_modules)'}\``)
p(`- Alvo: \`${ALVO}\` → ${pkgAlvo ? `\`${pkgAlvo.version}\`` : '**não resolvido** (sem rede? use --alvo <caminho .tgz>)'}`)

// Trecho do CHANGELOG entre a versão instalada e a alvo.
if (changelogAlvo && pkgAlvo) {
    const secoes = changelogAlvo.split(/^## /m).slice(1)
    const trecho = secoes.filter((s) => {
        const v = s.split('\n')[0].trim()
        return parseVersao(v) && comparar(v, pkgAlvo.version) <= 0 && (!atualLib || comparar(v, atualLib) > 0)
    })
    const arquivo = path.join(temp, 'changelog-trecho.md')
    fs.writeFileSync(arquivo, trecho.map((s) => `## ${s}`).join(''))
    if (SO_CHANGELOG) {
        console.log(trecho.map((s) => `## ${s}`).join(''))
        process.exit()
    }
    p(`- Versões no caminho (CHANGELOG): ${trecho.map((s) => `\`${s.split('\n')[0].trim()}\``).join(', ') || '(nenhuma)'}`)
    p(`- **Leia antes de mexer:** \`${arquivo}\` (seções "O que o app precisa fazer")`)
}
p()

// Node
p('## Node')
p()
const engineLib = pkgAlvo?.engines?.node
p(`- Local: \`${process.version}\`${engineLib ? ` · a lib pede \`${engineLib}\`` : ''}${engineLib && !satisfaz(process.version, engineLib) ? ' — **ABAIXO**' : ''}`)
const arquivosNode = fs.readdirSync(APP).filter((f) => /^Dockerfile/.test(f) || ['.nvmrc', '.node-version', '.gitlab-ci.yml'].includes(f))
for (const f of arquivosNode) {
    const texto = fs.readFileSync(path.join(APP, f), 'utf8')
    const majors = [...texto.matchAll(/node:(\d+)/g), ...(/^\.n/.test(f) ? [[null, texto.trim().replace(/^v/, '')]] : [])].map((m) => m[1])
    for (const v of new Set(majors)) {
        const baixo = engineLib && !satisfaz(`${parseVersao(v)?.maj ?? v}.99.99`, engineLib)
        p(`- \`${f}\`: node ${v}${baixo ? ' — **ABAIXO do que a lib pede**' : ''}`)
    }
}
p()

// Lockfiles: mais de um = o agente não sabe qual o build usa.
const locks = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb'].filter((f) => fs.existsSync(path.join(APP, f)))
if (locks.length > 1) {
    const usoNoBuild = fs
        .readdirSync(APP)
        .filter((f) => /^Dockerfile/.test(f) || f === '.gitlab-ci.yml')
        .flatMap((f) => [...fs.readFileSync(path.join(APP, f), 'utf8').matchAll(/^(?!\s*#).*\b(npm (?:ci|install)|yarn(?: install)?|pnpm (?:i|install))\b/gm)].map((m) => `\`${f}\`: \`${m[1]}\``))
    p('## Lockfiles')
    p()
    p(
        `O app tem ${locks.map((l) => `\`${l}\``).join(' e ')}. O npm 7+ reescreve o \`yarn.lock\` junto quando ele existe (visto no viva-flor), mas o \`pnpm-lock.yaml\`/\`bun.lock\` não. ${usoNoBuild.length ? `O build usa: ${[...new Set(usoNoBuild)].join(', ')}.` : 'Não achei qual o build usa.'} Confira no \`git status\` quais lockfiles mudaram e diga ao usuário na entrega.`,
    )
    p()
}

// Peers
if (pkgAlvo) {
    const peers = pkgAlvo.peerDependencies ?? {}
    p('## Peers da lib (a versão que roda é a do app)')
    p()
    p('| Pacote | Declarado no app | Instalado | Lib alvo pede | Situação |')
    p('|---|---|---|---|---|')
    const subir = []
    for (const [peer, faixa] of Object.entries(peers)) {
        const inst = versaoInstalada(peer)
        const decl = declaradas[peer]
        let situacao
        if (!decl) situacao = '**declarar no app**'
        else if (inst && satisfaz(inst, faixa)) situacao = 'ok'
        else if (!inst) situacao = satisfaz(decl.replace(/^[\^~]/, ''), faixa) ? 'ok (não instalado)' : '**subir**'
        else situacao = '**subir**'
        if (situacao !== 'ok') subir.push(peer)
        p(`| \`${peer}\` | ${decl ? `\`${decl}\`` : '—'} | ${inst ? `\`${inst}\`` : '—'} | \`${faixa}\` | ${situacao} |`)
    }
    p()

    // Pacotes que andam junto com uma peer.
    const alvoMajor = Object.fromEntries(Object.entries(peers).map(([k, v]) => [k, majorMaisAlto(v)]))
    const acompanhantes = []
    for (const [base, tipos] of [
        ['react', '@types/react'],
        ['react-dom', '@types/react-dom'],
    ]) {
        if (declaradas[tipos] && alvoMajor[base] && !satisfaz(versaoInstalada(tipos) ?? declaradas[tipos].replace(/^[\^~]/, ''), `^${alvoMajor[base]}.0.0`))
            acompanhantes.push({ pacote: tipos, spec: `${tipos}@^${alvoMajor[base]}`, motivo: `acompanha o ${base} ${alvoMajor[base]}` })
    }
    if (declaradas['eslint-config-next'] && alvoMajor.next) {
        const inst = versaoInstalada('eslint-config-next') ?? declaradas['eslint-config-next']
        if (!satisfaz(inst.replace(/^[\^~]/, ''), `^${alvoMajor.next}.0.0`))
            acompanhantes.push({ pacote: 'eslint-config-next', spec: `eslint-config-next@^${alvoMajor.next}`, motivo: 'mesmo major do next' })
    }

    // Família MUI: pacote @mui/* que não é peer precisa do major novo (ou sair, se o código não usa).
    // Componentes do lab que foram para o @mui/material no 7 (codemod v7.0.0/lab-removed-components).
    const SAIRAM_DO_LAB = new Set([
        'LoadingButton',
        'Alert',
        'AlertTitle',
        'Autocomplete',
        'AvatarGroup',
        'Pagination',
        'PaginationItem',
        'Rating',
        'Skeleton',
        'SpeedDial',
        'SpeedDialAction',
        'SpeedDialIcon',
        'ToggleButton',
        'ToggleButtonGroup',
        'useAutocomplete',
        'usePagination',
    ])
    const importsMui = new Map()
    for (const f of listarFontes())
        for (const [, { modulo, importado }] of mapearImports(fs.readFileSync(path.join(APP, f), 'utf8'))) {
            const pacote = /^(@mui\/[\w-]+)/.exec(modulo)?.[1]
            if (!pacote) continue
            if (!importsMui.has(pacote)) importsMui.set(pacote, new Set())
            importsMui.get(pacote).add(importado === 'default' ? modulo.split('/').pop() : importado)
        }
    const familiaMui = []
    const muiMajor = alvoMajor['@mui/material']
    for (const dep of Object.keys(declaradas)) {
        if (!dep.startsWith('@mui/') || peers[dep] || muiMajor == null) continue
        const inst = versaoInstalada(dep) ?? declaradas[dep].replace(/^[\^~]/, '')
        const usados = importsMui.get(dep)
        if (!usados) familiaMui.push({ dep, acao: 'remover', texto: `\`${dep}\` ${inst}: nenhum import no código → sai (\`npm uninstall\`)` })
        else if (dep === '@mui/lab' && [...usados].every((n) => SAIRAM_DO_LAB.has(n)))
            familiaMui.push({
                dep,
                acao: 'remover',
                texto: `\`${dep}\` ${inst}: o código só usa ${[...usados].map((n) => `\`${n}\``).join(', ')}, que foi para o \`@mui/material\` → sai (\`npm uninstall\`). Converta à mão: o codemod \`v7.0.0/lab-removed-components\` não converteu o \`LoadingButton\` nem no specto nem no viva-flor (\`LoadingButton\` → \`Button\` do \`@mui/material\` com \`loading\`/\`loadingPosition\`).`,
            })
        else if ((parseVersao(inst)?.maj ?? 0) < muiMajor) {
            const ultima = ultimaVersao(dep)
            familiaMui.push({
                dep,
                acao: 'subir',
                spec: ultima ? `${dep}@^${ultima}` : null,
                texto:
                    `\`${dep}\` ${inst}: usado no código (${[...usados].slice(0, 6).join(', ')}) e abaixo do MUI ${muiMajor} → subir${ultima ? ` (última: \`${ultima}\`)` : ''}.` +
                    (dep === '@mui/lab' ? ' O `@mui/lab` 5 declara `@mui/material >=5.15` e o npm aceita, mas quebra em runtime.' : '') +
                    (dep.startsWith('@mui/x-') ? ` Rode os codemods \`@mui/x-codemod\` de cada major atravessado (ver referência).` : ''),
            })
        }
    }
    if (familiaMui.length) {
        p('## Família MUI fora das peers')
        p()
        for (const f of familiaMui) p(`- ${f.texto}`)
        p()
    }
    // Dependências do app cujas peers não aceitam a stack nova.
    const versaoAlvoDe = {}
    for (const peer of Object.keys(peers)) {
        const inst = versaoInstalada(peer)
        versaoAlvoDe[peer] = inst && satisfaz(inst, peers[peer]) ? inst : (ultimaVersao(peer, alvoMajor[peer]) ?? (alvoMajor[peer] != null ? `${alvoMajor[peer]}.0.0` : null))
    }
    const conflitos = []
    for (const dep of Object.keys(declaradas)) {
        if (dep === LIB || peers[dep] || acompanhantes.some((a) => a.pacote === dep) || familiaMui.some((f) => f.dep === dep)) continue
        const pd = lerJson(path.join(APP, 'node_modules', dep, 'package.json'))?.peerDependencies
        if (!pd) continue
        const quebra = Object.entries(pd).filter(([peer, faixa]) => versaoAlvoDe[peer] && !satisfaz(versaoAlvoDe[peer], faixa))
        if (quebra.length === 0) continue
        const ultima = ultimaVersao(dep)
        if (ultima) {
            const pdUltima = npmView(`${dep}@${ultima}`, ['peerDependencies']) ?? {}
            const ok = Object.entries(pdUltima).every(([peer, faixa]) => !versaoAlvoDe[peer] || satisfaz(versaoAlvoDe[peer], faixa))
            conflitos.push({ dep, quebra, ultima, sugestao: ok ? `${dep}@^${ultima}` : null })
        } else conflitos.push({ dep, quebra, ultima: null, sugestao: null })
    }

    if (conflitos.length) {
        p('## Dependências do app que não aceitam a stack nova')
        p()
        for (const c of conflitos) {
            p(
                `- \`${c.dep}\` ${versaoInstalada(c.dep)}: peer ${c.quebra.map(([k, v]) => `\`${k} ${v}\``).join(', ')}. ` +
                    (c.sugestao
                        ? `A última (\`${c.ultima}\`) aceita → \`${c.sugestao}\`.`
                        : c.ultima
                          ? `**Nem a última (\`${c.ultima}\`) aceita** — o app usa mesmo? Tem substituto? Decidir antes de instalar.`
                          : 'Sem rede para consultar a última versão.'),
            )
        }
        p()
    }

    const specAlvoLib = tgz && /\.tgz$/.test(ALVO) ? path.relative(APP, tgz) : `${LIB}@${pkgAlvo.version}`
    const deps = [specAlvoLib]
    const devs = []
    for (const peer of subir) (ehDev(peer) ? devs : deps).push(alvoMajor[peer] != null ? `${peer}@^${alvoMajor[peer]}` : peer)
    for (const a of acompanhantes) (ehDev(a.pacote) ? devs : deps).push(a.spec)
    for (const c of conflitos) if (c.sugestao) (ehDev(c.dep) ? devs : deps).push(c.sugestao)
    for (const f of familiaMui) if (f.acao === 'subir' && f.spec) (ehDev(f.dep) ? devs : deps).push(f.spec)
    const remover = familiaMui.filter((f) => f.acao === 'remover').map((f) => f.dep)
    const nadaAInstalar = deps.length === 1 && devs.length === 0 && remover.length === 0 && atualLib && comparar(atualLib, pkgAlvo.version) === 0
    if (nadaAInstalar) {
        p('## Instalação')
        p()
        p(`Nada a instalar: a lib instalada já é a \`${pkgAlvo.version}\` e a stack atende às peers.`)
        p()
    } else {
        p('## Comandos de instalação propostos')
        p()
        p(
            'Rode na ordem e confira a lista antes. **Tudo o que vai subir sai primeiro** (a lib e as dependências de `dependencies` que trocam de major): senão o npm confere as peers novas contra as dependências antigas que continuam no lock e dá `ERESOLVE` acusando a lib nova (no specto, o `react-leaflet` 4 da `0.0.x`; no viva-flor, o `@react-spring` do `x-charts` 6, ambos pedindo React 18). **Nunca** `--force` nem `--legacy-peer-deps`: um `ERESOLVE` depois disso é conflito real.',
        )
        p()
        const nome = (spec) => spec.replace(/@[^@/]*$/, '')
        const sair = [
            LIB,
            ...remover,
            ...deps
                .slice(1)
                .map(nome)
                .filter((d) => pkgApp.dependencies?.[d]),
        ]
        p('```sh')
        p(`npm uninstall ${[...new Set(sair)].join(' ')}`)
        p(`npm install ${deps.join(' ')}`)
        if (devs.length) p(`npm install -D ${devs.join(' ')}`)
        p('```')
        if (acompanhantes.length) p(`\nAcompanhantes: ${acompanhantes.map((a) => `\`${a.pacote}\` (${a.motivo})`).join(', ')}.`)
        p()
    }
}

// ---------------------------------------------------------------- varredura do código

const SYSTEM_PROPS = new Set(
    (
        'm mt mr mb ml mx my p pt pr pb pl px py margin marginTop marginRight marginBottom marginLeft marginX marginY marginInline marginBlock ' +
        'padding paddingTop paddingRight paddingBottom paddingLeft paddingX paddingY paddingInline paddingBlock ' +
        'display displayPrint overflow textOverflow visibility whiteSpace flexBasis flexDirection flexWrap justifyContent alignItems alignContent order flex flexGrow flexShrink alignSelf justifyItems justifySelf ' +
        'gap rowGap columnGap gridColumn gridRow gridAutoFlow gridAutoColumns gridAutoRows gridTemplateColumns gridTemplateRows gridTemplateAreas gridArea ' +
        'bgcolor zIndex position top right bottom left boxShadow width maxWidth minWidth height maxHeight minHeight boxSizing ' +
        'fontFamily fontSize fontStyle fontWeight letterSpacing textTransform lineHeight textAlign typography ' +
        'border borderTop borderRight borderBottom borderLeft borderColor borderRadius'
    ).split(' '),
)
// Componentes de que o MUI 9 tirou as system props (codemod v9.0.0/system-props).
const COM_SYSTEM_PROPS = new Set(['Box', 'Stack', 'Typography', 'Grid', 'Link', 'DialogContentText'])
const PROPS_REMOVIDAS = [
    'InputProps',
    'inputProps',
    'InputLabelProps',
    'FormHelperTextProps',
    'SelectProps',
    'PaperProps',
    'PopperProps',
    'ListboxProps',
    'BackdropProps',
    'TransitionProps',
    'TransitionComponent',
    'componentsProps',
    'components',
    'MenuProps',
    'renderTags',
]

// Imports: nome local → módulo.
function mapearImports(fonte) {
    const mapa = new Map()
    for (const m of fonte.matchAll(/import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
        const [, , clausula, modulo] = m
        const padrao = /^([\w$]+)/.exec(clausula.trim())
        if (padrao && !clausula.trim().startsWith('{') && !clausula.trim().startsWith('*')) mapa.set(padrao[1], { modulo, importado: 'default' })
        const chaves = /\{([\s\S]*)\}/.exec(clausula)
        if (chaves)
            for (const item of chaves[1].split(',')) {
                const [orig, alias] = item
                    .replace(/^\s*type\s+/, '')
                    .split(/\s+as\s+/)
                    .map((s) => s.trim())
                if (orig) mapa.set(alias ?? orig, { modulo, importado: orig })
            }
    }
    return mapa
}

// Tags JSX com nome maiúsculo: { nome, atributos (texto), linha }.
function tagsJsx(fonte) {
    const tags = []
    const re = /<([A-Z][\w.]*)(?=[\s/>])/g
    let m
    while ((m = re.exec(fonte))) {
        let i = m.index + m[0].length
        let prof = 0
        let aspas = null
        for (; i < fonte.length; i++) {
            const c = fonte[i]
            if (aspas) {
                if (c === '\\') i++
                else if (c === aspas) aspas = null
                continue
            }
            if (c === '"' || c === "'" || c === '`') aspas = c
            else if (c === '{') prof++
            else if (c === '}') prof--
            else if (c === '>' && prof === 0) break
            else if (c === '<' && prof === 0) break // era genérico de TS, não tag
        }
        const attrs = fonte.slice(m.index + m[0].length, i)
        tags.push({ nome: m[1], attrs, linha: fonte.slice(0, m.index).split('\n').length, topo: nivelTopo(attrs) })
    }
    return tags
}
// Atributos no nível de cima da tag. Expressões `{…}` viram `{}` e spreads viram `{...}`.
function nivelTopo(attrs) {
    let buf = ''
    let aspas = null
    for (let i = 0; i < attrs.length; i++) {
        const c = attrs[i]
        if (aspas) {
            buf += c
            if (c === '\\') buf += attrs[++i] ?? ''
            else if (c === aspas) aspas = null
            continue
        }
        if (c === '"' || c === "'") {
            aspas = c
            buf += c
            continue
        }
        if (c !== '{') {
            buf += c
            continue
        }
        // pula até a chave que fecha, respeitando strings
        const spread = /^\{\s*\.\.\./.test(attrs.slice(i)) && !SPREAD_DE_BREAKPOINTS.test(attrs.slice(i))
        let prof = 0
        let asp = null
        for (; i < attrs.length; i++) {
            const d = attrs[i]
            if (asp) {
                if (d === '\\') i++
                else if (d === asp) asp = null
            } else if (d === '"' || d === "'" || d === '`') asp = d
            else if (d === '{') prof++
            else if (d === '}' && --prof === 0) break
        }
        buf += spread ? ' {...} ' : '{}'
    }
    const lista = []
    for (const m of buf.matchAll(/\{\.\.\.\}|([\w$-]+)(?:\s*=\s*("[^"]*"|'[^']*'|\{\}))?/g)) {
        if (m[0] === '{...}') lista.push({ spread: true })
        else lista.push({ nome: m[1], valor: m[2] ?? null })
    }
    return lista
}

const achados = new Map()
function achar(categoria, arquivo, linha, detalhe = '') {
    if (!achados.has(categoria)) achados.set(categoria, [])
    achados.get(categoria).push(`${arquivo}:${linha}${detalhe ? ` — ${detalhe}` : ''}`)
}
function linhaDe(fonte, indice) {
    return fonte.slice(0, indice).split('\n').length
}

const iconesDir = path.join(APP, 'node_modules', '@mui', 'icons-material')
const iconesMajor = parseVersao(versaoInstalada('@mui/icons-material') ?? '')?.maj ?? null
let usaKeycloak = false

for (const arquivo of listarFontes()) {
    const fonte = fs.readFileSync(path.join(APP, arquivo), 'utf8')
    const imports = mapearImports(fonte)
    const ehTeste = /\.(test|spec)\.[jt]sx?$/.test(arquivo) || /(^|\/)(__tests__|cypress|e2e|playwright)\//.test(arquivo)

    for (const { modulo, importado } of imports.values()) {
        if (modulo === '@mui/lab' || modulo.startsWith('@mui/lab/')) achar('lab', arquivo, linhaDe(fonte, fonte.indexOf(modulo)), `${importado === 'default' ? modulo.split('/').pop() : importado}`)
        if (/^@mui\/material(\/(Unstable_Grid2|Grid2|GridLegacy))?$/.test(modulo) && /^(Unstable_Grid2|Grid2|GridLegacy)$/.test(importado === 'default' ? modulo.split('/').pop() : importado))
            achar('grid-legado', arquivo, linhaDe(fonte, fonte.indexOf(modulo)), `import ${importado === 'default' ? modulo : importado}`)
        const icone = modulo === '@mui/icons-material' ? importado : modulo.startsWith('@mui/icons-material/') ? modulo.split('/').pop() : null
        if (icone && icone !== 'default') {
            const linha = linhaDe(fonte, fonte.indexOf(icone))
            if (iconesMajor != null && iconesMajor >= 9 && fs.existsSync(iconesDir) && !fs.existsSync(path.join(iconesDir, `${icone}.js`)))
                achar('icone-inexistente', arquivo, linha, `${icone} não existe no @mui/icons-material instalado`)
            else if ((iconesMajor == null || iconesMajor < 9) && /Outline$/.test(icone)) achar('icone-outline', arquivo, linha, icone)
        }
        if (modulo === LIB && importado === 'KeycloakAuthProvider') usaKeycloak = true
    }

    const ehMui = (nome) => {
        const raiz = nome.split('.')[0]
        const imp = imports.get(raiz)
        return imp && /^@mui\/material(\/|$)/.test(imp.modulo)
    }
    const nomeMui = (nome) => {
        const imp = imports.get(nome)
        if (!imp) return nome
        return imp.importado === 'default' ? imp.modulo.split('/').pop() : imp.importado
    }

    for (const tag of tagsJsx(fonte)) {
        const nomes = tag.topo.filter((a) => a.nome).map((a) => a.nome)
        const temSpread = tag.topo.some((a) => a.spread)
        const mui = ehMui(tag.nome)
        const real = mui ? nomeMui(tag.nome) : tag.nome
        if (mui && COM_SYSTEM_PROPS.has(real)) {
            const sys = nomes.filter((n) => SYSTEM_PROPS.has(n) && !(n === 'color' && /^(Typography|Link)$/.test(real)))
            if (sys.length) {
                achar('system-props', arquivo, tag.linha, `<${tag.nome}> ${sys.join(', ')}`)
                if (temSpread) achar('spread-em-risco', arquivo, tag.linha, `<${tag.nome}> tem {...} e system props (${sys.join(', ')})`)
            }
        }
        if (mui && real === 'Grid') {
            const legado = nomes.filter((n) => ['item', 'xs', 'sm', 'md', 'lg', 'xl', 'zeroMinWidth'].includes(n))
            if (legado.length) achar('grid-legado', arquivo, tag.linha, `<Grid ${legado.join(' ')}>`)
            // o codemod do Grid também reescreve o elemento e apaga o spread (visto no specto, 27/09)
            if (legado.length && temSpread && !achados.get('spread-em-risco')?.some((l) => l.startsWith(`${arquivo}:${tag.linha} `)))
                achar('spread-em-risco', arquivo, tag.linha, `<${tag.nome}> tem {...} e props de Grid legado (${legado.join(', ')})`)
            const dir = tag.topo.find((a) => a.nome === 'direction')
            if (dir?.valor && /column/.test(dir.valor)) achar('grid-direction-column', arquivo, tag.linha)
        }
        if (mui) {
            const cor = tag.topo.find((a) => a.nome === 'color' && a.valor && /^["'][\w]+\.[\w.]+["']$/.test(a.valor))
            if (cor) achar('cor-caminho-tema', arquivo, tag.linha, `<${tag.nome} color=${cor.valor}>`)
        }
        // Pickers do próprio app (x-date-pickers 8+): o campo é um grupo de seções, sem <input> de texto.
        const imp = imports.get(tag.nome.split('.')[0])
        if (imp && /^@mui\/x-date-pickers(\/|$)/.test(imp.modulo) && /Picker$/.test(imp.importado === 'default' ? imp.modulo.split('/').pop() : imp.importado)) {
            if (/\bvalue=\{[^}]*:\s*undefined\s*\}/.test(tag.attrs)) achar('picker', arquivo, tag.linha, `<${tag.nome}> value pode ser undefined (não controlado → controlado)`)
            if (/(^|[\s{,'"])input\s*:\s*\{|['"]&\s*input|div\s+input|MuiOutlinedInput-|MuiInputBase-input/.test(tag.attrs))
                achar('picker', arquivo, tag.linha, `<${tag.nome}> estilo mira o <input>/OutlinedInput, que não existem mais no campo`)
        }
        const removidas = nomes.filter((n) => PROPS_REMOVIDAS.includes(n))
        if (removidas.length) achar('props-removidas', arquivo, tag.linha, `<${tag.nome}> ${removidas.join(', ')}`)
    }

    // Já migrado quando o componente declara as larguras (`xs?: …`) ao lado do GridProps.
    if (/extends\s+(Omit<\s*)?GridProps\b|GridProps\[['"](xs|sm|md|lg|xl)['"]\]/.test(fonte) && !/\bxs\?\s*:/.test(fonte)) achar('gridprops', arquivo, linhaDe(fonte, fonte.search(/GridProps/)))
    for (const m of fonte.matchAll(/(?<![\w.])JSX\.(Element|IntrinsicElements|ElementClass)\b/g)) if (!imports.has('JSX')) achar('jsx-global', arquivo, linhaDe(fonte, m.index), m[0])
    for (const m of fonte.matchAll(/\buseRef(<[^()]*?>)?\(\s*\)/g)) achar('useref-sem-valor', arquivo, linhaDe(fonte, m.index), m[0])
    for (const m of fonte.matchAll(/\.(defaultProps|propTypes)\s*=/g)) achar('defaultprops', arquivo, linhaDe(fonte, m.index), m[1])
    for (const m of fonte.matchAll(/\b(ReactDOM\.render|ReactDOM\.hydrate|unmountComponentAtNode|findDOMNode|react-dom\/test-utils|element\.ref\b)/g))
        achar('react-removido', arquivo, linhaDe(fonte, m.index), m[1])
    for (const m of fonte.matchAll(/react-toastify\/(dist\/)?ReactToastify\.min\.css/g)) achar('toastify-css', arquivo, linhaDe(fonte, m.index), m[0])
    // `faded: { additionalRadius }` da série continua valendo; o que mudou é o `faded`/`highlighted` dentro do `highlightScope`.
    for (const m of fonte.matchAll(/highlightScope\s*:\s*\{[^}]*?\b(faded|highlighted)\s*:|\b(itemMarkWidth|itemMarkHeight|labelStyle)\s*:/g))
        if (imports.size && [...imports.values()].some((i) => i.modulo.startsWith('@mui/x-charts'))) achar('x-charts', arquivo, linhaDe(fonte, m.index), m[1] ?? m[2])
    if (ehTeste) for (const m of fonte.matchAll(/type=["']?email|getByPlaceholderText|\.MuiOutlinedInput-root|role=["']?checkbox/g)) achar('testes', arquivo, linhaDe(fonte, m.index), m[0])
}

// Cópias locais de componentes da lib: o app tem um componente com o nome de um export da lib (ou do
// par `Generic*`). A skill tenta trocar a cópia pelo componente da lib antes de corrigi-la.
function exportsDaLib() {
    const candidatos = [
        path.join(temp, 'package', 'index.d.mts'),
        path.join(APP, 'node_modules', LIB, 'index.d.mts'),
        path.join(APP, 'node_modules', LIB, 'index.d.ts'),
        path.join(APP, 'node_modules', LIB, 'dist', 'index.d.ts'),
    ]
    const arquivo = candidatos.find((c) => fs.existsSync(c))
    if (!arquivo) return new Set()
    const nomes = new Set()
    for (const bloco of fs.readFileSync(arquivo, 'utf8').matchAll(/export\s*\{([^}]*)\}/g))
        for (const item of bloco[1].split(',')) {
            const t = item.trim()
            if (!t || t.startsWith('type ')) continue
            nomes.add(
                t
                    .split(/\s+as\s+/)
                    .pop()
                    .trim(),
            )
        }
    return nomes
}
const libExports = exportsDaLib()
if (libExports.size) {
    const fontes = listarFontes().filter((f) => !/\.(test|spec|stories)\.[jt]sx?$/.test(f))
    const aliasArroba = fs.existsSync(path.join(APP, 'src')) && !fs.existsSync(path.join(APP, 'components')) ? 'src' : '.'
    const semExtensao = (f) => f.replace(/\.[jt]sx?$/, '').replace(/\/index$/, '')
    const importadores = new Map()
    for (const f of fontes)
        for (const m of fs.readFileSync(path.join(APP, f), 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)) {
            let alvo = null
            if (m[1].startsWith('.')) alvo = path.normalize(path.join(path.dirname(f), m[1]))
            else if (m[1].startsWith('@/')) alvo = path.normalize(path.join(aliasArroba, m[1].slice(2)))
            if (!alvo) continue
            alvo = semExtensao(alvo)
            if (!importadores.has(alvo)) importadores.set(alvo, new Set())
            importadores.get(alvo).add(f)
        }
    for (const f of fontes) {
        const fonte = fs.readFileSync(path.join(APP, f), 'utf8')
        const nomes = new Set([...fonte.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+([A-Z]\w*)/g)].map((m) => m[1]))
        for (const nome of nomes) {
            const iguais = [nome, `Generic${nome}`].filter((n) => libExports.has(n))
            if (!iguais.length) continue
            const quem = importadores.get(semExtensao(path.normalize(f))) ?? new Set()
            const rhf = /from\s+['"]react-hook-form['"]/.test(fonte) && /useFormContext|Controller/.test(fonte)
            const contexto =
                rhf && libExports.has(`Generic${nome}`)
                    ? `usa o RHF nativo → compare com o Generic${nome}`
                    : rhf
                      ? `usa o RHF nativo e a lib não tem Generic${nome}: o ${nome} da lib usa o FormContext dela`
                      : ''
            achar(
                'copia-da-lib',
                f,
                linhaDe(fonte, fonte.search(new RegExp(`\\b${nome}\\b`))),
                `${nome} ↔ lib: ${iguais.join(' / ')}${contexto ? ` (${contexto})` : ''}; ${quem.size ? `importado por ${quem.size} arquivo(s)` : '**sem uso no app → remover**'}`,
            )
        }
    }
}

// Checagens de configuração
// Desde a 1.0.0-rc.2 o ESM da lib sai em `.mjs`. Sem `transpilePackages`, o Next carrega a lib como módulo
// externo no SSR, com o import nativo do Node, e o build quebra (`ERR_MODULE_NOT_FOUND` em
// `dayjs/plugin/customParseFormat`; `next/image` vira objeto, erro #130). Visto no viva-flor em 30/09/2026.
const nextConfig = ['next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config.cjs'].find((f) => fs.existsSync(path.join(APP, f)))
if (nextConfig && !/transpilePackages[\s\S]{0,300}?['"]@ssplib\/react-components['"]/.test(fs.readFileSync(path.join(APP, nextConfig), 'utf8')))
    achar('transpile', nextConfig, 1, "falta `'@ssplib/react-components'` em `transpilePackages`")
if (usaKeycloak) {
    const html = path.join(APP, 'public', 'silent-check-sso.html')
    if (!fs.existsSync(html)) achar('keycloak', 'public/silent-check-sso.html', 1, 'não existe — o KeycloakAuthProvider precisa dele (conteúdo no README da lib)')
}
if (/\bnext lint\b/.test(JSON.stringify(pkgApp.scripts ?? {}))) achar('next16', 'package.json', 1, 'script usa `next lint`, removido no Next 16 (use `eslint .`)')
for (const f of ['middleware.ts', 'middleware.js', 'src/middleware.ts', 'src/middleware.js'])
    if (fs.existsSync(path.join(APP, f))) achar('next16', f, 1, '`middleware` virou `proxy` no Next 16 (ainda funciona, com aviso)')

const EXPLICACAO = {
    transpile: [
        'ALTO — obrigatório desde a 1.0.0-rc.2',
        "Adicione `'@ssplib/react-components'` ao `transpilePackages` do `next.config`. Sem isso o `next build` quebra no SSR (`ERR_MODULE_NOT_FOUND`/`Failed to load external module @ssplib/react-components`). Corrige no app, não na lib.",
    ],
    'spread-em-risco': [
        'ALTO — antes dos codemods',
        'Os codemods do MUI (`v9.0.0/system-props`, `v7.0.0/grid-props`) reescrevem estes elementos e APAGAM o `{...props}`, sem erro. Rode `--salvar-spreads` antes e `--comparar-spreads` depois, e reponha o spread à mão.',
    ],
    'system-props': ['MUI 9', 'System props em Box/Stack/Typography/Grid/Link: o codemod `v9.0.0/system-props` move para `sx`. Depois do codemod esta lista tem que estar vazia.'],
    'grid-legado': ['MUI 7+', '`item`/`xs`/`md` no Grid e Grid2/Unstable_Grid2: codemod `v7.0.0/grid-props` → `size={{ xs, md }}`. Não troque containers com campos da lib por `GridLegacy`.'],
    'grid-direction-column': ['MUI 9', '`<Grid direction="column">` não existe mais: use `<Stack>`.'],
    gridprops: ['MUI 7+', '`extends GridProps` com `xs`/`md`: o GridProps não tem mais essas props. Declare-as no componente e converta para `size`; confira se o `{...props}` sobreviveu ao codemod.'],
    'cor-caminho-tema': ['MUI 9 — silencioso', '`color="text.primary"` (caminho do tema) vira preto no MUI 9. Use nome da paleta (`textPrimary`, `primary`) ou `sx={{ color: \'text.primary\' }}`.'],
    'props-removidas': [
        'MUI 9',
        'Props que o MUI 9 removeu (`InputProps`, `inputProps`, `PaperProps`…): codemod `deprecations/all`; o que sobrar vai para `slotProps` (`slotProps.input`, `.htmlInput`, `.paper`…). O `Input` da lib também não aceita mais.',
    ],
    lab: [
        'MUI 9',
        '`@mui/lab`: `LoadingButton` → `Button` do `@mui/material` com `loading`/`loadingPosition`. Se não sobrar nada do lab, `npm uninstall @mui/lab`. Se sobrar (TabContext, Timeline), instale o `@mui/lab` do major do MUI.',
    ],
    'icone-outline': ['icons 9', 'Ícones `*Outline` saíram no icons-material 9: use `*OutlineOutlined` (mesmo desenho). A sugestão do TypeScript (`*Outlined`) é outro ícone.'],
    'icone-inexistente': ['icons 9', 'O ícone não existe na versão instalada. Para `*Outline`, o equivalente é `*OutlineOutlined`.'],
    'jsx-global': ['React 19', "O namespace `JSX` global saiu: `React.JSX.Element` ou `import type { JSX } from 'react'`."],
    'useref-sem-valor': ['React 19', '`useRef()` exige valor inicial: `useRef<T>(null)` / `useRef<T | undefined>(undefined)`.'],
    defaultprops: ['React 19', '`defaultProps`/`propTypes` de componente de função deixam de valer: use default nos parâmetros.'],
    'react-removido': ['React 19', 'API removida no React 19 (`ReactDOM.render`, `findDOMNode`, `react-dom/test-utils`, `element.ref`).'],
    'toastify-css': ['toastify 11', '`ReactToastify.min.css` não é mais exportado: remova o import (o 11 injeta o CSS).'],
    picker: [
        'pickers 8+ — silencioso',
        "Pickers do próprio app. Se o arquivo também aparece em `copia-da-lib`, tente antes trocá-lo pelo componente da lib. `value={x ? dayjs(x) : undefined}` faz o picker nascer não controlado e o MUI avisa no console quando o valor chega: use `null`. Estilo em `input`/`div input`/`.MuiOutlinedInput-*` não pega mais (o campo é um grupo de seções): use `'& .MuiPickersInputBase-root': { paddingLeft: 2 }` e `'& .MuiPickersInputBase-sectionsContainer': { paddingY: 1.05 }`, como a lib, senão o campo fica mais alto que os outros.",
    ],
    'copia-da-lib': [
        'cópia local — tentar trocar pela lib',
        'O app tem sua própria versão de um componente da lib. Tente trocar pela da lib **antes** de corrigir a cópia (checklist de contrato na seção "Cópias locais" do SKILL.md). Troque só se o contrato for equivalente; senão corrija a cópia e relate a divergência. Cópia sem uso sai.',
    ],
    'x-charts': ['x-charts 9', '`highlightScope: { faded, highlighted }` → `{ fade, highlight }`; `itemMarkWidth`/`itemMarkHeight`/`labelStyle` da legenda saíram (use o `sx` da legenda).'],
    testes: ['testes', 'Seletores que mudam: pickers são `group` de `spinbutton`, `Switch` é `role="switch"`, `Input type=email` renderiza `type=text`; ache campos da lib por papel + `title`.'],
    keycloak: ['config', ''],
    next16: ['Next 16', ''],
}

p('## Achados no código')
p()
if (achados.size === 0) p('Nenhum padrão conhecido encontrado.')
for (const [cat, [rotulo, texto]] of Object.entries(EXPLICACAO)) {
    const lista = achados.get(cat)
    if (!lista) continue
    p(`### ${cat} (${lista.length}) — ${rotulo}`)
    if (texto) p(texto)
    p()
    for (const l of lista.slice(0, 40)) p(`- ${l}`)
    if (lista.length > 40) p(`- … e mais ${lista.length - 40}`)
    p()
}

console.log(saida.join('\n'))
