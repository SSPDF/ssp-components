import { Grid, InputLabel, TextField } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import dayjs, { Dayjs } from 'dayjs'
import ptbr from 'dayjs/locale/pt-br'
import get from 'lodash.get'
import React, { useContext, useState } from 'react'
import formContext from '../../../context/form'

export default function DatePicker({
    name,
    required = false,
    title,
    xs = 12,
    sm,
    md,
    minDt,
    maxDt,
    ...props
}: {
    minDt?: string
    maxDt?: string
    name: string
    title?: string
    required?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(formContext)!

    const [value, setValue] = useState<Dayjs | null>(null)

    const handleChange = (newValue: Dayjs | null) => {
        setValue(newValue)

        context?.formSetValue(name!, newValue?.format('DD/MM/YYYY'))
    }

    return (
        <>
            <Grid item {...{ xs, sm, md }}>
                {title && <InputLabel>{title}</InputLabel>}
                <LocalizationProvider adapterLocale={ptbr} dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                        minDate={dayjs(minDt, 'DD/MM/YYYY')}
                        maxDate={dayjs(maxDt, 'DD/MM/YYYY')}
                        format='DD/MM/YYYY'
                        value={value}
                        onChange={handleChange}
                        disableHighlightToday
                        inputRef={(params: any) => (
                            <TextField
                                size='small'
                                {...params}
                                {...context?.formRegister(name!, {
                                    validate: (v, f) => {
                                        if (v.length <= 0 && required) return 'Este campo é obrigatório'
                                        if (v.length < 10 && required) return 'A data precisa seguir o padrão DD/MM/AAAA'

                                        if (minDt && !(dayjs(minDt, 'DD/MM/YYYY').isSame(dayjs(v, 'DD/MM/YYYY')) || dayjs(minDt, 'DD/MM/YYYY').isBefore(dayjs(v, 'DD/MM/YYYY'))))
                                            return 'Inicio precisa ser no mínimo 30 dias antes e no máximo 60 dias.'

                                        if (maxDt && !(dayjs(maxDt, 'DD/MM/YYYY').isSame(dayjs(v, 'DD/MM/YYYY')) || dayjs(maxDt, 'DD/MM/YYYY').isAfter(dayjs(v, 'DD/MM/YYYY'))))
                                            return 'A data escolhida não é válida'
                                    },
                                })}
                                error={get(context.errors, name!) ? true : false}
                                helperText={get(context.errors, name!)?.message as string}
                                fullWidth
                            />
                        )}
                    />
                </LocalizationProvider>
            </Grid>
        </>
    )
}
