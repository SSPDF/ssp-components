import { Autocomplete, Grid, InputLabel, TextField } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { FormContext } from '../../../context/form'

export default function FetchAutoComplete({
    name,
    url,
    title,
    customLoadingText,
    shouldRefetch = true,
    required = false,
    defaultValue,
    onChange = () => {},
    xs = 12,
    sm,
    md,
}: {
    name: string
    url: string
    title: string
    customLoadingText?: string
    defaultValue?: number
    required?: boolean
    onChange?: (id: number | undefined) => void
    shouldRefetch?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)

    const [loading, setLoading] = useState(true)
    const [list, setList] = useState<any>([])
    const [loadingText, setLoadingText] = useState('Carregando...')
    const [dValue, setDValue] = useState<any | null>(null)
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
                    res.json().then((j) => {
                        let value = j.body.data.filter((x: any) => x.id === defaultValue)

                        if (value.length > 0) {
                            setList(j.body.data)
                            setLoading(false)

                            context?.formSetValue(name, defaultValue)
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
                    setList(j.body.data)
                    setLoading(false)
                })
            } else {
                setLoadingText('Erro ao carregar dados')
            }
        })
    }

    function handleAutoCompleteChange(element: any, value: any) {
        if (context) {
            context.formRA = element.textContent
        }

        context?.formSetValue(name, value ? value.id : '')
        onChange(value ? value.id : -1)
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
                        if (v.length <= 0 && required) return 'Este campo é obrigatório'
                    },
                })}
                hidden
            />
            <Autocomplete
                loading={loading}
                loadingText={loadingText}
                options={list}
                defaultValue={dValue}
                isOptionEqualToValue={(op: any, value: any) => op.id === value.id}
                onChange={(e, v) => handleAutoCompleteChange(e.currentTarget, v)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size='small'
                        fullWidth
                        placeholder={title}
                        onFocus={onFocus}
                        required
                        error={get(context?.errors, name!) ? true : false}
                        helperText={get(context?.errors, name!)?.message as string}
                    />
                )}
                size='small'
                fullWidth
            />
        </Grid>
    )
}
