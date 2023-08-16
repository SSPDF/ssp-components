import { Grid, InputLabel, TextField, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import ptbr from 'dayjs/locale/pt-br'
import get from 'lodash.get'
import hasIn from 'lodash.hasin'
import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from '../../../context/form'

export default function DatePicker({
    name,
    required = false,
    title,
    xs = 12,
    sm,
    md,
    minDt,
    defaultValue = '',
    maxDt,
    ...props
}: {
    minDt?: string
    maxDt?: string
    name: string
    title?: string
    required?: boolean
    defaultValue?: string
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!

    const [value, setValue] = useState<Dayjs | null>(defaultValue ? dayjs(defaultValue, 'DD/MM/YYYY') : null)

    const handleChange = (newValue: Dayjs | null) => {
        console.log('mudou')
        setValue(newValue)
    }

    useEffect(() => {
        if (!value) return

        context.formSetValue(name, value.format('DD/MM/YYYY'))
    }, [value])

    return (
        <>
            <Grid item {...{ xs, sm, md }}>
                {title && <InputLabel required={required}>{title}</InputLabel>}
                <LocalizationProvider adapterLocale={ptbr} dateAdapter={AdapterDayjs}>
                    <MUIDatePicker
                        minDate={dayjs(minDt, 'DD/MM/YYYY')}
                        maxDate={dayjs(maxDt, 'DD/MM/YYYY')}
                        format='DD/MM/YYYY'
                        value={value}
                        onChange={handleChange}
                        disableHighlightToday
                        sx={{
                            outline: get(context.errors, name!) ? '1px solid #a51c30' : '',
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
                                        if (v.length < 10 && required) return 'A data precisa seguir o padrão DD/MM/AAAA'

                                        if (minDt && !(dayjs(minDt, 'DD/MM/YYYY').isSame(dayjs(v, 'DD/MM/YYYY')) || dayjs(minDt, 'DD/MM/YYYY').isBefore(dayjs(v, 'DD/MM/YYYY'))))
                                            return `A data tem que ser depois de ${minDt} e antes de ${maxDt}`

                                        if (maxDt && !(dayjs(maxDt, 'DD/MM/YYYY').isSame(dayjs(v, 'DD/MM/YYYY')) || dayjs(maxDt, 'DD/MM/YYYY').isAfter(dayjs(v, 'DD/MM/YYYY'))))
                                            return 'A data escolhida não é válida'
                                    },
                                    shouldUnregister: true,
                                })}
                                fullWidth
                            />
                        )}
                    />
                    <Typography sx={{ color: '#a51c30', fontSize: 14, paddingLeft: 1 }}>{get(context.errors, name!)?.message as string}</Typography>
                </LocalizationProvider>
            </Grid>
        </>
    )
}
