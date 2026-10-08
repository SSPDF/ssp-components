import type { CSSObject, Theme } from '@mui/material'
import { noEscuro } from '../utils/temaEscuro'

/**
 * Cores dos campos de formulário que se repetem em vários componentes. No claro, os valores de
 * sempre da lib; no escuro do app, os equivalentes da paleta (ver `utils/temaEscuro.ts`).
 */

/** Fundo do campo: branco no claro, `background.paper` no escuro. */
export const fundoDoCampo = (theme: Theme): CSSObject => ({
    backgroundColor: 'white',
    ...noEscuro(theme, (p) => ({ backgroundColor: p.background.paper })),
})

/**
 * Borda neutra do campo, para pôr dentro do seletor da raiz do input (`.MuiOutlinedInput-root`,
 * `.MuiPickersOutlinedInput-root`), antes do `&.Mui-focused fieldset`: assim o foco continua
 * ganhando do hover no escuro também.
 */
export const bordaDoCampo = (theme: Theme): CSSObject => ({
    '& fieldset': { borderColor: '#E0E0E0', ...noEscuro(theme, (p) => ({ borderColor: p.divider })) },
    '&:hover fieldset': { borderColor: '#BDBDBD', ...noEscuro(theme, (p) => ({ borderColor: p.action.disabled })) },
})

/**
 * A caixa da mensagem de erro (fundo rosado, borda e texto `error.main`). No escuro, o mesmo
 * vermelho do tema em transparência, sobre o fundo escuro.
 */
export const caixaDeErro = (theme: Theme): CSSObject => ({
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    ...noEscuro(theme, (p) => ({ backgroundColor: theme.alpha(p.error.main, 0.12), border: `1px solid ${theme.alpha(p.error.main, 0.5)}`, color: p.error.light })),
})

/**
 * Cartão de opção (`CheckBox`, `CheckBoxWarning`, `OtherCheckBox`, `Radio`): borda e fundo neutros,
 * ou o primário quando marcado, e o realce de hover quando `hover` (dá para marcar). Vai depois do
 * `border: '1px solid'`, que senão apagaria a cor da borda.
 */
export const cartaoDeOpcao = (theme: Theme, marcado: boolean, hover: boolean): CSSObject => ({
    borderColor: marcado ? theme.palette.primary.main : '#E0E0E0',
    backgroundColor: marcado ? `${theme.palette.primary.main}10` : 'white',
    ...noEscuro(theme, (p) => ({ borderColor: marcado ? p.primary.main : p.divider, backgroundColor: marcado ? theme.alpha(p.primary.main, 0.06) : p.background.paper })),
    '&:hover': {
        borderColor: hover ? theme.palette.grey[400] : undefined,
        backgroundColor: hover ? theme.palette.grey[50] : undefined,
        ...(hover && noEscuro(theme, (p) => ({ borderColor: p.action.disabled, backgroundColor: p.action.hover }))),
    },
})
