import { Meta, StoryObj } from '@storybook/nextjs'
import Radio from '../components/form/radio/Radio'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

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
