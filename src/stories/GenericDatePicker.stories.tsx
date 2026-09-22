import { Meta, StoryObj } from '@storybook/nextjs'
import GenericDatePicker from '../components/form/date/GenericDatePicker'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'

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
