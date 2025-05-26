import { Meta, StoryObj } from '@storybook/react'
import { LoadingScreen } from '../components/loading/LoadingScreen'

const meta: Meta<typeof LoadingScreen> = {
    title: 'Loading/LoadingScreen',
    component: LoadingScreen,
    tags: ['autodocs'],
    decorators: [],
}

export default meta
type Story = StoryObj<typeof LoadingScreen>

export const Base: Story = {
    args: {
        textMessage: 'Carregando dados pesadíssimos',
    },
}
