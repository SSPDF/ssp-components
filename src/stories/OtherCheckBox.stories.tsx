import { Meta, StoryObj } from '@storybook/nextjs'
import OtherCheckBox from '../components/form/input/OtherCheckBox'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

const meta: Meta<typeof OtherCheckBox> = {
    title: 'Input/OtherCheckBox',
    component: OtherCheckBox,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof OtherCheckBox>

export const Base: Story = {
    args: {
        name: 'teste',
        required: false,
    },
}
