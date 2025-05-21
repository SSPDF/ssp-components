import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import Teste from '../components/teste/Teste.tsx'

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
