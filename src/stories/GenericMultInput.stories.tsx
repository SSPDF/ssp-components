import { Meta, StoryObj } from '@storybook/nextjs'
import GenericMultInput from '../components/form/input/GenericMultInput'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'

const meta: Meta<typeof GenericMultInput> = {
    title: 'Input/GenericMultInput',
    component: GenericMultInput,
    tags: ['autodocs'],
    decorators: [GenericFormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericMultInput>

export const Base: Story = {
    args: {
        name: 'genericMultInput',
        title: 'Descrição do ocorrido',
        required: true,
    },
}

export const ComLimites: Story = {
    args: {
        name: 'genericMultInputLimites',
        title: 'Entre 10 e 50 caracteres',
        required: true,
        inputMinLength: 10,
        inputMaxLength: 50,
        customPlaceholder: 'Digite ao menos 10 caracteres',
    },
}

export const ComValorPadrao: Story = {
    args: {
        name: 'genericMultInputPadrao',
        title: 'Com valor padrão',
        defaultValue: 'Texto preenchido previamente.',
    },
}

export const MeiaLargura: Story = {
    args: {
        name: 'genericMultInputMeia',
        title: 'Metade da largura (xs=6)',
        xs: 6,
    },
}
