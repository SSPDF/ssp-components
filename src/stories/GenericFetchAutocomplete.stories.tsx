import { Meta, StoryObj } from '@storybook/nextjs'
import GenericFetchAutoComplete from '../components/form/input/GenericFetchAutoComplete'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'
import { expect } from 'storybook/test'
import { dadosEnviados, enviar, escolherNoAutocomplete, esperarErroDeValidacao } from './interacao'

/**
 * As opções vêm de `public/mock-api/autocomplete.json` (cópia da chave `autocomplete` do
 * `api-test.json`), servido pelo próprio Storybook — funciona sem o `npm run api` e no CI.
 * Para usar a API de teste: troque a `url` por `http://localhost:7171/autocomplete` e rode `npm run api`.
 */
const meta: Meta<typeof GenericFetchAutoComplete> = {
    title: 'Input/GenericFetchAutoComplete',
    component: GenericFetchAutoComplete,
    tags: ['autodocs'],
    decorators: [GenericFormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericFetchAutoComplete>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Conseg',
        url: '/mock-api/autocomplete.json',
    },
}

/** Mesmo fluxo do `FetchAutoComplete`, no contexto nativo do react-hook-form. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: { ...Base.args, required: true },
    play: async ({ canvasElement }) => {
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await escolherNoAutocomplete(canvasElement, 'CONSEG PARANOÁ RURAL', 'rural')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: 15 })
    },
}
