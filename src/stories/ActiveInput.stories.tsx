import { Meta, StoryObj } from '@storybook/nextjs'
import ActiveInput from '../components/form/input/ActiveInput'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

/**
 * `ActiveInput` combina um `Switch` com um bloco que só existe no formulário
 * enquanto o switch está ligado — ao desligar, os campos de `unregisterNameList`
 * são removidos via `formUnregister`.
 */
const meta: Meta<typeof ActiveInput> = {
    title: 'Input/ActiveInput',
    component: ActiveInput,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof ActiveInput>

export const Base: Story = {
    args: {
        name: 'activeInput',
        title: 'Possui telefone de contato?',
        unregisterNameList: ['ddd'],
    },
}

export const LigadoPorPadrao: Story = {
    args: {
        name: 'activeInputLigado',
        title: 'Ligado por padrão',
        defaultChecked: true,
        unregisterNameList: ['ddd'],
    },
}

export const Obrigatorio: Story = {
    args: {
        name: 'activeInputObrigatorio',
        title: 'Campo obrigatório',
        required: true,
        unregisterNameList: ['ddd'],
    },
}

export const MeiaLargura: Story = {
    args: {
        name: 'activeInputMeia',
        title: 'Metade da largura (xs=6)',
        xs: 6,
        unregisterNameList: ['ddd'],
    },
}
