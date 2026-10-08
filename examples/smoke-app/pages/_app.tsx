import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SspComponentsProvider } from '@ssplib/react-components'
import 'react-toastify/dist/ReactToastify.css'

/**
 * Tema deliberadamente fora do padrão do MUI.
 *
 * É o detector de MUI duplicado: se houver duas cópias de @mui/material na árvore,
 * os componentes da lib leem o tema *default* e ficam azuis, em vez de usarem
 * este roxo. Nenhum erro é emitido — só a cor muda. Ver UPGRADE_PLAN.md 2.2/3.
 */
const theme = createTheme({
    palette: {
        primary: { main: '#6d28d9' },
        secondary: { main: '#be123c' },
    },
    shape: { borderRadius: 10 },
})

/**
 * O tema escuro como o MUI 9 recomenda (`colorSchemes` + `cssVariables`), só na página
 * `/tema-escuro`: o `verificar-tema-escuro.cjs` confere no HTML do `next build` que o CSS do escuro
 * dos componentes da lib sai já no SSR (UPGRADE_PLAN.md seção 17).
 */
const temaComEsquemas = createTheme({
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: { light: true, dark: true },
})

export default function App({ Component, pageProps }: AppProps) {
    const escuro = useRouter().pathname === '/tema-escuro'
    return (
        <ThemeProvider theme={escuro ? temaComEsquemas : theme} {...(escuro ? { defaultMode: 'dark' as const } : {})}>
            <CssBaseline />
            <SspComponentsProvider>
                <Component {...pageProps} />
            </SspComponentsProvider>
        </ThemeProvider>
    )
}
