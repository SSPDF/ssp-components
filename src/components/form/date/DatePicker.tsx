import { Grid, InputLabel, TextField, Typography, Box } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { LocalizationProvider, DatePicker as MUIDatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import get from 'lodash.get'
import hasIn from 'lodash.hasin'
import { useContext, useEffect, useState } from 'react'
import { FormContext } from '../../../context/form'

export default function DatePicker({
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
    const context = useContext(FormContext)!

    const [value, setValue] = useState<Dayjs | undefined>(defaultValue !== undefined ? dayjs(defaultValue, 'DD/MM/YYYY') : undefined)

    const handleChange = (newValue: Dayjs | null) => {
        setValue(newValue)
    }

    useEffect(() => {
        if (value === undefined) return
        context.formSetValue(name, value ? value.format('DD/MM/YYYY') : value)
    }, [value])

    useEffect(() => {
        // Vamos executar o unregister em casos em que não queremos persistir o valor
        if (persistValue) return
        return () => {
            context.formUnregister(name)
        }
    }, [])

    return (
        <>
            <Grid item {...{ xs, sm, md }}>
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
                            outline: get(context.errors, name!) ? '1px solid transparent' : '',
                            backgroundColor: 'white',
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                '& fieldset': {
                                    borderColor: '#E0E0E0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#BDBDBD',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                    borderWidth: '2px',
                                },
                                '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'error.main',
                                    borderWidth: '2px',
                                },
                            },
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
                    {get(context.errors, name!) && (
                        <Box
                            sx={{
                                backgroundColor: '#FFEBEE',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                marginTop: '8px',
                                border: '1px solid #FFCDD2',
                                color: 'error.main',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <ErrorOutline fontSize='small' />
                            <Typography variant='caption' color='inherit' fontWeight={600} fontSize={14}>
                                {get(context.errors, name!)?.message as string}
                            </Typography>
                        </Box>
                    )}
                </LocalizationProvider>
            </Grid>
        </>
    )
}
