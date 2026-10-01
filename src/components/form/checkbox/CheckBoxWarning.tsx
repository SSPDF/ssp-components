import { Card, Checkbox, Grid, Box, useTheme, Typography } from '@mui/material'
import React, { ReactElement, useCallback, useContext } from 'react'
import { FormContext } from '../../../context/form'

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
        [context, name]
    )

    return (
        <Grid item {...{ xs, sm, md }}>
            <Box
                onClick={(e: any) => onClick(e)}
                sx={{
                    border: '1px solid',
                    borderColor: isSelected ? theme.palette.primary.main : '#E0E0E0',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? `${theme.palette.primary.main}10` : 'white',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    marginBottom: 0.5,
                    '&:hover': {
                        borderColor: !isSelected ? theme.palette.grey[400] : undefined,
                        backgroundColor: !isSelected ? theme.palette.grey[50] : undefined,
                    },
                }}
            >
                <Checkbox
                    checked={isSelected}
                    size='small'
                    sx={{
                        padding: 0,
                        mr: 1.5,
                        '&.Mui-checked': {
                            color: theme.palette.primary.main,
                        },
                    }}
                />
                <Typography
                    variant='body2'
                    color={isSelected ? 'primary.main' : 'text.primary'}
                    fontWeight={isSelected ? 600 : 400}
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
