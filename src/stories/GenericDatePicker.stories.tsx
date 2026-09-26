import { Meta, StoryObj } from '@storybook/nextjs'
import GenericDatePicker from '../components/form/date/GenericDatePicker'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'
import { expect, within } from 'storybook/test'
import { dadosEnviados, digitarNoPicker, enviar, esperarErroDeValidacao } from './interacao'

const meta: Meta<typeof GenericDatePicker> = {
    title: 'Date/GenericDatePicker',
    component: GenericDatePicker,
    tags: ['autodocs'],
    decorators: [GenericFormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericDatePicker>

export const Base: Story = {
    args: {
        name: 'genericDatePicker',
        title: 'Data do fato',
        required: true,
    },
}

export const ComIntervalo: Story = {
    args: {
        name: 'genericDatePickerIntervalo',
        title: 'Data dentro do intervalo permitido',
        required: true,
        minDt: '01/01/2020',
        maxDt: '31/12/2030',
    },
}

export const ComValorPadrao: Story = {
    args: {
        name: 'genericDatePickerPadrao',
        title: 'Data com valor padrão',
        defaultValue: '15/03/2024',
        persistValue: true,
    },
}

export const MeiaLargura: Story = {
    args: {
        name: 'genericDatePickerMeia',
        title: 'Metade da largura (xs=6)',
        xs: 6,
    },
}

/** Intervalo permitido no contexto nativo do react-hook-form: fora dele barra, dentro envia. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: ComIntervalo.args,
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await digitarNoPicker(campo, '31122019')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement, /A data tem que ser depois de 01\/01\/2020/)

        await digitarNoPicker(campo, '10102025')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ genericDatePickerIntervalo: '10/10/2025' })
    },
}
