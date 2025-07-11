import { Grid, InputLabel, TextField, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import get from 'lodash.get'
import hasIn from 'lodash.hasin'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

export default function GenericDatePicker({
    name,
    required = false,
    title,
    xs = 12,
    sm,
    md,
    minDt,
    defaultValue,
    persistValue,
    maxDt,
    ...props
}: {
    minDt?: string
    maxDt?: string
    name: string
    title?: string
    required?: boolean
    defaultValue?: string
    persistValue?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useFormContext()

    const [value, setValue] = useState<Dayjs | undefined>(defaultValue !== undefined ? dayjs(defaultValue, 'DD/MM/YYYY') : undefined)

    const handleChange = (newValue: Dayjs | null) => {
        setValue(undefined)
    }

    useEffect(() => {
        if (value === undefined) return
        context.setValue(name, value ? value.format('DD/MM/YYYY') : value)
    }, [value])

    useEffect(() => {
        // Vamos executar o unregister em casos em que não queremos persistir o valor
        if (persistValue) return
        return () => {
            context.unregister(name)
        }
    }, [])

    return (
        <>
            <Grid
                size={{
                    xs: xs,
                    sm: sm,
                    md: md,
                }}
            >
                {title && <InputLabel required={required}>{title}</InputLabel>}
                <LocalizationProvider adapterLocale={'pt-br'} dateAdapter={AdapterDayjs}>
                    <MUIDatePicker
                        minDate={dayjs(minDt, 'DD/MM/YYYY')}
                        maxDate={dayjs(maxDt, 'DD/MM/YYYY')}
                        format='DD/MM/YYYY'
                        value={value}
                        onChange={handleChange}
                        disableHighlightToday
                        sx={{
                            outline: get(context.formState.errors, name!) ? '1px solid #a51c30' : '',
                            backgroundColor: 'white',
                            width: '100%',
                            div: {
                                input: {
                                    paddingX: 2,
                                    paddingY: 1.05,
                                },
                            },
                        }}
                        inputRef={(params: any) =>
                            (
                                <TextField
                                    size='small'
                                    {...params}
                                    {...context?.register(name!, {
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
                            ) as any
                        }
                    />
                    <Typography sx={{ color: '#a51c30', fontSize: 14, paddingLeft: 1 }}>{get(context.formState.errors, name!)?.message as string}</Typography>
                </LocalizationProvider>
            </Grid>
        </>
    )
}
