import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import CheckBox from '../components/form/checkbox/CheckBox'

const meta: Meta<typeof CheckBox> = {
    title: 'CheckBox/CheckBox',
    component: CheckBox,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof CheckBox>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Label',
    },
}
