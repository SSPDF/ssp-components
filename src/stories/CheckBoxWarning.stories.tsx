import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import CheckboxWarning from '../components/form/checkbox/CheckBoxWarning'
import React from 'react'
import { Typography } from '@mui/material'

const meta: Meta<typeof CheckboxWarning> = {
    title: 'CheckBox/CheckboxWarning',
    component: CheckboxWarning,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof CheckboxWarning>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Label',
        customWarning: <Typography>Elemento customizável</Typography>,
    },
}
