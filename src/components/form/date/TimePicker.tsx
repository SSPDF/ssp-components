import { Grid, InputLabel, TextField, Typography } from '@mui/material'
import { LocalizationProvider, TimePicker as MUITimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import get from 'lodash.get'
import 'dayjs/locale/pt-br'
import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from '../../../context/form'
import hasIn from 'lodash.hasin'

export default function TimePicker({
    name,
    required = false,
    title,
    defaultValue = '',
    xs = 12,
    sm,
    md,
}: {
    name: string
    title?: string
    required?: boolean
    defaultValue?: string
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!
    const [value, setValue] = useState<Dayjs | null>(defaultValue ? dayjs(defaultValue, 'HH:mm') : null)

    const handleChange = (newValue: Dayjs | null) => {
        setValue(newValue)
    }

    useEffect(() => {
        context.formSetValue(name, value ? value.format('HH:mm') : value)
    }, [value])

    useEffect(() => {
        return () => {
            context.formUnregister(name)
        }
    }, [])

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && <InputLabel required={required}>{title}</InputLabel>}
            <LocalizationProvider adapterLocale={'pt-br'} dateAdapter={AdapterDayjs}>
                <MUITimePicker
                    value={value}
                    ampm={false}
                    onChange={handleChange}
                    sx={{
                        outline: get(context.errors, name!) ? '1px solid #a51c30' : '',
                        backgroundColor: 'white',
                        width: '100%',
                        div: {
                            input: {
                                paddingX: 2,
                                paddingY: 1.05,
                            },
                        },
                    }}
                    inputRef={(params: any) => (
                        <TextField
                            size='small'
                            {...params}
                            {...context?.formRegister(name!, {
                                validate: (v, f) => {
                                    if (!hasIn(f, name)) {
                                        return true
                                    }
                                    if (!v) v = ''

                                    if (v.length <= 0 && required) return 'Este campo é obrigatório'
                                    if (v.length < 5 && required) return 'A hora precisa seguir o padrão HH:MM'
                                },
                                shouldUnregister: true,
                            })}
                            fullWidth
                        />
                    )}
                />
                <Typography sx={{ color: '#a51c30', fontSize: 15, paddingLeft: 1 }}>{get(context.errors, name!)?.message as string}</Typography>
            </LocalizationProvider>
        </Grid>
    )
}
