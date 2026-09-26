import { Meta, StoryObj } from '@storybook/nextjs'
import MaskInput from '../components/form/input/MaskInput'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, enviar } from './interacao'

const meta: Meta<typeof MaskInput> = {
    title: 'Input/MaskInput',
    component: MaskInput,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof MaskInput>

export const Cpf: Story = {
    args: {
        formConfig: { name: 'maskInputCpf', label: 'CPF', size: 'small', fullWidth: true },
        imaskConfig: { mask: '000.000.000-00' },
    },
}

export const Cep: Story = {
    args: {
        formConfig: { name: 'maskInputCep', label: 'CEP', size: 'small', fullWidth: true },
        imaskConfig: { mask: '00000-000' },
    },
}

export const Sei: Story = {
    args: {
        formConfig: { name: 'maskInputSei', label: 'Número SEI', size: 'small', fullWidth: true },
        imaskConfig: { mask: '00000-00000000/0000-00' },
    },
}

export const Desabilitado: Story = {
    args: {
        formConfig: { name: 'maskInputDisabled', label: 'CPF (desabilitado)', size: 'small', fullWidth: true },
        imaskConfig: { mask: '000.000.000-00' },
        disabled: true,
    },
}

/**
 * `onMaskChange` troca a máscara conforme o usuário digita: telefone fixo (10 dígitos) ou
 * celular (11). A máscara de fixo aceita um dígito a mais (`(00) 0000-00000`): se ela
 * enchesse no 10º, o IMask rejeitaria o 11º antes do `onMaskChange` ver, e a troca nunca
 * aconteceria. (O `Input` faz a mesma troca com o `dispatch` do IMask.)
 */
export const MascaraDinamicaTelefone: Story = {
    args: {
        formConfig: { name: 'maskInputTelefone', label: 'Telefone (fixo ou celular)', size: 'small', fullWidth: true },
        imaskConfig: { mask: '(00) 0000-00000' },
        onMaskChange: (value, setMask) => {
            const digits = value.replace(/\D/g, '')
            setMask(digits.length > 10 ? '(00) 00000-0000' : '(00) 0000-00000')
        },
    },
}

/** A máscara do react-imask é aplicada na digitação, e o valor mascarado chega ao formulário. */
export const InteracaoCpf: Story = {
    tags: ['interacao'],
    args: Cpf.args,
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await userEvent.type(campo, '12345678909999')
        await expect(campo).toHaveValue('123.456.789-09')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ maskInputCpf: '123.456.789-09' })
    },
}

/** `onMaskChange` troca a máscara de fixo para celular no 11º dígito. */
export const InteracaoTelefone: Story = {
    tags: ['interacao'],
    args: MascaraDinamicaTelefone.args,
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await userEvent.type(campo, '6133334444')
        await expect(campo).toHaveValue('(61) 3333-4444')
        await userEvent.type(campo, '5')
        await expect(campo).toHaveValue('(61) 33334-4445')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ maskInputTelefone: '(61) 33334-4445' })

        await userEvent.click(campo)
        await userEvent.keyboard('{End}{Backspace}')
        await expect(campo).toHaveValue('(61) 3333-4444')
    },
}
