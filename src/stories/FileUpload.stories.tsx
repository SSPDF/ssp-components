import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import FileUpload from '../components/form/file/FileUpload'

const meta: Meta<typeof FileUpload> = {
    title: 'File/FileUpload',
    component: FileUpload,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof FileUpload>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Upload de arquivo',
    },
}
