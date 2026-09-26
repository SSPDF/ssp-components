import { Meta, StoryObj } from '@storybook/nextjs'
import GenericInput from '../components/form/input/GenericInput'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, enviar, esperarErroDeValidacao } from './interacao'

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
    decorators: [GenericFormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericInput>

export const Base: Story = {
    args: {
        name: 'genericInput',
        required: true,
    },
}

/** CPF no contexto nativo do react-hook-form: máscara, obrigatório, tamanho mínimo e envio. */
export const InteracaoCpf: Story = {
    tags: ['interacao'],
    args: { name: 'cpf', title: 'CPF', type: 'cpf', required: true },
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await userEvent.type(campo, '123456')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement, 'O CPF precisa ter no mínimo 11 dígitos')

        await userEvent.type(campo, '78909')
        await expect(campo).toHaveValue('123.456.789-09')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ cpf: '123.456.789-09' })
    },
}
