import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import OptionalInput from '../components/form/input/OptionalInput'

const meta: Meta<typeof OptionalInput> = {
    title: 'Input/OptionalInput',
    component: OptionalInput,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof OptionalInput>

export const Base: Story = {
    args: {
        title: 'Input Opcional',
        name: 'teste',
        required: false,
    },
}
