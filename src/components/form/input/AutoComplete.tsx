import { Autocomplete, Grid, TextField } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { SyntheticEvent, useCallback, useContext, useState } from 'react'
import { useQuery } from 'react-query'
import formContext from '../../../context/form'
import { User } from '../../../types/auth'

interface Option {
    id: number
    label: string
}

export default function AutoComplete({
    name,
    required = false,
    title,
    customPlaceholder,
    user,
    url,
    xs = 12,
    sm,
    md,
    ...props
}: {
    url: string
    name: string
    user?: User
    title?: string
    customPlaceholder?: string
    required?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(formContext)
    const [options, setOptions] = useState([])
    const { isLoading, data, error } = useQuery(`autocomplete-${name!}`, () =>
        fetch(url, {
            headers: {
                Authorization: `Bearer ${user ? user.token : ''}`,
            },
        }).then((x) => x.json().then((list) => setOptions(list.body.data)))
    )

    const onSelect = useCallback(
        (e: SyntheticEvent<Element, Event>, value: Option | null) => {
            context?.formSetValue(name!, value ? value.id : '')
            context?.formTrigger(name!)
        },
        [context, name]
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
    )
}
