import { Autocomplete, Grid, InputBase, InputLabel, TextField, useMediaQuery, useTheme } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from '../../../context/form'
import { AuthContext } from '../../../context/auth'
import get from 'lodash.get'
import { Input } from './Input'

export default function FetchAutoComplete({
    name,
    url,
    title,
    customLoadingText,
    shouldRefetch = true,
    required = false,
    defaultValue,
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
    shouldRefetch?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)

    const [loading, setLoading] = useState(true)
    const [list, setList] = useState([])
    const [loadingText, setLoadingText] = useState('Carregando...')
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
                        setList(j.body.data)
                        setLoading(false)

                        context?.formSetValue(name, j.body.data[defaultValue].id)
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

    if (defaultValue && list.length <= 0)
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
                defaultValue={defaultValue ? list[defaultValue] : undefined}
                isOptionEqualToValue={(op: any, value: any) => op.id === value.id}
                onChange={(e, v) => context?.formSetValue(name, v ? v.id : '')}
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
