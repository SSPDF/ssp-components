import { Meta, StoryObj } from '@storybook/nextjs'
import Teste from '../components/teste/Teste.tsx'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

const meta: Meta<typeof Teste> = {
    title: 'Teste/Teste',
    component: Teste,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Teste>

export const Base: Story = {
    args: {},
}
