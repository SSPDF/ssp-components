import { Theme } from '@mui/material'

// Borda dos campos de formulário. No tema claro são os cinzas de sempre da lib (#E0E0E0 / #BDBDBD),
// sem mudar nada para quem já usa. No escuro esses cinzas viram uma borda quase branca, então
// passam a vir do tema: `divider` e `action.disabled` são os equivalentes do MUI para o modo escuro.
export const fieldBorder = (theme: Theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#E0E0E0')

export const fieldBorderHover = (theme: Theme) => (theme.palette.mode === 'dark' ? theme.palette.action.disabled : '#BDBDBD')
