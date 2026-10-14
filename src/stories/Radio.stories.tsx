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
        const canvas = within(canvasElement)
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)
        // O grupo é anunciado pelo título e aponta para a mensagem de erro (UPGRADE_PLAN.md 5.21a).
        const grupo = canvas.getByRole('radiogroup', { name: 'Escolha uma opção' })
        await expect(grupo).toHaveAttribute('aria-invalid', 'true')
        await expect(grupo).toHaveAccessibleDescription(/obrigatório/i)

        await userEvent.click(canvas.getByRole('radio', { name: 'Opção 2' }))
        await expect(canvas.getByRole('radio', { name: 'Opção 2' })).toHaveAttribute('aria-checked', 'true')
        await expect(canvas.getByRole('radio', { name: 'Opção 1' })).toHaveAttribute('aria-checked', 'false')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ radio_teste: 'op2' })
    },
}

/** Teclado, como num grupo de rádios nativo: Tab entra na opção marcada (ou na primeira), setas movem a seleção, Espaço marca. */
export const InteracaoTeclado: Story = {
    tags: ['interacao'],
    args: Row.args,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const sim = canvas.getByRole('radio', { name: 'Sim' })
        const nao = canvas.getByRole('radio', { name: 'Não' })

        // Nenhuma marcada: o Tab para na primeira, e só nela.
        await expect(sim).toHaveAttribute('tabindex', '0')
        await expect(nao).toHaveAttribute('tabindex', '-1')
        sim.focus()
        await userEvent.keyboard(' ')
        await expect(sim).toHaveAttribute('aria-checked', 'true')

        // A seta marca a próxima e leva o foco; na última, volta para a primeira.
        await userEvent.keyboard('{ArrowRight}')
        await expect(nao).toHaveAttribute('aria-checked', 'true')
        await expect(nao).toHaveFocus()
        await expect(nao).toHaveAttribute('tabindex', '0')
        await userEvent.keyboard('{ArrowRight}')
        await expect(sim).toHaveAttribute('aria-checked', 'true')
        await expect(sim).toHaveFocus()

        // Não obrigatório: Espaço na marcada desmarca, como o clique.
        await userEvent.keyboard(' ')
        await expect(sim).toHaveAttribute('aria-checked', 'false')

        await userEvent.keyboard('{ArrowLeft}')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ radio_row: 'nao' })
    },
}
