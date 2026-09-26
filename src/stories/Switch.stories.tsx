import { Meta, StoryObj } from '@storybook/nextjs'
import Switch from '../components/form/switch/Switch'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, enviar } from './interacao'

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

/** Ligar e desligar muda o valor enviado. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: Base.args,
    play: async ({ canvasElement }) => {
        const chave = within(canvasElement).getByRole('checkbox')
        await userEvent.click(chave)
        await expect(chave).toBeChecked()
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: true })

        await userEvent.click(chave)
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: false })
    },
}
