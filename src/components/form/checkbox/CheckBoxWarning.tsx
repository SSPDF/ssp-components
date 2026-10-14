import { Card, Checkbox, Grid, Box, useTheme, Typography } from '@mui/material'
import React, { ReactElement, useCallback, useContext } from 'react'
import { FormContext } from '../../../context/form'
import { cartaoDeOpcao } from '../estilosDoCampo'

export default function CheckBoxWarning({
    name,
    title,
    customWarning,
    defaultValue = false,
    xs = 12,
    sm,
    md,
}: {
    name: string
    title: string
    customWarning?: ReactElement
    defaultValue?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!
    const theme = useTheme()

    const isSelected = context?.formWatch(name!) || defaultValue

    const onClick = useCallback(
        (e: React.SyntheticEvent<Element, Event>) => {
            context?.formSetValue(name!, !context?.formGetValues(name))
        },
        [context, name],
    )

    return (
        <Grid size={{ xs, sm, md }}>
            <Box
                onClick={(e: any) => onClick(e)}
                sx={{
                    border: '1px solid',
                    ...cartaoDeOpcao(theme, isSelected, !isSelected),
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    marginBottom: 0.5,
                }}
            >
                <Checkbox
                    checked={isSelected}
                    size='small'
                    sx={{
                        padding: 0,
                        mr: 1.5,
                        '&.Mui-checked': {
                            color: 'primary.main',
                        },
                    }}
                />
                <Typography
                    variant='body2'
                    // MUI 9: o color do Typography só aceita nomes da paleta ('primary.main' e 'text.primary' viravam CSS inválido)
                    color={isSelected ? 'primary' : 'textPrimary'}
                    sx={{
                        fontWeight: isSelected ? 600 : 400,
                    }}
                >
                    {title}
                </Typography>
                <input type='checkbox' {...context?.formRegister(name!)} style={{ display: 'none' }} />
            </Box>

            {isSelected && (
                <Card sx={{ bgcolor: '#FFFBF5', color: '#F59E0B', padding: 1, paddingLeft: 2 }}>
                    {customWarning ? (
                        customWarning
                    ) : (
                        <Typography>
                            <b>Atenção</b> <i>{title}</i> possui regras específicas.
                        </Typography>
                    )}
                </Card>
            )}
        </Grid>
    )
}
