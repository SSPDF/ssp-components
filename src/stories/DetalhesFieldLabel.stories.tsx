import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { FieldLabel } from '../components/detalhes/FieldLabel'

const meta: Meta<typeof FieldLabel> = {
    title: 'Detalhes/FieldLabel',
    component: FieldLabel,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof FieldLabel>

export const Base: Story = {
    args: {
        title: 'Teste',
    },
}
