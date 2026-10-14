/**
 * Mantém o `llms.txt` (publicado no pacote, para os agentes dos apps) de acordo com o que a lib
 * suporta e testa. Falha se:
 *   - um arquivo local citado (AGENTS.md, README.md…) não existe;
 *   - uma versão do MUI linkada (llms.mui.com/<pacote>/<versão>/…) está fora das peers do
 *     lib-package.json, ou algum major das peers ficou sem link;
 *   - o link do major instalado nas devDependencies (o que o Storybook, os testes e os snapshots
 *     usam) não aponta exatamente para a versão instalada;
 *   - a versão do `@mui/mcp` citada difere da do `.mcp.json`.
 *
 * Não acessa a rede. Para conferir também que cada link responde, rode com `--rede`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8')
const lib = JSON.parse(fs.readFileSync(path.join(root, 'lib-package.json'), 'utf8'))
const erros = []

// Pacote do llms.mui.com → pacote npm.
const PACOTES = { 'material-ui': '@mui/material', 'x-date-pickers': '@mui/x-date-pickers' }

const links = [...llms.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1])

for (const l of links.filter((l) => !/^https?:/.test(l))) {
    if (!fs.existsSync(path.join(root, l))) erros.push(`arquivo citado não existe: ${l}`)
}

const versoesLinkadas = {}
for (const l of links) {
    const m = l.match(/^https:\/\/llms\.mui\.com\/([a-z-]+)\/(\d+)\.(\d+)\.(\d+)\//)
    if (!m) continue
    const pacote = PACOTES[m[1]]
    if (!pacote) {
        erros.push(`pacote do llms.mui.com sem mapeamento em PACOTES: ${m[1]}`)
        continue
    }
    ;(versoesLinkadas[pacote] ??= new Set()).add(`${m[2]}.${m[3]}.${m[4]}`)
}

for (const [pacote, versoes] of Object.entries(versoesLinkadas)) {
    const faixa = lib.peerDependencies[pacote]
    if (!faixa) {
        erros.push(`${pacote} está no llms.txt mas não nas peers`)
        continue
    }
    const majoresDaPeer = [...faixa.matchAll(/\^(\d+)\./g)].map((m) => m[1])
    const majoresLinkados = new Set([...versoes].map((v) => v.split('.')[0]))
    for (const v of versoes) if (!majoresDaPeer.includes(v.split('.')[0])) erros.push(`${pacote}@${v} está no llms.txt mas fora da peer (${faixa})`)
    for (const maj of majoresDaPeer) if (!majoresLinkados.has(maj)) erros.push(`${pacote}: o major ${maj} da peer (${faixa}) não tem link no llms.txt`)

    const instalado = JSON.parse(fs.readFileSync(path.join(root, 'node_modules', pacote, 'package.json'), 'utf8')).version
    const doMesmoMajor = [...versoes].filter((v) => v.split('.')[0] === instalado.split('.')[0])
    if (doMesmoMajor.length && !doMesmoMajor.includes(instalado)) {
        erros.push(`${pacote}: o llms.txt aponta para ${doMesmoMajor.join(', ')}, mas a versão instalada (a testada) é ${instalado}`)
    }
}
for (const pacote of Object.values(PACOTES)) if (!versoesLinkadas[pacote]) erros.push(`${pacote} (peer) sem nenhum link no llms.txt`)

const mcp = JSON.parse(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8'))
const versaoMcp = mcp.mcpServers?.['mui-mcp']?.args?.find((a) => a.startsWith('@mui/mcp@'))
for (const citada of llms.match(/@mui\/mcp@[0-9.]+/g) ?? []) {
    if (citada !== versaoMcp) erros.push(`o llms.txt cita ${citada}, mas o .mcp.json usa ${versaoMcp}`)
}

if (process.argv.includes('--rede')) {
    for (const l of links.filter((l) => /^https?:/.test(l))) {
        const res = await fetch(l, { method: 'GET', redirect: 'follow' }).catch((e) => ({ status: e.message }))
        if (res.status !== 200) erros.push(`link não respondeu 200 (${res.status}): ${l}`)
    }
}

if (erros.length) {
    console.error(`llms.txt desatualizado:\n  ${erros.join('\n  ')}`)
    process.exit(1)
}
console.log(`llms.txt em dia (${links.length} links${process.argv.includes('--rede') ? ', todos respondendo' : ''}).`)
