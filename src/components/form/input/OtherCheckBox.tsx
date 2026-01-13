import { Box, Checkbox, Grid, Stack, TextField, Typography, useTheme } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect } from 'react'
import { FormContext } from '../../../context/form'
import { SwitchWatch } from '../switch/ToggleVisibility'

export default function SSPOtherCheckBox({ name, required = false, xs = 12, sm, md }: { name: string; required?: boolean; xs?: number; sm?: number; md?: number }) {
    const context = useContext(FormContext)!
    const checkName = `switch-${name}`

    useEffect(() => {
        const checkValue = context.formWatch(checkName)

        if (!checkValue) context.formSetValue(name, undefined)
    }, [context])

    const theme = useTheme()
    const isSelected = context.formWatch(checkName)

    const handleBoxClick = () => {
        context.formSetValue(checkName, !isSelected)
    }

    return (
        <Grid item {...{ xs, sm, md }}>
            <Box
                onClick={handleBoxClick}
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
                    mb: 0.5,
                    '&:hover': {
                        borderColor: !isSelected ? theme.palette.grey[400] : undefined,
                        backgroundColor: !isSelected ? theme.palette.grey[50] : undefined,
                    },
                }}
            >
                <Checkbox
                    checked={!!isSelected}
                    size='small'
                    sx={{
                        padding: 0,
                        mr: 1.5,
                        '&.Mui-checked': {
                            color: theme.palette.primary.main,
                        },
                    }}
                />

                <Box sx={{ flexGrow: 1 }} onClick={(e) => e.stopPropagation()}>
                    {isSelected ? (
                        <TextField
                            size='small'
                            fullWidth
                            {...context.formRegister(name!, {
                                validate: (v, f) => {
                                    const value = context.formWatch(checkName)
                                    if (value === true) {
                                        if (!v || (v.length <= 0 && required)) return 'Este campo não pode ser vazio'
                                    }
                                },
                            })}
                            required={required}
                            error={get(context.errors, name!) ? true : false}
                            helperText={get(context.errors, name!)?.message as string}
                            placeholder='Outro'
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                }
                            }}
                        />
                    ) : (
                        <Typography color='text.primary'>Outro</Typography>
                    )}
                </Box>
            </Box>
        </Grid>
    )
}
