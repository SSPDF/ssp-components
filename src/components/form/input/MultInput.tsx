import { Grid, TextField } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { useContext, useEffect } from 'react'
import { FormContext } from '../../../context/form'

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

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && (
                <InputLabel required={required} sx={{ textTransform: 'capitalize' }}>
                    {title}
                </InputLabel>
            )}
            <TextField
                multiline
                fullWidth
                rows={3}
                defaultValue={defaultValue}
                {...context.formRegister(name!, {
                    validate: (v, f) => {
                        if (required && v.length <= 0) return 'Este campo é obrigatório'

                        if (v.length > inputMaxLength) return `Limite máximo de ${inputMaxLength} caracteres`
                        if (v.length < inputMinLength && required) return `Limite mínimo de ${inputMinLength} caracteres`
                    },
                })}
                error={get(context.errors, name!) ? true : false}
                helperText={get(context.errors, name!)?.message as string}
                sx={{
                    bgcolor: 'white',
                }}
                placeholder={customPlaceholder ? customPlaceholder : title}
            />
        </Grid>
    )
}
