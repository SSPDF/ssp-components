import { Meta, StoryObj } from '@storybook/react-webpack5'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import FetchAutoComplete from '../components/form/input/FetchAutoComplete'

const meta: Meta<typeof FetchAutoComplete> = {
    title: 'Input/FetchAutoComplete',
    component: FetchAutoComplete,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof FetchAutoComplete>

export const Base: Story = {
    args: {
        name: 'teste',
        url: '',
    },
}
