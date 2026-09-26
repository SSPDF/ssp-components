import { Meta, StoryObj } from '@storybook/nextjs'
import TimePicker from '../components/form/date/TimePicker'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { expect, within } from 'storybook/test'
import { dadosEnviados, digitarNoPicker, enviar, esperarErroDeValidacao } from './interacao'

const meta: Meta<typeof TimePicker> = {
    title: 'Date/TimePicker',
    component: TimePicker,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof TimePicker>

export const Base: Story = {
    args: {
        name: 'teste',
        required: true,
    },
}

/** Obrigatório barra o envio; a hora digitada chega como `HH:mm`. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: Base.args,
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await digitarNoPicker(campo, '1430')
        await expect(campo).toHaveValue('14:30')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: '14:30' })
    },
}
