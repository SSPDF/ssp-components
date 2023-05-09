import { Grid, TextField } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { useContext } from 'react'
import { FormContext } from '../../../context/form'

export default function MultInput({
    name,
    required = false,
    title,
    customPlaceholder,
    xs = 12,
    sm,
    md,
    ...props
}: {
    name: string
    title?: string
    customPlaceholder?: string
    required?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!

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
                {...context.formRegister(name!, {
                    validate: (v, f) => {
                        if (required && v.length <= 0) return 'Este campo é obrigatório'
                    },
                })}
                error={get(context.errors, name!) ? true : false}
                helperText={get(context.errors, name!)?.message as string}
                placeholder={customPlaceholder ? customPlaceholder : title}
            />
        </Grid>
    )
}
