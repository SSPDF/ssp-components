import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import Stepper from '../components/form/stepper/Stepper'
import React from 'react'
import { StepperBlock } from '../components/form/stepper/StepperBlock'
import { Input } from '../components/form/input/Input'
import CheckBox from '../components/form/checkbox/CheckBox'
import { Box, FormGroup, Grid, Stack, Typography } from '@mui/material'
import RequiredCheckBoxGroup from '../components/form/checkbox/RequiredCheckBoxValidator'
import { ActiveInput, CheckBoxWarning, OtherCheckBox, Switch, SwitchWatch } from '..'

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
            <StepperBlock title='Primeiro bloco'>
                <RequiredCheckBoxGroup name='ata'>
                    <CheckBox name='jsNaturezaEvento.teste' title='Teste' />
                    <OtherCheckBox name='ronald' />
                    {/* <CheckBoxWarning
                        name={'jsNaturezaEvento.checkEsportivo'}
                        title={'Titulo de teste'}
                        customWarning={
                            <Stack spacing={1}>
                                <Typography>
                                    <b>Item obrigatório</b> Selecione o tipo do evento esportivo:
                                </Typography>
                                <Stack>
                                    <RequiredCheckBoxGroup name='0.requiredCheck'>
                                        <CheckBox name='0.jsNaturezaEvento.esportivo.ciclismo' title='Ciclismo' />
                                        <CheckBox name='0.jsNaturezaEvento.esportivo.corrida' title='Corrida' />
                                        <CheckBox name='0.jsNaturezaEvento.esportivo.futebol' title='Jogo de Futebol' />
                                        <CheckBox name='0.jsNaturezaEvento.esportivo.outros' title='Outros' />
                                    </RequiredCheckBoxGroup>
                                </Stack>
                                <Input name='0.fodaMesmo.teste' type='input' required />
                                <Typography>
                                    <b>Documento obrigatório</b> Para eventos esportivos, é obrigatório anexar o mapa do percurso
                                </Typography>
                            </Stack>
                        }
                    /> */}
                </RequiredCheckBoxGroup>
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </Stepper>
    ),
}
