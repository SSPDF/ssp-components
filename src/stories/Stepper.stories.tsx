import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import SSPStepper from '../components/form/stepper/Stepper'
import React from 'react'
import { StepperBlock } from '../components/form/stepper/StepperBlock'
import { Input } from '../components/form/input/Input'

const meta: Meta<typeof SSPStepper> = {
    title: 'Stepper/SSPStepper',
    component: SSPStepper,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof SSPStepper>

export const Base: Story = {
    args: {},
    render: (args: any) => (
        <SSPStepper>
            <StepperBlock title='Primeiro bloco'>
                <Input name='primeiro' type='input' customPlaceholder='Primeiro' />
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </SSPStepper>
    ),
}
