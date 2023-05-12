import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import { Title } from '../components/detalhes/Category'

const meta: Meta<typeof Title> = {
    title: 'Detalhes/Category',
    component: Title,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Title>

export const Base: Story = {
    args: {
        title: 'Teste',
    },
}
