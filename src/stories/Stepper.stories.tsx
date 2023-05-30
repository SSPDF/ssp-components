import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import Stepper from '../components/form/stepper/Stepper'
import React from 'react'
import { StepperBlock } from '../components/form/stepper/StepperBlock'
import { Input } from '../components/form/input/Input'
import CheckBox from '../components/form/checkbox/CheckBox'
import { Box, FormGroup, Grid, Stack } from '@mui/material'
import RequiredCheckBoxGroup from '../components/form/checkbox/RequiredCheckBoxValidator'
import { ActiveInput } from '..'

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
                <ActiveInput name='nuQuantidadeIngresso' title='Venda de ingresso?' required defaultChecked={true}>
                    <>
                        <Input name='ata' type='number' numberMask='000000000' required />
                    </>
                    <RequiredCheckBoxGroup name='quantidadeCheckboxGroup'>
                        <Stack direction={'row'} sx={{ width: '100%' }}>
                            <CheckBox name='jsTipoIngresso.abertoPublico' title='Aberto ao Público' />
                            <CheckBox name='jsTipoIngresso.convidado' title='Convidado' />
                            <CheckBox name='jsTipoIngresso.medianteInscricao' title='Mediante Inscrição' />
                        </Stack>
                    </RequiredCheckBoxGroup>
                </ActiveInput>
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </Stepper>
    ),
}
