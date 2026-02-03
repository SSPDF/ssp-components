import { Autocomplete, Grid, InputLabel, TextField, Box } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
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
    onChange = () => { },
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
        <Grid item {...{ xs, sm, md }}>
            {title && <InputLabel required={required}>{title}</InputLabel>}
            <input
                type='text'
                {...context?.formRegister(name!, {
                    validate: (v, f) => {
                        if (required && !v) return 'Este campo é obrigatório'
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
                renderInput={(params) => {
                    const formError = get(context?.errors, name!)
                    const hasError = !!formError
                    let errorMessage: React.ReactNode = (formError?.message as string)

                    if (hasError) {
                        errorMessage = (
                            <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ErrorOutline fontSize='small' />
                                {errorMessage}
                            </Box>
                        )
                    }

                    return (
                        <TextField
                            {...params}
                            size='small'
                            fullWidth
                            placeholder={title}
                            error={hasError}
                            helperText={errorMessage}
                            FormHelperTextProps={{
                                sx: {
                                    backgroundColor: hasError ? '#FFEBEE' : 'transparent',
                                    borderRadius: '8px',
                                    padding: hasError ? '8px 12px' : 0,
                                    marginBottom: hasError ? '4px' : 0,
                                    marginTop: hasError ? '8px' : 0,
                                    border: hasError ? '1px solid #FFCDD2' : 'none',
                                    color: 'error.main',
                                    marginLeft: 0,
                                    marginRight: 0,
                                },
                            }}
                        />
                    )
                }}
                size='small'
                sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        transition: 'all 0.2s',
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
                fullWidth
            />
        </Grid>
    )
}
