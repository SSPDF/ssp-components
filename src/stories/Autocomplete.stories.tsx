import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import AutoComplete from '../components/form/input/AutoComplete'

const meta: Meta<typeof AutoComplete> = {
    title: 'Input/AutoComplete',
    component: AutoComplete,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof AutoComplete>

export const Base: Story = {
    args: {
        name: 'teste',
    },
}
