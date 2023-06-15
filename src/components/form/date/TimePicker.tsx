import { Grid, InputLabel, TextField, Typography } from '@mui/material'
import { LocalizationProvider, TimePicker as MUITimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Dayjs } from 'dayjs'
import ptbr from 'dayjs/locale/pt-br'
import get from 'lodash.get'
import React, { useContext, useState } from 'react'
import { FormContext } from '../../../context/form'
import hasIn from 'lodash.hasin'

export default function TimePicker({ name, required = false, title, xs = 12, sm, md }: { name: string; title?: string; required?: boolean; xs?: number; sm?: number; md?: number }) {
    const context = useContext(FormContext)!
    const [value, setValue] = useState<Dayjs | null>(null)

    const handleChange = (newValue: Dayjs | null) => {
        setValue(newValue)
        context?.formSetValue(name!, newValue?.format('HH:mm'))
    }

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && <InputLabel required={required}>{title}</InputLabel>}
            <LocalizationProvider adapterLocale={ptbr} dateAdapter={AdapterDayjs}>
                <MUITimePicker
                    value={value}
                    ampm={false}
                    onChange={handleChange}
                    sx={{
                        outline: get(context.errors, name!) ? '1px solid #a51c30' : '',
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
