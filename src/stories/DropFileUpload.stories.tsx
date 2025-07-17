import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import DropFileUpload from '../components/form/file/DropFileUpload'

const meta: Meta<typeof DropFileUpload> = {
    title: 'File/DropFileUpload',
    component: DropFileUpload,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof DropFileUpload>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Upload de arquivo (Drop)',
    },
}
