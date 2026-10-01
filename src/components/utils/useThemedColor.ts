import { Palette, useTheme } from '@mui/material'

// Cores neutras (fundo, texto, borda) que os componentes sempre tiveram fixas. No tema claro
// devolve exatamente o valor fixo de sempre, então nenhum sistema muda no claro; no escuro troca
// pelo equivalente da paleta do tema.
//
//   const color = useThemedColor()
//   <Box bgcolor={color('white', (p) => p.background.paper)} />
export function useThemedColor() {
    const theme = useTheme()
    const dark = theme.palette.mode === 'dark'
    return (light: string, onDark: (palette: Palette) => string) => (dark ? onDark(theme.palette) : light)
}
