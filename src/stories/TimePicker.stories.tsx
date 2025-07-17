import { Meta, StoryObj } from '@storybook/nextjs'
import TimePicker from '../components/form/date/TimePicker'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

const meta: Meta<typeof TimePicker> = {
    title: 'Date/TimePicker',
    component: TimePicker,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof TimePicker>

export const Base: Story = {
    args: {
        name: 'teste',
        required: true,
    },
}
