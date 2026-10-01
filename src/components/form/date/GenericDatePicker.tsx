import { Grid, InputLabel, Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers'
import { Dayjs } from 'dayjs'
import dayjs from '../../utils/dayjs'
import 'dayjs/locale/pt-br'
import get from 'lodash.get'
import hasIn from 'lodash.hasin'
import React, { useEffect, useState, useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { mensagemDeIntervalo } from './mensagemDeIntervalo'

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
    // Liga o rótulo ao grupo de seções do picker: sem isso o campo não tem nome acessível (UPGRADE_PLAN.md 5.21b).
    const rotuloId = useId()
    const context = useFormContext()

    const [value, setValue] = useState<Dayjs | undefined>(defaultValue !== undefined ? dayjs(defaultValue, 'DD/MM/YYYY') : undefined)

    // Até a 0.3.2 fazia `setValue(undefined)`: a data digitada ou escolhida no calendário nunca
    // chegava ao formulário (UPGRADE_PLAN.md 5.20).
    const handleChange = (newValue: Dayjs | null) => {
        setValue(newValue)
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
            <Grid size={{ xs, sm, md }}>
                {title && (
                    <InputLabel required={required} id={rotuloId}>
                        {title}
                    </InputLabel>
                )}
                <LocalizationProvider adapterLocale={'pt-br'} dateAdapter={AdapterDayjs}>
                    <MUIDatePicker
                        slotProps={{ textField: { slotProps: { input: { 'aria-labelledby': title ? rotuloId : undefined } } } }}
                        minDate={dayjs(minDt, 'DD/MM/YYYY')}
                        maxDate={dayjs(maxDt, 'DD/MM/YYYY')}
                        format='DD/MM/YYYY'
                        value={value}
                        onChange={handleChange}
                        disableHighlightToday
                        sx={{
                            outline: get(context.formState.errors, name!) ? '1px solid #a51c30' : '',
                            backgroundColor: 'background.paper',
                            width: '100%',
                            // x-date-pickers 8+: o campo é um grupo de seções, não mais um <input>. Mesmo padding de antes
                            // (8,4 px vertical e 16 px à esquerda), para o picker ter a altura dos outros campos.
                            '& .MuiPickersInputBase-root': { paddingLeft: 2 },
                            '& .MuiPickersInputBase-sectionsContainer': { paddingY: 1.05 },
                        }}
                        // Ref de callback: o React descarta o retorno, então o `TextField` que ficava aqui nunca
                        // renderizou — o que vale é o `register` com a validação. Não retornar nada: no React 19 o
                        // retorno de uma ref vira função de cleanup (UPGRADE_PLAN.md 5.16).
                        inputRef={() => {
                            context?.register(name!, {
                                validate: (v, f) => {
                                    if (!hasIn(f, name)) {
                                        return true
                                    }

                                    if (!v) v = ''

                                    if (v.length <= 0 && required) return 'Este campo é obrigatório'
                                    if (v.length < 10 && required) return 'A data precisa seguir o padrão DD/MM/AAAA'

                                    if (minDt && !(dayjs(minDt, 'DD/MM/YYYY').isSame(dayjs(v, 'DD/MM/YYYY')) || dayjs(minDt, 'DD/MM/YYYY').isBefore(dayjs(v, 'DD/MM/YYYY'))))
                                        return mensagemDeIntervalo(minDt, maxDt)

                                    if (maxDt && !(dayjs(maxDt, 'DD/MM/YYYY').isSame(dayjs(v, 'DD/MM/YYYY')) || dayjs(maxDt, 'DD/MM/YYYY').isAfter(dayjs(v, 'DD/MM/YYYY'))))
                                        return mensagemDeIntervalo(minDt, maxDt)
                                },
                                shouldUnregister: true,
                            })
                        }}
                    />
                    <Typography sx={{ color: '#a51c30', fontSize: 14, paddingLeft: 1 }}>{get(context.formState.errors, name!)?.message as string}</Typography>
                </LocalizationProvider>
            </Grid>
        </>
    )
}
