import { Meta, StoryObj } from '@storybook/nextjs'
import GenericMaskInput from '../components/form/input/GenericMaskInput'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'

/**
 * `GenericMaskInput` é o input mascarado usado internamente pelo `GenericInput`, e
 * consome o contexto nativo do react-hook-form — por isso o `GenericFormBaseDecorator`.
 *
 * Até a 0.1.x o corpo do componente lia o `FormContext` customizado, e digitar sob o
 * `GenericFormProvider` quebrava com `Cannot read properties of undefined (reading
 * 'formSetValue')` (UPGRADE_PLAN.md 5.8b). A digitação é coberta por
 * `GenericInput.test.tsx`.
 */
const meta: Meta<typeof GenericMaskInput> = {
    title: 'Input/GenericMaskInput',
    component: GenericMaskInput,
    tags: ['autodocs'],
    decorators: [GenericFormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericMaskInput>

export const Cpf: Story = {
    args: {
        formConfig: { name: 'genericMaskInputCpf', label: 'CPF', size: 'small', fullWidth: true },
        maskProps: { mask: '000.000.000-00' },
    },
}

export const Cep: Story = {
    args: {
        formConfig: { name: 'genericMaskInputCep', label: 'CEP', size: 'small', fullWidth: true },
        maskProps: { mask: '00000-000' },
    },
}

export const Desabilitado: Story = {
    args: {
        formConfig: { name: 'genericMaskInputDisabled', label: 'CPF (desabilitado)', size: 'small', fullWidth: true },
        maskProps: { mask: '000.000.000-00' },
        disabled: true,
    },
}

export const ComValorObservado: Story = {
    args: {
        formConfig: { name: 'genericMaskInputWatch', label: 'CEP preenchido via watchValue', size: 'small', fullWidth: true },
        maskProps: { mask: '00000-000' },
        watchValue: '70070120',
    },
}
