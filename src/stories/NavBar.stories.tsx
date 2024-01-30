import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import NavBar from '../components/navbar/NavBar'
import React from 'react'
import { LinearProgress } from '@mui/material'

const meta: Meta<typeof NavBar> = {
    title: 'NavBar/NavBar',
    component: NavBar,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof NavBar>

export const Base: Story = {
    args: {
        links: [
            {
                name: 'Teste',
                path: '#',
            },
            {
                name: 'Test 2',
                path: '/dd',
            },
        ],
        title: 'Exemplo de navbar',
        pos: 'inherit',
        img: '/logo_70.png',
        next: false,
    },
}
