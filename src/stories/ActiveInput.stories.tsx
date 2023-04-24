import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import ActiveInput from '../components/form/input/ActiveInput'

const meta: Meta<typeof ActiveInput> = {
    title: 'Input/ActiveInput',
    component: ActiveInput,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof ActiveInput>

export const Base: Story = {
    args: {
        name: 'teste',
    },
}
