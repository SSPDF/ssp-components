import type { CSSObject, Theme } from '@mui/material'

/**
 * Tema escuro do app, do jeito que o MUI 9 recomenda (customization/dark-mode, "Styling in dark
 * mode"): a cor do claro fica no estilo base, e a do escuro entra por `theme.applyStyles('dark', …)`.
 *
 * Por que não `theme.palette.mode === 'dark' ? … : …`: com `cssVariables` + `colorSchemes` (o jeito
 * recomendado de ter claro e escuro num app), o modo troca por classe/atributo/media query no
 * `<html>`, sem re-render, e `palette.mode` continua `'light'`. O `applyStyles` funciona nos três
 * jeitos de ter tema escuro:
 *
 * - `palette: { mode: 'dark' }`: devolve os estilos direto (o tema já é o escuro);
 * - `colorSchemes` sem variáveis CSS: idem, o `ThemeProvider` troca o tema inteiro;
 * - `colorSchemes` + `cssVariables`: devolve `{ '*:where(.dark) &': estilos }` (ou o seletor que o
 *   app configurou), e o CSS escuro já sai no SSR, sem piscar.
 *
 * Num tema só claro, devolve `{}`: o claro é exatamente o que sempre foi.
 */

/**
 * A paleta para usar dentro do estilo escuro. Com `cssVariables`, `theme.vars.palette` são
 * variáveis CSS (`var(--mui-palette-…)`) que acompanham o esquema ativo; `theme.palette` guarda os
 * valores do esquema padrão (o claro) e daria a cor errada no escuro. Sem `cssVariables`,
 * `theme.vars` não existe e `theme.palette` já é a do tema ativo.
 */
export const paleta = (theme: Theme) => (theme.vars ?? theme).palette

export type Paleta = ReturnType<typeof paleta>

/**
 * Estilos que só valem no tema escuro do app. Espalhe **depois** das cores do claro, no mesmo
 * nível do objeto em que elas estão (dentro do mesmo seletor aninhado, para manter a ordem da
 * cascata de `:hover`/`.Mui-focused`), e uma vez por nível: com variáveis CSS, duas chamadas no
 * mesmo objeto geram a mesma chave e a segunda apaga a primeira.
 *
 *   sx={(theme) => ({ bgcolor: 'white', color: '#1E293B', ...noEscuro(theme, (p) => ({ bgcolor: p.background.paper, color: p.text.primary })) })}
 */
export function noEscuro(theme: Theme, estilos: (p: Paleta) => CSSObject): CSSObject {
    return theme.applyStyles('dark', estilos(paleta(theme))) as CSSObject
}
