import { Autocomplete, Grid, InputLabel, TextField, Box } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { FormContext } from '../../../context/form'
import { ErrorOutline } from '@mui/icons-material'

let useDefault = true

export default function FetchAutoComplete({
    name,
    url,
    title,
    customLoadingText,
    shouldRefetch = true,
    required = false,
    defaultValue,
    route = '',
    onChange = () => { },
    xs = 12,
    sm,
    watchValue,
    md,
    disabled = false,
}: {
    name: string
    url: string
    title: string
    watchValue?: { id: number | string; label: string }
    customLoadingText?: string
    defaultValue?: number
    required?: boolean
    route?: string
    onChange?: (id: number | undefined) => void
    shouldRefetch?: boolean
    xs?: number
    sm?: number
    md?: number
    disabled?: boolean
}) {
    const context = useContext(FormContext)!

    const [loading, setLoading] = useState(true)
    const [list, setList] = useState<any>([])
    const [loadingText, setLoadingText] = useState('Carregando...')
    const [dValue, setDValue] = useState<any | null>(null)
    const [value, setValue] = useState<{ id: any; label: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { user } = useContext(AuthContext)

    // helper function to handle api requests with error handling
    const fetchData = async (_url: string, _route: string, _isDefaultValue = false) => {
        try {
            setError(null)
            const response = await fetch(_url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            })

            if (!response.ok) {
                const errorMessage =
                    response.status === 401
                        ? 'Sessão expirada. Faça login novamente.'
                        : response.status === 403
                            ? 'Acesso negado. Verifique suas permissões.'
                            : response.status >= 500
                                ? 'Erro interno do servidor. Tente novamente mais tarde.'
                                : 'Erro ao carregar dados'

                setError(errorMessage)
                setLoadingText(errorMessage)
                setLoading(false)
                return
            }

            const data = await response.json()
            const items = get(data, _route, data)

            if (_isDefaultValue) {
                const filteredValue = items.filter((x: any) => x.id === defaultValue)
                if (filteredValue.length > 0) {
                    setList(items)
                    setLoading(false)
                    context.formSetValue(name, defaultValue)
                    setDValue(filteredValue[0])
                } else {
                    setError('Valor padrão inválido')
                    setLoadingText('Erro ao carregar dados. Valor inválido')
                    setLoading(false)
                }
            } else {
                setList(items)
                setLoading(false)
            }
        } catch (err) {
            console.error('Network error:', err)
            setError('Erro de conexão. Verifique sua internet e tente novamente.')
            setLoadingText('Erro de conexão. Verifique sua internet e tente novamente.')
            setLoading(false)
        }
    }

    useEffect(() => {
        if (defaultValue) {
            fetchData(url, route, true)
        }
    }, [])

    useEffect(() => {
        if (watchValue && useDefault) {
            setValue(watchValue)
            context.formSetValue(name, watchValue.id)
            onChange(watchValue.id as any)
        }
    }, [watchValue])

    function onFocus() {
        if ((defaultValue || !shouldRefetch) && list.length > 0) return

        setLoading(true)
        setList([])
        customLoadingText && setLoadingText(customLoadingText)

        fetchData(url, route, false)
    }

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

    if (defaultValue && list.length <= 0 && !dValue)
        return (
            <Grid item {...{ xs, sm, md }}>
                <TextField size='small' fullWidth placeholder={loadingText} disabled />
            </Grid>
        )

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && <InputLabel required={required}>{title}</InputLabel>}
            <input
                type='text'
                {...context?.formRegister(name!, {
                    validate: (v, f) => {
                        if (!v) return 'Este campo é obrigatório'
                        if (v.length <= 0 && required) return 'Este campo é obrigatório'
                    },
                })}
                hidden
            />
            <Autocomplete
                value={value}
                loading={loading}
                loadingText={loadingText}
                options={list}
                defaultValue={dValue}
                getOptionDisabled={(option) => option?.disabled ?? false}
                isOptionEqualToValue={(op: any, value: any) => op.id === value.id}
                onChange={(e, v) => handleAutoCompleteChange(v)}
                renderInput={(params) => {
                    const formError = get(context?.errors, name!)
                    const hasError = !!formError || !!error
                    let errorMessage: React.ReactNode = (formError?.message as string) || error

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
                            onFocus={onFocus}
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
                size='small'
                fullWidth
                disabled={disabled}
            />
        </Grid>
    )
}
