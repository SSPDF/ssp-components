import { Meta, StoryObj } from '@storybook/nextjs'
import MaskInput from '../components/form/input/MaskInput'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

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
 * `onMaskChange` troca a máscara conforme o usuário digita — é o mecanismo que o
 * `Input` usa para alternar entre telefone fixo (10 dígitos) e celular (11).
 */
export const MascaraDinamicaTelefone: Story = {
    args: {
        formConfig: { name: 'maskInputTelefone', label: 'Telefone (fixo ou celular)', size: 'small', fullWidth: true },
        imaskConfig: { mask: '(00) 0000-0000' },
        onMaskChange: (value, setMask) => {
            const digits = value.replace(/\D/g, '')
            setMask(digits.length > 10 ? '(00) 00000-0000' : '(00) 0000-0000')
        },
    },
}
