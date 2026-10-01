import { Grid, TextField, Box } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { useContext, useEffect } from 'react'
import { FormContext } from '../../../context/form'
import { ErrorOutline } from '@mui/icons-material'

export default function MultInput({
    name,
    required = false,
    title,
    customPlaceholder,
    defaultValue = '',
    xs = 12,
    sm,
    watchValue = '',
    inputMinLength = 3,
    inputMaxLength = 255,
    md,
    ...props
}: {
    name: string
    title?: string
    watchValue?: string
    customPlaceholder?: string
    required?: boolean
    defaultValue?: string
    inputMinLength?: number
    inputMaxLength?: number
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!

    useEffect(() => {
        context.formSetValue(name, watchValue)
    }, [watchValue])

    const errorData = get(context.errors, name!)
    let helperText: React.ReactNode = errorData?.message as string
    const error = errorData ? true : false

    if (error) {
        helperText = (
            <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorOutline fontSize='small' />
                {helperText}
            </Box>
        )
    }

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && (
                <InputLabel
                    required={required}
                    sx={{
                        textTransform: 'capitalize',
                        mb: 1,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        transform: 'none',
                        position: 'static',
                    }}
                >
                    {title}
                </InputLabel>
            )}
            <TextField
                multiline
                fullWidth
                minRows={3}
                defaultValue={defaultValue}
                {...context.formRegister(name!, {
                    validate: (v, f) => {
                        if (required && v.length <= 0) return 'Este campo é obrigatório'

                        if (v.length > inputMaxLength) return `Limite máximo de ${inputMaxLength} caracteres`
                        if (v.length < inputMinLength && required) return `Limite mínimo de ${inputMinLength} caracteres`
                    },
                })}

                error={error}
                helperText={helperText}
                FormHelperTextProps={{
                    sx: {
                        backgroundColor: error ? '#FFEBEE' : 'transparent',
                        borderRadius: '8px',
                        padding: error ? '8px 12px' : 0,
                        marginBottom: error ? '4px' : 0,
                        marginTop: error ? '8px' : 0,
                        border: error ? '1px solid #FFCDD2' : 'none',
                        color: 'error.main',
                        marginLeft: 0,
                        marginRight: 0,
                    },
                }}
                sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                            borderColor: '#E0E0E0',
                        },
                        '&:hover fieldset': {
                            borderColor: '#BDBDBD',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                        },
                        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                        },
                    },
                }}
                placeholder={customPlaceholder ? customPlaceholder : title}
            />
        </Grid>
    )
}
