import { Meta, StoryObj } from '@storybook/nextjs'
import Switch from '../components/form/switch/Switch'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

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
