import { Meta, StoryObj } from '@storybook/react-webpack5'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import DatePicker from '../components/form/date/DatePicker'

const meta: Meta<typeof DatePicker> = {
    title: 'Date/DatePicker',
    component: DatePicker,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Base: Story = {
    args: {
        name: 'teste',
        minDt: '16/04/2023',
        required: true,
    },
}
