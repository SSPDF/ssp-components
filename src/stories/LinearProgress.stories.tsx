import { Meta, StoryObj } from '@storybook/react'
import { LinearProgress } from '../components/loading/LinearProgress'

const meta: Meta<typeof LinearProgress> = {
    title: 'Loading/LinearProgress',
    component: LinearProgress,
    tags: ['autodocs'],
    decorators: [],
}

export default meta
type Story = StoryObj<typeof LinearProgress>

export const Base: Story = {
    args: {
        title: 'Carregando dados pesadíssimos',
        value: 50,
    },
}
