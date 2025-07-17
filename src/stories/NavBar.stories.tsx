import { Meta, StoryObj } from '@storybook/react'
import NavBar from '../components/navbar/NavBar'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

const meta: Meta<typeof NavBar> = {
    title: 'NavBar/NavBar',
    component: NavBar,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof NavBar>

export const Base: Story = {
    args: {
        links: [],
        title: 'Exemplo de navbar',
        pos: 'inherit',
        img: '/logo_70.png',
        next: false,
    },
}
