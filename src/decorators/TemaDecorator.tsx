import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { Decorator } from '@storybook/nextjs'

/**
 * Tema do app em que a story roda, escolhido pelo global `tema` (barra do Storybook, ou
 * `&globals=tema:escuro` na URL). `claro` não envolve nada: a story roda no tema padrão do MUI,
 * como sempre rodou, e os snapshots claros não mudam.
 *
 * `escuro` é o tema escuro como o MUI 9 recomenda montar num app: `colorSchemes` com
 * `cssVariables` e seletor de classe, o modo ativo vindo do `ThemeProvider` (aqui fixo em `dark`,
 * sem guardar no localStorage) e o `CssBaseline` pintando o fundo e o texto do `body`, como nos
 * apps. As cores mudam por variável CSS sob `.dark` no `<html>`; `theme.palette.mode` continua
 * `light`. É o cenário que pega um componente que decide a cor por `palette.mode`.
 *
 * Os outros dois jeitos de ter tema escuro (`palette.mode: 'dark'` e `colorSchemes` sem variáveis
 * CSS) estão nas stories de `Tema escuro`, que têm tema próprio (tag `tema-proprio`).
 */
export const temaComEsquemas = createTheme({
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: { light: true, dark: true },
})

export const TemaDecorator: Decorator = (Story, { globals, tags }) => {
    if (globals.tema !== 'escuro' || tags.includes('tema-proprio')) return <Story />
    return (
        <ThemeProvider theme={temaComEsquemas} defaultMode='dark' storageManager={null} disableTransitionOnChange>
            <CssBaseline />
            <Story />
        </ThemeProvider>
    )
}
