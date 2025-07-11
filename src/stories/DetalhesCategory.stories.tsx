import { Meta, StoryObj } from '@storybook/react-webpack5'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { Category } from '../components/detalhes/Category'

const meta: Meta<typeof Category> = {
    title: 'Detalhes/Category',
    component: Category,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Category>

export const Base: Story = {
    args: {
        title: 'Teste',
    },
}
