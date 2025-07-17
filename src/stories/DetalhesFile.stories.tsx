import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { File } from '../components/detalhes/File'

const meta: Meta<typeof File> = {
    title: 'Detalhes/File',
    component: File,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof File>

export const Base: Story = {
    args: {
        title: 'Teste',
    },
}
