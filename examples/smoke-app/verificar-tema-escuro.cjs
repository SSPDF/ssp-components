/**
 * Confere no HTML que o `next build` gerou para `/tema-escuro` que os componentes da lib mandam o
 * CSS do tema escuro já no SSR: regras sob `.dark` (o seletor do tema da página) com as variáveis
 * da paleta. Roda pelo `scripts/smoke-app.sh`, depois do `next build`, contra o pacote empacotado.
 *
 * É o que garante que o app em tema escuro não "pisca" claro na hidratação: se a lib decidisse a
 * cor no JS (pelo `palette.mode`), o servidor mandaria só o claro. UPGRADE_PLAN.md seção 17.
 */
const fs = require('fs')
const path = require('path')

const arquivo = path.join(__dirname, '.next', 'server', 'pages', 'tema-escuro.html')
if (!fs.existsSync(arquivo)) {
    console.error(`${arquivo} não existe: o next build não pré-renderizou /tema-escuro.`)
    process.exit(1)
}
const html = fs.readFileSync(arquivo, 'utf8')
const esperado = [
    ['fundo do campo (Input)', /\*:where\(\.dark\) \.css-[\w-]+\{background-color:var\(--mui-palette-background-paper\);\}/],
    ['borda do campo (Input)', /\*:where\(\.dark\) \.css-[\w-]+ \.MuiOutlinedInput-root fieldset\{border-color:var\(--mui-palette-divider\);\}/],
    ['variáveis do esquema escuro', /--mui-palette-background-paper:#121212/],
]
const faltando = esperado.filter(([, re]) => !re.test(html)).map(([nome]) => nome)
if (faltando.length) {
    console.error(`HTML de /tema-escuro sem: ${faltando.join(', ')}.`)
    process.exit(1)
}
console.log('ok')
