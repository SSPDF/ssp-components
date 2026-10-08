import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, alpha, createTheme } from '@mui/material'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FormProvider from '../providers/FormProvider'
import Input from '../form/input/Input'
import CheckBox from '../form/checkbox/CheckBox'
import { noEscuro, paleta } from './temaEscuro'

/**
 * O tema escuro da lib passa por `theme.applyStyles('dark', …)` (`noEscuro`), que se comporta
 * diferente em cada jeito de o app montar o tema. Aqui ficam os quatro: só claro (não muda nada),
 * `palette.mode: 'dark'`, `colorSchemes` sem variáveis CSS e `colorSchemes` + `cssVariables` com
 * cada seletor (classe, atributo, media query). O visual de cada componente no escuro fica nos
 * snapshots (`npm run snapshots`, passada `escuro`, com a verificação de legibilidade).
 */

const estilo = (p: ReturnType<typeof paleta>) => ({ backgroundColor: p.background.paper, color: p.text.primary })

describe('noEscuro', () => {
    it('tema só claro (o padrão): não acrescenta nada, o claro fica como sempre foi', () => {
        expect(noEscuro(createTheme(), estilo)).toEqual({})
        expect(noEscuro(createTheme({ cssVariables: true }), estilo)).toEqual({})
    })

    it('palette.mode dark: os estilos direto, com os valores da paleta escura', () => {
        expect(noEscuro(createTheme({ palette: { mode: 'dark' } }), estilo)).toEqual({ backgroundColor: '#121212', color: '#fff' })
    })

    it('colorSchemes sem variáveis CSS: o tema escuro gerado também recebe os estilos direto', () => {
        const tema = createTheme({ colorSchemes: { light: true, dark: true }, defaultColorScheme: 'dark' })
        expect(tema.vars).toBeUndefined()
        expect(noEscuro(tema, estilo)).toEqual({ backgroundColor: '#121212', color: '#fff' })
    })

    it('variáveis CSS com seletor de classe: regra sob .dark, com as variáveis (e não os valores do claro)', () => {
        const tema = createTheme({ cssVariables: { colorSchemeSelector: 'class' }, colorSchemes: { light: true, dark: true } })
        expect(tema.palette.mode).toBe('light') // por isso `palette.mode` não serve para decidir a cor
        // (o segundo argumento do var() é só o fallback, para quando a variável não existe)
        expect(noEscuro(tema, estilo)).toEqual({
            '*:where(.dark) &': { backgroundColor: 'var(--mui-palette-background-paper, #fff)', color: 'var(--mui-palette-text-primary, rgba(0, 0, 0, 0.87))' },
        })
    })

    it('variáveis CSS com seletor de atributo', () => {
        const tema = createTheme({ cssVariables: { colorSchemeSelector: 'data' }, colorSchemes: { light: true, dark: true } })
        expect(Object.keys(noEscuro(tema, estilo))).toEqual(['*:where([data-dark]) &'])
    })

    it('variáveis CSS sem seletor (media query, o padrão do MUI)', () => {
        const tema = createTheme({ cssVariables: true, colorSchemes: { light: true, dark: true } })
        expect(Object.keys(noEscuro(tema, estilo))).toEqual(['@media (prefers-color-scheme: dark)'])
    })

    it('theme.alpha com variáveis CSS usa o canal da variável (a transparência acompanha o esquema)', () => {
        const tema = createTheme({ cssVariables: { colorSchemeSelector: 'class' }, colorSchemes: { light: true, dark: true } })
        expect(tema.alpha(paleta(tema).primary.main, 0.06)).toBe('rgba(var(--mui-palette-primary-mainChannel) / 0.06)')
    })

    it('theme.alpha com variáveis CSS não aceita cor literal (por isso a lib usa o alpha do @mui/material para cor fixa)', () => {
        const tema = createTheme({ cssVariables: { colorSchemeSelector: 'class' }, colorSchemes: { light: true, dark: true } })
        expect(tema.alpha('#01BA35', 0.16)).toBe('rgba(#01BA35 / 0.16)') // CSS inválido: o browser descarta a regra
        expect(alpha('#01BA35', 0.16)).toBe('rgba(1, 186, 53, 0.16)')
    })
})

let contador = 0

/**
 * Renderiza com um cache do Emotion próprio, que escreve num `<div>` só deste teste: o CSS de um
 * teste não vaza para o outro (o cache padrão é um só para o arquivo inteiro).
 */
const renderizar = (tema: ReturnType<typeof createTheme> | null) => {
    const destino = document.createElement('div')
    document.head.appendChild(destino)
    const cache = createCache({ key: `teste${'abcdefghij'[++contador]}`, container: destino })
    const campos = (
        <FormProvider onSubmit={() => {}}>
            <Input name='nome' title='Nome' />
            <CheckBox name='aceite' title='Li e aceito' />
        </FormProvider>
    )
    const r = render(<CacheProvider value={cache}>{tema ? <ThemeProvider theme={tema}>{campos}</ThemeProvider> : campos}</CacheProvider>)
    return { ...r, css: () => [...destino.querySelectorAll('style')].map((s) => s.textContent).join('\n') }
}

describe('campos no tema do app', () => {
    it('sem tema: as cores fixas de sempre e nenhuma regra de escuro', () => {
        const css = renderizar(null).css()
        expect(css).toContain('background-color:white')
        expect(css).toContain('border-color:#E0E0E0')
        expect(css).not.toMatch(/\.dark|prefers-color-scheme|--mui-palette/)
    })

    it('palette.mode dark: o fundo do campo sai escuro (computado, não só no CSS)', () => {
        const { getByRole } = renderizar(createTheme({ palette: { mode: 'dark' } }))
        const raiz = getByRole('textbox', { name: 'Nome' }).closest('.MuiTextField-root')!
        expect(getComputedStyle(raiz).backgroundColor).toBe('rgb(18, 18, 18)')
    })

    it('variáveis CSS: o escuro sai como regra sob .dark com as variáveis do tema', () => {
        const css = renderizar(createTheme({ cssVariables: { colorSchemeSelector: 'class' }, colorSchemes: { light: true, dark: true } })).css()
        // o claro continua o mesmo...
        expect(css).toContain('background-color:white')
        // ...e o escuro vem por seletor, com as variáveis (a borda do campo, o fundo e o cartão do CheckBox)
        expect(css).toMatch(/\*:where\(\.dark\) \.[\w-]+\{background-color:var\(--mui-palette-background-paper\);\}/)
        expect(css).toMatch(/\*:where\(\.dark\) \.[\w-]+ \.MuiOutlinedInput-root fieldset\{border-color:var\(--mui-palette-divider\);\}/)
        expect(css).toContain('border-color:var(--mui-palette-divider);background-color:var(--mui-palette-background-paper);')
        // O hover escuro tem a mesma especificidade do foco (.Mui-focused): o foco só ganha por vir
        // depois. É por isso que `bordaDoCampo` vai antes do `&.Mui-focused fieldset` no objeto.
        const hoverEscuro = css.search(/\*:where\(\.dark\) \.[\w-]+ \.MuiOutlinedInput-root:hover fieldset\{border-color:var\(--mui-palette-action-disabled\);\}/)
        const foco = css.search(/\.[\w-]+ \.MuiOutlinedInput-root\.Mui-focused fieldset\{border-color:var\(--mui-palette-primary-main\)/)
        expect(hoverEscuro).toBeGreaterThan(-1)
        expect(foco).toBeGreaterThan(hoverEscuro)
    })
})
