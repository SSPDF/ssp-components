import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { FixedAutoComplete } from '../components/form/input/FixedAutoComplete'
import opcoes from '../../public/mock-api/autocomplete.json'
import { expect } from 'storybook/test'
import { dadosEnviados, enviar, escolherNoAutocomplete, esperarErroDeValidacao } from './interacao'

/** A lista é fixa (prop `list`); os dados são os mesmos das stories de fetch. */
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
        title: 'Conseg',
        list: opcoes,
    },
}

/** Filtra a lista fixa pela digitação, valida o obrigatório e envia o `id` escolhido. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: { ...Base.args, required: true },
    play: async ({ canvasElement }) => {
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await escolherNoAutocomplete(canvasElement, 'CONSEG BRASÍLIA CENTRO E SIA', 'bras')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: 4 })
    },
}
