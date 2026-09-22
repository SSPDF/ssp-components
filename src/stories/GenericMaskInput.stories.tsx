import { Meta, StoryObj } from '@storybook/nextjs'
import GenericMaskInput from '../components/form/input/GenericMaskInput'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'

/**
 * `GenericMaskInput` é o input mascarado usado internamente pelo `GenericInput`.
 *
 * **Atenção:** apesar do prefixo `Generic*`, o corpo do componente lê o `FormContext`
 * customizado (`GenericMaskInput.tsx:58`) enquanto o `TextMaskCustom` interno lê o
 * contexto nativo do react-hook-form (`:15`). Ou seja, ele depende dos **dois**
 * providers ao mesmo tempo. Sob o `GenericFormBaseDecorator` — o decorator correto
 * para um componente `Generic*` — a renderização funciona, mas digitar dispara
 * `Cannot read properties of undefined (reading 'formSetValue')` no handler `onInput`.
 *
 * A story usa o decorator arquiteturalmente correto de propósito, para que o
 * comportamento real fique visível em vez de mascarado por um decorator duplo.
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
