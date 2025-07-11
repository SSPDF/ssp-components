import { Autocomplete, Grid, TextField } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { SyntheticEvent, useCallback, useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { AuthContext } from '../../../context/auth'
import { FormContext } from '../../../context/form'

interface Option {
    id: number
    label: string
}

export default function AutoComplete({
    name,
    required = false,
    title,
    customPlaceholder,
    url,
    xs = 12,
    sm,
    md,
    dataPath = '',
}: {
    url: string
    name: string
    title?: string
    dataPath?: string
    customPlaceholder?: string
    required?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)
    const { user } = useContext(AuthContext)
    const [options, setOptions] = useState([])

    const { isLoading, data, error } = useQuery(`autocomplete-${name!}`, () =>
        fetch(url, {
            headers: {
                Authorization: `Bearer ${user ? user.token : ''}`,
            },
        }).then((x) => x.json().then((list) => setOptions(getData(list))))
    )

    // transformar isso em um component ou utils
    const getData = useCallback((dt: any) => {
        if (Array.isArray(dt)) return dt
        if (typeof dt === 'object') return get(dt, dataPath)
    }, [])

    const onSelect = useCallback(
        (e: SyntheticEvent<Element, Event>, value: Option | null) => {
            context?.formSetValue(name!, value ? value.id : '')
            context?.formTrigger(name!)
        },
        [context, name]
    )

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
                        if (v.length <= 0 && required) return 'Este campo é obrigatório'
                    },
                })}
                hidden
            />
            <Autocomplete
                options={options}
                isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                onChange={onSelect}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={customPlaceholder}
                        size='small'
                        error={get(context?.errors, name!) ? true : false}
                        helperText={get(context?.errors, name!)?.message as string}
                    />
                )}
            />
        </Grid>
    );
}
