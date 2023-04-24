import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import TimePicker from '../components/form/date/TimePicker'

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
    },
}
