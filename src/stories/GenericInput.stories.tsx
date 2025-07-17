import { Meta, StoryObj } from '@storybook/react'
import GenericInput from '../components/form/input/GenericInput'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

const meta: Meta<typeof GenericInput> = {
    title: 'Input/GenericInput',
    component: GenericInput,
    tags: ['autodocs'],
    argTypes: {
        type: {
            options: ['cnpj', 'cpf', 'input', 'email', 'cpf_cnpj', 'phone', 'input', 'number', 'rg', 'password', 'cep'],
            control: {
                type: 'select',
            },
        },
    },
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericInput>

export const Base: Story = {
    args: {
        name: 'genericInput',
        required: true,
    },
}
