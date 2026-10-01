import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import AutoComplete from '../components/form/input/AutoComplete'
import { expect } from 'storybook/test'
import { dadosEnviados, enviar, escolherNoAutocomplete, esperarErroDeValidacao } from './interacao'

/**
 * As opções vêm de `public/mock-api/autocomplete.json` (cópia da chave `autocomplete` do
 * `api-test.json`), servido pelo próprio Storybook — funciona sem o `npm run api` e no CI.
 * Para usar a API de teste: troque a `url` por `http://localhost:7171/autocomplete` e rode `npm run api`.
 */
const meta: Meta<typeof AutoComplete> = {
    title: 'Input/AutoComplete',
    component: AutoComplete,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof AutoComplete>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Conseg',
        url: '/mock-api/autocomplete.json',
    },
}

/** Busca as opções na url ao montar, valida o obrigatório e envia o `id` escolhido. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: { ...Base.args, required: true },
    play: async ({ canvasElement }) => {
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await escolherNoAutocomplete(canvasElement, 'CONSEG ITAPOÃ')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: 37 })
    },
}
