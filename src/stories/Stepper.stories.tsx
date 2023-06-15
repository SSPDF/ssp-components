import { Button, Grid, IconButton, Stack, useMediaQuery, useTheme } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'
import dayjs from 'dayjs'
import React, { useContext, useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { DatePicker, FormContext, Switch, SwitchWatch, TimePicker } from '..'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import { Input } from '../components/form/input/Input'
import Stepper from '../components/form/stepper/Stepper'
import { StepperBlock } from '../components/form/stepper/StepperBlock'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'

const meta: Meta<typeof Stepper> = {
    title: 'Stepper/Stepper',
    component: Stepper,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Stepper>

export const Base: Story = {
    args: {
        debugLog: true,
    },
    render: (args) => (
        <Stepper {...args}>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
            <StepperBlock title='Primeiro bloco'>
                <DataEvento />
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </Stepper>
    ),
}

export function DataEvento() {
    const context = useContext(FormContext)!

    const { fields, append, remove } = useFieldArray({
        control: context.formControl,
        name: '2.dates',
        rules: {
            required: true,
        },
        shouldUnregister: true,
    })
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))

    useEffect(() => {
        if (fields.length > 0) return

        append({
            dtInicio: undefined,
            dtTermino: undefined,
            hrInicio: undefined,
            hrTermino: undefined,
        })
    }, [])

    function addDate() {
        append({
            dtInicio: undefined,
            dtTermino: undefined,
            hrInicio: undefined,
            hrTermino: undefined,
        })
    }

    function deleteDate(id: number) {
        remove(id)
    }

    useEffect(() => {
        console.log(fields)
    }, [fields])

    return (
        <>
            {fields.map((x, index) => (
                <Grid container key={x.id} spacing={1} paddingX={1}>
                    <DatePicker
                        name={`2.dates.${index}.dtInicio`}
                        title='Data de Inicio'
                        md={2.6}
                        required
                        minDt={dayjs().add(30, 'd').format('DD/MM/YYYY')}
                        maxDt={dayjs().add(60, 'd').format('DD/MM/YYYY')}
                    />
                    <TimePicker name={`2.dates.${index}.hrInicio`} title='Hora de Inicio' md={2.6} required />

                    <Switch name={`2.dates.${index}.switch-${x.id}`} title='24 horas?' />

                    <SwitchWatch switchId={`2.dates.${index}.switch-${x.id}`} unregisterNameList={[`2.dates.${index}.dtTermino`, `2.dates.${index}.hrTermino`]} invert={true}>
                        <DatePicker name={`2.dates.${index}.dtTermino`} title='Data de Término' md={2.6} required minDt={dayjs().add(30, 'd').format('DD/MM/YYYY')} />
                        <TimePicker name={`2.dates.${index}.hrTermino`} title='Hora de Término' md={2.6} required />
                    </SwitchWatch>

                    {isSmall ? (
                        <Stack direction='row' justifyContent='end' alignItems='center' sx={{ width: '100%', paddingY: 1 }}>
                            <Button startIcon={<DeleteOutlineOutlinedIcon />} variant='contained' size='small' sx={{ backgroundColor: '#c1121f' }} onClick={(e) => deleteDate(index)}>
                                Remover
                            </Button>
                        </Stack>
                    ) : (
                        fields.length > 1 && (
                            <Stack justifyContent='end' alignItems='baseline'>
                                <IconButton onClick={(e) => deleteDate(index)}>
                                    <DeleteIcon sx={{ fill: '#c1121f' }} />
                                </IconButton>
                            </Stack>
                        )
                    )}
                </Grid>
            ))}

            <Grid item sm={12}>
                <Button variant='contained' startIcon={<AddIcon />} onClick={addDate}>
                    Adicionar Data
                </Button>
            </Grid>
        </>
    )
}
