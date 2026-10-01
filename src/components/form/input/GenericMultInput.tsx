import { Grid, TextField } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

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
    const context = useFormContext()

    useEffect(() => {
        context.setValue(name, watchValue)
    }, [watchValue])

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
                {...context.register(name!, {
                    validate: (v, f) => {
                        if (required && v.length <= 0) return 'Este campo é obrigatório'

                        if (v.length > inputMaxLength) return `Limite máximo de ${inputMaxLength} caracteres`
                        if (v.length < inputMinLength && required) return `Limite mínimo de ${inputMinLength} caracteres`
                    },
                })}
                error={get(context.formState.errors, name!) ? true : false}
                helperText={get(context.formState.errors, name!)?.message as string}
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
                            borderWidth: '1px',
                        },
                    },
                }}
                placeholder={customPlaceholder ? customPlaceholder : title}
            />
        </Grid>
    )
}
