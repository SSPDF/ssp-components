import { Meta, StoryObj } from '@storybook/react-webpack5'
import GenericFetchAutoComplete from '../components/form/input/GenericFetchAutoComplete'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'

const meta: Meta<typeof GenericFetchAutoComplete> = {
    title: 'Input/GenericFetchAutoComplete',
    component: GenericFetchAutoComplete,
    tags: ['autodocs'],
    decorators: [GenericFormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericFetchAutoComplete>

export const Base: Story = {
    args: {
        name: 'teste',
        url: '',
    },
}
