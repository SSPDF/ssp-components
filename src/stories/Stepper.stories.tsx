import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import Stepper from '../components/form/stepper/Stepper'
import React from 'react'
import { StepperBlock } from '../components/form/stepper/StepperBlock'
import { Input } from '../components/form/input/Input'
import CheckBox from '../components/form/checkbox/CheckBox'
import { Box, FormGroup, Grid } from '@mui/material'
import RequiredCheckBoxGroup from '../components/form/checkbox/RequiredCheckBoxValidator'

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
                <RequiredCheckBoxGroup name='grupo'>
                    <CheckBox name='teste1' title='Meu teste 1' md={6} />
                    <CheckBox name='teste2' title='Meu teste 2' md={6} />
                    <CheckBox name='teste3' title='Meu teste 3' md={6} />
                    <CheckBox name='teste4' title='Meu teste 4' md={6} />

                    <Grid xs={12}>
                        <CheckBox name='teste5' title='Meu teste 5' />
                        <Box padding={5}>
                            <CheckBox name='teste6' title='Meu teste 6' />
                        </Box>
                    </Grid>
                </RequiredCheckBoxGroup>
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </Stepper>
    ),
}
