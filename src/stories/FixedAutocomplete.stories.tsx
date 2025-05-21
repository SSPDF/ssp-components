import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import { FixedAutoComplete } from '../components/form/input/FixedAutoComplete'

const meta: Meta<typeof FixedAutoComplete> = {
    title: 'Input/FixedAutoComplete',
    component: FixedAutoComplete,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof FixedAutoComplete>

export const Base: Story = {
    args: {
        name: 'teste',
    },
}
