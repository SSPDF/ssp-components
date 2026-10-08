/**
 * Verificação de legibilidade de uma story já renderizada, feita no browser (`page.evaluate`).
 *
 * Os snapshots comparam com o baseline, mas um baseline gravado com texto sumindo passa a ser o
 * "certo". Aqui a regra é absoluta: num tema escuro, o texto que herda a cor clara do tema e cai
 * num fundo branco fixo some, e é isso que este script pega.
 *
 * - **Contraste**: cada texto visível (nó de texto ou valor de campo) e cada ícone SVG contra o
 *   fundo efetivo (os `background-color` dos ancestrais compostos com a transparência de cada um,
 *   e a `opacity` acumulada no texto). Falha abaixo de `minimo` (3:1, o mínimo do WCAG para texto
 *   grande e para elementos não textuais: o objetivo é pegar texto ilegível, não auditar o design).
 *   Elementos desabilitados ficam de fora (o WCAG também os isenta).
 * - **Superfície clara** (só com `superficies: true`, no tema escuro): elemento com fundo próprio
 *   opaco, claro e neutro (sem cor) de pelo menos 20×20 px. É o `bgcolor: 'white'` esquecido, que
 *   não some com o texto quando o texto também é fixo, mas fica um bloco branco na tela escura.
 *   Fundos com cor (status, botões, avisos) não contam.
 *
 * O runner roda também no claro e descarta do escuro o que já é igual no claro (mesmo elemento, texto
 * e cores): é design fixo, que não depende do tema (um botão verde com texto branco, por exemplo).
 * O que sobra é o que o escuro piorou. `chaveDoProblema` é a identidade usada nessa comparação.
 *
 * A função precisa ser autocontida: o Playwright serializa só o corpo dela para o browser.
 */
export function verificarLegibilidade({ minimo = 3, superficies = false } = {}) {
    const lerCor = (css) => {
        if (!css || css === 'transparent' || css === 'none') return null
        let m = css.match(/^rgba?\(([^)]+)\)$/)
        if (m) {
            const p = m[1]
                .split(/[\s,/]+/)
                .filter(Boolean)
                .map(parseFloat)
            return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
        }
        m = css.match(/^color\(srgb ([^)]+)\)$/)
        if (m) {
            const p = m[1]
                .split(/[\s/]+/)
                .filter(Boolean)
                .map(parseFloat)
            return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 }
        }
        return undefined // formato que não sabemos ler: o elemento é ignorado
    }
    const compor = (cima, baixo) => {
        const a = cima.a + baixo.a * (1 - cima.a)
        if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
        const canal = (c) => (cima[c] * cima.a + baixo[c] * baixo.a * (1 - cima.a)) / a
        return { r: canal('r'), g: canal('g'), b: canal('b'), a }
    }
    const luminancia = ({ r, g, b }) => {
        const lin = (c) => {
            c /= 255
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    }
    const razao = (a, b) => {
        const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
        return (l1 + 0.05) / (l2 + 0.05)
    }
    const hex = ({ r, g, b }) => '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')

    const fundo = (el) => {
        const cadeia = []
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) cadeia.push(e)
        // A tela do browser, embaixo de tudo: branca, ou escura quando a página declara `color-scheme: dark`.
        const esquema = getComputedStyle(document.documentElement).colorScheme
        let cor = esquema.includes('dark') ? { r: 18, g: 18, b: 18, a: 1 } : { r: 255, g: 255, b: 255, a: 1 }
        for (const e of cadeia.reverse()) {
            const bg = lerCor(getComputedStyle(e).backgroundColor)
            if (bg && bg.a > 0) cor = compor(bg, cor)
        }
        return cor
    }
    const opacidade = (el) => {
        let o = 1
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity)
        return o
    }
    const visivel = (el) => {
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false
        const r = el.getBoundingClientRect()
        return r.width > 1 && r.height > 1
    }
    const desabilitado = (el) => !!el.closest(':disabled, [aria-disabled="true"], .Mui-disabled')
    // A UI do próprio Storybook (tela de erro, de carregamento, docs). Não dá para excluir por
    // classe `sb-*`: o próprio `<body>` do iframe tem `sb-main-padded`. As escondidas já saem
    // pela visibilidade; estas aqui por garantia.
    const doStorybook = (el) => !!el.closest('.sb-wrapper, .sb-errordisplay, .sb-preparing-story, .sb-preparing-docs, .sb-nopreview, #storybook-docs')
    const descrever = (el) => {
        const classe = [...el.classList].find((c) => c.startsWith('Mui') && !c.startsWith('MuiTypography-body')) ?? el.classList[0] ?? ''
        return `<${el.tagName.toLowerCase()}${classe ? '.' + classe : ''}>`
    }

    const problemas = new Map()
    const anotar = (tipo, el, texto, detalhe) => {
        const chave = `${tipo}|${descrever(el)}|${detalhe}`
        if (!problemas.has(chave)) problemas.set(chave, { tipo, elemento: descrever(el), texto: texto.slice(0, 40), detalhe })
    }
    const conferir = (el, texto, corCss) => {
        const cor = lerCor(corCss)
        if (!cor) return
        const bg = fundo(el)
        const frente = compor({ ...cor, a: cor.a * opacidade(el) }, bg)
        const r = razao(frente, bg)
        if (r < minimo) anotar('contraste', el, texto, `${hex(frente)} sobre ${hex(bg)} = ${r.toFixed(2)}:1`)
    }

    // Textos
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const texto = n.textContent.trim()
        const el = n.parentElement
        if (!texto || !el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue
        if (doStorybook(el) || desabilitado(el) || !visivel(el)) continue
        conferir(el, texto, getComputedStyle(el).color)
    }
    // Valores digitados nos campos
    for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea')) {
        if (!el.value || doStorybook(el) || desabilitado(el) || !visivel(el)) continue
        conferir(el, el.value, getComputedStyle(el).color)
    }
    // Ícones do MUI (`fill: currentColor`, ou o `fill` que o sx põe). SVG avulso não: o `fill`
    // computado de um SVG sem fill é preto, e o do CircularProgress é só o traço.
    for (const el of document.querySelectorAll('svg.MuiSvgIcon-root')) {
        if (doStorybook(el) || desabilitado(el) || !visivel(el) || el.closest('.leaflet-container')) continue
        conferir(el, el.dataset.testid ?? 'ícone', getComputedStyle(el).fill)
    }
    // Superfícies claras no escuro
    if (superficies) {
        for (const el of document.body.querySelectorAll('*')) {
            // O polegar do Switch é cinza claro no escuro por design do próprio MUI (grey[300]).
            // O ripple do clique (some sozinho) também não conta.
            if (doStorybook(el) || el.closest('.leaflet-container, .MuiTouchRipple-root') || el.classList.contains('MuiSwitch-thumb') || !visivel(el)) continue
            const bg = lerCor(getComputedStyle(el).backgroundColor)
            if (!bg || bg.a < 1) continue
            const r = el.getBoundingClientRect()
            if (r.width < 20 || r.height < 20) continue
            const max = Math.max(bg.r, bg.g, bg.b)
            const saturacao = max === 0 ? 0 : (max - Math.min(bg.r, bg.g, bg.b)) / max
            if (luminancia(bg) > 0.6 && saturacao < 0.15) anotar('superfície clara', el, el.textContent.trim(), `fundo ${hex(bg)}`)
        }
    }
    return [...problemas.values()]
}

/** Identidade de um problema, para comparar o escuro com o claro da mesma story. */
export const chaveDoProblema = (p) => `${p.tipo}|${p.elemento}|${p.texto}|${p.detalhe}`
