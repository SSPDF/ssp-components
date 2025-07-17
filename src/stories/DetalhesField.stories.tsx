import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { Field } from '../components/detalhes/Field'

const meta: Meta<typeof Field> = {
    title: 'Detalhes/Field',
    component: Field,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Field>

export const Base: Story = {
    args: {
        title: 'Teste',
    },
}
