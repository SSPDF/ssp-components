import { Grid, InputLabel, TextField, Typography, Box } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
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
                                    if (v.length < 5 && required) return 'A hora precisa seguir o padrão HH:MM'
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
    )
}
