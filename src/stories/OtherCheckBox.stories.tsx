import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import OtherCheckBox from '../components/form/input/OtherCheckBox'

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
