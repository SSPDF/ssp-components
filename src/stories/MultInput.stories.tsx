import { Meta, StoryObj } from '@storybook/nextjs'
import MultInput from '../components/form/input/MultInput'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, enviar } from './interacao'

const meta: Meta<typeof MultInput> = {
    title: 'Input/MultInput',
    component: MultInput,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof MultInput>

export const Base: Story = {
    args: {
        name: 'teste',
        customPlaceholder: 'Placeholder de teste',
    },
}

/** O texto digitado chega ao formulário. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: Base.args,
    play: async ({ canvasElement }) => {
        await userEvent.type(within(canvasElement).getByRole('textbox'), 'Relato do ocorrido')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: 'Relato do ocorrido' })
    },
}
