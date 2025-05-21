import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import Stepper from '../components/form/stepper/Stepper'
import StepperDecorator from '../../decorators/StepperDecorator'
import StepperBlock from '../components/form/stepper/StepperBlock'

const meta: Meta<typeof Stepper> = {
    title: 'Stepper/Stepper',
    component: Stepper,
    tags: ['autodocs'],
    decorators: [StepperDecorator],
}

export default meta
type Story = StoryObj<typeof Stepper>

export const Base: Story = {
    args: {
        debugLog: true,
    },
    render: (args) => (
        <Stepper {...args}>
            <StepperBlock title='Step 1'>
                <Stack spacing={2} alignItems={'center'} width={'100%'} py={8}>
                    <Typography variant='body1'>This is content for Step 1</Typography>
                </Stack>
            </StepperBlock>
            <StepperBlock title='Step 2'>
                <Stack spacing={2} alignItems={'center'} width={'100%'} py={8}>
                    <Typography variant='body1'>This is content for Step 2</Typography>
                </Stack>
            </StepperBlock>
        </Stepper>
    ),
}
