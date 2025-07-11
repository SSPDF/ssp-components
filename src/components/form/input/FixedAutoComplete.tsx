import { Autocomplete, Grid, InputLabel, TextField } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { FormContext } from '../../../context/form'

let useDefault = true

export function FixedAutoComplete({
    name,
    title,
    required = false,
    list,
    defaultValue,
    onChange = () => {},
    xs = 12,
    sm,
    watchValue,
    forceUpdate = false,
    md,
}: {
    name: string
    title: string
    watchValue?: { id: number | string; label: string }
    list: Object[]
    customLoadingText?: string
    defaultValue?: Object
    required?: boolean
    onChange?: (id: number | undefined) => void
    shouldRefetch?: boolean
    forceUpdate?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!
    const [value, setValue] = useState<{ id: any; label: string } | null>(null)

    useEffect(() => {
        if (defaultValue) context?.formSetValue(name, (defaultValue as any).id)
    }, [])

    useEffect(() => {
        if (watchValue && (useDefault || forceUpdate)) {
            setValue(watchValue)
            context.formSetValue(name, watchValue.id)
            onChange(watchValue.id as any)
        } else if (watchValue === undefined && (useDefault || forceUpdate)) {
            setValue(null)
            context.formSetValue(name, undefined)
            onChange(undefined)
        }
    }, [watchValue])

    function handleAutoCompleteChange(value: any) {
        useDefault = false

        if (value) {
            setValue(value)
            context.formSetValue(name, value.id)
            onChange(value.id)
            return
        }

        setValue(null)
        context.formSetValue(name, '')
        onChange(undefined)
    }

    return (
        <Grid
            size={{
                xs: xs,
                sm: sm,
                md: md
            }}>
            {title && <InputLabel required={required}>{title}</InputLabel>}
            <input
                type='text'
                {...context?.formRegister(name!, {
                    validate: (v, f) => {
                        if (!v) return 'Este campo é obrigatório'
                        if (v?.length <= 0 && required) return 'Este campo é obrigatório'
                    },
                })}
                hidden
            />
            <Autocomplete
                value={value}
                options={list}
                defaultValue={defaultValue}
                getOptionLabel={(option: any) => (option.label ? option.label.toString() : 'Não Encontrado')}
                isOptionEqualToValue={(op: any, value: any) => op.id === value.id}
                onChange={(e, v) => handleAutoCompleteChange(v)}
                renderInput={(params) => (
                    <TextField {...params} size='small' fullWidth placeholder={title} error={get(context?.errors, name!) ? true : false} helperText={get(context?.errors, name!)?.message as string} />
                )}
                size='small'
                sx={{
                    bgcolor: 'white',
                }}
                fullWidth
            />
        </Grid>
    );
}
