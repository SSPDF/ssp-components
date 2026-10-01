import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { AppProps } from 'next/app'
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

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SspComponentsProvider>
                <Component {...pageProps} />
            </SspComponentsProvider>
        </ThemeProvider>
    )
}
