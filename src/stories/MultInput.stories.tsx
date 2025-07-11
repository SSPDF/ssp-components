import { Meta, StoryObj } from '@storybook/react-webpack5'
import MultInput from '../components/form/input/MultInput'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

const meta: Meta<typeof MultInput> = {
    title: 'Input/MultInput',
    component: MultInput,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof MultInput>

export const Base: Story = {
    args: {
        name: 'teste',
        customPlaceholder: 'Placeholder de teste',
    },
}
