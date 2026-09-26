import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import DatePicker from '../components/form/date/DatePicker'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, digitarNoPicker, enviar, esperarErroDeValidacao, pagina } from './interacao'

const meta: Meta<typeof DatePicker> = {
    title: 'Date/DatePicker',
    component: DatePicker,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Base: Story = {
    args: {
        name: 'teste',
        minDt: '16/04/2023',
        required: true,
    },
}

/**
 * Obrigatório (com o toast do `FormProvider`), data mínima, digitação no campo e escolha
 * pelo calendário. O calendário abre num popper fora do canvas.
 */
export const Interacao: Story = {
    tags: ['interacao'],
    args: Base.args,
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)
        await expect(await pagina(canvasElement).findByText(/Formulário incompleto/)).toBeInTheDocument()

        await digitarNoPicker(campo, '01012020')
        await expect(campo).toHaveValue('01/01/2020')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement, /A data tem que ser depois de 16\/04\/2023/)

        await digitarNoPicker(campo, '15032024')
        await expect(campo).toHaveValue('15/03/2024')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: '15/03/2024' })

        await userEvent.click(within(canvasElement).getByRole('button', { name: /choose date/i }))
        await userEvent.click(await pagina(canvasElement).findByRole('gridcell', { name: '20' }))
        await expect(campo).toHaveValue('20/03/2024')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ teste: '20/03/2024' })
    },
}
