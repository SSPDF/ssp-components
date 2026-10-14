import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import FetchAutoComplete from '../components/form/input/FetchAutoComplete'
import { dadosEnviados, enviar, escolherNoAutocomplete, esperarErroDeValidacao } from './interacao'
import { expect } from 'storybook/test'

/**
 * As opções vêm de `public/mock-api/autocomplete.json` (cópia da chave `autocomplete` do
 * `api-test.json`), servido pelo próprio Storybook — funciona sem o `npm run api` e no CI.
 * Para usar a API de teste: troque a `url` por `http://localhost:7171/autocomplete` e rode `npm run api`.
 */
const meta: Meta<typeof FetchAutoComplete> = {
    title: 'Input/FetchAutoComplete',
    component: FetchAutoComplete,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof FetchAutoComplete>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Conseg',
        url: '/mock-api/autocomplete.json',
    },
}

/** Busca as opções na url, escolhe uma pela digitação e confere o `id` enviado. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: { ...Base.args, required: true },
    play: async ({ canvasElement }) => {
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await escolherNoAutocomplete(canvasElement, 'CONSEG VARJÃO', 'varj')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: 31 })
    },
}
