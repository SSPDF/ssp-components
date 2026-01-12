import { Grid, Box, Typography, useTheme, Checkbox } from '@mui/material'
import { useCallback, useContext } from 'react'
import { FormContext } from '../../../context/form'
import React from 'react'

export default function CheckBox({
    name,
    title,
    defaultValue = false,
    xs = 12,
    sm,
    md,
    onChange,
    disabled = false,
}: {
    name: string
    title: string | JSX.Element
    defaultValue?: boolean
    onChange?: (e: React.SyntheticEvent<Element, Event>) => void
    xs?: number
    sm?: number
    md?: number
    disabled?: boolean
}) {
    const context = useContext(FormContext)
    const theme = useTheme()

    const isSelected = context?.formWatch(name!) || defaultValue

    const onClick = useCallback(
        (e: React.SyntheticEvent<Element, Event>) => {
            if (!disabled) {
                context?.formSetValue(name!, !context?.formGetValues(name))
                onChange?.(e)
            }
        },
        [context, name, disabled, onChange]
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
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: isSelected ? `${theme.palette.primary.main}10` : 'white',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    opacity: disabled ? 0.6 : 1,
                    '&:hover': {
                        borderColor: !disabled && !isSelected ? theme.palette.grey[400] : undefined,
                        backgroundColor: !disabled && !isSelected ? theme.palette.grey[50] : undefined,
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
                {typeof title === 'string' ? (
                    <Typography
                        variant='body2'
                        color={isSelected ? 'primary.main' : 'text.primary'}
                        fontWeight={isSelected ? 600 : 400}
                    >
                        {title}
                    </Typography>
                ) : (
                    title
                )}

                {/* Hidden input for form registration if needed, though context handles value. 
                    Keeping original logic flow where register might be used internally by context 
                    but here we primarily use context.formWatch for state. 
                */}
                <input type='checkbox' {...context?.formRegister(name!)} style={{ display: 'none' }} />
            </Box>
        </Grid>
    )
}
