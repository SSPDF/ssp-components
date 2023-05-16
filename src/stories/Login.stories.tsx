import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import { Login } from '../components/page/Login'

const meta: Meta<typeof Login> = {
    title: 'Page/Login',
    component: Login,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Login>

export const Base: Story = {
    args: {},
}
