import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import NavBar from '../components/navbar/NavBar'

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
        auth: {
            isAuth: false,
            login: () => console.log('LOGOU'),
            logout: () => console.log('DESLOGOU'),
            user: null,
            userLoaded: true,
        },
        links: [
            {
                name: 'Teste',
                path: '#',
            },
        ],
        title: 'Exemplo de navbar',
        pos: 'inherit',
        img: '/logo_70.png',
        next: false,
    },
}
