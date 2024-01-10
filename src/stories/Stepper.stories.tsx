import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { CheckBox, CheckBoxWarning, DatePicker, FetchAutoComplete, FileUpload, MultInput, RequiredCheckBoxGroup, Switch, SwitchWatch, TimePicker, ToggleVisibility } from '..'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import { Input } from '../components/form/input/Input'
import Stepper, { Teste } from '../components/form/stepper/Stepper'
import { StepperBlock } from '../components/form/stepper/StepperBlock'
import { Box, Button, Stack, Typography } from '@mui/material'
import CheckBoxAdditional from '../components/form/checkbox/CheckBoxAdditional'

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
        <>
            <Teste />
        </>
    ),
}
