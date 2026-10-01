import FormBaseDecorator from '../decorators/FormBaseDecorator'
import CheckBox from '../components/form/checkbox/CheckBox'
import { Meta, StoryObj } from '@storybook/nextjs'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, enviar } from './interacao'

const meta: Meta<typeof CheckBox> = {
    title: 'CheckBox/CheckBox',
    component: CheckBox,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof CheckBox>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Label',
    },
}

/** Marcar e desmarcar muda o valor enviado. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: Base.args,
    play: async ({ canvasElement }) => {
        const caixa = within(canvasElement).getByRole('checkbox')
        await userEvent.click(caixa)
        await expect(caixa).toBeChecked()
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: true })

        await userEvent.click(caixa)
        await expect(caixa).not.toBeChecked()
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: false })
    },
}
