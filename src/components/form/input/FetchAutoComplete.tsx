import { Autocomplete, Grid, InputLabel, TextField, useMediaQuery, useTheme } from '@mui/material'
import React, { useContext, useState } from 'react'
import { FormContext } from '../../../context/form'
import { AuthContext } from '../../../context/auth'

export default function FetchAutoComplete({
    name,
    url,
    title,
    customLoadingText,
    shouldRefetch = true,
    required = false,
}: {
    name: string
    url: string
    title: string
    customLoadingText: string
    required?: boolean
    shouldRefetch?: boolean
}) {
    const context = useContext(FormContext)

    const [loading, setLoading] = useState(true)
    const [list, setList] = useState([])
    const [loadingText, setLoadingText] = useState('Carregando...')
    const { user } = useContext(AuthContext)

    function onFocus() {
        if (!shouldRefetch && list.length > 0) return

        setLoading(true)
        setList([])
        setLoadingText(customLoadingText)

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

    return (
        <Grid item xs={12}>
            <InputLabel required={required}>{title}</InputLabel>
            <Autocomplete
                loading={loading}
                loadingText={loadingText}
                options={list}
                isOptionEqualToValue={(op: any, value: any) => op.id === value.id}
                onChange={(e, v) => context?.formSetValue(name, v ? v.id : '')}
                renderInput={(params) => <TextField {...params} size='small' fullWidth placeholder={title} onFocus={onFocus} required />}
                size='small'
                fullWidth
            />
        </Grid>
    )
}
