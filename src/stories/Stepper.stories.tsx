import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import Stepper from '../components/form/stepper/Stepper'
import React from 'react'
import { StepperBlock } from '../components/form/stepper/StepperBlock'
import { Input } from '../components/form/input/Input'

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
        <Stepper>
            <StepperBlock title='Primeiro bloco'>
                <Input name='primeiro' type='input' customPlaceholder='Primeiro' />
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </Stepper>
    ),
}
