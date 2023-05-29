import { Meta, StoryObj } from '@storybook/react'
import Input from '../components/form/input/Input'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'

const meta: Meta<typeof Input> = {
    title: 'Input/Input',
    component: Input,
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
type Story = StoryObj<typeof Input>

export const Base: Story = {
    args: {
        name: 'teste',
        required: true,
    },
}
