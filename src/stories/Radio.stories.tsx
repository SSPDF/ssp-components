import { Meta, StoryObj } from '@storybook/nextjs'
import Radio from '../components/form/radio/Radio'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, enviar, esperarErroDeValidacao } from './interacao'

const meta: Meta<typeof Radio> = {
    title: 'Input/Radio',
    component: Radio,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Radio>

export const Base: Story = {
    args: {
        name: 'radio_teste',
        title: 'Escolha uma opção',
        options: [
            { label: 'Opção 1', value: 'op1' },
            { label: 'Opção 2', value: 'op2' },
        ],
        required: true,
    },
}

export const Row: Story = {
    args: {
        name: 'radio_row',
        title: 'Escolha (Row)',
        row: true,
        options: [
            { label: 'Sim', value: 'sim' },
            { label: 'Não', value: 'nao' },
        ],
    },
}

/** Obrigatório barra o envio; escolher uma opção envia o `value` dela. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: Base.args,
    play: async ({ canvasElement }) => {
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        // As opções são caixas clicáveis, sem `role="radio"` (UPGRADE_PLAN.md 5.20): o clique vai no texto.
        await userEvent.click(within(canvasElement).getByText('Opção 2'))
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ radio_teste: 'op2' })
    },
}
