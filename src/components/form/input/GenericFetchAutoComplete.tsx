import { Autocomplete, Grid, InputLabel, TextField } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { useFormContext } from 'react-hook-form'

let useDefault = true

export default function GenericFetchAutoComplete({
    name,
    url,
    title,
    customLoadingText,
    shouldRefetch = true,
    required = false,
    defaultValue,
    route = '',
    onChange = () => {},
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
    const context = useFormContext()

    const [loading, setLoading] = useState(true)
    const [list, setList] = useState<any>([])
    const [loadingText, setLoadingText] = useState('Carregando...')
    const [dValue, setDValue] = useState<any | null>(null)
    const [value, setValue] = useState<{ id: any; label: string } | null>(null)
    const { user } = useContext(AuthContext)

    useEffect(() => {
        if (defaultValue) {
            fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            }).then((res) => {
                if (res.ok) {
                    console.log('llll')
                    res.json().then((j) => {
                        let value = get(j, route, j).filter((x: any) => x.id === defaultValue)
                        if (value.length > 0) {
                            setList(get(j, route, j))
                            setLoading(false)
                            context.setValue(name, defaultValue)
                            setDValue(value[0])
                        } else {
                            setLoadingText('Erro ao carregar dados. Valor inválido')
                        }
                    })
                } else {
                    setLoadingText('Erro ao carregar dados')
                }
            })
        }
    }, [])

    useEffect(() => {
        if (watchValue && useDefault) {
            setValue(watchValue)
            context.setValue(name, watchValue.id)
            onChange(watchValue.id as any)
        }
    }, [watchValue])

    function onFocus() {
        if ((defaultValue || !shouldRefetch) && list.length > 0) return

        setLoading(true)
        setList([])
        customLoadingText && setLoadingText(customLoadingText)

        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${user?.token}`,
            },
        }).then((res) => {
            if (res.ok) {
                res.json().then((j) => {
                    setList(get(j, route, j))
                    setLoading(false)
                })
            } else {
                setLoadingText('Erro ao carregar dados')
            }
        })
    }

    function handleAutoCompleteChange(value: any) {
        useDefault = false

        if (value) {
            setValue(value)
            context.setValue(name, value.id)
            onChange(value.id)
            return
        }

        setValue(null)
        context.setValue(name, '')
        onChange(undefined)
    }

    if (defaultValue && list.length <= 0 && !dValue)
        return (
            <Grid
                size={{
                    xs: xs,
                    sm: sm,
                    md: md
                }}>
                <TextField size='small' fullWidth placeholder={loadingText} disabled />
            </Grid>
        );

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
                {...context?.register(name!, {
                    validate: (v, f) => {
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
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size='small'
                        fullWidth
                        placeholder={title}
                        onFocus={onFocus}
                        error={get(context.formState.errors, name!) ? true : false}
                        helperText={get(context.formState.errors, name!)?.message as string}
                    />
                )}
                sx={{
                    bgcolor: 'white',
                }}
                size='small'
                fullWidth
                disabled={disabled}
            />
        </Grid>
    );
}
