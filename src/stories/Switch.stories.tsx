import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import Switch from '../components/form/switch/Switch'

const meta: Meta<typeof Switch> = {
    title: 'Switch/Switch',
    component: Switch,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Switch>

export const Base: Story = {
    args: {
        name: 'teste',
    },
}
